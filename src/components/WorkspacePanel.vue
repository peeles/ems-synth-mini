<template>
    <div
        v-if="!audioReady"
        class="transition-opacity duration-700 opacity-100 absolute inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center text-center p-6"
    >
        <div class="text-3xl font-bold mb-4">Click to Start Audio</div>
        <p class="text-sm opacity-80">Tap anywhere to unlock sound</p>
    </div>
    <div
        v-else
        class="relative w-full max-w-full h-screen flex flex-col mx-auto p-4"
    >
        <div class="flex flex-1 flex-col gap-4">
            <div
                class="grid grid-cols-2 sm:grid-cols-4 gap-4 mx-16 grid-flow-dense"
            >
                <div class=""><LFOModule /></div>
                <div class=""><VCOModule /></div>
                <div class=""><VCFModule /></div>
                <div class=""><SynthPanel /></div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mx-4">
                <div class=""><MixerModule /></div>
                <div class=""><EnvelopeGenerator /></div>
                <div class="flex flex-col gap-4">
                    <NoiseGenerator />
                    <InverterModule />
                </div>
                <div class=""><VCAModule /></div>
                <div class=""><MasterOutput /></div>
            </div>
        </div>

        <div class="flex flex-col gap-6 py-6">
            <div class=""><SliderKeyboard /></div>
        </div>
        <PatchCables />
    </div>
</template>

<script setup>
import {useSynthStore} from '../storage/synthStore';
import {onMounted, onUnmounted, ref} from 'vue';
import EnvelopeGenerator from './modules/EnvelopeGenerator.vue';
import NoiseGenerator from './modules/NoiseGenerator.vue';
import SliderKeyboard from './modules/SliderKeyboard.vue';
import LFOModule from './modules/LFOModule.vue';
import VCOModule from './modules/VCOModule.vue';
import VCFModule from './modules/VCFModule.vue';
import InverterModule from './modules/InverterModule.vue';
import VCAModule from './modules/VCAModule.vue';
import MixerModule from './modules/MixerModule.vue';
import SynthPanel from './modules/SynthPanel.vue';
import PatchCables from './PatchCables.vue';
import MasterOutput from "./modules/MasterOutput.vue";

const audioReady = ref(false);
const synth = useSynthStore();

onMounted(() => {
    window.addEventListener('pointerdown', unlock, {once: true});
});

const unlock = async () => {
    try {
        await synth.resume();
        if (synth.audioReady !== undefined) {
            audioReady.value = synth.audioReady;
        } else {
            // fallback if using local ref
            audioReady.value = true;
        }
        window.removeEventListener('pointerdown', unlock);
    } catch (e) {
        console.warn('Failed to resume AudioContext:', e);
    }
};

onUnmounted(() => {
    synth.destroySynth();
});
</script>

<style>
/* Tailwind CSS is used for most styling. We could define custom classes if needed. */
/* Example of a custom background via Tailwind config or here: */
</style>
