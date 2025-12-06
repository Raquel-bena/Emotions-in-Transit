export class Particle {
    constructor(p) {
        this.p = p;
        this.reset();
        // Inicializar posición previa para dibujar líneas (trails)
        this.prevPos = this.pos.copy();
    }

    reset() {
        this.pos = this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height));
        this.prevPos = this.pos.copy();
        this.vel = this.p.createVector(0, 0);
        this.acc = this.p.createVector(0, 0);
        this.maxSpeed = 2;

        // Vida de la partícula (para que desaparezca y renazca)
        this.life = 255;
        this.decay = this.p.random(0.5, 2);
    }

    update(state) {
        // --- 1. FLOW FIELD (Campo de Flujo) ---
        // El viento afecta la escala del ruido (más viento = ondas más caóticas/rápidas)
        let noiseScale = this.p.map(state.windIndex, 0, 1, 0.002, 0.01);
        let timeScale = this.p.frameCount * this.p.map(state.mobilityIndex, 0, 1, 0.002, 0.02);

        // Angulo desde Perlin Noise
        let n = this.p.noise(this.pos.x * noiseScale, this.pos.y * noiseScale, timeScale);
        let angle = n * this.p.TWO_PI * 2; // Rango circular completo

        // Vector dirección
        let force = p5.Vector.fromAngle(angle);

        // La "Mobility" (PULSE) define la fuerza/velocidad
        let strength = this.p.map(state.mobilityIndex, 0, 1, 0.1, 1);
        force.mult(strength);

        this.acc.add(force);
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed * (1 + state.windIndex)); // Viento aumenta velocidad máx

        // Guardar pos antigua
        this.prevPos = this.pos.copy();

        // Mover
        this.pos.add(this.vel);
        this.acc.mult(0); // Reset acc

        // --- 2. CICLO DE VIDA (Fade Out) ---
        this.life -= this.decay;
        if (this.life < 0) this.reset();

        // --- 3. BORDES (Teleport) ---
        this.handleEdges();

        // --- 4. COLOR DINÁMICO ---
        // Temperatura: Azul (0) -> Violeta (0.5) -> Rojo/Naranja (1)
        // Usamos HSB interpolado en sketch.js o aquí.
        // Haremos un cálculo simple RGB neon aquí.

        // Frio: Cyan (#00f3ff) -> RGB(0, 243, 255)
        // Calor: Magenta (#ff00ff) -> RGB(255, 0, 255)
        // Mezcla basada en tempIndex
        let t = state.tempIndex;
        this.r = this.p.lerp(0, 255, t);
        this.g = this.p.lerp(243, 0, t); // Cyan tiende a perder verde
        this.b = 255; // Siempre base azulada/brillante para neon
    }

    handleEdges() {
        if (this.pos.x > this.p.width) { this.pos.x = 0; this.prevPos.x = 0; }
        if (this.pos.x < 0) { this.pos.x = this.p.width; this.prevPos.x = this.p.width; }
        if (this.pos.y > this.p.height) { this.pos.y = 0; this.prevPos.y = 0; }
        if (this.pos.y < 0) { this.pos.y = this.p.height; this.prevPos.y = this.p.height; }
    }

    display() {
        // Dibujamos LÍNEAS (Trails) en lugar de puntos para efecto fluido
        this.p.stroke(this.r, this.g, this.colorB || 255, this.life);
        this.p.strokeWeight(1.5);
        // Evitar líneas cruzadas largas al teleportarse
        if (this.p.dist(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y) < 50) {
            this.p.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        }
    }
}
