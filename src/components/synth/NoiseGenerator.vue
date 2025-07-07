<template>
    <div class="absolute" :style="{ top: '150px', left: '420px' }">
        <h3 class="text-md font-bold mb-2">Noise Generator</h3>
        <div class="mb-2">
            <label class="block text-sm">Noise Level: {{ noiseLevel }}</label>
            <input type="range" min="0" max="1" step="0.01"
                   v-model.number="noiseLevel"
                   @input="onLevelChange"
                   class="w-full accent-gray-500" />
        </div>
        <!-- Optionally, choose noise type -->
        <div class="mb-2">
            <label class="block text-sm">Type</label>
            <select v-model="noiseType" class="w-full px-2 py-1 rounded" disabled>
                <option>White</option>
                <!-- <option>Pink</option> could be added if pink noise implemented -->
            </select>
        </div>
    </div>
</template>

<script setup>
import {computed, ref} from "vue";
import { useSynthStore } from '../../storage/synthStore';

const synth = useSynthStore();

const noiseLevel = computed({
    get: () => synth.noiseLevel,
    set: (val) => synth.setMixerLevels(synth.vcoLevel, val)  // update noise part of mixer
});

const noiseType = ref('White');  // Only white noise implemented
const onLevelChange = () => {
    synth.setMixerLevels(synth.vcoLevel, noiseLevel.value);
};
</script>
