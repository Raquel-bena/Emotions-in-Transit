let encoder;
let recording = false;
let ancho = 640; // Debe ser múltiplo de 2
let alto = 360;

function setup() {
    createCanvas(ancho, alto);
    pixelDensity(1); // Importante para que el buffer coincida

    // Inicializamos el encoder
    HME.createH264MP4Encoder().then(enc => {
        encoder = enc;
        encoder.outputFilename = "mi_video_emotions";
        encoder.width = ancho;
        encoder.height = alto;
        encoder.frameRate = 30;
        encoder.kbps = 5000;
        encoder.initialize();
    });

    let btn = createButton('Grabar/Detener');
    btn.mousePressed(() => {
        recording = !recording;
        if (!recording) finalizar();
    });
}

function draw() {
    background(20);
    fill(255, 0, 100);
    ellipse(frameCount % width, height / 2, 50);

    if (recording && encoder) {
        // Captura el frame actual en formato RGBA
        encoder.addFrameRgba(drawingContext.getImageData(0, 0, ancho, alto).data);
    }
}

function finalizar() {
    encoder.finalize();
    const uint8Array = encoder.FS.readFile(encoder.outputFilename);
    
    // Descarga automática del archivo
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }));
    anchor.download = encoder.outputFilename + '.mp4';
    anchor.click();
    
    encoder.delete(); // Limpia la memoria
    console.log("Grabación finalizada");
}
