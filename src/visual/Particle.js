export class Particle {
    // Recibimos 'p' (la caja de herramientas de p5)
    constructor(p) {
        this.p = p; 
        this.reset();
    }

    reset() {
        // Usamos this.p.width, this.p.random, etc.
        this.pos = this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height));
        this.vel = this.p.createVector(0, 0);
        this.size = this.p.random(3, 8);
        this.life = 255;
    }

    update(state) {
        // 1. VIENTO
        let speed = this.p.map(state.windIndex, 0, 1, 0.5, 5);
        
        // Ruido Perlin (note el prefijo this.p.)
        let angle = this.p.noise(
            this.pos.x * 0.005, 
            this.pos.y * 0.005, 
            this.p.frameCount * 0.001
        ) * this.p.TWO_PI * 2;
        
        this.vel.x = this.p.cos(angle) * speed;
        this.vel.y = this.p.sin(angle) * speed;

        // 2. LLUVIA
        if (state.rainIndex > 0.5) {
            this.vel.y += 3; // Gravedad
            this.vel.x *= 0.1; 
        }

        this.pos.add(this.vel);

        // Bordes (Wrap around)
        if (this.pos.x > this.p.width) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = this.p.width;
        if (this.pos.y > this.p.height) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = this.p.height;
        
        // 3. TEMPERATURA
        this.colorR = this.p.map(state.tempIndex, 0, 1, 0, 255);
        this.colorB = this.p.map(state.tempIndex, 0, 1, 255, 50);
        this.colorG = 100; 
    }

    display() {
        // Usamos this.p para dibujar
        this.p.fill(this.colorR, this.colorG, this.colorB, 200);
        this.p.ellipse(this.pos.x, this.pos.y, this.size);
    }
}
