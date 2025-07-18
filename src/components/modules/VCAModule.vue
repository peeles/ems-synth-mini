<template>
    <SynthPanel>
        <template #heading>
            <section class="flex flex-row items-center justify-between mb-8">
                <JackPanel
                    :count="1"
                    :type="'input'"
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
            <h3
                class="text-center text-wrap text-xl font-medium mb-8 uppercase"
            >
                VCA
            </h3>
        </template>

        <div class="flex flex-col justify-center text-center">
            <label class="block text-xs font-semibold mb-2"> Mix Mode </label>

            <VerticalSlider
                :min="0"
                :max="1"
                :step="0.01"
                :show-labels="false"
                v-model.number="vcaMode"
                class="mx-auto"
            />

            <label class="block text-xs font-medium mb-1 mt-3">
                {{ modeLabel }}
            </label>
        </div>
    </SynthPanel>
</template>

<script setup>
import {computed, onMounted} from 'vue';
import {useSynthStore} from '../../storage/synthStore';
import SynthPanel from './SynthPanel.vue';
import VerticalSlider from '../VerticalSlider.vue';
import JackPanel from '../JackPanel.vue';
import {useModuleConnections} from '../../composables/useModuleConnections';

const synth = useSynthStore();
const id = 'vca-module';

const getOutputNode = () => {
    return synth.getVCAOutputNode?.();
};

const getInputNode = () => {
    return synth.getVCAInputNode?.();
};

const {connectedInputs, connectedOutputs, handlePatch} = useModuleConnections(id, {
    getInputNode,
    getOutputNode,
});

const vcaMode = computed({
    get: () => synth.vcaMode,
    set: val => synth.setVcaMode(val),
});

const modeLabel = computed(() => {
    if (vcaMode.value <= 0.1) {
        return 'Envelope';
    }

    if (vcaMode.value <= 0.2) {
        return 'Sine Wave';
    }

    if (vcaMode.value <= 0.3) {
        return 'Linear';
    }

    if (vcaMode.value <= 0.4) {
        return 'Exponential';
    }

    if (vcaMode.value >= 0.9) {
        return 'Ring Mod';
    }

    return `${Math.round(vcaMode.value * 100)}% Blend`;
});

</script>
