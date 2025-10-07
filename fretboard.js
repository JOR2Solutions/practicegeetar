import * as dom from './dom.js';
import { getState } from './state.js';
import { INTERVAL_SEMITONES, CIRCLE_OF_FIFTHS } from './data.js';
import { updateSlideshowView } from './slideshow.js';
import { updateFretboardDisplay, createFretboard, getScaleSemitoneSet } from './fretboard-viz.js';
import { createPiano, updatePianoDisplay } from './piano-viz.js';
import { getCardDisplayValue } from './utils.js';

export function updateFretboardValueDisplays() {
    const { 
        currentRootNote,
        currentInterval, currentInterval2,
        currentTwoStringSet, currentThreeStringSet, currentFourStringSet
    } = getState();

    const valueOrEmpty = (val) => val || '';

    dom.scaleValueDisplay.textContent = valueOrEmpty(getCardDisplayValue(dom.card2));
    dom.chordValueDisplay.textContent = valueOrEmpty(getCardDisplayValue(dom.card1));
    dom.chord2ValueDisplay.textContent = valueOrEmpty(getCardDisplayValue(dom.cardChord2));
    dom.triadValueDisplay.textContent = valueOrEmpty(getCardDisplayValue(dom.card3));
    dom.triad2ValueDisplay.textContent = valueOrEmpty(getCardDisplayValue(dom.cardTriad2));
    dom.tetradValueDisplay.textContent = valueOrEmpty(getCardDisplayValue(dom.card4));
    dom.tetrad2ValueDisplay.textContent = valueOrEmpty(getCardDisplayValue(dom.cardTetrad2));
    dom.pentadValueDisplay.textContent = valueOrEmpty(getCardDisplayValue(dom.card5));
    dom.pentad2ValueDisplay.textContent = valueOrEmpty(getCardDisplayValue(dom.cardPentad2));
    
    dom.intervalValueDisplay.textContent = valueOrEmpty(currentInterval || (dom.die3.textContent !== '?' ? dom.die3.textContent : ''));
    dom.interval2ValueDisplay.textContent = valueOrEmpty(currentInterval2 || getCardDisplayValue(dom.cardInterval2));
    
    dom.twostringValueDisplay.textContent = valueOrEmpty(currentTwoStringSet || getCardDisplayValue(dom.card10));
    dom.threestringValueDisplay.textContent = valueOrEmpty(currentThreeStringSet || getCardDisplayValue(dom.card11));
    const fourSetVal = valueOrEmpty(currentFourStringSet || getCardDisplayValue(dom.card13));
    dom.fourstringValueDisplay.textContent = fourSetVal;
    dom.fourstringValueDisplay2.textContent = fourSetVal;

    const scaleVal = getCardDisplayValue(dom.card2);
    const chordVal = getCardDisplayValue(dom.card1);
    let scaleChordText = '';
    if (scaleVal && chordVal) {
        scaleChordText = `${chordVal} within ${scaleVal}`;
    } else if (chordVal) {
        scaleChordText = chordVal;
    } else if (scaleVal) {
        scaleChordText = scaleVal;
    }
    dom.scaleChordValueDisplay.textContent = scaleChordText;
    
    const cofCardValue = getCardDisplayValue(dom.cardCof, '?');
    if (cofCardValue !== '?' && scaleVal && currentRootNote) {
        dom.cofValueDisplay.textContent = `${scaleVal} across the Circle of Fifths, starting on ${currentRootNote.split(' ')[0]}`;
    } else {
        dom.cofValueDisplay.textContent = '';
    }
}

function updateDiagrams(fretboardContainer, pianoContainer, intervals, isScale, activeStrings = null, customRootNote = null) {
    updateFretboardDisplay(fretboardContainer, intervals, isScale, activeStrings, customRootNote);
    updatePianoDisplay(pianoContainer, intervals, isScale, customRootNote);
}

function updateScaleFretboard() {
    const { currentScaleIntervals } = getState();
    updateDiagrams(dom.scaleFretboardContainer, dom.scalePianoContainer, currentScaleIntervals, true);
}

function updateChordFretboard() {
    const { currentChordIntervals } = getState();
    updateDiagrams(dom.chordFretboardContainer, dom.chordPianoContainer, currentChordIntervals, false);
}

