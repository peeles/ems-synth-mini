<template>
    <SynthPanel :id="id">
        <template #heading>
            <h3 class="text-center text-wrap text-xl font-medium mb-4 uppercase">
                LFO Modulator
            </h3>
        </template>

        <div class="flex flex-col mb-6">
            <label class="block text-xs font-semibold mb-3"> Frequency </label>
            <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                v-model.number="lfoFrequency"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full mb-3"
            />
            <p class="text-center text-xs text-gray-700">
                {{ lfoFrequency.toFixed(1) }} Hz
            </p>
        </div>

        <RadioButtonGroup
            name="lfoWaveForm"
            v-model="lfoWaveform"
            :options="[
                { name: 'Sine', value: 'sine' },
                { name: 'Square', value: 'square' },
                { name: 'Saw', value: 'sawtooth' },
                { name: 'Triangle', value: 'triangle' },
            ]"
        />

        <section class="flex flex-row items-center justify-between mt-6">
            <JackPanel
                :count="1"
                type="input"
                :module-id="id"
                :connected="connectedInputs"
                @patch="handlePatch"
            />
            <div class="flex flex-col items-center justify-center mt-1.5">
                <div
                    class="w-3 h-3 rounded-full border border-stone-600"
                    :class="lfoHigh ? 'bg-green-500' : 'bg-stone-400'"
                />
                <span class="block text-[9px] mt-3 uppercase text-center">Activity</span>
            </div>
            <JackPanel
                :count="1"
                :type="'output'"
                :module-id="id"
                :connected="connectedOutputs"
                @patch="handlePatch"
            />
        </section>
    </SynthPanel>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {useSynthStore} from '../../storage/synthStore';
import {useModuleConnections} from '../../composables/useModuleConnections';
import {useSynthEngine} from "../../composables/useSynthEngine";
import SynthPanel from './SynthPanel.vue';
import JackPanel from '../JackPanel.vue';
import RadioButtonGroup from "../base/RadioButtonGroup.vue";

const synth = useSynthStore();
const id = 'lfo-module';
const engine = useSynthEngine();
const context = engine.context;

const level = ref(0);
let analyser, buffer, rafId;

const lfoHigh = computed(() => level.value > 0);

const getOutputNode = () => synth.getLFOOutputNode?.();
const getInputNode = () => synth.getLFOInputNode?.();

const {connectedInputs, connectedOutputs, handlePatch} = useModuleConnections(id, {
    getInputNode,
    getOutputNode,
});

onMounted(() => {
    const out = synth.getLFOOutputNode?.();
    if (out) {
        analyser = context.createAnalyser();
        analyser.fftSize = 32;
        buffer = new Uint8Array(analyser.frequencyBinCount);
        out.connect(analyser);
        const update = () => {
            analyser.getByteTimeDomainData(buffer);
            level.value = (buffer[0] - 128) / 128;
            rafId = requestAnimationFrame(update);
        };
        update();
    }
});

onUnmounted(() => {
    if (rafId) {
        cancelAnimationFrame(rafId);
        analyser?.disconnect();
    }
});

const lfoFrequency = computed({
    get: () => synth.lfoFrequency,
    set: val => synth.setLfoFrequency(val),
});

const lfoWaveform = computed({
    get: () => synth.lfoWaveform,
    set: val => synth.setLfoWaveform(val),
});

onMounted(async () => {
    await synth.resume();
});
</script>
