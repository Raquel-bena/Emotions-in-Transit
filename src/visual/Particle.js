// src/visual/Particle.js

// Clase existente para los agentes de la retícula ( GridAgent )
export class GridAgent {
    constructor(p, x, y, size) {
        this.p = p;
        this.pos = p.createVector(x, y);
        this.basePos = p.createVector(x, y);
        this.size = size;
        this.rotation = 0;
        this.type = 0; // 0:Empty, 1:Line, 2:Block, 3:Char
        this.character = '';
        this.color = p.color(255);

        // Propiedades físicas dinámicas
        this.speedMult = 1.0;
        this.jitter = 0;
    }

    update(state) {
        const { weather, transport, meta } = state;
        const emotion = meta.emotion || "NEUTRAL";

        // 1. ROTACIÓN BASE (Viento)
        let windAngle = this.p.radians(weather.windDir);
        // El tráfico añade caos a la rotación
        let trafficChaos = this.p.map(transport.congestion, 0, 10, 0, this.p.PI);
        let timeNoise = this.p.noise(this.pos.x * 0.01, this.pos.y * 0.01, this.p.frameCount * 0.01);

        this.rotation = windAngle + (timeNoise * trafficChaos);

        // 2. COLOR SEGÚN EMOCIÓN (Override del sketch.js)
        if (emotion === "URBAN_ANGER") {
            this.color = this.p.color('#ff3333'); // Rojo Alerta
        } else if (emotion === "ECO_ANXIETY") {
            this.color = this.p.color('#ccff00'); // Verde Tóxico
        } else if (emotion === "SOLASTALGIA") {
            this.color = this.p.color('#8899aa'); // Azul Apagado
        } else {
            this.color = this.p.color('#00f0ff'); // Cian Esperanza
        }

        // 3. EVOLUCIÓN (Probabilidad de cambio de forma)
        // Más estrés = cambios más rápidos
        let changeRate = (emotion === "URBAN_ANGER") ? 10 : 60;

        if (this.p.frameCount % changeRate === 0) {
            this.evolve(state);
        }
    }

    evolve(state) {
        let r = this.p.random();
        // Probabilidad de estar activo
        let activeThreshold = 0.3; // Base

        if (state.meta.emotion === "URBAN_ANGER") activeThreshold = 0.8; // Muy denso
        if (state.meta.emotion === "SOLASTALGIA") activeThreshold = 0.1; // Vacío/Triste

        if (r < activeThreshold) {
            // TIPO DE VISUALIZACIÓN
            if (state.meta.emotion === "ECO_ANXIETY") {
                this.type = 3; // Caracteres (Ruido visual)
                const chars = "?!#%&@";
                this.character = chars.charAt(Math.floor(this.p.random(chars.length)));
            } else if (state.meta.emotion === "URBAN_ANGER") {
                this.type = 1; // Líneas agresivas
            } else {
                this.type = 2; // Bloques estables
            }
        } else {
            this.type = 0; // Vacío
        }
    }

    display() {
        if (this.type === 0) return;

        this.p.push();
        // Jitter (Temblor) aplicado aquí
        let jx = this.p.random(-this.jitter, this.jitter);
        let jy = this.p.random(-this.jitter, this.jitter);

        this.p.translate(this.pos.x + this.size / 2 + jx, this.pos.y + this.size / 2 + jy);
        this.p.rotate(this.rotation);

        this.p.noFill();
        this.p.stroke(this.color);
        this.p.fill(this.color);

        if (this.type === 1) { // LINE
            this.p.strokeWeight(2);
            this.p.line(-this.size / 2, 0, this.size / 2, 0);
        } else if (this.type === 2) { // BLOCK
            this.p.noStroke();
            this.p.rectMode(this.p.CENTER);
            this.p.rect(0, 0, this.size * 0.6, this.size * 0.6);
        } else if (this.type === 3) { // CHAR
            this.p.noStroke();
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(this.size * 0.8);
            this.p.text(this.character, 0, 0);
        }

        this.p.pop();
    }
}

// --- NUEVA CLASE PARA PARTÍCULAS DE CO2 ---
export class Co2Particle {
    constructor(p) {
        this.p = p;
        this.pos = p.createVector(p.random(p.width), p.random(p.height));
        this.vel = p.createVector(p.random(-0.5, 0.5), p.random(-0.5, 0.5));
        this.size = p.random(2, 5);
        this.alpha = p.random(50, 150);
        this.color = p.color(100, 100, 100, this.alpha); // Gris base
    }

    update(co2Level, emotion) {
        // Color y opacidad según CO2 y emoción
        if (emotion === "ECO_ANXIETY") {
            this.color = this.p.color(50, 200, 50, this.alpha); // Verde tóxico
        } else {
            // Gris más oscuro a mayor CO2
            let gray = this.p.map(co2Level, 400, 1200, 150, 50, true);
            this.color = this.p.color(gray, gray, gray, this.alpha);
        }

        // Movimiento afectado por nivel de CO2 (más CO2 = más agitación)
        let speedMult = this.p.map(co2Level, 400, 1200, 0.5, 2.0, true);
        this.pos.add(p5.Vector.mult(this.vel, speedMult));

        // Reaparecer en el otro lado si salen de la pantalla
        if (this.pos.x < 0) this.pos.x = this.p.width;
        if (this.pos.x > this.p.width) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = this.p.height;
        if (this.pos.y > this.p.height) this.pos.y = 0;
    }

    display() {
        this.p.noStroke();
        this.p.fill(this.color);
        this.p.ellipse(this.pos.x, this.pos.y, this.size);
    }
}
