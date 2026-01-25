// UBICACIÓN: server/index.js

// 1. Configuración de Entorno
// Busca el archivo .env en la carpeta raíz del proyecto (un nivel arriba)
require('dotenv').config({ path: '../.env' }); 

const express = require('express');
const cors = require('cors');
const path = require('path');

// 2. Importar las Rutas (Los sentidos de la ciudad)
// Asegúrate de que estos archivos existan en server/routes/
const tmbRoutes = require('./routes/tmb');
const weatherRoutes = require('./routes/weather');
const noiseRoutes = require('./routes/noise'); 

// 3. Inicializar App
const app = express();
const PORT = process.env.PORT || 3000;

// 4. Middlewares (Configuración de seguridad y datos)
app.use(cors()); // Permite que p5.js (desde otro puerto) pida datos sin bloqueos
app.use(express.json()); // Permite entender datos en formato JSON

// 5. Conectar las APIs (El puente de datos)
// Definimos las direcciones web donde vivirán tus datos
app.use('/api/tmb', tmbRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/noise', noiseRoutes);

// 6. Servir el Frontend (Para Producción en Render)
// Esto sirve los archivos que genera Vite en la carpeta 'dist'
app.use(express.static(path.join(__dirname, '../dist')));

// "Catch-all": Cualquier petición que no sea una API, devuelve la página web
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 7. Arrancar el Servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor Emotions (in) Transit corriendo en puerto ${PORT}`);
  console.log(`-------------------------------------------------------------`);
  console.log(`📡 Endpoints activos:`);
  console.log(`   - 🚇 Transporte: http://localhost:${PORT}/api/tmb/transport`);
  console.log(`   - 🌦️  Clima:      http://localhost:${PORT}/api/weather/current`);
  console.log(`   - 🔊 Ruido:      http://localhost:${PORT}/api/noise/current`);
  console.log(`-------------------------------------------------------------`);
});
