import * as dom from './dom.js';
import { scales, chords, triads, tetrads, pentads, transposeCards, melodicPatterns, threeNoteMelodicPatterns, fourNoteMelodicPatterns, startFrets, twoStringSets, threeStringSets, fourStringSets, chordProgressions, faces1, faces2, faces3, faces4, lessons } from './data.js';
import { initFretboards, updateDependentElements, updateFretboardValueDisplays, updateFretboards } from './fretboard.js';
import { initSummary, closeDropdown, handleDropdownOverlayClick, updateDrawnValuesDisplay } from './summary.js';
import { rollDie, drawCard, drawScaleCard, clearScale, drawAll, handleCofView, redrawDependentOnScale } from './actions.js';
import { getState, updateState, resetDependentState } from './state.js';
import { initSlideshow, slideSources, getSlideshowData, toggleSlideshowMode } from './slideshow.js';
import { renderGifExporter } from './gif-exporter.jsx';
import { delay } from './utils.js';

export function updateTransposeFilterButtonText() {
    const state = getState();
    if (!dom.toggleTransposeFilterButton) return;

    const value = state.currentTranspositionValue || '?';
    
    if (state.isTransposeFilterActive) {
        dom.toggleTransposeFilterButton.textContent = `Transpose Filter Active (${value})`;
    } else {
        let text = 'Apply Transpose Filter (Off)';
        if (state.currentTranspositionValue) {
            text += ` (${value})`;
        }
        dom.toggleTransposeFilterButton.textContent = text;
    }
}

function toggleFretboardDisplayMode() {
    const currentState = getState();
    const newMode = currentState.fretboardDisplayMode === 'intervals' ? 'notes' : 'intervals';
    updateState({ fretboardDisplayMode: newMode });
    
    dom.toggleDisplayModeButton.textContent = newMode === 'intervals' ? 'Show Note Names' : 'Show Intervals';
    
    // Redraw all fretboards
    updateFretboards();
}

function toggleStartFretFilter() {
    const state = getState();
    if (state.currentStartFret === null) {
        alert('Please roll the "Start Fret" die first.');
        return;
    }

    const newState = !state.isStartFretFilterActive;
    updateState({ isStartFretFilterActive: newState });

    dom.toggleStartFretFilterButton.textContent = newState 
        ? `Start Fret Filter Active (${state.currentStartFret})`
        : 'Apply Start Fret Filter (Off)';
    
    updateFretboards();
}

function toggleTransposeFilter() {
    const state = getState();
    if (!state.currentTranspositionValue) {
        alert('Please draw a "Transpose Card" first.');
        return;
    }

    const newState = !state.isTransposeFilterActive;
    updateState({ isTransposeFilterActive: newState });

    updateTransposeFilterButtonText();
    updateFretboards();
}

function toggleDetailsVisibility() {
    const state = getState();
    const newDetailsVisible = !state.areDetailsVisible;
    updateState({ areDetailsVisible: newDetailsVisible });

    dom.toggleDetailsButton.textContent = newDetailsVisible ? 'Hide Details' : 'Show Details';

    if (newDetailsVisible) {
        document.body.classList.remove('details-hidden');
    } else {
        document.body.classList.add('details-hidden');
    }
}

function toggleDemoMode() {
    const state = getState();
    const newDemoMode = !state.isDemoMode;
    updateState({ isDemoMode: newDemoMode });

    // 1. Update button text and style
    dom.toggleDemoModeButton.textContent = newDemoMode ? 'Demo Mode (On)' : 'Demo Mode (Off)';
    dom.toggleDemoModeButton.style.backgroundColor = newDemoMode ? '#4CAF50' : '#ff9800';

    // 2. Apply class to body for CSS hiding/showing
    if (newDemoMode) {
        document.body.classList.add('demo-mode-active');
    } else {
        document.body.classList.remove('demo-mode-active');
    }
}

function updatePlayModeDropdowns() {
    const { currentRootNote, currentScaleType } = getState();
    const scaleName = dom.card2.querySelector('.card-name')?.textContent || '';

    if (currentRootNote) {
        // Find the option whose text starts with the note (e.g., "C# / Db" starts with "C#")
        const keyOption = Array.from(dom.playModeKeySelect.options).find(opt => opt.value.startsWith(currentRootNote));
        if (keyOption) {
            dom.playModeKeySelect.value = keyOption.value;
        } else {
             dom.playModeKeySelect.value = currentRootNote;
        }
    }
    
    if (scaleName) {
        dom.playModeScaleSelect.value = scaleName;
    }
}

