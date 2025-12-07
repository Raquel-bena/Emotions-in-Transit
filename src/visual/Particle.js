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
        this.targetColor = p.color(255);
        this.jitter = 0;
    }

    /**
     * Update based on Biometric State
     * state = { weather, environment, transport, meta }
     */
    update(state) {
        const { weather, environment, transport } = state;

        // --- 1. TEMPERATURA -> COLOR & ENERGÍA ---
        // Map Temp (0-40) to Blue-Red gradient
        // <10: Cold Blue, 20: White/Green, >30: Hot Red
        let tempVal = weather.temp;
        if (tempVal < 15) {
            this.targetColor = this.p.lerpColor(this.p.color('#0088ff'), this.p.color('#ffffff'), this.p.map(tempVal, 0, 15, 0, 1));
        } else {
            this.targetColor = this.p.lerpColor(this.p.color('#ffffff'), this.p.color('#ff3333'), this.p.map(tempVal, 15, 35, 0, 1));
        }
        // Smooth transition
        this.color = this.p.lerpColor(this.color, this.targetColor, 0.05);

        // --- 2. RUIDO (NOISE) -> JITTER (Vibración) ---
        // dB: 30 (Silencio) -> 90 (Ruido extremo)
        // Mapeamos a offset de píxeles
        let noiseLevel = environment.noiseDb;
        this.jitter = this.p.map(noiseLevel, 30, 90, 0, 5, true); // Clamp true

        // --- 3. VIENTO & TRÁFICO -> MOVIMIENTO & CAOS ---
        // El viento define la rotación base
        let windAngle = this.p.radians(weather.windDir);

        // El tráfico añade entropía (caos) a la rotación
        let chaos = this.p.map(transport.congestion, 0, 10, 0, this.p.PI);
        let timeNoise = this.p.noise(this.pos.x * 0.01, this.pos.y * 0.01, this.p.frameCount * 0.01);

        this.rotation = windAngle + (timeNoise * chaos);

        // --- 4. EVOLUCIÓN (LIFE) ---
        // Probabilidad de "morir" o cambiar estado
        // Tráfico alto = cambios rápidos (estrés urbano)
        let changeRate = this.p.map(transport.flowRhythm, 0, 1, 120, 30); // Frames entre cambios
        if (this.p.frameCount % Math.floor(changeRate) === 0) {
            this.evolve(weather, environment);
        }
    }

    evolve(weather, env) {
        let r = this.p.random();
        // Lluvia aumenta densidad de partículas activas
        let densityThreshold = this.p.map(weather.rain, 0, 10, 0.8, 0.4);

        if (r > densityThreshold) {
            // TIPO DE VISUALIZACIÓN
            // Ruido alto = Formas agudas (ASCII/Líneas)
            // Ruido bajo = Formas bloque (Estables)
            if (env.noiseDb > 60) {
                this.type = this.p.random() > 0.5 ? 1 : 3; // Line or Char
                const chars = "XYZ01_/+=-:.;";
                this.character = chars.charAt(Math.floor(this.p.random(chars.length)));
            } else {
                this.type = 2; // Block
            }
        } else {
            this.type = 0;
        }
    }

    display() {
        if (this.type === 0) return;

        this.p.push();

        // APLICAR JITTER (Ruido)
        let jx = this.p.random(-this.jitter, this.jitter);
        let jy = this.p.random(-this.jitter, this.jitter);
        this.p.translate(this.pos.x + this.size / 2 + jx, this.pos.y + this.size / 2 + jy);

        this.p.rotate(this.rotation);

        // ESTILOS GLOBAL
        this.p.noFill();
        this.p.stroke(this.color);
        this.p.fill(this.color);

        // RENDER POR TIPO
        if (this.type === 1) { // LÍNEA/VEC
            this.p.strokeWeight(2);
            this.p.line(-this.size / 3, 0, this.size / 3, 0);
            // Arrow head
            this.p.line(this.size / 3, 0, 0, -3);
            this.p.line(this.size / 3, 0, 0, 3);
        } else if (this.type === 2) { // BLOCK
            this.p.noStroke();
            // Opacidad basada en presión (densidad) ?
            // Por simplicidad, bloques sólidos
            this.p.rectMode(this.p.CENTER);
            this.p.rect(0, 0, this.size * 0.7, this.size * 0.7);
        } else if (this.type === 3) { // CHAR
            this.p.noStroke();
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(this.size);
            this.p.text(this.character, 0, 0);
        }

        this.p.pop();
    }
}
