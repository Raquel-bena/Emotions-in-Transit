// Estado global de los datos de la ciudad
const cityData = {
    temp: 20,       // Temperatura base
    traffic: 50,    // Intensidad tráfico (0-100)
    noise: 0,       // Ruido ambiental (0-100)
    status: 'INIT'  // Estado del sistema
};

// Función para obtener datos reales
async function fetchCityData() {
    console.log("> Iniciando escaneo de APIs...");
    
    // 1. OBTENER CLIMA (OpenWeatherMap)
    try {
        if (!CONFIG.OWM_KEY) throw new Error("No API Key");
        const url = `https://api.openweathermap.org/data/2.5/weather?id=${CONFIG.OWM_CITY_ID}&appid=${CONFIG.OWM_KEY}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();
        
        cityData.temp = data.main.temp;
        window.logToScreen(`CLIMA ACTUALIZADO: ${cityData.temp}°C`);
    } catch (e) {
        console.warn("Modo Simulación Clima activado");
        // Simular variación suave
        cityData.temp += (Math.random() - 0.5); 
    }

    // 2. OBTENER TRÁFICO (TMB o Simulación)
    // Nota: Las APIs de transporte son complejas, aquí simulamos 
    // fluctuaciones basadas en la hora del día para el efecto visual.
    const hour = new Date().getHours();
    const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 20);
    
    // Si es hora punta, el tráfico sube (más glitch en pantalla)
    let targetTraffic = isRushHour ? 85 : 40; 
    // Añadimos "ruido" aleatorio
    cityData.traffic = targetTraffic + (Math.random() * 20 - 10);
    
    window.logToScreen(`TRÁFICO: ${Math.floor(cityData.traffic)}% DENSIDAD`);

    // Actualizar UI HTML
    updateDOM();
}

// Actualizar las barras y textos del HTML
function updateDOM() {
    // Temperatura
    document.getElementById('val-temp').innerText = Math.floor(cityData.temp) + "°C";
    document.getElementById('bar-temp').style.width = Math.min(cityData.temp * 2, 100) + "%";
    
    // Tráfico
    document.getElementById('val-traffic').innerText = Math.floor(cityData.traffic);
    document.getElementById('bar-traffic').style.width = cityData.traffic + "%";
    
    // Cambiar color si el tráfico es alto (Alerta)
    const trafficBar = document.getElementById('bar-traffic');
    if (cityData.traffic > 75) {
        trafficBar.style.backgroundColor = "var(--color-alert)";
    } else {
        trafficBar.style.backgroundColor = "var(--color-primary)";
    }
}

// Ejecutar bucle de datos cada 5 segundos
setInterval(fetchCityData, 5000);
fetchCityData(); // Primera llamada inmediata