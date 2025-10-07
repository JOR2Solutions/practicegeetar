import { getState } from './state.js';
import { INTERVAL_SEMITONES, getNoteIndex } from './data.js';
import { intervalsToSemitones } from './fretboard-viz.js';
import { calculateTransposition } from './utils.js';

// Re-use the same colors from fretboard-viz
const INTERVAL_COLORS = {
    0: '#d32f2f', 1: '#880e4f', 2: '#4a148c', 3: '#0d47a1', 
    4: '#1b5e20', 5: '#f9a825', 6: '#e65100', 7: '#bf360c', 
    8: '#5d4037', 9: '#004d40', 10: '#37474f', 11: '#f57f17',
};

const PIANO_KEY_INFO = [
    { name: 'C', type: 'white', semitone: 0 },
    { name: 'C#', type: 'black', semitone: 1, positionClass: 'cs' },
    { name: 'D', type: 'white', semitone: 2 },
    { name: 'D#', type: 'black', semitone: 3, positionClass: 'ds' },
    { name: 'E', type: 'white', semitone: 4 },
    { name: 'F', type: 'white', semitone: 5 },
    { name: 'F#', type: 'black', semitone: 6, positionClass: 'fs' },
    { name: 'G', type: 'white', semitone: 7 },
    { name: 'G#', type: 'black', semitone: 8, positionClass: 'gs' },
    { name: 'A', type: 'white', semitone: 9 },
    { name: 'A#', type: 'black', semitone: 10, positionClass: 'as' },
    { name: 'B', type: 'white', semitone: 11 },
];

export function createPiano(containerElement, pianoId) {
    containerElement.innerHTML = '';
    const keyboard = document.createElement('div');
    keyboard.id = pianoId;
    keyboard.classList.add('piano-keyboard');

    for (let octave = 0; octave < 2; octave++) {
        PIANO_KEY_INFO.forEach(keyInfo => {
            const key = document.createElement('div');
            key.classList.add(keyInfo.type === 'white' ? 'white-key' : 'black-key');
            
            // Set semitone for highlighting logic, which repeats each octave
            key.dataset.semitone = keyInfo.semitone;

            // Position black keys with inline styles instead of classes
            if (keyInfo.type === 'black') {
                const basePositions = { 'cs': 20, 'ds': 50, 'fs': 110, 'gs': 140, 'as': 170 };
                const octaveWidth = 7 * 30; // 7 white keys, 30px each
                const leftPos = basePositions[keyInfo.positionClass] + (octave * octaveWidth);
                key.style.left = `${leftPos}px`;
            }
            
            keyboard.appendChild(key);
        });
    }

    containerElement.appendChild(keyboard);
}

export function updatePianoDisplay(containerElement, intervals, isScale, customRootNote = null) {
    const { 
        currentRootNote, 
        currentScaleIntervals,
        isTransposeFilterActive,
        currentTranspositionValue,
    } = getState();

    const keyboard = containerElement.querySelector('.piano-keyboard');
    if (!keyboard) return;

    const rootNote = customRootNote || currentRootNote;

    let transpositionOffset = 0;
    if (!customRootNote && isTransposeFilterActive && currentTranspositionValue) {
        transpositionOffset = calculateTransposition(currentTranspositionValue);
    }

    const existingMarkers = keyboard.querySelectorAll('.key-note-marker');
    existingMarkers.forEach(marker => marker.remove());

    if (!rootNote || !intervals || intervals.length === 0) {
        return;
    }

    const rootNoteIndex = getNoteIndex(rootNote);
    if (rootNoteIndex === -1) return;

    const effectiveRootNoteIndex = (rootNoteIndex + transpositionOffset) % 12;

    let noteIndices;
    let semitoneOffsets; 

    if (intervals.length === 1 && intervals[0] === 'All 12 notes') {
        noteIndices = new Set(Array.from({ length: 12 }, (_, i) => i));
        semitoneOffsets = Array.from({ length: 12 }, (_, i) => i);
    } else {
        semitoneOffsets = intervalsToSemitones(intervals);
        noteIndices = new Set(semitoneOffsets.map(offset => (rootNoteIndex + offset + transpositionOffset) % 12));
    }

    const keys = keyboard.querySelectorAll('[data-semitone]');
    keys.forEach(key => {
        const keySemitone = parseInt(key.dataset.semitone, 10);
        if (noteIndices.has(keySemitone)) {
            const noteMarker = document.createElement('div');
            noteMarker.classList.add('key-note-marker');

            const noteOffset = (keySemitone - effectiveRootNoteIndex + 12) % 12;
            noteMarker.style.backgroundColor = INTERVAL_COLORS[noteOffset] || '#333';

            let displayContent = '';
            if (noteOffset === 0) {
                displayContent = 'R';
            } else {
                 const untransposedNoteIndex = (keySemitone - transpositionOffset + 12) % 12;
                 const originalIntervalOffset = (untransposedNoteIndex - rootNoteIndex + 12) % 12;

                 const intervalIndex = semitoneOffsets.indexOf(originalIntervalOffset);
                 if (intervalIndex !== -1) {
                    displayContent = intervals[intervalIndex];
                 }
            }

            noteMarker.textContent = displayContent;
            key.appendChild(noteMarker);
        }
    });
}