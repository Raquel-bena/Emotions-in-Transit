export class GridAgent {
    constructor(p, x, y, size) {
        this.p = p;
        this.pos = p.createVector(x, y);
        this.basePos = p.createVector(x, y); // Posición grid fija
        this.size = size;
        this.rotation = 0;
        this.type = 0; // 0:Empty, 1:Line, 2:Block, 3:Char
        this.character = '';
        this.color = p.color(255);
        this.life = 0;
    }

    update(state) {
        // --- CÁLCULO CIENTÍFICO (Automata Rules) ---

        // 1. ENTROPIA (TEMP): Determina la probabilidad de cambiar de estado
        // Más calor (>0.5) = Más cambios aleatorios de símbolo
        let entropy = state.tempIndex;

        // 2. VECTOR (WIND): Determina la rotación
        let noiseVal = this.p.noise(this.pos.x * 0.002, this.pos.y * 0.002, this.p.frameCount * 0.005);
        // El viento real (state.windIndex) alinea los vectores
        let windForce = this.p.map(state.windIndex, 0, 1, 0, this.p.TWO_PI);
        this.rotation = noiseVal * this.p.TWO_PI + windForce;

        // 3. METABOLISMO (MOBILITY): Frecuencia de actualización
        // Si Mobility es alto, las celdas parpadean/cambian más rápido
        if (this.p.frameCount % Math.floor(this.p.map(state.mobilityIndex, 0, 1, 60, 5)) === 0) {
            this.evolve(entropy, state.rainIndex);
        }
    }

    evolve(entropy, rainDensity) {
        let r = this.p.random();

        // Densidad de lluvia afecta cuántas celdas están llenas vs vacías
        let activeThreshold = this.p.map(rainDensity, 0, 1, 0.8, 0.2); // Más lluvia = Más celdas llenas (umbral bajo)

        if (r > activeThreshold) {
            // Célula ACTIVA
            // El tipo de símbolo depende de la Entropía
            if (entropy < 0.3) {
                // Bajo Caos: Estructura, Bloques
                this.type = 2; // Block
            } else if (entropy < 0.6) {
                // Medio Caos: Direccional
                this.type = 1; // Línea/Flecha
            } else {
                // Alto Caos: ASCII Noise
                this.type = 3; // ASCII
                const chars = "XYZ01_/+=";
                this.character = chars.charAt(Math.floor(this.p.random(chars.length)));
            }
        } else {
            this.type = 0; // Vacío
        }
    }

    display() {
        if (this.type === 0) return;

        this.p.push();
        this.p.translate(this.pos.x + this.size / 2, this.pos.y + this.size / 2);
        this.p.rotate(this.rotation);

        // Color basado en tipo
        if (this.type === 1) this.p.stroke(255);
        else if (this.type === 2) this.p.fill(0, 255, 65); // Matrix Green
        else if (this.type === 3) this.p.fill(0, 136, 255); // Sci Blue

        // DIBUJAR SÍMBOLO
        if (this.type === 1) { // LÍNEA (Vector)
            this.p.strokeWeight(2);
            this.p.line(-this.size / 3, 0, this.size / 3, 0);
            this.p.noFill();
            // Cabeza de flecha
            this.p.line(this.size / 3, 0, 0, -3);
            this.p.line(this.size / 3, 0, 0, 3);
        } else if (this.type === 2) { // BLOQUE (Materia)
            this.p.noStroke();
            this.p.rectMode(this.p.CENTER);
            this.p.rect(0, 0, this.size * 0.6, this.size * 0.6);
        } else if (this.type === 3) { // ASCII (Datos)
            this.p.noStroke();
            this.p.textAlign(this.p.CENTER, this.p.CENTER);
            this.p.textSize(this.size * 0.8);
            this.p.text(this.character, 0, 0);
        }

        this.p.pop();
    }
}
