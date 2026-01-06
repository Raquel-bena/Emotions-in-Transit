let video;
let faceMesh;
let faces = [];
let fontRegular;

// Configuración de efectos
let glitchIntensity = 0;

function preload() {
    // Intentamos cargar FaceMesh
    faceMesh = ml5.facemesh(modelLoaded);
}

function setup() {
    // Crear canvas y vincularlo al contenedor HTML
    const container = document.getElementById('canvas-container');
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    
    let cnv = createCanvas(w, h);
    cnv.parent('canvas-container');

    // Configurar Webcam
    video = createCapture(VIDEO);
    video.size(w, h);
    video.hide(); // Ocultar elemento HTML extra

    // Vincular FaceMesh al video
    faceMesh.predict(video, gotFaces);
    
    // Configuración gráfica
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
}

function modelLoaded() {
    console.log("Modelo FaceMesh cargado!");
    window.logToScreen("RED NEURONAL: ACTIVA");
    
    // Ocultar pantalla de carga
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 1000);
    }, 1500);
}

function gotFaces(results) {
    faces = results;
}

function draw() {
    background(0); // Fondo negro limpieza

    // 1. CALCULAR INTENSIDAD DEL GLITCH (Basado en datos de api.js)
    // Usamos el tráfico para definir cuánto se "rompe" la imagen
    let trafficFactor = cityData.traffic / 100; // 0.0 a 1.0
    
    // 2. DIBUJAR VIDEO CON EFECTO
    // Si el tráfico es bajo, imagen limpia. Si es alto, offsets aleatorios.
    if (random(1) > 0.95 - (trafficFactor * 0.5)) {
        // Efecto Glitch: Dibujar tiras de la imagen movidas
        let slices = 20;
        let sliceH = height / slices;
        
        for (let i = 0; i < slices; i++) {
            let xOffset = random(-10, 10) * trafficFactor * 5;
            // image(source, dx, dy, dWidth, dHeight, sx, sy, sWidth, sHeight)
            image(video, xOffset, i * sliceH, width, sliceH, 0, i * sliceH, width, sliceH);
        }
    } else {
        // Imagen normal (tintada de verde levemente)
        tint(200, 255, 200); 
        image(video, 0, 0, width, height);
        noTint();
    }

    // 3. ACTUALIZAR RUIDO EN HTML
    // Usamos Perlin noise para simular la barra de dB
    let noiseVal = noise(frameCount * 0.1) * 100;
    document.getElementById('val-noise').innerText = Math.floor(noiseVal) + " dB";
    // Efecto visual simple para la onda de ruido en CSS
    document.getElementById('visual-noise').style.opacity = noiseVal / 100;


    // 4. DIBUJAR DATOS SOBRE LA CARA (HUD)
    drawBiometrics();
    
    // 5. EFECTO DE ESCANEO GLOBAL
    drawScanLine();
}

function drawBiometrics() {
    // Configuración estética "Matrix"
    stroke(0, 255, 65, 150); // Verde semitransparente
    strokeWeight(1);
    noFill();

    for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        let keypoints = face.scaledMesh;

        // A) Dibujar rectángulo alrededor de la cara
        let boundingBox = face.boundingBox;
        // box: [x_min, y_min, z_min], [x_max, y_max, z_max]
        let x = boundingBox.topLeft[0][0];
        let y = boundingBox.topLeft[0][1];
        let w = boundingBox.bottomRight[0][0] - x;
        let h = boundingBox.bottomRight[0][1] - y;
        
        // Rectángulo con esquinas estilo HUD
        drawBracketRect(x, y, w, h);

        // B) Dibujar puntos de la cara (solo algunos para no saturar)
        beginShape(POINTS);
        for (let j = 0; j < keypoints.length; j+=2) { // Saltamos puntos para optimizar
            let [px, py] = keypoints[j];
            vertex(px, py);
        }
        endShape();

        // C) Etiqueta de datos flotante
        noStroke();
        fill(0, 255, 65);
        textSize(10);
        text(`ID: ${window.SC_DEVICE_ID || 'UNK'}`, x + w + 10, y);
        text(`EMOTION: ANALYZING...`, x + w + 10, y + 15);
    }
}

// Función auxiliar para dibujar marco decorativo
function drawBracketRect(x, y, w, h) {
    let len = 20; // longitud de la esquina
    strokeWeight(2);
    
    // Esquina superior izquierda
    line(x, y, x + len, y);
    line(x, y, x, y + len);

    // Esquina superior derecha
    line(x + w, y, x + w - len, y);
    line(x + w, y, x + w, y + len);

    // Esquina inferior izquierda
    line(x, y + h, x + len, y + h);
    line(x, y + h, x, y + h - len);

    // Esquina inferior derecha
    line(x + w, y + h, x + w - len, y + h);
    line(x + w, y + h, x + w, y + h - len);
}

function drawScanLine() {
    // Línea verde que baja constantemente
    stroke(0, 255, 65, 100);
    strokeWeight(2);
    let scanY = (frameCount * 2) % height;
    line(0, scanY, width, scanY);
}

// Redimensionar canvas si cambia la ventana
function windowResized() {
    const container = document.getElementById('canvas-container');
    resizeCanvas(container.offsetWidth, container.offsetHeight);
}