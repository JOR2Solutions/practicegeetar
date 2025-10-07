import * as dom from './dom.js';
import { getState, updateState } from './state.js';
import { INTERACTIVE_CONFIG } from './config.js';
import { melodicPatterns, chordProgressions, chords, scales, INTERVAL_SEMITONES, getNoteIndex, getNoteFromIndex } from './data.js';
import { updateFretboards, updateDependentElements } from './fretboard.js';
import { getCardDisplayValue } from './utils.js';
import { redrawDependentOnScale } from './actions.js';
import { updateTransposeFilterButtonText } from './script.js';

function getScaleNotes(rootNote, scaleIntervals) {
    const rootIndex = getNoteIndex(rootNote);
    if (rootIndex === -1 || !scaleIntervals) return [];

    return scaleIntervals.map(interval => {
        const semitones = INTERVAL_SEMITONES[interval];
        if (semitones === undefined) return null;
        return getNoteFromIndex(rootIndex + semitones);
    }).filter(Boolean);
}

export function getChordNamesForProgression(progression) {
    const { currentRootNote, currentScaleIntervals, currentScaleType } = getState();
    if (!currentRootNote || !currentScaleIntervals || !progression) return '';

    const scaleNotes = getScaleNotes(currentRootNote, currentScaleIntervals);
    if (scaleNotes.length < 7) return ''; // Need a diatonic scale at least

    const romanNumerals = progression.split('-');

    // Diatonic chord qualities for major and minor scales
    const qualities = {
        major: ['maj', 'm', 'm', 'maj', 'maj', 'm', 'dim'],
        minor: ['m', 'dim', 'maj', 'm', 'm', 'maj', 'maj'],
        modal: ['maj', 'm', 'm', 'maj', 'maj', 'm', 'dim'], // Default to major-like qualities for modal
    };
    const scaleQualities = qualities[currentScaleType] || qualities.modal;

    const chordNames = romanNumerals.map(roman => {
        let rootOffset = 0; // for bVII etc.
        let romanClean = roman;
        
        if (roman.startsWith('b')) {
            rootOffset = -1;
            romanClean = roman.substring(1);
        } else if (roman.startsWith('#')) {
            rootOffset = 1;
            romanClean = roman.substring(1);
        }
        
        const degreeMap = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7};
        const degree = degreeMap[romanClean.toUpperCase().replace(/[^IVX]/g, '')];

        if (!degree) return roman; // Cannot parse

        const rootNoteIndex = (getNoteIndex(scaleNotes[degree - 1]) + rootOffset + 12) % 12;
        const chordRoot = getNoteFromIndex(rootNoteIndex);

        let quality = '';
        if (roman.includes('°') || roman.includes('dim')) quality = 'dim';
        else if (roman.includes('+') || roman.includes('aug')) quality = 'aug';
        else if (roman === roman.toLowerCase()) quality = 'm';

        if(!quality) {
            quality = scaleQualities[degree-1];
        }

        if (quality === 'maj') return chordRoot;
        return chordRoot + quality;
    });

    return chordNames.join(' - ');
}

