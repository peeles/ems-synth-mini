<template>
    <div class="w-full mx-auto p-2">
        <div class="grid grid-cols-12 grid-rows-[auto] gap-[4px]">

            <div class="col-span-3"><OscilatorModule /></div>
            <div class="col-span-3"><VCOModule /></div>
            <div class="col-span-3"><VCFModule /></div>
            <div class="col-span-3"></div>

            <!-- Row 2 -->
            <div class="col-span-2"><InputModule /></div>
            <div class="col-span-3"><EnvelopeGenerator /></div>
            <div class="col-span-2">
                <NoiseGenerator />
                <InverterModule />
            </div>
            <div class="col-span-2"><VCAModule /></div>
            <div class="col-span-3"><MasterVolume /></div>


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
import OscilatorModule from "./synth/OscilatorModule.vue";
import MasterVolume from "./synth/MasterVolume.vue";

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
