// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir conexiones externas
app.use(cors());

// --- PROXY API: TRANSPORTE (TMB) ---
app.get('/api/transport', async (req, res) => {
    // 1. Obtener claves (desde variables de entorno o fallback)
    const APP_ID = process.env.TMB_APP_ID || "daf62db0";
    const APP_KEY = process.env.TMB_APP_KEY || "5e4adb21bdfeda65a91e36cc2c12b7df";
    
    const url = `https://api.tmb.cat/v1/transit/linies/metro?app_id=${APP_ID}&app_key=${APP_KEY}`;

    try {
        // 2. Pedir datos a TMB (Backend to Backend)
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Error TMB: ${response.statusText}`);
        
        const data = await response.json();

        // 3. Calcular congestión (Lógica de hora punta)
        // Render usa hora UTC. Sumamos 1 o 2 horas aprox para BCN.
        const now = new Date();
        const hour = (now.getHours() + 1) % 24; 
        
        let congestion = 0;
        // Hora punta (7-9am y 5-7pm)
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
            congestion = Math.floor(Math.random() * 3) + 7; // Alta (7-9)
        } else {
            congestion = Math.floor(Math.random() * 5) + 1; // Baja/Media (1-5)
        }

        // 4. Responder al Frontend con JSON limpio
        res.json({
            activeLines: data.features.length,
            congestion: congestion,
            status: "Online (Proxy Active)",
            serverTime: `${hour}:00`
        });

    } catch (error) {
        console.error("Error en Proxy TMB:", error);
        // Fallback para que la web no rompa
        res.json({ 
            activeLines: 8, 
            congestion: 5, 
            status: "Offline (Ghost Mode)" 
        });
    }
});

// --- SERVIR FRONTEND (VITE) ---
// Importante: Servimos la carpeta 'dist' que está un nivel arriba
app.use(express.static(path.join(__dirname, '../dist')));

// Cualquier otra ruta devuelve el index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// --- INICIAR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});