function updateStateFromDropdown(label, rawValue) {
    let newState = {};
    let scaleChanged = false;

    if (label === 'Scale') {
        const result = scales.find(s => s.name === rawValue);
        if (!result) return;

        const intervals = result.intervals.split(', ').map(s => s.trim());
        if(result.intervals === 'All 12 notes') newState.currentScaleIntervals = [result.intervals];
        else if (!intervals.includes('R')) newState.currentScaleIntervals = ['R', ...intervals];
        else newState.currentScaleIntervals = intervals;

        newState.currentScaleType = result.name.toLowerCase().includes('minor') ? 'minor' : result.name.toLowerCase().includes('major') ? 'major' : 'modal';

        dom.card2.innerHTML = `<span class="card-name">${result.name}</span><span class="card-intervals">${result.intervals}</span>`;
        dom.clearScaleButton.style.display = 'block';
        updateState(newState);
        updateDependentElements();
        scaleChanged = true;
    } else {
        const simpleMappings = {
            'Key (Diatonic)': 'currentRootNote', 'Key (Chromatic)': 'currentRootNote',
            'Interval': 'currentInterval', 'Interval 2': 'currentInterval2',
            'Triad': 'currentTriadIntervals', 'Triad 2': 'currentTriadIntervals2',
            'Tetrad': 'currentTetradIntervals', 'Tetrad 2': 'currentTetradIntervals2',
            'Pentad': 'currentPentadIntervals', 'Pentad 2': 'currentPentadIntervals2',
            '2-String Set': 'currentTwoStringSet', '3-String Set': 'currentThreeStringSet',
            '4-String Set': 'currentFourStringSet'
        };

        if (simpleMappings[label]) {
            let valueToSet = rawValue.split(' ')[0];
            if (label.includes('Triad') || label.includes('Tetrad') || label.includes('Pentad')) {
                valueToSet = rawValue.split(', ').map(s => s.trim());
                if (!valueToSet.includes('R')) valueToSet.unshift('R');
            } else if (label.includes('String Set')) {
                valueToSet = rawValue;
            }
            newState[simpleMappings[label]] = valueToSet;
        } else if (label === 'Chord') {
            const result = chords.find(c => c.name === rawValue);
            if (!result) return;
            const intervals = result.intervals.split(', ').map(s => s.trim());
            if (!intervals.includes('R')) intervals.unshift('R');
            if(label === 'Chord') newState.currentChordIntervals = intervals;
            if(label === 'Chord 2') newState.currentChordIntervals2 = intervals;
            const cardElement = label === 'Chord' ? dom.card1 : dom.cardChord2;
            cardElement.innerHTML = `<span class="card-name">${result.name}</span><span class="card-intervals">${result.intervals}</span>`;
        } else if (label === 'Transpose') {
            newState.currentTranspositionValue = rawValue;
            dom.card6.innerHTML = `<span class="card-name">${rawValue}</span>`; // Update card appearance
        } else {
            const config = {
                'Measures': dom.die4, 'Start Fret': dom.die5, 'Transpose': dom.card6,
                'Melodic (Assorted)': dom.card7, 'Melodic (3-Note)': dom.card8,
                'Melodic (4-Note)': dom.card9, 'Progression': dom.card12
            };
            if(config[label]) {
                let displayValue = rawValue;
                if (label === 'Progression') {
                     const result = chordProgressions.find(p => p.progression === rawValue);
                     if (result) {
                        const chordNames = getChordNamesForProgression(result.progression);
                        config[label].innerHTML = `<span class="card-name">${result.progression}</span>` + (chordNames ? `<span class="card-chords">${chordNames}</span>` : '');
                     }
                } else {
                    config[label].innerHTML = `<span class="card-name">${displayValue}</span>`;
                }
            }
        }
    }
    updateState(newState);

    if (label === 'Transpose') { 
        updateTransposeFilterButtonText(); // Update button text after state change
    }
    
    if (label === 'Key (Diatonic)' || label === 'Key (Chromatic)' || label === 'Scale') {
        const progressionCardText = getCardDisplayValue(dom.card12, '?');
        if (progressionCardText !== '?' && progressionCardText !== 'N/A') {
            const progressionRoman = progressionCardText.split(' (')[0];
            const progression = chordProgressions.find(p => p.progression === progressionRoman);
            if (progression) {
                const chordNames = getChordNamesForProgression(progression.progression);
                dom.card12.innerHTML = `<span class="card-name">${progression.progression}</span>` + (chordNames ? `<span class="card-chords">${chordNames}</span>` : '');
            }
        }
    }

    updateFretboards();
    updateDrawnValuesDisplay();

    if (scaleChanged) {
        redrawDependentOnScale();
    }
}

export function updateDrawnValuesDisplay() {
    const state = getState();
    const values = [
        { label: 'Key (Diatonic)', value: dom.die1.textContent.trim() },
        { label: 'Key (Chromatic)', value: state.currentRootNote || dom.die2.textContent.trim() },
        { label: 'Interval', value: state.currentInterval || dom.die3.textContent.trim() },
        { label: 'Interval 2', value: state.currentInterval2 || getCardDisplayValue(dom.cardInterval2) },
        { label: 'Measures', value: dom.die4.textContent.trim() },
        { label: 'Start Fret', value: dom.die5.textContent.trim() },
        { label: 'Scale', value: getCardDisplayValue(dom.card2) },
        { label: 'Chord', value: getCardDisplayValue(dom.card1) },
        { label: 'Chord 2', value: getCardDisplayValue(dom.cardChord2) },
        { label: 'Triad', value: getCardDisplayValue(dom.card3) },
        { label: 'Triad 2', value: getCardDisplayValue(dom.cardTriad2) },
        { label: 'Tetrad', value: getCardDisplayValue(dom.card4) },
        { label: 'Tetrad 2', value: getCardDisplayValue(dom.cardTetrad2) },
        { label: 'Pentad', value: getCardDisplayValue(dom.card5) },
        { label: 'Pentad 2', value: getCardDisplayValue(dom.cardPentad2) },
        { label: 'Transpose', value: getCardDisplayValue(dom.card6) },
        { label: 'Melodic (Assorted)', value: getCardDisplayValue(dom.card7) },
        { label: 'Melodic (3-Note)', value: getCardDisplayValue(dom.card8) },
        { label: 'Melodic (4-Note)', value: getCardDisplayValue(dom.card9) },
        { label: '2-String Set', value: state.currentTwoStringSet || getCardDisplayValue(dom.card10) },
        { label: '3-String Set', value: state.currentThreeStringSet || getCardDisplayValue(dom.card11) },
        { label: '4-String Set', value: state.currentFourStringSet || getCardDisplayValue(dom.card13) },
        { label: 'Progression', value: getCardDisplayValue(dom.card12) },
        { label: 'Circle of Fifths', value: state.isCoFViewActive ? getCardDisplayValue(dom.card2) + ' (Active)' : getCardDisplayValue(dom.cardCof) },
    ];

    // 1. Preserve current class state (including 'collapsed')
    const wasCollapsed = dom.drawnValuesSummary.classList.contains('collapsed');

    // 2. Generate new HTML structure
    dom.drawnValuesSummary.innerHTML = `
        <h2 id="summary-header">
            Values Summary
            <span id="summary-toggle-icon" class="summary-toggle-icon">${wasCollapsed ? '&#9654;' : '&#9660;'}</span>
        </h2>
        <div class="summary-content">
            <div class="drawn-value-row"></div>
        </div>
    `;

    // 3. Reapply the 'collapsed' state
    if (wasCollapsed) {
        dom.drawnValuesSummary.classList.add('collapsed');
    } else {
        dom.drawnValuesSummary.classList.remove('collapsed');
    }

    // 4. Add event listener to the dynamically created header
    const summaryHeader = dom.drawnValuesSummary.querySelector('#summary-header');
    if (summaryHeader) {
        summaryHeader.addEventListener('click', toggleSummaryCollapse);
    }
    
    const row = dom.drawnValuesSummary.querySelector('.drawn-value-row');

    values.forEach(item => {
        const displayValue = (item.value === '?' || item.value === 'X' || item.value === '') ? 'N/A' : item.value;
        const isEmpty = displayValue === 'N/A';
        
        let rawValueForSelection = displayValue.split(' (')[0];

        const div = document.createElement('div');
        div.className = `drawn-value-item ${isEmpty ? 'empty' : ''}`;

        // Add a highlight class for specific items
        if (item.label === 'Key (Chromatic)' || item.label === 'Scale') {
            div.classList.add('highlighted');
        }

        div.dataset.label = item.label;
        div.dataset.currentValue = rawValueForSelection === 'N/A' ? '' : rawValueForSelection;
        div.innerHTML = `<strong>${item.label}:</strong> ${displayValue}`;
        
        div.addEventListener('click', handleSummaryClick);
        row.appendChild(div);
    });
}

