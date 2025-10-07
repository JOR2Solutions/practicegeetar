import { INTERVAL_SEMITONES } from './data.js';

export function calculateTransposition(transpositionValue) {
    if (!transpositionValue || typeof transpositionValue !== 'string') return 0;

    const parts = transpositionValue.split(' ');
    if (parts.length !== 2) return 0;

    const [direction, intervalName] = parts;
    const semitones = INTERVAL_SEMITONES[intervalName];

    if (semitones === undefined) return 0;

    let transposition = 0;
    if (direction.toLowerCase() === 'up') {
        transposition = semitones;
    } else if (direction.toLowerCase() === 'down') {
        // Transposing down X semitones is equivalent to transposing up (12 - X) semitones mod 12
        transposition = (12 - semitones) % 12;
    }

    return transposition;
}

export async function animate(element, animationClass, duration) {
    element.classList.add(animationClass);
    await delay(duration);
    element.classList.remove(animationClass);
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getCardDisplayValue(cardElement, defaultValue = '?') {
    const nameSpan = cardElement.querySelector('.card-name');
    const intervalsSpan = cardElement.querySelector('.card-intervals');
    const chordsSpan = cardElement.querySelector('.card-chords');
    if (nameSpan) {
        let value = nameSpan.textContent;
        if (intervalsSpan) value += ` (${intervalsSpan.textContent})`;
        if (chordsSpan) value += ` (${chordsSpan.textContent})`;
        return value.trim();
    }
    return cardElement.textContent.trim() || defaultValue;
}