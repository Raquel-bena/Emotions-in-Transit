import * as Tone from 'tone';
import { Pane } from 'tweakpane';
import { GridAgent } from '../visual/Particle.js';

// --- CONFIGURACIÓN GLOBAL ---
let agents = []; // La red de autómatas
let guiParams = {
  gridSize: 30, // Tamaño de celda en px
  showGridLines: true,
  bloomStrength: 0.5,
  baseColor: '#0b0c10'
};

// --- AUDIO VARS ---
let synth, filter, reverb;
let isAudioStarted = false;

// Estado Data (Normalizado)
let state = {
  windIndex: 0.1,
  rainIndex: 0.0,
  tempIndex: 0.5,
  mobilityIndex: 0.5
};

// --- SETUP ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Space Mono');

  // 1. SETUP GUI (Tweakpane)
  const pane = new Pane({ title: 'CONTROL_PANEL // SYS_ADMIN' });

  const f1 = pane.addFolder({ title: 'VISUAL_ENGINE' });
  f1.addBinding(guiParams, 'gridSize', { min: 10, max: 100, step: 5 }).on('change', initGrid);
  f1.addBinding(guiParams, 'showGridLines');
  f1.addBinding(guiParams, 'bloomStrength', { min: 0, max: 1 });
  f1.addBinding(guiParams, 'baseColor');

  const f2 = pane.addFolder({ title: 'DATA_OVERRIDE (Simulation)' });
  f2.addBinding(state, 'tempIndex', { min: 0, max: 1, label: 'Entropy (Temp)' });
  f2.addBinding(state, 'windIndex', { min: 0, max: 1, label: 'Vector (Wind)' });
  f2.addBinding(state, 'mobilityIndex', { min: 0, max: 1, label: 'Metabol (Pulse)' });
  f2.addBinding(state, 'rainIndex', { min: 0, max: 1, label: 'Density (Rain)' });

  // 2. AUDIO SETUP
  reverb = new Tone.Reverb({ decay: 2, wet: 0.2 }).toDestination();
  filter = new Tone.Filter(800, "lowpass").connect(reverb);
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "square" }, // Sonido más "Digital/Chip"
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.5 }
  }).connect(filter);

  // 3. INICIALIZAR GRID
  initGrid();

  // 4. UI HANDLERS
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.addEventListener('click', initAudioEngine);

  // 5. DATOS & RELOJ
  getWeatherData();
  setInterval(getWeatherData, 600000);
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
      agents.push(new GridAgent(this, px, py, guiParams.gridSize));
    }
  }
}

// --- DRAW ---
function draw() {
  background(guiParams.baseColor);

  // Dibujar Grid Lines (Estructural)
  if (guiParams.showGridLines) {
    stroke(255, 30);
    strokeWeight(1);
    // Verticales
    for (let x = 0; x <= width; x += guiParams.gridSize) line(x, 0, x, height);
    // Horizontales
    for (let y = 0; y <= height; y += guiParams.gridSize) line(0, y, width, y);
  }

  // Actualizar agetes
  for (let agent of agents) {
    agent.update(state);
    agent.display();
  }
}

// --- LOGIC ---
async function getWeatherData() {
  console.log("Fetching Data...");
  try {
    const res = await fetch('/api/weather');
    if (res.ok) {
      const data = await res.json();
      // Solo actualizamos si NO estamos "sobreescribiendo" manualmente (opcional, por ahora actualizamos siempre)
      // Para demo en Tweakpane, dejamos que los sliders manden si el usuario toca, pero aquí actualizamos la "base".
      // Vamos a actualizar UI textual pase lo que pase.
      updateDOM(data);
      // Actualizar estado solo si queremos data real
      state.tempIndex = data.tempIndex;
      state.windIndex = data.windIndex;
      // etc (simplificado para priorizar Tweakpane en demo visual, pero lógica real iría aquí)
    }
  } catch (e) {
    console.error(e);
  }
}

function updateDOM(data) {
  // Update HTML Text labels
  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };
  setTxt('temp-val', (state.tempIndex * 40).toFixed(1) + "°C");
  setTxt('wind-val', (state.windIndex * 100).toFixed(0) + " km/h");
  setTxt('mobil-val', Math.round(state.mobilityIndex * 100) + "%");
  setTxt('rain-val', state.rainIndex > 0.1 ? "HIGH" : "LOW");
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
    document.getElementById('welcome-screen').style.display = 'none';
    synth.triggerAttackRelease(["C3", "E3", "G3"], "8n");
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initGrid();
}

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
