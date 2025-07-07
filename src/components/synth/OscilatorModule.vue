<template>
    <SynthPanel title="Oscillator Module">
        <div class="mb-3">
            <label class="block font-semibold">Frequency Range</label>
            <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                v-model.number="oscFrequency"
                @input="updateFreq"
                class="w-full accent-amber-500"
            />
            <div class="text-center text-[10px] mt-1 text-gray-700">
                {{ oscFrequency.toFixed(1) }} Hz
            </div>
        </div>

        <div>
            <label class="block font-semibold">Level</label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="oscGain"
                @input="updateGain"
                class="w-full accent-amber-500"
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
    node.gain.connect(context.destination) // or hold for patch routing
})

const updateFreq = () => {
    node?.osc.frequency.setValueAtTime(oscFreq.value, context.currentTime)
}

const updateGain = () => {
    node?.gain.gain.setValueAtTime(oscGain.value, context.currentTime)
}

useModuleLifecycle(node)
</script>
