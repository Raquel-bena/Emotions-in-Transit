// --- VARIABLES GLOBALES ---
let weatherData = null;
let bikeData = null;
let particles = [];
let baseColor; // El color cambiará según la temperatura
let windSpeed = 1; // La velocidad cambiará según el viento

// --- CONFIGURACIÓN DE APIs ---
// Tu API Key real de OpenWeatherMap
const API_KEY = '9d75f91e440ba31b532d442cf7e383d1'; 
const CITY_ID = '3128760'; // ID de Barcelona
const WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&appid=${API_KEY}&units=metric`;
const BIKES_URL = 'https://api.citybik.es/v2/networks/bicing';

function setup() {
  // Crea el canvas ajustado al tamaño de la ventana del navegador
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent(document.body); // Asegura que se adjunte al cuerpo del HTML
  
  background(0); // Fondo inicial negro

  // Inicializar un color temporal (Gris) hasta que lleguen los datos
  baseColor = color(100); 

  // Cargar datos de las APIs de forma asíncrona
  loadJSON(WEATHER_URL, onWeatherLoad);
  loadJSON(BIKES_URL, onBikesLoad);
}

function draw() {
  // Fondo negro con mucha transparencia para crear el efecto "estela" (ghosting)
  fill(0, 20); 
  noStroke();
  rect(0, 0, width, height);

  // PANTALLA DE CARGA: Si los datos aún no han llegado, mostramos texto
  if (!weatherData || !bikeData) {
    drawLoadingScreen();
    return; // Detenemos el dibujo aquí hasta tener datos
  }

  // Si ya tenemos datos, ejecutamos la visualización principal
  drawNetwork();
  drawHUD();
}

// --- LÓGICA DE VISUALIZACIÓN ---

function drawNetwork() {
  // EFECTO DE BRILLO (NEÓN)
  // Esto hace que todo lo que se dibuje después tenga un halo de luz
  drawingContext.shadowBlur = 15; 
  drawingContext.shadowColor = color(red(baseColor), green(baseColor), blue(baseColor));

  strokeWeight(1);
  
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    // Actualizar y Dibujar
    p.update(windSpeed);
    p.display(baseColor);
    
    // Conectar puntos (Red Neuronal)
    for (let j = i + 1; j < particles.length; j++) {
      let other = particles[j];
      let d = dist(p.x, p.y, other.x, other.y);
      
      // Aumentamos la distancia de conexión a 120 para ver más líneas
      if (d < 120) { 
        let alpha = map(d, 0, 120, 150, 0); // Transparencia variable
        stroke(red(baseColor), green(baseColor), blue(baseColor), alpha);
        line(p.x, p.y, other.x, other.y);
      }
    }
  }
  
  // Resetear el efecto de brillo para que no afecte al texto del HUD
  drawingContext.shadowBlur = 0;
}

function drawHUD() {
  noStroke();
  
  // Fondo semitransparente detrás del texto para que se lea mejor
  fill(0, 150);
  rect(10, 10, 250, 130, 5); // Caja de fondo con bordes redondeados

  // Título
  fill(0, 255, 100); // Verde Terminal
  textAlign(LEFT, TOP);
  textSize(14);
  textStyle(BOLD);
  text(`:: EMOTIONS IN TRANSIT ::`, 25, 25);
  
  // Línea divisoria decorativa
  stroke(0, 255, 100);
  line(25, 45, 200, 45);
  noStroke();

  // Datos
  fill(220); // Blanco suave
  textStyle(NORMAL);
  textSize(12);
  
  // Usamos toFixed(1) para que no salgan muchos decimales
  text(`> CLIMA: BCN LIVE FEED`, 25, 60);
  text(`  TEMP: ${weatherData.main.temp.toFixed(1)}°C`, 25, 80);
  text(`  HUMEDAD: ${weatherData.main.humidity}%`, 25, 100);
  text(`> MOVILIDAD (BICING)`, 25, 120);
  
  // Calculamos bicis de nuevo para mostrar el dato
  let totalBikes = 0;
  bikeData.network.stations.forEach(s => totalBikes += s.free_bikes);
  text(`  UNIDADES ACTIVAS: ${totalBikes}`, 25, 140);
}

function drawLoadingScreen() {
  // Texto parpadeante o estático mientras carga
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  text("CONECTANDO CON SATÉLITES DE BARCELONA...", width/2, height/2);
}

// --- CALLBACKS: QUÉ HACER CUANDO LLEGAN LOS DATOS ---

function onWeatherLoad(data) {
  console.log("Datos del clima recibidos:", data);
  weatherData = data;
  let temp = data.main.temp;
  
  // MAPEO DE COLOR: 
  // Si hace 5°C o menos -> Azul puro. 
  // Si hace 30°C o más -> Rojo puro.
  // Entre medias -> Mezcla (Morados/Magentas)
  let r = map(temp, 5, 30, 0, 255, true);
  let b = map(temp, 5, 30, 255, 0, true);
  
  baseColor = color(r, 50, b); // G = 50 para mantenerlo un poco oscuro/neón
  
  // MAPEO DE VIENTO:
  // 0 m/s -> Velocidad 0.5 (muy lento)
  // 20 m/s -> Velocidad 4 (muy rápido, caótico)
  windSpeed = map(data.wind.speed, 0, 20, 0.5, 4); 
}

function onBikesLoad(data) {
  console.log("Datos de Bicing recibidos:", data);
  bikeData = data;
  
  let totalFreeBikes = 0;
  let stations = data.network.stations;
  
  // Sumamos todas las bicis libres de todas las estaciones
  for(let s of stations) {
      totalFreeBikes += s.free_bikes;
  }
  
  // DENSIDAD DE PARTÍCULAS:
  // Usamos el número de bicis para decidir cuántos puntos dibujar.
  // Dividimos por 20 para no saturar la pantalla (hay miles de bicis).
  // Constrain asegura que nunca haya menos de 50 ni más de 300 puntos.
  let count = constrain(totalFreeBikes / 20, 50, 300);
  
  // Reiniciamos el array y creamos las partículas
  particles = []; 
  for (let i = 0; i < count; i++) {
    // Asumimos que DataParticle ya está definida en Particle.js
    particles.push(new DataParticle(width, height));
  }
}

// Redimensionar el canvas si el usuario cambia el tamaño de la ventana
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}