function togglePlayMode() {
    const state = getState();
    const newPlayMode = !state.isPlayMode;
    updateState({ isPlayMode: newPlayMode });

    // 1. Update button text and style
    dom.togglePlayModeButton.textContent = newPlayMode ? 'Play Mode (On)' : 'Play Mode (Off)';
    dom.togglePlayModeButton.style.backgroundColor = newPlayMode ? '#4CAF50' : '#ff9800';

    // 2. Apply class to body for CSS hiding/showing
    if (newPlayMode) {
        document.body.classList.add('play-mode-active');
        updatePlayModeDropdowns();
    } else {
        document.body.classList.remove('play-mode-active');
    }
}

function openSidebar() {
    dom.sidebar.classList.add('open');
    document.body.classList.add('sidebar-open');
}

function closeSidebar() {
    dom.sidebar.classList.remove('open');
    document.body.classList.remove('sidebar-open');
}

function initializeEventListeners() {
    dom.rollButton1.addEventListener('click', () => rollDie(dom.die1, faces1, dom.rollButton1));
    dom.rollButton2.addEventListener('click', () => rollDie(dom.die2, faces2, dom.rollButton2));
    dom.rollButton3.addEventListener('click', () => {
        const { currentScaleIntervals } = getState();
        const currentFaces = currentScaleIntervals ? faces3.filter(f => currentScaleIntervals.includes(f) || f === 'R') : faces3;
        rollDie(dom.die3, currentFaces, dom.rollButton3);
    });
    dom.rollButton4.addEventListener('click', () => rollDie(dom.die4, faces4, dom.rollButton4));
    dom.rollButton5.addEventListener('click', () => rollDie(dom.die5, startFrets, dom.rollButton5));

    dom.drawButton1.addEventListener('click', () => drawCard(dom.card1, chords, dom.drawButton1, true));
    dom.drawButtonChord2.addEventListener('click', () => drawCard(dom.cardChord2, chords, dom.drawButtonChord2, true, 'currentChordIntervals', dom.card1));
    dom.drawButton2.addEventListener('click', () => drawScaleCard(dom.card2, scales, dom.drawButton2));
    dom.drawButton3.addEventListener('click', () => drawCard(dom.card3, triads, dom.drawButton3));
    dom.drawButtonTriad2.addEventListener('click', () => drawCard(dom.cardTriad2, triads, dom.drawButtonTriad2, false, 'currentTriadIntervals', dom.card3));
    dom.drawButton4.addEventListener('click', () => drawCard(dom.card4, tetrads, dom.drawButton4));
    dom.drawButtonTetrad2.addEventListener('click', () => drawCard(dom.cardTetrad2, tetrads, dom.drawButtonTetrad2, false, 'currentTetradIntervals', dom.card4));
    dom.drawButton5.addEventListener('click', () => drawCard(dom.card5, pentads, dom.drawButton5));
    dom.drawButtonPentad2.addEventListener('click', () => drawCard(dom.cardPentad2, pentads, dom.drawButtonPentad2, false, 'currentPentadIntervals', dom.card5));
    dom.drawButton6.addEventListener('click', () => drawCard(dom.card6, transposeCards, dom.drawButton6));
    dom.drawButton7.addEventListener('click', () => drawCard(dom.card7, melodicPatterns, dom.drawButton7));
    dom.drawButton8.addEventListener('click', () => drawCard(dom.card8, threeNoteMelodicPatterns, dom.drawButton8));
    dom.drawButton9.addEventListener('click', () => drawCard(dom.card9, fourNoteMelodicPatterns, dom.drawButton9));
    dom.drawButton10.addEventListener('click', () => drawCard(dom.card10, twoStringSets, dom.drawButton10));
    dom.drawButton11.addEventListener('click', () => drawCard(dom.card11, threeStringSets, dom.drawButton11));
    dom.drawButton13.addEventListener('click', () => drawCard(dom.card13, fourStringSets, dom.drawButton13));
    dom.drawButton12.addEventListener('click', () => drawCard(dom.card12, chordProgressions, dom.drawButton12, true));
    dom.drawButtonInterval2.addEventListener('click', () => drawCard(dom.cardInterval2, faces3, dom.drawButtonInterval2, false, 'currentInterval', dom.die3));
    
    // New listener for CoF
    dom.drawButtonCof.addEventListener('click', () => handleCofView(dom.drawButtonCof));

    dom.clearScaleButton.addEventListener('click', clearScale);
    dom.drawAllButton.addEventListener('click', drawAll);

    dom.exportGifButton.addEventListener('click', () => {
        const data = getSlideshowData();
        if (data.slides.length > 0) {
            renderGifExporter(data);
        } else {
            alert('No content to export. Please draw some values first.');
        }
    });

    dom.toggleDisplayModeButton.addEventListener('click', toggleFretboardDisplayMode);
    dom.toggleStartFretFilterButton.addEventListener('click', toggleStartFretFilter);
    dom.toggleTransposeFilterButton.addEventListener('click', toggleTransposeFilter);
    
    dom.toggleDetailsButton.addEventListener('click', toggleDetailsVisibility);
    dom.toggleSlideshowModeButton.addEventListener('click', toggleSlideshowMode); // New listener
    
    // New listener for Play Mode
    dom.togglePlayModeButton.addEventListener('click', togglePlayMode);

    // Sidebar listeners
    dom.hamburgerMenu.addEventListener('click', openSidebar);
    dom.closeSidebarButton.addEventListener('click', closeSidebar);

    // Dropdown/Modal listeners
    dom.dropdownCloseButton.addEventListener('click', closeDropdown);
    dom.dropdownOverlay.addEventListener('click', handleDropdownOverlayClick);

    // Lesson dropdown listener
    dom.lessonSelect.addEventListener('change', handleLessonChange);
    
    // Play Mode selector listeners
    dom.playModeKeySelect.addEventListener('change', handlePlayModeSelectionChange);
    dom.playModeScaleSelect.addEventListener('change', handlePlayModeSelectionChange);
}

