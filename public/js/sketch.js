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
  // Grosor de línea fino para estética de datos
  strokeWeight(1);
  
  // Recorremos todas las partículas
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    // 1. ACTUALIZAR: Movemos la partícula (la clase DataParticle está en el otro archivo)
    // Le pasamos la velocidad del viento calculada desde la API
    p.update(windSpeed);
    
    // 2. DIBUJAR: Dibujamos el punto
    // Le pasamos el color calculado según la temperatura
    p.display(baseColor);
    
    // 3. CONECTAR: Buscamos puntos cercanos para dibujar líneas
    // Esto crea la estética de "constelación" o "red neuronal"
    for (let j = i + 1; j < particles.length; j++) {
      let other = particles[j];
      let d = dist(p.x, p.y, other.x, other.y);
      
      // Si la distancia es menor a 100 píxeles, dibujamos una línea
      if (d < 100) { 
        // La transparencia (alpha) depende de la distancia: más lejos = más transparente
        let alpha = map(d, 0, 100, 200, 0);
        stroke(red(baseColor), green(baseColor), blue(baseColor), alpha);
        line(p.x, p.y, other.x, other.y);
      }
    }
  }
}

function drawHUD() {
  // Panel de información en pantalla (Estilo Cyberpunk/Terminal)
  noStroke();
  fill(0, 255, 100); // Verde neón para el título
  textAlign(LEFT, TOP);
  textSize(14);
  text(`:: EMOTIONS IN TRANSIT :: BCN LIVE DATA`, 20, 20);
  
  fill(255); // Blanco para los datos
  textSize(12);
  
  // Mostramos los datos reales recibidos
  text(`TEMP: ${weatherData.main.temp}°C`, 20, 50);
  text(`HUMEDAD: ${weatherData.main.humidity}%`, 20, 70);
  text(`VIENTO: ${weatherData.wind.speed} m/s`, 20, 90);
  
  // Calculamos el total de bicis para mostrarlo
  let totalBikes = 0;
  bikeData.network.stations.forEach(s => totalBikes += s.free_bikes);
  text(`BICIS DISPONIBLES (BCN): ${totalBikes}`, 20, 120);
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