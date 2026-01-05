/**
 * EMOTIONS IN TRANSIT - AUDIO ENGINE (Tone.js)
 * Autor: Equipo TFM
 */

let synth, membrane, reverb, filter;
let isAudioStarted = false;
let currentLoop;

// ESCALAS EMOCIONALES
const SCALES = {
    // Esperanza Activa: Escala Mayor Brillante - 528Hz Ref
    HOPE: ["C4", "E4", "G4", "B4", "C5"], 
    // Solastalgia: Escala Menor Melancólica - 256Hz Ref
    MELANCHOLY: ["C3", "Eb3", "G3", "Bb3"], 
    // Rabia Urbana: Escala de Tonos Enteros / Tensión - 330Hz Ref
    ANGER: ["C4", "C#4", "F#4", "G#4"] 
};

let currentNotes = SCALES.HOPE;

async function initAudio() {
    if (isAudioStarted) return;
    await Tone.start();
    console.log("Audio Engine Iniciado");

    // 1. EFECTOS ATMOSFÉRICOS
    reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();
    
    // Filtro: Simula la temperatura (Calor = Abierto, Frío = Cerrado)
    filter = new Tone.Filter(1000, "lowpass").connect(reverb);

    // 2. SINTETIZADORES
    synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "fatsine" }, 
        envelope: { attack: 0.5, decay: 0.1, sustain: 0.3, release: 2 }
    }).connect(filter);

    membrane = new Tone.MembraneSynth().connect(reverb);

    // 3. BUCLE GENERATIVO
    currentLoop = new Tone.Loop(time => {
        // Probabilidad basada en densidad (TMB)
        if (Math.random() < currentData.densityIndex + 0.2) {
            let note = currentNotes[Math.floor(Math.random() * currentNotes.length)];
            synth.triggerAttackRelease(note, "2n", time);
            
            if (currentData.densityIndex > 0.6) {
                membrane.triggerAttackRelease("C2", "8n", time);
            }
        }
    }, "4n").start(0);

    Tone.Transport.start();
    isAudioStarted = true;
}

// FUNCIÓN DE ACTUALIZACIÓN (Llamada desde sketch.js)
function updateAudioParams(data) {
    if (!isAudioStarted) return;

    // A. MAPEO DE ESCALAS Y TEMPO
    if (data.rainIndex > 0.5) {
        // MODO: Solastalgia
        currentNotes = SCALES.MELANCHOLY;
        Tone.Transport.bpm.rampTo(60, 2); 
        reverb.wet.value = 0.8; 
        reverb.decay = 6; 
    } 
    else if (data.chaosIndex > 0.6) {
        // MODO: Rabia Urbana
        currentNotes = SCALES.ANGER;
        Tone.Transport.bpm.rampTo(140, 1); 
        reverb.wet.value = 0.1; 
        synth.set({ detune: Math.random() * 50 }); 
    } 
    else {
        // MODO: Esperanza Activa
        currentNotes = SCALES.HOPE;
        Tone.Transport.bpm.rampTo(90, 2); 
        reverb.wet.value = 0.3;
        synth.set({ detune: 0 }); 
    }

    // B. MAPEO DE TIMBRE (Temperatura)
    let filterFreq = map(data.tempIndex, 0, 1, 200, 5000);
    filter.frequency.rampTo(filterFreq, 0.5);

    // C. VOLUMEN GLOBAL
    Tone.Destination.volume.rampTo(-10, 1);
}
