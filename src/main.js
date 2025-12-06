// src/main.js

// 1. Importamos la librería p5 instalada con npm
import p5 from 'p5';

// 2. Importamos tu diseño (el sketch) como efecto secundario
// Ya que sketch.js define window.setup y window.draw
import './core/sketch.js';

// 3. ESTILOS GLOBALES
// import './style.css'; 

// --- INICIALIZACIÓN DEL SISTEMA ---
// Iniciamos p5 en modo global (buscará setup/draw en window)
// Al hacer new p5() sin argumentos, busca las funciones globales.
new p5();

// Log de depuración para confirmar carga
console.log('🚀 Emotions in Transit: Frontend Iniciado Correctamente');
console.log('🔧 Modo: Global Mode compatible');
