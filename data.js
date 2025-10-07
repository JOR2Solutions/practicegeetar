export const faces1 = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const faces2 = ['C', 'C# / Db', 'D', 'D# / Eb', 'E', 'F', 'F# / Gb', 'G', 'G# / Ab', 'A', 'A# / Bb', 'B'];
export const faces3 = ['R', 'm2', 'M2', 'm3', 'M3', 'P4', 'b5', 'P5', 'm6', 'M6', 'm7', 'M7'];
export const faces4 = Array.from({length: 16}, (_, i) => i + 1);
export const startFrets = Array.from({length: 13}, (_, i) => i);

export const chords = [
    { name: 'Major', intervals: 'R, M3, P5' },
    { name: 'Minor', intervals: 'R, m3, P5' },
    { name: 'Diminished', intervals: 'R, m3, b5' },
    { name: 'Augmented', intervals: 'R, M3, #5' },
    { name: 'Major 7th', intervals: 'R, M3, P5, M7' },
    { name: 'Minor 7th', intervals: 'R, m3, P5, m7' },
    { name: 'Dominant 7th', intervals: 'R, M3, P5, m7' },
    { name: 'Diminished 7th', intervals: 'R, m3, b5, bb7' },
    { name: 'Half-diminished 7th', intervals: 'R, m3, b5, m7' },
    { name: 'Major 6th', intervals: 'R, M3, P5, M6' },
    { name: 'Minor 6th', intervals: 'R, m3, P5, M6' },
    { name: 'Suspended 2nd', intervals: 'R, M2, P5' },
    { name: 'Suspended 4th', intervals: 'R, P4, P5' },
    { name: 'Dominant 7th sus 4th', intervals: 'R, P4, P5, m7' },
    { name: 'Dominant 9th', intervals: 'R, M3, P5, m7, M9' },
    { name: 'Major 9th', intervals: 'R, M3, P5, M7, M9' },
    { name: 'Minor 9th', intervals: 'R, m3, P5, m7, M9' },
    { name: 'Add 9', intervals: 'R, M3, P5, M9' },
    { name: 'Minor-Major 7th', intervals: 'R, m3, P5, M7' },
    { name: 'Dominant 11th', intervals: 'R, M3, P5, m7, P11' },
    { name: 'Major 11th', intervals: 'R, M3, P5, M7, P11' },
    { name: 'Minor 11th', intervals: 'R, m3, P5, m7, P11' },
    { name: 'Dominant 13th', intervals: 'R, M3, P5, m7, M13' },
    { name: 'Major 13th', intervals: 'R, M3, P5, M7, M13' },
    { name: 'Minor 13th', intervals: 'R, m3, P5, m7, M13' },
    { name: 'Dominant 7th #9', intervals: 'R, M3, P5, m7, #9' },
    { name: 'Dominant 7th b9', intervals: 'R, M3, P5, m7, b9' },
    { name: 'Dominant 7th #5', intervals: 'R, M3, #5, m7' },
    { name: 'Dominant 7th b5', intervals: 'R, M3, b5, m7' },
    { name: '6/9 Chord', intervals: 'R, M3, P5, M6, M9' },
    { name: 'Power Chord', intervals: 'R, P5' },
    { name: 'Major 7th #11', intervals: 'R, M3, P5, M7, #11' },
    { name: 'Dominant 7th b13', intervals: 'R, M3, P5, m7, b13' },
    { name: 'Minor 9th b5', intervals: 'R, m3, b5, m7, M9' },
    { name: 'Augmented 7th', intervals: 'R, M3, #5, m7' }
];
export const scales = [
    { name: 'Major (Ionian)', intervals: 'R, M2, M3, P4, P5, M6, M7' },
    { name: 'Natural Minor (Aeolian)', intervals: 'R, M2, m3, P4, P5, m6, m7' },
    { name: 'Harmonic Minor', intervals: 'R, M2, m3, P4, P5, m6, M7' },
    { name: 'Melodic Minor', intervals: 'R, M2, m3, P4, P5, M6, M7' },
    { name: 'Dorian', intervals: 'R, M2, m3, P4, P5, M6, m7' },
    { name: 'Phrygian', intervals: 'R, m2, m3, P4, P5, m6, m7' },
    { name: 'Lydian', intervals: 'R, M2, M3, #4, P5, M6, M7' },
    { name: 'Mixolydian', intervals: 'R, M2, M3, P4, P5, M6, m7' },
    { name: 'Locrian', intervals: 'R, m2, m3, P4, b5, m6, m7' },
    { name: 'Major Pentatonic', intervals: 'R, M2, M3, P5, M6' },
    { name: 'Minor Pentatonic', intervals: 'R, m3, P4, P5, m7' },
    { name: 'Blues', intervals: 'R, m3, P4, b5, P5, m7' },
    { name: 'Whole Tone', intervals: 'R, M2, M3, #4, #5, #6' },
    { name: 'Chromatic', intervals: 'All 12 notes' },
    { name: 'Octatonic (W-H)', intervals: 'R, M2, m3, P4, b5, m6, M6, m7' },
    { name: 'Octatonic (H-W)', intervals: 'R, m2, m3, M3, b5, P5, M6, m7' },
    { name: 'Lydian Dominant', intervals: 'R, M2, M3, #4, P5, M6, m7' },
    { name: 'Phrygian Dominant', intervals: 'R, m2, M3, P4, P5, m6, m7' },
    { name: 'Altered (Super Locrian)', intervals: 'R, b2, b3, b4, b5, b6, b7' },
    { name: 'Hungarian Minor', intervals: 'R, M2, m3, #4, P5, m6, M7' },
    { name: 'Neapolitan Major', intervals: 'R, m2, m3, P4, P5, M6, M7' },
    { name: 'Neapolitan Minor', intervals: 'R, m2, m3, P4, P5, m6, M7' },
    { name: 'Enigmatic', intervals: 'R, m2, M3, #4, #5, #6, M7' },
    { name: 'Double Harmonic Major', intervals: 'R, m2, M3, P4, P5, m6, M7' },
    { name: 'Persian', intervals: 'R, m2, M3, P4, b5, m6, M7' },
    { name: 'Byzantine', intervals: 'R, m2, M3, P4, P5, m6, M7' },
    { name: 'Hirajoshi', intervals: 'R, M2, m3, P5, m6' },
    { name: 'Insen', intervals: 'R, m2, P4, P5, m7' },
    { name: 'Iwato', intervals: 'R, m2, P4, b5, m7' },
    { name: 'Kumoi', intervals: 'R, M2, m3, P5, M6' },
    { name: 'Yo', intervals: 'R, M2, P4, P5, M6' },
    { name: 'Pelog', intervals: 'R, m2, m3, P5, m6' },
    { name: 'Lydian Augmented', intervals: 'R, M2, M3, #4, #5, M6, M7' },
    { name: 'Ionian Augmented', intervals: 'R, M2, M3, P4, #5, M6, M7' },
    { name: 'Mixolydian b6', intervals: 'R, M2, M3, P4, P5, m6, m7' },
    { name: 'Aeolian Dominant', intervals: 'R, M2, M3, P4, P5, m6, m7' },
    { name: 'Locrian #2', intervals: 'R, M2, m3, P4, b5, m6, m7' },
    { name: 'Mixolydian #11', intervals: 'R, M2, M3, #4, P5, M6, m7' },
    { name: 'Lydian b7', intervals: 'R, M2, M3, #4, P5, M6, m7' },
    { name: 'Dorian #4', intervals: 'R, M2, m3, #4, P5, M6, m7' },
    { name: 'Phrygian #6', intervals: 'R, m2, m3, P4, P5, M6, m7' },
    { name: 'Bebop Dominant', intervals: 'R, M2, M3, P4, P5, M6, m7, M7' },
    { name: 'Bebop Major', intervals: 'R, M2, M3, P4, P5, m6, M6, M7' },
    { name: 'Bebop Minor (Dorian)', intervals: 'R, M2, m3, M3, P4, P5, M6, m7' },
    { name: 'Bebop Minor (Melodic)', intervals: 'R, M2, m3, P4, P5, M6, m7, M7' },
    { name: 'Nine-Tone Scale', intervals: 'R, M2, m3, M3, P4, P5, m6, M6, M7' },
    { name: 'Prometheus', intervals: 'R, M2, M3, #4, M6, m7' },
    { name: 'Tristan', intervals: 'R, m3, #4, M6, m7' },
    { name: 'Ukrainian Dorian', intervals: 'R, M2, m3, #4, P5, M6, m7' },
    { name: 'Spanish 8-tone', intervals: 'R, m2, m3, M3, P4, b5, m6, m7' },
    { name: 'Algerian', intervals: 'R, M2, m3, #4, P5, m6, M7' },
    { name: 'Arabic', intervals: 'R, M2, M3, P4, P5, m6, m7' },
    { name: 'Gypsy', intervals: 'R, m2, M3, P4, P5, m6, M7' },
    { name: 'Hawaiian', intervals: 'R, M2, m3, P4, P5, M6, M7' },
    { name: 'Hindu', intervals: 'R, M2, M3, P4, P5, m6, m7' },
    { name: 'Japanese (A)', intervals: 'R, M2, P4, P5, m7' },
    { name: 'Japanese (B)', intervals: 'R, m2, P4, P5, m6' },
    { name: 'Jewish (Adonai Malakh)', intervals: 'R, M2, M3, #4, P5, M6, M7' },
    { name: 'Oriental', intervals: 'R, m2, M3, P4, b5, M6, m7' },
    { name: 'Romanian Minor', intervals: 'R, M2, m3, #4, P5, M6, m7' },
    { name: 'Russian Minor', intervals: 'R, M2, m3, P4, P5, m6, M7' },
    { name: 'Balinese', intervals: 'R, m2, m3, P5, m6' },
    { name: 'Egyptian', intervals: 'R, M2, P4, P5, m7' },
    { name: 'Eight Tone Spanish', intervals: 'R, m2, m3, M3, P4, b5, m6, m7' },
    { name: 'Ethiopian', intervals: 'R, M2, m3, P4, P5, m6, m7' },
    { name: 'Gong', intervals: 'R, M2, M3, P5, M6' },
    { name: 'Javanese', intervals: 'R, M2, M3, P4, P5, M6, m7' },
    { name: 'Leading Whole Tone', intervals: 'R, M2, M3, #4, #5, #6, m7' },
    { name: 'Mongolian', intervals: 'R, M2, M3, P5, M6' },
    { name: 'Scriabin', intervals: 'R, m2, M3, P5, M6' }
];

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const CIRCLE_OF_FIFTHS = [
    'C', 'G', 'D', 'A', 'E', 'B', 
    'F# / Gb', 'C# / Db', 'G# / Ab', 'D# / Eb', 'A# / Bb', 'F'
];

