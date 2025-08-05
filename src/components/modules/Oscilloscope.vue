<template>
    <SynthPanel :class="'!p-4'">
        <div
            class="relative flex w-full items-center justify-center overflow-hidden rounded-2xl border-3 border-stone-900 bg-stone-800 shadow-xl group aspect-[4/3]"
        >
            <div
                ref="scopeContainer"
                class="relative w-[95%] h-[95%] bg-gradient-to-b from-stone-600 to-stone-900 rounded-2xl shadow-inner shadow-black/70 overflow-hidden flex items-center justify-center"
            >
                <div
                    class="absolute top-0 left-0 w-full h-full z-[2] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"
                ></div>
                <div
                    v-if="showGrid"
                    class="absolute z-10 inset-0 h-full w-full bg-grid pointer-events-none"
                ></div>
                <canvas
                    ref="scopeCanvas"
                    class="absolute inset-0 top-0 w-full h-full left-0 z-[1]"
                ></canvas>

            </div>
        </div>
        <div class="flex gap-4 pt-3">
            <BaseButton
                id="phase-button"
                :active="phaseLocked"
                :label="phaseLocked ? 'Phase On' : 'Phase Off'"
                class="flex-1 text-xs justify-center font-semibold"
                name="phase"
                title="Toggle Phase Lock"
                @click="phaseLocked = !phaseLocked"
            />
            <BaseButton
                id="grid-button"
                :active="showGrid"
                :label="showGrid ? 'Grid On' : 'Grid Off'"
                class="flex-1 text-xs justify-center font-semibold"
                name="grid"
                title="Toggle Grid"
                @click="showGrid = !showGrid"
            />
            <BaseButton
                id="bright-button"
                :active="bright"
                :label="bright ? 'Bright' : 'Dim'"
                class="flex-1 text-xs justify-center font-semibold"
                name="brightness"
                title="Toggle Brightness"
                @click="bright = !bright"
            />
        </div>
    </SynthPanel>
</template>

<script setup>
import {ref, onMounted, onUnmounted, watch, computed} from 'vue';
import {useSynthEngine} from '@/composables/useSynthEngine';
import {useModuleLifecycle} from '@/composables/useModuleLifecycle';
import {useSynthStore} from '@/storage/synthStore';
import {useAnimationSchedule} from '@/composables/useAnimationSchedule';
import SynthPanel from '@/components/SynthPanel.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const engine = useSynthEngine();
const synthStore = useSynthStore();
const context = engine.context;

const analyser = context.createAnalyser();
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.8;
useModuleLifecycle(analyser);

const scopeContainer = ref(null);
const scopeCanvas = ref(null);
let ctx = null;
let stopRender;
let bufferLength = analyser.fftSize;
let dataArray = new Uint8Array(bufferLength);
const masterGain = ref(null);
const phaseLocked = ref(true);
const showGrid = ref(false);
const bright = ref(true);

const MAX_POINTS = 512;
const lineColor = computed(() => bright.value ? '#4ade80' : '#14532d');
const bgFade = computed(() => bright.value ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.4)');


const FPS = 30;
const frameInterval = 1000 / FPS;
let lastFrameTime = 0;


const resizeCanvas = () => {
    const canvas = scopeCanvas.value;
    const container = scopeContainer.value;
    if (!canvas || !container) {
        return;
    }
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
};

// Convert byte data → smoothed points centered vertically
const processPoints = canvas => {
    const downsample = Math.floor(bufferLength / MAX_POINTS);
    const points = [];
    const sliceWidth = canvas.width / MAX_POINTS;

    let x = 0;
    let startIndex = 0;

    if (phaseLocked.value) {
        for (let i = 1; i < bufferLength; i++) {
            if (dataArray[i - 1] < 128 && dataArray[i] >= 128) {
                startIndex = i;
                break;
            }
        }
    }

    for (let i = 0; i < MAX_POINTS; i++) {
        const idx = (startIndex + i * downsample) % bufferLength;
        const v = (dataArray[idx] - 128) / 128.0; // -1 → +1
        const y = canvas.clientHeight / 2 + v * (canvas.clientHeight / 2);
        points.push({x, y});
        x += sliceWidth;
    }
    return points;
};

// Draw smooth curve
const drawCurve = points => {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    const n = points.length - 1;
    ctx.quadraticCurveTo(
        points[n - 1].x,
        points[n - 1].y,
        points[n].x,
        points[n].y
    );
    ctx.stroke();
};

// Render loop
const render = time => {
    const delta = time - lastFrameTime;
    if (delta < frameInterval) {
        return;
    }

    lastFrameTime = time - (delta % frameInterval);
    analyser.getByteTimeDomainData(dataArray);
    const canvas = scopeCanvas.value;

    if (!canvas) {
        return;
    }

    ctx.fillStyle = bgFade.value;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.strokeStyle = lineColor.value;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = lineColor.value;
    ctx.shadowBlur = 1;

    const points = processPoints(canvas);
    drawCurve(points);
};

watch(
    () => synthStore.getMasterOutputNode?.(),
    (node, prev) => {
        if (prev) {
            try {
                prev.disconnect(analyser);
            } catch {
                console.warn(
                    'Failed to disconnect previous master gain from analyser'
                );
            }
        }
        if (node) {
            try {
                node.connect(analyser);
            } catch {
                console.warn('Failed to connect master gain to analyser');
            }
        }
        masterGain.value = node;
    },
    {immediate: true}
);

onMounted(() => {
    ctx = scopeCanvas.value.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    stopRender = useAnimationSchedule(render);
});

onUnmounted(() => {
    stopRender?.();

    window.removeEventListener('resize', resizeCanvas);
    analyser.disconnect();

    if (masterGain.value) {
        try {
            masterGain.value.disconnect(analyser);
        } catch (e) {
            console.warn('Failed to disconnect master gain from analyser');
        } finally {
            masterGain.value = null;
        }
    }
});
</script>
