# Emotions in Transit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://emotions-in-transit.onrender.com)

> *"This artwork does not see you. It listens to the city."*

**Instalación de arte generativo** que traduce los datos ambientales de Barcelona en una experiencia audiovisual inmersiva, fomentando la reflexión sobre la soledad urbana a través de una arquitectura tecnológica ética.

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Demo en Vivo](#-demo-en-vivo)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [APIs Integradas](#-apis-integradas)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Documentación](#-documentación)
- [Contribuciones](#-contribuciones)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## 🎨 Descripción del Proyecto

**Emotions in Transit** es una instalación de arte generativo que emerge como respuesta crítica a la paradoja de la hiperconexión en las ciudades inteligentes. En lugar de tecnologías de vigilancia extractiva, este proyecto propone:

- **Correlación Poética**: Uso de datos ambientales públicos como metáforas emocionales
- **Biometría de Regalo**: Interacción voluntaria con pulso (sin reconocimiento facial)
- **Visceralización de Datos**: Sentir los datos a través de sistemas de partículas fluidas, no leer gráficos

El sistema captura datos en tiempo real del transporte público de Barcelona (TMB), condiciones meteorológicas, y los traduce en visualizaciones generativas y paisajes sonoros usando **p5.js** y **Tone.js**.

---

## 🌐 Demo en Vivo

**🚀 Aplicación desplegada:** [https://emotions-in-transit.onrender.com](https://emotions-in-transit.onrender.com)

**🎮 Prototipos en p5.js Editor:**
- [Colección completa](https://editor.p5js.org/Rb.Graphicx/collections/RoZ2mwKzv)
- [Sistema de partículas](https://editor.p5js.org/Rb.Graphicx/sketches/Dl3zN8wRc)
- [Experimentos de campo de flujo](https://editor.p5js.org/Rb.Graphicx/sketches/9mYw3XWJj)
- [Demo audiovisual](https://editor.p5js.org/Rb.Graphicx/sketches/kH1zXQqVp)

---

## ✨ Características Principales

### Visualización Multicapa
- **Franja 1 - Weather System**: Grid de campo de flujo Perlin Noise que visualiza temperatura y humedad
- **Franja 2 - Transit Glitch**: Sistema de bloques de colores basado en líneas de metro de Barcelona (TMB)
- **Franja 3 - Emotion Flow**: Ondas sinusoidales que representan estados emocionales detectados

### Interacción Gestual
- **Detección de manos** vía HandsFree.js (MediaPipe Hands)
- **Control no invasivo**: Movimiento de manos modifica la tipografía "(In)" y la amplitud de las ondas
- **Feedback visual en tiempo real**

### Sistema de Audio Generativo
- **Tone.js**: Síntesis de audio reactiva a datos emocionales
- **Mapeo emocional**: Diferentes estados (calma, ansiedad, melancolía) generan texturas sonoras únicas

### Datos en Tiempo Real
- **API TMB**: Estado del metro de Barcelona (líneas activas, incidencias)
- **OpenWeatherMap**: Condiciones meteorológicas en Barcelona
- **Backend Flask**: Clustering K-Means para detección de estados emocionales

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (p5.js + Tone.js)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Weather    │  │   Transit    │  │   Emotion    │      │
│  │  Visualizer  │  │   Glitch     │  │    Waves     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     CORS     │  │  TMB Proxy   │  │ Weather API  │      │
│  │  Middleware  │  │   Router     │  │    Router    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL APIs                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   TMB API    │  │ OpenWeather  │  │  Flask ML    │      │
│  │  (Metro BCN) │  │     API      │  │  (K-Means)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**Tecnologías:**
- **Frontend**: p5.js (WebGL), Tone.js (Web Audio API), HandsFree.js (MediaPipe)
- **Backend**: Node.js, Express.js
- **Data Science**: Python, Flask, scikit-learn (K-Means clustering)
- **Hardware**: ESP32, Raspberry Pi 4 (para instalación física)

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** v18.0.0 o superior
- **npm** v8.0.0 o superior
- **Python** 3.9+ (opcional, para análisis de datos)
- **Git**

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/Raquel-bena/Emotions-in-Transit.git
cd Emotions-in-Transit
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# APIs externas
OWM_API_KEY=tu_clave_openweathermap
TMB_APP_ID=tu_app_id_tmb
TMB_APP_KEY=tu_clave_tmb

# Servidor
PORT=3000
NODE_ENV=development

# Flask API (opcional)
FLASK_API_URL=http://localhost:5000/api/emotions
```

**⚠️ Nota:** Si no tienes las claves API, la aplicación funcionará con datos de ejemplo.

### Paso 4: Iniciar el proyecto

**Desarrollo (Frontend + Hot Reload):**
```bash
npm run dev
```

**Producción (Backend + Frontend):**
```bash
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🎮 Uso

### Controles

- **Movimiento de mano**: Mueve tu mano frente a la cámara para controlar la tipografía "(In)" en la franja central
- **Sin mano detectada**: El sistema vuelve a su estado de reposo automáticamente
- **Datos en tiempo real**: Las visualizaciones se actualizan cada 5 minutos

### Personalización

Puedes modificar los parámetros visuales en `index.html`:

```javascript
let cellSize = 25;        // Tamaño de la cuadrícula
let metroColors = [...];  // Colores de líneas de metro
frameRate(12);            // FPS de la visualización
```

---

## 📁 Estructura del Proyecto

```
Emotions-in-Transit/
├── index.html              # Aplicación principal (visualización p5.js)
├── package.json            # Dependencias del proyecto
├── vite.config.js          # Configuración de Vite
├── render.yaml             # Configuración de despliegue en Render
│
├── src/                    # Código fuente modular
│   ├── core/               # Lógica central (sketch.js)
│   ├── visual/             # Clases visuales (Particle.js, Pulse.js)
│   ├── systems/            # Sistema de audio (AudioEngine.js)
│   ├── utils/              # Configuraciones (emotionConfig.js)
│   └── styles/             # Estilos CSS
│
├── server/                 # Backend Node.js
│   ├── index.js            # Servidor Express principal
│   ├── routes/             # Routers de API (tmb.js, weather.js)
│   └── utils/              # Utilidades del servidor
│
├── analysis/               # Scripts de análisis de datos (Python)
│   ├── data_app.py         # Aplicación Flask con K-Means
│   └── requirements.txt    # Dependencias Python
│
├── docs/                   # Documentación
│   ├── README.md           # Documentación extendida
│   ├── CONTRIBUTING.md     # Guía de contribución
│   └── build_log.txt       # Log de construcción
│
└── _archive/               # Prototipos históricos
    └── prototypes/         # Versiones anteriores del proyecto
```

---

## 🔌 APIs Integradas

### 1. TMB API (Transports Metropolitans de Barcelona)
- **Endpoint**: `https://api.tmb.cat/v1/transit/linies/metro`
- **Uso**: Obtener estado de líneas de metro activas
- **Frecuencia**: Cada 5 minutos

### 2. OpenWeatherMap API
- **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **Uso**: Temperatura, humedad y descripción del clima en Barcelona
- **Frecuencia**: Cada 5 minutos

### 3. Flask Emotion API (Custom)
- **Endpoint**: `https://emotions-in-transit-m2ts.onrender.com/api/emotions`
- **Uso**: Clasificación de estados emocionales usando K-Means
- **Respuesta**: `{ emotion: "calm", intensity: 0.7 }`

Ver [documentación de API](./docs/API.md) para más detalles.

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | p5.js, Tone.js, HandsFree.js (MediaPipe Hands) |
| **Backend** | Node.js, Express.js, CORS |
| **Build Tools** | Vite, npm |
| **Deployment** | Render.com |
| **Data Science** | Python, Flask, scikit-learn, pandas |
| **APIs** | TMB API, OpenWeatherMap API |
| **Fonts** | Google Fonts (Inter) |

---

## 📚 Documentación

- **[INSTALLATION.md](./docs/INSTALLATION.md)**: Guía detallada de instalación y troubleshooting
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)**: Decisiones de diseño y arquitectura técnica
- **[API.md](./docs/API.md)**: Documentación de endpoints y respuestas de API
- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)**: Cómo contribuir al proyecto

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Lee [CONTRIBUTING.md](./docs/CONTRIBUTING.md) para más detalles.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver el archivo [LICENSE](./LICENSE) para más detalles.

**Nota**: Este es un proyecto académico desarrollado como Trabajo de Fin de Máster.

---

## 👤 Contacto

**Raquel Bena**
- GitHub: [@Raquel-bena](https://github.com/Raquel-bena)
- Portfolio p5.js: [Rb.Graphicx](https://editor.p5js.org/Rb.Graphicx/sketches)

**Link del Proyecto**: [https://github.com/Raquel-bena/Emotions-in-Transit](https://github.com/Raquel-bena/Emotions-in-Transit)

---

## 🙏 Agradecimientos

- **TMB (Transports Metropolitans de Barcelona)** por la API abierta
- **OpenWeatherMap** por los datos meteorológicos
- **p5.js Community** por las herramientas de creative coding
- **MediaPipe** por la tecnología de detección de manos

---

<div align="center">

**Hecho con ❤️ para reflexionar sobre la soledad urbana en la era digital**

</div>
