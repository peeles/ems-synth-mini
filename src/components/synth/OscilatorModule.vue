<template>
    <SynthPanel title="Oscillator">
        <div class="mb-3">
            <label class="block text-xs font-semibold mb-1">
                Frequency Range
            </label>
            <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                v-model.number="oscFreq"
                @input="updateFreq"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
            <div class="text-center text-xs mt-1 text-gray-700">
                {{ oscFreq.toFixed(1) }} Hz
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                Level
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="oscGain"
                @input="updateGain"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>
    </SynthPanel>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SynthPanel from '../SynthPanel.vue'
import { useSynthEngine } from '../../composables/useSynthEngine'
import { useModuleLifecycle } from '../../composables/useModuleLifecycle'

const engine = useSynthEngine()
const context = engine.context

const oscFreq = ref(1.0)
const oscGain = ref(0.5)

let node = null

onMounted(async () => {
    await engine.resume()
    node = engine.createOscillatorNode({
        frequency: oscFreq.value,
        gain: oscGain.value,
        type: 'sine'
    })
    node.gain.connect(context.destination)

    // Explicit initial sync
    updateFreq()
    updateGain()
})

const updateFreq = () => {
    node?.osc.frequency.setValueAtTime(oscFreq.value, context.currentTime)
}

const updateGain = () => {
    node?.gain.gain.setValueAtTime(oscGain.value, context.currentTime)
}

useModuleLifecycle(node)
</script>
