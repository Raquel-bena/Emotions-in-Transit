# Emotions (in) Transit
> **A dialogue between data, body, and city.**
> *Master's Thesis (TFM) - Generative Art Installation & Biofeedback.*

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Hardware](https://img.shields.io/badge/Hardware-ESP32_IoT-red)
![Stack](https://img.shields.io/badge/Tech-Python_%7C_P5.js_%7C_WebSockets-blueviolet)

---

## The Urban Paradox: Context

We live in the era of the *Smart City*: cities optimized by data and efficiency. However, the WHO warns of a growing urban mental health crisis. We are **digitally connected, yet emotionally isolated**.

This project intervenes in **"Non-Places"** (Marc Augé's concept): anonymous transit spaces where we coexist but do not connect.

### The Central Question
> *Can design, acting through technology and generative art, create a bridge of empathy within these anonymous spaces?*

---

## The Ethical Pivot: From Surveillance to Connection

During development, the project evolved drastically based on ethical findings:

| Phase 1: Exploration (Discarded) | Phase 2: Final Proposal (Biofeedback) |
| :--- | :--- |
| Use of **Computer Vision** for facial emotion detection. | Use of **Biometric Sensors** (pulse) + Environmental Data. |
| Perceived as **Surveillance**. | Perceived as **Connection**. |
| Focus on "EGO" (identification). | Focus on "ECO" (systemic connection). |

---

## Technical Architecture

The system synchronizes the "slow" pace of the city with the "fast" pace of the human body through a hybrid architecture:

### 1. Hardware (Low Latency IoT)
* **Brain:** **ESP32** Microcontroller (Dual Core).
    * *Core 0:* Wi-Fi and WebSockets management.
    * *Core 1:* Uninterrupted sensor reading.
* **Sensor:** MAX30102 (Pulse Oximetry).
* **Latency:** < 100ms (perceptual real-time).

### 2. Urban Variables (Data Inputs)
External APIs are integrated to define the city's "mood":
* **Acoustic Stress:** Noise level (dB) [SmartCitizen].
* **Collective Flow:** Transport demand [TMB API].
* **Atmosphere:** Weather and pressure [OpenWeatherMap].

### 3. The Synchronization Challenge (Python Backend)
How to merge human pulse (10ms) with atmospheric pressure (1h)?
We use **Pandas and `pd.merge_asof`** to align time series by proximity, allowing the "slow" state of the city to modulate the user's "fast" visual response.

### 4. Generative Visualization (Frontend)
* **Engine:** p5.js + WebGL (Shaders).
* **System:** +4,000 fluid particles at 60 FPS.
* **Poetic Logic:**
    * *High Noise + Low Pressure* → Agitated particles ("Urban Anxiety").
    * *Fluid Traffic + Stable Weather* → Harmonic particles ("Calm").
    * *User Pulse* → Acts as an anchor and modulator of the chaos.

---

## Installation & Deployment

### Prerequisites
* Node.js (v16+)
* Python (3.8+)
* ESP32 Device (for the full experience)

### Local Setup
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Raquel-bena/Emotions-in-Transit.git](https://github.com/Raquel-bena/Emotions-in-Transit.git)
    ```
2.  **Environment Configuration:**
    Rename `.env.example` to `.env` and add your API Keys (TMB, OpenWeather).
3.  **Run Frontend:**
    ```bash
    npm install
    npm run dev
    ```
4.  **Run Python Server:**
    ```bash
    cd server
    pip install -r requirements.txt
    python app.py
    ```

---

## Future & Scalability

* **Node Network:** Installation of multiple totems to compare the "emotional state" across different neighborhoods.
* **New Variables:** Air Quality (PM2.5) and Social Media Sentiment Analysis.
* **5G Integration:** Greater autonomy for installations in public spaces.

---

## Links & Resources

* **Live Demo:** [Emotions in Transit (Render)](https://emotions-in-transit.onrender.com)
* **p5.js Collection:** [Editor Sketches](https://editor.p5js.org/Rb.Graphicx/collections/_a6YMhMXm)
* **Portfolio:** [Instagram @rb.graphicx](https://www.instagram.com/rb.graphicx/)

---
*Developed by [Raquel Benavides](https://github.com/Raquel-bena)*