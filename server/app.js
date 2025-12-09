// Apuntar al .env que está en la raíz (un nivel arriba)
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan'); // Logging HTTP

// Importar DataEngine (Clase)
const DataEngine = require('./utils/dataNormalizer');

// testing purposes
(new DataEngine()).fetchPythonData().then(data => console.log(data));

// Importar Rutas
const weatherRoutes = require('./routes/weather');
const bicingRoutes = require('./routes/bicing');

const app = express();
const port = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(morgan('dev')); // Logger
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Parsear JSON bodies

// --- SERVIR ARCHIVOS ESTÁTICOS (PRODUCCIÓN) ---
// 1. Servir carpeta pública (assets generales)
app.use(express.static(path.join(__dirname, '../public')));
// 2. Servir el Frontend construido (Vite build -> dist)
app.use(express.static(path.join(__dirname, '../dist')));

// --- INICIALIZACIÓN DEL MOTOR DE DATOS ---
const dataEngine = new DataEngine();
// Iniciar polling automáticamente si hay API KEY o simulación
dataEngine.startPolling();

// --- RUTAS API ---
app.use('/api/weather', weatherRoutes(dataEngine));
app.use('/api/bicing', bicingRoutes);
app.use('/api/tmb', require('./routes/tmb'));

// --- RUTA CATCH-ALL PARA SPA (Vite) ---
// Cualquier petición que no sea API, devuelve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// --- MANEJO DE ERRORES GLOBAL ---
app.use((err, req, res, next) => {
    console.error("❌ Error del Servidor:", err.stack);
    res.status(500).json({
        error: "Error interno del servidor",
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, () => {
    console.log(`📡 Servidor Backend escuchando en http://localhost:${port}`);
    console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
});
