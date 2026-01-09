# Emotions in Transit
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Research through Design](https://img.shields.io/badge/Methodology-Research%20through%20Design-blue)](https://doi.org/10.1145/1240624.1240697)

> *"This artwork does not see you. It listens to the city."*

Generative art installation that translates Barcelona's environmental data into an immersive audiovisual experience, fostering reflection on urban loneliness through an ethical technological architecture.

![Installation Overview](docs/images/installation_setup.jpg)

## Conceptual Foundation
Emotions in Transit emerges as a critical response to the paradox of hyperconnection in smart cities. Instead of extractive surveillance technologies, this project proposes:
- **Poetic Correlation**: Using public environmental data as emotional metaphors
- **Gift Biometrics**: Voluntary pulse interaction (not facial recognition)
- **Data Visceralization**: Feeling data through fluid particle systems, not reading charts

## System Architecture
![System Architecture](docs/images/system_architecture.png)

A hybrid architecture that orchestrates:
- **Backend** (Node.js): Real-time data ingestion and normalization
- **Data Science** (Python): K-Means clustering for emotional state detection
- **Frontend** (p5.js + Tone.js): WebGL-accelerated visualization and sonification
- **Hardware** (ESP32 + Raspberry Pi): Physical interaction totem

## Live Demo
[![p5.js Editor Collection](https://img.shields.io/badge/p5.js-Editor%20Collection-brightgreen)](https://editor.p5js.org/Rb.Graphicx/collections/RoZ2mwKzv)

- [Particle Systems Prototype](https://editor.p5js.org/Rb.Graphicx/sketches/Dl3zN8wRc)
- [Flow Field Experiments](https://editor.p5js.org/Rb.Graphicx/sketches/9mYw3XWJj)
- [Audiovisual Demo](https://editor.p5js.org/Rb.Graphicx/sketches/kH1zXQqVp)

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- Python 3.9+
- p5.js libraries
- Arduino IDE (for hardware)

### Quick Start
```bash
# Clone repository
git clone https://github.com/Raquel-bena/Emotions-in-Transit.git
cd Emotions-in-Transit

# Install backend dependencies
npm install

# Install data science dependencies
pip install -r requirements.txt

# Configure environment variables
cp backend/.env.example backend/.env
# Add your API keys to .env file

# Start development servers
npm run dev:backend    # Node.js server
npm run dev:frontend   # p5.js visualization
python data-science/04_KMeans_Clustering.py  # Train model