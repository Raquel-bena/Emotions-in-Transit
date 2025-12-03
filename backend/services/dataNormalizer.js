/**
 * MOTOR DE DATOS (Data Engine) - VERSIÓN AEMET (CORREGIDA)
 * Ubicación: backend/services/dataNormalizer.js
 */

const axios = require('axios');

class DataEngine {
    constructor() {
        // 1. Estado Inicial (Por defecto)
        this.currentState = { 
            tempIndex: 0.5,     // 0.0 = Frío, 1.0 = Calor
            windIndex: 0.1,     // 0.0 = Calma, 1.0 = Vendaval
            rainIndex: 0.0,     // 0.0 = Seco, 1.0 = Lluvia
            mobilityIndex: 0.5, // 0.0 = Vacío, 1.0 = Hora Punta
            timestamp: Date.now()
        };

        // 2. Límites para normalizar (Barcelona)
        this.bounds = {
            temp: { min: 0, max: 35 }, 
            wind: { min: 0, max: 60 }  
        };

        // Control del temporizador
        this.timer = null;
    }

    // Función auxiliar para convertir valores a rango 0.0 - 1.0
    normalize(value, min, max) {
        let normalized = (value - min) / (max - min);
        // Asegurar que el valor se queda entre 0 y 1
        return Math.max(0, Math.min(1, normalized));
    }
    
    // Simulación de Movilidad
    calculateMobilityFactor() {
        const hour = new Date().getHours();
        let factor = 0.5;
        
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            factor = 0.9; 
        } else if (hour >= 23 || hour <= 5) {
            factor = 0.1;
        }
        
        return this.normalize(factor + Math.random() * 0.1, 0, 1.1); 
    }

    // --- LÓGICA AEMET ---
    async fetchWeatherData() {
        const apiKey = process.env.AEMET_API_KEY;
        let nextInterval = 900000; // Por defecto: 15 minutos

        if (!apiKey) {
            console.log("⚠️ [DataEngine] Falta AEMET_API_KEY en .env");
            return;
        }

        try {
            // PASO 1: Pedir URL
            const urlRequest = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/08019/?api_key=${apiKey}`;
            const responseStep1 = await axios.get(urlRequest);

            if (responseStep1.data.estado === 200) {
                // PASO 2: Pedir datos reales
                const dataUrl = responseStep1.data.datos;
                const weatherResponse = await axios.get(dataUrl);
                
                const rawData = weatherResponse.data[0]; 
                const predDia = rawData.prediccion.dia[0];
                
                // Extraer valores
                const tempVal = parseInt(predDia.temperatura[0].value); 
                const windData = predDia.vientoAndRachaMax[0].velocidad[0].value;
                const windVal = windData ? parseInt(windData) : 10; 
                const desc = predDia.estadoCielo[0].descripcion;

                // 3. Transformación y guardado
                this.currentState.tempIndex = this.normalize(tempVal, this.bounds.temp.min, this.bounds.temp.max);
                this.currentState.windIndex = this.normalize(windVal, this.bounds.wind.min, this.bounds.wind.max);
                
                const descUpper = desc.toUpperCase();
                this.currentState.rainIndex = (descUpper.includes('LLUVIA') || descUpper.includes('TORMENTA')) ? 0.8 : 0.0;
                this.currentState.mobilityIndex = this.calculateMobilityFactor();
                this.currentState.timestamp = Date.now();

                console.log(`✅ [AEMET] Actualizado: ${tempVal}ºC | Viento: ${windVal}km/h | ${desc}`);
            
            } else {
                console.error("❌ [AEMET] API devolvió estado no-200: " + responseStep1.data.descripcion);
            }

        } catch (error) {
            // --- MANEJO DE ERRORES MEJORADO ---
            if (error.response && error.response.status === 429) {
                console.warn("⚠️ [DataEngine] Límite de peticiones (429). Pausando 2 minutos...");
                nextInterval = 120000; // Esperar 2 minutos en lugar de 15
            } else {
                console.error(`❌ [DataEngine] Error: ${error.message}`);
                // Si es otro error, reintentamos en 1 minuto
                nextInterval = 60000; 
            }
        } finally {
            // Programar la siguiente ejecución pase lo que pase
            this.scheduleNextUpdate(nextInterval);
        }
    }
    
    // Nueva función para gestionar los tiempos
    scheduleNextUpdate(delay) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.fetchWeatherData(), delay);
    }

    // Iniciar el ciclo
    startPolling() {
        console.log("🚀 [DataEngine] Iniciando ciclo de datos...");
        this.fetchWeatherData();
    }

    getCurrentState() {
        return this.currentState;
    }
}

module.exports = DataEngine;
