require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const path = require('path');
const DataEngine = require('./backend/services/dataNormalizer'); // Importar tu motor

const app = express();
const port = process.env.PORT || 3000;

// Inicializar el Motor de Datos AEMET
const dataEngine = new DataEngine();
dataEngine.startPolling(); // Empieza a buscar datos automáticamente

// Servir archivos estáticos (tu web)
app.use(express.static('public'));

// RUTA API PRINCIPAL
// El frontend llama a esto para obtener los datos normalizados
app.get('/api/weather', (req, res) => {
    const data = dataEngine.getCurrentState();
    res.json(data);
});

// Ruta Bicing (Mockup/Simulación por ahora)
app.get('/api/bicing', (req, res) => {
    // Simulamos datos de estaciones
    res.json({
        network: {
            stations: Array(50).fill({ free_bikes: Math.floor(Math.random() * 20) })
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});