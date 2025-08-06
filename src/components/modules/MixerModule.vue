<template>
    <SynthPanel>
        <template #heading>
            <section class="flex flex-row items-center justify-between mb-8">
                <h3 class="w-1/2 text-wrap text-xl font-medium uppercase">
                    Module Mixer
                </h3>
                <JackPanel
                    :count="1"
                    type="output"
                    :module-id="id"
                    :connected="connectedOutputs"
                    @patch="handlePatch"
                />
            </section>
        </template>

        <div class="flex flex-row justify-between items-center">
            <div class="mb-3 w-10 text-center">
                <label class="block text-xs font-semibold mb-2">
                    VCO Level
                </label>
                <VerticalSlider
                    v-model.number="vcoLevel"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    :show-labels="false"
                    @dblclick="synth.resetParam('vcoLevel')"
                />
                <label class="block text-xs font-semibold mb-1 mt-3">
                    {{ (vcoLevel * 10).toFixed(1) }}
                </label>
            </div>

            <div class="mx-1">
                <div
                    class="flex flex-col items-center justify-center h-full -mt-0.5"
                >
                    <div
                        class="relative flex flex-col items-center h-52 justify-between"
                    >
                        <template v-for="n in 11" :key="n">
                            <div class="flex items-center w-14">
                                <div
                                    class="flex-1 border-t border-gray-800 mx-1"
                                ></div>
                                <span
                                    class="w-6 text-center text-xs font-bold"
                                    >{{ 10 - (n - 1) }}</span
                                >
                                <div
                                    class="flex-1 border-t border-gray-800 mx-1"
                                ></div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            <div class="mb-3 w-10 text-center">
                <label class="block text-xs font-semibold mb-2">
                    Noise Level
                </label>
                <VerticalSlider
                    v-model.number="noiseLevel"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    :show-labels="false"
                    @dblclick="synth.resetParam('noiseLevel')"
                />
                <label class="block text-xs font-semibold mb-1 mt-3">
                    {{ (noiseLevel * 10).toFixed(1) }}
                </label>
            </div>

            <div class="mx-1">
                <div
                    class="flex flex-col items-center justify-center h-full -mt-0.5"
                >
                    <div
                        class="relative flex flex-col items-center h-52 justify-between"
                    >
                        <template v-for="n in 11" :key="n">
                            <div class="flex items-center w-14">
                                <div
                                    class="flex-1 border-t border-gray-800 mx-1"
                                ></div>
                                <span
                                    class="w-6 text-center text-xs font-bold"
                                >{{ 10 - (n - 1) }}</span
                                >
                                <div
                                    class="flex-1 border-t border-gray-800 mx-1"
                                ></div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>

            <div class="mb-3 w-10 text-center">
                <label class="block text-xs font-semibold mb-2">Colour Level</label>
                <VerticalSlider
                    v-model.number="colourAmount"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    :show-labels="false"
                    @dblclick="synth.resetParam('colourAmount')"
                />
                <label class="block text-xs font-semibold mb-1 mt-3">
                    {{ (colourAmount * 10).toFixed(1) }}
                </label>
            </div>
        </div>
    </SynthPanel>
</template>

<script setup>
import {computed} from 'vue';
import {useSynthStore} from '@/storage/synthStore';
import {useModuleConnections} from '@/composables/useModuleConnections';
import VerticalSlider from '@/components/VerticalSlider.vue';
import SynthPanel from '@/components/SynthPanel.vue';
import JackPanel from '@/components/JackPanel.vue';

const synth = useSynthStore();
const id = 'mixer-module';

const getOutputNode = () => synth.getMixerOutputNode?.();

const {connectedOutputs, handlePatch} = useModuleConnections(id, {
    getOutputNode,
});

const vcoLevel = computed({
    get: () => synth.vcoLevel,
    set: val => synth.setMixerLevels(val, synth.noiseLevel),
});

const noiseLevel = computed({
    get: () => synth.noiseLevel,
    set: val => synth.setMixerLevels(synth.vcoLevel, val),
});

const colourAmount = computed({
    get: () => synth.colourAmount,
    set: val => synth.setColourAmount(val),
});
</script>
