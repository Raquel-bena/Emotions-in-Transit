const express = require('express');
const router = express.Router();

// GET /api/bicing
// Simulación de estado de estaciones (Placeholder)
router.get('/', (req, res) => {
    res.json({
        network: {
            stations: Array(50).fill(null).map((_, i) => ({
                id: i,
                free_bikes: Math.floor(Math.random() * 20),
                status: Math.random() > 0.1 ? 'OPN' : 'CLS'
            }))
        },
        timestamp: Date.now()
    });
});

module.exports = router;
