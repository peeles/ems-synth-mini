<template>
    <SynthPanel>
        <template #heading>
            <section class="flex flex-row items-center justify-between mb-6">
                <h3 class="w-1/2 text-wrap text-xl font-medium uppercase">
                    Control Voltage
                </h3>
                <div class="flex flex-row items-center justify-between gap-4">
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
                </div>
            </section>
        </template>

        <section class="flex flex-row grow justify-center items-center gap-6">
            <div class="relative group w-1/2 text-center space-y-6">
                <BaseButton
                    :active="vcaResponse === 'exponential'"
                    class="text-xs justify-center font-semibold"
                    :label="vcaResponse === 'exponential' ? 'Exponential' : 'Linear'"
                    @click="toggleResponse"
                />

                <BaseButton
                    :active="driveEnabled"
                    class="text-xs justify-center font-semibold"
                    label="Drive"
                    @click="toggleDrive"
                />

                <div class="flex flex-col">
                    <label class="block text-xs font-semibold mb-1">
                        Drive
                    </label>
                    <input
                        type="range"
                        :min="1"
                        :max="5"
                        :step="0.1"
                        v-model.number="driveAmount"
                        @dblclick="synth.resetParam('vcaDrive')"
                        class="w-full h-[8px] accent-black bg-black/10 rounded-full"
                    />
                </div>
            </div>

            <div class="relative group w-1/2 text-center">
                <label class="block text-xs font-semibold mb-2">
                    Mix Mode
                </label>
                <VerticalSlider
                    :min="0"
                    :max="1"
                    :step="0.01"
                    :show-labels="false"
                    v-model.number="vcaMode"
                    @dblclick="synth.resetParam('vcaMode')"
                    class="mx-auto z-[1]"
                />
                <div class="absolute inset-0 pointer-events-none z-0">
                    <div class="absolute w-[1px] h-full bg-black left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-30" />
                    <div class="absolute w-[1px] h-full bg-black left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-30" />
                </div>
                <label class="block text-xs font-medium mb-1 mt-3">
                    {{ modeLabel }}
                </label>
            </div>
        </section>
    </SynthPanel>
</template>

<script setup>
import {computed} from 'vue';
import {useModuleConnections} from '@/composables/useModuleConnections';
import {useSynthStore} from '@/storage/synthStore';
import SynthPanel from '@/components/SynthPanel.vue';
import VerticalSlider from '@/components/VerticalSlider.vue';
import JackPanel from '@/components/JackPanel.vue';

const synth = useSynthStore();
const id = 'vca-module';

const getOutputNode = () => {
    return synth.getVCAOutputNode?.();
};

const getInputNode = () => {
    return synth.getVCAInputNode?.();
};

const {connectedInputs, connectedOutputs, handlePatch} = useModuleConnections(
    id,
    {
        getInputNode,
        getOutputNode,
    }
);

const vcaMode = computed({
    get: () => synth.vcaMode,
    set: val => synth.setVcaMode(val),
});

const vcaResponse = computed({
    get: () => synth.vcaResponse,
    set: val => synth.setVcaResponse(val),
});

const driveAmount = computed({
    get: () => synth.vcaDrive,
    set: val => synth.setVcaDrive(val),
});

const driveEnabled = computed({
    get: () => synth.vcaDriveEnabled,
    set: val => synth.setVcaDriveEnabled(val),
});

const toggleResponse = () => {
    vcaResponse.value =
        vcaResponse.value === 'linear' ? 'exponential' : 'linear';
};

const toggleDrive = () => {
    driveEnabled.value = !driveEnabled.value;
};

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
