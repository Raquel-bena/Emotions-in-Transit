import p5 from 'p5';
// Importamos tus clases (asegúrate de que las rutas sean correctas)
import { Particle } from '../visual/Particle.js';
import { EmotionPulse } from '../visual/Pulse.js';
import { AudioEngine } from '../systems/AudioEngine.js';

const sketch = (p) => {
    // --- VARIABLES DE ESTADO (Ahora son locales, no globales) ---
    let particles = [];
    let pulses = [];
    let maxParticles = 200;
    let audioEngine;
    
    // Estado del clima (Fallback)
    let weatherState = {
        tempIndex: 0.5,
        windIndex: 0.1,
        rainIndex: 0.0,
        mobilityIndex: 0.5
    };

    // --- SETUP ---
    p.setup = () => {
        // En instance mode usamos p.windowWidth
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.noStroke();

        // 1. Inicializar AudioEngine
        audioEngine = new AudioEngine();

        // 2. Quitar loading (Manipulación del DOM estándar)
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) loadingDiv.style.display = 'none';

        // 3. Iniciar ciclo de datos
        fetchWeatherData();
        
        // Usamos setInterval del navegador, pero referenciamos la función interna
        setInterval(fetchWeatherData, 10000);
    };

    // --- DRAW ---
    p.draw = () => {
        // En instance mode, todas las funciones de p5 llevan "p."
        p.background(0, 30);

        // Actualizar cantidad de partículas
        updateParticleCount();

        // Partículas
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(weatherState);
            // IMPORTANTE: Pasamos 'p' para que la partícula sepa dónde dibujar
            particles[i].display(p); 
        }

        // Pulsos (Lógica de creación)
        if (p.random(1) < weatherState.mobilityIndex * 0.05) {
            createPulse();
            
            // Audio trigger
            if (audioEngine && audioEngine.isStarted && p.random(1) > 0.8) {
                audioEngine.triggerBusArrival();
            }
        }

        // Pulsos (Render)
        for (let i = pulses.length - 1; i >= 0; i--) {
            pulses[i].update();
            pulses[i].display(p); // Pasamos 'p' aquí también
            if (pulses[i].dead) pulses.splice(i, 1);
        }

        // Debug Text
        drawDebugInfo();
    };

    // --- INTERACCIÓN ---
    p.mousePressed = () => {
        if (audioEngine && !audioEngine.isStarted) {
            audioEngine.start();
            console.log("🖱️ Clic detectado: Iniciando AudioEngine...");
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    // --- FUNCIONES AUXILIARES ---

    function createPulse() {
        let x = p.random(p.width);
        let y = p.random(p.height);

        let c1 = p.color(0, 200, 255);
        let c2 = p.color(255, 50, 0);
        // lerpColor también necesita 'p'
        let pulseColor = p.lerpColor(c1, c2, weatherState.tempIndex);

        // Pasamos 'p' al constructor si es necesario, o solo al display
        pulses.push(new EmotionPulse(x, y, pulseColor));
    }

    function updateParticleCount() {
        let targetCount = p.map(weatherState.mobilityIndex, 0, 1, 50, maxParticles);
        
        if (particles.length < targetCount) {
            while (particles.length < targetCount) {
                // Pasamos 'p' al constructor de la partícula
                particles.push(new Particle(p)); 
            }
        } else if (particles.length > targetCount) {
            particles.splice(0, particles.length - targetCount);
        }
    }

    function drawDebugInfo() {
        p.fill(255);
        p.textSize(12);
        p.textAlign(p.LEFT);
        p.text(`TEMP: ${weatherState.tempIndex.toFixed(2)}`, 20, 30);
        p.text(`MOVILIDAD: ${weatherState.mobilityIndex.toFixed(2)}`, 20, 50);
        p.text(`AUDIO: ${audioEngine && audioEngine.isStarted ? "ON" : "OFF (Click)"}`, 20, 70);
    }

    async function fetchWeatherData() {
        try {
            // Nota: En desarrollo usamos la URL completa del backend
            const response = await fetch('http://localhost:3000/api/weather');
            const data = await response.json();

            if (data) {
                // Actualizamos el objeto local, no lo sobrescribimos para mantener referencia
                weatherState.tempIndex = data.tempIndex || 0.5;
                weatherState.windIndex = data.windIndex || 0.1;
                weatherState.rainIndex = data.rainIndex || 0;
                weatherState.mobilityIndex = data.mobilityIndex || 0.5;

                if (audioEngine) audioEngine.updateFromData(weatherState);
            }
        } catch (error) {
            console.warn("Backend no conectado, usando datos simulados.");
        }
    }
};

export default sketch;
