// app.js

// 1. IMPORTACIONES Y CONFIGURACIÓN
const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config(); 

// --- CORRECCIÓN AQUÍ ---
// 1. Importamos la Clase (con Mayúscula)
const DataEngineClass = require('./backend/services/dataNormalizer');
// 2. Creamos la instancia usando 'new' (con minúscula)
const dataEngine = new DataEngineClass(); 

const PORT = process.env.PORT || 3000;


// 2. MIDDLEWARE Y SERVICIO DE ARCHIVOS
app.use(express.static('public'));


// 3. ENDPOINT API
app.get('/api/current-state', (req, res) => {
    // --- CORRECCIÓN AQUÍ ---
    // Ahora usamos 'dataEngine', que es el nombre que definimos arriba
    res.json(dataEngine.getCurrentState()); 
});


// 4. INICIO DEL SERVIDOR
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    
    // --- CORRECCIÓN AQUÍ ---
    // Iniciamos el polling sobre la instancia creada
    dataEngine.startPolling();
});