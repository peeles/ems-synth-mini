<template>
    <SynthPanel>
        <template #heading>
            <h3 class="text-center text-wrap text-xl font-medium mb-4 uppercase">
                Master Output
            </h3>
        </template>



        <label class="text-xs block mb-1">Master Volume</label>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model="volume"
            @input="updateVolume"
            @dblclick="volume = DEFAULT_VOLUME; updateVolume()"
            class="w-full accent-green-500"
        />

        <!-- Mute -->
        <button
            @click="toggleMute"
            class="mt-3 bg-red-600 hover:bg-red-500 text-white text-xs py-1 px-2 rounded"
        >
            {{ muted ? 'Unmute' : 'Mute' }}
        </button>

        <section class="flex flex-row justify-center mt-4">
            <JackPanel
                :count="1"
                type="input"
                :module-id="id"
                :connected="connectedInputs"
                @patch="handlePatch"
            />
        </section>
    </SynthPanel>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSynthEngine } from '../../composables/useSynthEngine'
import SynthPanel from './SynthPanel.vue'
import JackPanel from '../JackPanel.vue'
import { useModuleConnections } from '../../composables/useModuleConnections'
import { useModuleLifecycle } from '../../composables/useModuleLifecycle'
import {useSynthStore} from "../../storage/synthStore";

const engine = useSynthEngine();
const synth = useSynthStore();
const id = 'master-output'
const context = engine.context

// Nodes
const inputGain = context.createGain()
const masterGain = context.createGain()
useModuleLifecycle(inputGain, masterGain)

const getInputNode = () => inputGain

// Routing: input -> master -> speakers
inputGain.connect(masterGain)
masterGain.connect(context.destination)

// Volume state
const DEFAULT_VOLUME = 0.8
const volume = ref(DEFAULT_VOLUME)
const muted = ref(false)
masterGain.gain.setValueAtTime(volume.value, context.currentTime)

const updateVolume = () => {
    if (!muted.value) {
        masterGain.gain.setTargetAtTime(volume.value, context.currentTime, 0.01)
    }
}

const toggleMute = () => {
    muted.value = !muted.value
    const target = muted.value ? 0 : volume.value
    masterGain.gain.cancelScheduledValues(context.currentTime)
    masterGain.gain.linearRampToValueAtTime(target, context.currentTime + 0.2)
}

let vcaOut = null;

const {connectedInputs, handlePatch} = useModuleConnections(id, {getInputNode})

// Patch registration
onMounted(() => {
    vcaOut = synth.getVCAOutputNode?.()
    if (vcaOut) {
        try {
            vcaOut.disconnect()
        } catch {}
        try {
            vcaOut.connect(inputGain)
        } catch (e) {
            console.warn('Failed to route VCA to MasterOutput', e)
        }
    }
})



onUnmounted(() => {

    if (vcaOut) {
        try {
            vcaOut.disconnect(inputGain)
            vcaOut.connect(context.destination)
        } catch {}
    }

    inputGain.disconnect()
    masterGain.disconnect()
})
</script>
