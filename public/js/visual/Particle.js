// Archivo: public/js/visual/Particle.js

class DataParticle {
  constructor(w, h) {
    this.w = w; // Ancho del canvas
    this.h = h; // Alto del canvas
    this.x = random(this.w);
    this.y = random(this.h);
    
    // Velocidad base aleatoria
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    
    // Tamaño aleatorio para variar la estética
    this.size = random(2, 6);
  }

  // update recibe la velocidad del viento (windFactor)
  update(windFactor) {
    this.x += this.vx * windFactor;
    this.y += this.vy * windFactor;

    // Rebotar en los bordes
    if (this.x < 0 || this.x > this.w) this.vx *= -1;
    if (this.y < 0 || this.y > this.h) this.vy *= -1;
  }

  // display recibe el color base calculado por la temperatura
  display(baseColor) {
    noStroke();
    // Añadimos un poco de variación al color base para que no sea plano
    fill(red(baseColor), green(baseColor), blue(baseColor), 200);
    rect(this.x, this.y, this.size, this.size); 
  }
}