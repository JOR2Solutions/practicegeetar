import * as dom from './dom.js';
import { getState, updateState } from './state.js';
import { CIRCLE_OF_FIFTHS, TUNINGS } from './data.js';
import { updateFretboardDisplay } from './fretboard-viz.js';
import { updatePianoDisplay } from './piano-viz.js';
import { initFretboards, updateFretboards } from './fretboard.js';

// --- State Management ---
let slideshowInterval = null;
let countdownInterval = null;
let currentSlideIndex = 0;
let countdownRemaining = 0;
let slideshowCountdown = null;
let isPlaying = false; // Add state to track play/pause

// --- Constants ---
const SLIDESHOW_MODES = {
    DRAWN_CARDS: 'drawn_cards',
    COF_FIFTHS: 'cof_fifths',
    COF_FOURTHS: 'cof_fourths',
    SCALE_INTERVALS: 'scale_intervals', // New mode
    SCALE_TRIADS: 'scale_triads',
    SCALE_TETRADS: 'scale_tetrads',
    SCALE_PENTADS: 'scale_pentads',
    SCALE_SEXTADS: 'scale_sextads',
    SCALE_SEPTADS: 'scale_septads'
};

export const slideSources = [
    { container: dom.scaleFretboardContainer, title: 'Scale', valueDisplay: dom.scaleValueDisplay, id: 'scale' },
    { container: dom.chordFretboardContainer, title: 'Chord', valueDisplay: dom.chordValueDisplay, id: 'chord' },
    { container: dom.chord2FretboardContainer, title: 'Chord 2', valueDisplay: dom.chord2ValueDisplay, id: 'chord2' },
    { container: dom.triadFretboardContainer, title: 'Triad', valueDisplay: dom.triadValueDisplay, id: 'triad' },
    { container: dom.triad2FretboardContainer, title: 'Triad 2', valueDisplay: dom.triad2ValueDisplay, id: 'triad2' },
    { container: dom.tetradFretboardContainer, title: 'Tetrad', valueDisplay: dom.tetradValueDisplay, id: 'tetrad' },
    { container: dom.tetrad2FretboardContainer, title: 'Tetrad 2', valueDisplay: dom.tetrad2ValueDisplay, id: 'tetrad2' },
    { container: dom.pentadFretboardContainer, title: 'Pentad', valueDisplay: dom.pentadValueDisplay, id: 'pentad' },
    { container: dom.pentad2FretboardContainer, title: 'Pentad 2', valueDisplay: dom.pentad2ValueDisplay, id: 'pentad2' },
    { container: dom.twostringFretboardContainer, title: '2-String Set Scale', valueDisplay: dom.twostringValueDisplay, id: 'twostring' },
    { container: dom.threestringFretboardContainer, title: '3-String Set Scale', valueDisplay: dom.threestringValueDisplay, id: 'threestring' },
    { container: dom.fourstringFretboardContainer, title: '4-String Set Scale', valueDisplay: dom.fourstringValueDisplay, id: 'fourstring' },
    { container: dom.intervalFretboardContainer, title: 'Interval', valueDisplay: dom.intervalValueDisplay, id: 'interval' },
    { container: dom.interval2FretboardContainer, title: 'Interval 2', valueDisplay: dom.interval2ValueDisplay, id: 'interval2' },
    { container: dom.scaleChordFretboardContainer, title: 'Chord (Within Scale)', valueDisplay: dom.scaleChordValueDisplay, id: 'scaleChord' },
    { container: dom.fourstringFretboardContainer2, title: '4-String Set View', valueDisplay: dom.fourstringValueDisplay2, id: 'fourstring2' }
];

const slidePianoSourceMap = {
    'scale': dom.scalePianoContainer,
    'chord': dom.chordPianoContainer,
    'chord2': dom.chord2PianoContainer,
    'triad': dom.triadPianoContainer,
    'triad2': dom.triad2PianoContainer,
    'tetrad': dom.tetradPianoContainer,
    'tetrad2': dom.tetrad2PianoContainer,
    'pentad': dom.pentadPianoContainer,
    'pentad2': dom.pentad2PianoContainer,
    'twostring': dom.twostringPianoContainer,
    'threestring': dom.threestringPianoContainer,
    'fourstring': dom.fourstringPianoContainer,
    'interval': dom.intervalPianoContainer,
    'interval2': dom.interval2PianoContainer,
    'scaleChord': dom.scaleChordPianoContainer,
    'fourstring2': dom.fourstringPianoContainer2,
};

// --- Helper Functions ---

function getTuningName(tuningArray) {
    if (!tuningArray) return '';
    for (const key in TUNINGS) {
        if (JSON.stringify(TUNINGS[key]) === JSON.stringify(tuningArray)) {
            let name = key.replace(/-/g, ' ');
            // Handle specific names like '6-string-standard'
            if (name.includes('string')) {
                name = name.split(' ').slice(1).join(' '); // "standard", "drop d", etc.
            }
            name = name.charAt(0).toUpperCase() + name.slice(1);
            return name;
        }
    }
    return 'Custom';
}

function updateTuningDisplay() {
    const { currentTuning } = getState();
    if (!currentTuning || !dom.slideshowTuningInfo) {
        if(dom.slideshowTuningInfo) dom.slideshowTuningInfo.innerHTML = '';
        return;
    }

    const tuningName = getTuningName(currentTuning);
    const tuningString = currentTuning.join(' ');
    
    dom.slideshowTuningInfo.innerHTML = `<strong>${tuningName}:</strong> ${tuningString}`;
}

function getSlideDuration() {
    const state = getState();
    // Use play mode duration input if in play mode, otherwise use sidebar input
    const inputElement = state.isPlayMode ? dom.playModeSlideDuration : dom.slideshowDurationInput;
    const duration = parseInt(inputElement.value, 10);
    return (isNaN(duration) || duration < 1) ? 30 : duration;
}

function clearSlideshowDisplay() {
    dom.slideshowFretboardContainer.innerHTML = '';
    dom.slideshowPianoContainer.innerHTML = '';
    dom.slideshowFretboardValue.textContent = '';
    if (slideshowCountdown) slideshowCountdown.textContent = '';
    if (dom.slideshowTuningInfo) dom.slideshowTuningInfo.innerHTML = '';
    dom.mainTitle.textContent = 'Play';
}

function updateCountdownDisplay() {
    if (!slideshowCountdown) return;
    slideshowCountdown.textContent = countdownRemaining > 0 ? `${countdownRemaining}s` : '0s';
}

function resetCountdown() {
    countdownRemaining = getSlideDuration();
    updateCountdownDisplay();
}

function stopSlideshowInterval() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    // Don't clear countdown text, just stop it.
    // if (slideshowCountdown) slideshowCountdown.textContent = ''; 
    
    // isPlaying is set by the calling function (pause or stop)
    updatePlaybackControls();
}

