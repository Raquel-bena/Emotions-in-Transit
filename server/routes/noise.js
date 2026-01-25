// UBICACIÓN: server/routes/noise.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// RUTA: GET /api/noise/current
router.get('/current', async (req, res) => {
    // ID del dispositivo SmartCitizen (Fabra i Puig)
    const DEVICE_ID = process.env.SMARTCITIZEN_ID || '9657'; 

    const url = `https://api.smartcitizen.me/v0/devices/${DEVICE_ID}`;

    try {
        const response = await axios.get(url);
        const sensors = response.data.data.sensors;

        // Buscamos el sensor específico de Ruido (dbA)
        // A veces el ID del sensor de ruido cambia, así que buscamos por unidad 'dB' o 'dBA'
        const noiseSensor = sensors.find(s => s.unit === 'dBA' || s.name.includes('Noise'));
        
        let noiseLevel = 0;
        if (noiseSensor) {
            noiseLevel = noiseSensor.value;
        }

        res.json({
            db: noiseLevel,
            status: "Online",
            source: "Smart Citizen API",
            location: response.data.name
        });

    } catch (error) {
        console.error("❌ Error Ruido:", error.message);
        // Fallback (Simulación si falla la API)
        res.json({
            db: Math.floor(Math.random() * 30) + 40, // Ruido ambiente simulado (40-70dB)
            status: "Offline (Ghost Mode)",
            source: "Simulation"
        });
    }
});

module.exports = router;
