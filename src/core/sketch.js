import * as Tone from 'tone';
import { Pane } from 'tweakpane';
import { GridAgent } from '../visual/Particle.js';

// --- CONFIGURACIÓN GLOBAL ---
let agents = [];
let guiParams = {
  gridSize: 30,
  showGridLines: true,
  bloomStrength: 0.5,
  baseColor: '#0b0c10'
};

// --- AUDIO (Placeholder) ---
let synth, filter, reverb;
let isAudioStarted = false;

// --- ESTADO BIOMÉTRICO (Espejo del backend) ---
let state = {
  meta: { period: 'Ld', timestamp: 0 },
  weather: { temp: 20, humidity: 50, windSpeed: 10, windDir: 0, rain: 0 },
  environment: { noiseDb: 50, airQuality: 10 },
  transport: { congestion: 5, flowRhythm: 0.5 }
};

// --- SETUP ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Space Mono');

  // 1. SETUP GUI (Tweakpane)
  const pane = new Pane({ title: 'BIOMETRIC_CITY_CORE' });

  const fView = pane.addFolder({ title: 'VIEWPORT' });
  fView.addBinding(guiParams, 'gridSize', { min: 15, max: 60, step: 5 }).on('change', initGrid);
  fView.addBinding(guiParams, 'showGridLines');

  const fData = pane.addFolder({ title: 'LIVE DATA (Read-Only / Override)' });
  // Weather
  fData.addBinding(state.weather, 'temp', { min: 0, max: 40, label: 'Temp °C' });
  fData.addBinding(state.weather, 'humidity', { min: 0, max: 100, label: 'Humidity %' });
  fData.addBinding(state.weather, 'windSpeed', { min: 0, max: 100, label: 'Wind km/h' });
  // Environment
  fData.addBinding(state.environment, 'noiseDb', { min: 30, max: 100, label: 'Noise dB' });
  fData.addBinding(state.environment, 'airQuality', { min: 0, max: 50, label: 'PM2.5' });
  // Transport
  fData.addBinding(state.transport, 'congestion', { min: 0, max: 10, label: 'Traffic Idx' });

  // 2. EVENTS
  const startBtn = document.getElementById('start-btn');
  if (startBtn) startBtn.addEventListener('click', initAudioEngine);

  // 3. INIT
  initGrid();

  // 4. DATA POLLING
  getWeatherData();
  setInterval(getWeatherData, 10000); // 10s polling
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

// --- DRAW ---
function draw() {
  // 1. BACKGROUND CHANGE based on Time of Day (Period)
  if (state.meta.period === 'Ln') background(5, 5, 10); // Noche profunda
  else if (state.meta.period === 'Le') background(20, 10, 15); // Tarde/Noche
  else background(guiParams.baseColor); // Día (Default)

  // 2. GRID
  if (guiParams.showGridLines) {
    stroke(255, 15);
    strokeWeight(1);
    for (let x = 0; x <= width; x += guiParams.gridSize) line(x, 0, x, height);
    for (let y = 0; y <= height; y += guiParams.gridSize) line(0, y, width, y);
  }

  // 3. AGENTS UPDATE
  // Pasamos el estado COMPLETO
  for (let agent of agents) {
    agent.update(state);
    agent.display();
  }

  // 4. GLOBAL EFFECTS (Post-Process)
  // Humidity -> Blur
  // > 70% humidity starts blurring
  if (state.weather.humidity > 60) {
    let blurAmt = map(state.weather.humidity, 60, 100, 0, 4);
    filter(BLUR, blurAmt);
  }
}

// --- LOGIC ---
async function getWeatherData() {
  try {
    const res = await fetch('/api/weather');
    if (res.ok) {
      const data = await res.json();
      // MERGE data safely update UI logic
      // Note: In a real app we might want to smoothly interpolate these values
      Object.assign(state.meta, data.meta);
      Object.assign(state.weather, data.weather);
      Object.assign(state.environment, data.environment);
      Object.assign(state.transport, data.transport);

      updateDOM();
    }
  } catch (e) {
    console.error("Fetch Data Error:", e);
  }
}

function updateDOM() {
  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.innerText = v; };

  // Left Panel Monitor
  setTxt('temp-val', state.weather.temp.toFixed(1) + "°C");
  setTxt('wind-val', state.weather.windSpeed.toFixed(0) + " km/h");
  setTxt('mobil-val', state.transport.congestion.toFixed(1) + " / 10");

  // Environment (New IDs might be needed in HTML or reuse slots)
  // Reuse "rain-val" for Noise momentarily or add new items dynamically?
  // For now let's map logic to existing slots if available, or just rely on GUI.
  setTxt('rain-val', state.environment.noiseDb.toFixed(0) + " dB");
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
