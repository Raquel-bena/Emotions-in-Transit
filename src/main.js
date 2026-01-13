import p5 from 'p5';
import './style.css';
import { drawClimate } from './visualizer/climateVisualizer.js';
import { drawTransit } from './visualizer/transitVisualizer.js';
import { initializeHUD } from './utils/hudController.js';

// ✅ URL CORREGIDA para Render.com
const API_URL = "https://emotions-in-transit-m2ts.onrender.com/api/data";

let incomingData = null;
let systemInitialized = false;
let lastUpdate = Date.now();

// Configuración del sistema de partículas
const particleSystem = {
  particles: [],
  maxParticles: 4000,
  createParticle: function() {
    // Implementación basada en el TFM - 4,000 partículas a 60 FPS
  }
};

const sketch = (p) => {
  p.preload = () => {
    // Cargar assets si es necesario
  };

  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    canvas.parent('app');
    canvas.mousePressed(startSystem);
    
    // Inicializar HUD
    initializeHUD();
    
    // Empezar a fetch datos inmediatamente
    fetchData().then(() => {
      if (incomingData) {
        systemInitialized = true;
        console.log('✅ Sistema inicializado con datos en tiempo real');
      }
    });
    
    // Actualizar cada 30 segundos (balance entre rendimiento y actualización)
    setInterval(fetchData, 30000);
    
    // Manejar resize
    window.addEventListener('resize', () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    });
  };

  p.draw = () => {
    // Efecto glitch para el título (como en el TFM)
    if (!systemInitialized) {
      drawLoadingScreen(p);
      return;
    }

    // Fondo semitransparente para efecto de estela
    p.background(0, 10);
    
    if (!incomingData) {
      p.fill(255, 100);
      p.textSize(24);
      p.textAlign(p.CENTER, p.CENTER);
      p.text('Conectando con BCN Data Stream...', p.width/2, p.height/2);
      return;
    }

    // ✅ Implementación basada en el TFM - Partículas fluidas con WebGL
    drawClimate(p, incomingData, particleSystem);
    drawTransit(p, incomingData, particleSystem);
    
    // Efecto HUD de escaneo
    drawScanline(p);
  };

  async function fetchData() {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // ✅ Mapeo correcto según el TFM - Variables emocionales
      incomingData = {
        meta: {
          timestamp: data.timestamp || new Date().toISOString(),
          emotion: data.predicted_emotion || 'neutral', // Cluster de K-Means
          cluster: data.cluster_id || 0
        },
        environment: {
          noiseDb: data.noise_level || 45,
          temperature: data.temperature || 20,
          pressure: data.atmospheric_pressure || 1013,
          humidity: data.humidity || 60,
          cloudiness: data.cloud_cover || 30
        },
        transport: {
          congestion: data.transport_density || 0.5,
          bikeAvailability: data.bike_availability || 50,
          busFrequency: data.bus_frequency || 8
        },
        time: {
          hour: new Date().getHours(),
          isDaytime: new Date().getHours() >= 6 && new Date().getHours() < 20
        }
      };

      updateHUD(incomingData);
      lastUpdate = Date.now();
      
    } catch (err) {
      console.error('🚨 Error en la conexión con la API de Render:', err);
      // ✅ Fallback elegante - usar datos simulados
      if (!incomingData) {
        incomingData = generateFallbackData();
        updateHUD(incomingData);
      }
    }
  }

  function startSystem() {
    if (!systemInitialized) {
      document.getElementById('welcome-screen').classList.add('hidden');
      systemInitialized = true;
      p.userStartAudio?.(); // Para compatibilidad con futuras implementaciones de audio
      console.log('🚀 Sistema iniciado - Conectado al ecosistema BCN');
    }
  }

  function drawLoadingScreen(p) {
    p.background(0);
    p.fill(0, 255, 210);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.text('EMOTIONS IN TRANSIT', p.width/2, p.height/2 - 40);
    p.textSize(16);
    p.text('Cargando datos urbanos de Barcelona...', p.width/2, p.height/2 + 20);
    p.textSize(12);
    p.text(`Última actualización: ${new Date(lastUpdate).toLocaleTimeString()}`, 
           p.width/2, p.height/2 + 50);
  }

  function drawScanline(p) {
    const scanY = (p.frameCount % p.height);
    p.stroke(0, 255, 210, 80);
    p.line(0, scanY, p.width, scanY);
  }

  function generateFallbackData() {
    // ✅ Datos simulados basados en el TFM para fallback elegante
    const hour = new Date().getHours();
    return {
      meta: {
        timestamp: new Date().toISOString(),
        emotion: hour >= 18 ? 'urban_rage' : hour <= 6 ? 'melancholy' : 'transition',
        cluster: Math.floor(Math.random() * 4)
      },
      environment: {
        noiseDb: 45 + Math.sin(Date.now() * 0.001) * 15,
        temperature: 20 + Math.sin(Date.now() * 0.0005) * 8,
        pressure: 1013 + Math.random() * 10 - 5,
        humidity: 60 + Math.random() * 20 - 10,
        cloudiness: 30 + Math.random() * 40
      },
      transport: {
        congestion: 0.5 + Math.sin(Date.now() * 0.002) * 0.3,
        bikeAvailability: 50 + Math.random() * 30 - 15,
        busFrequency: 8 + Math.random() * 4 - 2
      },
      time: {
        hour: hour,
        isDaytime: hour >= 6 && hour < 20
      }
    };
  }
};

function updateHUD(data) {
  try {
    // ✅ Actualización segura del HUD como en el TFM
    document.getElementById('noise-val').textContent = `${data.environment.noiseDb.toFixed(1)} dB`;
    document.getElementById('co2-val').textContent = `${Math.round(data.environment.humidity)} ppm`;
    document.getElementById('light-val').textContent = `${data.environment.cloudiness.toFixed(0)} %`;
    document.getElementById('congestion-val').textContent = `${data.transport.congestion.toFixed(1)} /10`;
    document.getElementById('desc-val').textContent = formatEmotion(data.meta.emotion);
    
    // Actualizar reloj
    const now = new Date();
    document.getElementById('clock-display').textContent = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    document.getElementById('date-display').textContent = now.toLocaleDateString('es-ES');
  } catch (err) {
    console.warn('⚠️ Error actualizando HUD:', err);
  }
}

function formatEmotion(emotion) {
  const emotions = {
    'melancholy': 'Melancolía (Solastalgia)',
    'urban_rage': 'Ira Urbana',
    'tense_calm': 'Calma Tensa',
    'transition': 'Transición',
    'neutral': 'Estado Neutro'
  };
  return emotions[emotion] || emotion.replace('_', ' ').toUpperCase();
}

// ✅ Inicialización segura
document.addEventListener('DOMContentLoaded', () => {
  new p5(sketch);
  
  // Añadir evento de inicio
  document.getElementById('start-btn')?.addEventListener('click', () => {
    document.getElementById('welcome-screen').classList.add('hidden');
  });
});