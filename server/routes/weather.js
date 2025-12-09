const express = require('express');
const router = express.Router();

// Exportamos una función que recibe la instancia de DataEngine desde app.js
module.exports = (dataEngine) => {

    // GET /api/weather
    // Devuelve el estado biométrico completo de la instalación
    router.get('/', (req, res) => {
        try {
            // Obtenemos el estado actual (SmartCitizen + TMB + OWM)
            const data = dataEngine.getCurrentState();
            res.json(data);
        } catch (error) {
            console.error("❌ Error obteniendo datos del motor:", error);
            res.status(500).json({ error: "Error interno del servidor de datos" });
        }
    });

    return router;
};
