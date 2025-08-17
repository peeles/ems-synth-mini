<template>
    <SynthPanel>
        <section class="flex flex-row items-end justify-between">
            <JackPanel
                :count="1"
                type="input"
                :module-id="id"
                :connected="connectedInputs"
                @patch="handlePatch"
            />
            <div class="flex flex-col items-center justify-between space-y-2">
                <p class="text-xs text-center text-stone-700 mb-2">
                    This utility inverts any signal connected to phase shift.
                </p>
                <span
                    class="inline-block px-2 py-1 bg-stone-200 text-xs mb-2 font-mono rounded"
                    >Gain = –1</span
                >
            </div>
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
import {useModuleConnections} from '@/composables/useModuleConnections';
import {useSynthStore} from '@/storage/synthStore';
import SynthPanel from '@/components/SynthPanel.vue';
import JackPanel from '@/components/JackPanel.vue';

const synth = useSynthStore();
const id = 'inverter-module';

const getInputNode = () => synth.getInverterInputNode?.();
const getOutputNode = () => synth.getInverterOutputNode?.();

const {connectedInputs, connectedOutputs, handlePatch} = useModuleConnections(
    id,
    {
        getInputNode,
        getOutputNode,
    }
);
</script>
