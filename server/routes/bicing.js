const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        network: {
            stations: Array(50).fill(null).map(() => ({
                free_bikes: Math.floor(Math.random() * 20)
            }))
        }
    });
});

module.exports = router;
