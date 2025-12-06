const express = require('express');
const router = express.Router();

// Importamos la instancia singleton que se pasará desde app.js o lo importamos aquí.
// Pero en app.js instanciamos DataEngine. 
// Opción A: Importar DataEngine aquí e instanciarlo (si es Singleton)
// Opción B: Pasar la instancia desde app.js (Inyección de dependencias)
// Dado que DataEngine es stateful (mantiene currentState), es mejor tener UNA sola instancia.
// Vamos a importar la CLASE aquí, pero necesitamos COMPARTIR la instancia.
// MEJOR ENFOQUE: `app.js` crea la instancia y se la pasa a las rutas, 
// O exportamos una instancia desde un archivo dedicado si quisiéramos singleton global.
// 
// Mirando `app.js` original: `const dataEngine = new DataEngine();`
// Si muevo la ruta aquí, necesito acceso a `dataEngine`.
// 
// SOLUCIÓN: Exportar una función que recibe dataEngine y devuelve el router.

module.exports = (dataEngine) => {
    router.get('/', (req, res) => {
        try {
            const data = dataEngine.getCurrentState();
            res.json(data);
        } catch (error) {
            console.error("Error obteniendo datos del motor:", error);
            res.status(500).json({ error: "Error interno del servidor de datos" });
        }
    });

    return router;
};
