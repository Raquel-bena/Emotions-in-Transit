/**
 * MOTOR DE DATOS (Data Engine) - VERSIÓN DEFINITIVA
 * Ubicación: server/utils/dataNormalizer.js
 * * INTEGRA:
 * 1. SmartCitizen Kit #14129 (Palo Alto) -> Fuente principal (Ruido, CO2, Luz, Aire)
 * 2. OpenWeatherMap (OWM) -> Respaldo climático general BCN
 * 3. TMB API -> Ritmo de la ciudad (Metro)
 */
const axios = require('axios');

// --- 1. CONFIGURACIÓN DEL KIT (PALO ALTO) ---
// Usamos el 14129 porque tiene sensor de CO2 real, ideal para "emociones"
const SC_DEVICE_ID = 14129;

// IDs de Sensores específicos del SCK 2.1 (Palo Alto)
const SENSORS = {
    NOISE: 53,      // dBA (Micrófono ICS-43432 del PDF)
    LIGHT: 14,      // Lux
    PM25: 87,       // µg/m³ (Aire)
    TEMP: 55,       // °C
    HUMIDITY: 56,   // %
    CO2: 10,        // ppm (Sensor CO2 dedicado)
    ECO2: 22        // ppm (Estimado, como backup)
};

class DataEngine {
    constructor() {
        // ESTADO INICIAL (Fallback seguro por si tarda en arrancar)
        this.currentState = {
            meta: {
                timestamp: Date.now(),
                period: "Ld",  // Ld=Día, Ln=Noche
                mode: "INIT"   // REAL_PALOALTO / SIMULATED
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
                noiseDb: 45,      // Base tranquila
                noiseFreq: 'LOW',
                airQuality: 10,
                co2: 400,         // Aire limpio base
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

    // --- 2. CONEXIÓN SMARTCITIZEN (PALO ALTO) ---
    async fetchSmartCitizenData() {
        try {
            // URL con soporte opcional para Token (si lo pones en .env)
            let url = `https://api.smartcitizen.me/v0/devices/${SC_DEVICE_ID}`;
            if (process.env.SC_API_TOKEN) {
                url += `?token=${process.env.SC_API_TOKEN}`;
            }

            const res = await axios.get(url, { timeout: 8000 });
            const sensors = res.data.data.sensors;

            // Función para extraer valor seguro
            const getVal = (id) => {
                const s = sensors.find(x => x.id === id);
                return s ? s.value : null;
            };

            // Lectura de sensores
            const noise = getVal(SENSORS.NOISE);
            const light = getVal(SENSORS.LIGHT);
            const temp = getVal(SENSORS.TEMP);
            const hum = getVal(SENSORS.HUMIDITY);
            // Priorizamos CO2 real (ID 10), si no, usamos eCO2 (ID 22)
            const co2 = getVal(SENSORS.CO2) || getVal(SENSORS.ECO2);

            // --- FILTRO DE SEGURIDAD (CRÍTICO) ---
            let pm25 = getVal(SENSORS.PM25);
            // El sensor PM tiene un error conocido que devuelve ~2777. Lo filtramos.
            if (pm25 > 500) {
                console.warn(`⚠️ Corrección automática: PM2.5 saturado (${pm25}) -> Ajustado a 50.`);
                pm25 = 50;
            }

            // Validación de integridad
            if (noise === null) throw new Error("Sensor de ruido no responde");

            // Normalización Luz (0 a 1)
            const normLight = Math.min(1, Math.max(0, light / 1000));

            console.log(`📡 [PALO ALTO] Ruido: ${noise.toFixed(1)}dB | CO2: ${co2}ppm | Luz: ${light}lx`);

            return {
                noiseDb: noise,
                lightLevel: normLight,
                airQuality: pm25 || 15,
                co2: co2 || 400,
                temp: temp,
                humidity: hum
            };

        } catch (error) {
            console.error(`⚠️ Error Kit Palo Alto (#${SC_DEVICE_ID}):`, error.message);
            return null; // Devuelve null para activar la simulación temporal
        }
    }

    // --- 3. CONEXIÓN CLIMA GENERAL (OpenWeatherMap) ---
    async fetchOWMData() {
        const apiKey = process.env.OWM_KEY;
        if (!apiKey) return null;

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?id=3128740&appid=${apiKey}&units=metric`;
            const res = await axios.get(url, { timeout: 5000 });
            return {
                windSpeed: res.data.wind.speed * 3.6, // km/h
                windDir: res.data.wind.deg,
                rain: (res.data.rain && res.data.rain['1h']) ? res.data.rain['1h'] : 0,
                pressure: res.data.main.pressure,
                description: res.data.weather[0].description,
                // Guardamos temp de respaldo
                temp: res.data.main.temp,
                hum: res.data.main.humidity
            };
        } catch (e) { return null; }
    }

    // --- 4. CONEXIÓN TRANSPORTE (TMB Metro) ---
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

    // --- ORQUESTADOR: FUSIÓN DE DATOS ---
    async fetchWeatherData() {
        // Ejecutamos todas las peticiones en paralelo
        const [scData, owmData, activeLines] = await Promise.all([
            this.fetchSmartCitizenData(),
            this.fetchOWMData(),
            this.fetchTMBData()
        ]);

        let weather = {};
        let env = {};
        let mode = "SIMULATED";

        // A. PROCESAMIENTO DEL SENSOR (Prioridad absoluta)
        if (scData) {
            mode = "REAL_PALOALTO";
            env = {
                noiseDb: scData.noiseDb,
                // Análisis de frecuencia simple basado en intensidad
                noiseFreq: scData.noiseDb > 60 ? 'HIGH' : (scData.noiseDb > 45 ? 'MID' : 'LOW'),
                airQuality: scData.airQuality,
                co2: scData.co2,
                lightLevel: scData.lightLevel
            };
            // Usamos la temperatura real del sitio si existe
            weather.temp = scData.temp || 20;
            weather.humidity = scData.humidity || 50;
        } else {
            // Si el sensor falla, entramos en modo simulación suave
            env = this.getSimulatedEnvironment();
            weather.temp = 20;
            weather.humidity = 60;
        }

        // B. PROCESAMIENTO CLIMÁTICO (Relleno)
        if (owmData) {
            weather.windSpeed = owmData.windSpeed;
            weather.windDir = owmData.windDir;
            weather.rain = owmData.rain;
            weather.pressure = owmData.pressure;
            weather.description = owmData.description;

            // Si el sensor falló pero OWM funciona, usamos temp de OWM
            if (!scData) {
                weather.temp = owmData.temp;
                weather.humidity = owmData.hum;
                mode = "REAL_OWM_ONLY";
            }
        } else {
            weather.windSpeed = 5; weather.rain = 0; // Valores seguros
        }

        // C. CÁLCULO DE "EMOCIONES" (Mapeo de Datos a Visuales)

        // 1. Periodo (Día/Noche): Lo define la LUZ real, no el reloj
        let period = "Ln"; // Noche por defecto
        if (env.lightLevel > 0.1) period = "Ld"; // Día
        else if (env.noiseDb > 50) period = "Le"; // Noche urbana activa

        // 2. Congestión (Estrés del sistema):
        // Mezclamos Ruido (Agitación) + CO2 (Ambiente cargado)
        // 400ppm CO2 = Aire puro (0.0) | 1000ppm = Aire viciado (1.0)
        const co2Stress = Math.max(0, Math.min(1, (env.co2 - 400) / 600));
        // 40dB = Silencio (0.0) | 80dB = Ruido fuerte (1.0)
        const noiseStress = Math.max(0, Math.min(1, (env.noiseDb - 40) / 40));

        // Fórmula ponderada: 70% Ruido, 30% CO2
        let congestion = ((noiseStress * 0.7) + (co2Stress * 0.3)) * 10;

        // Si el Metro (TMB) está cerrado (<2 líneas), relajamos el sistema
        if (activeLines < 2) congestion *= 0.6;

        // D. ACTUALIZACIÓN FINAL
        this.currentState = {
            meta: {
                timestamp: Date.now(),
                period: period,
                mode: mode
            },
            weather: weather,
            environment: env,
            transport: {
                congestion: Math.max(0, Math.min(10, congestion)), // Clamp 0-10
                activeLines: activeLines,
                flowRhythm: env.lightLevel // La luz marca el ritmo visual
            }
        };

        // Recarga cada 60 segundos (Palo Alto actualiza cada minuto aprox)
        this.scheduleNextUpdate(60000);
    }

    // --- SIMULACIÓN DE RESPALDO ---
    getSimulatedEnvironment() {
        const h = new Date().getHours();
        return {
            noiseDb: 45 + Math.random() * 10,
            noiseFreq: 'LOW',
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
        console.log("🚀 [DataEngine] Sistema Iniciado. Conectando a Palo Alto...");
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
