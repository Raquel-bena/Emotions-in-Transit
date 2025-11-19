<div align="center">

# EMOTIONS IN TRANSIT
### Biometric Data Visualization in Urban Environments

![Status](https://img.shields.io/badge/Status-MidAssessment_Complete-success)
![Degree](https://img.shields.io/badge/MSc-MDACT_La_Salle-003399)
![Defense](https://img.shields.io/badge/Defense-Jan_2026-orange)
![License](https://img.shields.io/badge/License-MIT-green)

<p align="center">
  <img src="docs/assets/banner_render_v2.jpg" alt="Project Visualization Render" width="100%">
</p>

*A Master Thesis project submitting for the MSc in Digital Arts and Creative Technologies.*
*Academic Year 2025-2026*

[View Demo Video](https://vimeo.com/your-link) | [Read Full Report (PDF)](docs/report/Final_Thesis.pdf)

</div>

---

## 📑 Abstract
*(Must align with EO1 criteria and match the submitted PDF exactly. Max 250 words)*

**Emotions in Transit** investigates the potential of affective computing to re-humanize high-density urban transit zones. Through an interactive installation, the project captures real-time physiological data (GSR and HRV) from commuters to generate a collective, evolving audiovisual organism. By translating invisible stress metrics into fluid visual dynamics, the system creates a feedback loop designed to foster "ambient empathy" among strangers. The research contributes to the field of interactive architecture by proposing a novel framework for bio-driven generative art in public spaces.

**Keywords:** *Affective Computing, Generative Design, Urban Interaction, Biometrics, Real-Time Rendering.*

---

## ⚙️ System Architecture (Data Flow)
*Visualizing the technical pipeline for Evaluation Objective 3 (Clarity & Structure).*

```mermaid
graph LR
    A[Biometric Sensors] -->|Raw Data via Serial| B(Python Backend)
    B -->|Noise Filtering & Normalization| C{OSC Bridge}
    C -->|/biometrics/stress| D[TouchDesigner Visuals]
    C -->|/biometrics/hrv| E[Ableton Live Audio]
    D -->|Spout/NDI| F((Projection Mapping))
    E -->|Audio Out| G((Surround Sound))
