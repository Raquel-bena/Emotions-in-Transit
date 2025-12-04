/**
 * MOTOR DE DATOS (Data Engine) - VERSIÓN AEMET CORREGIDA PARA RENDER
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
            temp: { min: 0, max: 35 },
            wind: { min: 0, max: 60 }
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
        const apiKey = process.env.AEMET_API_KEY;
        let nextInterval = 900000; // 15 minutos por defecto

        // Si no hay clave, usar modo simulado
        if (!apiKey) {
            console.warn("⚠️ [DataEngine] AEMET_API_KEY no definida. Usando modo simulado.");
            this.currentState = {
                tempIndex: 0.5,
                windIndex: 0.2,
                rainIndex: 0.0,
                mobilityIndex: this.calculateMobilityFactor(),
                timestamp: Date.now()
            };
            return this.scheduleNextUpdate(60000);
        }

        try {
            // ✅ CORRECCIÓN CRÍTICA: api_key debe ir en los HEADERS
            const step1 = await axios.get(
                'https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/08019/',
                { headers: { api_key: apiKey } }
            );

            if (step1.data.estado !== 200 || !step1.data.datos) {
                throw new Error(`AEMET error: ${step1.data.descripcion || 'Sin URL de datos'}`);
            }

            const dataUrl = step1.data.datos;
            const weatherRes = await axios.get(dataUrl);

            // ✅ Validación robusta
            const data = weatherRes.data;
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error("AEMET: datos vacíos o mal formateados");
            }

            const day = data[0].prediccion?.dia?.[0];
            if (!day) {
                throw new Error("AEMET: falta campo 'prediccion.dia'");
            }

            const tempVal = parseInt(day.temperatura?.[0]?.value, 10) || 20;
            let windVal = 10;
            if (day.vientoAndRachaMax?.[0]?.velocidad?.[0]?.value) {
                windVal = parseInt(day.vientoAndRachaMax[0].velocidad[0].value, 10);
            }
            const skyDesc = (day.estadoCielo?.[0]?.descripcion || '').toUpperCase();

            this.currentState = {
                tempIndex: this.normalize(tempVal, this.bounds.temp.min, this.bounds.temp.max),
                windIndex: this.normalize(windVal, this.bounds.wind.min, this.bounds.wind.max),
                rainIndex: skyDesc.includes('LLUVIA') || skyDesc.includes('TORMENTA') ? 0.8 : 0.0,
                mobilityIndex: this.calculateMobilityFactor(),
                timestamp: Date.now()
            };

            console.log(`✅ [AEMET] Actualizado: ${tempVal}ºC | Viento: ${windVal} km/h | ${skyDesc}`);

        } catch (error) {
            console.error(`❌ [DataEngine] Error:`, error.message || error);

            // Mantener último estado válido, pero actualizar timestamp
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
        this.fetchWeatherData(); // Llamada inmediata
    }

    getCurrentState() {
        return { ...this.currentState }; // Clonar para seguridad
    }
}

module.exports = DataEngine;
