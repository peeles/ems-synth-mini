<template>
    <SynthPanel>
        <template #heading>
            <h3
                class="text-center text-wrap text-xl font-medium mb-4 uppercase"
            >
                Voltage Oscillator
            </h3>
        </template>

        <div class="mb-1">
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
const id = 'vco-module';

const getOutputNode = index => {
    return synth.getVCOOutputNode?.(index);
};

const getInputNode = index => {
    return synth.getVCOInputNode?.(index);
};

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

const vcoFrequency = computed({
    get: () => synth.vcoFrequency,
    set: val => synth.setVcoFrequency(val),
});

const vcoWaveform = computed({
    get: () => synth.vcoWaveform,
    set: val => synth.setVcoWaveform(val),
});

onMounted(async () => {
    await synth.resume();
});

const handlePatch = jack => {
    patchStore.selectJack(jack);
};
</script>
