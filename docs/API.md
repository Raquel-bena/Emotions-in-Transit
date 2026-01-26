# API Documentation - Emotions in Transit

Esta documentación describe los endpoints disponibles en el backend de **Emotions in Transit** y cómo interactuar con las APIs externas.

---

## 📋 Tabla de Contenidos

- [Backend API](#backend-api)
  - [TMB Transport Data](#1-tmb-transport-data)
  - [Weather Data](#2-weather-data-futuro)
- [External APIs](#external-apis)
  - [TMB API](#tmb-api-transports-metropolitans-de-barcelona)
  - [OpenWeatherMap API](#openweathermap-api)
  - [Flask Emotion API](#flask-emotion-api-custom)
- [Códigos de Estado](#códigos-de-estado)
- [Rate Limiting](#rate-limiting)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## Backend API

Base URL (local): `http://localhost:3000`
Base URL (producción): `https://emotions-in-transit.onrender.com`

### 1. TMB Transport Data

Obtiene datos del estado del metro de Barcelona, incluyendo líneas activas y nivel de congestión simulado.

#### Endpoint

```
GET /api/tmb/transport
```

#### Parámetros

Ninguno. Las credenciales se obtienen de las variables de entorno.

#### Respuesta Exitosa (200 OK)

```json
{
  "status": "Online",
  "congestion": 7,
  "activeLines": 12,
  "serverTime": "18:00",
  "source": "TMB API"
}
```

#### Respuesta en Modo Simulación (Ghost Mode)

Si faltan las claves `TMB_APP_ID` o `TMB_APP_KEY`:

```json
{
  "status": "Offline (Ghost Mode)",
  "congestion": 5,
  "activeLines": 8,
  "source": "Simulation"
}
```

#### Respuesta de Error

```json
{
  "status": "Error",
  "congestion": 5,
  "activeLines": 8
}
```

#### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `status` | String | Estado de la conexión: "Online", "Offline (Ghost Mode)", "Error" |
| `congestion` | Number | Nivel de congestión (1-10). Basado en la hora del día |
| `activeLines` | Number | Número de líneas de metro activas |
| `serverTime` | String | Hora del servidor (formato "HH:00") |
| `source` | String | Fuente de datos: "TMB API" o "Simulation" |

#### Lógica de Congestión

- **Hora punta** (7-9h, 17-19h): `congestion` entre 7-10
- **Hora valle** (resto del día): `congestion` entre 1-5

#### Ejemplo de Uso (JavaScript)

```javascript
async function getTransportData() {
  const response = await fetch('http://localhost:3000/api/tmb/transport');
  const data = await response.json();
  console.log(`Metro status: ${data.status}`);
  console.log(`Congestion level: ${data.congestion}/10`);
}
```

---

### 2. Weather Data (Futuro)

**Estado**: Planeado (actualmente se consume directamente en el frontend)

```
GET /api/weather (Próximamente)
```

---

## External APIs

### TMB API (Transports Metropolitans de Barcelona)

**URL Base**: `https://api.tmb.cat/v1`

#### Endpoint: Líneas de Metro

```
GET /transit/linies/metro?app_id={APP_ID}&app_key={APP_KEY}
```

#### Autenticación

Requiere:
- `app_id`: ID de aplicación TMB
- `app_key`: Clave de API TMB

Solicita credenciales en: [TMB Developers](https://developer.tmb.cat/)

#### Respuesta de Ejemplo

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "NOM_LINIA": "L1",
        "DESC_LINIA": "Hospital de Bellvitge - Fondo",
        "COLOR_LINIA": "#E10D16"
      }
    }
  ]
}
```

---

### OpenWeatherMap API

**URL Base**: `https://api.openweathermap.org/data/2.5`

#### Endpoint: Clima Actual

```
GET /weather?id=3128760&appid={API_KEY}&units=metric
```

#### Parámetros

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| `id` | 3128760 | ID de Barcelona |
| `appid` | Tu API Key | Clave de OpenWeatherMap |
| `units` | metric | Unidades métricas (Celsius) |

#### Respuesta de Ejemplo

```json
{
  "main": {
    "temp": 18.5,
    "humidity": 65,
    "pressure": 1013
  },
  "weather": [
    {
      "main": "Clear",
      "description": "clear sky"
    }
  ]
}
```

#### Uso en el Proyecto

```javascript
// Desde index.html
const OWM_KEY = "09a95abe51374eae766a284a97a3f039";
const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?id=3128760&appid=${OWM_KEY}&units=metric`
);
const data = await response.json();
weatherData = {
  temp: Math.floor(data.main.temp),
  hum: data.main.humidity,
  desc: data.weather[0].main.toUpperCase()
};
```

---

### Flask Emotion API (Custom)

**URL Base**: `https://emotions-in-transit-m2ts.onrender.com`

#### Endpoint: Estado Emocional

```
GET /api/emotions
```

#### Descripción

API Flask personalizada que utiliza **K-Means clustering** para clasificar estados emocionales basados en datos ambientales (temperatura, humedad, congestión).

#### Respuesta de Ejemplo

```json
{
  "emotion": "calm",
  "intensity": 0.65,
  "cluster": 2,
  "features": {
    "temperature": 18.5,
    "humidity": 65,
    "congestion": 3
  }
}
```

#### Estados Emocionales

| Cluster | Emoción | Descripción |
|---------|---------|-------------|
| 0 | `anxious` | Alta congestión, temperatura extrema |
| 1 | `melancholic` | Lluvia, humedad alta |
| 2 | `calm` | Condiciones templadas, baja congestión |
| 3 | `energetic` | Hora punta, clima agradable |

#### Código del Modelo (Python)

Ver `/analysis/data_app.py` para la implementación completa del clustering K-Means.

---

## Códigos de Estado

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 400 | Bad Request | Parámetros inválidos |
| 401 | Unauthorized | Credenciales API inválidas |
| 404 | Not Found | Endpoint no existe |
| 500 | Internal Server Error | Error del servidor |
| 503 | Service Unavailable | API externa no disponible |

---

## Rate Limiting

### TMB API
- **Límite**: 1000 requests/día (aproximado)
- **Recomendación**: Cachear respuestas por 5-10 minutos

### OpenWeatherMap API
- **Plan gratuito**: 60 requests/minuto
- **Límite diario**: 1,000,000 calls/mes

### Implementación en el Proyecto

```javascript
// En index.html, las APIs se consultan cada 5 minutos
setInterval(fetchAllAPIs, 300000); // 300,000ms = 5 minutos
```

---

## Ejemplos de Uso

### Ejemplo 1: Obtener datos completos del sistema

```javascript
async function fetchAllData() {
  try {
    // 1. Datos de transporte (vía backend)
    const transportRes = await fetch('http://localhost:3000/api/tmb/transport');
    const transport = await transportRes.json();

    // 2. Datos meteorológicos (directo)
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?id=3128760&appid=${OWM_KEY}&units=metric`
    );
    const weather = await weatherRes.json();

    // 3. Estado emocional (API Flask)
    const emotionRes = await fetch('https://emotions-in-transit-m2ts.onrender.com/api/emotions');
    const emotion = await emotionRes.json();

    console.log('Transport:', transport);
    console.log('Weather:', weather);
    console.log('Emotion:', emotion);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
```

### Ejemplo 2: Manejo de errores robusto

```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Ejemplo 3: Probar API desde terminal

```bash
# TMB Transport (vía backend)
curl http://localhost:3000/api/tmb/transport

# Weather (directo)
curl "https://api.openweathermap.org/data/2.5/weather?id=3128760&appid=TU_API_KEY&units=metric"

# Emotions (Flask)
curl https://emotions-in-transit-m2ts.onrender.com/api/emotions
```

---

## Variables de Entorno Requeridas

```bash
# .env
TMB_APP_ID=tu_app_id_tmb
TMB_APP_KEY=tu_clave_tmb
OWM_API_KEY=tu_clave_openweathermap
FLASK_API_URL=https://emotions-in-transit-m2ts.onrender.com/api/emotions
PORT=3000
```

---

## Notas Adicionales

### Modo Simulación (Ghost Mode)

Cuando faltan credenciales API, el sistema entra en **Ghost Mode**:
- Genera datos simulados realistas
- Permite desarrollo sin APIs externas
- Útil para pruebas locales

### CORS

El backend tiene CORS habilitado para permitir requests desde:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Express server)
- `https://emotions-in-transit.onrender.com` (Producción)

### Seguridad

⚠️ **IMPORTANTE**: Nunca expongas las API keys en el frontend. El código actual tiene las claves en `index.html` solo para prototipado. En producción, todas las llamadas deben pasar por el backend.

**Migración recomendada:**
```javascript
// ❌ NO hacer esto en producción
const OWM_KEY = "09a95abe51374eae766a284a97a3f039";

// ✅ Hacer esto en su lugar
const weather = await fetch('/api/weather'); // Proxy backend
```

---

## Soporte

Para problemas con las APIs:
- **TMB API**: [developer.tmb.cat](https://developer.tmb.cat/)
- **OpenWeatherMap**: [openweathermap.org/faq](https://openweathermap.org/faq)
- **Proyecto**: [GitHub Issues](https://github.com/Raquel-bena/Emotions-in-Transit/issues)
