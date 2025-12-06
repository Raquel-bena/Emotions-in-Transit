/**
 * MOTOR DE DATOS (Data Engine) - VERSIÓN OPENWEATHERMAP OPTIMIZADA
 * Ubicación: backend/services/dataNormalizer.js
 */
const axios = require('axios');

// CONFIGURACIÓN: Límites para normalización (Calibrado para BCN)
const BOUNDS = {
    TEMP: { min: 0, max: 35 },    // Grados Celsius (menos de 0 en BCN es raro, más de 35 es ola de calor)
    WIND: { min: 0, max: 50 },    // km/h (50 km/h ya es viento fuerte)
    RAIN: { min: 0, max: 10 }     // mm/h (Volumen de lluvia para normalizar intensidad)
};

class DataEngine {
    constructor() {
        // Estado inicial neutro
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
     * (Sábados y Domingos tienen patrones diferentes)
     */
    calculateMobilityFactor() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay(); // 0 = Domingo, 6 = Sábado

        let base = 0.5;
        const isWeekend = (day === 0 || day === 6);

        if (isWeekend) {
            // Fin de semana: tráfico suave, pico mediodía/tarde
            if (hour >= 11 && hour <= 20) base = 0.6;
            else base = 0.2;
        } else {
            // Laborable: Picos de hora punta
            if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
                base = 0.95; // Hora punta extrema
            } else if (hour >= 23 || hour <= 5) {
                base = 0.1;  // Noche
            } else {
                base = 0.6;  // Hora valle diurna
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
        // Intervalo base: 15 minutos (OpenWeatherMap actualiza cada 10-20 min)
        let nextInterval = 15 * 60 * 1000;

        if (!apiKey) {
            console.warn("⚠️ [DataEngine] Sin API KEY. Ejecutando en MODO SIMULACIÓN.");
            this.simulateData();
            return this.scheduleNextUpdate(60000); // Actualizar rápido en simulación
        }

        try {
            // ID Barcelona: 3128740
            const url = `https://api.openweathermap.org/data/2.5/weather?id=3128740&appid=${apiKey}&units=metric`;
            const response = await axios.get(url);
            const data = response.data;

            // Validación de respuesta interna de OWM
            if (Number(data.cod) !== 200) throw new Error(`OWM API Error Code: ${data.cod}`);

            // 1. TEMPERATURA
            const tempVal = data.main.temp;

            // 2. VIENTO (m/s a km/h)
            const windKmH = data.wind.speed * 3.6;

            // 3. LLUVIA (Más sofisticado que solo descripción)
            // data.rain['1h'] da mm en la última hora. Si no existe, es 0.
            let rainVol = 0;
            if (data.rain && data.rain['1h']) {
                rainVol = data.rain['1h'];
            } else if (data.weather[0].main === 'Rain' || data.weather[0].main === 'Drizzle') {
                rainVol = 2; // Valor fallback suave si dice lluvia pero no da volumen
            } else if (data.weather[0].main === 'Thunderstorm') {
                rainVol = 8; // Valor alto para tormentas
            }

            // ACTUALIZAR ESTADO
            this.currentState = {
                tempIndex: this.normalize(tempVal, BOUNDS.TEMP.min, BOUNDS.TEMP.max),
                windIndex: this.normalize(windKmH, BOUNDS.WIND.min, BOUNDS.WIND.max),
                rainIndex: this.normalize(rainVol, BOUNDS.RAIN.min, BOUNDS.RAIN.max),
                mobilityIndex: this.calculateMobilityFactor(),
                timestamp: Date.now(),
                weatherDescription: data.weather[0].description
            };

            console.log(`✅ [OWM] BCN Actualizado: ${tempVal.toFixed(1)}°C | Viento: ${windKmH.toFixed(1)}km/h | Lluvia: ${rainVol}mm | ${data.weather[0].description}`);

        } catch (error) {
            console.error(`❌ [DataEngine] Error al obtener datos:`, error.message);

            // Gestión de Rate Limiting (Error 429)
            if (error.response && error.response.status === 429) {
                console.warn("⏳ [DataEngine] Límite de API excedido. Pausando 5 minutos...");
                nextInterval = 5 * 60 * 1000;
            } else {
                // Si falla por internet u otro error, reintentar pronto (2 min)
                nextInterval = 2 * 60 * 1000;
            }

            // NOTA: No borramos currentState, mantenemos el último válido para que el frontend no falle.
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
        this.currentState.rainIndex = Math.random() > 0.8 ? 0.5 : 0; // 20% prob de lluvia
        this.currentState.mobilityIndex = this.calculateMobilityFactor();
        this.currentState.timestamp = Date.now();
        this.currentState.weatherDescription = "simulated mode";
    }

    scheduleNextUpdate(delay) {
        if (!this.isPolling) return; // Si se detuvo manualmente, no reprogramar
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

module.exports = DataEngine; // Exportamos la CLASE para que app.js pueda instanciarla