function startSlideshowInterval(numSlides, advanceFunction) {
    stopSlideshowInterval();
    
    if (numSlides <= 1) return;

    // This function should only start if isPlaying is true.
    if (!isPlaying) {
        // Just set up the countdown text, but don't start the interval.
        resetCountdown();
        updatePlaybackControls();
        return;
    }

    const duration = getSlideDuration();
    resetCountdown();
    updatePlaybackControls();

    countdownInterval = setInterval(() => {
        countdownRemaining -= 1;
        if (countdownRemaining <= 0) {
            countdownRemaining = 0;
            updateCountdownDisplay();
            advanceFunction();
        } else {
            updateCountdownDisplay();
        }
    }, 1000);

    slideshowInterval = setInterval(advanceFunction, duration * 1000);
}

function updatePlaybackControls() {
    const playButton = document.getElementById('slideshow-play-button');
    const pauseButton = document.getElementById('slideshow-pause-button');
    
    if (playButton && pauseButton) {
        if (isPlaying) {
            playButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
        } else {
            playButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        }
    }
}

function handleSlideshowLoop() {
    if (!isPlaying) return;

    const { endFret } = getState();
    let newEndFret = endFret + 2;
    
    if (newEndFret > 24) {
         newEndFret = 4;
    }
    
    updateState({ endFret: newEndFret });
    dom.endFretInput.value = newEndFret;
    initFretboards();
    updateFretboards(); // Redraw notes on the newly sized fretboards
}

export function playSlideshow() {
    if (isPlaying) return;
    isPlaying = true;

    const state = getState();
    const mode = state.slideshowMode;
    
    if (mode === SLIDESHOW_MODES.COF_FIFTHS || mode === SLIDESHOW_MODES.COF_FOURTHS || mode === 'cof') {
        const direction = mode === SLIDESHOW_MODES.COF_FOURTHS ? 'fourths' : 'fifths';
        const cofSlides = getCoFSlides(direction);
        startSlideshowInterval(cofSlides.length, advanceCofSlide);
    } else if (mode === SLIDESHOW_MODES.SCALE_INTERVALS) {
        const intervalSlides = getScaleIntervalSlides();
        startSlideshowInterval(intervalSlides.length, advanceScaleIntervalsSlide);
    } else if (mode === SLIDESHOW_MODES.SCALE_TRIADS) {
        const triadSlides = getScaleTriadSlides();
        startSlideshowInterval(triadSlides.length, advanceScaleTriadsSlide);
    } else if (mode === SLIDESHOW_MODES.SCALE_TETRADS) {
        const tetradSlides = getScaleTetradSlides();
        startSlideshowInterval(tetradSlides.length, advanceScaleTetradsSlide);
    } else if (mode === SLIDESHOW_MODES.SCALE_PENTADS) {
        const pentadSlides = getScalePentadSlides();
        startSlideshowInterval(pentadSlides.length, advanceScalePentadsSlide);
    } else if (mode === SLIDESHOW_MODES.SCALE_SEXTADS) {
        const sextadSlides = getScaleSextadSlides();
        startSlideshowInterval(sextadSlides.length, advanceScaleSextadsSlide);
    } else if (mode === SLIDESHOW_MODES.SCALE_SEPTADS) {
        const septadSlides = getScaleSeptadSlides();
        startSlideshowInterval(septadSlides.length, advanceScaleSeptadsSlide);
    } else {
        const activeSlides = getActiveSlides();
        startSlideshowInterval(activeSlides.length, advanceDrawnSlide);
    }
}

export function pauseSlideshow() {
    isPlaying = false;
    stopSlideshowInterval();
}

export function stopSlideshow() {
    isPlaying = false;
    stopSlideshowInterval();
    currentSlideIndex = 0;
    updateState({ cofSlideshowIndex: 0 });
    updateSlideshowView();
}

export function nextSlide() {
    pauseSlideshow(); // Pause before advancing
    const state = getState();
    const mode = state.slideshowMode;
    
    if (mode === SLIDESHOW_MODES.COF_FIFTHS || mode === SLIDESHOW_MODES.COF_FOURTHS || mode === 'cof') {
        advanceCofSlide();
    } else if (mode === SLIDESHOW_MODES.SCALE_INTERVALS) {
        advanceScaleIntervalsSlide();
    } else if (mode === SLIDESHOW_MODES.SCALE_TRIADS) {
        advanceScaleTriadsSlide();
    } else if (mode === SLIDESHOW_MODES.SCALE_TETRADS) {
        advanceScaleTetradsSlide();
    } else if (mode === SLIDESHOW_MODES.SCALE_PENTADS) {
        advanceScalePentadsSlide();
    } else if (mode === SLIDESHOW_MODES.SCALE_SEXTADS) {
        advanceScaleSextadsSlide();
    } else if (mode === SLIDESHOW_MODES.SCALE_SEPTADS) {
        advanceScaleSeptadsSlide();
    } else {
        advanceDrawnSlide();
    }
}

export function previousSlide() {
    pauseSlideshow(); // Pause before going back
    const state = getState();
    const mode = state.slideshowMode;
    
    if (mode === SLIDESHOW_MODES.COF_FIFTHS || mode === SLIDESHOW_MODES.COF_FOURTHS || mode === 'cof') {
        const direction = mode === SLIDESHOW_MODES.COF_FOURTHS ? 'fourths' : 'fifths';
        const cofSlides = getCoFSlides(direction);
        if (cofSlides.length === 0) return;
        
        const newIndex = (state.cofSlideshowIndex - 1 + cofSlides.length) % cofSlides.length;
        updateState({ cofSlideshowIndex: newIndex });
        updateSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_INTERVALS) {
        const intervalSlides = getScaleIntervalSlides();
        if (intervalSlides.length === 0) return;
        
        const newIndex = (state.scaleIntervalsSlideshowIndex - 1 + intervalSlides.length) % intervalSlides.length;
        updateState({ scaleIntervalsSlideshowIndex: newIndex });
        updateSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_TRIADS) {
        const triadSlides = getScaleTriadSlides();
        if (triadSlides.length === 0) return;
        
        const newIndex = (state.scaleTriadsSlideshowIndex - 1 + triadSlides.length) % triadSlides.length;
        updateState({ scaleTriadsSlideshowIndex: newIndex });
        updateSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_TETRADS) {
        const tetradSlides = getScaleTetradSlides();
        if (tetradSlides.length === 0) return;
        
        const newIndex = (state.scaleTetradsSlideshowIndex - 1 + tetradSlides.length) % tetradSlides.length;
        updateState({ scaleTetradsSlideshowIndex: newIndex });
        updateSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_PENTADS) {
        const pentadSlides = getScalePentadSlides();
        if (pentadSlides.length === 0) return;
        
        const newIndex = (state.scalePentadsSlideshowIndex - 1 + pentadSlides.length) % pentadSlides.length;
        updateState({ scalePentadsSlideshowIndex: newIndex });
        updateSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_SEXTADS) {
        const sextadSlides = getScaleSextadSlides();
        if (sextadSlides.length === 0) return;
        
        const newIndex = (state.scaleSextadsSlideshowIndex - 1 + sextadSlides.length) % sextadSlides.length;
        updateState({ scaleSextadsSlideshowIndex: newIndex });
        updateSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_SEPTADS) {
        const septadSlides = getScaleSeptadSlides();
        if (septadSlides.length === 0) return;
        
        const newIndex = (state.scaleSeptadsSlideshowIndex - 1 + septadSlides.length) % septadSlides.length;
        updateState({ scaleSeptadsSlideshowIndex: newIndex });
        updateSlideshowView();
    } else {
        const activeSlides = getActiveSlides();
        if (activeSlides.length === 0) return;
        
        currentSlideIndex = (currentSlideIndex - 1 + activeSlides.length) % activeSlides.length;
        updateSlideshowView();
    }
}

