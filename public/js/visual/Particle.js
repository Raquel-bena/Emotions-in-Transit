// public/js/visual/Particle.js

class EmotionParticle {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.x = random(w);
    this.y = random(h);
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    this.size = random(2, 6);
  }

  update(windFactor) {
    this.x += this.vx * windFactor;
    this.y += this.vy * windFactor;

    // Rebote con corrección para evitar "atascarse" en bordes
    if (this.x <= 0 || this.x >= this.w) {
      this.vx *= -1;
      this.x = max(0, min(this.x, this.w));
    }
    if (this.y <= 0 || this.y >= this.h) {
      this.vy *= -1;
      this.y = max(0, min(this.y, this.h));
    }
  }

  display(baseColor) {
    noStroke();
    fill(red(baseColor), green(baseColor), blue(baseColor), 200);
    square(this.x, this.y, this.size); // square() es más semántico para rectángulos
  }
}