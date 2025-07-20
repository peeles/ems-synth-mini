<template>
    <SynthPanel>
        <div class="relative w-full aspect-video h-auto bg-stone-700 mx-auto rounded-md shadow-[inset_0_0_25px_rgba(0,0,0,0.5)]">
            <div class="absolute inset-[1%] bg-black rounded-lg shadow-inner p-1">
                <canvas ref="scopeCanvas" class="w-full h-full rounded-md" />
            </div>
        </div>
    </SynthPanel>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSynthEngine } from '../../composables/useSynthEngine'
import { useSynthStore } from '../../storage/synthStore'
import { useModuleLifecycle } from '../../composables/useModuleLifecycle'
import SynthPanel from './SynthPanel.vue'

const engine = useSynthEngine()
const synth = useSynthStore()
const context = engine.context

const scopeCanvas = ref(null)
const analyser = context.createAnalyser()
useModuleLifecycle(analyser)

let vcaOut = null
let rafId = null

onMounted(() => {
    vcaOut = synth.getVCAOutputNode?.()
    if (vcaOut) {
        try {
            vcaOut.connect(analyser)
        } catch {}
    }

    const canvas = scopeCanvas.value
    const ctx = canvas.getContext('2d')

    analyser.fftSize = 1024
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
        rafId = requestAnimationFrame(draw)

        analyser.getByteTimeDomainData(dataArray)

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
    }

    draw()
})

onUnmounted(() => {
    if (rafId) {
        cancelAnimationFrame(rafId)
    }

    try {
        vcaOut?.disconnect(analyser)
    } catch {}

    analyser.disconnect()
})
</script>
