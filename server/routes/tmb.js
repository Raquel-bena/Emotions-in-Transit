const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cache simple para no saturar la API (TTL 60 segundos)
let cache = {
    data: null,
    lastUpdate: 0
};

router.get('/metro', async (req, res) => {
    const NOW = Date.now();

    // 1. Servir caché si es válido (< 60s)
    if (cache.data && (NOW - cache.lastUpdate < 60000)) {
        return res.json(cache.data);
    }

    const appId = process.env.TMB_APP_ID;
    const appKey = process.env.TMB_APP_KEY;

    if (!appId || !appKey) {
        return res.status(500).json({ error: "Faltan credenciales TMB en .env" });
    }

    try {
        // Consultamos estado de líneas de Metro
        const url = `https://api.tmb.cat/v1/transit/linies/metro?app_id=${appId}&app_key=${appKey}`;
        const response = await axios.get(url, { timeout: 5000 });

        const lines = response.data.features;
        const activeLines = lines.length;

        const payload = {
            active_lines: activeLines,
            status: "OK",
            source: "TMB API",
            timestamp: new Date().toISOString()
        };

        // Guardar en caché
        cache.data = payload;
        cache.lastUpdate = NOW;

        res.json(payload);

    } catch (error) {
        console.error("❌ Error TMB API:", error.message);
        // Respuesta de contingencia
        res.json({
            active_lines: 5,
            status: "ERROR_FALLBACK",
            error: error.message
        });
    }
});

module.exports = router;
