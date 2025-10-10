let state = {
    currentScaleIntervals: null,
    currentScaleType: null,
    currentRootNote: null,
    currentChordIntervals: null,
    currentChordIntervals2: null,
    currentTriadIntervals: null,
    currentTriadIntervals2: null,
    currentTetradIntervals: null,
    currentTetradIntervals2: null,
    currentPentadIntervals: null,
    currentPentadIntervals2: null,
    currentTwoStringSet: null,
    currentThreeStringSet: null,
    currentFourStringSet: null,
    currentInterval: null,
    currentInterval2: null,
    currentTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    fretboardDisplayMode: 'intervals', // 'intervals' or 'notes'
    startFret: 0, // New state for fret range
    endFret: 4, // New state for fret range
    currentStartFret: null,
    isStartFretFilterActive: false,
    currentTranspositionValue: null,
    isTransposeFilterActive: false,
    isCoFViewActive: false, // New state flag
    slideshowMode: 'drawn_cards', // 'drawn_cards', 'cof_fifths', or 'cof_fourths'
    cofSlideshowIndex: 0,
    scaleIntervalsSlideshowIndex: 0, // New index for interval slideshow
    scaleTriadsSlideshowIndex: 0,
    scaleTetradsSlideshowIndex: 0,
    scalePentadsSlideshowIndex: 0,
    scaleSextadsSlideshowIndex: 0,
    scaleSeptadsSlideshowIndex: 0,
    areDetailsVisible: false,
    isPlayMode: true, // New state flag for Play Mode
    isDemoMode: false, // New state flag for Demo Mode
};

export function getState() {
    return { ...state };
}

export function updateState(newState) {
    state = { ...state, ...newState };
}

export function resetDependentState() {
     updateState({
        currentChordIntervals: null,
        currentChordIntervals2: null,
        currentTriadIntervals: null,
        currentTriadIntervals2: null,
        currentTetradIntervals: null,
        currentTetradIntervals2: null,
        currentPentadIntervals: null,
        currentPentadIntervals2: null,
        currentInterval: null,
        currentInterval2: null,
    });
}

export function resetAllState() {
    updateState({
        currentScaleIntervals: null,
        currentScaleType: null,
        currentRootNote: null,
        currentChordIntervals: null,
        currentChordIntervals2: null,
        currentTriadIntervals: null,
        currentTriadIntervals2: null,
        currentTetradIntervals: null,
        currentTetradIntervals2: null,
        currentPentadIntervals: null,
        currentPentadIntervals2: null,
        currentTwoStringSet: null,
        currentThreeStringSet: null,
        currentFourStringSet: null,
        currentInterval: null,
        currentInterval2: null,
        currentTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        fretboardDisplayMode: 'intervals',
        startFret: 0,
        endFret: 4,
        currentStartFret: null,
        isStartFretFilterActive: false,
        currentTranspositionValue: null,
        isTransposeFilterActive: false,
        isCoFViewActive: false,
        slideshowMode: 'drawn_cards',
        cofSlideshowIndex: 0,
        scaleIntervalsSlideshowIndex: 0,
        scaleTriadsSlideshowIndex: 0,
        scaleTetradsSlideshowIndex: 0,
        scalePentadsSlideshowIndex: 0,
        scaleSextadsSlideshowIndex: 0,
        scaleSeptadsSlideshowIndex: 0,
        isPlayMode: false,
    });
}