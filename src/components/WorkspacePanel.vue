<template>
    <div
        v-if="!audioReady"
        class="transition-opacity duration-700 opacity-100 absolute inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center text-center p-6"
    >
        <div class="text-3xl font-bold mb-8">EMS Synth 100</div>
        <button
            ref="startButton"
            @click="unlock"
            @keydown.enter.prevent="unlock"
            @keydown.space.prevent="unlock"
            class="px-6 py-2 bg-white text-black font-bold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
        >
            Start Audio
        </button>
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
                    <Oscilloscope />
                    <InverterModule />
                </div>
                <div class=""><VCAModule /></div>
                <div class=""><MasterOutput /></div>
            </div>
        </div>

        <div class="flex flex-col gap-6 py-6"></div>
        <PatchCables />
    </div>
</template>

<script setup>
import {useSynthStore} from '@/storage/synthStore';
import {onMounted, onUnmounted, ref} from 'vue';
import EnvelopeGenerator from '@/components/modules/EnvelopeGenerator.vue';
import LFOModule from '@/components/modules/LFOModule.vue';
import VCOModule from '@/components/modules/VCOModule.vue';
import VCFModule from '@/components/modules/VCFModule.vue';
import InverterModule from '@/components/modules/InverterModule.vue';
import VCAModule from '@/components/modules/VCAModule.vue';
import MixerModule from '@/components/modules/MixerModule.vue';
import SynthPanel from '@/components/SynthPanel.vue';
import PatchCables from '@/components/PatchCables.vue';
import MasterOutput from '@/components/modules/MasterOutput.vue';
import Oscilloscope from '@/components/modules/Oscilloscope.vue';

const audioReady = ref(false);
const synth = useSynthStore();
const startButton = ref(null);

onMounted(() => {
    startButton.value?.focus();
});

const unlock = async () => {
    try {
        await synth.resume();
        if (synth.audioReady !== undefined) {
            audioReady.value = synth.audioReady;
        } else {
            audioReady.value = true;
        }
    } catch (e) {
        console.warn('Failed to resume AudioContext:', e);
    }
};

onUnmounted(() => {
    synth.destroySynth();
});
</script>
