// prototypes/prototype2.pde
int cols = 10;
int rows = 6;
float cellWidth;
float cellHeight;

// Paleta de emociones (ejemplo)
color[] colors = {
  #FF0000, // anger → roja
  #FFA500, // happiness → naranja
  #0000FF, // sadness → azul
  #FFFF00, // surprise → amarillo
  #800080, // fear → morado
  #008000  // disgust → verde
};

String[] emotions = {"anger", "happiness", "sadness", "surprise", "fear", "disgust"};

void setup() {
  size(800, 480);
  cellWidth = width / float(cols);
  cellHeight = height / float(rows);
  noStroke();
}

void draw() {
  background(30);
  for (int i = 0; i < cols; i++) {
    for (int j = 0; j < rows; j++) {
      int emotionIndex = int(noise(i*0.5, j*0.5, frameCount*0.01) * colors.length) % colors.length;
      fill(colors[emotionIndex]);
      ellipse(i * cellWidth + cellWidth/2, j * cellHeight + cellHeight/2, cellWidth*0.8, cellHeight*0.8);
    }
  }
}
