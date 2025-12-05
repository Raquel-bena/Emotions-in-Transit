export class EmotionPulse {
    constructor(p, x, y, color) {
        this.p = p; // Guardamos la referencia
        this.x = x;
        this.y = y;
        this.size = 0;
        this.maxSize = p.random(100, 300);
        this.alpha = 255;
        this.color = color;
        this.speed = p.random(2, 5);
        this.dead = false;
    }
  
    update() {
        this.size += this.speed;
        this.alpha = this.p.max(0, this.alpha - 3); // this.p.max
    
        if (this.alpha <= 0 || this.size > this.maxSize) {
            this.dead = true;
        }
    }
  
    display() {
        if (this.dead) return;
    
        this.p.noFill();
        this.p.strokeWeight(2);
        
        // Extraemos componentes de color usando funciones de p5
        let r = this.p.red(this.color);
        let g = this.p.green(this.color);
        let b = this.p.blue(this.color);

        this.p.stroke(r, g, b, this.alpha);
        this.p.ellipse(this.x, this.y, this.size);
    }
}
