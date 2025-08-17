<!-- WaveformIcon.vue -->
<template>
    <svg
        class="w-8 h-8 text-black"
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
        stroke-width="6"
        stroke-linejoin="round"
    >
        <polyline :points="waveforms[type]" />
    </svg>
</template>

<script setup>
defineProps({
    type: {
        type: String,
        required: true,
        validator: val =>
            ['trapezoid', 'step', 'triangle', 'gate'].includes(val),
    },
});

const waveforms = {
    trapezoid: '0,100 0,60 25,20 75,20 100,60 100,100', // tails + trapezoid
    step: '0,100 0,40 50,40 50,70 100,70 100,100', // tails + step
    triangle: '0,100 0,30 50,80 100,30 100,100', // tails + triangle
    gate: '0,100 0,30 100,30 100,100', // tails + gate block
};
</script>
