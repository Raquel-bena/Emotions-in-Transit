const axios = require('axios');

class DataEngine {
    constructor() {
        // Estado inicial seguro
        this.currentState = { 
            tempIndex: 0.5,     
            windIndex: 0.1,     
            rainIndex: 0.0,     
            mobilityIndex: 0.5, 
            timestamp: Date.now()
        };

        // Límites
        this.bounds = {
            temp: { min: 0, max: 35 }, 
            wind: { min: 0, max: 60 }  
        };

        this.timer = null;
        this.isPolling = false;
    }

    normalize(value, min, max) {
        if (value === undefined || value === null || isNaN(value)) return 0.5; // Valor seguro por defecto
        let normalized = (value - min) / (max - min);
        return Math.max(0, Math.min(1, normalized));
    }
    
    calculateMobilityFactor() {
        const hour = new Date().getHours();
        let factor = 0.5;
        // Picos de movilidad en Barcelona
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) factor = 0.9; 
        else if (hour >= 23 || hour <= 5) factor = 0.1;
        
        return this.normalize(factor + Math.random() * 0.1, 0, 1.1); 
    }

    async fetchWeatherData() {
        // IMPORTANTE: Render lee esto de las "Environment Variables" en el Dashboard
        const apiKey = process.env.AEMET_API_KEY; 
        let nextInterval = 15 * 60 * 1000; // 15 minutos por defecto

        if (!apiKey) {
            console.error("❌ [DataEngine] CRÍTICO: No se encontró AEMET_API_KEY.");
            return;
        }

        try {
            console.log("🌐 [DataEngine] Conectando con AEMET...");
            // Paso 1: Obtener URL de datos
            const urlRequest = `https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/horaria/08019/?api_key=${apiKey}`;
            const responseStep1 = await axios.get(urlRequest);

            if (responseStep1.data.estado === 200) {
                // Paso 2: Descargar el JSON real
                const dataUrl = responseStep1.data.datos;
                const weatherResponse = await axios.get(dataUrl);
                
                // Paso 3: Parseo seguro
                const rawData = weatherResponse.data[0]; 
                
                // AEMET devuelve array de días. Tomamos el primero (hoy/mañana)
                const predDia = rawData?.prediccion?.dia?.[0];

                if (!predDia) throw new Error("Estructura de datos AEMET inesperada");

                // Buscamos el valor más cercano a la hora actual o el primero disponible
                // Usamos optional chaining (?.) para que no crashee si falta un dato
                const tempVal = parseInt(predDia.temperatura?.[0]?.value || 20); 
                const windObj = predDia.vientoAndRachaMax?.[0];
                const windVal = windObj?.velocidad?.[0]?.value ? parseInt(windObj.velocidad[0].value) : 10;
                const desc = predDia.estadoCielo?.[0]?.descripcion || "Despejado";

                // Actualizar estado
                this.currentState.tempIndex = this.normalize(tempVal, this.bounds.temp.min, this.bounds.temp.max);
                this.currentState.windIndex = this.normalize(windVal, this.bounds.wind.min, this.bounds.wind.max);
                
                const descUpper = desc.toUpperCase();
                this.currentState.rainIndex = (descUpper.includes('LLUVIA') || descUpper.includes('TORMENTA')) ? 0.8 : 0.0;
                this.currentState.mobilityIndex = this.calculateMobilityFactor();
                this.currentState.timestamp = Date.now();

                console.log(`✅ [AEMET] Datos actualizados: ${tempVal}ºC | Viento: ${windVal} | ${desc}`);
            
            } else {
                console.error(`⚠️ [AEMET] Error API: ${responseStep1.data.descripcion}`);
            }

        } catch (error) {
            console.error(`❌ [DataEngine] Error en petición: ${error.message}`);
            // Si hay error (ej. límite de API), esperamos menos para reintentar o más si es 429
            if (error.response?.status === 429) nextInterval = 2 * 60 * 1000; 
            else nextInterval = 60 * 1000;
        } finally {
            this.scheduleNextUpdate(nextInterval);
        }
    }
    
    scheduleNextUpdate(delay) {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.fetchWeatherData(), delay);
    }

    startPolling() {
        if (this.isPolling) return;
        this.isPolling = true;
        this.fetchWeatherData();
    }

    getCurrentState() {
        return this.currentState;
    }
}

module.exports = DataEngine;
