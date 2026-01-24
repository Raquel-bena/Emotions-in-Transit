// UBICACIÓN: server/index.js

// 1. Configuración inicial
require('dotenv').config({ path: '../.env' }); // Busca las claves en la carpeta raíz
const express = require('express');
const cors = require('cors');
const path = require('path');

// 2. Importar tus rutas (La lógica separada)
// Asegúrate de tener el archivo en server/routes/tmb.js
const tmbRoutes = require('./routes/tmb');
// const weatherRoutes = require('./routes/weather'); // Descomenta cuando crees este archivo

// 3. Iniciar la App
const app = express();
const PORT = process.env.PORT || 3000;

// 4. Middlewares (Seguridad y formato)
app.use(cors()); // Permite que p5.js se conecte en desarrollo
app.use(express.json()); // Permite entender datos JSON

// 5. RUTAS DE LA API (El puente de datos)
// Todo lo que vaya a /api/tmb lo gestiona el archivo tmb.js
app.use('/api/tmb', tmbRoutes);

// Aquí añadirás las otras en el futuro:
// app.use('/api/weather', weatherRoutes);


// 6. SERVIDOR WEB (Para cuando lo subas a Render)
// Sirve los archivos estáticos generados por Vite (carpeta dist)
app.use(express.static(path.join(__dirname, '../dist')));

// Cualquier petición que no sea API, devuelve la web principal (index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 7. Arrancar el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor Emotions (in) Transit corriendo en puerto ${PORT}`);
  console.log(`📡 Ruta TMB disponible en: http://localhost:${PORT}/api/tmb/transport`);
});