/**
 * MOTOR DE DATOS (Data Engine) - VERSIÓN OPENWEATHERMAP OPTIMIZADA
 * Ubicación: backend/services/dataNormalizer.js
 * (Incluye la lógica de movilidad suavizada)
 */
const axios = require('axios');

// CONFIGURACIÓN: Límites para normalización (Calibrado para BCN)
const BOUNDS = {
    TEMP: { min: 0, max: 35 },    
    WIND: { min: 0, max: 50 },    
    RAIN: { min: 0, max: 10 }     
};

class DataEngine {
    constructor() {
        this.currentState = {
            tempIndex: 0.5,
            windIndex: 0.1,
            rainIndex: 0.0,
            mobilityIndex: 0.5,
            timestamp: Date.now(),
            weatherDescription: 'waiting for data...'
        };

        this.timer = null;
        this.isPolling = false;
    }

    /**
     * Convierte un valor absoluto a un rango 0.0 - 1.0
     */
    normalize(value, min, max) {
        if (typeof value !== 'number' || isNaN(value)) return 0.5;
        const norm = (value - min) / (max - min);
        // Clamp: Asegura que el valor nunca salga de 0-1
        return Math.max(0, Math.min(1, norm));
    }

    /**
     * Calcula movilidad basada en hora y día de la semana
     * (Ajustado para transiciones más suaves y picos realistas en días laborables)
     */
    calculateMobilityFactor() {
        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60; // Hora con decimales
        const day = now.getDay(); // 0 = Domingo, 6 = Sábado

        let base = 0.5;
        const isWeekend = (day === 0 || day === 6);

        if (isWeekend) {
            // Fin de semana: tráfico suave, pico al mediodía/tarde
            // Se usa seno para una curva suave (pico a las 15h)
            const phase = Math.sin((hour / 24) * 2 * Math.PI - 1.5);
            base = 0.35 + 0.25 * phase; // Rango aprox: 0.10 a 0.60
            
        } else {
            // Laborable: Picos de hora punta (Morning/Evening)
            if (hour >= 23 || hour <= 5) {
                base = 0.05 + Math.random() * 0.05; // Noche (0.05 a 0.10)
            } else {
                // Cálculo de picos suaves (MorningPeak a las 8:00, EveningPeak a las 18:00)
                const morningPeak = Math.max(0, 1 - Math.abs(hour - 8) / 3); 
                const eveningPeak = Math.max(0, 1 - Math.abs(hour - 18) / 3); 
                
                // Valor base (0.3) + 0.6x (el máximo del pico) = Rango máx ~0.9
                base = 0.3 + 0.6 * Math.max(morningPeak, eveningPeak); 
            }
        }

        // Añadimos pequeña variación orgánica (+/- 5%) para que no sea estático
        const organicNoise = (Math.random() * 0.1) - 0.05;
        return this.normalize(base + organicNoise, 0, 1);
    }

    /**
     * Lógica principal de obtención de datos
     */
    async fetchWeatherData() {
        const apiKey = process.env.OWM_KEY;
        let nextInterval = 15 * 60 * 1000;

        if (!apiKey) {
            console.warn("⚠️ [DataEngine] Sin API KEY. Ejecutando en MODO SIMULACIÓN.");
            this.simulateData();
            return this.scheduleNextUpdate(60000); // Actualizar rápido en simulación
        }

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?id=3128740&appid=${apiKey}&units=metric`;
            const response = await axios.get(url);
            const data = response.data;

            if (Number(data.cod) !== 200) throw new Error(`OWM API Error Code: ${data.cod}`);

            // 1. TEMPERATURA
            const tempVal = data.main.temp;

            // 2. VIENTO (m/s a km/h)
            const windKmH = data.wind.speed * 3.6;

            // 3. LLUVIA
            let rainVol = 0;
            if (data.rain && data.rain['1h']) {
                rainVol = data.rain['1h'];
            } else if (data.weather[0].main === 'Rain' || data.weather[0].main === 'Drizzle') {
                rainVol = 2; 
            } else if (data.weather[0].main === 'Thunderstorm') {
                rainVol = 8; 
            }

            // ACTUALIZAR ESTADO
            this.currentState = {
                tempIndex: this.normalize(tempVal, BOUNDS.TEMP.min, BOUNDS.TEMP.max),
                windIndex: this.normalize(windKmH, BOUNDS.WIND.min, BOUNDS.WIND.max),
                rainIndex: this.normalize(rainVol, BOUNDS.RAIN.min, BOUNDS.RAIN.max),
                mobilityIndex: this.calculateMobilityFactor(), // Usamos la función mejorada
                timestamp: Date.now(),
                weatherDescription: data.weather[0].description
            };

            console.log(`✅ [OWM] BCN Actualizado: ${tempVal.toFixed(1)}°C | Viento: ${windKmH.toFixed(1)}km/h | Lluvia: ${rainVol}mm | ${data.weather[0].description}`);

        } catch (error) {
            console.error(`❌ [DataEngine] Error al obtener datos:`, error.message);

            if (error.response && error.response.status === 429) {
                console.warn("⏳ [DataEngine] Límite de API excedido. Pausando 5 minutos...");
                nextInterval = 5 * 60 * 1000;
            } else {
                nextInterval = 2 * 60 * 1000;
            }
        } finally {
            this.scheduleNextUpdate(nextInterval);
        }
    }

    /**
     * Genera datos falsos para desarrollo sin API Key
     */
    simulateData() {
        this.currentState.tempIndex = this.normalize(20 + Math.random() * 5, 0, 40);
        this.currentState.windIndex = Math.random();
        this.currentState.rainIndex = Math.random() > 0.8 ? 0.5 : 0; 
        this.currentState.mobilityIndex = this.calculateMobilityFactor(); // Usamos la función mejorada
        this.currentState.timestamp = Date.now();
        this.currentState.weatherDescription = "simulated mode";
    }

    scheduleNextUpdate(delay) {
        if (!this.isPolling) return; 
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.fetchWeatherData(), delay);
    }

    startPolling() {
        if (this.isPolling) return;
        this.isPolling = true;
        console.log("🚀 [DataEngine] Servicio de meteorología iniciado.");
        this.fetchWeatherData();
    }

    stopPolling() {
        this.isPolling = false;
        if (this.timer) clearTimeout(this.timer);
        console.log("🛑 [DataEngine] Servicio detenido.");
    }

    getCurrentState() {
        return { ...this.currentState };
    }
}

module.exports = DataEngine;
