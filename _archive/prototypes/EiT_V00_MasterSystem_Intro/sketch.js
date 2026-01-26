/**
 * PROJECT: EMOTIONS (IN) TRANSIT
 * VERSION: V00 - Final MasterSystem (Solid Loop Edition)
 * NOTE: Implements sub-pixel overlap for seamless coverage.
 */

const CONFIG = {
  aspectRatio: 1080 / 1350,
  palette: {
    bg: "#ffffff",       // Fondo base (no se debería ver)
    main: "#0e0e0e",     // Onyx
    secondary: "#939393",// Grey Olive
    action: "#ff4000",   // Blazing Flame
    scan: "#02eaff",     // Electric Aqua
    deep: "#ee01ff",     // Neon Violet
    status: "#15f70d"    // Lime
  },
  kinetic: {
    rows: 10,
    words: ["(in)", "data", "bcn", "weather", "noise", "transit", "public", "real-time", "pulse", "system"]
  }
};

const FULL_PALETTE = [CONFIG.palette.main, CONFIG.palette.secondary, CONFIG.palette.action, CONFIG.palette.scan, CONFIG.palette.deep, CONFIG.palette.status];

let connectorFont, contentFont;
let rows = [];

function preload() {
  connectorFont = loadFont('assets/CascadiaCode-Regular.ttf');
  contentFont = loadFont('assets/Inter_18pt-Medium.ttf');
}

function setup() {
  // Configuración de Renderizado de Máxima Calidad
  if (typeof P5Capture !== 'undefined') {
    P5Capture.setDefaultOptions({
      format: "webm",
      framerate: 60,
      bitrate: 60000, // 60 Mbps: Calidad extrema para colores sólidos
      quality: 1,
      width: 1080,
      height: 1350,
    });
  }

  let canvasDim = calculateCanvasDimensions();
  createCanvas(canvasDim.w, canvasDim.h);
  
  // Inicializar el sistema directamente en estado de loop
  initializeKineticSystem();
}

function draw() {
  // Aunque el fondo no se vea, lo pintamos por seguridad
  background(CONFIG.palette.bg);
  
  // No dibujamos la grilla técnica debajo para asegurar cobertura total de los bloques
  // drawTechnicalGrid(); 
  
  rows.forEach(row => {
    row.update();
    row.display();
  });

  drawHUD();
}

// --- SISTEMA DE CADENA SÓLIDA (SOLID CHAIN LOGIC) ---

class KineticRow {
  constructor(y, h, dir) {
    this.y = y; this.h = h; this.dir = dir;
    this.speed = (width * 0.003) * this.dir; // Velocidad ajustada para fluidez
    this.blocks = [];
    this.fillRow();
  }

  fillRow() {
    // Generamos bloques mucho más allá de los bordes para asegurar el loop
    let currentX = -width * 0.75;
    while (currentX < width * 1.75) {
      let b = this.createBlock(currentX);
      this.blocks.push(b);
      // Usamos el ancho exacto para la lógica matemática
      currentX += b.w; 
    }
  }

  createBlock(x) {
    let word = random(CONFIG.kinetic.words);
    textFont(word === "(in)" ? connectorFont : contentFont);
    textSize(this.h * 0.45);
    // Cálculo preciso del ancho matemático
    let w = textWidth(word) + (width * 0.1);
    return new TextBlock(word, x, this.y, w, this.h);
  }

  update() {
    this.blocks.forEach(b => b.x += this.speed);

    // Lógica de Re-posicionamiento exacto (Chain Wrapping)
    if (this.dir > 0) { // Derecha
      if (this.blocks[0].x > width) {
        let b = this.blocks.shift();
        let last = this.blocks[this.blocks.length - 1];
        // Se pega matemáticamente al final
        b.x = last.x - b.w;
        this.blocks.push(b);
      }
    } else { // Izquierda
      let last = this.blocks[this.blocks.length - 1];
      if (last.x + last.w < 0) {
        let b = this.blocks.pop();
        let first = this.blocks[0];
        // Se pega matemáticamente al principio
        b.x = first.x + first.w;
        this.blocks.unshift(b);
      }
    }
  }

  display() {
    this.blocks.forEach(b => b.display());
  }
}

class TextBlock {
  constructor(word, x, y, w, h) {
    this.word = word; this.x = x; this.y = y; this.w = w; this.h = h;
    this.isConnector = (word === "(in)");
    this.updateStyle();
    this.timer = millis() + random(2000, 5000);
  }

  updateStyle() {
    this.bgColor = color(random(FULL_PALETTE));
    // Cálculo de luminancia para contraste de texto
    const lum = (0.2126 * red(this.bgColor) + 0.7152 * green(this.bgColor) + 0.0722 * blue(this.bgColor)) / 255;
    this.txtColor = (lum > 0.5) ? color(CONFIG.palette.main) : color(255);
  }

  display() {
    if (millis() > this.timer) { this.updateStyle(); this.timer = millis() + random(2000, 5000); }
    
    push();
    translate(this.x, this.y);
    noStroke();
    fill(this.bgColor);
    
    // --- EL FIX CRÍTICO PARA COBERTURA TOTAL ---
    // Dibujamos el rectángulo 0.8 píxeles más ancho para solapar
    // sutilmente el siguiente bloque y tapar cualquier hueco del fondo.
    rect(0, 0, this.w + 0.8, this.h);
    // -------------------------------------------

    fill(this.txtColor);
    textAlign(CENTER, CENTER);
    textFont(this.isConnector ? connectorFont : contentFont);
    textSize(this.h * 0.42);
    text(this.word, this.w / 2, this.h / 2);
    pop();
  }
}

// --- RESPONSIVE & UTILS ---

function calculateCanvasDimensions() {
  let w, h;
  // Ajuste responsive dejando un pequeño margen en el navegador
  if (windowWidth / windowHeight > CONFIG.aspectRatio) {
    h = windowHeight * 0.95; w = h * CONFIG.aspectRatio;
  } else {
    w = windowWidth * 0.95; h = w / CONFIG.aspectRatio;
  }
  return { w, h };
}

function windowResized() {
  let dims = calculateCanvasDimensions();
  resizeCanvas(dims.w, dims.h);
  initializeKineticSystem();
}

function initializeKineticSystem() {
  rows = [];
  let rowH = height / CONFIG.kinetic.rows;
  for (let i = 0; i < CONFIG.kinetic.rows; i++) {
    // Alternar dirección y velocidad ligeramente para dinamismo
    let dir = i % 2 === 0 ? 1 : -1;
    rows.push(new KineticRow(i * rowH, rowH, dir));
  }
}

function drawHUD() {
  // HUD minimalista que no moleste al loop
  fill(CONFIG.palette.main); 
  textFont(connectorFont); 
  textSize(12);
  textAlign(LEFT); 
  text(`[ REC: READY ]`, 20, 30);
}

function keyPressed() {
  if (key === 'f' || key === 'F') fullscreen(!fullscreen());
}