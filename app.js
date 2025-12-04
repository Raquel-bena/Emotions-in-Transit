require('dotenv').config(); // Cargar variables de entorno

const express = require('express');
const cors = require('cors'); // <-- Importa CORS
const path = require('path');
const DataEngine = require('./backend/services/dataNormalizer'); // Importar tu motor

const app = express();
const port = process.env.PORT || 3000;

// --- 🔥 SOLUCIÓN CRÍTICA: Habilitar CORS ---
app.use(cors({
    origin: '*', // Permite cualquier origen (para desarrollo; en producción usa tu dominio)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Servir archivos estáticos (tu web)
app.use(express.static('public'));

// Inicializar el Motor de Datos AEMET
const dataEngine = new DataEngine();
dataEngine.startPolling(); // Empieza a buscar datos automáticamente

// RUTA API PRINCIPAL
app.get('/api/weather', (req, res) => {
    const data = dataEngine.getCurrentState();
    res.json(data); // ✅ Asegúrate de que esto devuelve un objeto JSON válido
});

// Ruta Bicing (Mockup/Simulación por ahora)
app.get('/api/bicing', (req, res) => {
    res.json({
        network: {
            stations: Array(50).fill({ free_bikes: Math.floor(Math.random() * 20) })
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
