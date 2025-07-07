<template>
    <SynthPanel :title="'VCF'">
        <div class="mb-3">
            <label class="block text-xs font-semibold mb-1">
                Frequency (Cut-Off)
            </label>
            <input
                type="range"
                min="50"
                max="10000"
                step="1"
                v-model.number="filterCutoff"
                @input="() => synth.setFilterCutoff(filterCutoff)"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
            <p class="text-center text-xs mt-1 text-gray-700">
                {{ filterCutoff }} Hz
            </p>
        </div>

        <div class="block mb-3">
            <label class="block text-xs font-semibold mb-1">
                Type
            </label>
            <select
                v-model="filterType"
                @change="() => synth.setFilterType(filterType)"
                class="w-full text-[10px] px-3 py-1.5 border border-black bg-yellow-50 font-mono uppercase rounded-sm"
            >
                <option value="lowpass">Low-Pass</option>
                <option value="highpass">High-Pass</option>
                <option value="bandpass">Band-Pass</option>
            </select>
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                Resonance (Q) {{ filterResonance.toFixed(1) }}
            </label>
            <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                v-model.number="filterResonance"
                @input="() => synth.setFilterResonance(filterResonance)"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>
    </SynthPanel>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSynthStore } from '../../storage/synthStore'
import SynthPanel from "../SynthPanel.vue";

const synth = useSynthStore()

const filterCutoff = computed({
    get: () => synth.filterCutoff,
    set: (val) => synth.setFilterCutoff(val)
})

const filterResonance = computed({
    get: () => synth.filterResonance,
    set: (val) => synth.setFilterResonance(val)
})

const filterType = computed({
    get: () => synth.filterType,
    set: (val) => synth.setFilterType(val)
})

onMounted(() => {
    // Optional: synth.initVCF() if not globally initialized
})
</script>
