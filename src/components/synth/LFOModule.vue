<template>
    <SynthPanel :title="'LFO Modulator'">
        <template #heading>
            <h3 class="text-center text-wrap text-xl font-medium mb-8 uppercase">
                Low Frequency Oscillator
            </h3>
        </template>

        <div class="mb-1">
            <label class="block text-xs font-semibold mb-1">
                Frequency
            </label>
            <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                v-model.number="lfoFrequency"
                @input="() => synth.setLfoFrequency(lfoFrequency)"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
            <div class="text-center mt-1">
                {{ lfoFrequency.toFixed(1) }} Hz
            </div>
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                Waveform
            </label>
            <select
                v-model="lfoWaveform"
                @change="() => synth.setLfoWaveform(lfoWaveform)"
                class="w-full text-[10px] px-3 py-1.5 border border-black bg-yellow-50 font-mono uppercase rounded-sm"
            >
                <option value="sine">Sine</option>
                <option value="triangle">Triangle</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
            </select>
        </div>
    </SynthPanel>
</template>

<script setup>
import SynthPanel from '../SynthPanel.vue'
import {computed, onMounted} from 'vue'
import {useSynthEngine} from '../../composables/useSynthEngine'
import {useSynthStore} from '../../storage/synthStore'
import {useModuleLifecycle} from '../../composables/useModuleLifecycle'

const synth = useSynthStore()
const engine = useSynthEngine()
let node = null

const context = engine.context

const lfoFrequency = computed({
    get: () => synth.lfoFrequency,
    set: (val) => synth.setLfoFrequency(val)
})

const lfoWaveform = computed({
    get: () => synth.lfoWaveform,
    set: (val) => synth.setLfoWaveform(val)
})
onMounted(async () => {
    await engine.resume()
    node = engine.createOscillatorNode({
        frequency: lfoFrequency.value,
        type: lfoWaveform.value,
        gain: 1.0
    })
    node.gain.connect(context.destination) // or modulate something
    useModuleLifecycle(node)
})
</script>
