/**
 * VISUALIZACIÓN PRINCIPAL (Frontend)
 * Conecta con /api/weather y dibuja Emociones (Partículas + Pulsos)
 */

let particles = [];
let pulses = []; // Array para guardar los pulsos activos
let maxParticles = 200;

// Estado del clima (Valores por defecto)
let weatherState = {
    tempIndex: 0.5,      // Color (Frío/Calor)
    windIndex: 0.1,      // Velocidad
    rainIndex: 0.0,      // Gravedad
    mobilityIndex: 0.5   // Cantidad de pulsos y actividad
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    
    // Crear partículas iniciales
    updateParticleCount();

    // 1. Pedir datos inmediatamente
    fetchWeatherData();

    // 2. Actualizar cada 10 segundos
    setInterval(fetchWeatherData, 10000);
}

function draw() {
    // Fondo con estela suave
    background(0, 30); 

    // --- 1. GESTIÓN DE PARTÍCULAS ---
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.update(weatherState);
        p.display();
    }

    // --- 2. GESTIÓN DE PULSOS (Pulse.js) ---
    // Generar nuevos pulsos aleatorios según la movilidad
    // Si mobilityIndex es alto (hora punta), hay más probabilidad de pulso
    if (random(1) < weatherState.mobilityIndex * 0.05) {
        createPulse();
    }

    // Dibujar y eliminar pulsos antiguos
    for (let i = pulses.length - 1; i >= 0; i--) {
        let pulse = pulses[i];
        pulse.update();
        pulse.display();
        
        if (pulse.dead) {
            pulses.splice(i, 1); // Borrar pulso si ha terminado
        }
    }
    
    // --- 3. DATOS EN PANTALLA (Debug) ---
    fill(255);
    textSize(12);
    textAlign(LEFT);
    text(`TEMP: ${weatherState.tempIndex.toFixed(2)}`, 20, 30);
    text(`MOVILIDAD: ${weatherState.mobilityIndex.toFixed(2)}`, 20, 50);
}

// Función auxiliar para crear un pulso con color según temperatura
function createPulse() {
    let x = random(width);
    let y = random(height);
    
    // Color dinámico: Azul (Frío) <-> Rojo (Calor)
    let c1 = color(0, 200, 255); // Cian
    let c2 = color(255, 50, 0);  // Naranja fuego
    let pulseColor = lerpColor(c1, c2, weatherState.tempIndex);
    
    pulses.push(new EmotionPulse(x, y, pulseColor));
}

// Ajustar cantidad de partículas según tráfico
function updateParticleCount() {
    let targetCount = map(weatherState.mobilityIndex, 0, 1, 50, maxParticles);
    
    if (particles.length < targetCount) {
        while (particles.length < targetCount) {
            particles.push(new Particle());
        }
    } else if (particles.length > targetCount) {
        particles.splice(0, particles.length - targetCount);
    }
}

// --- CONEXIÓN CON EL BACKEND ---
async function fetchWeatherData() {
    try {
        const response = await fetch('/api/weather');
        const data = await response.json();

        if (data) {
            weatherState.tempIndex = data.tempIndex;
            weatherState.windIndex = data.windIndex;
            weatherState.rainIndex = data.rainIndex;
            weatherState.mobilityIndex = data.mobilityIndex;
            
            console.log("🌦️ Datos actualizados:", weatherState);
            updateParticleCount();
            
            // Generar un "Pulso Maestro" cada vez que llegan datos nuevos
            createPulse(); 
        }
    } catch (error) {
        console.error("Error obteniendo datos:", error);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
