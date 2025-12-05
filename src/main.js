// src/main.js

// 1. Importamos la librería p5 instalada con npm
import p5 from 'p5';

// 2. Importamos tu diseño (el sketch) desde la carpeta core
// Asegúrate de que tu archivo sketch.js esté en src/core/sketch.js
import sketch from './core/sketch.js';

// 3. ESTILOS GLOBALES
// ⚠️ HE COMENTADO ESTA LÍNEA TEMPORALMENTE
// Esto estaba causando el error "Failed to resolve import". 
// Manténla comentada (con // delante) hasta que crees el archivo style.css.
// import './style.css'; 

// --- INICIALIZACIÓN DEL SISTEMA ---
// Esto crea una nueva instancia de p5 usando tu lógica (sketch)
// y la inyecta en el documento HTML automáticamente.
const myP5 = new p5(sketch);

// Log de depuración para confirmar carga
console.log('🚀 Emotions in Transit: Frontend Iniciado Correctamente');
console.log('🔧 Modo: Instance Mode activo');
