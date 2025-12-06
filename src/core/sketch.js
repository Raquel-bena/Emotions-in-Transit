import * as Tone from 'tone';
import { Particle } from '../visual/Particle.js';

// --- CONFIGURACIÓN GLOBAL ---
let particles = [];

// --- AUDIO VARS ---
let synth;
let filter;
let reverb;
let isAudioStarted = false;

// Estado global normalizado (0.0 a 1.0)
let state = {
  windIndex: 0.1,
  rainIndex: 0.0,
  tempIndex: 0.5,
  mobilityIndex: 0.5
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

  // 2. Crear Sistema de Partículas (Flow Field Densa)
  // Aumentamos a 300 para efecto visual rico
  for (let i = 0; i < 300; i++) {
    particles.push(new Particle(this));
  }

  // 3. UI HANDLERS
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', initAudioEngine);
  }

  // 4. Pedir Datos del Clima (Inicial y periódico)
  getWeatherData();
  setInterval(getWeatherData, 600000); // 10 min

  // 5. Iniciar Reloj UI
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
    console.log("🔊 Audio System Engaged");

    // UI Transitions
    const welcome = document.getElementById('welcome-screen');
    const info = document.getElementById('info-panel');
    const legend = document.getElementById('legend-panel');

    if (welcome) welcome.classList.add('hidden');
    if (info) info.classList.add('visible');
    // Mostrar leyenda con un pequeño delay
    if (legend) setTimeout(() => legend.classList.add('visible'), 500);

    // Sonido de bienvenida
    triggerAmbientChord();
  });
}

// --- DRAW (VISUAL LOOP) ---
function draw() {
  // EFECTO DE ESTELA (TRAILS)
  // Pintamos un rectángulo semitransparente sobre el frame anterior
  // Esto hace que las partículas dejen trazo.

  // Calculamos color de fondo sutil según temperatura
  // Low Temp: Deep Blue tint | High Temp: Deep Purple tint
  let r = map(state.tempIndex, 0, 1, 5, 20);
  let g = 10;
  let b = map(state.tempIndex, 0, 1, 20, 10);

  noStroke();
  fill(r, g, b, 20); // Alpha bajito (20) para estelas largas
  rect(0, 0, width, height);

  // Actualizar partículas
  for (let p of particles) {
    p.update(state);
    p.display();
  }
}

// --- LOGICA DE DATOS ---
async function getWeatherData() {
  console.log("📡 Fetching BCN Data...");

  try {
    const url = '/api/weather';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Actualizar Estado Global
    state.windIndex = data.windIndex || 0.1;
    state.tempIndex = data.tempIndex || 0.5;
    state.rainIndex = data.rainIndex || 0.0;
    state.mobilityIndex = data.mobilityIndex || 0.5;

    // Actualizar UI HTML
    updateDOM(data);

    console.log("✅ System Updated:", data);
    updateSound();

  } catch (error) {
    console.error("❌ Data Sync Failed:", error);
    const loc = document.getElementById('location-name');
    if (loc) loc.innerText = "OFFLINE MODE";
  }
}

function updateDOM(data) {
  const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };

  setTxt('location-name', 'BARCELONA (LIVE)');
  setTxt('temp-val', (state.tempIndex * 35).toFixed(1) + "°C");
  setTxt('wind-val', (state.windIndex * 50).toFixed(1) + " km/h");
  setTxt('rain-val', state.rainIndex > 0 ? "WET" : "DRY");

  // Mobility
  const mobilPct = Math.round(state.mobilityIndex * 100);
  setTxt('mobil-val', mobilPct + "%");

  setTxt('desc-val', (data.weatherDescription || "CLEAR").toUpperCase());

  // Status Dot
  const dot = document.querySelector('.status-dot');
  if (dot) {
    dot.style.backgroundColor = state.rainIndex > 0.5 ? '#00ccff' : '#00ff88';
    dot.style.boxShadow = `0 0 10px ${dot.style.backgroundColor}`;
  }
}

// --- SONIFICACIÓN ---
function updateSound() {
  if (!isAudioStarted) return;

  // Viento -> Apertura del Filtro
  let newFreq = map(state.windIndex, 0, 1, 400, 4000);
  filter.frequency.rampTo(newFreq, 2);

  // Lluvia -> Reverb Wetness
  let newWet = map(state.rainIndex, 0, 1, 0.1, 0.9);
  reverb.wet.rampTo(newWet, 2);

  triggerAmbientChord();
}

function triggerAmbientChord() {
  let chord;
  // Acordes más complejos y ambientales
  if (state.tempIndex < 0.4) {
    chord = ["A3", "C4", "E4", "B4"]; // Minor 9
  } else if (state.tempIndex > 0.7) {
    chord = ["C4", "E4", "G4", "A4", "D5"]; // Major 6/9
  } else {
    chord = ["D4", "G4", "C5", "F5"]; // Quartal / Sus
  }

  // Duración depende de "Mobility" (más movilidad = notas más cortas/activas)
  let duration = map(state.mobilityIndex, 0, 1, "1n", "4n");
  synth.triggerAttackRelease(chord, duration);
}

// --- INTERACCIÓN ---
function mousePressed() {
  if (!isAudioStarted) return;
  // Interacción sónica simple
  filter.frequency.rampTo(8000, 0.1);
  setTimeout(() => {
    let targetFreq = map(state.windIndex, 0, 1, 400, 4000);
    filter.frequency.rampTo(targetFreq, 1);
  }, 500);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recrear sistema al redimensionar
  particles = [];
  for (let i = 0; i < 300; i++) particles.push(new Particle(this));
}

// Exponer a global para p5
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.windowResized = windowResized;
