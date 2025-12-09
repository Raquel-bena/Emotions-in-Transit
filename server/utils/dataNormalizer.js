/**
 * MOTOR DE DATOS (Data Engine) - VERSIÓN FINAL EMOTIONS IN TRANSIT
 * Ubicación: backend/services/dataNormalizer.js
 * * Integra:
 * 1. SmartCitizen Kit #16559 (MACBA) -> Ruido, Luz, Aire, Temp Local
 * 2. OpenWeatherMap -> Viento, Lluvia, Presión general
 * 3. TMB API -> Estado del Metro
 */
const axios = require('axios');

// --- CONFIGURACIÓN ---
const SC_DEVICE_ID = 16559; // Kit en Plaça dels Àngels (MACBA)

// IDs de Sensores en SCK 2.1
const SENSORS = {
    NOISE: 53,      // dBA
    LIGHT: 14,      // Lux
    PM25: 87,       // µg/m³
    TEMP: 55,       // °C
    HUMIDITY: 56    // %
};

class DataEngine {
    constructor() {
        // ESTADO INICIAL (Por defecto)
        this.currentState = {
            meta: {
                timestamp: Date.now(),
                period: "Ld",  // Ld=Day, Le=Evening, Ln=Night
                mode: "INIT"   // REAL_MACBA / SIMULATED / HYBRID
            },
            weather: {
                temp: 20,
                humidity: 50,
                windSpeed: 5,
                windDir: 0,
                pressure: 1013,
                rain: 0,
                description: 'init'
            },
            environment: {
                noiseDb: 50,
                noiseFreq: 'LOW', // LOW/MID/HIGH
                airQuality: 10,   // PM2.5
                lightLevel: 0.5   // 0.0 a 1.0
            },
            transport: {
                congestion: 5,    // 0-10
                activeLines: 5,
                flowRhythm: 0.5
            }
        };

        this.timer = null;
        this.isPolling = false;
    }

    // --- 1. CONEXIÓN SMARTCITIZEN (MACBA) ---
    async fetchSmartCitizenData() {
        try {
            // API pública v0 (Lectura gratuita)
            const url = `https://api.smartcitizen.me/v0/devices/${SC_DEVICE_ID}`;
            const res = await axios.get(url, { timeout: 5000 }); // Timeout 5s

            const sensors = res.data.data.sensors;
            const getVal = (id) => {
                const s = sensors.find(x => x.id === id);
                return s ? s.value : null;
            };

            const noise = getVal(SENSORS.NOISE);
            const light = getVal(SENSORS.LIGHT);
            const pm25 = getVal(SENSORS.PM25);
            const temp = getVal(SENSORS.TEMP);
            const hum = getVal(SENSORS.HUMIDITY);

            // Validación básica: Si no hay ruido, asumimos error de sensor
            if (noise === null) throw new Error("Sensor de ruido vacío");

            // Normalización de Luz (0 lux = 0.0, 1000 lux = 1.0)
            const normLight = Math.min(1, Math.max(0, light / 1000));

            console.log(`📡 [MACBA] Ruido: ${noise.toFixed(1)}dB | Luz: ${light.toFixed(0)}lx | PM2.5: ${pm25}`);

            return {
                noiseDb: noise,
                lightLevel: normLight,
                airQuality: pm25 || 15,
                temp: temp,
                humidity: hum
            };

        } catch (error) {
            console.error(`⚠️ Error SmartCitizen (Kit ${SC_DEVICE_ID}):`, error.message);
            return null; // Retornamos null para activar fallback
        }
    }

