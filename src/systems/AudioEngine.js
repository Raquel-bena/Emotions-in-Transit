// Archivo: js/audio/AudioEngine.js

/**
 * Motor de audio para "Emotions in Transit"
 * Sintetiza estados emocionales urbanos mediante sonido ambiental, eventos y efectos.
 */
class AudioEngine {
  constructor() {
    this.isStarted = false;

    // --- SINTETIZADORES ---
    // Pad ambiental (fondo emocional continuo)
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 2.0, decay: 1.0, sustain: 0.4, release: 4.0 },
      volume: -12 // Evita saturación
    });

    // Sintetizador de eventos (ej. llegada de bus, pico de emoción)
    this.pulseSynth = new Tone.MembraneSynth({
      pitchDecay: 0.04,
      octaves: 3,
      envelope: { attack: 0.01, decay: 0.4, sustain: 0 },
      volume: -6
    });

    // --- EFECTOS ---
    this.reverb = new Tone.Reverb({ decay: 6, wet: 0.5 }).toDestination();
    this.filter = new Tone.Filter({ frequency: 800, type: 'lowpass' });
    this.crusher = new Tone.BitCrusher({ bits: 3, wet: 0 });

    // --- ROUTING ---
    // El pad pasa por filtro → glitch → reverb
    this.padSynth.chain(this.filter, this.crusher, this.reverb);
    // El pulso va directo a reverb (más claro)
    this.pulseSynth.connect(this.reverb);

    // Estado interno para evitar eventos repetidos
    this.glitchActive = false;
    this.lastBusTrigger = 0;
    this.busCooldown = 2000; // 2s entre triggers
  }

  async start() {
    if (this.isStarted) return;

    try {
      await Tone.start();
      this.isStarted = true;
      console.log('🔊 AudioEngine: listo y en modo interacción.');
      this.startAmbience();
    } catch (err) {
      console.warn('🔇 AudioEngine: interacción necesaria para iniciar (ej. clic del usuario).', err);
    }
  }

  startAmbience() {
    if (!this.isStarted) return;

    // Acordes que evolucionan suavemente
    const chords = [
      ['C3', 'E3', 'G3', 'B3'], // Mayor: sereno
      ['D3', 'F3', 'A3', 'C4'], // Menor: introspectivo
      ['F3', 'A3', 'C4', 'E4'],
      ['G3', 'B3', 'D4', 'F4']
    ];
    let chordIndex = 0;

    this.ambienceInterval = setInterval(() => {
      if (!this.isStarted) return;
      const chord = chords[chordIndex];
      this.padSynth.triggerAttackRelease(chord, '4n');
      chordIndex = (chordIndex + 1) % chords.length;
    }, 8000); // Cambio cada 8s → más pausado, más "respiración"
  }

  triggerBusArrival() {
    if (!this.isStarted) return;

    const now = Date.now();
    if (now - this.lastBusTrigger < this.busCooldown) return; // Evita sobrecarga

    this.lastBusTrigger = now;
    this.pulseSynth.triggerAttackRelease('C2', '8n');
  }

  setGlitchMode(isActive) {
    if (!this.isStarted || this.glitchActive === isActive) return;

    this.glitchActive = isActive;
    const targetWet = isActive ? 0.7 : 0;
    this.crusher.wet.rampTo(targetWet, 0.6); // Transición suave

    if (isActive) {
      console.log('🌀 Modo Glitch activado: alta entropía emocional');
    }
  }

  /**
   * Actualiza parámetros sonoros desde datos ambientales.
   * @param {Object} data - Objeto con clima, movilidad, etc.
   */
  updateFromData(data) {
    if (!this.isStarted || !data) return;

    const { temp, humidity, bikeActivity } = data;

    // 1. FILTRO ↔ TEMPERATURA
    // Frío (0°C) → sonido opaco (200Hz); Calor (40°C) → brillante (3000Hz)
    const filterFreq = this.mapRange(temp, 0, 40, 200, 3000);
    this.filter.frequency.rampTo(filterFreq, 1.5);

    // 2. GLITCH ↔ HUMEDAD (alta humedad = distorsión emocional)
    const shouldGlitch = humidity > 80;
    this.setGlitchMode(shouldGlitch);

    // 3. VOLUMEN DEL PAD ↔ ACTIVIDAD (menos movimiento = más introspectivo)
    if (typeof bikeActivity === 'number') {
      const padVolume = this.mapRange(bikeActivity, 0, 500, -20, -10); // Ajusta según tus datos
      this.padSynth.volume.rampTo(padVolume, 2);
    }
  }

  // Utilidad interna (evita dependencia global)
  mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((outMax - outMin) * (value - inMin)) / (inMax - inMin);
  }

  // Limpieza al destruir (opcional, útil en apps complejas)
  dispose() {
    if (this.ambienceInterval) {
      clearInterval(this.ambienceInterval);
    }
    Tone.Transport.stop();
    // Aquí podrías llamar a .dispose() en cada módulo si es necesario
  }
}