export const INTERVAL_SEMITONES = {
    'R': 0,
    'm2': 1, 'b2': 1,
    'M2': 2, '2': 2,
    'm3': 3, 'b3': 3,
    'M3': 4, '3': 4,
    'P4': 5, '4': 5,
    '#4': 6,
    'b5': 6,
    'P5': 7, '5': 7,
    '#5': 8,
    'm6': 8, 'b6': 8,
    'M6': 9, '6': 9,
    '#6': 10,
    'bb7': 9,
    'm7': 10, 'b7': 10,
    'M7': 11, '7': 11,
    'P8': 12,
    'b9': 1,
    '9': 2,
    '#9': 3,
    '11': 5,
    '#11': 6,
    'b13': 8,
    '13': 9
};

export const melodicPatterns = [
    // 3-note patterns
    '1-2-3', '3-2-1', '1-3-2', '2-1-3', '2-3-1', '3-1-2', // Diatonic steps
    '1-3-5', '5-3-1', '1-5-3', '3-1-5', '3-5-1', '5-1-3', // Major Arpeggio
    '1-b3-5', '5-b3-1', // Minor Arpeggio
    '1-2-4', '1-4-2', '1-3-4', '4-3-1', '2-3-5', '5-3-2',
    '1-2-5', '5-2-1',

    // 4-note patterns
    '1-2-3-4', '4-3-2-1', '1-3-2-4', '4-2-3-1', '1-2-4-3', '3-4-2-1',
    '1-3-5-7', '7-5-3-1', // Maj7 Arpeggio
    '1-b3-5-b7', 'b7-5-b3-1', // min7 Arpeggio
    '1-3-5-b7', 'b7-5-3-1', // Dom7 Arpeggio
    '1-b3-b5-bb7', 'bb7-b5-b3-1', // Dim7 Arpeggio
    '1-2-3-5', '5-3-2-1', '1-2-4-5', '5-4-2-1', '1-3-4-5', '5-4-3-1',
    '1-3-4-6', '6-4-3-1',

    // 5-note patterns
    '1-2-3-4-5', '5-4-3-2-1',
    '1-3-5-7-9', '9-7-5-3-1', // Maj9 Arpeggio
    '1-b3-5-b7-9', '9-b7-5-b3-1', // min9 Arpeggio
    '1-2-3-2-1', '1-3-2-4-3', '1-2-4-3-5', '5-3-4-2-1', '1-3-2-5-4'
];

