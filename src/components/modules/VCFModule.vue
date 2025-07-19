<template>
    <SynthPanel>
        <template #heading>
            <h3
                class="text-center text-wrap text-xl font-medium mb-4 uppercase"
            >
                Voltage Filter
            </h3>
        </template>

        <section class="flex flex-row items-center gap-4 mb-6">
            <div class="w-1/2">
                <label class="block text-xs font-semibold mb-1">
                    Cut-Off
                </label>
                <input
                    type="range"
                    min="50"
                    max="10000"
                    step="1"
                    v-model.number="filterCutoff"
                    class="w-full h-[8px] accent-black bg-black/10 rounded-full"
                />
                <p class="text-center text-xs mt-1 text-gray-700">
                    {{ filterCutoff }} Hz
                </p>
            </div>

            <div class="w-1/2">
                <label class="block text-xs font-semibold mb-1">
                    Resonance
                </label>
                <input
                    type="range"
                    min="0.1"
                    max="20"
                    step="0.1"
                    v-model.number="filterResonance"
                    class="w-full h-[8px] accent-black bg-black/10 rounded-full"
                />
                <p class="text-center text-xs mt-1 text-gray-700">
                    {{ filterResonance.toFixed(1) }} Hz
                </p>
            </div>
        </section>

        <RadioButtonGroup
            :name="filterType"
            v-model="filterType"
            :options="[
                { name: 'Low-Pass', value: 'lowpass' },
                { name: 'High-Pass', value: 'highpass' },
                { name: 'Band-Pass', value: 'bandpass' },
            ]"
        />

        <section class="flex flex-row items-center justify-between mt-6">
            <JackPanel
                :count="3"
                :type="'input'"
                :module-id="id"
                :connected="connectedInputs"
                :orientation="'horizontal'"
                @patch="handlePatch"
            />
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
import {computed, onMounted} from 'vue';
import {useSynthStore} from '../../storage/synthStore';
import {useModuleConnections} from '../../composables/useModuleConnections';
import SynthPanel from './SynthPanel.vue';
import JackPanel from '../JackPanel.vue';
import RadioButtonGroup from "../base/RadioButtonGroup.vue";

const synth = useSynthStore();
const id = 'vcf-module';

const getInputNode = index => synth.getVCFInputNode?.(index);
const getOutputNode = () => synth.getVCFOutputNode?.();

const {connectedInputs, connectedOutputs, handlePatch} = useModuleConnections(id, {
    getInputNode,
    getOutputNode,
});

const filterCutoff = computed({
    get: () => synth.filterCutoff,
    set: val => synth.setFilterCutoff(val),
});

const filterResonance = computed({
    get: () => synth.filterResonance,
    set: val => synth.setFilterResonance(val),
});

const filterType = computed({
    get: () => synth.filterType,
    set: val => synth.setFilterType(val),
});

onMounted(() => {
    // Optional: modules.initVCF() if not globally initialized
});
</script>
