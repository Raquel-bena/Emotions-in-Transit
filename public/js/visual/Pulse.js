// public/js/visual/Pulse.js

class EmotionPulse {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.maxSize = random(100, 300);
    this.alpha = 255;
    this.color = color;
    this.speed = random(2, 5);
    this.dead = false;
  }

  update() {
    this.size += this.speed;
    this.alpha = max(0, this.alpha - 3); // Evita valores negativos

    if (this.alpha <= 0 || this.size > this.maxSize) {
      this.dead = true;
    }
  }

  display() {
    if (this.dead) return;

    noFill();
    strokeWeight(2);
    stroke(red(this.color), green(this.color), blue(this.color), this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}