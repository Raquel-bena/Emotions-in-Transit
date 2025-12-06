import * as Tone from 'tone';
import { Particle } from '../visual/Particle.js'; // Importamos tu clase arreglada

// CONFIGURACIÓN
// NOTA: En Vite, las variables de entorno deben empezar por VITE_ para ser visibles.
// Si no te funciona el .env, pega tu clave aquí abajo temporalmente entre comillas.
const API_KEY = import.meta.env.VITE_OWM_KEY || 'PEGA_TU_CLAVE_AQUI_SI_FALLA_ENV'; 
const CITY_ID = '3128740'; // Barcelona

let particles = [];
let weatherData = null;
let synth;
let isAudioStarted = false;

// Estado global que pasaremos a las partículas
let state = {
  windIndex: 0.1, // 0.0 a 1.0
  rainIndex: 0.0,
  tempIndex: 0.5
};

// --- SETUP ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 1. Inicializar Sintetizador (Tone.js)
  // Usamos un sintetizador polifónico para acordes
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 1.5 }
  }).toDestination();

  // 2. Crear Sistema de Partículas
  // Creamos 100 partículas usando tu clase
  for (let i = 0; i < 100; i++) {
    // Pasamos 'this' porque tu clase Particle espera (p) en el constructor
    particles.push(new Particle(this));
  }

  // 3. Pedir Datos del Clima
  getWeatherData();
  // Actualizar cada 10 minutos
  setInterval(getWeatherData, 600000);
}

// --- DRAW ---
function draw() {
  background(30, 30, 40); // Fondo oscuro "noche en BCN"

  // Si no hay audio iniciado, mostramos aviso
  if (!isAudioStarted) {
    fill(255);
    textAlign(CENTER);
    textSize(16);
    text("HAZ CLICK PARA INICIAR LA EXPERIENCIA SONORA", width/2, height/2);
  }

  // Actualizar y dibujar cada partícula
  for (let p of particles) {
    p.update(state);  // Le pasamos el estado del clima
    p.display();      // La dibujamos
  }
  
  // Debug visual del clima
  displayWeatherInfo();
}

// --- LOGICA DE DATOS ---
async function getWeatherData() {
  console.log("📡 Solicitando datos a OpenWeatherMap...");
  
  try {
    // Usamos fetch moderno
    const url = `https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) throw new Error(data.message);

    weatherData = data;
    
    // -- MAPEAMOS DATOS REALES A NUESTRO ESTADO --
    
    // Viento: OpenWeather da m/s, lo normalizamos (0 a 20 m/s)
    state.windIndex = map(data.wind.speed, 0, 20, 0, 1, true);
    
    // Temperatura: -5 a 35 grados
    state.tempIndex = map(data.main.temp, -5, 35, 0, 1, true);
    
    // Lluvia: Si hay 'rain' en el objeto, subimos el índice
    if (data.rain) {
       state.rainIndex = 0.8; 
    } else {
       state.rainIndex = 0.0;
    }

    console.log("✅ Datos actualizados:", data.name, data.main.temp + "°C", "Viento idx:", state.windIndex);
    
    // Si el audio está activo, actualizamos el sonido del ambiente aquí
    updateSound();

  } catch (error) {
    console.error("❌ Error API:", error);
    // Modo Fallback: Simulación suave si falla la API
    state.windIndex = 0.2;
  }
}

// --- INTERACCIÓN ---
function mousePressed() {
  if (!isAudioStarted) {
    Tone.start();
    isAudioStarted = true;
    console.log("🔊 Audio Context Iniciado");
    
    // Acorde de bienvenida
    synth.triggerAttackRelease(["C4", "E4", "G4"], "1n");
  }
  
  // Interactividad extra: ráfaga de viento al hacer clic
  state.windIndex = 1.0;
  setTimeout(() => { state.windIndex = map(weatherData?.wind?.speed || 5, 0, 20, 0, 1); }, 1000);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reiniciar partículas al cambiar tamaño
  for (let p of particles) p.reset();
}

function displayWeatherInfo() {
  if (weatherData) {
    fill(255);
    noStroke();
    textAlign(LEFT);
    textSize(12);
    text(`BCN: ${weatherData.main.temp}°C`, 20, height - 40);
    text(`Viento: ${weatherData.wind.speed} m/s`, 20, height - 20);
  }
}

// Exponer funciones a p5 globalmente
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.windowResized = windowResized;
