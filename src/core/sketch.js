import p5 from 'p5';
// Importa Tone si lo necesitas, si no, coméntalo
// import * as Tone from 'tone'; 

// --- MODO INSTANCIA DE P5 ---
// En lugar de window.setup, creamos una "instancia" llamada 's'
const sketch = (p) => {

  // Variables del sketch
  let transportData = { congestion: 0, activeLines: 0, status: 'connecting...' };
  let currentWaveAmp = 20;
  let targetWaveAmp = 20;

  // --- SETUP ---
  p.setup = function() {
    // Usamos p.createCanvas en lugar de createCanvas
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.textFont('Courier New');
    
    // 1. Cargar datos iniciales
    fetchTransportData();
    
    // 2. Actualizar cada 5 minutos
    setInterval(fetchTransportData, 300000);
  };

  // --- DRAW ---
  p.draw = function() {
    p.background(30, 30, 35); // Fondo oscuro

    // Suavizado
    currentWaveAmp = p.lerp(currentWaveAmp, targetWaveAmp, 0.05);

    drawHeader();
    drawTransportSection();
    drawVisuals();
  };

  // --- RESIZE ---
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  // --- FUNCIONES DE DIBUJO (Internas) ---
  
  function drawHeader() {
    p.fill(255);
    p.noStroke();
    p.textSize(16);
    p.textAlign(p.LEFT, p.TOP);
    p.text("EMOTIONS IN TRANSIT [BETA]", 20, 20);
  }

  function drawTransportSection() {
    let yPos = p.height - 100;
    
    p.stroke(255, 50);
    p.line(20, yPos - 20, p.width - 20, yPos - 20);
    
    p.noStroke();
    p.fill(200);
    p.textSize(14);
    p.text(`METRO BCN | STATUS: ${transportData.status}`, 20, yPos);
    
    p.fill(100, 255, 200);
    p.text(`ACTIVE LINES: ${transportData.activeLines}`, 20, yPos + 25);
    
    // Color dinámico
    let congestionColor = p.lerpColor(p.color(100, 255, 100), p.color(255, 50, 50), transportData.congestion / 10);
    p.fill(congestionColor);
    p.text(`CONGESTION LEVEL: ${transportData.congestion}/10`, 200, yPos + 25);
  }

  function drawVisuals() {
    p.noFill();
    p.strokeWeight(2);
    
    let centerX = p.width / 2;
    let centerY = p.height / 2;

    for (let i = 0; i < 5; i++) {
      p.stroke(255, 255, 255, 150 - (i * 30));
      p.beginShape();
      for (let x = -300; x < 300; x += 10) {
        let noiseVal = p.noise(x * 0.01, p.frameCount * 0.01 + i);
        let y = p.sin(x * 0.02 + p.frameCount * 0.05) * (currentWaveAmp * noiseVal);
        p.vertex(centerX + x, centerY + y);
      }
      p.endShape();
    }
  }

  // --- FETCH (Lógica de datos) ---
  async function fetchTransportData() {
    try {
      // Importante: La ruta al servidor
      let response = await fetch('/api/transport');
      let data = await response.json();
      
      transportData.activeLines = data.activeLines;
      transportData.congestion = data.congestion;
      transportData.status = "ONLINE";

      // Actualizamos la variable de la onda con map de p5
      targetWaveAmp = p.map(data.congestion, 0, 10, 20, 200);
      
      console.log("Datos recibidos:", data);
    } catch (e) {
      console.warn("Offline Mode", e);
      transportData.status = "OFFLINE (GHOST)";
    }
  }
};

// --- INICIALIZAR P5 ---
// Esto es lo que arranca todo y conecta con el index.html
new p5(sketch);
