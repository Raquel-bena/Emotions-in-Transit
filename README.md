# Emotions in Transit: Biometric City

A real-time urban visualization installation that maps the "emotional" and "physical" state of Barcelona into a digital generative canvas. The system consumes data from weather, transport, and environmental sensors to generate a living digital organism.

## 🔗 Data Sources (Official APIs)

- **Meteorology**: [OpenWeatherMap](https://openweathermap.org/api)
- **Transport (Metro/Bus)**: [TMB Open Data](https://developer.tmb.cat/)
- **Environment (Noise/Air Quality)**: [Barcelona Environmental Maps](https://ajuntament.barcelona.cat/mapes-dades-ambientals/qualitataire/en/)
- **Noise Ordinance**: [Barcelona Noise Map](https://ajuntament.barcelona.cat/mapes-dades-ambientals/soroll/en/)

## 🎨 Visual Mapping System

| Data | Visual Parameter | Aesthetic Meaning |
|------|------------------|-------------------|
| **Temperature** | Color (Blue -> Red) | Thermal Energy |
| **Humidity** | Blur / Fog | Atmospheric Density |
| **Noise (dB)** | Jitter / Vibration | Urban Stress / Activity |
| **Traffic** | Chaos / Rotation | Flow & Entropy |
| **Time (Ld/Le/Ln)**| Lighting / Contrast | Circadian Rhythm |

## 🛠️ Tech Stack

- **Frontend**: API p5.js (Visuals), Tone.js (Audio), Tweakpane (GUI), Vite.
- **Backend**: Node.js, Express (Data Normalization & Caching).

## 🚀 How to Run

1.  Clone repository.
2.  Install dependencies: `npm install`
3.  Configure `.env` with your API Keys (OWM_KEY, TMB_APP_ID, etc.). *Defaults to Simulation Mode if keys are missing.*
4.  Start Development Server: `npm run dev`
5.  Start Backend Server: `npm start`

