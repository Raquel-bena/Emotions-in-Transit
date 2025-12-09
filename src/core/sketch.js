import * as Tone from 'tone';
import { GridAgent } from '../visual/Particle.js';
// 1. IMPORTAR EL MOTOR DE AUDIO
import AudioEngine from '../systems/AudioEngine.js';

// --- CONFIGURACIÓN GLOBAL ---
let agents = [];
let guiParams = {
  gridSize: 30,
  showGridLines: true,
  baseColor: '#0b0c10'
};

// --- AUDIO SYSTEM ---
let audioSys = new AudioEngine(); // Instancia del motor de audio
let isAudioStarted = false;

// --- ESTADO BIOMÉTRICO (Espejo del backend) ---
let state = {
  meta: { period: 'Ld', timestamp: 0, mode: 'INIT', emotion: 'NEUTRAL' },
  weather: { temp: 20, humidity: 50, windSpeed: 10, windDir: 0, rain: 0 },
  environment: { noiseDb: 45, airQuality: 10, co2: 400, lightLevel: 0.5 },
  transport: { congestion: 5, flowRhythm: 0.5 }
};

// --- SETUP ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Space Mono');

  // 1. INICIALIZAR GRID
  initGrid();

  // 2. EVENTOS DE INTERFAZ
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.addEventListener('click', initAudioEngine);

  // 3. POLLING DE DATOS (Cada 4 segundos para mayor reactividad)
  getWeatherData();
  setInterval(getWeatherData, 4000);
  setInterval(updateClock, 1000);
}

function initGrid() {
  agents = [];
  const cols = Math.floor(width / guiParams.gridSize);
  const rows = Math.floor(height / guiParams.gridSize);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let px = x * guiParams.gridSize;
      let py = y * guiParams.gridSize;
      agents.push(new GridAgent(window, px, py, guiParams.gridSize));
    }
  }
}

// --- DRAW (BUCLE DE RENDERIZADO) ---
function draw() {
  // Obtener la emoción actual calculada por el Backend
  let mode = state.meta.emotion || "ACTIVE_HOPE";

  // A. ATMÓSFERA VISUAL (Fondo y Color)
  if (mode === "URBAN_ANGER") {
    // Ira: Rojo oscuro, parpadeo agresivo si el ruido es extremo
    let flash = (state.environment.noiseDb > 75 && frameCount % 8 === 0) ? 60 : 0;
    background(25 + flash, 0, 0);
    guiParams.baseColor = '#ff0000';
  }
  else if (mode === "ECO_ANXIETY") {
    // Ansiedad: Verde tóxico oscuro, vibrante
    background(15, 20, 5);
    guiParams.baseColor = '#ccff00';
  }
  else if (mode === "SOLASTALGIA") {
    // Duelo: Azul grisáceo con estelas (Alpha bajo en background)
    background(10, 15, 20, 30);
    guiParams.baseColor = '#4a6b8a';
  }
  else { // ACTIVE_HOPE
    // Esperanza: Cian/Negro limpio, alta definición
    background(10, 12, 16);
    guiParams.baseColor = '#00f0ff';
  }

  // B. DIBUJAR ESTRUCTURA (GRID)
  if (guiParams.showGridLines) {
    let gridColor = color(guiParams.baseColor);
    gridColor.setAlpha(35);
    stroke(gridColor);
    strokeWeight(1);
    for (let x = 0; x <= width; x += guiParams.gridSize) line(x, 0, x, height);
    for (let y = 0; y <= height; y += guiParams.gridSize) line(0, y, width, y);
  }

  // C. ACTUALIZAR AGENTES (Tráfico de Datos)
  for (let agent of agents) {
    // Modificadores físicos según emoción
    if (mode === "URBAN_ANGER") {
      agent.speedMult = 3.5; // Velocidad frenética
      agent.jitter = 0;
    }
    else if (mode === "ECO_ANXIETY") {
      agent.speedMult = 1.0;
      // Temblor nervioso (Jitter)
      agent.pos.x += random(-2, 2);
      agent.pos.y += random(-2, 2);
    }
    else if (mode === "SOLASTALGIA") {
      agent.speedMult = 0.4; // Lentitud pesada
      agent.pos.y += 0.8; // Efecto gravedad/lágrima
    }
    else {
      agent.speedMult = 1.2; // Flujo armónico
    }

    agent.update(state);
    agent.display();
  }

  // D. POST-PROCESADO (Filtros de Percepción)
  if (mode === "SOLASTALGIA" || mode === "ECO_ANXIETY") {
    // Bruma mental/ambiental
    let blurIntensity = map(state.weather.humidity, 50, 100, 2, 5);
    filter(BLUR, blurIntensity);
  }
}

// --- LÓGICA DE DATOS ---
async function getWeatherData() {
  try {
    const res = await fetch('/api/weather');
    if (res.ok) {
      const data = await res.json();

      // 1. Actualizar Estado Visual
      Object.assign(state.meta, data.meta);
      Object.assign(state.weather, data.weather);
      Object.assign(state.environment, data.environment);
      Object.assign(state.transport, data.transport);

      // 2. Actualizar Sistema de Audio (Conexión Bio-Acústica)
      if (isAudioStarted) {
        audioSys.updateFromState(state);
      }

      // 3. Actualizar DOM (Textos)
      updateDOM();
    }
  } catch (e) {
    console.error("Data Error:", e);
  }
}

function updateDOM() {
  const setTxt = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.innerText = v;
  };

  // Mapeo de datos al HTML
  setTxt('noise-val', state.environment.noiseDb.toFixed(1) + " dB");

  const co2 = state.environment.co2 || 400;
  setTxt('co2-val', co2.toFixed(0) + " ppm");

  const lightPct = (state.environment.lightLevel * 100).toFixed(0);
  setTxt('light-val', lightPct + "%");

  setTxt('congestion-val', state.transport.congestion.toFixed(1) + " / 10");

  // Mostrar emoción dominante en el footer
  const emotionLabel = state.meta.emotion ? state.meta.emotion.replace('_', ' ') : "STANDBY";
  setTxt('desc-val', emotionLabel);
}

function updateClock() {
  const d = new Date();
  const el = document.getElementById('clock-display');
  if (el) el.innerText = d.toLocaleTimeString('en-GB');
}

// --- MOTOR DE AUDIO (Inicialización) ---
function initAudioEngine() {
  if (isAudioStarted) return;

  // Iniciamos el sistema de audio importado
  audioSys.start().then(() => {
    isAudioStarted = true;

    // Ocultar pantalla de bienvenida
    const overlay = document.getElementById('welcome-screen');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.style.display = 'none', 1000);
    }
    console.log("🔊 Sistema Audio-Visual Iniciado");
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}

// Exponer globalmente para p5.js (Modo Global)
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
