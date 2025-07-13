<template>
    <SynthPanel>
        <div>
            <label class="block text-xs font-semibold mb-1">
                External Signal Level
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="extSignal"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                Envelope In Level
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="extEnvelope"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                High-Level Input
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="highLevel"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                Low-Level Input
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="lowLevel"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>
        <section class="flex flex-row justify-center mt-4">
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
import {ref, computed, onMounted, onUnmounted} from 'vue';
import SynthPanel from '../SynthPanel.vue';
import JackPanel from '../JackPanel.vue';
import {usePatchStore} from '../../storage/patchStore';
import {useModuleRegistry} from '../../composables/useModuleRegistry';
import {useSynthEngine} from '../../composables/useSynthEngine';

const patchStore = usePatchStore();
const registry = useModuleRegistry();
const engine = useSynthEngine();
const context = engine.context;
const id = 'input-module';

let outputGain = null;
const getOutputNode = () => {
    if (!outputGain) {
        outputGain = context.createGain();
    }
    return outputGain;
};

onMounted(() => {
    registry.register(id, {id, getOutputNode});
});

onUnmounted(() => {
    patchStore.removeConnectionsForModule(id);
    registry.unregister(id);
    try {
        outputGain?.disconnect();
    } catch {}
});

const connectedOutputs = computed(() =>
    patchStore.getConnectionsFor(id, true).map(p => p.from.index)
);

// Placeholder state — can wire into synthStore or audio input later
const extSignal = ref(0.5);
const extEnvelope = ref(0.5);
const highLevel = ref(0.5);
const lowLevel = ref(0.5);

const handlePatch = jack => {
    patchStore.selectJack(jack);
};
</script>
