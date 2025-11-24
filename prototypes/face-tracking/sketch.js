let video;
let facemesh;
let predictions = [];
let isModelReady = false;

function setup() {
    createCanvas(640, 480);
    
    // 1. Activar Webcam
    video = createCapture(VIDEO);
    video.size(width, height);
    
    // 2. Cargar modelo de Inteligencia Artificial (FaceMesh)
    console.log("Cargando modelo FaceMesh...");
    facemesh = ml5.facemesh(video, modelReady);
    
    // 3. Escuchar detecciones
    facemesh.on("predict", results => {
        predictions = results;
    });

    // Ocultar el video HTML original para solo ver nuestro canvas procesado
    video.hide();
}

function modelReady() {
    console.log("Modelo listo!");
    isModelReady = true;
}

function draw() {
    background(0); // Fondo negro

    // Dibujar el video de la cámara
    image(video, 0, 0, width, height);
    
    // Filtro visual para que parezca un prototipo técnico antiguo (Blanco y negro)
    filter(GRAY); 

    // Si el modelo aún no ha cargado, mostrar mensaje
    if (!isModelReady) {
        fill(0, 255, 0);
        textAlign(CENTER);
        textSize(18);
        text("CARGANDO RED NEURONAL...", width/2, height/2);
        return;
    }

    // Si ya cargó, dibujar la cara
    drawKeypoints();
}

// Función auxiliar para dibujar los puntos de la cara
function drawKeypoints() {
    for (let i = 0; i < predictions.length; i += 1) {
        const keypoints = predictions[i].scaledMesh;

        // Dibujar cada punto detectado
        for (let j = 0; j < keypoints.length; j += 1) {
            const [x, y] = keypoints[j];

            noStroke();
            fill(0, 255, 0); // Puntos verdes estilo Matrix
            ellipse(x, y, 2, 2);
        }
    }
}