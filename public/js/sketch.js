let currentData = null;
let particles = []; 
let audioEngine; // <--- VARIABLE NUEVA PARA EL AUDIO

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Inicializamos el motor de audio (pero aún no suena)
  audioEngine = new AudioEngine();

  fetchData();
  setInterval(fetchData, 5000);
}

function draw() {
  background(30, 30, 30, 200); 

  if (currentData) {
    // --- ACTUALIZAR AUDIO ---
    // Le enviamos los datos al músico digital
    audioEngine.updateFromData(currentData);

    // --- GENERACIÓN DE PARTÍCULAS ---
    let spawnCount = map(currentData.mobilityIndex, 0, 1, 1, 5);
    
    if (random(1) < spawnCount) {
        let p = new Particle(width / 2, height / 2, currentData.tempIndex);
        particles.push(p);
    }

    // --- FUERZA DEL VIENTO ---
    let windStrength = map(currentData.windIndex, 0, 1, 0, 0.5);
    let wind = createVector(windStrength, 0); 

    // --- CICLO DE VIDA PARTÍCULAS ---
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.applyForce(wind);
      p.update();
      p.show();

      if (p.isDead()) {
        particles.splice(i, 1);
      }
    }

    drawHUD();
  } else {
    fill(255);
    textAlign(CENTER);
    text("Cargando sistema...", width/2, height/2);
  }
}

function drawHUD() {
    noStroke();
    fill(255);
    textAlign(LEFT);
    textSize(14);
    text(`Temp Index: ${currentData.tempIndex.toFixed(2)}`, 20, 30);
    text(`Partículas: ${particles.length}`, 20, 50);
    
    // Mensaje para que el usuario sepa que debe hacer clic
    textAlign(CENTER);
    text("Haz CLIC en la pantalla para activar el sonido", width/2, height - 50);
}

// --- EVENTO DE CLIC PARA INICIAR AUDIO ---
function mousePressed() {
    if (audioEngine) {
        audioEngine.start();
    }
}

async function fetchData() {
  try {
    const response = await fetch('/api/current-state');
    const data = await response.json();
    currentData = data;
  } catch (error) {
    console.error("Error:", error);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}