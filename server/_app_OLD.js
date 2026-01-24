import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { bicingRouter } from '../routes/bicing.js';
import { tmbRouter } from '../routes/tmb.js';
import { weatherRouter } from '../routes/weather.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist')));

// Rutas API
app.use('/api/bicing', bicingRouter);
app.use('/api/tmb', tmbRouter);
app.use('/api/weather', weatherRouter);

// Ruta para SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});
