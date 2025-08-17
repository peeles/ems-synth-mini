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
                <div
                    class="bg-[#f5c44e] flex flex-col justify-between h-full border border-black rounded-lg shadow-inner p-5 text-black tracking-wide space-y-2"
                >
                    <div
                        class="flex flex-row items-center justify-stretch gap-x-2 -mt-1"
                    >
                        <div
                            class="flex-1 py-0.5 px-2 bg-transparent border-2 border-stone-700 rounded"
                        >
                            <span
                                class="text-base font-bold uppercase leading-0.5"
                                >Synthi 100</span
                            >
                        </div>
                        <span class="font-semibold text-4xl">EMS</span>
                    </div>
                    <PatchPanelButton />
                </div>
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

        <PianoKeyboard />
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
import PatchCables from '@/components/patches/PatchCables.vue';
import MasterOutput from '@/components/modules/MasterOutput.vue';
import Oscilloscope from '@/components/modules/Oscilloscope.vue';
import PatchPanelButton from '@/components/patches/PatchPanelButton.vue';
import PianoKeyboard from '@/components/keyboard/pianoKeyboard.vue';

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
