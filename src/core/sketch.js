import * as Tone from 'tone';
import { GridAgent, Co2Particle } from '../visual/Particle.js'; // Importamos Co2Particle
// 1. IMPORTAR EL MOTOR DE AUDIO
import AudioEngine from '../systems/AudioEngine.js';

// --- CONFIGURACIÓN GLOBAL ---
let agents = [];
let co2Particles = []; // Array para partículas de CO2
const numCo2Particles = 100; // Cantidad de partículas de CO2
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

  // 1. INICIALIZAR GRID Y PARTÍCULAS
  initGrid();
  initCo2Particles(); // Inicializar partículas de CO2

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

function initCo2Particles() {
  co2Particles = [];
  for (let i = 0; i < numCo2Particles; i++) {
    co2Particles.push(new Co2Particle(window));
  }
}

// --- DRAW (BUCLE DE RENDERIZADO) ---
function draw() {
  // Obtener la emoción actual calculada por el Backend
  let mode = state.meta.emotion || "ACTIVE_HOPE";

  // A. ATMÓSFERA VISUAL (Fondo y Color - Influenciado por LUZ)
  // La luz controla el brillo base del fondo.
  let bgColor = color(10, 12, 16); // Color base oscuro
  let lightBrightness = map(state.environment.lightLevel, 0, 1, 0, 50); // Aumenta brillo con luz

  if (mode === "URBAN_ANGER") {
    // Ira: Rojo oscuro, parpadeo agresivo si el ruido es extremo
    let flash = (state.environment.noiseDb > 75 && frameCount % 8 === 0) ? 60 : 0;
    background(25 + flash + lightBrightness, 0, 0);
    guiParams.baseColor = '#ff0000';
  }
  else if (mode === "ECO_ANXIETY") {
    // Ansiedad: Verde tóxico oscuro, vibrante
    background(15 + lightBrightness, 20 + lightBrightness, 5 + lightBrightness);
    guiParams.baseColor = '#ccff00';
  }
  else if (mode === "SOLASTALGIA") {
    // Duelo: Azul grisáceo con estelas (Alpha bajo en background), menos brillo por luz
    background(10 + lightBrightness * 0.5, 15 + lightBrightness * 0.5, 20 + lightBrightness * 0.5, 30);
    guiParams.baseColor = '#4a6b8a';
  }
  else { // ACTIVE_HOPE
    // Esperanza: Cian/Negro limpio, alta definición, más brillo por luz
    background(10 + lightBrightness, 12 + lightBrightness, 16 + lightBrightness);
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

  // C. VISUALIZACIÓN DE RUIDO (Onda Sonora Central)
  drawNoiseWave();

  // D. ACTUALIZAR Y DIBUJAR AGENTES DEL GRID (Tráfico de Datos)
  for (let agent of agents) {
    // Modificadores físicos según emoción y congestión
    let speedBase = 1.2;
    if (mode === "URBAN_ANGER") speedBase = 3.5;
    else if (mode === "SOLASTALGIA") speedBase = 0.4;

    // La congestión acelera todo globalmente
    agent.speedMult = speedBase * map(state.transport.congestion, 0, 10, 0.8, 2.0);

    if (mode === "URBAN_ANGER") {
      agent.jitter = map(state.environment.noiseDb, 60, 90, 0, 5, true); // Jitter por ruido
    }
    else if (mode === "ECO_ANXIETY") {
      // Temblor nervioso (Jitter) constante
      agent.pos.x += random(-1.5, 1.5);
      agent.pos.y += random(-1.5, 1.5);
    }
    else if (mode === "SOLASTALGIA") {
      agent.pos.y += 0.8; // Efecto gravedad/lágrima
    }

    agent.update(state);
    agent.display();
  }

  // E. ACTUALIZAR Y DIBUJAR PARTÍCULAS DE CO2
  // Su visibilidad y comportamiento dependen del nivel de CO2
  if (state.environment.co2 > 500 || mode === "ECO_ANXIETY") {
    for (let p of co2Particles) {
      p.update(state.environment.co2, mode);
      p.display();
    }
  }

  // F. POST-PROCESADO (Filtros de Percepción)
  if (mode === "SOLASTALGIA" || mode === "ECO_ANXIETY" || state.environment.co2 > 800) {
    // Bruma mental/ambiental si hay ansiedad, solastalgia o CO2 alto
    let blurIntensity = map(state.weather.humidity, 50, 100, 1, 3) + map(state.environment.co2, 800, 1200, 0, 3, true);
    filter(BLUR, blurIntensity);
  }
}

// --- FUNCIÓN PARA DIBUJAR ONDA DE RUIDO ---
function drawNoiseWave() {
  push();
  translate(width / 2, height / 2);
  noFill();

  let noiseLevel = state.environment.noiseDb;
  let amplitude = map(noiseLevel, 40, 90, 10, 200, true);
  let colorWave = color(guiParams.baseColor);

  // Color rojo y temblor si el ruido es muy alto
  if (noiseLevel > 75) {
    colorWave = color(255, 50, 50);
    rotate(random(-0.05, 0.05));
  }
  colorWave.setAlpha(150);
  stroke(colorWave);
  strokeWeight(map(noiseLevel, 40, 90, 2, 8, true));

  beginShape();
  for (let i = 0; i < TWO_PI; i += 0.1) {
    let r = amplitude + random(-amplitude * 0.1, amplitude * 0.1); // Un poco de ruido en la onda
    let x = r * cos(i);
    let y = r * sin(i);
    vertex(x, y);
  }
  endShape(CLOSE);
  pop();
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

      // 2. Actualizar Sistema de Audio (Conexión Bio-Acústica Direccta)
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
  initCo2Particles(); // Reinicializar partículas de CO2 al cambiar tamaño
}

// Exponer globalmente para p5.js (Modo Global)
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
