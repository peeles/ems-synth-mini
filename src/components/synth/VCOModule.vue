<template>
    <div class="absolute" :style="{ top: '20px', left: '220px' }">
        <!-- VCO Panel UI -->
        <h3 class="text-md font-bold mb-2">VCO (Oscillator)</h3>
        <div class="mb-2">
            <label class="block text-sm">Frequency: {{ vcoFrequency }} Hz</label>
            <input type="range" min="50" max="5000" step="1"
                   v-model.number="vcoFrequency"
                   @input="onFrequencyInput"
                   class="w-full accent-red-500" />
        </div>
        <div class="mb-2">
            <label class="block text-sm">Waveform</label>
            <select v-model="vcoWaveform" @change="onWaveformChange" class="w-full px-2 py-1 rounded">
                <option value="sine">Sine</option>
                <option value="triangle">Triangle</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="square">Square</option>
            </select>
        </div>
    </div>
</template>

<script setup>
import {computed, onUnmounted} from 'vue';
import { useSynthStore } from '../../storage/synthStore';

const synth = useSynthStore();

// Local refs from Pinia store (v-model can bind directly to store state)
const vcoFrequency = computed({
    get: () => synth.vcoFrequency,
    set: (val) => synth.setVcoFrequency(val)
});
const vcoWaveform = computed({
    get: () => synth.vcoWaveform,
    set: (val) => synth.setVcoWaveform(val)
});

// Event handlers (not strictly required if using computed setters above, but added for clarity)
const onFrequencyInput = () => {
    synth.setVcoFrequency(vcoFrequency.value);
};
const onWaveformChange = () => {
    synth.setVcoWaveform(vcoWaveform.value);
};

// If this component were to mount/unmount dynamically, we could handle oscillator lifecycle:
onUnmounted(() => {
    // Stop and disconnect the oscillator if needed to prevent leaks:contentReference[oaicite:6]{index=6}
    // (In static design, oscillator lives for app lifetime via store, so this is precaution)
    // synth.stopOscillator()  // if we had such an action to stop and cleanup
});
</script>
