// Archivo: js/visual/Pulse.js

class Pulse {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.maxSize = random(100, 300);
    this.alpha = 255;
    this.color = color;
    this.speed = random(2, 5);
    this.dead = false; // Para saber cuándo eliminarlo
  }

  update() {
    this.size += this.speed;
    this.alpha -= 3; // Desvanecer poco a poco

    if (this.alpha <= 0) {
      this.dead = true;
    }
  }

  display() {
    noFill();
    strokeWeight(2);
    stroke(red(this.color), green(this.color), blue(this.color), this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}