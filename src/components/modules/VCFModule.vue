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

        <ul class="grid grid-cols-3 max-w-md gap-x-1 my-3 text-xs mx-auto">
            <li class="relative">
                <input
                    class="sr-only peer"
                    type="radio"
                    value="lowpass"
                    name="filterType"
                    id="low_pass"
                    v-model="filterType"
                />
                <label
                    class="flex py-1.5 px-2 bg-transparent border border-gray-¶00 rounded cursor-pointer focus:outline-none hover:bg-gray-50/25 peer-checked:ring-gray-500 peer-checked:ring-2 peer-checked:border-transparent"
                    for="low_pass"
                >
                    Low-Pass
                </label>
            </li>

            <li class="relative">
                <input
                    class="sr-only peer"
                    type="radio"
                    value="highpass"
                    name="filterType"
                    id="high_pass"
                    v-model="filterType"
                />
                <label
                    class="flex py-1.5 px-2 bg-transparent border border-gray-700 rounded cursor-pointer focus:outline-none hover:bg-gray-50/25 peer-checked:ring-gray-500 peer-checked:ring-2 peer-checked:border-transparent"
                    for="high_pass"
                >
                    High-Pass
                </label>
            </li>

            <li class="relative">
                <input
                    class="sr-only peer"
                    type="radio"
                    value="bandpass"
                    name="filterType"
                    id="band_pass"
                    v-model="filterType"
                />
                <label
                    class="flex py-1.5 px-2 bg-transparent border border-gray-700 rounded cursor-pointer focus:outline-none hover:bg-gray-50/25 peer-checked:ring-gray-500 peer-checked:ring-2 peer-checked:border-transparent"
                    for="band_pass"
                >
                    Band-Pass
                </label>
            </li>
        </ul>

        <section class="flex flex-row items-center justify-between mt-8">
            <JackPanel
                :count="1"
                type="input"
                :module-id="id"
                :connected="connectedInputs"
                @patch="handlePatch"
            />
            <JackPanel
                :count="1"
                type="output"
                :module-id="id"
                :connected="connectedOutputs"
                @patch="handlePatch"
            />
        </section>
    </SynthPanel>
</template>

<script setup>
import {computed, onMounted, onUnmounted} from 'vue';
import {useSynthStore} from '../../storage/synthStore';
import {useModuleRegistry} from '../../composables/useModuleRegistry';
import {usePatchStore} from '../../storage/patchStore';
import SynthPanel from '../SynthPanel.vue';
import JackPanel from '../JackPanel.vue';

const synth = useSynthStore();
const registry = useModuleRegistry();
const patchStore = usePatchStore();
const id = 'vcf-module';

const getInputNode = () => synth.getVCFInputNode?.();
const getOutputNode = () => synth.getVCFOutputNode?.();

onMounted(() => {
    registry.register(id, {id, getInputNode, getOutputNode});
});

onUnmounted(() => {
    patchStore.removeConnectionsForModule(id);
    registry.unregister(id);
});

const connectedInputs = computed(() =>
    patchStore.getConnectionsFor(id, false).map(p => p.to.index)
);

const connectedOutputs = computed(() =>
    patchStore.getConnectionsFor(id, true).map(p => p.from.index)
);

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

const handlePatch = jack => {
    patchStore.selectJack(jack);
};
</script>