export async function rerandomizeAll() {
    // Click all buttons except chromatic key (die2) and scale (card2)
    const { rollButton1, rollButton3, rollButton4, rollButton5, 
            drawButton1, drawButtonChord2, drawButton3, drawButtonTriad2,
            drawButton4, drawButtonTetrad2, drawButton5, drawButtonPentad2,
            drawButton6, drawButton7, drawButton8, drawButton9,
            drawButton10, drawButton11, drawButton13, drawButton12, drawButtonInterval2 
    } = await import('./dom.js');
    
    const { updateDrawnValuesDisplay } = await import('./summary.js');
    const { updateFretboards } = await import('./fretboard.js');
    const { delay } = await import('./utils.js');
    
    [
        rollButton1, rollButton3, rollButton4, rollButton5,
        drawButton1, drawButtonChord2, drawButton3, drawButtonTriad2,
        drawButton4, drawButtonTetrad2, drawButton5, drawButtonPentad2,
        drawButton6, drawButton7, drawButton8, drawButton9,
        drawButton10, drawButton11, drawButton13, drawButton12, drawButtonInterval2
    ].forEach(b => b.click());

    await delay(500);
    updateDrawnValuesDisplay();
    updateFretboards();
}

// --- Circle of Fifths Functions ---

function getOrderedCircleOfFifths(startNote, direction) {
    let startIndex = CIRCLE_OF_FIFTHS.findIndex(note => 
        note.startsWith(startNote) || note.includes(startNote)
    );
    
    if (startIndex === -1) return [];

    let orderedCoF = [
        ...CIRCLE_OF_FIFTHS.slice(startIndex),
        ...CIRCLE_OF_FIFTHS.slice(0, startIndex)
    ];

    if (direction === 'fourths') {
        const rootNote = orderedCoF[0];
        orderedCoF.shift();
        orderedCoF.reverse();
        orderedCoF.unshift(rootNote);
    }

    return orderedCoF;
}

function getCoFSlides(direction) {
    const { currentScaleIntervals, currentRootNote, currentScaleType } = getState();
    if (!currentScaleIntervals || !currentRootNote) return [];

    const scaleName = dom.scaleValueDisplay.textContent.split(' (')[0];
    const startNote = currentRootNote.split(' ')[0];
    
    const orderedCoF = getOrderedCircleOfFifths(startNote, direction);
    if (orderedCoF.length === 0) return [];

    return orderedCoF.map(noteName => ({
        rootNote: noteName.split(' / ')[0],
        title: scaleName,
        value: `Key: ${noteName.split(' / ')[0]} (${currentScaleType})`,
        intervals: currentScaleIntervals,
        isScale: true,
        hasContent: true,
        activeStrings: null
    }));
}

function advanceCofSlide() {
    const state = getState();
    const direction = state.slideshowMode === SLIDESHOW_MODES.COF_FOURTHS ? 'fourths' : 'fifths';
    const cofSlides = getCoFSlides(direction);
    
    if (cofSlides.length === 0) {
        updateSlideshowView();
        return;
    }
    
    const newIndex = (state.cofSlideshowIndex + 1) % cofSlides.length;
    if (newIndex === 0) handleSlideshowLoop();
    updateState({ cofSlideshowIndex: newIndex });
    updateSlideshowView();
}

function updateCofSlideshowView() {
    const state = getState();
    const direction = state.slideshowMode === SLIDESHOW_MODES.COF_FOURTHS ? 'fourths' : 'fifths';
    const cofSlides = getCoFSlides(direction);

    if (cofSlides.length === 0) {
        clearSlideshowDisplay();
        const titleText = 'No Scale/Key Drawn for CoF Slideshow';
        dom.slideshowFretboardTitle.textContent = titleText;
        dom.mainTitle.textContent = 'Play';
        stopSlideshowInterval();
        return;
    }

    if (state.cofSlideshowIndex >= cofSlides.length) {
        updateState({ cofSlideshowIndex: 0 });
    }
    
    const currentCofIndex = getState().cofSlideshowIndex;
    const currentSlide = cofSlides[currentCofIndex];
    const modeName = direction === 'fourths' ? 'Fourths' : 'fifths';

    const titleText = `${currentSlide.title} (CoF ${modeName}, Key ${currentCofIndex + 1}/${cofSlides.length})`;
    dom.slideshowFretboardTitle.textContent = titleText;
    // dom.mainTitle.textContent = titleText; // This will be replaced by a more detailed title
    dom.slideshowFretboardValue.textContent = currentSlide.value;
    updateTuningDisplay();
    updatePageTitle(titleText, currentSlide.value, currentSlide.intervals); // New call

    updateFretboardDisplay(
        dom.slideshowFretboardContainer,
        state.currentScaleIntervals,
        true,
        null,
        currentSlide.rootNote
    );
    
    updatePianoDisplay(
        dom.slideshowPianoContainer,
        state.currentScaleIntervals,
        true,
        currentSlide.rootNote
    );

    resetCountdown();
    startSlideshowInterval(cofSlides.length, advanceCofSlide);
}

// --- Scale Intervals Functions ---

function getScaleIntervalSlides() {
    const { currentScaleIntervals, currentRootNote } = getState();
    if (!currentScaleIntervals || !currentRootNote) return [];

    const scaleName = dom.scaleValueDisplay.textContent.split(' (')[0];
    const intervalsInScale = currentScaleIntervals.filter(i => i !== 'R');

    if (intervalsInScale.length === 0) return [];

    return intervalsInScale.map(interval => ({
        title: `Interval: ${interval}`,
        value: `${currentRootNote} ${scaleName}`,
        intervals: ['R', interval],
        isScale: false,
        hasContent: true,
        activeStrings: null
    }));
}

