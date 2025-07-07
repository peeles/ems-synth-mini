<template>
    <SynthPanel :title="'Envelope (Trapezoid)'">
        <div class="mb-3">
            <label class="block text-xs font-semibold mb-1">
                Attack (Rise): {{ envelopeAttack.toFixed(2) }}s
            </label>
            <input
                type="range"
                min="0.01"
                max="2"
                step="0.01"
                v-model.number="envelopeAttack"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div class="mb-3">
            <label class="block text-xs font-semibold mb-1">
                Decay (Fall): {{ envelopeDecay.toFixed(2) }}s
            </label>
            <input
                type="range"
                min="0.01"
                max="5"
                step="0.01"
                v-model.number="envelopeDecay"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <button
            @click="triggerEnvelope"
            class="w-full text-sm font-medium mt-2 px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800 transition"
        >
            Manual Trigger
        </button>
    </SynthPanel>
</template>

<script setup>
import { computed } from 'vue'
import { useSynthStore } from '../../storage/synthStore'
import SynthPanel from "../SynthPanel.vue";

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
