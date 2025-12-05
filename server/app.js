// Apuntar al .env que está en la raíz (un nivel arriba)
require('dotenv').config({ path: '../.env' }); 

const express = require('express');
const cors = require('cors');
const path = require('path');

// --- CAMBIO DE RUTA ---
// Antes: './backend/services/dataNormalizer'
// Ahora: Está en 'utils' dentro de 'server'
const DataEngine = require('./utils/dataNormalizer'); 

const app = express();
const port = process.env.PORT || 3000;

// --- CORS ---
// Vital porque tu Frontend (Vite) estará en el puerto 5173 
// y tu Backend (este) en el 3000.
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// --- SERVIR ARCHIVOS ESTÁTICOS ---
// Nota: En desarrollo, Vite sirve el frontend. 
// Esto es útil si quieres servir la carpeta 'public' de la raíz para assets extra.
app.use(express.static(path.join(__dirname, '../public')));

// Inicializar el Motor de Datos
// Asegúrate de que tu clase DataEngine esté exportada correctamente en el otro archivo
const dataEngine = new DataEngine();
// Si dataEngine tiene método startPolling, descomenta esto:
// dataEngine.startPolling(); 

// --- RUTA API AEMET ---
app.get('/api/weather', (req, res) => {
    try {
        const data = dataEngine.getCurrentState();
        res.json(data);
    } catch (error) {
        console.error("Error obteniendo datos del motor:", error);
        res.status(500).json({ error: "Error interno del servidor de datos" });
    }
});

// --- RUTA BICING (Mockup) ---
app.get('/api/bicing', (req, res) => {
    res.json({
        network: {
            stations: Array(50).fill(null).map(() => ({ 
                free_bikes: Math.floor(Math.random() * 20) 
            }))
        }
    });
});

app.listen(port, () => {
    console.log(`📡 Servidor Backend escuchando en http://localhost:${port}`);
    console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
});
