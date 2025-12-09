/**
 * MOTOR DE DATOS (Data Engine) - VERSIÓN BIOMETRIC CITY
 * Ubicación: backend/services/dataNormalizer.js
 * 
 * Mapea datos reales/simulados de Barcelona a un "Estado Biométrico" para la instalación.
 */
const axios = require('axios');

// CONFIGURACIÓN: Límites para normalización (Calibrado para BCN)
const BOUNDS = {
    TEMP: { min: 0, max: 40 },      // °C
    WIND: { min: 0, max: 60 },      // km/h
    HUMIDITY: { min: 0, max: 100 }, // %
    PRESSURE: { min: 980, max: 1040 }, // hPa
    NOISE: { min: 30, max: 90 },    // dB (30=Silencio, 90=Tráfico denso)
    AIR_PM25: { min: 0, max: 50 },  // µg/m³ (0=Limpio, 50=Pobre)
    TRAFFIC: { min: 0, max: 10 }    // Índice 0-10
};

// ORDENANZA MEDIOAMBIENTAL BCN - HORARIOS RUIDO
const NOISE_PERIODS = {
    DAY: { start: 7, end: 21, baseDB: 65, variance: 15, label: "Ld (Day)" },    // 07:00 - 21:00
    EVENING: { start: 21, end: 23, baseDB: 55, variance: 10, label: "Le (Evening)" }, // 21:00 - 23:00
    NIGHT: { start: 23, end: 7, baseDB: 45, variance: 5, label: "Ln (Night)" }     // 23:00 - 07:00
};

class DataEngine {
    constructor() {
        // ESTADO BIOMÉTRICO COMPLETO
        this.currentState = {
            meta: {
                timestamp: Date.now(),
                period: "Ld", // Day/Evening/Night
                mode: "INIT" // SIMULATED / REAL
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
                lightLevel: 0.5   // 0-1
            },
            transport: {
                congestion: 5,   // 0-10
                activeLines: 5,
                flowRhythm: 0.5  // 0-1 (Pulsación)
            }
        };

        this.timer = null;
        this.isPolling = false;
    }

    // --- UTILIDADES ---

    normalize(value, min, max) {
        if (typeof value !== 'number' || isNaN(value)) return 0.5;
        const norm = (value - min) / (max - min);
        return Math.max(0, Math.min(1, norm));
    }

    getNoisePeriod() {
        const hour = new Date().getHours();
        if (hour >= NOISE_PERIODS.DAY.start && hour < NOISE_PERIODS.DAY.end) return NOISE_PERIODS.DAY;
        if (hour >= NOISE_PERIODS.EVENING.start && hour < NOISE_PERIODS.EVENING.end) return NOISE_PERIODS.EVENING;
        return NOISE_PERIODS.NIGHT;
    }

    // --- LÓGICA DE SIMULACIÓN/CÁLCULO ---

    /**
     * Calcula niveles de Ruido y Aire basados en la hora y tráfico estimado
     */
    calculateEnvironmentalMetrics(trafficIndex) {
        const period = this.getNoisePeriod();

        // Simulación de Ruido: Base del periodo + impacto del tráfico + variabilidad aleatoria
        const trafficNoiseObj = (trafficIndex / 10) * 10; // Hasta +10dB por tráfico
        const randomVar = (Math.random() * period.variance) - (period.variance / 2);

        let db = period.baseDB + trafficNoiseObj + randomVar;
        db = Math.max(30, Math.min(95, db)); // Clamp

        return {
            noiseDb: db,
            noiseFreq: db > 70 ? 'HIGH' : (db > 50 ? 'MID' : 'LOW'),
            airQuality: Math.max(5, (trafficIndex * 4) + (Math.random() * 10)), // Tráfico ensucia aire
            periodLabel: period.label
        };
    }

    /**
     * Calcula tráfico/congestión basado en hora y datos TMB
     */
    calculateTransportMetrics(tmbActiveLines) {
        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60;
        const isWeekend = (now.getDay() === 0 || now.getDay() === 6);

        let baseCongestion = 0.5; // 0-10 escala luego

        if (isWeekend) {
            baseCongestion = 0.3 + (Math.sin((hour - 14) / 4) * 0.2); // Pico suave tarde
        } else {
            // Picos: 8am y 6pm
            const morningPeak = Math.max(0, 1 - Math.abs(hour - 8.5) / 2);
            const eveningPeak = Math.max(0, 1 - Math.abs(hour - 18.5) / 2);
            baseCongestion = 0.2 + (0.7 * Math.max(morningPeak, eveningPeak));
        }

        // Si tenemos datos reales de TMB (líneas activas), modulamos
        if (tmbActiveLines > 0) {
            // Si hay pocas líneas activas (e.g. noche), baja la congestión
            const availability = tmbActiveLines / 8; // Asumimos 8 líneas principales
            baseCongestion = (baseCongestion + availability) / 2;
        }

        return {
            congestion: baseCongestion * 10, // Escala 0-10
            flowRhythm: baseCongestion // Para ritmo visual
        };
    }