function advanceScaleIntervalsSlide() {
    const state = getState();
    const intervalSlides = getScaleIntervalSlides();

    if (intervalSlides.length === 0) {
        updateSlideshowView();
        return;
    }

    const newIndex = (state.scaleIntervalsSlideshowIndex + 1) % intervalSlides.length;
    if (newIndex === 0) handleSlideshowLoop();
    updateState({ scaleIntervalsSlideshowIndex: newIndex });
    updateSlideshowView();
}

function updateScaleIntervalsSlideshowView() {
    const state = getState();
    const intervalSlides = getScaleIntervalSlides();

    if (intervalSlides.length === 0) {
        clearSlideshowDisplay();
        const titleText = 'No Scale Drawn for Interval Slideshow';
        dom.slideshowFretboardTitle.textContent = titleText;
        updatePageTitle(titleText); // New call
        stopSlideshowInterval();
        return;
    }

    if (state.scaleIntervalsSlideshowIndex >= intervalSlides.length) {
        updateState({ scaleIntervalsSlideshowIndex: 0 });
    }

    const currentIntervalIndex = getState().scaleIntervalsSlideshowIndex;
    const currentSlide = intervalSlides[currentIntervalIndex];

    const titleText = `${currentSlide.title} (${currentIntervalIndex + 1}/${intervalSlides.length})`;
    dom.slideshowFretboardTitle.textContent = titleText;
    // dom.mainTitle.textContent = titleText; // Replaced
    dom.slideshowFretboardValue.textContent = currentSlide.value;
    updateTuningDisplay();
    updatePageTitle(titleText, currentSlide.value, currentSlide.intervals); // New call

    updateFretboardDisplay(
        dom.slideshowFretboardContainer,
        currentSlide.intervals,
        currentSlide.isScale,
        currentSlide.activeStrings
    );
    
    updatePianoDisplay(
        dom.slideshowPianoContainer,
        currentSlide.intervals,
        currentSlide.isScale
    );

    resetCountdown();
    startSlideshowInterval(intervalSlides.length, advanceScaleIntervalsSlide);
}

// --- Scale Triads Functions ---

function getScaleTriadSlides() {
    const { currentScaleIntervals, currentRootNote } = getState();
    if (!currentScaleIntervals || !currentRootNote || currentScaleIntervals.length < 3) return [];

    const scaleName = dom.scaleValueDisplay.textContent.split(' (')[0];
    const triads = [];
    const intervals = currentScaleIntervals;

    for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
            for (let k = j + 1; k < intervals.length; k++) {
                const triadIntervals = [intervals[i], intervals[j], intervals[k]];
                triads.push({
                    title: `Triad: ${triadIntervals.join(', ')}`,
                    value: `${currentRootNote} ${scaleName}`,
                    intervals: triadIntervals,
                    isScale: false,
                    hasContent: true,
                    activeStrings: null
                });
            }
        }
    }

    return triads;
}

function advanceScaleTriadsSlide() {
    const state = getState();
    const triadSlides = getScaleTriadSlides();

    if (triadSlides.length === 0) {
        updateSlideshowView();
        return;
    }

    const newIndex = (state.scaleTriadsSlideshowIndex + 1) % triadSlides.length;
    if (newIndex === 0) handleSlideshowLoop();
    updateState({ scaleTriadsSlideshowIndex: newIndex });
    updateSlideshowView();
}

function updateScaleTriadsSlideshowView() {
    const state = getState();
    const triadSlides = getScaleTriadSlides();

    if (triadSlides.length === 0) {
        clearSlideshowDisplay();
        const titleText = 'No Scale (min 3 notes) Drawn for Triad Slideshow';
        dom.slideshowFretboardTitle.textContent = titleText;
        updatePageTitle(titleText); // New call
        stopSlideshowInterval();
        return;
    }

    if (state.scaleTriadsSlideshowIndex >= triadSlides.length) {
        updateState({ scaleTriadsSlideshowIndex: 0 });
    }

    const currentTriadIndex = getState().scaleTriadsSlideshowIndex;
    const currentSlide = triadSlides[currentTriadIndex];

    const titleText = `${currentSlide.title} (${currentTriadIndex + 1}/${triadSlides.length})`;
    dom.slideshowFretboardTitle.textContent = titleText;
    // dom.mainTitle.textContent = titleText; // Replaced
    dom.slideshowFretboardValue.textContent = currentSlide.value;
    updateTuningDisplay();
    updatePageTitle(titleText, currentSlide.value, currentSlide.intervals); // New call

    updateFretboardDisplay(
        dom.slideshowFretboardContainer,
        currentSlide.intervals,
        currentSlide.isScale,
        currentSlide.activeStrings
    );
    
    updatePianoDisplay(
        dom.slideshowPianoContainer,
        currentSlide.intervals,
        currentSlide.isScale
    );

    // This call will respect the isPlaying flag
    startSlideshowInterval(triadSlides.length, advanceScaleTriadsSlide);
}

// --- Scale Tetrads Functions ---

function getScaleTetradSlides() {
    const { currentScaleIntervals, currentRootNote } = getState();
    if (!currentScaleIntervals || !currentRootNote || currentScaleIntervals.length < 4) return [];

    const scaleName = dom.scaleValueDisplay.textContent.split(' (')[0];
    const tetrads = [];
    const intervals = currentScaleIntervals;

    for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
            for (let k = j + 1; k < intervals.length; k++) {
                for (let l = k + 1; l < intervals.length; l++) {
                    const tetradIntervals = [intervals[i], intervals[j], intervals[k], intervals[l]];
                    tetrads.push({
                        title: `Tetrad: ${tetradIntervals.join(', ')}`,
                        value: `${currentRootNote} ${scaleName}`,
                        intervals: tetradIntervals,
                        isScale: false,
                        hasContent: true,
                        activeStrings: null
                    });
                }
            }
        }
    }

    return tetrads;
}

function advanceScaleTetradsSlide() {
    const state = getState();
    const tetradSlides = getScaleTetradSlides();

    if (tetradSlides.length === 0) {
        updateSlideshowView();
        return;
    }

    const newIndex = (state.scaleTetradsSlideshowIndex + 1) % tetradSlides.length;
    if (newIndex === 0) handleSlideshowLoop();
    updateState({ scaleTetradsSlideshowIndex: newIndex });
    updateSlideshowView();
}

