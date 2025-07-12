<template>
    <SynthPanel>
        <template #heading>
            <h3 class="w-1/2 text-wrap text-xl font-medium mb-8 uppercase">
                Trapezoid Generator
            </h3>
        </template>

        <div class="flex flex-row">
            <div class="mb-3 w-10 text-center">
                <label class="block text-xs font-semibold mb-2">
                    Rise Time
                </label>

                <VerticalSlider
                    :min="0.01"
                    :max="2"
                    :step="0.01"
                    :show-labels="false"
                    v-model="envelopeAttack"
                />

                <label class="block text-xs font-medium mb-1 mt-3">
                    {{ envelopeAttack.toFixed(2) }}
                </label>
            </div>

            <div class="mx-1">
                <div class="flex flex-col items-center justify-center h-full -mt-0.5">
                    <div class="relative flex flex-col items-center h-52 justify-between">
                        <template
                            v-for="n in 11"
                            :key="n"
                        >
                            <div class="flex items-center w-14">
                                <div class="flex-1 border-t border-gray-800 mx-1"></div>
                                <span class="w-6 text-center text-xs font-bold">{{ 10 - (n - 1) }}</span>
                                <div class="flex-1 border-t border-gray-800 mx-1"></div>
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
                    :min="0.01"
                    :max="5"
                    :step="0.01"
                    :show-labels="false"
                />
                <label class="block text-xs font-semibold mb-1 mt-3">
                    {{ envelopeDecay.toFixed(2) }}
                </label>
            </div>

            <div class="flex flex-col flex-1 items-end gap-y-2.5">
                <JackPanel :count="2" @toggle="(index) => console.log('Patch port', index)" />
                <JackPanel :count="2" @toggle="(index) => console.log('Patch port', index)" />
                <JackPanel :count="2" @toggle="(index) => console.log('Patch port', index)" />
                <JackPanel :count="2" @toggle="(index) => console.log('Patch port', index)" />
            </div>
        </div>

        <button
            @click="triggerEnvelope"
            class="w-full text-sm font-medium mt-2 px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800 transition"
        >
            Trigger
        </button>
    </SynthPanel>
</template>

<script setup>
import { computed } from 'vue'
import { useSynthStore } from '../../storage/synthStore'
import SynthPanel from "../SynthPanel.vue";
import VerticalSlider from "../VerticalSlider.vue";
import JackPanel from "../JackPanel.vue";

const synth = useSynthStore()

const envelopeAttack = computed({
    get: () => synth.envelopeAttack,
    set: (val) => synth.envelopeAttack = val
})

const envelopeDecay = computed({
    get: () => synth.envelopeDecay,
    set: (val) => synth.envelopeDecay = val
})

const triggerEnvelope = () => {
    synth.triggerEnvelope()
}
</script>