function updateChord2Fretboard() {
    const { currentChordIntervals2 } = getState();
    updateDiagrams(dom.chord2FretboardContainer, dom.chord2PianoContainer, currentChordIntervals2, false);
}

function updateTriadFretboard() {
    const { currentTriadIntervals } = getState();
    updateDiagrams(dom.triadFretboardContainer, dom.triadPianoContainer, currentTriadIntervals, false);
}

function updateTriad2Fretboard() {
    const { currentTriadIntervals2 } = getState();
    updateDiagrams(dom.triad2FretboardContainer, dom.triad2PianoContainer, currentTriadIntervals2, false);
}

function updateTetradFretboard() {
    const { currentTetradIntervals } = getState();
    updateDiagrams(dom.tetradFretboardContainer, dom.tetradPianoContainer, currentTetradIntervals, false);
}

function updateTetrad2Fretboard() {
    const { currentTetradIntervals2 } = getState();
    updateDiagrams(dom.tetrad2FretboardContainer, dom.tetrad2PianoContainer, currentTetradIntervals2, false);
}

function updatePentadFretboard() {
    const { currentPentadIntervals } = getState();
    updateDiagrams(dom.pentadFretboardContainer, dom.pentadPianoContainer, currentPentadIntervals, false);
}

function updatePentad2Fretboard() {
    const { currentPentadIntervals2 } = getState();
    updateDiagrams(dom.pentad2FretboardContainer, dom.pentad2PianoContainer, currentPentadIntervals2, false);
}

function updateTwostringFretboard() {
    const { currentScaleIntervals, currentTwoStringSet } = getState();
    if (!currentScaleIntervals || !currentTwoStringSet) {
        updateDiagrams(dom.twostringFretboardContainer, dom.twostringPianoContainer, [], true); 
        return;
    }
    const stringNumbers = currentTwoStringSet.split(' & ').map(s => parseInt(s.trim()));
    updateDiagrams(dom.twostringFretboardContainer, dom.twostringPianoContainer, currentScaleIntervals, true, stringNumbers);
}

function updateThreestringFretboard() {
    const { currentScaleIntervals, currentThreeStringSet } = getState();
    if (!currentScaleIntervals || !currentThreeStringSet) {
        updateDiagrams(dom.threestringFretboardContainer, dom.threestringPianoContainer, [], true);
        return;
    }
    const stringNumbers = currentThreeStringSet.split(' & ').map(s => parseInt(s.trim()));
    updateDiagrams(dom.threestringFretboardContainer, dom.threestringPianoContainer, currentScaleIntervals, true, stringNumbers);
}

function updateFourstringFretboard() {
    const { currentScaleIntervals, currentFourStringSet } = getState();
    if (!currentScaleIntervals || !currentFourStringSet) {
        updateDiagrams(dom.fourstringFretboardContainer, dom.fourstringPianoContainer, [], true);
        return;
    }
    const stringNumbers = currentFourStringSet.split(' & ').map(s => parseInt(s.trim()));
    updateDiagrams(dom.fourstringFretboardContainer, dom.fourstringPianoContainer, currentScaleIntervals, true, stringNumbers);
}

function updateFourstringFretboard2() {
    const { currentScaleIntervals, currentFourStringSet } = getState();
    if (!currentScaleIntervals || !currentFourStringSet) {
        updateDiagrams(dom.fourstringFretboardContainer2, dom.fourstringPianoContainer2, [], true);
        return;
    }
    const stringNumbers = currentFourStringSet.split(' & ').map(s => parseInt(s.trim()));
    updateDiagrams(dom.fourstringFretboardContainer2, dom.fourstringPianoContainer2, currentScaleIntervals, true, stringNumbers);
}

function updateIntervalFretboard() {
    const { currentRootNote, currentInterval } = getState();
    if (!currentRootNote || !currentInterval) {
        updateDiagrams(dom.intervalFretboardContainer, dom.intervalPianoContainer, [], false); 
        return;
    }
    const intervalsToDisplay = ['R'];
    if (currentInterval !== 'R') intervalsToDisplay.push(currentInterval);
    updateDiagrams(dom.intervalFretboardContainer, dom.intervalPianoContainer, intervalsToDisplay, false);
}

