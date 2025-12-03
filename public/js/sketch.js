/**
 * VISUALIZACIÓN PRINCIPAL (Frontend)
 * Ubicación: public/js/sketch.js
 */

let particles = [];
let pulses = []; // Array para los pulsos (ondas)
let maxParticles = 200;

// Estado del clima (Valores por defecto)
let weatherState = {
    tempIndex: 0.5,      // 0.0 (Frío) - 1.0 (Calor)
    windIndex: 0.1,      // Velocidad
    rainIndex: 0.0,      // Lluvia
    mobilityIndex: 0.5   // Cantidad de gente/tráfico
};

function setup() {
    // --- 1. SOLUCIÓN: QUITAR PANTALLA DE CARGA ---
    // Buscamos el elemento "loading" y lo ocultamos
    let loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
    // ---------------------------------------------

    createCanvas(windowWidth, windowHeight);
    noStroke();
    
    // Crear partículas iniciales
    updateParticleCount();

    // Pedir datos al servidor inmediatamente
    fetchWeatherData();

    // Actualizar datos cada 10 segundos
    setInterval(fetchWeatherData, 10000);
}

function draw() {
    // Fondo negro con estela suave (transparencia)
    background(0, 30); 

    // --- GESTIÓN DE PARTÍCULAS ---
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.update(weatherState);
        p.display();
    }

    // --- GESTIÓN DE PULSOS ---
    // Generar pulsos aleatorios si hay mucha movilidad (hora punta)
    if (random(1) < weatherState.mobilityIndex * 0.05) {
        createPulse();
    }

    // Dibujar y actualizar pulsos existentes
    for (let i = pulses.length - 1; i >= 0; i--) {
        let pulse = pulses[i];
        pulse.update();
        pulse.display();
        
        // Si el pulso desaparece, lo sacamos del array
        if (pulse.dead) {
            pulses.splice(i, 1); 
        }
    }
    
    // --- DATOS EN PANTALLA (Para comprobar que funciona) ---
    fill(255);
    textSize(12);
    textAlign(LEFT);
    text(`TEMP: ${weatherState.tempIndex.toFixed(2)}`, 20, 30);
    text(`MOVILIDAD: ${weatherState.mobilityIndex.toFixed(2)}`, 20, 50);
}

// Función para crear un pulso con color según la temperatura
function createPulse() {
    let x = random(width);
    let y = random(height);
    
    // Color cambia entre Azul (Frío) y Naranja (Calor)
    let c1 = color(0, 200, 255); 
    let c2 = color(255, 50, 0);  
    let pulseColor = lerpColor(c1, c2, weatherState.tempIndex);
    
    // Creamos el pulso (asegúrate de tener Pulse.js cargado en el HTML)
    pulses.push(new EmotionPulse(x, y, pulseColor));
}

// Ajustar número de partículas según la movilidad
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
            // Actualizamos las variables con lo que dice el servidor
            weatherState.tempIndex = data.tempIndex;
            weatherState.windIndex = data.windIndex;
            weatherState.rainIndex = data.rainIndex;
            weatherState.mobilityIndex = data.mobilityIndex;
            
            console.log("🌦️ Datos recibidos:", weatherState);
            updateParticleCount();
            
            // Generar un pulso "maestro" cada vez que recibimos datos nuevos
            createPulse(); 
        }
    } catch (error) {
        console.error("Error obteniendo datos:", error);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
