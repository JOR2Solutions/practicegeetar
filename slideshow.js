import * as dom from './dom.js';
import { getState, updateState } from './state.js';
import { CIRCLE_OF_FIFTHS, INTERVAL_SEMITONES } from './data.js';
import { updateFretboardDisplay, intervalsToSemitones } from './fretboard-viz.js';
import { updatePianoDisplay } from './piano-viz.js';


let slideshowInterval = null;
let currentSlideIndex = 0; // Index into the currently active slides list
let countdownInterval = null;
let countdownRemaining = 0;
// Local reference for the slideshow countdown element (do not mutate imported dom)
let slideshowCountdown = null;

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

// --- Helper functions for CoF Slideshow ---

function getCoFSlides(direction) {
    const { currentScaleIntervals, currentRootNote, currentScaleType } = getState();
    if (!currentScaleIntervals || !currentRootNote) return [];

    const scaleName = dom.scaleValueDisplay.textContent.split(' (')[0];
    const startNote = currentRootNote.split(' ')[0];
    
    let startIndex = CIRCLE_OF_FIFTHS.findIndex(note => note.startsWith(startNote));
    if (startIndex === -1) {
        startIndex = CIRCLE_OF_FIFTHS.findIndex(note => note.includes(startNote));
    }
    
    if (startIndex === -1) return [];

    // Reorder CIRCLE_OF_FIFTHS to start from the current root note
    let orderedCoF = [
        ...CIRCLE_OF_FIFTHS.slice(startIndex),
        ...CIRCLE_OF_FIFTHS.slice(0, startIndex)
    ];

    if (direction === 'fourths') {
        const rootNote = orderedCoF[0];
        orderedCoF.shift(); // Remove root
        orderedCoF.reverse(); // Reverse the rest
        orderedCoF.unshift(rootNote); // Put root back at start
    }


    return orderedCoF.map(noteName => {
        const root = noteName.split(' / ')[0];
        return {
            rootNote: root,
            title: scaleName,
            value: `Key: ${root} (${currentScaleType})`,
            intervals: currentScaleIntervals,
            isScale: true,
            hasContent: true,
            activeStrings: null // Use default strings
        };
    });
}

// --- Slideshow Management Functions for Drawn Cards Mode ---

function getActiveSlides() {
    // Check if the value display has meaningful content.
    return slideSources.filter(source => {
        const value = source.valueDisplay.textContent.trim();
        // A slide is active if it has text content that isn't empty or a placeholder
        return value.length > 0 && value !== '?' && value !== 'N/A';
    });
}

// This function advances to the next slide in Drawn Cards mode.
function advanceDrawnSlide() {
    const activeSlides = getActiveSlides();
    if (activeSlides.length < 2) {
        currentSlideIndex = 0;
        updateSlideshowView(); 
        return;
    }
    currentSlideIndex = (currentSlideIndex + 1) % activeSlides.length;
    updateSlideshowView();
}

function updateDrawnSlideshowView() {
    const activeSlides = getActiveSlides();
    
    if (activeSlides.length === 0) {
        dom.slideshowFretboardContainer.innerHTML = '';
        dom.slideshowPianoContainer.innerHTML = ''; // Clear piano
        dom.slideshowFretboardTitle.textContent = 'No Content Drawn';
        dom.slideshowFretboardValue.textContent = '';
        
        stopSlideshowInterval();
        return;
    }
    
    // Clamp currentSlideIndex if necessary
    if (currentSlideIndex >= activeSlides.length) {
        currentSlideIndex = 0;
    }
    
    const source = activeSlides[currentSlideIndex];
    
    // Copy content
    if (source && dom.slideshowFretboardContainer) {
        // Copy innerHTML which contains both .fretboard-diagram and .fret-numbers
        dom.slideshowFretboardContainer.innerHTML = source.container.innerHTML;
        const pianoSource = slidePianoSourceMap[source.id];
        if (pianoSource) {
            dom.slideshowPianoContainer.innerHTML = pianoSource.innerHTML;
        }

        dom.slideshowFretboardTitle.textContent = source.title;
        if (dom.slideshowFretboardValue && source.valueDisplay) {
            dom.slideshowFretboardValue.textContent = source.valueDisplay.textContent;
        }

        // Reset countdown for this slide
        const durationInput = dom.slideshowDurationInput;
        let duration = parseInt(durationInput.value, 10);
        if (isNaN(duration) || duration < 1) duration = 30;
        countdownRemaining = duration;
        updateCountdownDisplay();
    }

    startSlideshowInterval(activeSlides.length, advanceDrawnSlide);
}


// --- Slideshow Management Functions for CoF Mode ---

