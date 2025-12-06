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
  // Ruta de señal: Synth -> Filter -> Reverb -> Master
  
  reverb = new Tone.Reverb({
    decay: 3,
    wet: 0.2
  }).toDestination();

  filter = new Tone.Filter({
    type: "lowpass",
    frequency: 400, // Empieza cerrado (opaco)
    Q: 1
  }).connect(reverb);

  synth = new Tone.PolySynth(Tone.Synth, {
    // fatsawtooth suena más rico y atmosférico que triangle
    oscillator: { type: "fatsawtooth", count: 3, spread: 30 }, 
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 2 }
  }).connect(filter);

  // 2. Crear Sistema de Partículas
  for (let i = 0; i < 100; i++) {
    // Nota: 'this' es el contexto de p5. Si tu clase Particle lo necesita, está bien.
    particles.push(new Particle(this)); 
  }

  // 3. Pedir Datos del Clima
  getWeatherData();
  // Actualizar cada 10 minutos
  setInterval(getWeatherData, 600000);
}

// --- DRAW ---
function draw() {
  // Fondo dinámico sutil según temperatura (opcional)
  // Frío = más azul (30, 30, 50), Calor = más rojizo (50, 30, 30)
  let bgBlue = map(state.tempIndex, 0, 1, 60, 20);
  let bgRed = map(state.tempIndex, 0, 1, 20, 60);
  background(bgRed, 30, bgBlue);

  // Aviso de Audio
  if (!isAudioStarted) {
    fill(255);
    textAlign(CENTER);
    textSize(16);
    text("HAZ CLICK PARA INICIAR EL SONIDO", width / 2, height / 2);
  }

  // Actualizar partículas
  for (let p of particles) {
    p.update(state);
    p.display();
  }

  displayWeatherInfo();
}

// --- LOGICA DE DATOS ---
async function getWeatherData() {
  console.log("📡 Solicitando datos a Backend Local...");

  try {
    const url = '/api/weather'; // Tu endpoint local
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // Actualizar Estado
    state.windIndex = data.windIndex;
    state.tempIndex = data.tempIndex;
    state.rainIndex = data.rainIndex;

    // Guardar info para UI
    if (!weatherData) weatherData = {};
    weatherData.tempDisplay = (data.tempIndex * 35).toFixed(1); // Aprox visual
    weatherData.windDisplay = (data.windIndex * 50).toFixed(1); // Aprox visual
    weatherData.desc = data.weatherDescription || "Desconocido";

    console.log("✅ Clima Actualizado:", data);

    // SONIFICACIÓN: El clima cambia el sonido
    updateSound();

  } catch (error) {
    console.error("❌ Error API:", error);
    // Fallback para pruebas si falla el servidor
    state.windIndex = 0.5;
  }
}

// --- SONIFICACIÓN (NUEVA FUNCIÓN) ---
function updateSound() {
  if (!isAudioStarted) return;

  console.log("🎵 Actualizando parámetros de sonido...");

  // 1. VIENTO controla el FILTRO (Cutoff Frequency)
  // Viento bajo = sonido opaco (400Hz). Viento alto = sonido brillante y silbante (3000Hz).
  let newFreq = map(state.windIndex, 0, 1, 400, 3000);
  // rampTo hace el cambio suave en 2 segundos para evitar "pops"
  filter.frequency.rampTo(newFreq, 2); 

  // 2. LLUVIA controla el REVERB (Wetness)
  // Más lluvia = más ambiente "mojado" y eco (wet)
  let newWet = map(state.rainIndex, 0, 1, 0.1, 0.9);
  reverb.wet.rampTo(newWet, 2);

  // 3. TEMPERATURA elige la ARMONÍA (Acorde)
  triggerAmbientChord();
}

function triggerAmbientChord() {
  // Lógica musical simple basada en temperatura
  let chord;
  
  if (state.tempIndex < 0.4) {
    // FRÍO: Acorde Menor, registro más grave y melancólico
    // Ej: La Menor (A3, C4, E4)
    chord = ["A3", "C4", "E4", "B4"]; 
  } else if (state.tempIndex > 0.7) {
    // CALOR: Acorde Mayor, registro más agudo y brillante
    // Ej: Do Mayor (C4, E4, G4)
    chord = ["C4", "E4", "G4", "D5"];
  } else {
    // TEMPLADO: Acorde Suspendido o neutro (ni feliz ni triste)
    chord = ["D4", "G4", "A4", "D5"];
  }

  // Tocar el acorde suavemente
  // '4n' significa duración de una negra
  synth.triggerAttackRelease(chord, "2n");
}

// --- INTERACCIÓN ---
function mousePressed() {
  if (!isAudioStarted) {
    Tone.start();
    isAudioStarted = true;
    console.log("🔊 Audio Iniciado");
    updateSound(); // Forzar primer sonido
  }
  
  // Interacción extra: Click = Ráfaga de viento momentánea
  let originalWind = state.windIndex;
  // Simular viento máximo
  filter.frequency.rampTo(5000, 0.5); // "Woosh" rápido

  // Volver a la normalidad después de 1 segundo
  setTimeout(() => { 
    // Recalcular frecuencia basada en el clima real
    let targetFreq = map(originalWind, 0, 1, 400, 3000);
    filter.frequency.rampTo(targetFreq, 2);
  }, 1000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  particles = []; // Reiniciar array
  for (let i = 0; i < 100; i++) particles.push(new Particle(this));
}

function displayWeatherInfo() {
  if (weatherData) {
    fill(255);
    noStroke();
    textAlign(LEFT);
    textSize(14);
    text(`🌡️ Temp: ~${weatherData.tempDisplay}°C`, 20, height - 60);
    text(`💨 Viento: ~${weatherData.windDisplay} km/h`, 20, height - 40);
    text(`☁️ ${weatherData.desc}`, 20, height - 20);
  }
}

// Exponer a window para p5
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.windowResized = windowResized;
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3000' // O el puerto donde corra tu node server.js
    }
  }
}
