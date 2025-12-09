// src/visual/Pulse.js
export class EmotionPulse {
    constructor(p, x, y, color) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = 0;
        this.maxSize = p.random(100, 300);
        this.alpha = 255;
        this.color = color; // Recibe objeto color de p5 o string hex
        this.speed = p.random(2, 5);
        this.dead = false;
    }

    update() {
        this.size += this.speed;
        this.alpha = this.p.max(0, this.alpha - 4); // Desvanecimiento más rápido

        if (this.alpha <= 0 || this.size > this.maxSize) {
            this.dead = true;
        }
    }

    display() {
        if (this.dead) return;

        this.p.push();
        this.p.noFill();
        this.p.strokeWeight(2);

        // Convertir color y aplicar alpha
        let c = this.p.color(this.color);
        c.setAlpha(this.alpha);

        this.p.stroke(c);
        this.p.ellipse(this.x, this.y, this.size);
        this.p.pop();
    }
}