function advanceCofSlide() {
    const state = getState();
    
    const direction = state.slideshowMode === 'cof_fourths' ? 'fourths' : 'fifths';
    
    const cofSlides = getCoFSlides(direction);
    if (cofSlides.length === 0) {
        updateSlideshowView(); 
        return;
    }
    const newIndex = (state.cofSlideshowIndex + 1) % cofSlides.length;
    updateState({ cofSlideshowIndex: newIndex });
    updateSlideshowView();
}

function updateCofSlideshowView() {
    const state = getState();
    const direction = state.slideshowMode === 'cof_fourths' ? 'fourths' : 'fifths';
    const cofSlides = getCoFSlides(direction);

    if (cofSlides.length === 0) {
        dom.slideshowFretboardContainer.innerHTML = '';
        dom.slideshowPianoContainer.innerHTML = ''; // Clear piano
        dom.slideshowFretboardTitle.textContent = 'No Scale/Key Drawn for CoF Slideshow';
        dom.slideshowFretboardValue.textContent = '';
        
        stopSlideshowInterval();
        return;
    }

    // Clamp index
    if (state.cofSlideshowIndex >= cofSlides.length) {
        updateState({ cofSlideshowIndex: 0 });
    }
    const currentCofIndex = getState().cofSlideshowIndex;
    const currentSlide = cofSlides[currentCofIndex];

    // 1. Update Title/Value
    const modeName = direction === 'fourths' ? 'Fourths' : 'Fifths';
    dom.slideshowFretboardTitle.textContent = `${currentSlide.title} (CoF ${modeName}, Key ${currentCofIndex + 1}/${cofSlides.length})`;
    dom.slideshowFretboardValue.textContent = currentSlide.value;

    // 2. Update the Fretboard visualization using the current CoF root
    updateFretboardDisplay(
        dom.slideshowFretboardContainer, 
        state.currentScaleIntervals, 
        true, // isScale
        null, // activeStrings
        currentSlide.rootNote // customRootNote
    );
    // 3. Update the Piano visualization
    updatePianoDisplay(
        dom.slideshowPianoContainer,
        state.currentScaleIntervals,
        true, // isScale
        currentSlide.rootNote // customRootNote
    );

    // Reset countdown for this slide
    const durationInput = dom.slideshowDurationInput;
    let duration = parseInt(durationInput.value, 10);
    if (isNaN(duration) || duration < 1) duration = 30;
    countdownRemaining = duration;
    updateCountdownDisplay();

    startSlideshowInterval(cofSlides.length, advanceCofSlide);
}


// --- General Slideshow Control ---

function stopSlideshowInterval() {
     if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    // Clear visible countdown
    slideshowCountdown && (slideshowCountdown.textContent = '');
}

function startSlideshowInterval(numSlides, advanceFunction) {
    stopSlideshowInterval();

    if (numSlides <= 1) return;

    const durationInput = dom.slideshowDurationInput;
    let duration = parseInt(durationInput.value, 10);
    if (isNaN(duration) || duration < 1) duration = 30;

    // Initialize countdown
    countdownRemaining = duration;
    updateCountdownDisplay();

    // Clear any previous countdown tick
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    // per-second countdown tick
    countdownInterval = setInterval(() => {
        countdownRemaining -= 1;
        if (countdownRemaining <= 0) {
            countdownRemaining = 0;
            updateCountdownDisplay();
            // Let the slide advance function handle resetting countdown when it runs.
            // If slideshowInterval exists, advanceFunction will run on its tick; we also run it here to be safe.
            advanceFunction();
        } else {
            updateCountdownDisplay();
        }
    }, 1000);

    slideshowInterval = setInterval(advanceFunction, duration * 1000);
}

function updateCountdownDisplay() {
    if (!slideshowCountdown) return;
    slideshowCountdown.textContent = countdownRemaining > 0 ? `${countdownRemaining}s` : '0s';
}

// This function updates the content of the current slide based on mode.
export function updateSlideshowView() {
    const state = getState();
    
    if (state.slideshowMode === 'cof_fifths' || state.slideshowMode === 'cof_fourths' || state.slideshowMode === 'cof') {
        updateCofSlideshowView();
    } else {
        updateDrawnSlideshowView();
    }
}

