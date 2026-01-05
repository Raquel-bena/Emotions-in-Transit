// js/api.js
export async function loadRealData() {
    try {
        console.log('Cargando datos del sistema...');
        
        // Simular carga de datos
        const weatherData = {
            temp: 15 + Math.random() * 20,
            humidity: 40 + Math.random() * 50,
            windSpeed: 2 + Math.random() * 10,
            description: ['soleado', 'nublado', 'lluvioso'][Math.floor(Math.random() * 3)]
        };
        
        const transportData = {
            congestion: 2 + Math.random() * 8,
            flowRhythm: 0.2 + Math.random() * 0.8
        };
        
        const environmentData = {
            noiseDb: 40 + Math.random() * 50,
            co2: 350 + Math.random() * 450
        };
        
        // Actualizar datos globales
        if (typeof data !== 'undefined') {
            data.weather = weatherData;
            data.transport = transportData;
            data.environment = environmentData;
            data.time = new Date().toLocaleTimeString();
        }
        
        console.log('Datos actualizados:', { weatherData, transportData, environmentData });
        return true;
    } catch (error) {
        console.error('Error al cargar datos:', error);
        return false;
    }
}