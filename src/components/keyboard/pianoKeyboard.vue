<template>
    <div class="mx-auto w-full p-4">
        <div
            class="relative rounded-lg border border-neutral-800 bg-neutral-900 px-2 pb-2"
        >
            <div class="relative flex h-40 select-none">
                <template v-for="i in whiteKeyCount" :key="`w-${i}`">
                    <button
                        type="button"
                        class="relative z-0 -ml-px flex-1 rounded-b-md border border-neutral-400/80 bg-gradient-to-b from-white to-neutral-200 first:ml-0 hover:from-white hover:to-neutral-100 active:translate-y-[1px] focus:outline-none"
                        :aria-label="noteLabelFromMidi(whiteMidi(i - 1))"
                        @pointerdown="playNote(whiteMidi(i - 1))"
                    >
                        <span
                            class="pointer-events-none absolute inset-x-0 bottom-1 text-center text-[10px] font-medium text-neutral-500/70"
                        >
                            {{
                                showLabels
                                    ? noteLabelFromMidi(whiteMidi(i - 1))
                                    : ''
                            }}
                        </span>
                    </button>

                    <!-- Black keys that sit after certain whites -->
                    <button
                        v-for="b in blackIndices"
                        :key="`b-${b}`"
                        :aria-label="noteLabelFromMidi(blackMidi(b))"
                        :style="blackButtonStyle(b)"
                        class="absolute top-0 z-20 h-[66%] -translate-x-1/2 rounded-b-md border-b border-neutral-700 bg-neutral-900 hover:bg-neutral-800 active:translate-y-[1px] focus:outline-none"
                        type="button"
                        @pointerdown="playNote(blackMidi(b))"
                    />
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted} from 'vue';
import {midiToFrequency} from '@/utils/helpers';
import {useSynthStore} from '@/storage/synthStore';
import {useMidiInput} from '@/composables/useMidiInput';

const props = defineProps({
    whiteKeys: {
        type: Number,
        default: 32,
    },
    showLabels: {
        type: Boolean,
        default: false,
    },
    baseMidi: {
        type: Number,
        default: 60,
    },
});

const synth = useSynthStore();
const activeKeys = new Set();

const whiteKeyCount = computed(() =>
    Math.min(Math.max(props.whiteKeys, 7), 32)
);

// Which whites have a black key after them (C, D, F, G, A in each octave)
const BLACK_AFTER_WHITE_INDEXES = new Set([0, 1, 3, 4, 5]);

// White-note semitone offsets in an octave (relative to C)
const WHITE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

// Simple names for the original helpers (kept if you still want them)
const WHITE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_NAMES = ['C♯', 'D♯', null, 'F♯', 'G♯', 'A♯', null];

const keyboardMap = {
    a: 60, // C4
    w: 61, // C♯4
    s: 62, // D4
    e: 63, // D♯4
    d: 64, // E4
    f: 65, // F4
    t: 66, // F♯4
    g: 67, // G4
    y: 68, // G♯4
    h: 69, // A4
    u: 70, // A♯4
    j: 71, // B4
    k: 72, // C5
};

const blackIndices = computed(() => {
    const N = whiteKeyCount.value;
    const arr = [];
    for (let i = 0; i < N - 1; i++) {
        if (BLACK_AFTER_WHITE_INDEXES.has(i % 7)) arr.push(i);
    }
    return arr;
});

function whiteMidi(i) {
    // Which octave (0-based from the first white)
    const octave = Math.floor(i / 7);
    // Offset within the octave for the white key
    const semitone = WHITE_SEMITONES[i % 7];
    return props.baseMidi + octave * 12 + semitone;
}

function blackMidi(whiteIndex) {
    // Black key sits immediately after a given white → +1 semitone
    return whiteMidi(whiteIndex) + 1;
}

function whiteName(i) {
    return WHITE_NAMES[i % 7];
}
function blackName(i) {
    return BLACK_NAMES[i % 7] ?? '';
}

function blackButtonStyle(whiteIndex) {
    const N = whiteKeyCount.value;
    const leftPct = ((whiteIndex + 1) * 100) / N;
    const widthPct = (0.62 * 100) / N;
    return {left: `${leftPct}%`, width: `${widthPct}%`};
}

function noteLabelFromMidi(midi) {
    const NAMES = [
        'C',
        'C♯',
        'D',
        'D♯',
        'E',
        'F',
        'F♯',
        'G',
        'G♯',
        'A',
        'A♯',
        'B',
    ];
    const name = NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1; // MIDI standard: 60 = C4
    return `${name}${octave} (${midi})`;
}

function playNote(midi) {
    const freq = midiToFrequency(midi);
    const param = synth.getVCOInputNode();

    if (param && typeof param.setValueAtTime === 'function') {
        const now =
            typeof param.context?.currentTime === 'number'
                ? param.context.currentTime
                : 0;
        param.setValueAtTime(freq, now);
    } else {
        console.warn('VCO input node is not ready or invalid:', param);
    }

    synth.triggerEnvelope();
}

function handleKeyDown(e) {
    const midi = keyboardMap[e.key];
    if (midi !== undefined && !activeKeys.has(e.key)) {
        activeKeys.add(e.key);
        playNote(midi);
    }
}
function handleKeyUp(e) {
    activeKeys.delete(e.key);
}

const {setup: setupMIDI, cleanup: cleanupMIDI} = useMidiInput(note =>
    playNote(note)
);

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    setupMIDI();
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    cleanupMIDI();
});
</script>
