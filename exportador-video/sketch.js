let encoder;
let isRecording = false;

// MUY IMPORTANTE: El ancho y alto deben ser múltiplos de 2
const WIDTH = 1280; 
const HEIGHT = 720;

function setup() {
    // Creamos el canvas con dimensiones pares
    createCanvas(WIDTH, HEIGHT);
    
    // Forzamos densidad 1 para que el buffer de píxeles coincida con el tamaño del video
    pixelDensity(1); 

    // Inicializamos el encoder de forma asíncrona
    HME.createH264MP4Encoder().then(enc => {
        encoder = enc;
        encoder.outputFilename = "emotions_transit_export";
        encoder.width = WIDTH;
        encoder.height = HEIGHT;
        encoder.frameRate = 30;
        encoder.kbps = 5000;    // Calidad del video
        encoder.initialize();   // Bloquea los parámetros para empezar
        console.log("Encoder listo para grabar");
    });

    // Botón de control
    let btn = createButton('🔴 Iniciar / Detener Grabación');
    btn.style('margin', '10px');
    btn.mousePressed(() => {
        isRecording = !isRecording;
        if (!isRecording) {
            finalizarGrabacion();
        } else {
            console.log("Grabación iniciada...");
        }
    });
}

function draw() {
    // --- AQUÍ VA TU LÓGICA DE ANIMACIÓN ---
    background(20);
    fill(255, 0, 100);
    noStroke();
    // Ejemplo de animación simple
    ellipse(frameCount % width, height / 2, 80, 80);
    // --------------------------------------

    // Si estamos grabando, capturamos el frame actual
    if (isRecording && encoder) {
        // Extraemos los datos RGBA del canvas
        const imageData = drawingContext.getImageData(0, 0, WIDTH, HEIGHT);
        encoder.addFrameRgba(imageData.data);
    }
}

function finalizarGrabacion() {
    console.log("Finalizando y procesando video...");
    
    // Finaliza la escritura del archivo
    encoder.finalize(); 
    
    // Lee el archivo generado desde el sistema de archivos virtual
    const uint8Array = encoder.FS.readFile(encoder.outputFilename); 
    
    // Crea un link de descarga automática en el navegador
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }));
    anchor.download = encoder.outputFilename + '.mp4';
    anchor.click();
    
    // IMPORTANTE: Libera la memoria de WebAssembly
    encoder.delete(); 
    
    // Reiniciamos el encoder por si quieres grabar otro clip sin refrescar
    reiniciarEncoder();
}

function reiniciarEncoder() {
    HME.createH264MP4Encoder().then(enc => {
        encoder = enc;
        encoder.outputFilename = "emotions_transit_export_" + floor(millis());
        encoder.width = WIDTH;
        encoder.height = HEIGHT;
        encoder.frameRate = 30;
        encoder.initialize();
        console.log("Encoder reiniciado y listo");
    });
}