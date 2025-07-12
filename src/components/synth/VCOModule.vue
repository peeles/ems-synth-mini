<template>
    <SynthPanel :title="'VCO'">
        <template #heading>
            <h3
                class="text-center text-wrap text-2xl font-medium mb-8 uppercase"
            >
                VCO
            </h3>
        </template>

        <div class="mb-3">
            <label class="block text-xs font-semibold mb-1"> Frequency </label>
            <input
                type="range"
                min="50"
                max="2000"
                step="1"
                v-model.number="vcoFrequency"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
            <p class="text-center text-xs mt-1 text-gray-700">
                {{ vcoFrequency }} Hz
            </p>
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">Waveform</label>
            <select
                v-model="vcoWaveform"
                class="w-full text-[10px] px-3 py-1.5 border border-black bg-yellow-50 font-mono uppercase rounded-sm"
            >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Saw</option>
                <option value="triangle">Triangle</option>
            </select>
        </div>
    </SynthPanel>
</template>

<script setup>
import {computed, onMounted} from 'vue'
import {useSynthStore} from '../../storage/synthStore'
import SynthPanel from '../SynthPanel.vue'

const synth = useSynthStore()

const vcoFrequency = computed({
    get: () => synth.vcoFrequency,
    set: val => synth.setVcoFrequency(val),
})

const vcoWaveform = computed({
    get: () => synth.vcoWaveform,
    set: val => synth.setVcoWaveform(val),
})

onMounted(async () => {
    await synth.resume()
})
</script>
