<div align="center">

# EMOTIONS IN TRANSIT
### Urban Data Visualization & Generative Environment

![Status](https://img.shields.io/badge/Status-Development-blue)
![Stack](https://img.shields.io/badge/Stack-Full_Web_Architecture-blueviolet)
![Degree](https://img.shields.io/badge/MSc-MDACT_La_Salle-003399)
![License](https://img.shields.io/badge/License-MIT-green)

<p align="center">
  <img src="docs/assets/banner_render_v2.jpg" alt="Project Visualization Render" width="100%">
</p>

*A Master Thesis project submitted for the MSc in Digital Arts and Creative Technologies.*
*Academic Year 2025-2026*

[View Live Demo](http://localhost:5173) | [Read Full Report (PDF)](docs/report/Final_Thesis.pdf)

</div>

---

## 📑 Abstract
*(Project Pivot: From Biometrics to Urban Biomes)*

**Emotions in Transit** reinterprets the city of Barcelona as a living organism. Instead of focusing on individual biometrics, this project shifts the lens to the "urban pulse." By aggregating real-time data from public transport (TMB), bicycle usage (Bicing), and meteorology (OpenWeather), the system translates the city's efficiency, chaos, and rhythm into an immersive audiovisual experience.

The project moves away from proprietary software (TouchDesigner) to a scalable **Full-Stack Web Architecture**, demonstrating how open web technologies (`p5.js`, `Tone.js`, `Node.js`) can be used to democratize complex data visualization in public spaces.

**Keywords:** *Urban Computing, Data Visualization, Generative Art, Full-Stack Development, Real-Time APIs.*

---

## ⚙️ System Architecture (Data Flow)
*Visualizing the technical pipeline for Evaluation Objective 3 (Clarity & Structure).*

El sistema ha evolucionado de una conexión serial local a una arquitectura Cliente-Servidor desacoplada.

```mermaid
graph LR
    A[External APIs] -->|Raw JSON| B(Node.js Backend)
    subgraph "Server Side (Port 3000)"
    B -->|TMB & OpenWeather| C{Data Normalizer}
    C -->|Calculated 'Mood'| D[API Endpoint]
    end
    
    subgraph "Client Side (Port 5173)"
    D -->|Fetch JSON| E[Vite Frontend]
    E -->|Visual Render| F[p5.js Instance]
    E -->|Sonification| G[Tone.js Engine]
    end
    