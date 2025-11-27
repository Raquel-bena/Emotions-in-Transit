// Archivo: js/audio/AudioEngine.js

class AudioEngine {
    constructor() {
        this.isStarted = false;
        
        // 1. SINTE PAD (Fondo constante)
        this.padSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 2, decay: 1, sustain: 0.5, release: 3 }
        }).toDestination();

        // 2. SINTE PULSO (Para los Autobuses) - Sonido tipo "Drop" o "Ping"
        this.pulseSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: "sine" }
        }).toDestination();

        // 3. EFECTOS
        this.reverb = new Tone.Reverb({ decay: 5, wet: 0.6 }).toDestination();
        this.filter = new Tone.Filter(1000, "lowpass").toDestination();
        
        // Efecto GLITCH (BitCrusher) - Inicialmente desactivado (wet = 0)
        this.crusher = new Tone.BitCrusher(4).toDestination();
        this.crusher.wet.value = 0; 

        // Conexiones
        this.padSynth.connect(this.filter);
        this.padSynth.connect(this.reverb);
        this.padSynth.connect(this.crusher); // El pad pasará por el glitch si se activa
        this.pulseSynth.connect(this.reverb);
    }

    async start() {
        if (!this.isStarted) {
            await Tone.start();
            this.isStarted = true;
            console.log("🔊 Motor de Audio: ON");
            this.startAmbience();
        }
    }

    startAmbience() {
        // Acorde base ambiental
        setInterval(() => {
            this.padSynth.triggerAttackRelease(["C3", "E3", "G3", "B3"], "4n");
        }, 6000);
    }

    // --- NUEVO: Disparar sonido de Bus ---
    triggerBusArrival() {
        if (!this.isStarted) return;
        // Toca una nota grave percusiva
        this.pulseSynth.triggerAttackRelease("C2", "8n");
    }

    // --- NUEVO: Activar modo Glitch ---
    setGlitchMode(isActive) {
        if (!this.isStarted) return;
        // Si hay glitch, el sonido se rompe (wet = 1). Si no, limpio (wet = 0)
        // rampTo hace la transición suave en 0.5 segundos
        this.crusher.wet.rampTo(isActive ? 0.8 : 0, 0.5);
    }

    updateFromData(temp) {
        if (!this.isStarted) return;
        // Mapeo Temperatura -> Filtro (Igual que tenías)
        let filterFreq = mapRange(temp, 0, 40, 200, 3000); // Ajusté rangos a ºC reales
        this.filter.frequency.rampTo(filterFreq, 2); 
    }
}

// Función auxiliar
function mapRange(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}