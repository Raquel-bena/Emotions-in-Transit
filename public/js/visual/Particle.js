class Particle {
    constructor() {
        this.reset();
        // Empezar en posición aleatoria
        this.pos = createVector(random(width), random(height));
    }

    reset() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.size = random(3, 8);
        this.life = 255;
    }

    update(state) {
        // 1. VIENTO: Afecta la velocidad
        // Un windIndex bajo (0.1) mueve lento, alto (1.0) mueve rápido
        let speed = map(state.windIndex, 0, 1, 0.5, 5);
        
        // Creamos movimiento usando ruido Perlin (orgánico)
        let angle = noise(this.pos.x * 0.005, this.pos.y * 0.005, frameCount * 0.001) *TXO TWO_PI * 2;
        
        this.vel.x = cos(angle) * speed;
        this.vel.y = sin(angle) * speed;

        // 2. LLUVIA: Si hay lluvia, caen hacia abajo
        if (state.rainIndex > 0.5) {
            this.vel.y += 3; // Gravedad
            this.vel.x *= 0.1; // Menos movimiento lateral
        }

        this.pos.add(this.vel);

        // Si sale de la pantalla, reaparece en el lado contrario
        if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.y > height) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = height;
        
        // 3. TEMPERATURA: Define el color
        // tempIndex 0 (Frío) = Azul/Cyan
        // tempIndex 1 (Calor) = Rojo/Naranja
        this.colorR = map(state.tempIndex, 0, 1, 0, 255); // Más rojo si hace calor
        this.colorB = map(state.tempIndex, 0, 1, 255, 50); // Menos azul si hace calor
        this.colorG = 100; 
    }

    display() {
        fill(this.colorR, this.colorG, this.colorB, 200);
        ellipse(this.pos.x, this.pos.y, this.size);
    }
}