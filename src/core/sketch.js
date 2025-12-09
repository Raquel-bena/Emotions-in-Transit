import * as Tone from 'tone';
import { GridAgent } from '../visual/Particle.js';

// --- CONFIGURACIÓN GLOBAL ---
let agents = [];
let guiParams = {
  gridSize: 30,
  showGridLines: true,
  baseColor: '#0b0c10'
};

// --- AUDIO ---
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

  // 1. INIT
  initGrid();

  // 2. EVENTS
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.addEventListener('click', initAudioEngine);

  // 3. DATA POLLING
  getWeatherData();
  // Polling rápido (5s) para captar cambios de ruido/emoción
  setInterval(getWeatherData, 5000);
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

// --- DRAW (RENDER LOOP) ---
function draw() {
  // 1. INTERPRETACIÓN EMOCIONAL (Visuales)
  let mode = state.meta.emotion || "ACTIVE_HOPE";

  // A. FONDO Y ATMÓSFERA
  if (mode === "URBAN_ANGER") {
    // Ira: Rojo oscuro, parpadeo agresivo (Strobing) si hay mucho ruido
    let flash = (state.environment.noiseDb > 75 && frameCount % 10 === 0) ? 50 : 0;
    background(20 + flash, 0, 0);
    guiParams.baseColor = '#ff0000';
  }
  else if (mode === "ECO_ANXIETY") {
    // Ansiedad: Verde tóxico oscuro
    background(10, 15, 5);
    guiParams.baseColor = '#ccff00';
  }
  else if (mode === "SOLASTALGIA") {
    // Duelo: Azul grisáceo, estelas (no borramos el fondo completamente)
    background(5, 5, 10, 20); // Alpha bajo crea "trails"
    guiParams.baseColor = '#4a6b8a';
  }
  else { // ACTIVE_HOPE (Default)
    // Esperanza: Cian/Negro limpio
    background(10, 12, 15);
    guiParams.baseColor = '#00f0ff';
  }

  // B. GRID (Estructura de la ciudad)
  if (guiParams.showGridLines) {
    // Color de líneas según emoción
    let gridColor = color(guiParams.baseColor);
    gridColor.setAlpha(30);
    stroke(gridColor);
    strokeWeight(1);
    for (let x = 0; x <= width; x += guiParams.gridSize) line(x, 0, x, height);
    for (let y = 0; y <= height; y += guiParams.gridSize) line(0, y, width, y);
  }

  // C. AGENTES (Tráfico de datos)
  for (let agent of agents) {
    // Modificadores de comportamiento según emoción
    if (mode === "URBAN_ANGER") {
      agent.speedMult = 3.0; // Frenesí
      agent.jitter = 0;
    }
    else if (mode === "ECO_ANXIETY") {
      agent.speedMult = 1.0;
      // Vibración nerviosa (Jitter)
      agent.pos.x += random(-1.5, 1.5);
      agent.pos.y += random(-1.5, 1.5);
    }
    else if (mode === "SOLASTALGIA") {
      agent.speedMult = 0.5; // Letargo
      agent.pos.y += 0.5; // Efecto "lágrima" / gravedad leve
    }
    else {
      agent.speedMult = 1.2; // Flujo normal armónico
    }

    agent.update(state);
    agent.display();
  }

  // D. POST-PROCESADO (Filtros Globales)
  if (mode === "SOLASTALGIA" || mode === "ECO_ANXIETY") {
    // Visión borrosa (bruma mental/ambiental)
    // Más intenso si la humedad es alta
    let blurAmt = map(state.weather.humidity, 50, 100, 1, 4);
    filter(BLUR, blurAmt);
  }
}

// --- LOGIC ---
async function getWeatherData() {
  try {
    const res = await fetch('/api/weather');
    if (res.ok) {
      const data = await res.json();

      // Sincronizar estado Frontend con Backend
      Object.assign(state.meta, data.meta);
      Object.assign(state.weather, data.weather);
      Object.assign(state.environment, data.environment);
      Object.assign(state.transport, data.transport);

      updateDOM();
    }
  } catch (e) {
    console.error("Data Fetch Error:", e);
  }
}

function updateDOM() {
  const setTxt = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.innerText = v;
  };

  // Panel Izquierdo (Mapeo exacto a tu nuevo HTML)
  setTxt('noise-val', state.environment.noiseDb.toFixed(1) + " dB");

  const co2 = state.environment.co2 || 400;
  setTxt('co2-val', co2.toFixed(0) + " ppm");

  const lightPct = (state.environment.lightLevel * 100).toFixed(0);
  setTxt('light-val', lightPct + "%");

  setTxt('congestion-val', state.transport.congestion.toFixed(1) + " / 10");

  // Footer: Mostrar el estado emocional actual
  const emotionLabel = state.meta.emotion ? state.meta.emotion.replace('_', ' ') : "STANDBY";
  setTxt('desc-val', emotionLabel);
}

function updateClock() {
  const d = new Date();
  const el = document.getElementById('clock-display');
  if (el) el.innerText = d.toLocaleTimeString('en-GB');
}

function initAudioEngine() {
  if (isAudioStarted) return;
  Tone.start().then(() => {
    isAudioStarted = true;
    const overlay = document.getElementById('welcome-screen');
    if (overlay) overlay.style.display = 'none';
    console.log("Audio Engine Started");
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
