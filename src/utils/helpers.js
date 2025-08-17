export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}
