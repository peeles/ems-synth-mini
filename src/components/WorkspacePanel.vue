<template>
    <!-- Panel container with background image of Synthi E for pixel-accurate placement -->
    <div class="relative">
        <!-- Mount all synth module components -->
        <LFOModule />
        <VCOModule />
        <VCFModule />
        <EnvelopeGenerator />
        <NoiseGenerator />
        <InverterModule />
        <MixerModule />
        <VCAModule />
        <SliderKeyboard />
    </div>
</template>

<script setup>
import { useSynthStore } from '../storage/synthStore';
// Ensure the store (and audio graph) is initialized
const synth = useSynthStore();
// (Optional: resume AudioContext on first user interaction)
import { onMounted } from 'vue';
import EnvelopeGenerator from "./synth/EnvelopeGenerator.vue";
import NoiseGenerator from "./synth/NoiseGenerator.vue";
import SliderKeyboard from "./synth/SliderKeyboard.vue";
import LFOModule from "./synth/LFOModule.vue";
import VCOModule from "./synth/VCOModule.vue";
import VCFModule from "./synth/VCFModule.vue";
import InverterModule from "./synth/InverterModule.vue";
import MixerModule from "./synth/MixerModule.vue";
import VCAModule from "./synth/VCAModule.vue";

onMounted(() => {
    // For some browsers, need a user gesture to start audio
    window.addEventListener('pointerdown', synth.resume, { once: true });
});
</script>

<style>
/* Tailwind CSS is used for most styling. We could define custom classes if needed. */
/* Example of a custom background via Tailwind config or here: */
</style>
