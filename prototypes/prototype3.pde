// Emotions in Transit - Prototype 3
// Simulates particles in a metro station representing emotions

int numParticles = 200;
Particle[] particles = new Particle[numParticles];

// Define colors for emotions
color happiness = color(255, 223, 0);
color sadness   = color(0, 102, 204);
color anger     = color(204, 0, 0);
color fear      = color(102, 0, 153);
color surprise  = color(255, 102, 204);
color disgust   = color(0, 153, 0);
color contempt  = color(128, 128, 128);

void setup() {
  size(800, 600);
  for (int i = 0; i < numParticles; i++) {
    particles[i] = new Particle();
  }
}

void draw() {
  background(20);
  
  for (int i = 0; i < numParticles; i++) {
    particles[i].update();
    particles[i].display();
  }
}

// Particle class
class Particle {
  PVector pos;
  PVector vel;
  color c;
  float size;

  Particle() {
    pos = new PVector(random(width), random(height));
    vel = PVector.random2D();
    size = random(5, 15);
    assignEmotion();
  }

  void assignEmotion() {
    int e = int(random(7));
    switch(e) {
      case 0: c = happiness; break;
      case 1: c = sadness;   break;
      case 2: c = anger;     break;
      case 3: c = fear;      break;
      case 4: c = surprise;  break;
      case 5: c = disgust;   break;
      case 6: c = contempt;  break;
    }
  }

  void update() {
    pos.add(vel);
    // Bounce off edges
    if (pos.x < 0 || pos.x > width) vel.x *= -1;
    if (pos.y < 0 || pos.y > height) vel.y *= -1;
  }

  void display() {
    noStroke();
    fill(c, 180);
    ellipse(pos.x, pos.y, size, size);
  }
}