function updateScaleTetradsSlideshowView() {
    const state = getState();
    const tetradSlides = getScaleTetradSlides();

    if (tetradSlides.length === 0) {
        clearSlideshowDisplay();
        const titleText = 'No Scale (min 4 notes) Drawn for Tetrad Slideshow';
        dom.slideshowFretboardTitle.textContent = titleText;
        updatePageTitle(titleText); // New call
        stopSlideshowInterval();
        return;
    }

    if (state.scaleTetradsSlideshowIndex >= tetradSlides.length) {
        updateState({ scaleTetradsSlideshowIndex: 0 });
    }

    const currentTetradIndex = getState().scaleTetradsSlideshowIndex;
    const currentSlide = tetradSlides[currentTetradIndex];

    const titleText = `${currentSlide.title} (${currentTetradIndex + 1}/${tetradSlides.length})`;
    dom.slideshowFretboardTitle.textContent = titleText;
    // dom.mainTitle.textContent = titleText; // Replaced
    dom.slideshowFretboardValue.textContent = currentSlide.value;
    updateTuningDisplay();
    updatePageTitle(titleText, currentSlide.value, currentSlide.intervals); // New call

    updateFretboardDisplay(
        dom.slideshowFretboardContainer,
        currentSlide.intervals,
        currentSlide.isScale,
        currentSlide.activeStrings
    );
    
    updatePianoDisplay(
        dom.slideshowPianoContainer,
        currentSlide.intervals,
        currentSlide.isScale
    );

    // This call will respect the isPlaying flag
    startSlideshowInterval(tetradSlides.length, advanceScaleTetradsSlide);
}

// --- Scale Pentads Functions ---

function getScalePentadSlides() {
    const { currentScaleIntervals, currentRootNote } = getState();
    if (!currentScaleIntervals || !currentRootNote || currentScaleIntervals.length < 5) return [];

    const scaleName = dom.scaleValueDisplay.textContent.split(' (')[0];
    const pentads = [];
    const intervals = currentScaleIntervals;

    for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
            for (let k = j + 1; k < intervals.length; k++) {
                for (let l = k + 1; l < intervals.length; l++) {
                    for (let m = l + 1; m < intervals.length; m++) {
                        const pentadIntervals = [intervals[i], intervals[j], intervals[k], intervals[l], intervals[m]];
                        pentads.push({
                            title: `Pentad: ${pentadIntervals.join(', ')}`,
                            value: `${currentRootNote} ${scaleName}`,
                            intervals: pentadIntervals,
                            isScale: false,
                            hasContent: true,
                            activeStrings: null
                        });
                    }
                }
            }
        }
    }

    return pentads;
}

function advanceScalePentadsSlide() {
    const state = getState();
    const pentadSlides = getScalePentadSlides();

    if (pentadSlides.length === 0) {
        updateSlideshowView();
        return;
    }

    const newIndex = (state.scalePentadsSlideshowIndex + 1) % pentadSlides.length;
    if (newIndex === 0) handleSlideshowLoop();
    updateState({ scalePentadsSlideshowIndex: newIndex });
    updateSlideshowView();
}

function updateScalePentadsSlideshowView() {
    const state = getState();
    const pentadSlides = getScalePentadSlides();

    if (pentadSlides.length === 0) {
        clearSlideshowDisplay();
        const titleText = 'No Scale (min 5 notes) Drawn for Pentad Slideshow';
        dom.slideshowFretboardTitle.textContent = titleText;
        updatePageTitle(titleText); // New call
        stopSlideshowInterval();
        return;
    }

    if (state.scalePentadsSlideshowIndex >= pentadSlides.length) {
        updateState({ scalePentadsSlideshowIndex: 0 });
    }

    const currentPentadIndex = getState().scalePentadsSlideshowIndex;
    const currentSlide = pentadSlides[currentPentadIndex];

    const titleText = `${currentSlide.title} (${currentPentadIndex + 1}/${pentadSlides.length})`;
    dom.slideshowFretboardTitle.textContent = titleText;
    // dom.mainTitle.textContent = titleText; // Replaced
    dom.slideshowFretboardValue.textContent = currentSlide.value;
    updateTuningDisplay();
    updatePageTitle(titleText, currentSlide.value, currentSlide.intervals); // New call

    updateFretboardDisplay(
        dom.slideshowFretboardContainer,
        currentSlide.intervals,
        currentSlide.isScale,
        currentSlide.activeStrings
    );
    
    updatePianoDisplay(
        dom.slideshowPianoContainer,
        currentSlide.intervals,
        currentSlide.isScale
    );

    // This call will respect the isPlaying flag
    startSlideshowInterval(pentadSlides.length, advanceScalePentadsSlide);
}

// --- Scale Sextads Functions ---

function getScaleSextadSlides() {
    const { currentScaleIntervals, currentRootNote } = getState();
    if (!currentScaleIntervals || !currentRootNote || currentScaleIntervals.length < 6) return [];

    const scaleName = dom.scaleValueDisplay.textContent.split(' (')[0];
    const sextads = [];
    const intervals = currentScaleIntervals;

    for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
            for (let k = j + 1; k < intervals.length; k++) {
                for (let l = k + 1; l < intervals.length; l++) {
                    for (let m = l + 1; m < intervals.length; m++) {
                        for (let n = m + 1; n < intervals.length; n++) {
                            const sextadIntervals = [intervals[i], intervals[j], intervals[k], intervals[l], intervals[m], intervals[n]];
                            sextads.push({
                                title: `Sextad: ${sextadIntervals.join(', ')}`,
                                value: `${currentRootNote} ${scaleName}`,
                                intervals: sextadIntervals,
                                isScale: false,
                                hasContent: true,
                                activeStrings: null
                            });
                        }
                    }
                }
            }
        }
    }

    return sextads;
}

function advanceScaleSextadsSlide() {
    const state = getState();
    const sextadSlides = getScaleSextadSlides();

    if (sextadSlides.length === 0) {
        updateSlideshowView();
        return;
    }

    const newIndex = (state.scaleSextadsSlideshowIndex + 1) % sextadSlides.length;
    if (newIndex === 0) handleSlideshowLoop();
    updateState({ scaleSextadsSlideshowIndex: newIndex });
    updateSlideshowView();
}

function updateScaleSextadsSlideshowView() {
    const state = getState();
    const sextadSlides = getScaleSextadSlides();

    if (sextadSlides.length === 0) {
        clearSlideshowDisplay();
        const titleText = 'No Scale (min 6 notes) Drawn for Sextad Slideshow';
        dom.slideshowFretboardTitle.textContent = titleText;
        updatePageTitle(titleText); // New call
        stopSlideshowInterval();
        return;
    }

    if (state.scaleSextadsSlideshowIndex >= sextadSlides.length) {
        updateState({ scaleSextadsSlideshowIndex: 0 });
    }

    const currentSextadIndex = getState().scaleSextadsSlideshowIndex;
    const currentSlide = sextadSlides[currentSextadIndex];

    const titleText = `${currentSlide.title} (${currentSextadIndex + 1}/${sextadSlides.length})`;
    dom.slideshowFretboardTitle.textContent = titleText;
    // dom.mainTitle.textContent = titleText; // Replaced
    dom.slideshowFretboardValue.textContent = currentSlide.value;
    updateTuningDisplay();
    updatePageTitle(titleText, currentSlide.value, currentSlide.intervals); // New call

    updateFretboardDisplay(
        dom.slideshowFretboardContainer,
        currentSlide.intervals,
        currentSlide.isScale,
        currentSlide.activeStrings
    );
    
    updatePianoDisplay(
        dom.slideshowPianoContainer,
        currentSlide.intervals,
        currentSlide.isScale
    );

    // This call will respect the isPlaying flag
    startSlideshowInterval(sextadSlides.length, advanceScaleSextadsSlide);
}

