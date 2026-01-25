// UBICACIÓN: src/sketch.js

let weatherData = null;
let transportData = null;
let noiseData = null;
let loading = true;

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  fetchCityData();
}

async function fetchCityData() {
  try {
    // Pedimos los 3 datos en paralelo (más rápido)
    const [weatherRes, tmbRes, noiseRes] = await Promise.all([
      fetch(`${API_URL}/weather/current`),
      fetch(`${API_URL}/tmb/transport`),
      fetch(`${API_URL}/noise/current`)
    ]);

    weatherData = await weatherRes.json();
    transportData = await tmbRes.json();
    noiseData = await noiseRes.json();

    console.log("Datos recibidos:", { weatherData, transportData, noiseData });
    loading = false;
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    loading = false;
  }
}

function draw() {
  background(20);

  if (loading) {
    fill(255);
    text("Sincronizando con la ciudad...", width/2, height/2);
    return;
  }

  // --- 1. CAPA DE RUIDO (Vibración del fondo) ---
  // Si hay mucho ruido, la pantalla tiembla
  let shake = 0;
  if (noiseData) {
    // Mapeamos dB (aprox 40-90) a vibración (0-5px)
    shake = map(noiseData.db, 40, 90, 0, 5, true); 
  }
  
  push();
  translate(random(-shake, shake), random(-shake, shake)); // Efecto terremoto

  // --- 2. CAPA DE CLIMA (Atmósfera central) ---
  if (weatherData) {
    // Temperatura define el color
    let r = map(weatherData.temp, 0, 35, 50, 255);
    let b = map(weatherData.temp, 0, 35, 255, 50);
    
    noStroke();
    // Efecto de "respiración" suave
    let pulse = sin(millis() / 1000) * 10;
    
    fill(r, 50, b, 100); // Color semitransparente
    circle(width/2, height/2, 300 + pulse);
    
    fill(255);
    textSize(40);
    text(`${weatherData.temp}°C`, width/2, height/2);
    textSize(16);
    text(weatherData.condition, width/2, height/2 + 40);
  }

  // --- 3. CAPA DE TRANSPORTE (Satélites) ---
  if (transportData) {
    let congestion = transportData.congestion;
    let speed = map(congestion, 1, 10, 0.02, 0.15);
    
    noFill();
    stroke(255, 200, 0);
    strokeWeight(2);
    
    // Anillo orbital
    circle(width/2, height/2, 450);

    // Partículas de tráfico
    fill(255, 200, 0);
    noStroke();
    
    let time = millis() * speed;
    for(let i = 0; i < congestion; i++) {
      let angle = (TWO_PI / congestion) * i + time;
      let x = width/2 + cos(angle) * 225; // Radio 225 (mitad de 450)
      let y = height/2 + sin(angle) * 225;
      
      // El tamaño del transporte cambia con el RUIDO también
      let size = 20 + shake * 5; 
      circle(x, y, size);
    }
    
    // Info abajo
    fill(150);
    noStroke();
    text(`Tráfico: ${congestion}/10  |  Ruido: ${noiseData ? noiseData.db.toFixed(1) : '?'} dB`, width/2, height - 50);
  }

  pop(); // Fin del efecto temblor
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}