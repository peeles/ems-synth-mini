<template>
    <div class="absolute" :style="{ top: '20px', left: '20px' }">
        <h3 class="text-md font-bold mb-2">LFO</h3>
        <div class="mb-2">
            <label class="block text-sm">Frequency: {{ lfoFrequency.toFixed(1) }} Hz</label>
            <input type="range" min="0.1" max="15" step="0.1"
                   v-model.number="lfoFrequency"
                   @input="onFrequencyInput"
                   class="w-full accent-blue-500" />
        </div>
        <div class="mb-2">
            <label class="block text-sm">Waveform</label>
            <select v-model="lfoWaveform" @change="onWaveformChange" class="w-full px-2 py-1 rounded">
                <option value="sine">Sine</option>
                <option value="triangle">Triangle</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="square">Square</option>
            </select>
        </div>
    </div>
</template>

<script setup>
import {computed, onUnmounted} from 'vue';
import { useSynthStore } from '../../storage/synthStore';

const synth = useSynthStore();
const lfoFrequency = computed({
    get: () => synth.lfoFrequency,
    set: (val) => synth.setLfoFrequency(val)
});
const lfoWaveform = computed({
    get: () => synth.lfoWaveform,
    set: (val) => synth.setLfoWaveform(val)
});
const onFrequencyInput = () => synth.setLfoFrequency(lfoFrequency.value);
const onWaveformChange = () => synth.setLfoWaveform(lfoWaveform.value);

// Clean up LFO oscillator if component unmounts (not shown here for brevity, similar to VCO)
onUnmounted(() => { /* stop LFO oscillator if needed */ });
</script>
