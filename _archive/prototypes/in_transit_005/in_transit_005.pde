String[] words = {
  "noise", "movement", "waiting", "stress", "heat",
  "crowd", "delay", "pause", "acceleration",
  "silence", "overload", "flow", "tension"
};

float[] x, y;
float[] nx, ny;
float t = 0;

PFont font;

void setup() {
  size(1280, 720);
  smooth();

  font = createFont("Inter-Regular.ttf", 32, true);
  if (font == null) {
    font = createFont("SansSerif", 32);
  }

  textFont(font);
  textAlign(CENTER, CENTER);

  int n = words.length;
  x = new float[n];
  y = new float[n];
  nx = new float[n];
  ny = new float[n];

  for (int i = 0; i < n; i++) {
    x[i] = random(width);
    y[i] = random(height);
    nx[i] = random(1000);
    ny[i] = random(1000);
  }
}

void draw() {
  background(245);
  t += 0.003;

  for (int i = 0; i < words.length; i++) {

    // Movimiento orgánico con ruido
    float dx = map(noise(nx[i] + t), 0, 1, -1.5, 1.5);
    float dy = map(noise(ny[i] + t), 0, 1, -1.5, 1.5);

    x[i] += dx;
    y[i] += dy;

    // Wrap de pantalla
    if (x[i] < -100) x[i] = width + 100;
    if (x[i] > width + 100) x[i] = -100;
    if (y[i] < -50) y[i] = height + 50;
    if (y[i] > height + 50) y[i] = -50;

    // Ruido → tamaño / tensión
    float n = noise(nx[i] + t * 2);
    float size = map(n, 0, 1, 16, 48);

    // Color emocional
    if (n > 0.75) {
      fill(220, 40, 40); // tensión
    } else {
      fill(30);
    }

    textSize(size);
    text(words[i], x[i], y[i]);
  }

  // Texto central (estado global)
  fill(20);
  textSize(20);
  text("EMOTIONS (IN) TRANSIT", width/2, height - 40);
}
