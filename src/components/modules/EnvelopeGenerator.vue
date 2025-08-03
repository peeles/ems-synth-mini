<template>
    <SynthPanel>
        <template #heading>
            <section class="flex flex-row items-center justify-between mb-8">
                <h3 class="w-1/2 text-wrap text-xl font-medium uppercase">
                    Envelope Generator
                </h3>
                <JackPanel
                    :count="1"
                    type="input"
                    :module-id="id"
                    :connected="connectedInputs"
                    @patch="handlePatch"
                />
            </section>
        </template>

        <div class="flex flex-row">
            <div class="mb-3 w-10 text-center">
                <label class="block text-xs font-semibold mb-2">
                    Rise Time
                </label>

                <VerticalSlider
                    v-model="envelopeAttack"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    :show-labels="false"
                    @dblclick="synth.resetParam('envelopeAttack')"
                />

                <label class="block text-xs font-medium mb-1 mt-3">
                    {{ (envelopeAttack * 10).toFixed(1) }}
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
                    Fall Time
                </label>
                <VerticalSlider
                    v-model.number="envelopeDecay"
                    :min="0"
                    :max="1"
                    :step="0.05"
                    :show-labels="false"
                    @dblclick="synth.resetParam('envelopeDecay')"
                />
                <label class="block text-xs font-semibold mb-1 mt-3">
                    {{ (envelopeDecay * 10).toFixed(1) }}
                </label>
            </div>

            <div class="flex flex-col flex-1 items-end gap-y-2.5">
                <div class="flex justify-center mt-2">
                    <div
                        class="w-3 h-3 rounded-full border border-black"
                        :class="envelopeActive ? 'bg-green-500' : 'bg-gray-700'"
                    />
                </div>
                <div
                    class="bg-transparent border-2 border-stone-600 rounded-sm px-1.5 py-2 flex flex-col items-center gap-2"
                />
                <div
                    class="bg-transparent border-2 border-stone-600 rounded-sm px-1.5 py-2 flex flex-col items-center gap-2"
                />
            </div>
        </div>

        <BaseButton
            @click="triggerEnvelope"
            class="text-xs justify-center font-semibold"
            :active="envelopeActive"
        >
            Trigger
        </BaseButton>
    </SynthPanel>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {useSynthStore} from '../../storage/synthStore';
import SynthPanel from './SynthPanel.vue';
import VerticalSlider from '../VerticalSlider.vue';
import {useModuleConnections} from '../../composables/useModuleConnections';
import JackPanel from '../JackPanel.vue';
import BaseButton from '../base/BaseButton.vue';

const synth = useSynthStore();
const id = 'envelope-generator';

const level = ref(0);
let rafId;

const envelopeActive = computed(() => level.value > 0.01);

const getInputNode = index => synth.getEnvelopeTriggerInputNode?.(index);

const {connectedInputs, handlePatch} = useModuleConnections(id, {getInputNode});

onMounted(() => {
    const update = () => {
        const gain = synth.getVCAInputNode?.();
        level.value = gain ? gain.value : 0;
        rafId = requestAnimationFrame(update);
    };
    update();
});

onUnmounted(() => {
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
});

const envelopeAttack = computed({
    get: () => synth.envelopeAttack,
    set: val => synth.setEnvelopeAttack(val),
});

const envelopeDecay = computed({
    get: () => synth.envelopeDecay,
    set: val => synth.setEnvelopeDecay(val),
});

const triggerEnvelope = () => {
    synth.triggerEnvelope();
};
</script>
