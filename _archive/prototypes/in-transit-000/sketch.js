/**
 * EMOTIONS IN TRANSIT - VISUAL ENGINE
 * Autor: Equipo TFM
 */

let video;
let particles = [];
let flowField;
let cols, rows;
let scl = 20; 
let zOff = 0; 
let prevFrame; 

// ESTADO INICIAL
let currentData = {
    tempIndex: 0.5,    
    chaosIndex: 0.1,   
    rainIndex: 0.0,    
    densityIndex: 0.3  
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Configuración ética de cámara (baja resolución)
    video = createCapture(VIDEO);
    video.size(64, 48); 
    video.hide(); 

    cols = floor(width / scl);
    rows = floor(height / scl);
    flowField = new Array(cols * rows);

    for (let i = 0; i < 2000; i++) {
        particles[i] = new Particle();
    }
}

function draw() {
    // 1. FONDO (Alpha para estelas de lluvia)
    let bgAlpha = map(currentData.rainIndex, 0, 1, 50, 5); 
    background(0, bgAlpha);

    // 2. FLOW FIELD (Ruido Perlin)
    let yOff = 0;
    for (let y = 0; y < rows; y++) {
        let xOff = 0;
        for (let x = 0; x < cols; x++) {
            let index = x + y * cols;
            // Ruido controlado por 'chaosIndex' [cite: 603]
            let noiseDetail = map(currentData.chaosIndex, 0, 1, 0.05, 0.2); 
            let angle = noise(xOff, yOff, zOff) * TWO_PI * 4;
            let v = p5.Vector.fromAngle(angle);
            v.setMag(1); 
            flowField[index] = v;
            xOff += noiseDetail;
        }
        yOff += noiseDetail;
    }
    zOff += 0.003 + (currentData.chaosIndex * 0.01);

    // 3. INTERACCIÓN KINÉTICA (Optical Flow)
    detectMotion();

    // 4. PARTÍCULAS
    // Cantidad basada en densidad urbana [cite: 567]
    let activeParticles = map(currentData.densityIndex, 0, 1, 500, particles.length);

    for (let i = 0; i < activeParticles; i++) {
        particles[i].follow(flowField);
        particles[i].update();
        particles[i].edges();
        particles[i].show();
    }

    // 5. COMUNICACIÓN CON AUDIO
    if (typeof updateAudioParams === 'function') {
        updateAudioParams(currentData);
    }
}

function detectMotion() {
    video.loadPixels();
    if (video.pixels.length > 0 && prevFrame) {
        for (let y = 0; y < video.height; y++) {
            for (let x = 0; x < video.width; x++) {
                let index = (x + y * video.width) * 4;
                let r1 = prevFrame[index];
                let r2 = video.pixels[index];
                let diff = abs(r1 - r2);

                if (diff > 50) { 
                    let screenX = map(x, 0, video.width, width, 0); 
                    let screenY = map(y, 0, video.height, 0, height);
                    let gridIndex = floor(screenX / scl) + floor(screenY / scl) * cols;
                    
                    if (flowField[gridIndex]) {
                        let mouseForce = p5.Vector.random2D();
                        mouseForce.setMag(5); 
                        flowField[gridIndex] = mouseForce;
                    }
                }
            }
        }
    }
    if (video.pixels.length > 0) {
        prevFrame = new Uint8Array(video.pixels);
    }
}

// --- CLASE PARTÍCULA ---
class Particle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 2; 
        this.prevPos = this.pos.copy();
    }

    follow(vectors) {
        let x = floor(this.pos.x / scl);
        let y = floor(this.pos.y / scl);
        let index = x + y * cols;
        let force = vectors[index];
        this.applyForce(force);
    }

    applyForce(force) { this.acc.add(force); }

    update() {
        let speedLimit = map(currentData.chaosIndex, 0, 1, 2, 6);
        this.vel.add(this.acc);
        this.vel.limit(speedLimit);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    show() {
        // Colorimetría poética [cite: 1250]
        let colorCold = color(0, 150, 255); 
        let colorWarm = color(255, 100, 50); 
        let finalColor = lerpColor(colorCold, colorWarm, currentData.tempIndex);
        
        if(currentData.rainIndex > 0.5) {
            finalColor = lerpColor(finalColor, color(200, 200, 255), 0.5);
        }

        stroke(finalColor);
        if (currentData.rainIndex > 0.6) {
             strokeWeight(1);
             line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        } else {
             strokeWeight(2);
             point(this.pos.x, this.pos.y);
        }
        this.updatePrev();
    }

    updatePrev() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
    }

    edges() {
        if (this.pos.x > width) { this.pos.x = 0; this.updatePrev(); }
        if (this.pos.x < 0) { this.pos.x = width; this.updatePrev(); }
        if (this.pos.y > height) { this.pos.y = 0; this.updatePrev(); }
        if (this.pos.y < 0) { this.pos.y = height; this.updatePrev(); }
    }
}

// --- CONTROLES ---
function mousePressed() {
    if (typeof initAudio === 'function') initAudio();
}

function keyPressed() {
    if (typeof initAudio === 'function') initAudio();

    if (key === '1') {
        currentData = { tempIndex: 0.6, chaosIndex: 0.1, rainIndex: 0.0, densityIndex: 0.3 };
        console.log("Modo: Esperanza Activa");
    } else if (key === '2') {
        currentData = { tempIndex: 0.2, chaosIndex: 0.3, rainIndex: 0.9, densityIndex: 0.2 };
        console.log("Modo: Solastalgia");
    } else if (key === '3') {
        currentData = { tempIndex: 0.9, chaosIndex: 0.9, rainIndex: 0.0, densityIndex: 1.0 };
        console.log("Modo: Rabia Urbana");
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cols = floor(width / scl);
    rows = floor(height / scl);
}
