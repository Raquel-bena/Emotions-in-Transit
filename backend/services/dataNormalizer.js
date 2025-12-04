/**
 * MOTOR DE DATOS (Data Engine) - VERSIÓN OPENWEATHERMAP
 * Ubicación: backend/services/dataNormalizer.js
 */
const axios = require('axios');

class DataEngine {
    constructor() {
        this.currentState = { 
            tempIndex: 0.5,
            windIndex: 0.1,
            rainIndex: 0.0,
            mobilityIndex: 0.5,
            timestamp: Date.now()
        };
        this.bounds = {
            temp: { min: -10, max: 40 }, // Rango realista para Barcelona
            wind: { min: 0, max: 60 }    // km/h
        };
        this.timer = null;
    }

    normalize(value, min, max) {
        if (typeof value !== 'number' || isNaN(value)) return 0.5;
        const norm = (value - min) / (max - min);
        return Math.max(0, Math.min(1, norm));
    }

    calculateMobilityFactor() {
        const hour = new Date().getHours();
        let base = 0.5;
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            base = 0.9;
        } else if (hour >= 23 || hour <= 5) {
            base = 0.1;
        }
        return this.normalize(base + (Math.random() * 0.1), 0, 1.1);
    }

    async fetchWeatherData() {
        const apiKey = process.env.OWM_KEY; // Clave de OpenWeatherMap
        let nextInterval = 900000; // 15 minutos por defecto

        if (!apiKey) {
            console.warn("⚠️ [DataEngine] OWM_KEY no definida. Usando modo simulado.");
            this.currentState = {
                tempIndex: 0.5,
                windIndex: 0.2,
                rainIndex: 0.0,
                mobilityIndex: this.calculateMobilityFactor(),
                timestamp: Date.now()
            };
            return this.scheduleNextUpdate(60000); // Reintentar en 1 minuto
        }

        try {
            // ✅ Llamada directa a OpenWeatherMap (Barcelona, ID 3128740)
            const url = `https://api.openweathermap.org/data/2.5/weather?id=3128740&appid=${apiKey}&units=metric`;
            const response = await axios.get(url);

            const data = response.data;

            // Extraer datos
            const tempVal = data.main.temp; // Temperatura en °C
            const windVal = data.wind.speed; // Velocidad del viento en m/s → convertir a km/h
            const weatherDesc = data.weather[0].description.toLowerCase();

            // Convertir viento de m/s a km/h
            const windKmH = windVal * 3.6;

            // Calcular índices
            this.currentState.tempIndex = this.normalize(tempVal, this.bounds.temp.min, this.bounds.temp.max);
            this.currentState.windIndex = this.normalize(windKmH, this.bounds.wind.min, this.bounds.wind.max);
            this.currentState.rainIndex = weatherDesc.includes('rain') || weatherDesc.includes('storm') ? 0.8 : 0.0;
            this.currentState.mobilityIndex = this.calculateMobilityFactor();
            this.currentState.timestamp = Date.now();

            console.log(`✅ [OWM] Actualizado: ${tempVal}ºC | Viento: ${windKmH.toFixed(1)} km/h | ${weatherDesc}`);

        } catch (error) {
            console.error(`❌ [DataEngine] Error:`, error.message || error);

            // Mantener último estado válido
            this.currentState.timestamp = Date.now();

            if (error.response?.status === 429) {
                console.warn("⚠️ [DataEngine] Límite de peticiones (429). Pausando 2 minutos...");
                nextInterval = 120000; // 2 minutos
            } else {
                console.warn("⚠️ [DataEngine] Error inesperado. Reintentando en 1 minuto.");
                nextInterval = 60000; // 1 minuto
            }
        } finally {
            this.scheduleNextUpdate(nextInterval);
        }
    }

    scheduleNextUpdate(delay) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.fetchWeatherData(), delay);
    }

    startPolling() {
        console.log("🚀 [DataEngine] Iniciando ciclo de datos (modo producción)...");
        this.fetchWeatherData();
    }

    getCurrentState() {
        return { ...this.currentState };
    }
}

module.exports = DataEngine;
