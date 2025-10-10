import { getState } from './state.js';
import { INTERVAL_SEMITONES, getNoteFromIndex, getNoteIndex } from './data.js';
import { NUM_FRETS } from './config.js';
import { calculateTransposition } from './utils.js';

// Define INTERVAL_COLORS here, as it's visualization specific
const INTERVAL_COLORS = {
    0: '#d32f2f', // R (Root)
    1: '#880e4f', // m2/b9
    2: '#4a148c', // M2/9
    3: '#0d47a1', // m3/#9
    4: '#1b5e20', // M3
    5: '#f9a825', // P4/11
    6: '#e65100', // TT/#11/b5
    7: '#bf360c', // P5
    8: '#5d4037', // m6/b13
    9: '#004d40', // M6/13
    10: '#37474f', // m7/b7
    11: '#f57f17', // M7
};

/**
 * Helper to convert array of interval names to semitone offsets from the root.
 * @param {string[]} intervals 
 * @returns {number[]}
 */
export function intervalsToSemitones(intervals) {
    if (!intervals || intervals.length === 0) return [];
    if (intervals.length === 1 && intervals[0] === 'All 12 notes') return Array.from({length: 12}, (_, i) => i);
    return intervals.map(interval => INTERVAL_SEMITONES[interval]).filter(s => s !== undefined);
}

/**
 * Calculates the set of semitone offsets for a scale.
 * @param {string[] | null} scaleIntervals 
 * @returns {Set<number>}
 */
export function getScaleSemitoneSet(scaleIntervals) {
    if (!scaleIntervals || scaleIntervals.length === 0) return new Set();
    if (scaleIntervals.length === 1 && scaleIntervals[0] === 'All 12 notes') {
        return new Set(Array.from({length: 12}, (_, i) => i)); 
    }
    return new Set(intervalsToSemitones(scaleIntervals));
}

/**
 * Initializes the static DOM structure for a fretboard diagram.
 */
export function createFretboard(containerElement, fretboardId, fretStart = 0, fretEnd = NUM_FRETS) {
    
    // Clear the container first
    containerElement.innerHTML = '';
    
    const { currentTuning: TUNING, tuningSelect } = getState();

    const fretboard = document.createElement('div');
    fretboard.id = fretboardId;
    fretboard.classList.add('fretboard-diagram');

    const numVisibleFrets = fretEnd - fretStart;

    // 1. Strings and Frets
    TUNING.forEach((openNote, i) => {
        const string = document.createElement('div');
        string.className = 'string';
        string.dataset.stringIndex = 6 - i; 

        for (let fretIndex = 0; fretIndex <= numVisibleFrets; fretIndex++) {
            const fret = fretStart + fretIndex;

            const fretDiv = document.createElement('div');
            fretDiv.className = 'fret';
            fretDiv.dataset.fret = fret;

            // Apply specific nut styling if this is the fret 0 position
            if (fret === 0) {
                 fretDiv.style.minWidth = '15px';
                 fretDiv.style.borderRight = '6px solid #111';
                 fretDiv.innerHTML = `<div class="string-line"></div>`;
            } else {
                 fretDiv.style.minWidth = '60px';
                 fretDiv.style.borderRight = '2px solid #888';
                 fretDiv.innerHTML = `<span></span><div class="string-line"></div>`; // Fret wire span
            }
            
            // Fret dots (inlays). i=2 corresponds to the D string row visually for a 6-string. This needs adjustment for other instruments.
            // Let's assume the middle-ish string gets the dots.
            const dotRow = Math.floor(TUNING.length / 2) -1;

            const singleDotFrets = [3, 5, 7, 9, 15, 17, 19, 21];
            const doubleDotFrets = [12, 24];
            
            // We only show dots if fret 0 is included (i.e., we see the start of the neck)
            if (i === dotRow) { 
                if (singleDotFrets.includes(fret)) {
                    const dot = document.createElement('div');
                    dot.className = 'fret-dot';
                    dot.style.top = '0%'; 
                    fretDiv.appendChild(dot);
                }
            }
            if (doubleDotFrets.includes(fret)) {
                // For double dots, use rows above and below the center line.
                const doubleDotRow1 = Math.floor(TUNING.length / 2) - 2;
                const doubleDotRow2 = Math.ceil(TUNING.length / 2);

                if (i === doubleDotRow1 || i === doubleDotRow2) {
                    const dot = document.createElement('div');
                    dot.className = 'fret-dot';
                    dot.style.top = i === doubleDotRow1 ? '0%' : '100%'; 
                    fretDiv.appendChild(dot);
                }
            }

            string.appendChild(fretDiv);
        }
        fretboard.prepend(string);
    }); 

    // 2. Fret Numbers
    const fretNumbers = document.createElement('div');
    fretNumbers.id = `fret-numbers-${fretboardId}`;
    fretNumbers.classList.add('fret-numbers');
    const fretNumbersInner = document.createElement('div');
    fretNumbersInner.style.display = 'table';
    fretNumbersInner.style.width = '100%';

    const singleMarkers = [3, 5, 7, 9, 15, 17, 19, 21];
    const doubleMarkers = [12, 24];

    for(let fretIndex = 0; fretIndex <= numVisibleFrets; fretIndex++) {
        const fret = fretStart + fretIndex;
        
        const fretNumSpan = document.createElement('span');
        fretNumSpan.style.minWidth = fret === 0 ? '15px' : '60px';
        fretNumSpan.style.textAlign = 'center';
        
        if (fret > 0) {
            if (singleMarkers.includes(fret) || doubleMarkers.includes(fret)) fretNumSpan.textContent = fret;
        }

        fretNumbersInner.appendChild(fretNumSpan);
    }
    fretNumbers.appendChild(fretNumbersInner);

    containerElement.appendChild(fretboard);
    containerElement.appendChild(fretNumbers);
}

