<template>
    <SynthPanel>
        <template #heading>
            <section class="flex flex-row items-center justify-between mb-4">
                <h3 class="w-1/2 text-wrap text-xl font-medium uppercase">
                    Envelope Generator
                </h3>
                <div class="flex flex-col items-center justify-center mt-1.5">
                    <div
                        class="w-3 h-3 rounded-full border border-stone-600"
                        :class="
                            envelopeActive ? 'bg-green-500' : 'bg-stone-400'
                        "
                    />
                    <p class="block text-[9px] mt-3 uppercase text-center">
                        Signal
                    </p>
                </div>
            </section>
        </template>

        <section class="flex flex-row grow justify-center items-center gap-x-6">
            <section class="w-1/2 flex flex-row items-center justify-between">
                <div class="w-10 text-center">
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
                <div
                    class="flex flex-col items-center justify-center h-full pt-2.5"
                >
                    <div
                        class="relative flex flex-col items-center h-52 justify-between"
                    >
                        <template v-for="n in 11" :key="n">
                            <div class="flex items-center w-14">
                                <div
                                    class="flex-1 border-t border-stone-800 mx-1"
                                ></div>
                                <span
                                    class="w-6 text-center text-xs font-bold"
                                    >{{ 10 - (n - 1) }}</span
                                >
                                <div
                                    class="flex-1 border-t border-stone-800 mx-1"
                                ></div>
                            </div>
                        </template>
                    </div>
                </div>
                <div class="w-10 text-center">
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
            </section>

            <section
                class="w-1/2 flex flex-col flex-1 items-end h-full gap-4 pt-3"
            >
                <div class="flex flex-row items-center justify-between gap-4">
                    <WaveformIcon :type="'gate'" />
                    <div
                        class="bg-transparent border-2 border-stone-600 rounded-sm px-1.5 py-2 flex flex-col items-center gap-2"
                    >
                        <button
                            class="w-3 h-3 rounded-full cursor-pointer border border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-700 bg-stone-800"
                            type="button"
                        />
                        <button
                            class="w-3 h-3 rounded-full cursor-pointer border border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-700 bg-stone-800"
                            type="button"
                        />
                    </div>
                </div>

                <BaseButton
                    @click="triggerEnvelope"
                    class="text-xs justify-center font-semibold mt-auto"
                    :active="envelopeActive"
                >
                    Trigger
                </BaseButton>
            </section>
        </section>
    </SynthPanel>
</template>

<script setup>
import {computed, ref} from 'vue';
import {useSynthStore} from '@/storage/synthStore';
import {useAnimationSchedule} from '@/composables/useAnimationSchedule';
import SynthPanel from '@/components/SynthPanel.vue';
import VerticalSlider from '@/components/VerticalSlider.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import WaveformIcon from '@/components/WaveformIcon.vue';

const synth = useSynthStore();
const level = ref(0);
const envelopeActive = computed(() => level.value > 0.01);

useAnimationSchedule(() => {
    const gain = synth.getVCAInputNode?.();
    level.value = gain ? gain.value : 0;
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
