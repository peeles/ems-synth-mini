<template>
    <SynthPanel>
        <div class="flex justify-around items-end h-[140px]">
            <!-- Left Meter -->
            <div
                class="relative w-6 h-full bg-gray-300 border border-black rounded-sm overflow-hidden"
            >
                <div
                    v-for="tick in 20"
                    :key="'l' + tick"
                    class="absolute left-0 w-full h-[1px] bg-black/20"
                    :style="{bottom: `${(tick / 20) * 100}%`}"
                />
                <div
                    class="absolute bottom-0 left-0 w-full transition-all duration-100"
                    :class="leftColor"
                    :style="{height: `${leftLevel * 100}%`}"
                />
            </div>

            <!-- Right Meter -->
            <div
                class="relative w-6 h-full bg-gray-300 border border-black rounded-sm overflow-hidden"
            >
                <div
                    v-for="tick in 20"
                    :key="'r' + tick"
                    class="absolute left-0 w-full h-[1px] bg-black/20"
                    :style="{bottom: `${(tick / 20) * 100}%`}"
                />
                <div
                    class="absolute bottom-0 left-0 w-full transition-all duration-100"
                    :class="rightColor"
                    :style="{height: `${rightLevel * 100}%`}"
                />
            </div>
        </div>

        <!-- Labels -->
        <div
            class="flex justify-around mt-1 text-[10px] font-mono uppercase tracking-wider"
        >
            <span>L</span>
            <span>R</span>
        </div>

        <div class="mt-2 text-center text-[10px]">
            <label class="inline-flex items-center space-x-2 cursor-pointer">
                <input
                    type="checkbox"
                    v-model="normalize"
                    class="accent-black"
                />
                <span>Normalize Gain</span>
            </label>
        </div>
    </SynthPanel>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed} from 'vue';
import {useSynthEngine} from '../../composables/useSynthEngine';
import {useSynthStore} from '../../storage/synthStore';
import SynthPanel from './SynthPanel.vue';

const engine = useSynthEngine();
const synth = useSynthStore();
const context = engine.context;

const leftLevel = ref(0);
const rightLevel = ref(0);
const normalize = ref(true); // toggle state
const GAIN_SCALE = 4;

let splitter, analyserL, analyserR, bufferL, bufferR, rafId;

const update = () => {
    if (document.hidden) {
        rafId = null;
        return;
    }

    analyserL.getByteTimeDomainData(bufferL);
    analyserR.getByteTimeDomainData(bufferR);

    const rms = data => {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            const norm = (data[i] - 128) / 128;
            sum += norm * norm;
        }
        const raw = Math.sqrt(sum / data.length);
        return normalize.value ? Math.min(raw * GAIN_SCALE, 1) : raw;
    };

    leftLevel.value = rms(bufferL);
    rightLevel.value = rms(bufferR);

    rafId = requestAnimationFrame(update);
};

const handleVisibility = () => {
    if (!document.hidden && rafId == null) {
        update();
    } else if (document.hidden && rafId != null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
};

onMounted(() => {
    const vcaOut = synth.getVCAOutputNode();
    if (!vcaOut) {
        console.warn('VCA output node not ready');
        return;
    }

    splitter = context.createChannelSplitter(2);
    analyserL = context.createAnalyser();
    analyserR = context.createAnalyser();
    analyserL.fftSize = 256;
    analyserR.fftSize = 256;

    bufferL = new Uint8Array(analyserL.frequencyBinCount);
    bufferR = new Uint8Array(analyserR.frequencyBinCount);

    // tap the VCA output for metering
    vcaOut.connect(splitter);
    splitter.connect(analyserL, 0);
    splitter.connect(analyserR, 1);

    document.addEventListener('visibilitychange', handleVisibility);

    update();
});

onUnmounted(() => {
    cancelAnimationFrame(rafId);
    document.removeEventListener('visibilitychange', handleVisibility);
    analyserL?.disconnect();
    analyserR?.disconnect();
    splitter?.disconnect();
});

const leftColor = computed(() => {
    if (leftLevel.value > 0.7) {
        return 'bg-red-600';
    }

    if (leftLevel.value > 0.4) {
        return 'bg-yellow-400';
    }

    return 'bg-green-600';
});

const rightColor = computed(() => {
    if (rightLevel.value > 0.7) {
        return 'bg-red-600';
    }

    if (rightLevel.value > 0.4) {
        return 'bg-yellow-400';
    }
    return 'bg-green-600';
});
</script>
