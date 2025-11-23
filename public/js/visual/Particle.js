class Particle {
  constructor(x, y, tempIndex) {
    // Posición inicial: donde le digamos (normalmente el centro)
    this.pos = createVector(x, y);
    
    // Velocidad inicial: aleatoria en todas direcciones
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(0.5, 2)); // Velocidad variable
    
    // Aceleración: empieza en 0
    this.acc = createVector(0, 0);
    
    // Vida de la partícula (alpha/transparencia). 255 es totalmente visible.
    this.lifespan = 255;
    
    // Color basado en la temperatura (tempIndex 0.0 a 1.0)
    let coldColor = color(0, 100, 255); // Azul
    let hotColor = color(255, 50, 50);  // Rojo
    
    // lerpColor mezcla los dos colores según el índice
    this.color = lerpColor(coldColor, hotColor, tempIndex);
  }

  // Método para recibir fuerzas externas (como el viento)
  applyForce(force) {
    this.acc.add(force);
  }

  // Método para actualizar la física (movimiento)
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0); // Reseteamos la aceleración para el siguiente frame
    
    this.lifespan -= 2.0; // La partícula envejece y se desvanece
  }

  // Método para dibujarse a sí misma en el canvas
  show() {
    noStroke();
    // Usamos el color calculado y le aplicamos la transparencia actual (lifespan)
    fill(red(this.color), green(this.color), blue(this.color), this.lifespan);
    ellipse(this.pos.x, this.pos.y, 12); // Dibujamos un círculo pequeño
  }

  // Método para saber si la partícula ya "murió" (es invisible)
  isDead() {
    return this.lifespan < 0;
  }
}