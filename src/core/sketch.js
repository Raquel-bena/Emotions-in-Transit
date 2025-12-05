let weatherData;
let synth;
let windSpeed = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 1. Inicializar Audio (Tone.js)
  synth = new Tone.PolySynth(Tone.Synth).toDestination();
  
  // 2. Pedir datos (Open-Meteo para BCN)
  loadJSON(
    'https://api.open-meteo.com/v1/forecast?latitude=41.38&longitude=2.17&current_weather=true',
    gotData
  );
}

function gotData(data) {
  weatherData = data;
  windSpeed = data.current_weather.windspeed;
  
  // Mapear viento a sonido
  // Si hay mucho viento, tocamos una nota más aguda o rápida
  let pitch = map(windSpeed, 0, 50, 200, 800); 
  
  // IMPORTANTE: El audio requiere interacción del usuario primero
  // Esto es solo demostrativo
}

function draw() {
  background(30);
  
  if (weatherData) {
    // Visualizar Viento
    noStroke();
    fill(100, 200, 255, 150);
    
    // El viento define el tamaño y la agitación
    let size = map(windSpeed, 0, 50, 50, 300);
    let shake = random(-windSpeed, windSpeed);
    
    ellipse(width/2 + shake, height/2 + shake, size);
    
    // Texto informativo
    fill(255);
    textAlign(CENTER);
    text(`Viento en BCN: ${windSpeed} km/h`, width/2, height - 50);
  } else {
    text("Cargando datos de Barcelona...", width/2, height/2);
  }
}

function mousePressed() {
  // Activar audio al hacer clic (Requisito de navegadores)
  Tone.start();
  // Tocar un acorde basado en la temperatura (ejemplo conceptual)
  synth.triggerAttackRelease(["C4", "E4", "G4"], "8n");
}
