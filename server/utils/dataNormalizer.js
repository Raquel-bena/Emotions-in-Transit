/**
 * MOTOR DE DATOS (Data Engine) - VERSIÓN FINAL CON INTELIGENCIA EMOCIONAL
 * Ubicación: server/utils/dataNormalizer.js
 * * INTEGRA:
 * 1. SmartCitizen Kit #14129 (Palo Alto) -> Ruido, CO2, Luz, PM2.5
 * 2. OpenWeatherMap -> Viento, Lluvia, Temperatura
 * 3. TMB API -> Ritmo Urbano
 * * SALIDA:
 * Genera un estado "biométrico" y una "emoción dominante" basada en psicobiología ambiental.
 */
const axios = require('axios');

// --- 1. CONFIGURACIÓN ---
const SC_DEVICE_ID = 14129; // Kit Palo Alto (Confiable para CO2 y Ruido)

// IDs de Sensores (SCK 2.1)
const SENSORS = {
    NOISE: 53,      // dBA
    LIGHT: 14,      // Lux
    PM25: 87,       // µg/m³
    TEMP: 55,       // °C
    HUMIDITY: 56,   // %
    CO2: 10,        // ppm (Sensor real)
    ECO2: 22        // ppm (Backup)
};

class DataEngine {
    constructor() {
        // ESTADO INICIAL
        this.currentState = {
            meta: {
                timestamp: Date.now(),
                period: "Ld",       // Ld (Día), Le (Tarde), Ln (Noche)
                mode: "INIT",       // Fuente de datos
                emotion: "NEUTRAL"  // Estado Afectivo de la Ciudad
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
                noiseDb: 45,
                noiseFreq: 'LOW',
                airQuality: 10,
                co2: 400,
                lightLevel: 0.5
            },
            transport: {
                congestion: 5,
                activeLines: 5,
                flowRhythm: 0.5
            }
        };

        this.timer = null;
        this.isPolling = false;
    }

    // --- 2. LOGICA DE EMOCIONES (Investigación Científica) ---
    calculateEmotionalState(env, weather, transport) {
        // UMBRALES (Basados en Turner, Pihkala y Zhang & Li)

        // IRA URBANA: Calor + Ruido + Congestión
        const isHot = weather.temp > 25;
        const isLoud = env.noiseDb > 70; // 70dB activa la amígdala
        const isTrafficJam = transport.congestion > 7;

        // ECO-ANSIEDAD: Aire Tóxico + Viento (Amenaza invisible)
        const isToxic = env.co2 > 1000 || env.airQuality > 25;
        const isWindy = weather.windSpeed > 30; // km/h

        // SOLASTALGIA: Oscuridad diurna + Lluvia (Pérdida de confort)
        const isRaining = weather.rain > 0;
        const isDarkDay = env.lightLevel < 0.2 && this.getTimePeriod() !== 'Ln';

        // -- DIAGNÓSTICO PRIORITARIO --

        // 1. Prioridad Biológica Inmediata (Amenaza Física)
        if (isLoud || (isHot && isTrafficJam)) {
            return "URBAN_ANGER";
        }

        // 2. Prioridad Psicológica Latente (Amenaza Ambiental)
        if (isToxic || isWindy) {
            return "ECO_ANXIETY";
        }

        // 3. Estado Depresivo / Melancólico
        if (isRaining || isDarkDay) {
            return "SOLASTALGIA";
        }

        // 4. Homeostasis (Estado ideal)
        return "ACTIVE_HOPE";
    }

    getTimePeriod() {
        const h = new Date().getHours();
        if (h >= 7 && h < 21) return 'Ld';
        if (h >= 21 && h < 23) return 'Le';
        return 'Ln';
    }

    // --- 3. CONEXIÓN SMARTCITIZEN ---
    async fetchSmartCitizenData() {
        try {
            let url = `https://api.smartcitizen.me/v0/devices/${SC_DEVICE_ID}`;
            if (process.env.SC_API_TOKEN) url += `?token=${process.env.SC_API_TOKEN}`;

            const res = await axios.get(url, { timeout: 8000 });
            const sensors = res.data.data.sensors;

            const getVal = (id) => {
                const s = sensors.find(x => x.id === id);
                return s ? s.value : null;
            };

            const noise = getVal(SENSORS.NOISE);
            const light = getVal(SENSORS.LIGHT);
            const temp = getVal(SENSORS.TEMP);
            const hum = getVal(SENSORS.HUMIDITY);
            const co2 = getVal(SENSORS.CO2) || getVal(SENSORS.ECO2);

            // Filtro PM2.5 (Corrección de error 2777)
            let pm25 = getVal(SENSORS.PM25);
            if (pm25 > 500) {
                console.warn(`⚠️ Corrección PM2.5 (${pm25} -> 50)`);
                pm25 = 50;
            }

            if (noise === null) throw new Error("Sensor offline");

            // Normalización Luz (0-1)
            const normLight = Math.min(1, Math.max(0, light / 1000));

            console.log(`📡 [SCK Palo Alto] Ruido: ${noise.toFixed(1)}dB | CO2: ${co2}ppm | Luz: ${light}lx`);

            return {
                noiseDb: noise,
                lightLevel: normLight,
                airQuality: pm25 || 15,
                co2: co2 || 400,
                temp: temp,
                humidity: hum
            };

        } catch (error) {
            console.error(`⚠️ Error SCK: ${error.message}`);
            return null;
        }
    }