function toggleSummaryCollapse() {
    dom.drawnValuesSummary.classList.toggle('collapsed');
    const isCollapsed = dom.drawnValuesSummary.classList.contains('collapsed');
    const icon = dom.drawnValuesSummary.querySelector('#summary-toggle-icon');
    if (icon) {
        // &#9654; Black Right-Pointing Triangle (Collapsed)
        // &#9660; Black Down-Pointing Small Triangle (Expanded)
        icon.innerHTML = isCollapsed ? '&#9654;' : '&#9660;';
    }
}

function handleSummaryClick(event) {
    let target = event.target.closest('.drawn-value-item');
    if (!target) return;

    const label = target.dataset.label;
    const config = INTERACTIVE_CONFIG[label];
    if (!config) return;

    const { currentScaleIntervals, currentScaleType } = getState();
    if (config.requiresScale && !currentScaleIntervals) {
        alert(`Cannot manually select ${label} without first drawing a Scale.`);
        return;
    }

    if (label === 'Circle of Fifths') {
        alert('Use the "View CoF" button below the fretboard area to toggle this visualization.');
        return;
    }

    dom.dropdownTitle.textContent = `Select value for: ${label}`;
    dom.dropdownList.innerHTML = '';
    let deck = config.data;

    if (config.requiresScale && currentScaleIntervals) {
        if (config.type === 'interval') deck = config.data.filter(f => currentScaleIntervals.includes(f));
        else if (config.type === 'chord') deck = chords.filter(item => item.intervals.split(', ').map(s=>s.trim()).every(i => currentScaleIntervals.includes(i) || i === 'R'));
        else if (config.type === 'progression') deck = chordProgressions.filter(p => p.type === currentScaleType || p.type === 'modal' || p.type === 'other');
        else if (['card3', 'card4', 'card5', 'card8', 'card9'].includes(config.id)) deck = deck.filter(item => item.split(', ').map(s=>s.trim()).every(i => currentScaleIntervals.includes(i) || i === 'R' || i === '1'));
        else if (config.id === 'card7') deck = melodicPatterns;
    }
    
    if (deck.length === 0) {
        dom.dropdownList.innerHTML = '<p>No compatible options available for the current scale.</p>';
    } else {
        deck.forEach(item => {
            const displayValue = item.name || item.progression || String(item);
            const rawValue = item.name || item.progression || String(item);

            const itemDiv = document.createElement('div');
            itemDiv.className = 'dropdown-item';
            itemDiv.innerHTML = displayValue + (item.intervals ? ` <br> <span>(${item.intervals})</span>` : '');
            if (rawValue === target.dataset.currentValue) itemDiv.classList.add('selected');

            itemDiv.addEventListener('click', () => {
                updateStateFromDropdown(label, rawValue);
                closeDropdown();
            });
            dom.dropdownList.appendChild(itemDiv);
        });
    }

    dom.dropdownOverlay.style.display = 'flex';
}

export function closeDropdown() {
    dom.dropdownOverlay.style.display = 'none';
}

export function handleDropdownOverlayClick(e) {
    if (e.target === dom.dropdownOverlay) {
        closeDropdown();
    }
}

export function initSummary() {
    // Set initial collapsed state on load
    // dom.drawnValuesSummary.classList.add('collapsed'); 
    updateDrawnValuesDisplay();
}