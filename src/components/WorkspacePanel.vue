<template>
    <div
        v-if="!audioReady"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80 p-6 text-center opacity-100 transition-opacity duration-700"
    >
        <div class="mb-8 text-3xl font-bold">EMS Synth 100</div>
        <button
            ref="startButton"
            @click="unlock"
            @keydown.enter.prevent="unlock"
            @keydown.space.prevent="unlock"
            class="rounded bg-white px-6 py-2 font-bold text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
        >
            Start Audio
        </button>
    </div>
    <div
        v-else
        class="relative mx-auto flex h-screen w-full max-w-full flex-col p-4"
    >
        <div class="flex flex-1 flex-col gap-4">
            <div
                class="mx-16 grid grid-flow-dense grid-cols-2 gap-4 sm:grid-cols-4"
            >
                <div class=""><LFOModule /></div>
                <div class=""><VCOModule /></div>
                <div class=""><VCFModule /></div>
                <div class=""><SynthPanel /></div>
            </div>
            <div class="mx-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
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

        <PatchPanelButton />
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
import PatchPanelButton from "@/components/patches/PatchPanelButton.vue";

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