    // --- 4. CONEXIÓN OPENWEATHERMAP ---
    async fetchOWMData() {
        const apiKey = process.env.OWM_KEY;
        if (!apiKey) return null;
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?id=3128740&appid=${apiKey}&units=metric`;
            const res = await axios.get(url, { timeout: 5000 });
            return {
                windSpeed: res.data.wind.speed * 3.6,
                windDir: res.data.wind.deg,
                rain: (res.data.rain && res.data.rain['1h']) ? res.data.rain['1h'] : 0,
                pressure: res.data.main.pressure,
                description: res.data.weather[0].description,
                temp: res.data.main.temp,
                hum: res.data.main.humidity
            };
        } catch (e) { return null; }
    }

    // --- 5. CONEXIÓN TMB ---
    async fetchTMBData() {
        const appId = process.env.TMB_APP_ID;
        const appKey = process.env.TMB_APP_KEY;
        if (!appId || !appKey) return 0;
        try {
            const url = `https://api.tmb.cat/v1/transit/linies/metro?app_id=${appId}&app_key=${appKey}`;
            const res = await axios.get(url, { timeout: 5000 });
            return res.data.features ? res.data.features.length : 0;
        } catch (e) { return 0; }
    }

    // --- 6. ORQUESTADOR PRINCIPAL ---
    async fetchWeatherData() {
        const [scData, owmData, activeLines] = await Promise.all([
            this.fetchSmartCitizenData(),
            this.fetchOWMData(),
            this.fetchTMBData()
        ]);

        let weather = {};
        let env = {};
        let mode = "SIMULATED";

        // A. FUSIÓN DE DATOS (SCK + OWM)
        if (scData) {
            mode = "REAL_PALOALTO";
            env = {
                noiseDb: scData.noiseDb,
                noiseFreq: scData.noiseDb > 65 ? 'HIGH' : 'LOW',
                airQuality: scData.airQuality,
                co2: scData.co2,
                lightLevel: scData.lightLevel
            };
            weather.temp = scData.temp || 20;
            weather.humidity = scData.humidity || 50;
        } else {
            env = this.getSimulatedEnvironment();
            weather.temp = 20; weather.humidity = 60;
        }

        if (owmData) {
            weather.windSpeed = owmData.windSpeed;
            weather.windDir = owmData.windDir;
            weather.rain = owmData.rain;
            weather.pressure = owmData.pressure;
            weather.description = owmData.description;
            if (!scData) {
                weather.temp = owmData.temp;
                weather.humidity = owmData.hum;
                mode = "REAL_OWM_ONLY";
            }
        } else {
            weather.windSpeed = 5; weather.rain = 0;
        }

        // B. CÁLCULOS DERIVADOS

        // Congestión (Estrés Visual): Mezcla de Ruido (70%) + CO2 (30%)
        const co2Stress = Math.max(0, Math.min(1, (env.co2 - 400) / 600));
        const noiseStress = Math.max(0, Math.min(1, (env.noiseDb - 40) / 40));
        let congestion = ((noiseStress * 0.7) + (co2Stress * 0.3)) * 10;
        if (activeLines < 2) congestion *= 0.6; // Si el metro duerme, la ciudad se calma

        // Periodo (Día/Noche según Luz real)
        let period = "Ln";
        if (env.lightLevel > 0.1) period = "Ld";
        else if (env.noiseDb > 55) period = "Le";

        // C. DIAGNÓSTICO EMOCIONAL (La nueva inteligencia del sistema)
        const emotionalState = this.calculateEmotionalState(env, weather, { congestion });

        // ACTUALIZACIÓN GLOBAL
        this.currentState = {
            meta: {
                timestamp: Date.now(),
                period: period,
                mode: mode,
                emotion: emotionalState // ¡Nueva variable clave!
            },
            weather: weather,
            environment: env,
            transport: {
                congestion: Math.max(0, Math.min(10, congestion)),
                activeLines: activeLines,
                flowRhythm: env.lightLevel
            }
        };

        this.scheduleNextUpdate(60000);
    }

    getSimulatedEnvironment() {
        const h = new Date().getHours();
        return {
            noiseDb: 45 + Math.random() * 10,
            airQuality: 20,
            co2: 420,
            lightLevel: (h > 7 && h < 20) ? 0.8 : 0.05
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
        console.log("🚀 [DataEngine] Iniciando Sistema Biométrico (Palo Alto + EmotionAI)...");
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
