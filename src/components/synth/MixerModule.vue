<template>
    <SynthPanel title="Mixer">
        <div class="flex justify-around items-end h-[140px]">

            <!-- VCO -->
            <div class="flex flex-col items-center">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="vcoLevel"
                    class="w-4 h-24 accent-black bg-gray-200 rounded"
                />
                <span class="mt-1 text-[10px]">VCO</span>
            </div>

            <!-- Noise -->
            <div class="flex flex-col items-center">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="noiseLevel"
                    class="w-4 h-24 accent-black bg-gray-200 rounded"
                />
                <span class="mt-1 text-[10px]">Noise</span>
            </div>

            <!-- Tone -->
            <div class="flex flex-col items-center w-20">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="tone"
                    @input="updateTone"
                    class="w-full accent-orange-600"
                />
                <span class="mt-1 text-[10px]">{{ toneLabel }}</span>
            </div>

        </div>
    </SynthPanel>
</template>

<script setup>
import SynthPanel from '../SynthPanel.vue'
import { computed, ref } from 'vue'
import { useSynthStore } from '../../storage/synthStore'

const synth = useSynthStore()

const vcoLevel = computed({
    get: () => synth.vcoLevel,
    set: (val) => synth.setMixerLevels(val, synth.noiseLevel)
})

const noiseLevel = computed({
    get: () => synth.noiseLevel,
    set: (val) => synth.setMixerLevels(synth.vcoLevel, val)
})

const tone = ref(0.5)

const toneLabel = computed(() => {
    if (tone.value < 0.3) return 'Dark'
    if (tone.value > 0.7) return 'Bright'
    return 'Neutral'
})

const updateTone = () => {
    const base = 500
    const spread = 8000
    synth.setFilterCutoff(base + tone.value * spread)
}
</script>
