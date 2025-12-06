// src/main.js

// 1. Importamos la librería p5 instalada con npm
import p5 from 'p5';

// 2. Importamos tu diseño (el sketch) como efecto secundario
// Solo necesitamos que el código se ejecute y defina window.setup/draw
import './core/sketch.js';

// 3. ESTILOS GLOBALES
// Asegúrate de que este import no esté comentado si quieres tu CSS
import './style.css';

// --- INICIALIZACIÓN DEL SISTEMA ---
// Iniciamos p5 en modo global (buscará setup/draw en window)
new p5();

// Log de depuración para confirmar carga
console.log('🚀 Emotions in Transit: Frontend Iniciado Correctamente');
console.log('🔧 Modo: Global Mode compatible');
