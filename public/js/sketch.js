// Archivo: public/js/sketch.js

// --- VARIABLES GLOBALES ---
let weatherData = null;
let bikeData = null;
let particles = [];
let pulses = []; // Array para las explosiones de autobuses
let baseColor;
let windSpeed = 1;
let disruptionMode = false; // Estado de GLITCH

// Audio
let audio;

// --- CONFIGURACIÓN DE APIs (SEGURA) ---
// Ahora apuntamos a NUESTRO servidor, no a la web externa directamente
const WEATHER_URL = '/api/weather'; 
const BIKES_URL = '/api/bicing';

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent(document.body);
  
  // Audio inicia al hacer click (necesario por seguridad del navegador)
  cnv.mousePressed(startAudioContext); 

  background(0);
  baseColor = color(100); // Color inicial gris

  // Inicializar Motor de Audio (si existe la clase)
  if (typeof AudioEngine !== 'undefined') {
      audio = new AudioEngine();
  }

  // Cargar datos desde nuestro backend
  loadJSON(WEATHER_URL, onWeatherLoad);
  loadJSON(BIKES_URL, onBikesLoad);

  // SIMULACIÓN DE EVENTOS (TMB y GLITCH)
  setInterval(simulateTMBEvent, 3000); 
  setInterval(simulateDisruptionCheck, 15000);
}

function startAudioContext() {
  if (audio && audio.start) {
      audio.start();
  }
}

function draw() {
  // 1. EFECTO GLITCH (Si hay incidencia)
  if (disruptionMode) {
    background(random(10)); 
    translate(random(-5, 5), random(-2, 2)); 
  } else {
    // Fondo normal con estela (ghosting)
    fill(0, 30); 
    noStroke();
    rect(0, 0, width, height);
  }

  // Si no hay datos, mostrar carga
  if (!weatherData || !bikeData) {
    drawLoadingScreen();
    return;
  }

  drawNetwork();
  drawPulses();
  drawHUD();
}

// --- VISUALIZACIÓN ---

function drawNetwork() {
  // Efecto de brillo (Neón)
  if(!disruptionMode) {
     drawingContext.shadowBlur = 15; 
     drawingContext.shadowColor = baseColor;
  } else {
     drawingContext.shadowBlur = random(0, 50);
     drawingContext.shadowColor = color(255, 0, 0); 
  }

  strokeWeight(1);
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.update(windSpeed); // Mueve la partícula según el viento
    p.display(baseColor);
    
    // Dibujar líneas entre partículas cercanas
    for (let j = i + 1; j < particles.length; j++) {
      let other = particles[j];
      let d = dist(p.x, p.y, other.x, other.y);
      if (d < 100) { 
        let alpha = map(d, 0, 100, 150, 0);
        stroke(red(baseColor), green(baseColor), blue(baseColor), alpha);
        line(p.x, p.y, other.x, other.y);
      }
    }
  }
  drawingContext.shadowBlur = 0; // Reset
}

function drawPulses() {
  // Dibuja los círculos de los autobuses
  for (let i = pulses.length - 1; i >= 0; i--) {
    let p = pulses[i];
    p.update();
    p.display();
    if (p.dead) {
      pulses.splice(i, 1); 
    }
  }
}

function drawHUD() {
  resetMatrix(); // Resetear el temblor del glitch para el texto

  // Caja de fondo
  noStroke();
  fill(0, 150);
  rect(10, 10, 280, 200, 5);

  // Título
  fill(disruptionMode ? 'red' : '#00ff64'); 
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(BOLD);
  text(`:: EMOTIONS IN TRANSIT ::`, 25, 25);
  
  stroke(disruptionMode ? 'red' : '#00ff64');
  line(25, 45, 200, 45);
  noStroke();

  // Datos
  fill(220);
  textStyle(NORMAL);
  textSize(12);
  
  if(weatherData) {
    text(`> CLIMA: ${weatherData.weather[0].main.toUpperCase()}`, 25, 60);
    text(`  TEMP: ${weatherData.main.temp.toFixed(1)}°C`, 25, 80);
    text(`  HUMEDAD: ${weatherData.main.humidity}%`, 25, 100);
  }
  
  if(bikeData) {
     let totalBikes = 0;
     // Suma segura de bicis
     if(bikeData.network && bikeData.network.stations){
        totalBikes = bikeData.network.stations.reduce((acc, val) => acc + val.free_bikes, 0);
     }
     text(`> BICING (NODOS): ${totalBikes}`, 25, 120);
  }

  text(`> TMB LIVE FEED`, 25, 150);
  if(disruptionMode) {
      fill('red');
      text(`  ⚠️ ALERTA: RETRASOS EN METRO`, 25, 170);
  } else {
      fill('white');
      text(`  ESTADO: SERVICIO NORMAL`, 25, 170);
  }
  
  // Aviso de Audio
  if (audio && !audio.isStarted) {
      fill(0, 255, 100);
      textAlign(CENTER);
      text("[ CLICK EN PANTALLA PARA AUDIO ]", width/2, height - 50);
  }
}

function drawLoadingScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  text("SINTONIZANDO SEÑALES DE BCN...", width/2, height/2);
}

// --- CALLBACKS DE DATOS ---

function onWeatherLoad(data) {
  weatherData = data;
  let t = data.main.temp;
  // Mapeo Temperatura -> Color (Azul frio a Rojo calor)
  let r = map(t, 5, 30, 0, 255, true);
  let b = map(t, 5, 30, 255, 0, true);
  baseColor = color(r, 50, b); 
  
  // Viento -> Velocidad
  windSpeed = map(data.wind.speed, 0, 20, 0.5, 5);
  
  // Enviar dato al audio
  if(audio) audio.updateFromData(t);
}

function onBikesLoad(data) {
  bikeData = data;
  let totalBikes = 0;
  if(data.network && data.network.stations) {
      data.network.stations.forEach(s => totalBikes += s.free_bikes);
  }
  
  // Crear partículas basadas en bicis libres
  let count = constrain(totalBikes / 20, 40, 200);
  particles = []; 
  // Verificar que la clase existe antes de usarla
  if (typeof DataParticle !== 'undefined') {
      for (let i = 0; i < count; i++) {
        particles.push(new DataParticle(width, height));
      }
  } else if (typeof EmotionParticle !== 'undefined') {
      for (let i = 0; i < count; i++) {
        particles.push(new EmotionParticle(width, height));
      }
  }
}

// --- SIMULACIÓN ---

function simulateTMBEvent() {
    // Verificar que Pulse existe y audio está activo
    if (typeof Pulse !== 'undefined' && random() < 0.6) {
        let x = random(width);
        let y = random(height);
        let busColor = color(random(['#FF0000', '#00AEEF', '#B5E61D'])); // Colores TMB
        pulses.push(new Pulse(x, y, busColor));
        
        if(audio) audio.triggerBusArrival();
    }
}

function simulateDisruptionCheck() {
    if (random() < 0.3) {
        disruptionMode = true;
        if(audio) audio.setGlitchMode(true);
        
        // Volver a la normalidad después de unos segundos
        setTimeout(() => {
            disruptionMode = false;
            if(audio) audio.setGlitchMode(false);
        }, random(2000, 5000));
    }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}