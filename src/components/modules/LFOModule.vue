<template>
    <SynthPanel :id="id">
        <template #heading>
            <div class="flex justify-center mt-2">
                <div
                    class="w-3 h-3 rounded-full border border-black"
                    :class="lfoHigh ? 'bg-green-500' : 'bg-gray-700'"
                />
            </div>
            <h3
                class="text-center text-wrap text-xl font-medium mb-4 uppercase"
            >
                LFO Modulator
            </h3>
        </template>

        <div class="mb-1">
            <label class="block text-xs font-semibold mb-1"> Frequency </label>
            <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                v-model.number="lfoFrequency"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
            <p class="text-center text-xs mt-1 text-gray-700">
                {{ lfoFrequency.toFixed(1) }} Hz
            </p>
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1"> Waveform </label>
            <select
                v-model="lfoWaveform"
                class="w-full text-[10px] px-3 py-1.5 border border-black bg-yellow-50 font-mono uppercase rounded-sm"
            >
                <option value="sine">Sine</option>
                <option value="triangle">Triangle</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
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
                :type="'output'"
                :module-id="id"
                :connected="connectedOutputs"
                @patch="handlePatch"
            />
        </section>
    </SynthPanel>
</template>

<script setup>
import SynthPanel from './SynthPanel.vue';
import JackPanel from '../JackPanel.vue';
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {useSynthStore} from '../../storage/synthStore';
import {useModuleRegistry} from '../../composables/useModuleRegistry';
import {usePatchStore} from '../../storage/patchStore';
import {useSynthEngine} from "../../composables/useSynthEngine";

const synth = useSynthStore();
const registry = useModuleRegistry();
const patchStore = usePatchStore();
const id = 'lfo-module';
const engine = useSynthEngine();
const context = engine.context;

const level = ref(0);
let analyser, buffer, rafId;

const lfoHigh = computed(() => level.value > 0);

const getOutputNode = () => synth.getLFOOutputNode?.();
const getInputNode = () => synth.getLFOInputNode?.();

onMounted(() => {
    registry.register(id, {id, getInputNode, getOutputNode});
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
    patchStore.removeConnectionsForModule(id);
    registry.unregister(id);

    if (rafId) {
        cancelAnimationFrame(rafId);
        analyser?.disconnect();
    }
});

const connectedInputs = computed(() =>
    patchStore.getConnectionsFor(id, false).map(p => p.to.index)
);

const connectedOutputs = computed(() =>
    patchStore.getConnectionsFor(id, true).map(p => p.from.index)
);

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

const handlePatch = ({type, index}) => {
    patchStore.selectJack({type, moduleId: id, index});
};
</script>
