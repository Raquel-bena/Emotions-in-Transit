// app.js - Emotions in Transit Server

// 1. IMPORTACIONES
const express = require('express');
const path = require('path'); // Importante para las rutas de carpetas
const dotenv = require('dotenv');

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Importamos tu motor de datos (asegúrate de que este archivo exista en esa ruta)
const DataEngineClass = require('./backend/services/dataNormalizer');
const dataEngine = new DataEngineClass(); 

// 2. RUTAS Y MIDDLEWARE

// A) Ruta Principal: Sirve tu proyecto "Emotions in Transit" (carpeta public)
app.use(express.static('public'));

// B) Ruta del Experimento: Sirve el "Face Tracking" (carpeta prototypes)
// Esto hace que http://localhost:3000/process/face-tracking/ funcione
app.use('/process', express.static(path.join(__dirname, 'prototypes')));


// 3. API (Para que tu frontend principal reciba datos)
app.get('/api/current-state', (req, res) => {
    res.json(dataEngine.getCurrentState()); 
});


// 4. ARRANCAR SERVIDOR
app.listen(PORT, () => {
    console.log(`\n🚀 SERVIDOR LISTO:`);
    console.log(`> Proyecto Principal:  http://localhost:${PORT}`);
    console.log(`> Face Tracking (Exp): http://localhost:${PORT}/process/face-tracking/`);
    console.log(`\n(Presiona Ctrl + C para detenerlo)`);

    // Iniciar la recolección de datos
    dataEngine.startPolling();
});