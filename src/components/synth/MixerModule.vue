<template>
    <SynthPanel :title="'Mixer Module'">
        <div class="mb-3">
            <label class="block text-xs font-semibold mb-1">
                VCO Level: {{ vcoLevel.toFixed(2) }}
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="vcoLevel"
                @input="updateLevels"
                class="w-full h-[6px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div class="mb-3">
            <label class="block text-xs font-semibold mb-1">
                Noise Level: {{ noiseLevel.toFixed(2) }}
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="noiseLevel"
                @input="updateLevels"
                class="w-full h-[6px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                Tone: {{ toneLabel }}
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="tone"
                @input="updateTone"
                class="w-full h-[6px] accent-orange-500 bg-orange/10 rounded-full"
            />
        </div>
    </SynthPanel>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSynthStore } from '../../storage/synthStore'
import SynthPanel from "../SynthPanel.vue";

const synth = useSynthStore()

// VCO & Noise levels
const vcoLevel = computed({
    get: () => synth.vcoLevel,
    set: (val) => synth.setMixerLevels(val, synth.noiseLevel)
})

const noiseLevel = computed({
    get: () => synth.noiseLevel,
    set: (val) => synth.setMixerLevels(synth.vcoLevel, val)
})

const updateLevels = () => {
    synth.setMixerLevels(vcoLevel.value, noiseLevel.value)
}

// Tone control (mapped to filter cutoff offset)
const tone = ref(0.5)
const toneLabel = computed(() => {
    if (tone.value <= 0.2) return 'Dark'
    if (tone.value >= 0.8) return 'Bright'
    return 'Neutral'
})

const updateTone = () => {
    const base = 800 // base filter cutoff
    const spread = 7000
    const adjusted = base + tone.value * spread
    synth.setFilterCutoff(adjusted)
}
</script>
