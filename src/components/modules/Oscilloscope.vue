<template>
    <div class="relative w-full aspect-square bg-black rounded-lg ">
        <canvas ref="scopeCanvas" class="absolute top-0 left-0 right-0 inset-0"></canvas>

        <div class="absolute top-2 left-2 flex gap-2 text-xs text-green-400">
            <button @click="phaseLocked = !phaseLocked" class="px-2 py-1 bg-green-900/30 rounded">
                Phase Lock: {{ phaseLocked ? 'On' : 'Off' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSynthEngine } from '../../composables/useSynthEngine'
import { useModuleLifecycle } from '../../composables/useModuleLifecycle'

const engine = useSynthEngine()
const context = engine.context
const masterGain = context.createGain();

// ---- ANALYSER ----
const analyser = context.createAnalyser()
analyser.fftSize = 2048
analyser.smoothingTimeConstant = 0.8
useModuleLifecycle(analyser)

const scopeCanvas = ref(null)
let ctx = null
let animationFrame = null
let bufferLength = analyser.fftSize
let dataArray = new Uint8Array(bufferLength)

const phaseLocked = ref(true)

// ---- VISUAL SETTINGS ----
const MAX_POINTS = 512
const lineColor = '#4ade80'
const bgFade = 'rgba(0, 0, 0, 0.25)'

// ---- PERFORMANCE ----
const FPS = 60
const frameInterval = 1000 / FPS
let lastFrameTime = 0

// Resize canvas to device pixel ratio for crisp lines
const resizeCanvas = () => {
    const canvas = scopeCanvas.value
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
}

// Convert byte data → smoothed points centered vertically
const processPoints = (canvas) => {
    const downsample = Math.floor(bufferLength / MAX_POINTS)
    const points = []
    const sliceWidth = canvas.clientWidth / MAX_POINTS

    let x = 0
    let startIndex = 0

    if (phaseLocked.value) {
        for (let i = 1; i < bufferLength; i++) {
            if (dataArray[i - 1] < 128 && dataArray[i] >= 128) {
                startIndex = i
                break
            }
        }
    }

    for (let i = 0; i < MAX_POINTS; i++) {
        const idx = (startIndex + i * downsample) % bufferLength
        const v = (dataArray[idx] - 128) / 128.0 // -1 → +1
        const y = canvas.clientHeight / 2 + v * (canvas.clientHeight / 2)
        points.push({ x, y })
        x += sliceWidth
    }
    return points
}

// Draw smooth curve
const drawCurve = (points) => {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2
        const yc = (points[i].y + points[i + 1].y) / 2
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
    }
    const n = points.length - 1
    ctx.quadraticCurveTo(points[n - 1].x, points[n - 1].y, points[n].x, points[n].y)
    ctx.stroke()
}

// Render loop
const render = (time) => {
    animationFrame = requestAnimationFrame(render)
    const delta = time - lastFrameTime
    if (delta < frameInterval) return
    lastFrameTime = time - (delta % frameInterval)

    analyser.getByteTimeDomainData(dataArray)
    const canvas = scopeCanvas.value
    if (!canvas) return

    ctx.fillStyle = bgFade
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1.5
    ctx.shadowColor = lineColor
    ctx.shadowBlur = 4

    const points = processPoints(canvas)
    drawCurve(points)
}

onMounted(() => {
    // ✅ Route from master gain (final output)
    if (masterGain) {
        try { masterGain.connect(analyser) } catch {}
    }

    ctx = scopeCanvas.value.getContext('2d')
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    render()
})

onUnmounted(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame)
    window.removeEventListener('resize', resizeCanvas)
    analyser.disconnect()
})
</script>
