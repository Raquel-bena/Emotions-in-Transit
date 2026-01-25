// UBICACIÓN: server/routes/weather.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// RUTA: GET /api/weather/current
router.get('/current', async (req, res) => {
    // Leemos las variables del archivo .env
    const { OWM_KEY, CITY_ID } = process.env;

    // Validación de seguridad
    if (!OWM_KEY || !CITY_ID) {
        console.warn("⚠️ Faltan claves de Clima en .env");
        return res.json({
            temp: 20,
            condition: "Clouds",
            humidity: 60,
            source: "Simulation (Missing Keys)"
        });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&appid=${OWM_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        // Enviamos al frontend solo lo útil
        res.json({
            temp: data.main.temp,            // Temperatura actual
            condition: data.weather[0].main, // Ej: Rain, Clear
            humidity: data.main.humidity,    // Humedad
            windSpeed: data.wind.speed,      // Velocidad del viento
            source: "OpenWeatherMap API"
        });

    } catch (error) {
        console.error("❌ Error Clima:", error.message);
        // Fallback en caso de error
        res.json({
            temp: 18,
            condition: "Clear",
            source: "Simulation (Error Fallback)"
        });
    }
});

module.exports = router;
