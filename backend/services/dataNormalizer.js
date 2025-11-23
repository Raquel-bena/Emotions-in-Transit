/**
 * MOTOR DE DATOS (Data Engine)
 * Ubicación: backend_services/dataNormalizer.js
 * Responsabilidad: Obtener datos crudos de APIs y normalizarlos (0.0 - 1.0)
 * El Mapeo Estético (Correlación Poética) ocurre aquí.
 */

const axios = require('axios');

class DataEngine {
    constructor() {
        // 1. Estado Inicial (Valores por defecto si falla la API)
        this.currentState = { 
            tempIndex: 0.5,     // 0.0 = Frío (-5ºC), 1.0 = Calor (35ºC)
            windIndex: 0.1,     // 0.0 = Calma, 1.0 = Vendaval (50km/h)
            rainIndex: 0.0,     // 0.0 = Seco, 1.0 = Lluvia intensa
            mobilityIndex: 0.5, // 0.0 = Madrugada, 1.0 = Hora Punta (Tráfico/Metro)
            timestamp: Date.now()
        };

        // 2. Definición de límites para la normalización (Calibración)
        this.bounds = {
            temp: { min: -5, max: 35 },      // Grados Celsius
            wind: { min: 0, max: 50 }        // km/h
        };
    }

    // Función auxiliar: Escalar valores a rango 0-1
    normalize(value, min, max) {
        let normalized = (value - min) / (max - min);
        // Clamp: Asegurar que el valor nunca salga de 0.0 o 1.0
        return Math.max(0, Math.min(1, normalized));
    }
    
    // Función auxiliar: Simulación de Movilidad (Tráfico/Metro)
    // En el TFM real, esto se conectaría a APIs de TMB/Bicing.
    calculateMobilityFactor() {
        const hour = new Date().getHours();
        let factor = 0.5; // Valor por defecto
        
        // Simulación de Hora Punta (7am-9am y 5pm-7pm)
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            factor = 0.9; 
        } 
        // Simulación de Noche/Madrugada
        else if (hour >= 23 || hour <= 5) {
            factor = 0.1;
        }
        
        // Añadir una pequeña variación aleatoria para que no sea estático
        return this.normalize(factor + Math.random() * 0.1, 0, 1.1); 
    }

    // Función principal: Obtener datos de OpenWeatherMap
    async fetchWeatherData() {
        if (!process.env.OWM_KEY) {
            console.log("⚠️ [DataEngine] No se encontró OWM_KEY en .env. Usando datos simulados.");
            return;
        }

        try {
            const city = "Barcelona";
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OWM_KEY}&units=metric`;

            const response = await axios.get(url);
            const data = response.data;

            // 3. Transformación de Datos (La "Traducción Poética")
            this.currentState.tempIndex = this.normalize(data.main.temp, this.bounds.temp.min, this.bounds.temp.max);
            this.currentState.windIndex = this.normalize(data.wind.speed, this.bounds.wind.min, this.bounds.wind.max);
            
            // Lluvia -> Estelas/Transparencia 
            const weatherMain = data.weather[0].main;
            this.currentState.rainIndex = (weatherMain === 'Rain' || weatherMain === 'Drizzle' || weatherMain === 'Thunderstorm') ? 0.8 : 0.0;
            
            // Movilidad -> La simulación del pulso urbano
            this.currentState.mobilityIndex = this.calculateMobilityFactor();

            this.currentState.timestamp = Date.now();

            console.log(`✅ [DataEngine] Clima Barcelona: ${data.main.temp}ºC (Index: ${this.currentState.tempIndex.toFixed(2)}) | Movilidad: ${this.currentState.mobilityIndex.toFixed(2)} | ${weatherMain}`);

        } catch (error) {
            console.error(`❌ [DataEngine] Error al conectar con API: ${error.message}`);
        }
    }
    
    // *** AJUSTE CLAVE 3: El ciclo de polling ***
    startPolling() {
        // Ejecuta el fetch inicial e inicia el polling cada 5 minutos
        this.fetchWeatherData();
        setInterval(() => this.fetchWeatherData(), 5 * 60 * 1000); 
    }

    // Método para que el servidor (app.js) lea los datos
    getCurrentState() {
        return this.currentState;
    }
}

module.exports = DataEngine;