import * as dom from './dom.js';
import { updateState, getState, resetAllState, resetDependentState } from './state.js';
import { updateFretboards, updateDependentElements } from './fretboard.js';
import { updateDrawnValuesDisplay, getChordNamesForProgression } from './summary.js';
import { chords, scales, chordProgressions } from './data.js';
import { animate, delay } from './utils.js';
import { updateTransposeFilterButtonText } from './script.js';

function generateMelodicPattern(numNotes, scaleSize) {
    const degrees = Array.from({length: scaleSize}, (_, i) => i + 1);
    const pattern = new Set();
    while (pattern.size < numNotes) {
        pattern.add(degrees[Math.floor(Math.random() * degrees.length)]);
    }
    return Array.from(pattern).join('-');
}

export function rollDie(dieElement, faces, buttonElement) {
    if (dieElement.classList.contains('rolling') || !faces || faces.length === 0) {
        if (!faces || faces.length === 0) dieElement.textContent = 'X';
        return;
    }
    buttonElement.disabled = true;

    animate(dieElement, 'rolling', 500).then(() => {
        buttonElement.disabled = false;
    });

    setTimeout(() => {
        const result = faces[Math.floor(Math.random() * faces.length)];
        dieElement.textContent = result;

        let newState = {};
        
        if (dieElement.id === 'die1' || dieElement.id === 'die2') {
            newState.currentRootNote = result.split(' ')[0];
        } else if (dieElement.id === 'die3') {
            newState.currentInterval = result;
        } else if (dieElement.id === 'die5') {
            // Die 5 is Start Fret, results are strings that parse to numbers 0-12
            newState.currentStartFret = parseInt(result, 10);
            
            // Also update the filter button text immediately if filter is active
            const currentState = getState();
            if (currentState.isStartFretFilterActive) {
                dom.toggleStartFretFilterButton.textContent = `Start Fret Filter Active (${newState.currentStartFret})`;
            }
        }
        
        updateState(newState);

        updateFretboards();
        updateDrawnValuesDisplay();
    }, 400);
}

