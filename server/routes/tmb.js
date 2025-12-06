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

    // Servir caché si es válido (< 60s)
    if (cache.data && (NOW - cache.lastUpdate < 60000)) {
        return res.json(cache.data);
    }

    const appId = process.env.TMB_APP_ID;
    const appKey = process.env.TMB_APP_KEY;

    if (!appId || !appKey) {
        return res.status(500).json({ error: "Faltan credenciales TMB" });
    }

    try {
        // Consultamos el estado de las líneas de Metro (L1 a L5 principalmente)
        // Endpoint: /transit/linies/metro
        const url = `https://api.tmb.cat/v1/transit/linies/metro?app_id=${appId}&app_key=${appKey}`;

        const response = await axios.get(url);

        // Procesamos para sacar algo útil: ¿Funciona todo bien?
        // La API devuelve una lista de líneas. Contamos cuántas hay activas.
        const lines = response.data.features;

        // Calculamos un "Indice de Actividad" basado en la cantidad de líneas reportadas
        // (Esto es una simplificación, idealmente miraríamos incidencias)
        const activeLines = lines.length;

        const payload = {
            active_lines: activeLines,
            status: "OK",
            timestamp: new Date().toISOString()
        };

        // Guardar en caché
        cache.data = payload;
        cache.lastUpdate = NOW;

        res.json(payload);

    } catch (error) {
        console.error("❌ Error TMB API:", error.message);

        // Si falla (auth o server), devolvemos datos simulados para no romper el frontend
        res.json({
            active_lines: 8, // Valor por defecto
            status: "SIMULATED",
            error: error.response?.statusText || error.message
        });
    }
});

module.exports = router;