function updateInterval2Fretboard() {
    const { currentRootNote, currentInterval2 } = getState();
    if (!currentRootNote || !currentInterval2) {
        updateDiagrams(dom.interval2FretboardContainer, dom.interval2PianoContainer, [], false);
        return;
    }
    const intervalsToDisplay = ['R'];
    if (currentInterval2 !== 'R') intervalsToDisplay.push(currentInterval2);
    updateDiagrams(dom.interval2FretboardContainer, dom.interval2PianoContainer, intervalsToDisplay, false);
}

function updateScaleChordFretboard() {
    const { currentRootNote, currentScaleIntervals, currentChordIntervals } = getState();
    if (!currentRootNote || !currentScaleIntervals || !currentChordIntervals) {
        updateDiagrams(dom.scaleChordFretboardContainer, dom.scaleChordPianoContainer, [], false);
        return;
    }
    
    const scaleSemitoneSet = getScaleSemitoneSet(currentScaleIntervals);
    if (scaleSemitoneSet.size === 12) {
        updateDiagrams(dom.scaleChordFretboardContainer, dom.scaleChordPianoContainer, currentChordIntervals, false);
        return;
    }

    const intersectingIntervals = currentChordIntervals.filter(interval => {
        const semitone = INTERVAL_SEMITONES[interval];
        return semitone !== undefined && scaleSemitoneSet.has(semitone);
    });
    
    updateDiagrams(dom.scaleChordFretboardContainer, dom.scaleChordPianoContainer, intersectingIntervals, false);
}

const COF_DISPLAY_NUM_FRETS = 5; // Frets 0 to 5

function updateCofFretboards() {
    const { currentScaleIntervals, currentRootNote, isCoFViewActive } = getState();
    const container = dom.cofFretboardContainer;
    container.innerHTML = '';
    
    if (!isCoFViewActive || !currentScaleIntervals || !currentRootNote || currentScaleIntervals.length === 0) {
        dom.cofValueDisplay.textContent = '';
        return;
    }

    const startNote = currentRootNote.split(' ')[0];
    
    // Determine where to start in the CIRCLE_OF_FIFTHS array
    let startIndex = CIRCLE_OF_FIFTHS.findIndex(note => note.startsWith(startNote));
    if (startIndex === -1) {
        // Fallback for notes like Db/C#
        startIndex = CIRCLE_OF_FIFTHS.findIndex(note => note.includes(startNote));
    }
    
    if (startIndex === -1) {
        dom.cofValueDisplay.textContent = `Could not find starting key ${startNote} in CoF.`;
        return;
    }

    // Reorder CIRCLE_OF_FIFTHS to start from the current root note
    const orderedCoF = [
        ...CIRCLE_OF_FIFTHS.slice(startIndex),
        ...CIRCLE_OF_FIFTHS.slice(0, startIndex)
    ];

    orderedCoF.forEach((noteName, index) => {
        const root = noteName.split(' / ')[0]; // Use primary name for root
        
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'cof-item-wrapper';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'cof-item-title';
        titleDiv.textContent = `${root}`;
        itemWrapper.appendChild(titleDiv);
        
        const diagramPair = document.createElement('div');
        diagramPair.className = 'cof-diagram-pair';

        const fretboardContainerSmall = document.createElement('div');
        fretboardContainerSmall.className = 'fretboard-container-small';
        
        const pianoContainerSmall = document.createElement('div');
        pianoContainerSmall.className = 'piano-container-small';

        diagramPair.appendChild(fretboardContainerSmall);
        diagramPair.appendChild(pianoContainerSmall);
        itemWrapper.appendChild(diagramPair);
        
        // Create the individual fretboard structure (fret 0 to COF_DISPLAY_NUM_FRETS)
        createFretboard(fretboardContainerSmall, `fretboard-cof-${index}`, COF_DISPLAY_NUM_FRETS, 0);
        // Create the piano structure
        createPiano(pianoContainerSmall, `piano-cof-${index}`);

        // Populate with scale notes, providing custom root note
        updateFretboardDisplay(fretboardContainerSmall, currentScaleIntervals, true, null, root);
        updatePianoDisplay(pianoContainerSmall, currentScaleIntervals, true, root);
        
        container.appendChild(itemWrapper);
    });
}