export function toggleSlideshowMode() {
    const state = getState();
    let newMode = 'drawn_cards';

    // Normalize previous state value if it's 'cof'
    const currentMode = state.slideshowMode === 'cof' ? 'cof_fifths' : state.slideshowMode;

    if (currentMode === 'drawn_cards') {
        newMode = 'cof_fifths';
    } else if (currentMode === 'cof_fifths') {
        newMode = 'cof_fourths';
    } else { // 'cof_fourths'
        newMode = 'drawn_cards';
    }
    
    if (newMode.startsWith('cof_')) {
        const direction = newMode === 'cof_fourths' ? 'fourths' : 'fifths';
        const cofSlides = getCoFSlides(direction);
        if (cofSlides.length === 0) {
            alert('Cannot switch to Circle of Fifths/Fourths slideshow mode. Please ensure a Scale and a Key are drawn.');
            // Revert back to drawn cards if transition to CoF fails
            newMode = 'drawn_cards';
        }
    }
    
    updateState({ slideshowMode: newMode, cofSlideshowIndex: 0 });

    if (newMode === 'drawn_cards') {
        dom.toggleSlideshowModeButton.textContent = 'Mode: Drawn Cards';
    } else if (newMode === 'cof_fifths') {
        dom.toggleSlideshowModeButton.textContent = 'Mode: Circle of Fifths';
    } else { // cof_fourths
        dom.toggleSlideshowModeButton.textContent = 'Mode: Circle of Fourths';
    }
    
    // Reset index for the new mode and update view immediately
    currentSlideIndex = 0;
    updateSlideshowView();
}

function startOrUpdateSlideshow() {
    // When duration changes, stop and restart, resetting to the start index if needed.
    const state = getState();
    if (state.slideshowMode === 'drawn_cards') {
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
    // Ensure countdown element reference exists in dom (add friendly fallback)
    // Use local variable for the countdown element to avoid mutating imported module
    if (!slideshowCountdown) {
        slideshowCountdown = document.getElementById('slideshow-countdown');
    }
}


/**
 * Gathers data for GIF export based on the current slideshow mode.
 */
export function getSlideshowData() {
    const state = getState();
    const duration = parseInt(dom.slideshowDurationInput.value, 10) || 30;

    const currentMode = state.slideshowMode;

    if (currentMode === 'cof_fifths' || currentMode === 'cof_fourths' || currentMode === 'cof') {
        const direction = currentMode === 'cof_fourths' ? 'fourths' : 'fifths';
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
        };
    }

    // Standard Drawn Cards Mode
    const slides = getActiveSlides().map(slide => {
        let intervals = null;
        let isScale = false;
        let activeStrings = null;

        switch (slide.id) {
            case 'scale': intervals = state.currentScaleIntervals; isScale = true; break;
            case 'chord': intervals = state.currentChordIntervals; break;
            case 'chord2': intervals = state.currentChordIntervals2; break;
            case 'triad': intervals = state.currentTriadIntervals; break;
            case 'triad2': intervals = state.currentTriadIntervals2; break;
            case 'tetrad': intervals = state.currentTetradIntervals; break;
            case 'tetrad2': intervals = state.currentTetradIntervals2; break;
            case 'pentad': intervals = state.currentPentadIntervals; break;
            case 'pentad2': intervals = state.currentPentadIntervals2; break;
            case 'interval': intervals = ['R', state.currentInterval].filter(Boolean); break;
            case 'interval2': intervals = ['R', state.currentInterval2].filter(Boolean); break;
            case 'twostring': 
                intervals = state.currentScaleIntervals;
                isScale = true;
                if (state.currentTwoStringSet) activeStrings = state.currentTwoStringSet.split(' & ').map(s => parseInt(s.trim()));
                break;
            case 'threestring':
                intervals = state.currentScaleIntervals;
                isScale = true;
                if (state.currentThreeStringSet) activeStrings = state.currentThreeStringSet.split(' & ').map(s => parseInt(s.trim()));
                break;
            case 'fourstring':
            case 'fourstring2':
                intervals = state.currentScaleIntervals;
                isScale = true;
                if (state.currentFourStringSet) activeStrings = state.currentFourStringSet.split(' & ').map(s => parseInt(s.trim()));
                break;
            case 'scaleChord': 
                // For composition.jsx, we need the combined structure if it's not a pure scale/chord view
                if (state.currentScaleIntervals && state.currentChordIntervals) {
                    intervals = { scale: state.currentScaleIntervals, chord: state.currentChordIntervals };
                } else if (state.currentScaleIntervals) {
                    intervals = state.currentScaleIntervals;
                    isScale = true;
                } else if (state.currentChordIntervals) {
                    intervals = state.currentChordIntervals;
                } else {
                    intervals = null;
                }
                break;

        }

        const hasContent = intervals && (Array.isArray(intervals) ? intervals.length > 0 : (intervals.scale || intervals.chord));

        if (!hasContent) return null;

        return {
            title: slide.title,
            value: slide.valueDisplay.textContent,
            intervals: intervals,
            isScale: isScale,
            activeStrings: activeStrings
        };
    }).filter(slide => slide !== null);


    return {
        slides,
        duration,
        rootNote: state.currentRootNote,
        scaleIntervals: state.currentScaleIntervals,
        fretboardDisplayMode: state.fretboardDisplayMode,
    };
}