// app.js - Emotions in Transit Server (Backend Seguro)

const express = require('express');
const axios = require('axios'); // Herramienta para pedir datos
const path = require('path');
const dotenv = require('dotenv');

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// --- CLAVES SECRETAS (Solo viven en el servidor) ---
const WEATHER_API_KEY = '9d75f91e440ba31b532d442cf7e383d1'; 
const CITY_ID = '3128760'; // Barcelona

// --- MIDDLEWARE ---
app.use(express.static('public'));
app.use('/process', express.static(path.join(__dirname, 'prototypes')));

// --- API PROPIA (Puente de Seguridad) ---

// 1. Ruta para el Clima
app.get('/api/weather', async (req, res) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);
        res.json(response.data); // Enviamos los datos limpios al frontend
    } catch (error) {
        console.error("Error Clima:", error.message);
        res.status(500).json({ error: "Fallo al obtener clima" });
    }
});

// 2. Ruta para el Bicing
app.get('/api/bicing', async (req, res) => {
    try {
        const url = 'https://api.citybik.es/v2/networks/bicing';
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error("Error Bicing:", error.message);
        res.status(500).json({ error: "Fallo al obtener bicing" });
    }
});

// --- MANTENIMIENTO (Evita que Render se duerma) ---
app.get('/health', (req, res) => res.send('Vivo'));

function keepAlive() {
    if (process.env.RENDER_EXTERNAL_URL) {
        console.log("Ping de mantenimiento para evitar sueño...");
        axios.get(`${process.env.RENDER_EXTERNAL_URL}/health`)
            .catch(() => console.log("Error en keep-alive (ignorar si arranca)"));
    }
}
// Hace un ping cada 14 minutos (Render duerme a los 15 min)
setInterval(keepAlive, 14 * 60 * 1000);

// --- ARRANCAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`\n🚀 EMOTIONS IN TRANSIT LISTO`);
    console.log(`> Servidor en puerto: ${PORT}`);
});