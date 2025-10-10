import * as dom from './dom.js';
import { faces1, faces2, faces3, faces4, startFrets, scales, chords, triads, tetrads, pentads, transposeCards, melodicPatterns, threeNoteMelodicPatterns, fourNoteMelodicPatterns, twoStringSets, threeStringSets, fourStringSets, chordProgressions } from './data.js';

// Fretboard Constants
export const NUM_FRETS = 15;

// Configuration map for attributes for interactive summary
export const INTERACTIVE_CONFIG = {
    'Key (Diatonic)': { id: 'die1', data: faces1, type: 'note', element: dom.die1, updateState: true, noteType: 'diatonic' },
    'Key (Chromatic)': { id: 'die2', data: faces2, type: 'note', element: dom.die2, updateState: true, noteType: 'chromatic' },
    'Interval': { id: 'die3', data: faces3, type: 'interval', element: dom.die3, updateState: true, requiresScale: true },
    'Interval 2': { id: 'card-interval2', data: faces3, type: 'interval', element: dom.cardInterval2, updateState: true, requiresScale: true },
    'Measures': { id: 'die4', data: faces4, type: 'simple', element: dom.die4 },
    'Start Fret': { id: 'die5', data: startFrets, type: 'simple', element: dom.die5 },
    'Scale': { id: 'card2', data: scales, type: 'scale', element: dom.card2, updateState: true },
    'Chord': { id: 'card1', data: chords, type: 'chord', element: dom.card1, updateState: true, requiresScale: true },
    'Chord 2': { id: 'card-chord2', data: chords, type: 'chord', element: dom.cardChord2, updateState: true, requiresScale: true },
    'Triad': { id: 'card3', data: triads, type: 'card', element: dom.card3, updateState: true, requiresScale: true },
    'Triad 2': { id: 'card-triad2', data: triads, type: 'card', element: dom.cardTriad2, updateState: true, requiresScale: true },
    'Tetrad': { id: 'card4', data: tetrads, type: 'card', element: dom.card4, updateState: true, requiresScale: true },
    'Tetrad 2': { id: 'card-tetrad2', data: tetrads, type: 'card', element: dom.cardTetrad2, updateState: true, requiresScale: true },
    'Pentad': { id: 'card5', data: pentads, type: 'card', element: dom.card5, updateState: true, requiresScale: true },
    'Pentad 2': { id: 'card-pentad2', data: pentads, type: 'card', element: dom.cardPentad2, updateState: true, requiresScale: true },
    'Transpose': { id: 'card6', data: transposeCards, type: 'simple', element: dom.card6 },
    'Melodic (Assorted)': { id: 'card7', data: melodicPatterns, type: 'pattern', element: dom.card7, requiresScale: true },
    'Melodic (3-Note)': { id: 'card8', data: threeNoteMelodicPatterns, type: 'card', element: dom.card8, requiresScale: true },
    'Melodic (4-Note)': { id: 'card9', data: fourNoteMelodicPatterns, type: 'card', element: dom.card9, requiresScale: true },
    '2-String Set': { id: 'card10', data: twoStringSets, type: 'stringSet', element: dom.card10, updateState: true, setType: 2 },
    '3-String Set': { id: 'card11', data: threeStringSets, type: 'stringSet', element: dom.card11, updateState: true, setType: 3 },
    '4-String Set': { id: 'card13', data: fourStringSets, type: 'stringSet', element: dom.card13, updateState: true, setType: 4 },
    'Progression': { id: 'card12', data: chordProgressions, type: 'progression', element: dom.card12, requiresScale: true },
};