/**
 * Updates the notes displayed on a specific fretboard container based on state and intervals.
 * customRootNote is used for visualizations like Circle of Fifths, overriding the global root.
 */
export function updateFretboardDisplay(containerElement, intervals, isScale, activeStrings = null, customRootNote = null, customNumFrets = null) {
    const { 
        currentRootNote, 
        currentScaleIntervals, 
        fretboardDisplayMode,
        currentStartFret,
        isStartFretFilterActive,
        isTransposeFilterActive,
        currentTranspositionValue,
        currentTuning: TUNING,
    } = getState();
    const fretboard = containerElement.querySelector('.fretboard-diagram');
    if (!fretboard) return;

    // Determine the root note for this specific display
    const rootNote = customRootNote || currentRootNote;

    // Determine transposition offset
    // Apply transposition logic ONLY IF this is NOT a custom display (like COF visualization)
    let transpositionOffset = 0;
    if (!customRootNote && isTransposeFilterActive && currentTranspositionValue) {
        transpositionOffset = calculateTransposition(currentTranspositionValue);
    }

    // Clear previous notes
    const existingMarkers = fretboard.querySelectorAll('.note-marker');
    existingMarkers.forEach(marker => marker.remove());

    if (!rootNote || !intervals || intervals.length === 0) {
        return; 
    }

    const rootNoteIndex = getNoteIndex(rootNote);
    if (rootNoteIndex === -1) return;

    // Effective root note index (for coloring/labeling 'R')
    const effectiveRootNoteIndex = (rootNoteIndex + transpositionOffset) % 12;

    let noteIndices;
    let semitoneOffsets; 

    if (intervals.length === 1 && intervals[0] === 'All 12 notes') {
        noteIndices = new Set(Array.from({ length: 12 }, (_, i) => i));
        semitoneOffsets = Array.from({ length: 12 }, (_, i) => i);
    } else {
        semitoneOffsets = intervalsToSemitones(intervals);
        // Calculate the notes that should appear, shifted by transpositionOffset
        noteIndices = new Set(semitoneOffsets.map(offset => (rootNoteIndex + offset + transpositionOffset) % 12));
    }

    const scaleSemitones = currentScaleIntervals ? intervalsToSemitones(currentScaleIntervals) : [];

    // Determine fret range based on existing DOM structure
    const fretElements = fretboard.querySelectorAll('.fret');
    if (fretElements.length === 0) return; 

    const fretStart = parseInt(fretElements[0].dataset.fret, 10);
    const fretEnd = parseInt(fretElements[fretElements.length - 1].dataset.fret, 10);
    
    // Check start fret filter *only* for non-custom root displays
    const activeStartFret = (customRootNote || currentStartFret === null) ? 0 : currentStartFret;
    const filterActive = !customRootNote && isStartFretFilterActive;

    // strings are ordered from high E (index 0 in DOM) to low E (index 5 in DOM) 
    const strings = fretboard.querySelectorAll('.string');
    strings.forEach((stringEl, index) => {
        // String number 1 for High E (index 0) up to 6 for Low E (index 5)
        const stringNumber = TUNING.length - index; 

        if (activeStrings && !activeStrings.includes(stringNumber)) {
            stringEl.style.opacity = '0.3';
            stringEl.querySelectorAll('.note-marker').forEach(marker => marker.remove());
            return;
        } else {
            stringEl.style.opacity = '1';
        }

        // TUNING is Low E (index 0) to High E (index 5). Reverse index lookup for DOM iteration.
        const openNote = TUNING[TUNING.length - 1 - index];
        const openNoteIndex = getNoteIndex(openNote);

        for (let fret = fretStart; fret <= fretEnd; fret++) {
            
            // Start Fret filter application: hide notes before the currentStartFret if filter is active.
            if (filterActive && fret < activeStartFret) {
                continue; 
            }
            
            const currentNoteIndex = (openNoteIndex + fret) % 12;

            if (noteIndices.has(currentNoteIndex)) {
                const fretEl = stringEl.querySelector(`[data-fret="${fret}"]`);
                if (fretEl) {
                    // Remove existing markers before adding new ones
                    fretEl.querySelectorAll('.note-marker').forEach(marker => marker.remove());
                    
                    const noteMarker = document.createElement('div');
                    noteMarker.classList.add('note-marker');                  

                    const noteName = getNoteFromIndex(currentNoteIndex);
                    
                    // 1. Offset relative to the EFFECTIVE root (for color/R label)
                    const noteOffset = (currentNoteIndex - effectiveRootNoteIndex + 12) % 12;

                    // 2. Offset relative to the ORIGINAL root (for interval name lookup)
                    // The note currently displayed (currentNoteIndex) corresponds to an untransposed note.
                    const untransposedNoteIndex = (currentNoteIndex - transpositionOffset + 12) % 12;
                    const originalIntervalOffset = (untransposedNoteIndex - rootNoteIndex + 12) % 12;

                    // Apply color based on interval offset
                    const color = INTERVAL_COLORS[noteOffset] || '#333';
                    noteMarker.style.backgroundColor = color;
                    
                    let displayContent = noteName;

                    // Determine display content based on mode
                    const actualDisplayMode = customRootNote ? 'intervals' : fretboardDisplayMode;

                    if (actualDisplayMode === 'intervals') {
                        // Check if this note is the effective root
                        if (noteOffset === 0) { 
                            displayContent = 'R';
                        } else {
                            // Use originalIntervalOffset to find the name in the source intervals
                            
                            if (isScale && currentScaleIntervals) {
                                // For scale diagrams (including string sets)
                                const scaleIndex = scaleSemitones.indexOf(originalIntervalOffset);
                                if (scaleIndex !== -1) {
                                    displayContent = currentScaleIntervals[scaleIndex];
                                } else {
                                    displayContent = noteName;
                                }
                            } else if (intervals) {
                                // For chord/interval diagrams
                                const intervalIndex = semitoneOffsets.indexOf(originalIntervalOffset);
                                if (intervalIndex !== -1) {
                                    displayContent = intervals[intervalIndex];
                                } else {
                                    displayContent = noteName;
                                }
                            }
                        }
                    }

                    noteMarker.textContent = displayContent;
                    fretEl.appendChild(noteMarker);
                }
            }
        }
    });
}