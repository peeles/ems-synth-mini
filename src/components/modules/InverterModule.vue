<template>
    <SynthPanel>
        <div class="text-xs text-center text-gray-700">
            This utility inverts any signal connected to phase shift.
        </div>

        <div class="mt-3 text-center">
            <span
                class="inline-block px-2 py-1 bg-gray-200 text-[10px] font-mono rounded"
            >
                Gain = –1
            </span>
        </div>

        <section class="flex flex-row items-center justify-between mt-4">
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
import SynthPanel from './SynthPanel.vue';
import JackPanel from '../JackPanel.vue';
import {useSynthStore} from '../../storage/synthStore';
import {usePatchStore} from '../../storage/patchStore';
import {useModuleRegistry} from '../../composables/useModuleRegistry';

const synth = useSynthStore();
const patchStore = usePatchStore();
const registry = useModuleRegistry();
const id = 'inverter-module';

const getInputNode = () => synth.getInverterInputNode?.();
const getOutputNode = () => synth.getInverterOutputNode?.();

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

const handlePatch = jack => {
    patchStore.selectJack(jack);
};
</script>
