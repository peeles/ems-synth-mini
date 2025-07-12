<template>
    <div class="w-full max-w-full h-screen flex flex-col mx-auto p-4">
        <div class="flex flex-1 flex-col gap-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mx-16 grid-flow-dense">
                <div class=""><LFOModule /></div>
                <div class=""><VCOModule /></div>
                <div class=""><VCFModule /></div>
                <div class=""><SynthPanel :title="''"/></div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mx-4">
                <div class=""><InputModule /></div>
                <div class=""><EnvelopeGenerator /></div>
                <div class="flex flex-col gap-4">
                    <NoiseGenerator />
                    <InverterModule />
                </div>
                <div class=""><VCAModule /></div>
                <div class=""><MasterVolume /></div>
            </div>
        </div>

        <div class="flex flex-col gap-6 py-6">
            <div class=""><SliderKeyboard /></div>
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
import VCAModule from "./synth/VCAModule.vue";
import InputModule from "./synth/InputModule.vue";
import MasterVolume from "./synth/MasterVolume.vue";
import SynthPanel from "./SynthPanel.vue";

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
