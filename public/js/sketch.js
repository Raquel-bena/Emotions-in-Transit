let currentData = null;
let particles = []; // Array para las partículas

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Pedimos datos inmediatamente y luego cada 5 segundos
  fetchData();
  setInterval(fetchData, 5000);
}

function draw() {
  // Fondo oscuro con transparencia para dejar estela (efecto visual)
  background(30, 30, 30, 200); 

  if (currentData) {
    // --- 1. GENERACIÓN DE PARTÍCULAS ---
    // MobilityIndex (0 a 1) controla cuántas nacen.
    let spawnCount = map(currentData.mobilityIndex, 0, 1, 1, 5);
    
    if (random(1) < spawnCount) {
        // Creamos la partícula usando la temperatura para el color
        let p = new Particle(width / 2, height / 2, currentData.tempIndex);
        particles.push(p);
    }

    // --- 2. FUERZA DEL VIENTO ---
    let windStrength = map(currentData.windIndex, 0, 1, 0, 0.5);
    let wind = createVector(windStrength, 0); // Viento hacia la derecha

    // --- 3. ACTUALIZAR PARTÍCULAS ---
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.applyForce(wind);
      p.update();
      p.show();

      if (p.isDead()) {
        particles.splice(i, 1);
      }
    }

    // --- 4. DATOS EN PANTALLA ---
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