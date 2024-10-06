const { AudioContext } = require('node-web-audio-api');
const readline = require('readline');
const audioCtx = new AudioContext();

// Configurar readline para capturar la entrada del teclado
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c' || key.name === 'q') {
    console.log('Saliendo del programa...');
    process.exit();
  }
});

function calculatePianoFrequencies() {
  const frequencies = {};
  const noteNames = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
  let currentFrequency = 440; // Frecuencia de A
  let octave = 2;

  for (let i = 0; i < 88; i++) {
    const noteIndex = i % 12;   // Obtener el índice del número de nota
    const noteName = noteNames[noteIndex] + octave;
    frequencies[noteName] = currentFrequency;
    currentFrequency *= Math.pow(2, 1 / 12); // Multiplicar por la raíz doceava de 2

    // Incrementar la octava cuando sea necesario
    if (noteIndex === 11) {
      octave++;
    }
  }
  return frequencies;
}
const pianoFrequencies = calculatePianoFrequencies();

function findNoteByNumber(note_to_number, n) {
  let result = null;
  for (const [note, number] of Object.entries(note_to_number)) {
    if (number == n) {
      result = note;
      break; // Salir del bucle una vez que se encuentra la nota
    }
  }
  return result;
}
function getSharpNoteFromNumber(n) {
  const note_to_number = {
    'c#2': 4, 'd#2': 6, 'f#2': 10, 'g#2': 12, 'a#2': 14,
    'c#3': 18, 'd#3': 20, 'f#3': 24, 'g#3': 26, 'a#3': 28,
    'c#4': 32, 'd#4': 34, 'f#4': 38, 'g#4': 40, 'a#4': 42,
    'c#5': 46, 'd#5': 48, 'f#5': 52, 'g#5': 54, 'a#5': 56,
    'c#6': 60, 'd#6': 62, 'f#6': 66, 'g#6': 68, 'a#6': 70,
  };
  return findNoteByNumber(note_to_number, n);
}

function getNaturalNoteFromNumber(n) {
  const note_to_number = {
    'c2': 3, 'd2': 5, 'e2': 7, 'f2': 9, 'g2': 11, 'a2': 13, 'b2': 15,
    'c3': 17, 'd3': 19, 'e3': 21, 'f3': 23, 'g3': 25, 'a3': 27, 'b3': 29,
    'c4': 31, 'd4': 33, 'e4': 35, 'f4': 37, 'g4': 39, 'a4': 41, 'b4': 43,
    'c5': 45, 'd5': 47, 'e5': 49, 'f5': 51, 'g5': 53, 'a5': 55, 'b5': 57,
    'c6': 59, 'd6': 61, 'e6': 63, 'f6': 65, 'g6': 67, 'a6': 69, 'b6': 71,
  };
  return findNoteByNumber(note_to_number, n);
}

function playNote(audioCtx, frequency, duration, timeOffset) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + timeOffset);
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime + timeOffset);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + timeOffset + duration); // Fade out

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(audioCtx.currentTime + timeOffset);
  oscillator.stop(audioCtx.currentTime + timeOffset + duration);
}

function playNoteFromNumberHelper(note, n) {
  if (!note) {
    // console.error(`No se encontró ninguna nota para el número: ${n}`);
    return;
  }
  const frequency = pianoFrequencies[note.toUpperCase()]; // Buscar la frecuencia
  if (!frequency) {
    console.error(`Frecuencia no encontrada para la nota: ${note}`);
    return;
  }
  // Reproduciendo nota: 
  playNote(audioCtx, frequency, 1, 0);
}

function playSharpNoteFromNumber(n) {
  const note = getSharpNoteFromNumber(n);
  playNoteFromNumberHelper(note, n);
}
function playNaturalNoteFromNumber(n) {
  const note = getNaturalNoteFromNumber(n);
  playNoteFromNumberHelper(note, n);
}

const PIANO_DESIGN =
  ` ______________________________________________________________________
 |:::::: o o o o o o .  |     Teclado     | [60] o o o o o       ::::::| 
 |:::::: o o o o o      |       CLI       |       o o o o o      ::::::|
 |::::::________________|____..._...____._|______________________::::::|
 | # # | # # # | # # | # # # | # # | # # # | # # | # # # | # # | # # # |
 | # # | # # # | # # | # # # | # # | # # # | # # | # # # | # # | # # # |
 | # # | # # # | # # | # # # | # # | # # # | # # | # # # | # # | # # # |
 | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | | |
 |_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|`;
console.clear();
console.log('Haga clic en las teclas del piano para reproducir su nota. Esc para salir.');

console.log(PIANO_DESIGN);

// Habilitar la lectura de la entrada en modo "raw"
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// Habilitar modo mouse en la terminal
process.stdout.write('\x1b[?1000h');  // Habilitar reporte de clics
process.stdout.write('\x1b[?1006h');  // Habilitar modo extendido de reporte de clics

// Escuchar eventos de datos desde stdin (para capturar clics)
process.stdin.on('data', (data) => {
  // Convertir el buffer a una cadena de texto
  const str = data.toString('utf8');

  // Revisar si la secuencia corresponde a un clic
  const mouseEventRegex = /\x1b\[<(\d+);(\d+);(\d+)([M])/; // Regex para detectar clics

  const match = str.match(mouseEventRegex);
  if (match) {
    const buttonCode = match[1];
    const x = match[2];
    const y = match[3];
    const release = match[4] === 'm';
    if (y == 8 || y == 7 || y == 6) {
      playSharpNoteFromNumber(x)
    }
    if (y == 9 || y == 10) {
      playNaturalNoteFromNumber(x)
    }
    if (!release) {  // Detectar solo cuando se presiona, no cuando se libera
      // Clic detectado en posición X:  y, botón: 
      // console.log(`${x}, Y: ${y}, botón: ${buttonCode}`);
    }
  }

  // Esc para salir
  if (data.toString() === '\u001b') {
    audioCtx.close();
    process.exit();
  }
});

// Limpiar al salir
process.on('exit', () => {
  audioCtx.close();
  // Deshabilitar modo mouse
  process.stdout.write('\x1b[?1000l');
  process.stdout.write('\x1b[?1006l');
});

