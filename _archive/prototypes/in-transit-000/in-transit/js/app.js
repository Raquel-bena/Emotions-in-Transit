// js/app.js
// --- DATOS GLOBALES (Valores por defecto) ---
let data = {
    bcn: 'Barcelona', 
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    weather: {
        temp: 20,       
        humidity: 50,    
        windSpeed: 5,   
        description: 'init', 
    },
    environment: {
        noiseDb: 45,    
        co2: 400,       
    },
    transport: {
        congestion: 5,  
        flowRhythm: 0.5 
    }
};

let video; 
let faceApi; 
let detections; 
let loading = true;
let error = null;

// --- SISTEMA VISUAL C (Partículas Orbitales) ---
let particles = []; 

// --- SISTEMA VISUAL A (ASCII Faces) ---
const asciiFaces = {
    cold: "( '–' )",
    neutral: "( •_• )",
    warm: "( ◕‿◕ )",
    hot: "(🔥‿🔥)",
    polluted: "( -_- )",
    noisy: "( >_< )",
    stressed: "(╯°□°）╯",
};

// =========================================================================
// --- P5.JS SETUP Y CORE ---
// =========================================================================

function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont('Courier New'); 
    
    // Actualizar mensaje de carga
    document.getElementById('loading-status').textContent = "Inicializando cámara web...";
    
    // Intentar obtener acceso a la cámara
    try {
        video = createCapture(VIDEO, videoReady); 
        video.size(width, height);
        video.hide(); 
    } catch (err) {
        console.error('Error al inicializar la cámara:', err);
        error = "No se pudo acceder a la cámara web. Por favor, verifica los permisos.";
        loading = false;
        document.getElementById('loading-status').textContent = 
            "Error al acceder a la cámara: " + err.message;
    }

    // Inicializar faceApi solo si se pudo acceder a la cámara
    if (video) {
        try {
            // Mostrar mensaje de carga del modelo
            document.getElementById('loading-status').textContent = "Cargando modelo de detección facial (10-30 segundos)...";
            
            // Inicializar con parámetros específicos para mejor rendimiento
            faceApi = ml5.facemesh(video, { 
                maxFaces: 1,
                flipHorizontal: true
            }, modelReady);
        } catch (err) {
            console.error('Error al inicializar faceApi:', err);
            error = "No se pudo cargar el modelo de detección facial.";
            loading = false;
            document.getElementById('loading-status').textContent = 
                "Error al cargar el modelo de IA: " + err.message;
        }
    }

    // Inicia la carga de datos
    if (typeof loadRealData === 'function') {
        loadRealData().then(success => {
            loading = !success;
            if (!success) {
                error = "No se pudieron cargar todos los datos. Usando valores por defecto.";
            }
        });
    }

    // Programar actualizaciones periódicas
    setInterval(() => {
        if (typeof loadRealData === 'function') {
            loadRealData().then(success => {
                if (!success) {
                    console.log("Actualización de datos fallida");
                }
            });
        }
    }, 60000);
}

function videoReady() {
    console.log("¡CÁMARA WEB INICIALIZADA Y LISTA!");
    document.getElementById('loading-status').textContent = "Modelo de detección facial cargando...";
}

function modelReady() {
    console.log('Modelo de detección facial cargado.');
    document.getElementById('loading-status').textContent = "Cargando visualización de datos...";
    
    // Marcar como cargado después de un breve retraso
    setTimeout(() => {
        loading = false;
        document.getElementById('loading-screen').style.display = 'none';
    }, 1000);
}

function draw() {
    background(30);
    drawDataStructure();

    // Mostrar error si hay
    if (error) {
        drawError(error);
    }

    if (video && video.loadedmetadata) {
        if (detections && detections.length > 0) {
            let face = detections[0].scaledMesh;
            let faceBox = getBoundingBox(face);
            
            push();
            translate(faceBox.x, faceBox.y);
            image(video, 0, 0, faceBox.w, faceBox.h, faceBox.x, faceBox.y, faceBox.w, faceBox.h);
            pop();
            
            // SISTEMAS VISUALES PRINCIPALES
            drawWeatherFilter(faceBox);
            drawEnvironmentWave(face, faceBox);
            drawTransportLines(face, faceBox);

            // SISTEMAS VISUALES A y C
            drawAsciiOnFace(faceBox);
            spawnParticles(faceBox);
            drawParticles(faceBox);
            
        } else {
            image(video, 0, 0, width, height);
            drawDataOverlay();
        }
    } else {
        showCameraLoading();
    }
}

// =========================================================================
// --- IMPLEMENTACIÓN DE SISTEMAS VISUALES ---
// =========================================================================

// SISTEMA A: ASCII FACES
function getAsciiFace() {
    if (data.weather.temp < 10) return asciiFaces.cold;
    if (data.weather.temp > 30) return asciiFaces.hot;
    if (data.environment.co2 > 800) return asciiFaces.polluted;
    if (data.environment.noiseDb > 75) return asciiFaces.noisy;
    if (data.transport.congestion > 7) return asciiFaces.stressed;
    return asciiFaces.neutral;
}

function drawAsciiOnFace(faceBox) {
    let ascii = getAsciiFace();
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(faceBox.w * 0.15);  
    text(ascii, faceBox.x + faceBox.w/2, faceBox.y - faceBox.h * 0.15);
}

// SISTEMA C: PARTÍCULAS ORBITALES
function spawnParticles(faceBox) {
    let amount = floor(map(data.environment.noiseDb, 40, 90, 10, 60));

    for (let i = 0; i < amount; i++) {
        particles.push({
            x: faceBox.x + faceBox.w / 2 + random(-50, 50),
            y: faceBox.y + faceBox.h / 2 + random(-50, 50),
            angle: random(TWO_PI),
            radius: random(faceBox.w * 0.4, faceBox.w),
            speed: data.transport.flowRhythm * random(0.01, 0.03),
            size: random(2, 6),
            color: lerpColor(color(0,255,200), color(255,80,0), map(data.weather.temp,0,40,0,1))
        });
    }

    if (particles.length > 800) {
        particles.splice(0, particles.length - 800);
    }
}