async function applyLesson(lesson) {
    if (!lesson) return;

    // 1. Find the scale object from data
    const selectedScale = scales.find(s => s.name === lesson.scale);
    if (!selectedScale) {
        console.error(`Scale not found: ${lesson.scale}`);
        return;
    }

    const scaleIntervals = selectedScale.intervals.split(', ').map(s => s.trim());
    if (selectedScale.intervals !== 'All 12 notes' && !scaleIntervals.includes('R')) {
        scaleIntervals.unshift('R');
    }

    const scaleType = selectedScale.name.toLowerCase().includes('minor') ? 'minor' : selectedScale.name.toLowerCase().includes('major') ? 'major' : 'modal';
    
    // 2. Clear previous state that depends on scale
    resetDependentState();
    
    // 3. Update state directly
    updateState({
        currentRootNote: lesson.root,
        currentScaleIntervals: scaleIntervals,
        currentScaleType: scaleType
    });

    // 4. Update UI elements for Key and Scale
    dom.die2.textContent = lesson.root;
    dom.card2.innerHTML = `<span class="card-name">${selectedScale.name}</span><span class="card-intervals">${selectedScale.intervals}</span>`;
    dom.clearScaleButton.style.display = 'block';

    // 5. Update dependencies and fretboards to show the new scale
    updateDependentElements();
    updateFretboards();

    // 6. Redraw all scale-dependent items
    await redrawDependentOnScale();
    
    // 7. Final UI update after all draws are complete
    updateDrawnValuesDisplay();
    updateFretboards();
}

function handleLessonChange(event) {
    const lessonName = event.target.value;
    if (lessonName) {
        const selectedLesson = lessons.find(l => l.name === lessonName);
        applyLesson(selectedLesson);
    }
}

async function handlePlayModeSelectionChange() {
    const selectedKey = dom.playModeKeySelect.value;
    const selectedScaleName = dom.playModeScaleSelect.value;

    const lesson = {
        root: selectedKey.split(' ')[0], // Handle "C# / Db"
        scale: selectedScaleName
    };
    
    // applyLesson does exactly what we need
    await applyLesson(lesson);

    // Ensure the slideshow updates to show the new scale, as it's the main view in play mode.
    // The slideshow should already be on the scale slide, but we call this to be safe.
    updateFretboards(); 
}

