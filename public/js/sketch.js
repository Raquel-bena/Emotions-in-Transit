/**
 * VISUALIZACIÓN PRINCIPAL
 */

let particles = [];
let pulses = []; 
let maxParticles = 200;
let audioEngine; // Instancia global del audio

// Estado del clima (Fallback)
let weatherState = {
    tempIndex: 0.5,    
    windIndex: 0.1,      
    rainIndex: 0.0,      
    mobilityIndex: 0.5   
};

function setup() {
    let cvs = createCanvas(windowWidth, windowHeight);
    cvs.parent(document.body); // Asegura que esté en el body
    noStroke();

    // 1. Inicializar AudioEngine (pero no arrancará hasta el click)
    audioEngine = new AudioEngine();

    // 2. Quitar loading
    let loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'none';
    
    // 3. Crear partículas iniciales
    updateParticleCount();

    // 4. Iniciar ciclo de datos
    fetchWeatherData();
    setInterval(fetchWeatherData, 10000);
}

function draw() {
    background(0, 30); 

    // Partículas
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(weatherState);
        particles[i].display();
    }

    // Pulsos
    if (random(1) < weatherState.mobilityIndex * 0.05) {
        createPulse();
        // Disparar sonido aleatorio si el audio está activo
        if(audioEngine.isStarted && random(1) > 0.8) {
             audioEngine.triggerBusArrival(); // Usamos esto como "evento urbano"
        }
    }

    for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].update();
        pulses[i].display();
        if (pulses[i].dead) pulses.splice(i, 1); 
    }
    
    // Debug Text
    fill(255);
    textSize(12);
    textAlign(LEFT);
    text(`TEMP: ${weatherState.tempIndex.toFixed(2)}`, 20, 30);
    text(`ESTADO AUDIO: ${audioEngine.isStarted ? "ON" : "OFF (Haz Clic)"}`, 20, 50);
}

// --- INTERACCIÓN OBLIGATORIA PARA AUDIO ---
function mousePressed() {
    if (audioEngine && !audioEngine.isStarted) {
        audioEngine.start();
        console.log("🖱️ Clic detectado: Iniciando AudioEngine...");
    }
}

function createPulse() {
    let x = random(width);
    let y = random(height);
    
    let c1 = color(0, 200, 255); 
    let c2 = color(255, 50, 0);  
    let pulseColor = lerpColor(c1, c2, weatherState.tempIndex);
    
    pulses.push(new EmotionPulse(x, y, pulseColor));
}

function updateParticleCount() {
    let targetCount = map(weatherState.mobilityIndex, 0, 1, 50, maxParticles);
    if (particles.length < targetCount) {
        while (particles.length < targetCount) particles.push(new Particle());
    } else if (particles.length > targetCount) {
        particles.splice(0, particles.length - targetCount);
    }
}

async function fetchWeatherData() {
    try {
        // En local es localhost:3000/api/weather, en Render es /api/weather relativo
        const response = await fetch('/api/weather');
        const data = await response.json();

        if (data) {
            weatherState.tempIndex = data.tempIndex;
            weatherState.windIndex = data.windIndex;
            weatherState.rainIndex = data.rainIndex;
            weatherState.mobilityIndex = data.mobilityIndex;
            
            updateParticleCount();
            
            // Actualizar Audio con nuevos datos
            if (audioEngine) audioEngine.updateFromData(weatherState);
        }
    } catch (error) {
        console.error("Error obteniendo datos:", error);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
