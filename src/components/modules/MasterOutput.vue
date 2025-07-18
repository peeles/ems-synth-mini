<template>
    <SynthPanel>
        <template #heading>
            <h3 class="text-center text-wrap text-xl font-medium mb-4 uppercase">
                Master Output
            </h3>
        </template>

        <div class="relative w-full aspect-video h-auto bg-stone-700 mx-auto rounded-md shadow-[inset_0_0_25px_rgba(0,0,0,0.5)]">
            <div class="absolute inset-[1%] bg-black rounded-lg shadow-inner p-1">
                <canvas
                    ref="scopeCanvas"
                    class="w-full h-full rounded-md"
                />
            </div>
        </div>

        <label class="text-xs block mb-1">Master Volume</label>
        <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model="volume"
            @input="updateVolume"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
const analyser = context.createAnalyser()

useModuleLifecycle(inputGain, masterGain, analyser)

const getInputNode = () => inputGain

// Routing: input -> master -> analyser -> speakers
inputGain.connect(masterGain)
masterGain.connect(analyser)
analyser.connect(context.destination)

// Volume state
const volume = ref(0.8)
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



// Meter + scope state
const scopeCanvas = ref(null)
const pulseLeft = ref(0)
const pulseRight = ref(0)
const overloaded = ref(false)

let animationFrame = null

onMounted(() => {
    const canvas = scopeCanvas.value
    const ctx = canvas.getContext('2d')

    analyser.fftSize = 1024
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
        animationFrame = requestAnimationFrame(draw)

        analyser.getByteTimeDomainData(dataArray)

        // Draw scope
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.lineWidth = 2
        ctx.strokeStyle = '#4ade80'
        ctx.beginPath()

        const sliceWidth = canvas.width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0
            const y = (v * canvas.height) / 2
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            x += sliceWidth
        }

        ctx.lineTo(canvas.width, canvas.height / 2)
        ctx.stroke()

        // L/R pseudo-RMS from halves
        const mid = bufferLength / 2
        const rms = arr =>
            Math.sqrt(arr.reduce((sum, v) => sum + (v - 128) ** 2, 0) / arr.length)

        pulseLeft.value = Math.min(rms(dataArray.slice(0, mid)) * 2, 255)
        pulseRight.value = Math.min(rms(dataArray.slice(mid)) * 2, 255)

        // Overload detection
        overloaded.value = pulseLeft.value > 220 || pulseRight.value > 220
    }

    draw()
})

onUnmounted(() => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame)
    }

    if (scopeCanvas.value) {
        const ctx = scopeCanvas.value.getContext('2d')
        ctx.clearRect(0, 0, scopeCanvas.value.width, scopeCanvas.value.height)
    }

    if (vcaOut) {
        try {
            vcaOut.disconnect(inputGain)
            vcaOut.connect(context.destination)
        } catch {}
    }

    inputGain.disconnect()
    masterGain.disconnect()
    analyser.disconnect()
})

const getMeterColor = (value) => {
    if (value > 220) {
        return '#f87171';
    }
    if (value > 140) {
        return '#facc15';
    }

    return '#4ade80';
}
</script>