// --- Scale Septads Functions ---

function getScaleSeptadSlides() {
    const { currentScaleIntervals, currentRootNote } = getState();
    if (!currentScaleIntervals || !currentRootNote || currentScaleIntervals.length < 7) return [];

    const scaleName = dom.scaleValueDisplay.textContent.split(' (')[0];
    const septads = [];
    const intervals = currentScaleIntervals;

    for (let i = 0; i < intervals.length; i++) {
        for (let j = i + 1; j < intervals.length; j++) {
            for (let k = j + 1; k < intervals.length; k++) {
                for (let l = k + 1; l < intervals.length; l++) {
                    for (let m = l + 1; m < intervals.length; m++) {
                        for (let n = m + 1; n < intervals.length; n++) {
                            for (let o = n + 1; o < intervals.length; o++) {
                                const septadIntervals = [intervals[i], intervals[j], intervals[k], intervals[l], intervals[m], intervals[n], intervals[o]];
                                septads.push({
                                    title: `Septad: ${septadIntervals.join(', ')}`,
                                    value: `${currentRootNote} ${scaleName}`,
                                    intervals: septadIntervals,
                                    isScale: false,
                                    hasContent: true,
                                    activeStrings: null
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    return septads;
}

function advanceScaleSeptadsSlide() {
    const state = getState();
    const septadSlides = getScaleSeptadSlides();

    if (septadSlides.length === 0) {
        updateSlideshowView();
        return;
    }

    const newIndex = (state.scaleSeptadsSlideshowIndex + 1) % septadSlides.length;
    if (newIndex === 0) handleSlideshowLoop();
    updateState({ scaleSeptadsSlideshowIndex: newIndex });
    updateSlideshowView();
}

function updateScaleSeptadsSlideshowView() {
    const state = getState();
    const septadSlides = getScaleSeptadSlides();

    if (septadSlides.length === 0) {
        clearSlideshowDisplay();
        const titleText = 'No Scale (min 7 notes) Drawn for Septad Slideshow';
        dom.slideshowFretboardTitle.textContent = titleText;
        updatePageTitle(titleText); // New call
        stopSlideshowInterval();
        return;
    }

    if (state.scaleSeptadsSlideshowIndex >= septadSlides.length) {
        updateState({ scaleSeptadsSlideshowIndex: 0 });
    }

    const currentSeptadIndex = getState().scaleSeptadsSlideshowIndex;
    const currentSlide = septadSlides[currentSeptadIndex];

    const titleText = `${currentSlide.title} (${currentSeptadIndex + 1}/${septadSlides.length})`;
    dom.slideshowFretboardTitle.textContent = titleText;
    // dom.mainTitle.textContent = titleText; // Replaced
    dom.slideshowFretboardValue.textContent = currentSlide.value;
    updateTuningDisplay();
    updatePageTitle(titleText, currentSlide.value, currentSlide.intervals); // New call

    updateFretboardDisplay(
        dom.slideshowFretboardContainer,
        currentSlide.intervals,
        currentSlide.isScale,
        currentSlide.activeStrings
    );
    
    updatePianoDisplay(
        dom.slideshowPianoContainer,
        currentSlide.intervals,
        currentSlide.isScale
    );

    // This call will respect the isPlaying flag
    startSlideshowInterval(septadSlides.length, advanceScaleSeptadsSlide);
}

// --- Drawn Cards Functions ---

function getActiveSlides() {
    return slideSources.filter(source => {
        const value = source.valueDisplay.textContent.trim();
        return value.length > 0 && value !== '?' && value !== 'N/A';
    });
}

function advanceDrawnSlide() {
    const activeSlides = getActiveSlides();
    if (activeSlides.length < 2) {
        currentSlideIndex = 0;
        updateSlideshowView();
        return;
    }
    const newIndex = (currentSlideIndex + 1) % activeSlides.length;
    if (newIndex === 0) handleSlideshowLoop();
    currentSlideIndex = newIndex;
    updateSlideshowView();
}

function updateDrawnSlideshowView() {
    const activeSlides = getActiveSlides();
    
    if (activeSlides.length === 0) {
        clearSlideshowDisplay();
        const titleText = 'No Content Drawn';
        dom.slideshowFretboardTitle.textContent = titleText;
        updatePageTitle(titleText); // New call
        stopSlideshowInterval();
        return;
    }
    
    if (currentSlideIndex >= activeSlides.length) {
        currentSlideIndex = 0;
    }
    
    const source = activeSlides[currentSlideIndex];
    
    dom.slideshowFretboardContainer.innerHTML = source.container.innerHTML;
    
    const pianoSource = slidePianoSourceMap[source.id];
    if (pianoSource) {
        dom.slideshowPianoContainer.innerHTML = pianoSource.innerHTML;
    }

    dom.slideshowFretboardTitle.textContent = source.title;
    // dom.mainTitle.textContent = source.title; // Replaced
    dom.slideshowFretboardValue.textContent = source.valueDisplay.textContent;
    updateTuningDisplay();

    // Generate and set the detailed title
    const slideData = getSlideIntervals(source.id, getState());
    updatePageTitle(source.title, source.valueDisplay.textContent, slideData.intervals);

    // This call will respect the isPlaying flag
    startSlideshowInterval(activeSlides.length, advanceDrawnSlide);
}

// --- Main Slideshow Control ---

/**
 * Generates and sets the main page title (h1 and document.title).
 * @param {string} title - The title of the slide (e.g., "Scale", "Chord").
 * @param {string} [value] - The value/name of the slide (e.g., "Major (Ionian)").
 * @param {string[]|object} [intervals] - The intervals of the pattern.
 */
function updatePageTitle(title, value = '', intervals) {
    const { currentTuning } = getState();
    const tuningName = getTuningName(currentTuning);

    let intervalsArray = intervals;
    if (typeof intervals === 'object' && !Array.isArray(intervals) && intervals !== null) {
        intervalsArray = intervals.chord || intervals.scale;
    }

    const intervalsString = (intervalsArray && intervalsArray.length > 0)
        ? `(${intervalsArray.join(', ')})`
        : '';
    
    // Build parts of the title
    const titlePart1 = title;
    
    let titlePart2 = '';
    if (value && !title.includes(value)) {
        titlePart2 += `${value}`;
    }
    // The value from getCardDisplayValue might already contain the intervals.
    // This check prevents duplication.
    if (intervalsString && !titlePart2.includes(intervalsString)) {
        titlePart2 += ` ${intervalsString}`;
    }
    titlePart2 = titlePart2.trim();

    let titlePart3 = '';
    if (tuningName) {
        titlePart3 = `${tuningName} Tuning`;
    }

    // For document.title (no line breaks)
    const fullTitleForDocument = [titlePart1, titlePart2, titlePart3].filter(Boolean).join(' - ');
    document.title = fullTitleForDocument;

    // For main H1 title (with line breaks)
    const fullTitleForH1 = [titlePart1, titlePart2, titlePart3].filter(Boolean).join('<br>');
    dom.mainTitle.innerHTML = fullTitleForH1;
}


export function updateSlideshowView() {
    const state = getState();
    const mode = state.slideshowMode;
    
    if (mode === SLIDESHOW_MODES.COF_FIFTHS || mode === SLIDESHOW_MODES.COF_FOURTHS || mode === 'cof') {
        updateCofSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_INTERVALS) {
        updateScaleIntervalsSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_TRIADS) {
        updateScaleTriadsSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_TETRADS) {
        updateScaleTetradsSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_PENTADS) {
        updateScalePentadsSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_SEXTADS) {
        updateScaleSextadsSlideshowView();
    } else if (mode === SLIDESHOW_MODES.SCALE_SEPTADS) {
        updateScaleSeptadsSlideshowView();
    } else {
        updateDrawnSlideshowView();
    }
}

export function toggleSlideshowMode() {
    pauseSlideshow(); // Pause when changing mode
    const state = getState();
    const currentMode = state.slideshowMode === 'cof' ? SLIDESHOW_MODES.COF_FIFTHS : state.slideshowMode;
    
    let newMode = SLIDESHOW_MODES.DRAWN_CARDS;
    let buttonText = 'Mode: Drawn Cards';

    if (currentMode === SLIDESHOW_MODES.DRAWN_CARDS) {
        newMode = SLIDESHOW_MODES.COF_FIFTHS;
        buttonText = 'Mode: Circle of Fifths';
    } else if (currentMode === SLIDESHOW_MODES.COF_FIFTHS) {
        newMode = SLIDESHOW_MODES.COF_FOURTHS;
        buttonText = 'Mode: Circle of Fourths';
    } else if (currentMode === SLIDESHOW_MODES.COF_FOURTHS) {
        newMode = SLIDESHOW_MODES.SCALE_INTERVALS;
        buttonText = 'Mode: Scale Intervals';
    } else if (currentMode === SLIDESHOW_MODES.SCALE_INTERVALS) {
        newMode = SLIDESHOW_MODES.SCALE_TRIADS;
        buttonText = 'Mode: Scale Triads';
    } else if (currentMode === SLIDESHOW_MODES.SCALE_TRIADS) {
        newMode = SLIDESHOW_MODES.SCALE_TETRADS;
        buttonText = 'Mode: Scale Tetrads';
    } else if (currentMode === SLIDESHOW_MODES.SCALE_TETRADS) {
        newMode = SLIDESHOW_MODES.SCALE_PENTADS;
        buttonText = 'Mode: Scale Pentads';
    } else if (currentMode === SLIDESHOW_MODES.SCALE_PENTADS) {
        newMode = SLIDESHOW_MODES.SCALE_SEXTADS;
        buttonText = 'Mode: Scale Sextads';
    } else if (currentMode === SLIDESHOW_MODES.SCALE_SEXTADS) {
        newMode = SLIDESHOW_MODES.SCALE_SEPTADS;
        buttonText = 'Mode: Scale Septads';
    }
    
    if (newMode.startsWith('cof_') || newMode === SLIDESHOW_MODES.SCALE_INTERVALS || newMode === SLIDESHOW_MODES.SCALE_TRIADS || newMode === SLIDESHOW_MODES.SCALE_TETRADS || newMode === SLIDESHOW_MODES.SCALE_PENTADS || newMode === SLIDESHOW_MODES.SCALE_SEXTADS || newMode === SLIDESHOW_MODES.SCALE_SEPTADS) {
        const requiredCheck = newMode === SLIDESHOW_MODES.SCALE_INTERVALS
            ? getScaleIntervalSlides()
            : newMode === SLIDESHOW_MODES.SCALE_TRIADS
            ? getScaleTriadSlides()
            : newMode === SLIDESHOW_MODES.SCALE_TETRADS
            ? getScaleTetradSlides()
            : newMode === SLIDESHOW_MODES.SCALE_PENTADS
            ? getScalePentadSlides()
            : newMode === SLIDESHOW_MODES.SCALE_SEXTADS
            ? getScaleSextadSlides()
            : newMode === SLIDESHOW_MODES.SCALE_SEPTADS
            ? getScaleSeptadSlides()
            : getCoFSlides(newMode === SLIDESHOW_MODES.COF_FOURTHS ? 'fourths' : 'fifths');

        if (requiredCheck.length === 0) {
            const modeName = newMode === SLIDESHOW_MODES.SCALE_INTERVALS ? 'Scale Intervals' 
                : newMode === SLIDESHOW_MODES.SCALE_TRIADS ? 'Scale Triads'
                : newMode === SLIDESHOW_MODES.SCALE_TETRADS ? 'Scale Tetrads'
                : newMode === SLIDESHOW_MODES.SCALE_PENTADS ? 'Scale Pentads'
                : newMode === SLIDESHOW_MODES.SCALE_SEXTADS ? 'Scale Sextads'
                : newMode === SLIDESHOW_MODES.SCALE_SEPTADS ? 'Scale Septads'
                : 'Circle of Fifths/Fourths';
            alert(`Cannot switch to ${modeName} slideshow mode. Please ensure a Scale and a Key are drawn.`);
            newMode = SLIDESHOW_MODES.DRAWN_CARDS;
            buttonText = 'Mode: Drawn Cards';
        }
    }
    
    updateState({ slideshowMode: newMode, cofSlideshowIndex: 0, scaleIntervalsSlideshowIndex: 0, scaleTriadsSlideshowIndex: 0, scaleTetradsSlideshowIndex: 0, scalePentadsSlideshowIndex: 0, scaleSextadsSlideshowIndex: 0, scaleSeptadsSlideshowIndex: 0 });
    dom.toggleSlideshowModeButton.textContent = buttonText;
    
    // Update the play mode button text as well
    const toggleSlideshowModeButtonPlaymode = document.getElementById('toggle-slideshow-mode-button-playmode');
    if (toggleSlideshowModeButtonPlaymode) {
        toggleSlideshowModeButtonPlaymode.textContent = buttonText.replace('Mode: ', '');
    }
    
    currentSlideIndex = 0;
    updateSlideshowView();

    // Reset fret range to default
    const defaultStartFret = 0;
    const defaultEndFret = 4;
    dom.startFretInput.value = defaultStartFret;
    dom.endFretInput.value = defaultEndFret;
    updateState({ startFret: defaultStartFret, endFret: defaultEndFret });
    initFretboards();
    updateFretboards();
}

function startOrUpdateSlideshow() {
    const state = getState();
    if (state.slideshowMode === SLIDESHOW_MODES.DRAWN_CARDS) {
        currentSlideIndex = 0;
    } else {
        updateState({ cofSlideshowIndex: 0 });
    }
    updateSlideshowView();
}

export function initSlideshow() {
    if (dom.slideshowDurationInput) {
        dom.slideshowDurationInput.addEventListener('change', startOrUpdateSlideshow);
        updateSlideshowView();
    }
    
    if (!slideshowCountdown) {
        slideshowCountdown = document.getElementById('slideshow-countdown');
    }
    
    updatePlaybackControls();
}

// --- GIF Export Data ---

function getSlideIntervals(slideId, state) {
    const intervalMap = {
        'scale': { intervals: state.currentScaleIntervals, isScale: true },
        'chord': { intervals: state.currentChordIntervals, isScale: false },
        'chord2': { intervals: state.currentChordIntervals2, isScale: false },
        'triad': { intervals: state.currentTriadIntervals, isScale: false },
        'triad2': { intervals: state.currentTriadIntervals2, isScale: false },
        'tetrad': { intervals: state.currentTetradIntervals, isScale: false },
        'tetrad2': { intervals: state.currentTetradIntervals2, isScale: false },
        'pentad': { intervals: state.currentPentadIntervals, isScale: false },
        'pentad2': { intervals: state.currentPentadIntervals2, isScale: false },
        'interval': { intervals: ['R', state.currentInterval].filter(Boolean), isScale: false },
        'interval2': { intervals: ['R', state.currentInterval2].filter(Boolean), isScale: false }
    };

    if (intervalMap[slideId]) {
        return intervalMap[slideId];
    }

    // Handle string sets
    if (slideId.includes('string')) {
        const stringSetMap = {
            'twostring': state.currentTwoStringSet,
            'threestring': state.currentThreeStringSet,
            'fourstring': state.currentFourStringSet,
            'fourstring2': state.currentFourStringSet
        };
        
        const activeStrings = stringSetMap[slideId] 
            ? stringSetMap[slideId].split(' & ').map(s => parseInt(s.trim()))
            : null;
            
        return {
            intervals: state.currentScaleIntervals,
            isScale: true,
            activeStrings
        };
    }

    // Handle scale+chord view
    if (slideId === 'scaleChord') {
        if (state.currentScaleIntervals && state.currentChordIntervals) {
            return {
                intervals: { scale: state.currentScaleIntervals, chord: state.currentChordIntervals },
                isScale: false,
                activeStrings: null
            };
        } else if (state.currentScaleIntervals) {
            return { intervals: state.currentScaleIntervals, isScale: true, activeStrings: null };
        } else if (state.currentChordIntervals) {
            return { intervals: state.currentChordIntervals, isScale: false, activeStrings: null };
        }
    }

    return { intervals: null, isScale: false, activeStrings: null };
}

export function getSlideshowData() {
    const state = getState();
    const duration = getSlideDuration();
    const currentMode = state.slideshowMode;

    if (currentMode === SLIDESHOW_MODES.COF_FIFTHS || currentMode === SLIDESHOW_MODES.COF_FOURTHS || currentMode === 'cof') {
        const direction = currentMode === SLIDESHOW_MODES.COF_FOURTHS ? 'fourths' : 'fifths';
        const slides = getCoFSlides(direction).map(slide => ({
            title: `${slide.title} (${slide.rootNote})`,
            value: slide.value,
            intervals: slide.intervals,
            isScale: slide.isScale,
            activeStrings: slide.activeStrings,
        }));
        
        return {
            slides,
            duration,
            rootNote: slides[0] ? slides[0].rootNote : state.currentRootNote,
            scaleIntervals: state.currentScaleIntervals,
            fretboardDisplayMode: state.fretboardDisplayMode,
            tuning: state.currentTuning,
        };
    }

    if (currentMode === SLIDESHOW_MODES.SCALE_INTERVALS) {
        const slides = getScaleIntervalSlides();
        return {
            slides,
            duration,
            rootNote: state.currentRootNote,
            scaleIntervals: state.currentScaleIntervals,
            fretboardDisplayMode: state.fretboardDisplayMode,
            tuning: state.currentTuning,
        };
    }
    
    if (currentMode === SLIDESHOW_MODES.SCALE_TRIADS) {
        const slides = getScaleTriadSlides();
        return {
            slides,
            duration,
            rootNote: state.currentRootNote,
            scaleIntervals: state.currentScaleIntervals,
            fretboardDisplayMode: state.fretboardDisplayMode,
            tuning: state.currentTuning,
        };
    }

    if (currentMode === SLIDESHOW_MODES.SCALE_TETRADS) {
        const slides = getScaleTetradSlides();
        return {
            slides,
            duration,
            rootNote: state.currentRootNote,
            scaleIntervals: state.currentScaleIntervals,
            fretboardDisplayMode: state.fretboardDisplayMode,
            tuning: state.currentTuning,
        };
    }

    if (currentMode === SLIDESHOW_MODES.SCALE_PENTADS) {
        const slides = getScalePentadSlides();
        return {
            slides,
            duration,
            rootNote: state.currentRootNote,
            scaleIntervals: state.currentScaleIntervals,
            fretboardDisplayMode: state.fretboardDisplayMode,
            tuning: state.currentTuning,
        };
    }

    if (currentMode === SLIDESHOW_MODES.SCALE_SEXTADS) {
        const slides = getScaleSextadSlides();
        return {
            slides,
            duration,
            rootNote: state.currentRootNote,
            scaleIntervals: state.currentScaleIntervals,
            fretboardDisplayMode: state.fretboardDisplayMode,
            tuning: state.currentTuning,
        };
    }

    if (currentMode === SLIDESHOW_MODES.SCALE_SEPTADS) {
        const slides = getScaleSeptadSlides();
        return {
            slides,
            duration,
            rootNote: state.currentRootNote,
            scaleIntervals: state.currentScaleIntervals,
            fretboardDisplayMode: state.fretboardDisplayMode,
            tuning: state.currentTuning,
        };
    }

    // Drawn Cards Mode
    const slides = getActiveSlides()
        .map(slide => {
            const { intervals, isScale, activeStrings } = getSlideIntervals(slide.id, state);
            
            const hasContent = intervals && (
                Array.isArray(intervals) ? intervals.length > 0 : (intervals.scale || intervals.chord)
            );

            if (!hasContent) return null;

            return {
                title: slide.title,
                value: slide.valueDisplay.textContent,
                intervals,
                isScale,
                activeStrings
            };
        })
        .filter(slide => slide !== null);

    return {
        slides,
        duration,
        rootNote: state.currentRootNote,
        scaleIntervals: state.currentScaleIntervals,
        fretboardDisplayMode: state.fretboardDisplayMode,
        tuning: state.currentTuning,
    };
}