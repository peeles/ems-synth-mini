<template>
    <SynthPanel :title="'VCA'">
        <div class="mb-3">
            <label class="block text-xs font-semibold mb-1">
                Mode Mix: {{ modeLabel }}
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="vcaMode"
                @input="() => synth.setVcaMode(vcaMode)"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div class="text-center text-xs italic">
            0 = Envelope / 1 = Ring Mod (LFO)
        </div>
    </SynthPanel>
</template>

<script setup>
import { computed } from 'vue'
import { useSynthStore } from '../../storage/synthStore'
import SynthPanel from "../SynthPanel.vue";

const synth = useSynthStore()

const vcaMode = computed({
    get: () => synth.vcaMode,
    set: (val) => synth.setVcaMode(val)
})

const modeLabel = computed(() => {
    if (vcaMode.value <= 0.1) return 'Envelope'
    if (vcaMode.value >= 0.9) return 'Ring Mod'
    return `${Math.round(vcaMode.value * 100)}% Blend`
})
</script>