export function drawCard(cardElement, deck, buttonElement, isObjectDeck = false, firstDrawStateKey = null, firstDrawElement = null) {
    if (cardElement.classList.contains('flipping')) return;

    buttonElement.disabled = true;
    animate(cardElement, 'flipping', 500).then(() => {
        buttonElement.disabled = false;
    });

    setTimeout(() => {
        const state = getState();
        const { currentScaleIntervals, currentScaleType } = state;
        let currentDeck = deck;
        const scaleSize = currentScaleIntervals ? (currentScaleIntervals[0] === 'All 12 notes' ? 12 : currentScaleIntervals.length) : 0;

        if (currentScaleIntervals && cardElement.parentElement.dataset.dependency === 'scale') {
            if (isObjectDeck) {
                if(cardElement.id === 'card12') currentDeck = deck.filter(p => p.type === currentScaleType || p.type === 'modal' || p.type === 'other');
                else currentDeck = deck.filter(item => item.intervals.split(', ').map(s => s.trim()).every(interval => currentScaleIntervals.includes(interval) || interval === 'R'));
            } else {
                 if (cardElement.id === 'card7') currentDeck = deck.filter(pattern => (pattern.match(/\d+/g)?.map(Number) || []).every(d => d <= scaleSize));
                 else if (cardElement.id === 'card8') currentDeck = scaleSize >= 3 ? [generateMelodicPattern(3, scaleSize)] : [];
                 else if (cardElement.id === 'card9') currentDeck = scaleSize >= 4 ? [generateMelodicPattern(4, scaleSize)] : [];
                 else if (cardElement.id === 'card-interval2') currentDeck = deck.filter(f => currentScaleIntervals.includes(f));
                 else currentDeck = deck.filter(item => item.split(', ').map(s => s.trim()).every(interval => currentScaleIntervals.includes(interval) || interval === 'R'));
            }
        } else if (cardElement.parentElement.dataset.dependency === 'scale') {
            if (cardElement.id === 'card12' || cardElement.id === 'card-interval2') currentDeck = [];
        }

        // For "2nd" draws, filter out the first result
        if (firstDrawStateKey && firstDrawElement) {
            let firstValue;
            if (firstDrawElement.classList.contains('die')) {
                firstValue = firstDrawElement.textContent.trim();
            } else {
                 const nameSpan = firstDrawElement.querySelector('.card-name');
                 firstValue = nameSpan ? nameSpan.textContent : firstDrawElement.textContent.trim();
            }

            if(firstValue && firstValue !== '?') {
                if (isObjectDeck) {
                    currentDeck = currentDeck.filter(item => item.name !== firstValue && item.progression !== firstValue);
                } else {
                    currentDeck = currentDeck.filter(item => String(item) !== firstValue);
                }
            }
        }


        if (currentDeck.length === 0) {
            cardElement.innerHTML = `<span class=\"card-name\" style=\"font-size:16px;\">No valid cards</span>`;
            if (['card1', 'card-chord2', 'card3', 'card-triad2', 'card4', 'card-tetrad2', 'card5', 'card-pentad2'].includes(cardElement.id)) {
                 const idMap = {'card-chord2':'currentChordIntervals2', 'card-triad2':'currentTriadIntervals2', 'card-tetrad2':'currentTetradIntervals2', 'card-pentad2':'currentPentadIntervals2'};
                 if(idMap[cardElement.id]) updateState({ [idMap[cardElement.id]]: null });
                 else resetDependentState();
            }
        } else {
            const result = currentDeck[Math.floor(Math.random() * currentDeck.length)];
            let newState = {};
            if (isObjectDeck) {
                const isProgression = !!result.progression;
                const chordNames = isProgression ? getChordNamesForProgression(result.progression) : '';

                let innerHTML = `<span class=\"card-name\">${result.name || result.progression}</span>`;
                if (result.intervals) {
                    innerHTML += `<span class=\"card-intervals\">${result.intervals}</span>`;
                }
                if (chordNames) {
                    innerHTML += `<span class=\"card-chords\">${chordNames}</span>`;
                }
                cardElement.innerHTML = innerHTML;

                if (cardElement.id === 'card1') {
                    const intervals = result.intervals.split(', ').map(s => s.trim());
                    if (!intervals.includes('R')) intervals.unshift('R');
                    newState.currentChordIntervals = intervals;
                }
                if (cardElement.id === 'card-chord2') {
                    const intervals = result.intervals.split(', ').map(s => s.trim());
                    if (!intervals.includes('R')) intervals.unshift('R');
                    newState.currentChordIntervals2 = intervals;
                }
            } else {
                cardElement.innerHTML = `<span class=\"card-name\">${result}</span>`;
                const idMap = {
                    'card3':'currentTriadIntervals', 'card-triad2':'currentTriadIntervals2',
                    'card4':'currentTetradIntervals', 'card-tetrad2':'currentTetradIntervals2',
                    'card5':'currentPentadIntervals', 'card-pentad2':'currentPentadIntervals2',
                };
                if(idMap[cardElement.id]) {
                    const intervals = result.split(', ').map(s => s.trim());
                    if(!intervals.includes('R')) intervals.unshift('R');
                    newState[idMap[cardElement.id]] = intervals;
                }
                if (cardElement.id === 'card-interval2') newState.currentInterval2 = result;
                if (cardElement.id === 'card10') newState.currentTwoStringSet = result;
                if (cardElement.id === 'card11') newState.currentThreeStringSet = result;
                if (cardElement.id === 'card13') newState.currentFourStringSet = result;
                if (cardElement.id === 'card6') newState.currentTranspositionValue = result;
            }
            updateState(newState);
            if (cardElement.id === 'card6') {
                 updateTransposeFilterButtonText();
            }
        }
        updateFretboards();
        updateDrawnValuesDisplay();
    }, 250);
}

