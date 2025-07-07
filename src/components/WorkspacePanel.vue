<template>
    <div class="w-full mx-auto p-2">
        <div class="grid grid-cols-12 grid-rows-[auto] gap-[4px]">

            <!-- Row 1 -->
            <div class="col-span-4"><LFOModule /></div>
            <div class="col-span-4"><VCOModule /></div>
            <div class="col-span-4"><VCFModule /></div>

            <!-- Row 2 -->
            <div class="col-span-4"><InputModule /></div>
            <div class="col-span-4"><EnvelopeGenerator /></div>
            <div class="col-span-4"><NoiseGenerator /></div>

            <!-- Row 3 -->
            <div class="col-span-4"><MixerModule /></div>
            <div class="col-span-4"><VCAModule /></div>
            <div class="col-span-4"><InverterModule /></div>

            <!-- Row 4 -->
            <div class="col-span-12"><SliderKeyboard /></div>
        </div>
    </div>
</template>

<script setup>
import { useSynthStore } from '../storage/synthStore';
// Ensure the store (and audio graph) is initialized
const synth = useSynthStore();
// (Optional: resume AudioContext on first user interaction)
import {onMounted, ref} from 'vue';
import EnvelopeGenerator from "./synth/EnvelopeGenerator.vue";
import NoiseGenerator from "./synth/NoiseGenerator.vue";
import SliderKeyboard from "./synth/SliderKeyboard.vue";
import LFOModule from "./synth/LFOModule.vue";
import VCOModule from "./synth/VCOModule.vue";
import VCFModule from "./synth/VCFModule.vue";
import InverterModule from "./synth/InverterModule.vue";
import MixerModule from "./synth/MixerModule.vue";
import VCAModule from "./synth/VCAModule.vue";
import InputModule from "./synth/InputModule.vue";

const ready = ref(false);

onMounted(() => {
    window.addEventListener('pointerdown', async () => {
        await synth.resume()
        ready.value = true
    }, { once: true })
})
</script>

<style>
/* Tailwind CSS is used for most styling. We could define custom classes if needed. */
/* Example of a custom background via Tailwind config or here: */
</style>
