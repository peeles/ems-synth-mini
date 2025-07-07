<template>
    <div class="absolute" :style="{ top: '150px', left: '560px' }">
        <h3 class="text-md font-bold mb-2">Mixer</h3>
        <div class="mb-2">
            <label class="block text-sm">Osc Level: {{ vcoLevel }}</label>
            <input type="range" min="0" max="1" step="0.01"
                   v-model.number="vcoLevel"
                   @input="updateLevels"
                   class="w-full accent-teal-500" />
        </div>
        <div class="mb-2">
            <label class="block text-sm">Noise Level: {{ noiseLevel }}</label>
            <input type="range" min="0" max="1" step="0.01"
                   v-model.number="noiseLevel"
                   @input="updateLevels"
                   class="w-full accent-teal-500" />
        </div>
        <div class="mb-2">
            <label class="block text-sm">Tone: {{ tone.toFixed(2) }}</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="tone"
                @input="updateTone"
                class="w-full accent-orange-500"
            />
        </div>
    </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue';
import { useSynthStore } from '../../storage/synthStore';


const synth = useSynthStore();

const vcoLevel = computed({
    get: () => synth.vcoLevel,
    set: (val) => synth.setMixerLevels(val, synth.noiseLevel)
});
const noiseLevel = computed({
    get: () => synth.noiseLevel,
    set: (val) => synth.setMixerLevels(synth.vcoLevel, val)
});
// A simple tone control implemented by slightly adjusting filter cutoff around a base value
const tone = ref(0.5);  // 0 = mellow (low cutoff), 1 = bright (high cutoff)
const baseCutoff = synth.filterCutoff; // base cutoff from store

const updateLevels = () => {
    synth.setMixerLevels(vcoLevel.value, noiseLevel.value);
};
const updateTone = () => {
    // Map tone 0-1 to a cutoff factor (e.g., 0 -> -1 octave, 1 -> +1 octave relative base)
    const factor = tone.value;
    const newCutoff = baseCutoff * (0.5 + factor);  // just an example scaling
    synth.setFilterCutoff(newCutoff);
};
</script>