export function drawScaleCard(cardElement, deck, buttonElement) {
    if (cardElement.classList.contains('flipping')) return;

    buttonElement.disabled = true;
    animate(cardElement, 'flipping', 500).then(() => {
        buttonElement.disabled = false;
    });

    setTimeout(() => {
        const result = deck[Math.floor(Math.random() * deck.length)];
        cardElement.innerHTML = `<span class=\"card-name\">${result.name}</span><span class=\"card-intervals\">${result.intervals}</span>`;

        let intervals = result.intervals.split(', ').map(s => s.trim());
        if (result.intervals === 'All 12 notes') intervals = [result.intervals];
        else if (!intervals.includes('R')) intervals.unshift('R');

        const scaleType = result.name.toLowerCase().includes('minor') ? 'minor' : result.name.toLowerCase().includes('major') ? 'major' : 'modal';

        updateState({ currentScaleIntervals: intervals, currentScaleType: scaleType });

        updateDependentElements();
        dom.clearScaleButton.style.display = 'block';
        updateFretboards();
        updateDrawnValuesDisplay();
    }, 250);
}

export function handleCofView(buttonElement) {
    const { currentScaleIntervals, currentRootNote } = getState();
    
    if (!currentScaleIntervals || !currentRootNote) {
        alert('Please draw a Scale and a Key (Chromatic or Diatonic) first.');
        return;
    }

    const state = getState();
    const newState = !state.isCoFViewActive;
    updateState({ isCoFViewActive: newState });
    
    // Update button text and visualization content
    const cardElement = dom.cardCof;

    if (newState) {
        cardElement.innerHTML = `<span class=\"card-name\">Active</span>`;
        buttonElement.textContent = 'Hide CoF';
    } else {
        cardElement.innerHTML = `?`;
        buttonElement.textContent = 'View CoF';
    }

    updateFretboards(); // This triggers updateCofFretboards
    updateDrawnValuesDisplay();
}

export function clearScale() {
    resetAllState();

    dom.card2.innerHTML = '?';
    [dom.card1, dom.die3, dom.card3, dom.card4, dom.card5, dom.card7, dom.card8, dom.card9, dom.card10, dom.card11, dom.card12, dom.card13, dom.cardChord2, dom.cardInterval2, dom.cardTriad2, dom.cardTetrad2, dom.cardPentad2, dom.card6, dom.cardCof].forEach(el => {
        if (el.classList.contains('die')) el.textContent = '?';
        else el.innerHTML = '?';
    });
    
    updateState({ isCoFViewActive: false }); // Reset CoF state
    dom.drawButtonCof.textContent = 'View CoF'; // Reset button text

    dom.clearScaleButton.style.display = 'none';
    dom.toggleStartFretFilterButton.textContent = 'Apply Start Fret Filter (Off)'; // Reset filter button text
    
    updateTransposeFilterButtonText(); // Reset transpose filter button text

    updateDependentElements();
    updateFretboards();
    updateDrawnValuesDisplay();
}

export async function redrawDependentOnScale() {
    [
        dom.rollButton3, 
        dom.drawButton1, dom.drawButton3, dom.drawButton4, dom.drawButton5, 
        dom.drawButton7, dom.drawButton8, dom.drawButton9, dom.drawButton12,
        dom.drawButtonChord2, dom.drawButtonInterval2, dom.drawButtonTriad2, 
        dom.drawButtonTetrad2, dom.drawButtonPentad2,
        dom.drawButtonCof // Redraw CoF dependent on scale
    ].forEach(b => b.click());
}


export async function drawAll() {
    dom.drawAllButton.disabled = true;

    clearScale();
    await delay(100); 

    dom.rollButton2.click(); // Chromatic Key
    [dom.rollButton4, dom.rollButton5, dom.drawButton6, dom.drawButton10, dom.drawButton11, dom.drawButton13].forEach(b => b.click());

    await delay(500); 

    dom.drawButton2.click(); // Scale
    await delay(500);

    redrawDependentOnScale();

    await delay(500);

    dom.drawAllButton.disabled = false;
}