import * as Tone from 'tone';
import { Particle } from '../visual/Particle.js';

// --- CONFIGURACIÓN GLOBAL ---
let particles = [];
let weatherData = null;

// --- AUDIO VARS ---
let synth;
let filter;
let reverb;
let isAudioStarted = false;

// Estado global normalizado (0.0 a 1.0)
let state = {
  windIndex: 0.1,
  rainIndex: 0.0,
  tempIndex: 0.5
};

// --- SETUP ---
function setup() {
  createCanvas(windowWidth, windowHeight);

  // 1. Configurar Cadena de Audio (Tone.js)
  reverb = new Tone.Reverb({
    decay: 3,
    wet: 0.2
  }).toDestination();

  filter = new Tone.Filter({
    type: "lowpass",
    frequency: 400,
    Q: 1
  }).connect(reverb);

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 3, spread: 30 },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 2 }
  }).connect(filter);

  // 2. Crear Sistema de Partículas
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle(this));
  }

  // 3. UI HANDLERS (Premium Interface)
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', initAudioEngine);
  }

  // 4. Pedir Datos del Clima
  getWeatherData();
  setInterval(getWeatherData, 600000);

  // 5. Iniciar Reloj Digital
  setInterval(updateClock, 1000);
  updateClock();
}

// --- CLOCK & DATE ---
function updateClock() {
  const now = new Date();

  // Time: HH:MM
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const clockEl = document.getElementById('clock-display');
  if (clockEl) clockEl.innerText = timeStr;

  // Date: Weekday, Month Day
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const dateEl = document.getElementById('date-display');
  if (dateEl) dateEl.innerText = dateStr.toUpperCase();
}

// --- AUDIO INIT HANDLER ---
function initAudioEngine() {
  if (isAudioStarted) return;

  Tone.start().then(() => {
    isAudioStarted = true;
    console.log("🔊 Audio Context Iniciado");

    // UI Transitions
    const welcome = document.getElementById('welcome-screen');
    const info = document.getElementById('info-panel');

    if (welcome) welcome.classList.add('hidden');
    if (info) info.classList.add('visible');

    // Sonido de bienvenida
    triggerAmbientChord();
  });
}

// --- DRAW ---
function draw() {
  // Fondo dinámico
  let bgBlue = map(state.tempIndex, 0, 1, 60, 20);
  let bgRed = map(state.tempIndex, 0, 1, 20, 60);
  background(bgRed, 30, bgBlue);

  // Actualizar partículas
  for (let p of particles) {
    p.update(state);
    p.display();
  }

  // (Removed text drawing in favor of HTML UI)
}

// --- LOGICA DE DATOS ---
async function getWeatherData() {
  console.log("📡 Solicitando datos a API Local...");

  try {
    const url = '/api/weather';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Actualizar Estado
    state.windIndex = data.windIndex;
    state.tempIndex = data.tempIndex;
    state.rainIndex = data.rainIndex;
    if (data.mobilityIndex !== undefined) state.mobilityIndex = data.mobilityIndex;

    // Actualizar UI HTML
    updateDOM(data);

    console.log("✅ Clima Actualizado:", data);
    updateSound();

  } catch (error) {
    console.error("❌ Error API:", error);
    // UI Feedback de error
    const loc = document.getElementById('location-name');
    if (loc) loc.innerText = "Offline / Simulado";
    state.windIndex = 0.5;
  }
}

function updateDOM(data) {
  // Helper para actualizar textos si existen
  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };

  setTxt('location-name', 'Barcelona (Live)');
  setTxt('temp-val', (data.tempIndex * 35).toFixed(1) + "°C");
  setTxt('wind-val', (data.windIndex * 50).toFixed(1) + " km/h");
  setTxt('rain-val', data.rainIndex > 0 ? "Rain" : "Dry");

  // Mobility (Urban Pulse)
  const mobility = data.mobilityIndex !== undefined ? Math.round(data.mobilityIndex * 100) : 50;
  setTxt('mobil-val', mobility + "%");

  setTxt('desc-val', data.weatherDescription || "Clear Sky");

  // Status Dot Color
  const dot = document.querySelector('.status-dot');
  if (dot) {
    dot.style.backgroundColor = state.rainIndex > 0.5 ? '#00ccff' : '#00ff88';
    dot.style.boxShadow = `0 0 10px ${dot.style.backgroundColor}`;
  }
}

// --- SONIFICACIÓN ---
function updateSound() {
  if (!isAudioStarted) return;

  // Viento -> Filtro
  let newFreq = map(state.windIndex, 0, 1, 400, 3000);
  filter.frequency.rampTo(newFreq, 2);

  // Lluvia -> Reverb
  let newWet = map(state.rainIndex, 0, 1, 0.1, 0.9);
  reverb.wet.rampTo(newWet, 2);

  // Temperatura -> Acordes
  triggerAmbientChord();
}

function triggerAmbientChord() {
  let chord;
  if (state.tempIndex < 0.4) {
    chord = ["A3", "C4", "E4", "B4"]; // Frío/Menor
  } else if (state.tempIndex > 0.7) {
    chord = ["C4", "E4", "G4", "D5"]; // Calor/Mayor
  } else {
    chord = ["D4", "G4", "A4", "D5"]; // Templado/Sus
  }
  synth.triggerAttackRelease(chord, "2n");
}

// --- INTERACCIÓN ---
function mousePressed() {
  if (!isAudioStarted) return;

  // Click = Ráfaga de viento
  let originalWind = state.windIndex;
  filter.frequency.rampTo(5000, 0.5);
  setTimeout(() => {
    let targetFreq = map(originalWind, 0, 1, 400, 3000);
    filter.frequency.rampTo(targetFreq, 2);
  }, 1000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  particles = [];
  for (let i = 0; i < 100; i++) particles.push(new Particle(this));
}

// Exponer a window para p5 Global Mode
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.windowResized = windowResized;