    // --- 2. CONEXIÓN OPENWEATHERMAP (General BCN) ---
    async fetchOWMData() {
        const apiKey = process.env.OWM_KEY;
        if (!apiKey) return null;

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?id=3128740&appid=${apiKey}&units=metric`;
            const res = await axios.get(url, { timeout: 5000 });
            const d = res.data;

            return {
                temp: d.main.temp,
                humidity: d.main.humidity,
                pressure: d.main.pressure,
                windSpeed: d.wind.speed * 3.6, // m/s a km/h
                windDir: d.wind.deg,
                rain: (d.rain && d.rain['1h']) ? d.rain['1h'] : 0,
                description: d.weather[0].description
            };
        } catch (e) {
            console.error("❌ Error OWM:", e.message);
            return null;
        }
    }

    // --- 3. CONEXIÓN TMB (Metro) ---
    async fetchTMBData() {
        const appId = process.env.TMB_APP_ID;
        const appKey = process.env.TMB_APP_KEY;
        if (!appId || !appKey) return 0;

        try {
            const url = `https://api.tmb.cat/v1/transit/linies/metro?app_id=${appId}&app_key=${appKey}`;
            const res = await axios.get(url, { timeout: 5000 });
            return res.data.features ? res.data.features.length : 0;
        } catch (e) {
            return 0; // Fallback silencioso
        }
    }

    // --- LÓGICA PRINCIPAL (ORQUESTADOR) ---
    async fetchWeatherData() {
        // A. Obtener datos de fuentes
        const [scData, owmData, activeLines] = await Promise.all([
            this.fetchSmartCitizenData(),
            this.fetchOWMData(),
            this.fetchTMBData()
        ]);

        let weather = {};
        let env = {};
        let mode = "SIMULATED";

        // B. Procesar SmartCitizen (Prioridad Local)
        if (scData) {
            mode = "REAL_MACBA";
            env = {
                noiseDb: scData.noiseDb,
                noiseFreq: scData.noiseDb > 65 ? 'HIGH' : (scData.noiseDb > 50 ? 'MID' : 'LOW'),
                airQuality: scData.airQuality,
                lightLevel: scData.lightLevel
            };
            // Usamos Temp/Hum real del MACBA si está disponible
            weather.temp = scData.temp || 20;
            weather.humidity = scData.humidity || 50;
        } else {
            // Fallback Simulado si falla el Kit
            env = this.getSimulatedEnvironment();
            weather.temp = 20;
            weather.humidity = 60;
        }

        // C. Procesar OWM (Complemento Viento/Lluvia)
        if (owmData) {
            weather.windSpeed = owmData.windSpeed;
            weather.windDir = owmData.windDir;
            weather.rain = owmData.rain;
            weather.pressure = owmData.pressure;
            weather.description = owmData.description;
            // Si el kit falló pero OWM va, usamos temp de OWM
            if (!scData) {
                weather.temp = owmData.temp;
                weather.humidity = owmData.humidity;
                mode = "REAL_OWM_ONLY";
            }
        } else {
            // Valores por defecto si OWM falla
            weather.windSpeed = weather.windSpeed || 5;
            weather.windDir = weather.windDir || 0;
            weather.rain = weather.rain || 0;
            weather.pressure = 1013;
        }

        // D. Lógica Derivada (Tráfico y Periodo)

        // 1. Periodo (Día/Noche) basado en LUZ REAL
        let period = "Ln"; // Noche
        if (env.lightLevel > 0.1) period = "Ld"; // Día
        else if (env.noiseDb > 55) period = "Le"; // Tarde/Noche activa

        // 2. Congestión basada en RUIDO (El ruido del MACBA mueve el "tráfico")
        // 40dB (silencio) -> 0 congestion | 80dB (ruido) -> 10 congestion
        let congestion = Math.max(0, Math.min(10, (env.noiseDb - 40) / 4));

        // 3. Modulación por Metro (Si el metro cierra, baja un poco la actividad visual)
        if (activeLines < 2) congestion *= 0.8;

        // E. Actualizar Estado Global
        this.currentState = {
            meta: {
                timestamp: Date.now(),
                period: period,
                mode: mode
            },
            weather: weather,
            environment: env,
            transport: {
                congestion: congestion,
                activeLines: activeLines,
                flowRhythm: env.lightLevel // Ritmo visual sigue a la luz
            }
        };

        // Actualizar cada 30 segundos
        this.scheduleNextUpdate(30000);
    }

    // --- SIMULACIÓN (FALLBACK) ---
    getSimulatedEnvironment() {
        const h = new Date().getHours();
        const isDay = (h > 7 && h < 20);
        return {
            noiseDb: 45 + Math.random() * 15,
            noiseFreq: 'LOW',
            airQuality: 20,
            lightLevel: isDay ? 0.8 : 0.1
        };
    }

    scheduleNextUpdate(delay) {
        if (!this.isPolling) return;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.fetchWeatherData(), delay);
    }

    startPolling() {
        if (this.isPolling) return;
        this.isPolling = true;
        console.log("🚀 [DataEngine] Iniciando monitoreo (MACBA + OWM + TMB)...");
        this.fetchWeatherData();
    }

    stopPolling() {
        this.isPolling = false;
        if (this.timer) clearTimeout(this.timer);
    }

    getCurrentState() {
        return { ...this.currentState };
    }
}

module.exports = DataEngine;
