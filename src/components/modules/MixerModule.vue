<template>
    <SynthPanel>
        <div class="flex flex-col justify-around h-[140px]">
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
        </div>
        <JackPanel
            class="mt-4"
            :count="1"
            type="output"
            :module-id="id"
            :connected="connectedOutputs"
            @patch="handlePatch"
        />
    </SynthPanel>
</template>

<script setup>
import SynthPanel from './SynthPanel.vue';
import JackPanel from '../JackPanel.vue';
import {computed, onMounted} from 'vue';
import {useSynthStore} from '../../storage/synthStore';
import {useModuleConnections} from '../../composables/useModuleConnections';

const synth = useSynthStore();
const id = 'mixer-module';

const getOutputNode = () => synth.getMixerOutputNode?.();

const {connectedOutputs, handlePatch} = useModuleConnections(id, {getOutputNode});

const vcoLevel = computed({
    get: () => synth.vcoLevel,
    set: val => synth.setMixerLevels(val, synth.noiseLevel),
});

const noiseLevel = computed({
    get: () => synth.noiseLevel,
    set: val => synth.setMixerLevels(synth.vcoLevel, val),
});
</script>
