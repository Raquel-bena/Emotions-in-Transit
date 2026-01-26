/**
 * PROJECT: EMOTIONS (IN) TRANSIT
 * AUTHOR: Rb.Graphicx
 * VERSION: V01 - Final Production (Solid Loop)
 */

const CONFIG = {
  aspectRatio: 1080 / 1350,
  palette: {
    bg: "#ffffff",       // Fondo Blanco puro
    main: "#0e0e0e",     // Onyx
    secondary: "#939393",// Grey Olive
    action: "#ff4000",   // Blazing Flame
    scan: "#02eaff",     // Electric Aqua
    deep: "#ee01ff",     // Neon Violet
    status: "#15f70d"    // Lime
  },
  kinetic: {
    rows: 10,
    words: ["(in)", "data", "(in)", "bcn", "(in)", "weather", "(in)", "noise", "(in)", "transit", "(in)", "pulse"]
  }
};

const FULL_PALETTE = [CONFIG.palette.main, CONFIG.palette.secondary, CONFIG.palette.action, CONFIG.palette.scan, CONFIG.palette.deep, CONFIG.palette.status];

let connectorFont, contentFont;
let rows = [];

function preload() {
  // Asegúrate de que los nombres de archivo coincidan exactamente
  connectorFont = loadFont('assets/CascadiaCode-Regular.ttf');
  contentFont = loadFont('assets/Inter_18pt-Medium.ttf');
}

function setup() {
  // 1. CONFIGURACIÓN DEL RENDERIZADOR (Si la librería carga correctamente)
  if (typeof P5Capture !== 'undefined') {
    P5Capture.setDefaultOptions({
      format: "webm",
      framerate: 60,
      bitrate: 60000, // 60 Mbps para evitar artefactos en colores sólidos
      quality: 1,
      width: 1080,
      height: 1350,
    });
  }

  // 2. CREACIÓN DEL CANVAS RESPONSIVE
  let canvasDim = getResponsiveSize();
  const c = createCanvas(canvasDim.w, canvasDim.h);
  
  initializeKineticSystem();
}

function draw() {
  background(CONFIG.palette.bg);
  
  // Dibujamos las filas
  rows.forEach(row => {
    row.update();
    row.display();
  });

  // HUD informativo
  drawHUD();
}

// --- LÓGICA DE CADENA INFINITA (CERO SOLAPAMIENTO) ---

class KineticRow {
  constructor(y, h, dir) {
    this.y = y; this.h = h; this.dir = dir;
    this.speed = (width * 0.0025) * this.dir;
    this.blocks = [];
    this.fillRow();
  }

  fillRow() {
    let currentX = -width * 0.75;
    while (currentX < width * 1.75) {
      let b = this.createBlock(currentX);
      this.blocks.push(b);
      currentX += b.w; // Posicionamiento matemático exacto
    }
  }

  createBlock(x) {
    let word = random(CONFIG.kinetic.words);
    textFont(word === "(in)" ? connectorFont : contentFont);
    textSize(this.h * 0.45);
    let w = textWidth(word) + (width * 0.12);
    return new TextBlock(word, x, this.y, w, this.h);
  }

  update() {
    this.blocks.forEach(b => b.x += this.speed);

    // Reposicionamiento en cadena
    if (this.dir > 0) {
      if (this.blocks[0].x > width) {
        let b = this.blocks.shift();
        let last = this.blocks[this.blocks.length - 1];
        b.x = last.x - b.w;
        this.blocks.push(b);
      }
    } else {
      let last = this.blocks[this.blocks.length - 1];
      if (last.x + last.w < 0) {
        let b = this.blocks.pop();
        let first = this.blocks[0];
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
    this.timer = millis() + random(3000, 7000);
  }

  updateStyle() {
    this.bgColor = color(random(FULL_PALETTE));
    const lum = (0.2126 * red(this.bgColor) + 0.7152 * green(this.bgColor) + 0.0722 * blue(this.bgColor)) / 255;
    this.txtColor = (lum > 0.5) ? color(CONFIG.palette.main) : color(255);
  }

  display() {
    if (millis() > this.timer) { this.updateStyle(); this.timer = millis() + random(3000, 7000); }
    
    push();
    translate(this.x, this.y);
    noStroke();
    fill(this.bgColor);
    
    // FIX DE COBERTURA: +0.8px para sellar micro-huecos
    rect(0, 0, this.w + 0.8, this.h);

    fill(this.txtColor);
    textAlign(CENTER, CENTER);
    textFont(this.isConnector ? connectorFont : contentFont);
    textSize(this.h * 0.42);
    text(this.word, this.w / 2, this.h / 2);
    pop();
  }
}

// --- SOPORTE Y RESPONSIVE ---

function getResponsiveSize() {
  let w, h;
  if (windowWidth / windowHeight > CONFIG.aspectRatio) {
    h = windowHeight * 0.95; w = h * CONFIG.aspectRatio;
  } else {
    w = windowWidth * 0.95; h = w / CONFIG.aspectRatio;
  }
  return { w, h };
}

function windowResized() {
  let dims = getResponsiveSize();
  resizeCanvas(dims.w, dims.h);
  initializeKineticSystem();
}

function initializeKineticSystem() {
  rows = [];
  let rowH = height / CONFIG.kinetic.rows;
  for (let i = 0; i < CONFIG.kinetic.rows; i++) {
    rows.push(new KineticRow(i * rowH, rowH, i % 2 === 0 ? 1 : -1));
  }
}

function drawHUD() {
  fill(CONFIG.palette.main); 
  textFont(connectorFont); 
  textSize(12);
  textAlign(LEFT); 
  text(`[ F: FULLSCREEN | S: SCREENSHOT ]`, 20, 30);
  
  if (typeof P5Capture === 'undefined') {
    fill(CONFIG.palette.action);
    text(`[ ERROR: CAPTURE_OFF ]`, 20, 50);
  }
}

function keyPressed() {
  if (key === 'f' || key === 'F') fullscreen(!fullscreen());
  // Plan B: Si la grabación falla, saca un pantallazo de alta calidad
  if (key === 's' || key === 'S') saveCanvas('EiT_MasterFrame', 'png');
}