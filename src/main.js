import p5 from 'p5';
import './style.css';

const API_URL = "https://emotions-in-transit-m2ts.onrender.com/api/data"; // O el endpoint que devuelva el JSON

let incomingData = null;

// Creamos la instancia para asegurar que 'p5' siempre esté definido en este contexto
const sketch = (p) => {
  
  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent('app'); // Lo movemos al div con id "app"
    
    // Iniciar la descarga de datos inmediatamente
    fetchData();
    // Actualizar cada minuto para no saturar Render
    setInterval(fetchData, 60000);

    // Manejo del botón de inicio (AudioContext requiere interacción)
    document.getElementById('start-btn').addEventListener('click', () => {
      document.getElementById('welcome-screen').classList.add('hidden');
      p.userStartAudio(); // Resuelve el aviso de Tone.js/AudioContext
    });
  };

  p.draw = () => {
    p.background(0);
    
    // VALIDACIÓN: Si no hay datos, no dibujamos para evitar errores de "undefined"
    if (!incomingData) return;

    // Lógica de visualización basada en las funciones que ya tenías
    drawClimate(p, incomingData);
    drawTransit(p, incomingData);
  };

  async function fetchData() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      // Mapeamos los datos del DataEngine al formato que espera el visualizador
      incomingData = {
        emotion: data.meta.emotion,
        noise: data.environment.noiseDb,
        co2: data.environment.co2,
        light: data.environment.lightLevel * 100,
        congestion: data.transport.congestion
      };

      updateHUD(incomingData);
    } catch (err) {
      console.error("Error obteniendo datos de Render:", err);
    }
  }

  function updateHUD(data) {
    // Actualización segura de los elementos del DOM
    document.getElementById('noise-val').innerText = `${data.noise.toFixed(1)} dB`;
    document.getElementById('co2-val').innerText = `${data.co2} ppm`;
    document.getElementById('light-val').innerText = `${data.light.toFixed(0)} %`;
    document.getElementById('congestion-val').innerText = `${data.congestion.toFixed(1)} /10`;
    document.getElementById('desc-val').innerText = data.emotion;
  }
};

// Inicializamos p5 en modo instancia para evitar conflictos de variables globales
new p5(sketch);

// Función de ejemplo para dibujar el clima (basada en tu código de visualizer.html)
function drawClimate(p, data) {
  p.beginShape();
  p.stroke(0, 255, 255);
  p.noFill();
  for (let x = 0; x < p.width; x += 10) {
    // Usamos el ruido del sensor para alterar la onda
    let noiseFactor = data.noise * 0.1;
    let y = p.height / 2 + p.sin(x * 0.01 + p.frameCount * 0.02) * noiseFactor;
    p.vertex(x, y);
  }
  p.endShape();
}