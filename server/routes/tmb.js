// UBICACIÓN: server/routes/tmb.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/transport', async (req, res) => {
    const APP_ID = process.env.TMB_APP_ID;
    const APP_KEY = process.env.TMB_APP_KEY;

    // Validación: Si faltan claves, usa modo simulación (Ghost Mode)
    if (!APP_ID || !APP_KEY) {
        console.log("⚠️ Faltan claves TMB. Activando modo simulación.");
        return res.json({ 
            status: "Offline (Ghost Mode)", 
            congestion: 5, 
            activeLines: 8,
            source: "Simulation"
        });
    }

    try {
        const url = `https://api.tmb.cat/v1/transit/linies/metro?app_id=${APP_ID}&app_key=${APP_KEY}`;
        const response = await axios.get(url);
        
        // Calcular congestión simulada basada en la hora
        const now = new Date();
        const hour = (now.getUTCHours() + 1) % 24; 
        let congestion = ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) 
            ? Math.floor(Math.random() * 3) + 7  // Hora punta
            : Math.floor(Math.random() * 5) + 1; // Hora valle

        res.json({
            status: "Online",
            congestion: congestion,
            activeLines: response.data.features.length,
            serverTime: `${hour}:00`,
            source: "TMB API"
        });

    } catch (error) {
        console.error("❌ Error TMB:", error.message);
        res.json({ status: "Error", congestion: 5, activeLines: 8 });
    }
});

module.exports = router;