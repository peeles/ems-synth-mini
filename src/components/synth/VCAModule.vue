<template>
    <SynthPanel>
        <template #heading>
            <section class="flex flex-row items-center justify-between px-8 mb-8">
                <JackPanel :count="2" @toggle="(index) => console.log('Patch port', index)" />
                <JackPanel :count="2" @toggle="(index) => console.log('Patch port', index)" />
                <JackPanel :count="2" @toggle="(index) => console.log('Patch port', index)" />
            </section>
            <h3 class="text-center text-wrap text-xl font-medium mb-8 uppercase">
                VCA
            </h3>
        </template>

        <div class="flex flex-col justify-center text-center">
            <label class="block text-xs font-semibold mb-2">
                Mix Mode
            </label>

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
import { computed } from 'vue'
import { useSynthStore } from '../../storage/synthStore'
import SynthPanel from "../SynthPanel.vue";
import VerticalSlider from "../VerticalSlider.vue";
import JackPanel from "../JackPanel.vue";

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
