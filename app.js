require('dotenv').config(); 
const express = require('express');
const path = require('path');
const cors = require('cors'); // Recomendado añadir si tienes problemas de dominios
const DataEngine = require('./backend/services/dataNormalizer');

const app = express();
// Render asigna un puerto automáticamente en process.env.PORT
const port = process.env.PORT || 3000; 

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, JS, CSS) de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar Motor
const dataEngine = new DataEngine();
dataEngine.startPolling();

// API
app.get('/api/weather', (req, res) => {
    res.json(dataEngine.getCurrentState());
});

app.get('/api/bicing', (req, res) => {
    // Mockup para demostración
    res.json({
        network: {
            stations: Array(50).fill({ free_bikes: Math.floor(Math.random() * 20) })
        }
    });
});

// Ruta fallback para SPA (opcional, pero buena práctica)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Servidor Emotions in Transit corriendo en puerto ${port}`);
});
