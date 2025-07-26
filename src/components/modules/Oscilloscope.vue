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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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

let sourceNode = null
let rafId = null
let canvas
let ctx
let dpr = 1

const resize = () => {
    if (!canvas || !ctx) return
    dpr = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

onMounted(() => {
    canvas = scopeCanvas.value
    ctx = canvas.getContext('2d')

    sourceNode =
        synth.getMixerOutputNode?.() || synth.getVCAOutputNode?.()

    if (sourceNode) {
        try {
            sourceNode.connect(analyser)
        } catch {}
    }

    analyser.fftSize = 1024
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
        rafId = requestAnimationFrame(draw)

        analyser.getByteTimeDomainData(dataArray)

        const width = canvas.width / dpr
        const height = canvas.height / dpr

        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, width, height)

        ctx.lineWidth = 2
        ctx.strokeStyle = '#4ade80'
        ctx.beginPath()

        const sliceWidth = width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0
            const y = (v * height) / 2
            if (i === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
            x += sliceWidth
        }

        ctx.lineTo(width, height / 2)
        ctx.stroke()
    }

    nextTick(() => {
        requestAnimationFrame(() => {
            resize()
            draw()
        })
    })
    window.addEventListener('resize', resize)
})

onUnmounted(() => {
    if (rafId) {
        cancelAnimationFrame(rafId)
    }
    window.removeEventListener('resize', resize)

    try {
        sourceNode?.disconnect(analyser)
    } catch {}

    analyser.disconnect()
})
</script>
