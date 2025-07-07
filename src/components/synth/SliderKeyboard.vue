<template>
    <div class="absolute flex flex-col items-center"
         :style="{ left: '100px', bottom: '20px', width: '600px' }">
        <h3 class="text-md font-bold mb-2">Slider Keyboard</h3>
        <!-- Horizontal slider to choose pitch -->
        <input type="range" min="0" max="100" step="1" class="w-full accent-red-600"
               v-model.number="position"
               @change="playNote" />
        <!-- Optionally, display the frequency or note name -->
        <div class="mt-1 text-sm">Frequency: {{ currentFrequency.toFixed(1) }} Hz</div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useSynthStore } from '../../storage/synthStore';
const synth = useSynthStore();

// 'position' represents the keyboard slider value (0-100)
const position = ref(50);
const currentFrequency = computed(() => {
    // Map the slider position to a frequency range for the VCO.
    // For example, 0 -> 200 Hz, 100 -> 800 Hz (just as a demo scale).
    const minFreq = 200;
    const maxFreq = 800;
    return minFreq + (maxFreq - minFreq) * (position.value / 100);
});

// When the slider is released (change event), set the VCO frequency and trigger envelope
const playNote = () => {
    // Update oscillator frequency based on slider position
    synth.setVcoFrequency(currentFrequency.value);
    // Trigger the envelope for a new note
    synth.triggerEnvelope();
};
</script>