function drawParticles(faceBox) {
    for (let p of particles) {
        p.angle += p.speed;

        let ox = cos(p.angle) * p.radius;
        let oy = sin(p.angle) * p.radius;

        fill(p.color);
        noStroke();
        circle(faceBox.x + faceBox.w/2 + ox, faceBox.y + faceBox.h/2 + oy, p.size);
    }
}

// SISTEMA B: FILTROS Y ONDAS ANTERIORES
function drawWeatherFilter(faceBox) {
    let tempColor1 = color(0, 100, 255, 30); 
    let tempColor2 = color(255, 50, 0, 30);  
    let mixRatio = map(data.weather.temp, 0, 40, 0, 1); 
    let currentColor = lerpColor(tempColor1, tempColor2, mixRatio);
    
    noStroke();
    fill(currentColor);
    rect(0, 0, width, height); 
}

function drawEnvironmentWave(face, faceBox) {
    let centerPoint = face[10]; 
    let co2Mix = map(data.environment.co2, 300, 1000, 0, 1);
    let waveColor = lerpColor(color(0, 255, 100, 200), color(255, 100, 0, 200), co2Mix); 
    
    stroke(waveColor); 
    strokeWeight(2);
    noFill();
    
    let waveHeight = map(data.environment.noiseDb, 40, 90, 10, 80);
    
    push();
    translate(centerPoint[0], centerPoint[1]);
    beginShape();
    for (let x = -faceBox.w/2; x < faceBox.w/2; x += 10) {
        let y = sin(x * 0.1 + frameCount * 0.05) * waveHeight * noise(x/100, frameCount * 0.01);
        vertex(x, y);
    }
    endShape();
    pop();
}

function drawTransportLines(face, faceBox) {
    let leftEyeRef = face[107]; 
    let rightEyeRef = face[336];
    
    let lanes = floor(data.transport.congestion); 
    let speed = data.transport.flowRhythm * 2; 
    
    for (let i = 0; i < lanes; i++) {
        let lineCol = lerpColor(color(255, 255, 0, 150), color(255, 0, 0, 150), lanes/10);
        stroke(lineCol);
        strokeWeight(map(i, 0, lanes, 1, 4)); 
        
        let offset = (i * 10) + sin(frameCount * 0.1) * 5;
        let xMovement = (frameCount * speed * (i + 1)) % 100;
        
        line(leftEyeRef[0] - 50 + xMovement, leftEyeRef[1] + offset, leftEyeRef[0] + 50 + xMovement, leftEyeRef[1] + offset);
        line(rightEyeRef[0] - 50 - xMovement, rightEyeRef[1] + offset, rightEyeRef[0] + 50 - xMovement, rightEyeRef[1] + offset);
    }
}

// --- FUNCIONES DE SOPORTE GENERAL ---

function getBoundingBox(face) {
    let minX = width, minY = height, maxX = 0, maxY = 0;
    for(let i=0; i<face.length; i++) {
        minX = min(minX, face[i][0]);
        maxX = max(maxX, face[i][0]);
        minY = min(minY, face[i][1]);
        maxY = max(maxY, face[i][1]);
    }
    let padding = 50;
    return {
        x: minX - padding,
        y: minY - padding,
        w: maxX - minX + padding * 2,
        h: maxY - minY + padding * 2
    };
}

function drawDataStructure() {
    noStroke();
    
    // Bandas de colores
    fill(255, 100, 0);
    rect(0, height * 0.15, width, height * 0.05);

    fill(50, 150, 200);
    rect(0, height * 0.2, width, height * 0.05);
    
    fill(100, 100, 100, 150);
    rect(0, height * 0.45, width, height * 0.2);

    let c1 = color(255, 0, 100);
    let c2 = color(50, 0, 100);
    for (let x = 0; x < width; x++) {
        let inter = map(x, 0, width, 0, 1);
        let c = lerpColor(c1, c2, inter);
        stroke(c);
        line(x, height * 0.75, x, height * 0.9);
    }
}

function drawDataOverlay() {
    fill(255);
    noStroke();
    textSize(14);
    textAlign(LEFT);
    
    text(`${data.bcn}    ${data.date}    ${data.time}`, 20, 30);
    
    let dataDisplay = {
        weather: {
            temp: nf(data.weather.temp, 0, 1) + ' C',
            humidity: nf(data.weather.humidity, 0, 0) + '%',
        },
        environment: {
            noiseDb: nf(data.environment.noiseDb, 0, 1) + ' dB',
            co2: nf(data.environment.co2, 0, 0) + ' ppm',
        },
        transport: {
            congestion: nf(data.transport.congestion, 0, 1),
            flowRhythm: nf(data.transport.flowRhythm, 0, 1),
        }
    };
    
    text(JSON.stringify(dataDisplay, null, 2), 20, 60);

    textSize(24);
    text("EMOTIONS (IN) TRANSIT", 20, height - 30);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (video) {
        video.size(width, height); 
    }
}

// =========================================================================
// --- NUEVAS FUNCIONES DE UI ---
// =========================================================================

function showCameraLoading() {
    fill(255, 30);
    rect(0, 0, width, height);
    
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("Esperando acceso a la cámara web...", width/2, height/2);
}

function drawError(message) {
    fill(255, 0, 0, 150);
    rect(20, height - 100, width - 40, 80);
    
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text(message, 30, height - 90, width - 60, 60);
}