    // --- DATA FETCHING ---

    async fetchPythonData() {
        const url = "http://127.0.0.1:5000/";
        const res = await axios.get(url);
        return res.data;
    }

    async fetchWeatherData() {
        const usePythonDataSource = true;
        const apiKey = process.env.OWM_KEY;
        const tmbAppId = process.env.TMB_APP_ID;
        let nextInterval = 10 * 60 * 1000; // 10 min por defecto

        // 1. OBTENER METEOROLOGÍA (OWM)
        let weatherData = {};
        if (usePythonDataSource) {
            const url = "http://127.0.0.1:5000/weather-data";
            const res = await axios.get(url);
            weatherData = res.data;
        } else {
            if (apiKey) {
                try {
                    const url = `https://api.openweathermap.org/data/2.5/weather?id=3128740&appid=${apiKey}&units=metric`;
                    const res = await axios.get(url);
                    const d = res.data;
                    weatherData = {
                        temp: d.main.temp,
                        humidity: d.main.humidity,
                        pressure: d.main.pressure,
                        windSpeed: d.wind.speed * 3.6, // m/s a km/h
                        windDir: d.wind.deg,
                        rain: (d.rain && d.rain['1h']) ? d.rain['1h'] : 0,
                        description: d.weather[0].description
                    };
                    console.log(`✅ [OWM] T:${weatherData.temp}°C H:${weatherData.humidity}%`);
                } catch (e) {
                    console.error("❌ OWM Error:", e.message);
                    weatherData = this.getSimulatedWeather(); // Fallback
                }
            } else {
                console.log("⚠️ No OWM Key - Usando Simulación");
                weatherData = this.getSimulatedWeather();
                nextInterval = 60000; // Más rápido en simulación
            }
        }

        // 2. OBTENER TRANSPORTE (TMB + Cálculo)
        let activeLines = 0;
        if (tmbAppId) {
            try {
                // Fetch simple para ver si API responde
                const tmbUrl = `https://api.tmb.cat/v1/transit/linies/metro?app_id=${process.env.TMB_APP_ID}&app_key=${process.env.TMB_APP_KEY}`;
                const tmbRes = await axios.get(tmbUrl);
                activeLines = tmbRes.data.features ? tmbRes.data.features.length : 0;
            } catch (e) { /* Ignore */ }
        }
        const transportMetrics = this.calculateTransportMetrics(activeLines);

        // 3. OBTENER AMBIENTE (Ruido/Aire - Simulado por ahora con lógica horaria compleja)
        // Integrar API Sentilo real requeriría tokens específicos, usamos la lógica de Ordenanza BCN
        const envMetrics = this.calculateEnvironmentalMetrics(transportMetrics.congestion);

        // 4. ACTUALIZAR ESTADO GLOBAL
        this.currentState = {
            meta: {
                timestamp: Date.now(),
                period: envMetrics.periodLabel,
                mode: apiKey ? "REAL" : "SIMULATED"
            },
            weather: weatherData,
            environment: {
                noiseDb: envMetrics.noiseDb,
                noiseFreq: envMetrics.noiseFreq,
                airQuality: envMetrics.airQuality,
                lightLevel: await this.getLightLevel()
            },
            transport: {
                congestion: transportMetrics.congestion,
                activeLines: activeLines,
                flowRhythm: transportMetrics.flowRhythm
            }
        };

        this.scheduleNextUpdate(nextInterval);
    }

    getSimulatedWeather() {
        return {
            temp: 18 + Math.random() * 5,
            humidity: 50 + Math.random() * 20,
            pressure: 1013 + (Math.random() * 10 - 5),
            windSpeed: Math.random() * 20,
            windDir: Math.random() * 360,
            rain: Math.random() > 0.9 ? 5 : 0,
            description: 'simulated'
        };
    }

    async getLightLevel() {
        const url = "http://127.0.0.1:5000/light-level";
        const res = await axios.get(url);
        return res.data['light-level'];
    }

    scheduleNextUpdate(delay) {
        if (!this.isPolling) return;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.fetchWeatherData(), delay);
    }

    startPolling() {
        if (this.isPolling) return;
        this.isPolling = true;
        console.log("🚀 [DataEngine/Bio] Sistema Biométrico Iniciado.");
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
