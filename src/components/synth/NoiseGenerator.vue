<template>
    <SynthPanel>
        <template #heading>
            <h3 class="text-center text-wrap text-xl font-medium mb-4 uppercase">
                Noise Generator
            </h3>
        </template>

        <div>
            <label class="flex flex-row items-center justify-between text-xs font-semibold mb-1">
                Level
                <span class="text-gray-500">White</span>
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="noiseLevel"
                @input="updateNoise"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div class="mt-1 text-center text-xs italic text-gray-600">
            {{ noiseLevel.toFixed(1) }}
        </div>
    </SynthPanel>
</template>

<script setup>
import SynthPanel from '../SynthPanel.vue'
import { computed, onMounted } from 'vue'
import { useSynthStore } from '../../storage/synthStore'
import { useSynthEngine } from '../../composables/useSynthEngine'
import { useModuleLifecycle } from '../../composables/useModuleLifecycle'

const synthStore = useSynthStore()
const engine = useSynthEngine()
const context = engine.context

const noiseLevel = computed({
    get: () => synthStore.noiseLevel,
    set: (val) => synthStore.setMixerLevels(synthStore.vcoLevel, val)
})

const updateNoise = () => {
    synthStore.setMixerLevels(synthStore.vcoLevel, noiseLevel.value)
}

let node = null

onMounted(async () => {
    await engine.resume()
    node = engine.createNoiseNode()
    node.gain.gain.setValueAtTime(noiseLevel.value, context.currentTime)
    node.gain.connect(context.destination) // or to filter
    useModuleLifecycle(node)
})
</script>
