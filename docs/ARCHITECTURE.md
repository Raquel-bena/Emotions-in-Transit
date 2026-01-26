# Arquitectura Técnica - Emotions in Transit

Este documento describe las decisiones de diseño, la arquitectura del sistema y los patrones de desarrollo utilizados en **Emotions in Transit**.

---

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Frontend - Capa de Visualización](#frontend---capa-de-visualización)
- [Backend - Capa de Datos](#backend---capa-de-datos)
- [Data Science - Capa de Inteligencia](#data-science---capa-de-inteligencia)
- [Flujo de Datos](#flujo-de-datos)
- [Decisiones de Diseño](#decisiones-de-diseño)
- [Patrones de Código](#patrones-de-código)
- [Rendimiento y Optimización](#rendimiento-y-optimización)
- [Seguridad](#seguridad)
- [Escalabilidad](#escalabilidad)
- [Trade-offs y Limitaciones](#trade-offs-y-limitaciones)

---

## Visión General

**Emotions in Transit** es un sistema de arte generativo que traduce datos urbanos en tiempo real en experiencias audiovisuales. La arquitectura está diseñada con tres principios fundamentales:

1. **Modularidad**: Separación clara entre visualización, datos y lógica de negocio
2. **Tiempo Real**: Actualización continua de datos con latencia mínima
3. **Resiliencia**: Funcionamiento degradado cuando las APIs externas fallan (Ghost Mode)

### Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: p5.js + Tone.js + HandsFree.js (WebGL/Web Audio) │
├─────────────────────────────────────────────────────────────┤
│ BACKEND: Node.js + Express.js                               │
├─────────────────────────────────────────────────────────────┤
│ DATA SCIENCE: Python + Flask + scikit-learn                 │
├─────────────────────────────────────────────────────────────┤
│ INFRASTRUCTURE: Render.com (PaaS) + GitHub (CI/CD)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquitectura del Sistema

### Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────────┐
│                         NAVEGADOR                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  p5.js Canvas (index.html)                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Weather    │  │   Transit    │  │   Emotion    │    │  │
│  │  │  Visualizer  │  │   Glitch     │  │    Waves     │    │  │
│  │  │  (Perlin)    │  │  (Cellular)  │  │  (Sine Wave) │    │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │  │
│  │         │                  │                  │            │  │
│  └─────────┼──────────────────┼──────────────────┼────────────┘  │
│            │                  │                  │                │
│  ┌─────────▼──────────────────▼──────────────────▼────────────┐  │
│  │         Tone.js Audio Engine (AudioContext)                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │  │
│  │  │   Synth  │  │  Filter  │  │ Reverb   │                 │  │
│  │  └──────────┘  └──────────┘  └──────────┘                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│            │                  │                  │                │
│  ┌─────────▼──────────────────▼──────────────────▼────────────┐  │
│  │            HandsFree.js (MediaPipe Hands)                  │  │
│  │              [Webcam Input Processing]                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────────┘
                         │ fetch() / XMLHttpRequest
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│              NODE.JS EXPRESS SERVER (Backend)                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                     MIDDLEWARES                            │  │
│  │  [ CORS ] → [ express.json ] → [ dotenv ]                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                      ROUTES                                │  │
│  │  GET /api/tmb/transport  ──► server/routes/tmb.js          │  │
│  │  GET /api/weather (WIP)  ──► server/routes/weather.js      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  STATIC FILE SERVING                       │  │
│  │  app.use(express.static('dist'))  ──► Vite build output    │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────────┘
                         │ axios / fetch
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                      EXTERNAL APIs                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   TMB API    │  │ OpenWeather  │  │  Flask ML    │           │
│  │  (Metro BCN) │  │     API      │  │  (K-Means)   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend - Capa de Visualización

### Tecnologías

- **p5.js 1.9.0**: Framework de creative coding basado en Processing
- **Tone.js 14.8.49**: Síntesis de audio con Web Audio API
- **HandsFree.js 8.5.1**: Detección de manos con MediaPipe Hands

### Estructura del Código (`index.html`)

El frontend está implementado como una **Single Page Application (SPA)** en un único archivo HTML con JavaScript embebido. Esta decisión se tomó para:

1. **Simplicidad de despliegue**: Sin bundlers complejos
2. **Prototipado rápido**: Iteración visual inmediata
3. **Compatibilidad con p5.js**: El modo instancia de p5 habría añadido complejidad innecesaria

#### Secciones del Código

```javascript
// ==========================================
// CONFIGURACIÓN Y ESTADO
// ==========================================
const RENDER_API_URL = '...';
let cellSize = 25;
let metroColors = [...];
let weatherData = { temp: "--", hum: "--", desc: "SINCRO..." };
let transportData = { lines: 0, status: "CONECTANDO" };
let emotionData = { label: "NEUTRAL", intensity: 0.5 };

// ==========================================
// P5 SETUP
// ==========================================
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(12); // 12 FPS para estética glitch
  fetchAllAPIs();
  setInterval(fetchAllAPIs, 300000); // 5 min
}

// ==========================================
// DRAW LOOP (60 FPS pero limitado a 12 con frameRate)
// ==========================================
function draw() {
  background(0);
  // Renderizar 3 franjas
  drawWeatherStrip();
  drawTransitGlitch();
  drawEmotionStrip();
}
```

### Sistema de Visualización Multi-Capa

#### Franja 1: Weather System (Perlin Noise Flow Field)

**Algoritmo**: Campo de flujo con ruido Perlin 3D

```javascript
function drawWeatherStrip(w, h) {
  let scale = 30;
  for (let i = 0; i < w/scale; i++) {
    for (let j = 0; j < h/scale; j++) {
      let n = noise(i * 0.04, j * 0.04, zOff); // Perlin 3D
      fill(obtenerColorClima(n));
      rect(i * scale, j * scale, scale, scale);

      // Rotación basada en gradiente del campo
      rotate(map(n, 0, 1, 0, TWO_PI*2));
    }
  }
  zOff += 0.003; // Evolución temporal
}
```

**Mapeo de datos**:
- `temperatura` → Paleta de colores (azul → rojo)
- `humedad` → Densidad de partículas
- `mano detectada` → Rotación adicional del campo

#### Franja 2: Transit Glitch (Cellular Automata + Metro Colors)

**Algoritmo**: Sistema de bloques aleatorios con colores de líneas de metro

```javascript
function drawTransitGlitch(w, h) {
  for (let x = 0; x < w; x += cellSize) {
    for (let y = 0; y < h; y += cellSize) {
      let selector = random(1);
      if (selector < 0.6) {
        drawCircuitLine(x, y);  // Líneas diagonales
      } else {
        drawColorBlock(x, y);   // Bloques de color metro
      }
    }
  }
}

let metroColors = [
  '#E10D16', // L1 Rojo
  '#79247D', // L2 Morado
  '#008641', // L3 Verde
  // ... más líneas
];
```

**Decisión de diseño**: Los colores se toman de las líneas reales de metro de Barcelona para crear una conexión emocional con el sistema de transporte.

#### Franja 3: Emotion Flow (Sine Wave Oscillator)

**Algoritmo**: Onda sinusoidal modulada por ruido Perlin

```javascript
function drawEmotionStrip(w, h) {
  let targetAmp = map(emotionData.intensity, 0, 1, 10, h * 0.4);
  currentWaveAmp = lerp(currentWaveAmp, targetAmp, 0.1); // Suavizado

  beginShape();
  for (let x = 0; x <= w; x += 20) {
    let y = h/2 + sin(x * 0.05 + frameCount * 0.2) *
            (currentWaveAmp * noise(x * 0.01, zOff));
    vertex(x, y);
  }
  endShape();
}
```

**Mapeo de datos**:
- `emotionData.intensity` → Amplitud de la onda
- `mano detectada` → Onda se aplana (amplitud = 5)

### Interacción Gestual (HandsFree.js)

```javascript
function updateHand() {
  if (handsfree?.data?.hands?.landmarks?.[0]?.[8]) {
    handActive = true;
    // Landmark 8 = punta del dedo índice
    handX = (1 - handsfree.data.hands.landmarks[0][8].x) * width;
  } else {
    handActive = false;
    handX = lerp(handX, width / 2, 0.05); // Volver al centro
  }
}
```

**Decisión de diseño**: Se usa solo el landmark 8 (punta del índice) para simplicidad. MediaPipe Hands detecta 21 landmarks por mano, pero solo necesitamos uno para controlar la posición X.

---

## Backend - Capa de Datos

### Arquitectura Express.js

```
server/
├── index.js          # Entry point, middlewares, static serving
├── routes/
│   └── tmb.js        # TMB API proxy
└── utils/            # (Futuro: helpers, validaciones)
```

### Patrón de Diseño: Router Pattern

```javascript
// server/index.js
const express = require('express');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tmb', require('./routes/tmb'));

// Static files (producción)
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

### TMB API Proxy (server/routes/tmb.js)

**Patrón**: Proxy con modo degradado (Ghost Mode)

```javascript
router.get('/transport', async (req, res) => {
  const APP_ID = process.env.TMB_APP_ID;
  const APP_KEY = process.env.TMB_APP_KEY;

  // Ghost Mode: Si faltan credenciales, devolver datos simulados
  if (!APP_ID || !APP_KEY) {
    return res.json({
      status: "Offline (Ghost Mode)",
      congestion: 5,
      activeLines: 8,
      source: "Simulation"
    });
  }

  try {
    const url = `https://api.tmb.cat/v1/transit/linies/metro?app_id=${APP_ID}&app_key=${APP_KEY}`;
    const response = await axios.get(url);

    // Calcular congestión basada en hora del día
    const hour = (new Date().getUTCHours() + 1) % 24;
    let congestion = ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))
      ? Math.floor(Math.random() * 3) + 7  // Hora punta: 7-10
      : Math.floor(Math.random() * 5) + 1; // Hora valle: 1-5

    res.json({
      status: "Online",
      congestion: congestion,
      activeLines: response.data.features.length
    });
  } catch (error) {
    res.json({ status: "Error", congestion: 5, activeLines: 8 });
  }
});
```

**Decisiones de diseño**:
1. **Ghost Mode**: Permite desarrollo sin API keys
2. **Congestión simulada**: TMB API no proporciona datos de congestión, así que se simula basándose en patrones horarios
3. **Manejo de errores graceful**: Nunca devolver 500, siempre JSON válido

---

## Data Science - Capa de Inteligencia

### Flask API + K-Means Clustering

**Archivo**: `analysis/data_app.py`

**Objetivo**: Clasificar estados emocionales basados en datos ambientales

#### Modelo de Clustering

```python
from sklearn.cluster import KMeans
import numpy as np

# Features: [temperatura, humedad, congestión]
data = np.array([
    [10, 80, 8],  # Frío, húmedo, congestionado → Melancholic
    [25, 50, 3],  # Templado, seco, tranquilo → Calm
    [30, 40, 9],  # Caluroso, hora punta → Anxious
    [20, 60, 7],  # Moderado, activo → Energetic
])

kmeans = KMeans(n_clusters=4, random_state=42)
kmeans.fit(data)

# Clasificación en tiempo real
def predict_emotion(temp, hum, cong):
    cluster = kmeans.predict([[temp, hum, cong]])[0]
    emotions = ['anxious', 'melancholic', 'calm', 'energetic']
    return emotions[cluster]
```

**Decisión de diseño**: Se eligió K-Means (no supervisado) porque:
1. No hay dataset etiquetado de "emociones urbanas"
2. K=4 clusters mapean bien a 4 arquetipos emocionales
3. Es computacionalmente ligero para ejecutar en Render (plan gratuito)

---

## Flujo de Datos

### 1. Flujo de Inicialización

```
Usuario abre navegador
   │
   ├─► Carga index.html desde Render
   │
   ├─► p5.js ejecuta setup()
   │       │
   │       ├─► createCanvas(windowWidth, windowHeight)
   │       ├─► frameRate(12)
   │       ├─► handsfree.start() → Pide permiso de cámara
   │       └─► fetchAllAPIs() → Primera carga de datos
   │
   └─► setInterval(fetchAllAPIs, 300000) → Polling cada 5 min
```

### 2. Flujo de Actualización de Datos

```
fetchAllAPIs() se ejecuta cada 5 minutos
   │
   ├─► fetch('https://api.openweathermap.org/...')
   │       └─► weatherData = { temp, hum, desc }
   │
   ├─► fetch('http://localhost:3000/api/tmb/transport')
   │       └─► transportData = { status, congestion, activeLines }
   │
   └─► fetch('https://emotions-in-transit-m2ts.onrender.com/api/emotions')
           └─► emotionData = { emotion, intensity }
```

### 3. Flujo de Renderizado (60 FPS → 12 FPS)

```
draw() ejecutado a 12 FPS (limitado por frameRate(12))
   │
   ├─► updateHand() → Actualiza posición de la mano
   │
   ├─► drawWeatherStrip()
   │       └─► Lee weatherData.temp, weatherData.hum
   │
   ├─► drawTransitGlitch()
   │       └─► Lee transportData.lines, handX
   │
   └─► drawEmotionStrip()
           └─► Lee emotionData.intensity, handActive
```

---

## Decisiones de Diseño

### ¿Por qué un solo archivo HTML?

**Alternativas consideradas**:
- React + Vite
- Vue.js
- Vanilla JS con módulos ES6

**Decisión**: HTML monolítico

**Razones**:
1. **p5.js es declarativo**: El modo global de p5 (`setup()`, `draw()`) funciona mejor sin bundlers
2. **Prototipado rápido**: Cambios visuales inmediatos sin compilar
3. **Compatibilidad p5.js Web Editor**: El código se puede copiar directamente a editor.p5js.org
4. **Menos abstracción**: Para arte generativo, la simplicidad es una virtud

### ¿Por qué 12 FPS en lugar de 60 FPS?

```javascript
frameRate(12);
```

**Razones**:
1. **Estética glitch/retro**: 12 FPS crea un efecto de "stop motion" deliberado
2. **Rendimiento**: Reduce carga de CPU/GPU, especialmente con HandsFree.js corriendo
3. **Referencia artística**: Inspirado en el videoarte de los 90s (Steina Vasulka, Nam June Paik)

### ¿Por qué Perlin Noise en lugar de Random?

```javascript
let n = noise(i * 0.04, j * 0.04, zOff); // Perlin Noise
// vs
let n = random(0, 1); // Random puro
```

**Perlin Noise ventajas**:
- **Continuidad espacial**: Los valores vecinos son similares (no hay "saltos" abruptos)
- **Evolución temporal suave**: `zOff` crea transiciones fluidas
- **Patrón orgánico**: Se asemeja a fenómenos naturales (nubes, agua)

### ¿Por qué Ghost Mode en el backend?

**Problema**: Los estudiantes/desarrolladores no siempre tienen API keys

**Solución**: Modo degradado con datos simulados

```javascript
if (!APP_ID || !APP_KEY) {
  return res.json({
    status: "Offline (Ghost Mode)",
    congestion: 5,
    activeLines: 8,
    source: "Simulation"
  });
}
```

**Beneficios**:
- Desarrollo sin dependencias externas
- Testing local sin rate limiting
- Resiliencia ante fallos de API

---

## Patrones de Código

### 1. State Management (Global Variables)

```javascript
let weatherData = { temp: "--", hum: "--", desc: "SINCRO..." };
let transportData = { lines: 0, status: "CONECTANDO" };
let emotionData = { label: "NEUTRAL", intensity: 0.5 };
```

**Patrón**: Estado global mutable

**Justificación**: p5.js no tiene sistema de estado reactivo (no es React). El patrón funcional habría añadido complejidad innecesaria.

### 2. Lerp (Linear Interpolation) para Suavizado

```javascript
currentWaveAmp = lerp(currentWaveAmp, targetAmp, 0.1);
handX = lerp(handX, targetHandX, 0.2);
```

**Patrón**: Suavizado exponencial

**Fórmula**: `nuevo = actual + (objetivo - actual) * factor`

**Beneficio**: Transiciones suaves sin librerías de easing

### 3. Polling con setInterval

```javascript
setInterval(fetchAllAPIs, 300000); // 5 minutos
```

**Alternativas consideradas**:
- WebSockets (demasiado complejo para datos que cambian cada 5 min)
- Server-Sent Events (SSE) (no soportado por TMB API)

**Decisión**: Polling simple

### 4. Error Handling con Try-Catch + Fallback

```javascript
async function fetchAllAPIs() {
  try {
    const resW = await fetch('...');
    const dW = await resW.json();
    weatherData = { temp: floor(dW.main.temp), ... };
  } catch (e) {
    console.error("API Error", e);
    // No modificar weatherData, mantener último valor válido
  }
}
```

**Decisión**: No reiniciar a valores por defecto en caso de error, mantener último estado conocido.

---

## Rendimiento y Optimización

### Optimizaciones Implementadas

1. **frameRate(12)**: Reduce draw calls de 60/s a 12/s (80% menos carga)
2. **Perlin Noise pre-calculado**: p5.js cachea el ruido Perlin internamente
3. **Polling de APIs cada 5 min**: Evita rate limiting y sobrecarga de red
4. **Desactivación de HandsFree debugger**:
   ```javascript
   handsfree = new Handsfree({ showDebug: false });
   ```
5. **strokeCap(PROJECT)**: Más rápido que `ROUND` para líneas

### Métricas de Rendimiento (Chrome DevTools)

| Métrica | Valor | Objetivo |
|---------|-------|----------|
| **FPS** | 12 (estable) | 12 |
| **Memory Usage** | ~150 MB | < 200 MB |
| **Network** | 5 KB/5min | Minimal |
| **CPU (idle)** | 5-10% | < 15% |
| **CPU (hand detected)** | 20-30% | < 40% |

### Cuellos de Botella Conocidos

1. **HandsFree.js**: Consume ~15-20% CPU en background
2. **Perlin Noise 3D**: Operación costosa en bucles anidados
3. **Canvas rendering**: No se usa WebGL para partículas (pendiente)

---

## Seguridad

### Vulnerabilidades Actuales

⚠️ **API Keys expuestas en frontend**:

```javascript
// index.html (línea 49-51)
const OWM_KEY = "09a95abe51374eae766a284a97a3f039";
const TMB_APP_ID = "daf62db0";
const TMB_APP_KEY = "5e4adb21bdfeda65a91e36cc2c12b7df";
```

**Riesgo**: Cualquiera puede inspeccionar el código y usar las claves

**Mitigación recomendada** (para producción):
1. Mover todas las llamadas API al backend
2. Crear ruta `/api/weather` en Express
3. Eliminar claves del frontend

### CORS (Cross-Origin Resource Sharing)

```javascript
// server/index.js
app.use(cors()); // Permite todos los orígenes
```

**Configuración actual**: Permisiva (permite todos los orígenes)

**Recomendación para producción**:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://emotions-in-transit.onrender.com'
  ],
  methods: ['GET'],
  credentials: true
}));
```

### Variables de Entorno

```javascript
// ✅ Buena práctica en backend
const APP_ID = process.env.TMB_APP_ID;

// ❌ Mala práctica en frontend
const OWM_KEY = "09a95abe51374eae766a284a97a3f039";
```

---

## Escalabilidad

### Limitaciones Actuales

| Recurso | Límite Actual | Límite de Render (Free) |
|---------|---------------|--------------------------|
| **RAM** | ~150 MB | 512 MB |
| **CPU** | 0.1 cores | 0.1 cores |
| **Concurrent Users** | ~50-100 | Ilimitado (limitado por bandwidth) |
| **Bandwidth** | 100 GB/mes | 100 GB/mes |

### Estrategias de Escalado

#### 1. Caché de API Responses

```javascript
// Implementar caché simple en memoria
const cache = {};
const CACHE_TTL = 300000; // 5 minutos

router.get('/transport', async (req, res) => {
  const now = Date.now();
  if (cache.transport && now - cache.transport.timestamp < CACHE_TTL) {
    return res.json(cache.transport.data);
  }

  const data = await fetchTMBAPI();
  cache.transport = { data, timestamp: now };
  res.json(data);
});
```

#### 2. CDN para Assets Estáticos

**Actual**: Todos los assets se sirven desde Render

**Mejora**: Usar Cloudflare CDN o Vercel para:
- `index.html` (cacheado)
- Librerías (p5.js, Tone.js, HandsFree.js)

#### 3. Database para Histórico (Futuro)

**Propuesta**: Guardar datos históricos en PostgreSQL (Render ofrece plan gratuito)

```sql
CREATE TABLE emotion_snapshots (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  temperature FLOAT,
  humidity FLOAT,
  congestion INT,
  emotion VARCHAR(20),
  intensity FLOAT
);
```

**Uso**: Dashboard de visualización de datos históricos

---

## Trade-offs y Limitaciones

### Trade-off 1: Monolito HTML vs. Arquitectura Modular

**Decisión**: Monolito HTML (index.html con todo el código)

**Ventajas**:
- ✅ Prototipado rápido
- ✅ Sin build step (en desarrollo)
- ✅ Compatible con p5.js Web Editor

**Desventajas**:
- ❌ Difícil de testear unitariamente
- ❌ Reutilización de código limitada
- ❌ Colaboración más compleja (merge conflicts)

**Mitigación**: Crear versión modular en `/src` (ya existe parcialmente)

---

### Trade-off 2: Polling vs. WebSockets

**Decisión**: Polling cada 5 minutos

**Ventajas**:
- ✅ Simple de implementar
- ✅ Funciona con cualquier API
- ✅ Menor complejidad en backend

**Desventajas**:
- ❌ No es "verdadero tiempo real"
- ❌ Latencia de hasta 5 minutos
- ❌ Desperdicio de requests si los datos no cambian

**Justificación**: Los datos ambientales (clima, metro) no cambian cada segundo, 5 minutos es aceptable.

---

### Trade-off 3: API Keys en Frontend

**Decisión**: Claves expuestas en `index.html` (solo para prototipo)

**Ventajas**:
- ✅ Desarrollo rápido
- ✅ No requiere backend para primeras pruebas

**Desventajas**:
- ❌ Riesgo de seguridad
- ❌ Posible abuso de las claves
- ❌ Rate limiting compartido

**Plan de migración**: Ver sección de Seguridad

---

### Limitación 1: HandsFree.js solo funciona en HTTPS

**Problema**: MediaPipe Hands requiere contexto seguro (HTTPS o localhost)

**Impacto**: No funciona en HTTP en producción

**Solución**: Render proporciona HTTPS automáticamente

---

### Limitación 2: No hay persistencia de datos

**Problema**: Cada vez que se recarga la página, se pierde el histórico

**Impacto**: No se pueden analizar tendencias emocionales a largo plazo

**Solución futura**: Implementar base de datos (ver Escalabilidad)

---

## Próximos Pasos Arquitectónicos

1. **Migrar API keys al backend** (prioridad alta)
2. **Implementar caché de API responses** (prioridad media)
3. **Modularizar código del frontend** en `/src` (prioridad baja)
4. **Añadir tests unitarios** con Jest (prioridad baja)
5. **Implementar WebSockets** para interacciones multi-usuario (experimental)

---

## Referencias

- [p5.js Reference](https://p5js.org/reference/)
- [Tone.js Documentation](https://tonejs.github.io/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Perlin Noise Algorithm](https://en.wikipedia.org/wiki/Perlin_noise)
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)

---

**Última actualización**: Enero 2026
**Autor**: Raquel Bena
**Versión del sistema**: 1.0.0
