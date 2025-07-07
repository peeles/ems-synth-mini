<template>
    <div class="absolute" :style="{ top: '150px', left: '220px' }">
        <h3 class="text-md font-bold mb-2">Envelope (Trapezoid)</h3>
        <div class="mb-2">
            <label class="block text-sm">Attack (rise): {{ envelopeAttack }} s</label>
            <input type="range" min="0.01" max="2" step="0.01"
                   v-model.number="envelopeAttack"
                   @input="()=>synth.envelopeAttack = envelopeAttack"
                   class="w-full accent-green-500" />
        </div>
        <div class="mb-2">
            <label class="block text-sm">Decay (fall): {{ envelopeDecay }} s</label>
            <input type="range" min="0.01" max="5" step="0.01"
                   v-model.number="envelopeDecay"
                   @input="()=>synth.envelopeDecay = envelopeDecay"
                   class="w-full accent-green-500" />
        </div>
        <button @click="synth.triggerEnvelope"
                class="mt-1 px-3 py-1 bg-green-700 text-white rounded">
            Manual Start
        </button>
    </div>
</template>

<script setup>
import {computed} from "vue";
import { useSynthStore } from '../../storage/synthStore';

const synth = useSynthStore();
const envelopeAttack = computed({
    get: () => synth.envelopeAttack,
    set: (val) => synth.envelopeAttack = val  // direct mutation or use an action if preferred
});
const envelopeDecay = computed({
    get: () => synth.envelopeDecay,
    set: (val) => synth.envelopeDecay = val
});
</script>
