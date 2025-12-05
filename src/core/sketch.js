import { Particle } from "../visual/Particle.js";
import { EmotionPulse } from "../visual/Pulse.js";
import { AudioEngine } from "../systems/AudioEngine.js";

const sketch = (p) => {
    // --- VARIABLES ---
    let particles = [];
    let pulses = [];
    let maxParticles = 200;
    let audioEngine;
    let splitX; // Límite de la pantalla dividida

    // Estado del clima (Inicial)
    let weatherState = {
        tempIndex: 0.5,
        windIndex: 0.1,
        rainIndex: 0.0,
        mobilityIndex: 0.5
    };

    // --- SETUP ---
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.noStroke();
        
        // DEFINIR DIVISIÓN: 60% Arte / 40% Datos (Mejor proporción visual)
        splitX = p.width * 0.6; 

        audioEngine = new AudioEngine();

        // Eliminar pantalla de carga
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) loadingDiv.style.display = 'none';

        // Iniciar datos simulados o reales
        fetchWeatherData();
        setInterval(fetchWeatherData, 5000); // Actualizar cada 5s
    };

    // --- DRAW ---
    p.draw = () => {
        p.background(0, 30); // Fondo con estela

        // --- ZONA A (IZQUIERDA): ARTE GENERATIVO ---
        updateParticleCount();

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(weatherState);
            particles[i].display(p);

            // [LÓGICA CLAVE] Muro invisible en splitX
            if (particles[i].pos.x > splitX) {
                particles[i].pos.x = 0;     // Opción A: Teletransportar al inicio
                // particles[i].vel.x *= -1; // Opción B: Rebotar (descomentar si prefieres)
            }
        }

        // --- ZONA B (DERECHA): DASHBOARD DE DATOS ---
        drawDashboard(p);

        // --- LÍNEA DIVISORIA ---
        p.stroke(255, 100);
        p.strokeWeight(2);
        p.line(splitX, 0, splitX, p.height);
        p.noStroke();
    };

    // --- FUNCIÓN DEL DASHBOARD ---
    function drawDashboard(p) {
        // Fondo del panel (Gris técnico)
        p.fill(15, 15, 20, 240);
        p.rect(splitX, 0, p.width - splitX, p.height);

        let x = splitX + 30; // Margen izquierdo del panel
        let y = 80;          // Altura inicial
        let barWidth = (p.width - splitX) - 60; // Ancho dinámico

        // Título
        p.fill(255);
        p.textSize(20);
        p.textAlign(p.LEFT);
        p.text("📊 SYSTEM METRICS", x, 50);

        // 1. TEMPERATURA (Barra Roja)
        drawMetric(p, x, y, "Temperatura", weatherState.tempIndex, [255, 80, 80]);
        
        // 2. VIENTO (Barra Verde)
        drawMetric(p, x, y + 80, "Viento / Turbulencia", weatherState.windIndex, [80, 255, 80]);
        
        // 3. MOVILIDAD (Barra Azul)
        drawMetric(p, x, y + 160, "Movilidad Urbana", weatherState.mobilityIndex, [80, 80, 255]);

        // Debug Info extra
        p.fill(150);
        p.textSize(12);
        p.text(`Particles: ${particles.length}`, x, p.height - 50);
        p.text(`FPS: ${p.frameRate().toFixed(1)}`, x, p.height - 30);
    }

    // Helper para dibujar barras
    function drawMetric(p, x, y, label, value, color) {
        p.fill(200);
        p.textSize(14);
        p.text(`${label}: ${(value * 100).toFixed(0)}%`, x, y);

        // Barra fondo
        p.fill(50);
        p.rect(x, y + 10, (p.width - splitX) - 60, 10, 5);

        // Barra valor
        p.fill(color[0], color[1], color[2]);
        let barW = ((p.width - splitX) - 60) * value; 
        p.rect(x, y + 10, barW, 10, 5);
    }

    // ... (Mantén tus funciones createPulse, updateParticleCount y fetchWeatherData igual) ...
    // Solo recuerda en createPulse usar: let x = p.random(splitX); para que los pulsos nazcan en el lado del arte.

    function updateParticleCount() {
       let targetCount = p.map(weatherState.mobilityIndex, 0, 1, 50, maxParticles);
       if (particles.length < targetCount) {
           particles.push(new Particle(p)); 
       } else if (particles.length > targetCount) {
           particles.splice(0, 1);
       }
    }

    // Simulación de datos para que veas las barras moverse YA
    async function fetchWeatherData() {
        // Simulamos variación para que veas el efecto visual
        weatherState.tempIndex = p.noise(p.millis() * 0.001); 
        weatherState.windIndex = p.noise(p.millis() * 0.002 + 100);
        weatherState.mobilityIndex = p.noise(p.millis() * 0.003 + 200);
    }
};

export default sketch;
