class AudioEngine {
    constructor() {
        this.isStarted = false;
        
        // 1. SINTETIZADOR (La fuente del sonido)
        // Usamos un PolySynth para poder tocar varias notas a la vez (acordes)
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: {
                type: "triangle" // Forma de onda suave, tipo flauta/órgano
            },
            envelope: {
                attack: 2,   // Tarda 2 segundos en aparecer (fade in)
                decay: 1,
                sustain: 0.5,
                release: 3   // Tarda 3 segundos en irse (fade out)
            }
        }).toDestination();

        // 2. EFECTOS (La atmósfera)
        // Reverb para dar sensación de espacio grande
        this.reverb = new Tone.Reverb({
            decay: 4,
            wet: 0.5
        }).toDestination();
        
        // Filtro para controlar el "brillo" según la temperatura
        this.filter = new Tone.Filter(500, "lowpass").toDestination();
        
        // Conectamos el sinte a los efectos
        this.synth.connect(this.filter);
        this.synth.connect(this.reverb);
    }

    // INICIAR AUDIO (Requiere interacción del usuario)
    async start() {
        if (!this.isStarted) {
            await Tone.start(); // Arranca el motor de audio del navegador
            this.isStarted = true;
            console.log("🔊 Motor de Audio: ON");
            
            // Comenzar el bucle de música
            this.startAmbience();
        }
    }

    startAmbience() {
        // Bucle simple: Toca un acorde cada 6 segundos
        setInterval(() => {
            // Acorde: Do Mayor 7 (C4, E4, G4, B4) - Muy relajante
            // "4n" significa que la nota dura una negra (pero el release la alarga)
            this.synth.triggerAttackRelease(["C3", "E3", "G3", "B3"], "4n");
        }, 6000);
    }

    // ACTUALIZAR SEGÚN DATOS (El Mapeo Sonoro)
    updateFromData(data) {
        if (!this.isStarted) return;

        // Mapeo: Temperatura -> Frecuencia del Filtro
        // Si tempIndex es 0 (frío) -> 200Hz (Sonido muy opaco, como bajo el agua)
        // Si tempIndex es 1 (calor) -> 3000Hz (Sonido brillante y abierto)
        let filterFreq = mapRange(data.tempIndex, 0, 1, 200, 3000);
        
        // Usamos rampTo para que el cambio de sonido sea suave, no brusco
        this.filter.frequency.rampTo(filterFreq, 2); 
    }
}

// Función auxiliar matemática (equivalente al map() de p5.js pero para JS puro)
function mapRange(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}