function populatePlayModeDropdowns() {
    // Populate Key dropdown
    faces2.forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        dom.playModeKeySelect.appendChild(option);
    });

    // Populate Scale dropdown
    scales.forEach(scale => {
        const option = document.createElement('option');
        option.value = scale.name;
        option.textContent = scale.name;
        dom.playModeScaleSelect.appendChild(option);
    });
}

async function loadDefaultsAndDraw() {
    // 1. Find Major (Ionian) scale from data
    const majorScale = scales.find(s => s.name === 'Major (Ionian)');
    if (!majorScale) return;

    const majorScaleIntervals = majorScale.intervals.split(', ').map(s => s.trim());
    if (!majorScaleIntervals.includes('R')) majorScaleIntervals.unshift('R');

    // 2. Update state directly
    updateState({
        currentRootNote: 'C',
        currentScaleIntervals: majorScaleIntervals,
        currentScaleType: 'major'
    });

    // 3. Update UI elements for Key and Scale
    dom.die2.textContent = 'C';
    dom.card2.innerHTML = `<span class="card-name">${majorScale.name}</span><span class="card-intervals">${majorScale.intervals}</span>`;
    dom.clearScaleButton.style.display = 'block';

    // 4. Update dependencies and fretboards to show the scale
    updateDependentElements();
    updateFretboards();

    // 5. Draw everything else that is not dependent on the scale
    [
        dom.rollButton4, // Measures
        dom.rollButton5, // Start Fret
        dom.drawButton6, // Transpose
        dom.drawButton10, // 2-string
        dom.drawButton11, // 3-string
        dom.drawButton13  // 4-string
    ].forEach(b => b.click());

    await delay(500); // Wait for animations to settle a bit

    // 6. Draw all scale-dependent items
    // This is a function from actions.js that clicks all dependent buttons
    await redrawDependentOnScale();

    await delay(500);

    // 7. Final UI update after all draws are complete
    updateDrawnValuesDisplay();
    updateFretboards();
}

document.addEventListener('DOMContentLoaded', async () => {
    updateDependentElements();
    initFretboards();
    initSummary();
    initializeEventListeners();
    initSlideshow();
    updateFretboardValueDisplays();
    
    populatePlayModeDropdowns();

    // Populate lesson dropdown
    lessons.forEach(lesson => {
        const option = document.createElement('option');
        option.value = lesson.name;
        option.textContent = lesson.name;
        dom.lessonSelect.appendChild(option);
    });

    // Default to details hidden
    document.body.classList.add('details-hidden');
    dom.toggleDetailsButton.textContent = 'Show Details';

    // Initialize Play Mode state
    if (getState().isPlayMode) {
        document.body.classList.add('play-mode-active');
        dom.togglePlayModeButton.textContent = 'Play Mode (On)';
        dom.togglePlayModeButton.style.backgroundColor = '#4CAF50';
    } else {
        dom.togglePlayModeButton.textContent = 'Play Mode (Off)';
        dom.togglePlayModeButton.style.backgroundColor = '#ff9800';
    }

    // Set initial button text based on default state (intervals)
    dom.toggleDisplayModeButton.textContent = getState().fretboardDisplayMode === 'intervals' ? 'Show Note Names' : 'Show Intervals';
    
    // Set initial Start Fret Filter button text
    const state = getState();
    dom.toggleStartFretFilterButton.textContent = state.isStartFretFilterActive 
        ? `Start Fret Filter Active (${state.currentStartFret || '?'})`
        : 'Apply Start Fret Filter (Off)';
    
    updateTransposeFilterButtonText();
    
    // Initialize Slideshow mode button text
    const mode = getState().slideshowMode;
    let modeText = 'Drawn Cards';
    if (mode === 'cof_fifths') modeText = 'Circle of Fifths';
    if (mode === 'cof_fourths') modeText = 'Circle of Fourths';
    dom.toggleSlideshowModeButton.textContent = `Mode: ${modeText}`;

    // Load default C Major scale and draw all dependent cards
    await loadDefaultsAndDraw();
    updatePlayModeDropdowns();
});