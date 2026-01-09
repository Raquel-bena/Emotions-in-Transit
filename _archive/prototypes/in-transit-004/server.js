const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // Esto permite que p5.js se conecte sin bloqueos

const PORT = 3000;

// --- ENDPOINT: CLIMA (OpenWeatherMap) ---
app.get('/api/weather', async (req, res) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?id=3128760&appid=09a95abe51374eae766a284a97a3f039&units=metric`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener clima' });
    }
});

// --- ENDPOINT: TRANSPORTE (TMB) ---
app.get('/api/transport', async (req, res) => {
    try {
        const url = `https://api.tmb.cat/v1/transit/linies/metro?app_id=daf62db0&app_key=5e4adb21bdfeda65a91e36cc2c12b7df`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener TMB' });
    }
});

// --- ENDPOINT: SENSORES (Sentilo BCN) ---
app.get('/api/sentilo', async (req, res) => {
    try {
        // Ejemplo genérico, ajusta la ruta según el sensor específico que quieras monitorear
        const response = await axios.get('http://api.sentilo.bcn:7081/data/sensor/AL001', {
            headers: { 'IDENTITY': '09a95abe51374eae766a284a97a3f039' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener Sentilo' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de EMOTIONS IN TRANSIT corriendo en http://localhost:${PORT}`);
});