export function updateFretboards() {
    updateScaleFretboard();
    updateChordFretboard();
    updateChord2Fretboard();
    updateTriadFretboard();
    updateTriad2Fretboard();
    updateTetradFretboard();
    updateTetrad2Fretboard();
    updatePentadFretboard();
    updatePentad2Fretboard();
    updateTwostringFretboard();
    updateThreestringFretboard();
    updateFourstringFretboard();
    updateFourstringFretboard2();
    updateIntervalFretboard();
    updateInterval2Fretboard();
    updateScaleChordFretboard();
    updateCofFretboards(); // New COF update
    updateSlideshowView(); // Update slideshow whenever fretboards change
    updateFretboardValueDisplays();
}

export function updateDependentElements() {
    const { currentScaleIntervals } = getState();
    if (currentScaleIntervals) {
        dom.dependentElements.forEach(el => el.classList.remove('disabled'));
    } else {
        dom.dependentElements.forEach(el => {
            el.classList.add('disabled');
            const content = el.querySelector('.die, .card');
            if (content) content.textContent = '?';
        });
        updateIntervalFretboard();
        updateInterval2Fretboard();
    }
}

export function initFretboards() {
    createFretboard(dom.scaleFretboardContainer, 'fretboard-scale');
    createFretboard(dom.chordFretboardContainer, 'fretboard-chord');
    createFretboard(dom.chord2FretboardContainer, 'fretboard-chord2');
    createFretboard(dom.triadFretboardContainer, 'fretboard-triad');
    createFretboard(dom.triad2FretboardContainer, 'fretboard-triad2');
    createFretboard(dom.tetradFretboardContainer, 'fretboard-tetrad');
    createFretboard(dom.tetrad2FretboardContainer, 'fretboard-tetrad2');
    createFretboard(dom.pentadFretboardContainer, 'fretboard-pentad');
    createFretboard(dom.pentad2FretboardContainer, 'fretboard-pentad2');
    createFretboard(dom.twostringFretboardContainer, 'fretboard-twostring');
    createFretboard(dom.threestringFretboardContainer, 'fretboard-threestring');
    createFretboard(dom.fourstringFretboardContainer, 'fretboard-fourstring');
    createFretboard(dom.intervalFretboardContainer, 'fretboard-interval');
    createFretboard(dom.interval2FretboardContainer, 'fretboard-interval2');
    createFretboard(dom.scaleChordFretboardContainer, 'fretboard-scale-chord');
    createFretboard(dom.fourstringFretboardContainer2, 'fretboard-fourstring-2');

    // Initialize the main slideshow container structure
    createFretboard(dom.slideshowFretboardContainer, 'fretboard-slideshow');
    
    // Initialize Pianos
    createPiano(dom.scalePianoContainer, 'piano-scale');
    createPiano(dom.chordPianoContainer, 'piano-chord');
    createPiano(dom.chord2PianoContainer, 'piano-chord2');
    createPiano(dom.triadPianoContainer, 'piano-triad');
    createPiano(dom.triad2PianoContainer, 'piano-triad2');
    createPiano(dom.tetradPianoContainer, 'piano-tetrad');
    createPiano(dom.tetrad2PianoContainer, 'piano-tetrad2');
    createPiano(dom.pentadPianoContainer, 'piano-pentad');
    createPiano(dom.pentad2PianoContainer, 'piano-pentad2');
    createPiano(dom.twostringPianoContainer, 'piano-twostring');
    createPiano(dom.threestringPianoContainer, 'piano-threestring');
    createPiano(dom.fourstringPianoContainer, 'piano-fourstring');
    createPiano(dom.intervalPianoContainer, 'piano-interval');
    createPiano(dom.interval2PianoContainer, 'piano-interval2');
    createPiano(dom.scaleChordPianoContainer, 'piano-scale-chord');
    createPiano(dom.fourstringPianoContainer2, 'piano-fourstring-2');
    createPiano(dom.slideshowPianoContainer, 'piano-slideshow');

    // COF container is dynamically managed, no need to initialize here.
}