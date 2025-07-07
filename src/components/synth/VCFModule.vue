<template>
    <div class="absolute" :style="{ top: '20px', left: '420px' }">
        <h3 class="text-md font-bold mb-2">VCF (Filter)</h3>
        <div class="mb-2">
            <label class="block text-sm">Type</label>
            <select v-model="filterType" @change="onTypeChange" class="w-full px-2 py-1 rounded">
                <option value="lowpass">Low-Pass</option>
                <option value="highpass">High-Pass</option>
                <option value="bandpass">Band-Pass</option>
            </select>
        </div>
        <div class="mb-2">
            <label class="block text-sm">Cutoff: {{ filterCutoff }} Hz</label>
            <input type="range" min="50" max="10000" step="1"
                   v-model.number="filterCutoff"
                   @input="onCutoffChange"
                   class="w-full accent-yellow-500" />
        </div>
        <div class="mb-2">
            <label class="block text-sm">Resonance (Q): {{ filterResonance }}</label>
            <input type="range" min="0.5" max="20" step="0.1"
                   v-model.number="filterResonance"
                   @input="onResonanceChange"
                   class="w-full accent-yellow-500" />
        </div>
    </div>
</template>

<script setup>
import {computed} from "vue";
import { useSynthStore } from '../../storage/synthStore';

const synth = useSynthStore();

const filterType = computed({
    get: () => synth.filterType,
    set: (val) => synth.setFilterType(val)
});
const filterCutoff = computed({
    get: () => synth.filterCutoff,
    set: (val) => synth.setFilterCutoff(val)
});
const filterResonance = computed({
    get: () => synth.filterResonance,
    set: (val) => synth.setFilterResonance(val)
});

const onTypeChange = () => synth.setFilterType(filterType.value);
const onCutoffChange = () => synth.setFilterCutoff(filterCutoff.value);
const onResonanceChange = () => synth.setFilterResonance(filterResonance.value);
</script>
