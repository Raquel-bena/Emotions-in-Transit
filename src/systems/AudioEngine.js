import * as Tone from 'tone';

/**
 * MOTOR DE AUDIO BIOMÉTRICO
 * Sintetiza el paisaje sonoro emocional de Barcelona.
 */
export default class AudioEngine {
  constructor() {
    this.isStarted = false;
    this.currentEmotion = "NEUTRAL";

    // 1. PAD SINTETIZADOR (Base Atmosférica)
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 2.0, decay: 3.0, sustain: 0.5, release: 4.0 },
      volume: -12
    });

    // 2. SINTETIZADOR DE BAJOS (Drones / Tensión)
    this.droneSynth = new Tone.FMSynth({
      harmonicity: 0.5,
      modulationIndex: 1.2,
      envelope: { attack: 4, decay: 2, sustain: 1, release: 5 },
      volume: -15
    });

    // 3. SINTETIZADOR DE PULSOS (Eventos puntuales / Ira)
    this.pulseSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      volume: -5
    });

    // 4. CADENA DE EFECTOS
    this.reverb = new Tone.Reverb({ decay: 8, wet: 0.6 }).toDestination();
    this.filter = new Tone.Filter({ frequency: 400, type: 'lowpass', Q: 1 });
    this.distortion = new Tone.Distortion({ distortion: 0, wet: 0 }); // Para Urban Anger
    this.bitCrusher = new Tone.BitCrusher({ bits: 8, wet: 0 }); // Para Eco-Anxiety

    // CONEXIONES
    this.padSynth.connect(this.filter);
    this.droneSynth.connect(this.filter);

    // La salida del filtro va a los efectos destructivos y luego a la reverb
    this.filter.chain(this.distortion, this.bitCrusher, this.reverb);
    this.pulseSynth.connect(this.reverb); // Pulsos limpios con eco

    // BUCLES
    this.loop = null;
  }

  async start() {
    if (this.isStarted) return;
    try {
      await Tone.start();
      this.isStarted = true;
      console.log('🔊 AudioEngine: Iniciado.');
      this.startLoop();
    } catch (e) {
      console.error('Audio start error:', e);
    }
  }

  // Bucle principal de generación musical
  startLoop() {
    // Progresión infinita que cambia según la emoción
    this.loop = new Tone.Loop((time) => {
      this.playGenerativeChord(time);
    }, "4n").start(0);

    Tone.Transport.start();
  }

  playGenerativeChord(time) {
    if (!this.isStarted) return;

    // A. SELECCIÓN DE ACORDES SEGÚN EMOCIÓN
    let chord = [];
    let root = "C3";

    switch (this.currentEmotion) {
      case "URBAN_ANGER":
        // Disonante / Cluster (Rojo)
        chord = ["C3", "C#3", "F#3", "G3"];
        // Ritmo agresivo (Pulsos rápidos)
        if (Math.random() > 0.5) this.pulseSynth.triggerAttackRelease("C2", "16n", time);
        break;

      case "ECO_ANXIETY":
        // Tenso / Disminuido (Verde)
        chord = ["D3", "F3", "G#3", "B3"];
        // Glitch ocasional
        break;

      case "SOLASTALGIA":
        // Melancólico / Menor Extendido (Azul)
        chord = ["A2", "C3", "E3", "G3"];
        // Drone grave constante
        this.droneSynth.triggerAttackRelease("A1", "4n", time);
        break;

      case "ACTIVE_HOPE":
      default:
        // Luminoso / Mayor con Séptima (Dorado)
        chord = ["C3", "E3", "G3", "B3"];
        break;
    }

    // B. DISPARAR PAD (Solo ocasionalmente para dejar respirar)
    if (Math.random() > 0.6) {
      this.padSynth.triggerAttackRelease(chord, "2n", time);
    }
  }

  /**
   * Actualiza el motor de audio basándose en el estado completo
   */
  updateFromState(state) {
    if (!this.isStarted || !state) return;

    // 1. ACTUALIZAR EMOCIÓN
    const newEmotion = state.meta.emotion || "NEUTRAL";
    if (this.currentEmotion !== newEmotion) {
      console.log(`🔊 Cambio de Audio: ${this.currentEmotion} -> ${newEmotion}`);
      this.currentEmotion = newEmotion;
      this.applyEffectsPreset(newEmotion);
    }

    // 2. MODULAR EFECTOS EN TIEMPO REAL (Parámetros continuos)

    // Temperatura -> Frecuencia del Filtro (Más calor = Sonido más abierto/brillante)
    // 0°C -> 200Hz | 35°C -> 5000Hz
    const cutoff = this.map(state.weather.temp, 0, 35, 200, 5000);
    this.filter.frequency.rampTo(cutoff, 2);

    // Humedad -> Reverb (Más humedad = Más denso/mojado)
    const verbWet = this.map(state.weather.humidity, 0, 100, 0.2, 0.9);
    this.reverb.wet.rampTo(verbWet, 2);
  }

  applyEffectsPreset(emotion) {
    // Ajusta los efectos "destructivos" según la emoción
    switch (emotion) {
      case "URBAN_ANGER":
        this.distortion.wet.rampTo(0.4, 1); // Distorsión sucia
        this.bitCrusher.wet.rampTo(0, 1);
        break;
      case "ECO_ANXIETY":
        this.distortion.wet.rampTo(0, 1);
        this.bitCrusher.wet.rampTo(0.6, 1); // Sonido roto digital
        break;
      default: // Hope / Solastalgia
        this.distortion.wet.rampTo(0, 2); // Sonido limpio
        this.bitCrusher.wet.rampTo(0, 2);
        break;
    }
  }

  map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }
}