const transposeIntervals = ['m2', 'M2', 'm3', 'M3', 'P4', 'b5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];
export const transposeCards = [];
transposeIntervals.forEach(interval => {
    transposeCards.push(`Up ${interval}`);
    transposeCards.push(`Down ${interval}`);
});

const triadIntervals = ['m2', 'M2', 'm3', 'M3', 'P4', 'b5', 'P5', 'm6', 'M6', 'm7', 'M7'];
export const triads = [];
for (let i = 0; i < triadIntervals.length; i++) {
    for (let j = i + 1; j < triadIntervals.length; j++) {
        triads.push(`R, ${triadIntervals[i]}, ${triadIntervals[j]}`);
    }
}

const tetradIntervals = ['m2', 'M2', 'm3', 'M3', 'P4', 'b5', 'P5', 'm6', 'M6', 'm7', 'M7'];
export const tetrads = [];
for (let i = 0; i < tetradIntervals.length; i++) {
    for (let j = i + 1; j < tetradIntervals.length; j++) {
        for (let k = j + 1; k < tetradIntervals.length; k++) {
            tetrads.push(`R, ${tetradIntervals[i]}, ${tetradIntervals[j]}, ${tetradIntervals[k]}`);
        }
    }
}

const pentadIntervals = ['m2', 'M2', 'm3', 'M3', 'P4', 'b5', 'P5', 'm6', 'M6', 'm7', 'M7'];
export const pentads = [];
for (let i = 0; i < pentadIntervals.length; i++) {
    for (let j = i + 1; j < pentadIntervals.length; j++) {
        for (let k = j + 1; k < pentadIntervals.length; k++) {
            for (let l = k + 1; l < pentadIntervals.length; l++) {
                pentads.push(`R, ${pentadIntervals[i]}, ${pentadIntervals[j]}, ${pentadIntervals[k]}, ${pentadIntervals[l]}`);
            }
        }
    }
}

const threeNoteMelodicIntervals = ['b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
export const threeNoteMelodicPatterns = [];
for (let i = 0; i < threeNoteMelodicIntervals.length; i++) {
    for (let j = i + 1; j < threeNoteMelodicIntervals.length; j++) {
        threeNoteMelodicPatterns.push(`1, ${threeNoteMelodicIntervals[i]}, ${threeNoteMelodicIntervals[j]}`);
    }
}

const fourNoteMelodicIntervals = ['b2', '2', 'b3', '3', '4', 'b5', '5', '6']; // C(8,3) = 56
export const fourNoteMelodicPatterns = [];
for (let i = 0; i < fourNoteMelodicIntervals.length; i++) {
    for (let j = i + 1; j < fourNoteMelodicIntervals.length; j++) {
        for (let k = j + 1; k < fourNoteMelodicIntervals.length; k++) {
            fourNoteMelodicPatterns.push(`1, ${fourNoteMelodicIntervals[i]}, ${fourNoteMelodicIntervals[j]}, ${fourNoteMelodicIntervals[k]}`);
        }
    }
}

export const chordProgressions = [
    // Diatonic Major
    { progression: 'I-IV-V-I', type: 'major' },
    { progression: 'I-V-vi-IV', type: 'major' },
    { progression: 'ii-V-I', type: 'major' },
    { progression: 'I-vi-IV-V', type: 'major' },
    { progression: 'I-IV-I-V', type: 'major' },
    { progression: 'I-ii-iii-IV-V-vi-vii°', type: 'major' },
    { progression: 'IV-I-V-vi', type: 'major' },
    { progression: 'vi-V-IV-V', type: 'major' },
    { progression: 'I-iii-vi-IV', type: 'major' },
    { progression: 'I-IV-ii-V', type: 'major' },
    
    // Diatonic Minor
    { progression: 'i-iv-v-i', type: 'minor' },
    { progression: 'i-VI-III-VII', type: 'minor' },
    { progression: 'i-iv-VII-III-VI-ii°-V-i', type: 'minor' },
    { progression: 'ii°-V-i', type: 'minor' },
    { progression: 'i-VII-VI-V', type: 'minor' },
    { progression: 'i-VI-iv-v', type: 'minor' },
    { progression: 'iv-v-i', type: 'minor' },
    { progression: 'vi°-i-v-iv', type: 'minor' }, // Using harmonic minor vi°
    { progression: 'i-ii°-V-i', type: 'minor' },
    { progression: 'iv-V-i', type: 'minor' },

    // Modal / Others
    { progression: 'I-bVII-IV-I', type: 'modal' }, // Mixolydian
    { progression: 'i-II-v-i', type: 'modal' }, // Phrygian
    { progression: 'I-II-iii-IV', type: 'modal' }, // Lydian
    { progression: 'i-v-i-iv', type: 'modal' }, // Dorian
    { progression: 'I-IV-bVII-I', type: 'modal' },
    { progression: 'Im-IV-bVII-Im', type: 'modal' },
    { progression: 'I-bIII-IV-bVI', type: 'modal' },
    { progression: 'i-bII-III-bV', type: 'modal' },
    { progression: 'I-V-bVII-IV', type: 'modal' },
    { progression: 'I-bII-I-V', type: 'modal' }, // Phrygian Dominant flavor
    { progression: 'bII-I', type: 'modal' }, // Neapolitan
    { progression: 'bVI-bVII-i', type: 'minor' }, // Minor key cadence
    { progression: 'IV-iv-I', type: 'major' }, // Minor plagal cadence
    { progression: 'I-bVI-I-bVII-I', type: 'modal' },

    // Add more to reach ~55
    { progression: 'I-V-I-IV', type: 'major' },
    { progression: 'vi-IV-I-V', type: 'major' },
    { progression: 'I-IV-V-vi', type: 'major' },
    { progression: 'V-IV-I', type: 'major' },
    { progression: 'IV-V-iii-vi', type: 'major' },
    { progression: 'I-ii-V-I', type: 'major' },
    { progression: 'i-v-VI-iv', type: 'minor' },
    { progression: 'v-iv-i', type: 'minor' },
    { progression: 'VI-VII-i', type: 'minor' },
    { progression: 'i-iv-v-VI', type: 'minor' },
    { progression: 'III-VI-ii-V', type: 'major' }, // Circle of fifths snippet
    { progression: 'I-vi-ii-V', type: 'major' },
    { progression: 'IV-I-ii-V', type: 'major' },
    { progression: 'i-III-VII-VI', type: 'minor' },
    { progression: 'i-v-iv-III', type: 'minor' },
    { progression: 'i-bVI-bIII-bVII', type: 'minor' },
    { progression: 'Im-bVII-bVI-V', type: 'minor' }, // Andalusian Cadence
    { progression: 'I-Imaj7-I7-IV', type: 'other' }, // Line cliche
    { progression: 'I-Iaug-I6-I7', type: 'other' }, // Line cliche
    { progression: 'i-i(maj7)-i7-iv', type: 'other' }, // Minor line cliche
    { progression: 'I-iii-IV-V', type: 'major' },
    { progression: 'ii-vi-V-I', type: 'major' }
];

export const lessons = [
    { name: 'Lesson 1: C Major (Ionian)', root: 'C', scale: 'Major (Ionian)' },
    { name: 'Lesson 2: D Dorian', root: 'D', scale: 'Dorian' },
    { name: 'Lesson 3: E Phrygian', root: 'E', scale: 'Phrygian' },
    { name: 'Lesson 4: F Lydian', root: 'F', scale: 'Lydian' },
    { name: 'Lesson 5: G Mixolydian', root: 'G', scale: 'Mixolydian' },
    { name: 'Lesson 6: A Natural Minor (Aeolian)', root: 'A', scale: 'Natural Minor (Aeolian)' },
    { name: 'Lesson 7: B Locrian', root: 'B', scale: 'Locrian' },
];

export const twoStringSets = [
    '6 & 5', '5 & 4', '4 & 3', '3 & 2', '2 & 1', // Adjacent
    '6 & 4', '5 & 3', '4 & 2', '3 & 1',         // Skip 1
    '6 & 3', '5 & 2', '4 & 1',                 // Skip 2
    '6 & 2', '5 & 1',                         // Skip 3
    '6 & 1',                                 // Skip 4
    // Duplicates to make 20
    '6 & 5', '5 & 4', '4 & 3', '3 & 2', '2 & 1'
];

export const threeStringSets = [
    '6 & 5 & 4', '6 & 5 & 3', '6 & 5 & 2', '6 & 5 & 1',
    '6 & 4 & 3', '6 & 4 & 2', '6 & 4 & 1',
    '6 & 3 & 2', '6 & 3 & 1',
    '6 & 2 & 1',
    '5 & 4 & 3', '5 & 4 & 2', '5 & 4 & 1',
    '5 & 3 & 2', '5 & 3 & 1',
    '5 & 2 & 1',
    '4 & 3 & 2', '4 & 3 & 1',
    '4 & 2 & 1',
    '3 & 2 & 1'
];

export const fourStringSets = [
    '6 & 5 & 4 & 3', '6 & 5 & 4 & 2', '6 & 5 & 4 & 1', '6 & 5 & 3 & 2', '6 & 5 & 3 & 1', 
    '6 & 5 & 2 & 1', '6 & 4 & 3 & 2', '6 & 4 & 3 & 1', '6 & 4 & 2 & 1', '6 & 3 & 2 & 1', 
    '5 & 4 & 3 & 2', '5 & 4 & 3 & 1', '5 & 4 & 2 & 1', '5 & 3 & 2 & 1', '4 & 3 & 2 & 1',
    // Repeats to reach 20
    '6 & 5 & 4 & 3', '5 & 4 & 3 & 2', '4 & 3 & 2 & 1', '6 & 5 & 3 & 2', '5 & 4 & 3 & 1'
];

export function getNoteFromIndex(index) {
    return NOTES[index % 12];
}

export function getNoteIndex(note) {
    // Handle flats by converting to sharps
    const noteMap = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    const normalizedNote = noteMap[note] || note;
    return NOTES.indexOf(normalizedNote);
}