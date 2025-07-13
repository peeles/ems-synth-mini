<template>
    <SynthPanel>
        <template #heading>
            <section class="flex flex-row items-center justify-end mb-4">
                <JackPanel
                    :count="1"
                    type="output"
                    :module-id="id"
                    :connected="connectedOutputs"
                    @patch="handlePatch"
                />
            </section>
            <h3
                class="text-center text-wrap text-xl font-medium mb-4 uppercase"
            >
                Noise Generator
            </h3>
        </template>

        <div>
            <label
                class="flex flex-row items-center justify-between text-xs font-semibold mb-1"
            >
                Level
                <span class="text-gray-500">White</span>
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="noiseLevel"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div class="mt-1 text-center text-xs italic text-gray-600">
            {{ noiseLevel.toFixed(1) }}
        </div>
    </SynthPanel>
</template>

<script setup>
import SynthPanel from '../SynthPanel.vue';
import JackPanel from '../JackPanel.vue';
import {computed, onMounted, onUnmounted} from 'vue';
import {useSynthStore} from '../../storage/synthStore';
import {useModuleRegistry} from '../../composables/useModuleRegistry';
import {usePatchStore} from '../../storage/patchStore';

const synthStore = useSynthStore();
const registry = useModuleRegistry();
const patchStore = usePatchStore();
const id = 'noise-module';

const getOutputNode = () => synthStore.getNoiseOutputNode?.();

onMounted(() => {
    registry.register(id, {id, getOutputNode});
});

onUnmounted(() => {
    patchStore.removeConnectionsForModule(id);
    registry.unregister(id);
});

const connectedOutputs = computed(() =>
    patchStore.getConnectionsFor(id, true).map(p => p.from.index)
);

const noiseLevel = computed({
    get: () => synthStore.noiseLevel,
    set: val => synthStore.setMixerLevels(synthStore.vcoLevel, val),
});

onMounted(async () => {
    await synthStore.resume();
});

const handlePatch = ({type, index}) => {
    patchStore.selectJack({type, moduleId: id, index});
};
</script>
