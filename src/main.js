// Importamos la librería p5 instalada con npm
import p5 from 'p5';

// Importamos tu diseño (el sketch) desde la carpeta core
import sketch from './core/sketch.js';

// Importamos estilos globales (opcional, si creas un style.css)
import './style.css'; 

// --- INICIALIZACIÓN ---
// Esto crea una nueva instancia de p5 usando tu lógica (sketch)
// y la inyecta en el documento.
new p5(sketch);

console.log('🚀 Emotions in Transit: Frontend Iniciado');
