import * as Tone from 'tone';

/**
 * MOTOR DE AUDIO BIOMÉTRICO
 * Sintetiza el paisaje sonoro emocional de Barcelona.
 */
export default class AudioEngine {
  constructor() {
    this.isStarted = false;
    this.currentEmotion = "NEUTRAL";

    // 1. PAD SINTETIZADOR (Base Atmosférica - Influenciado por Luz y CO2)
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 2.0, decay: 3.0, sustain: 0.5, release: 4.0 },
      volume: -12
    });

    // 2. SINTETIZADOR DE BAJOS (Drones / Tensión - Influenciado por Solastalgia)
    this.droneSynth = new Tone.FMSynth({
      harmonicity: 0.5,
      modulationIndex: 1.2,
      envelope: { attack: 4, decay: 2, sustain: 1, release: 5 },
      volume: -15
    });

    // 3. SINTETIZADOR DE PULSOS (Eventos puntuales / Ira - Influenciado por Ruido)
    this.pulseSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      volume: -5
    });

    // 4. CADENA DE EFECTOS (Influenciados por todos los datos)
    this.reverb = new Tone.Reverb({ decay: 8, wet: 0.6 }).toDestination();
    this.filter = new Tone.Filter({ frequency: 400, type: 'lowpass', Q: 1 });
    this.distortion = new Tone.Distortion({ distortion: 0, wet: 0 }); // Para Urban Anger / Ruido Alto
    this.bitCrusher = new Tone.BitCrusher({ bits: 8, wet: 0 }); // Para Eco-Anxiety / CO2 Alto

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
    // Progresión infinita que cambia según la emoción y el ritmo
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
        if (Math.random() > 0.3) this.pulseSynth.triggerAttackRelease("C2", "16n", time);
        break;

      case "ECO_ANXIETY":
        // Tenso / Disminuido (Verde)
        chord = ["D3", "F3", "G#3", "B3"];
        break;

      case "SOLASTALGIA":
        // Melancólico / Menor Extendido (Azul)
        chord = ["A2", "C3", "E3", "G3"];
        // Drone grave constante
        this.droneSynth.triggerAttackRelease("A1", "2n", time);
        break;

      case "ACTIVE_HOPE":
      default:
        // Luminoso / Mayor con Séptima (Dorado)
        chord = ["C3", "E3", "G3", "B3"];
        break;
    }

    // B. DISPARAR PAD (Probabilidad influenciada por congestión)
    // Mayor congestión = menor probabilidad de acordes largos y calmados
    let padProbability = this.map(Tone.Transport.bpm.value, 60, 140, 0.8, 0.3);
    if (Math.random() < padProbability) {
      this.padSynth.triggerAttackRelease(chord, "2n", time);
    }
  }

  /**
   * Actualiza el motor de audio basándose en el estado completo y los datos crudos
   */
  updateFromState(state) {
    if (!this.isStarted || !state) return;

    const { environment, transport, meta } = state;

    // 1. ACTUALIZAR EMOCIÓN
    const newEmotion = meta.emotion || "NEUTRAL";
    if (this.currentEmotion !== newEmotion) {
      console.log(`🔊 Cambio de Audio: ${this.currentEmotion} -> ${newEmotion}`);
      this.currentEmotion = newEmotion;
    }

    // 2. MODULAR EFECTOS CON DATOS CRUDOS EN TIEMPO REAL

    // LUZ -> FRECUENCIA DEL FILTRO y BRILLO
    // Más luz = sonido más abierto y brillante. Menos luz = más cerrado y opaco.
    const cutoff = this.map(environment.lightLevel, 0, 1, 200, 8000);
    this.filter.frequency.rampTo(cutoff, 1);

    // CO2 -> BITCRUSHER (Toxicidad digital)
    // Más CO2 = más destrucción digital del sonido.
    const crushWet = this.map(environment.co2, 400, 1200, 0, 0.8, true); // Clamp true
    this.bitCrusher.wet.rampTo(crushWet, 1);
    const bits = this.map(environment.co2, 400, 1200, 8, 3, true); // Menos bits = más roto
    this.bitCrusher.bits = bits;

    // RUIDO -> DISTORSIÓN y VOLUMEN PULSOS
    // Más ruido = más distorsión agresiva y pulsos más fuertes.
    const distWet = this.map(environment.noiseDb, 40, 90, 0, 0.6, true);
    this.distortion.wet.rampTo(distWet, 0.5);
    const pulseVol = this.map(environment.noiseDb, 40, 90, -20, -2, true);
    this.pulseSynth.volume.rampTo(pulseVol, 0.5);

    // CONGESTIÓN -> TEMPO (BPM)
    // Mayor congestión = tempo más rápido.
    const newBpm = this.map(transport.congestion, 0, 10, 60, 140, true);
    Tone.Transport.bpm.rampTo(newBpm, 2);

    // HUMEDAD (Clima) -> REVERB
    // Más humedad = sonido más "mojado" y denso.
    const verbWet = this.map(state.weather.humidity, 0, 100, 0.2, 0.8);
    this.reverb.wet.rampTo(verbWet, 2);
  }

  map(value, inMin, inMax, outMin, outMax, clamp = false) {
    let mappedValue = (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    if (clamp) {
      mappedValue = Math.max(outMin, Math.min(outMax, mappedValue));
    }
    return mappedValue;
  }
}
