<template>
    <SynthPanel>
        <template #heading>
            <section class="flex flex-row items-center justify-between mb-8">
                <h3 class="w-1/2 text-wrap text-xl font-medium uppercase">
                    Master Output
                </h3>
            </section>
        </template>

        <section class="flex justify-around items-end h-58 mb-8">
            <div class="flex flex-col items-center justify-start h-full">
                <div class="relative w-6 text-center mt-0.5">
                    <VerticalSlider
                        v-model.number="volume"
                        :min="0"
                        :max="1"
                        :step="0.01"
                        :show-labels="false"
                        @input="updateVolume"
                        @dblclick="
                            volume = DEFAULT_VOLUME;
                            updateVolume();
                        "
                        class="!w-6"
                    />
                    <label
                        class="w-full block text-xs font-semibold mt-3 mx-auto"
                    >
                        {{ (volume * 10).toFixed(0) }}
                    </label>
                </div>
            </div>

            <div class="flex flex-col items-center justify-start h-full">
                <div
                    class="relative flex flex-col items-center h-53 justify-between mt-0.5"
                >
                    <template v-for="n in 11" :key="n">
                        <div class="flex items-center w-14">
                            <div class="flex-1 border-t border-gray-800 mx-1" />
                            <span class="w-6 text-center text-xs font-bold">{{
                                10 - (n - 1)
                            }}</span>
                            <div class="flex-1 border-t border-gray-800 mx-1" />
                        </div>
                    </template>
                </div>
            </div>

            <div class="relative w-6 h-full">
                <div
                    class="relative w-full h-52 mt-0.5 bg-gray-300 border border-black rounded-sm overflow-hidden"
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
                <label
                    class="w-full block text-xs text-center font-semibold mt-3 mx-auto"
                >
                    L
                </label>
            </div>

            <div class="relative w-6 h-full">
                <div
                    class="relative w-6 h-52 mt-0.5 bg-gray-300 border border-black rounded-sm overflow-hidden"
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
                <label
                    class="w-full block text-xs text-center font-semibold mt-3 mx-auto"
                >
                    R
                </label>
            </div>
        </section>

        <div class="flex flex-row items-center justify-between gap-6">
            <BaseButton
                id="mute-button"
                title="Toggle Mute"
                name="mute"
                :aria-activedescendant="true"
                @click="toggleMute"
                class="!w-1/2 text-xs justify-center font-semibold"
            >
                {{ muted ? 'Unmute' : 'Mute' }}
            </BaseButton>
            <BaseButton
                id="normalise-button"
                title="Toggle Normalise"
                name="normalise"
                :aria-activedescendant="true"
                @click="toggleNormalise"
                class="!w-1/2 text-xs justify-center font-semibold"
            >
                {{ normalise ? 'Auto-Gain' : 'Manual Gain' }}
            </BaseButton>
        </div>

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
import {ref, onMounted, onUnmounted, computed} from 'vue';
import {useSynthEngine} from '../../composables/useSynthEngine';
import SynthPanel from './SynthPanel.vue';
import JackPanel from '../JackPanel.vue';
import {useModuleConnections} from '../../composables/useModuleConnections';
import {useModuleLifecycle} from '../../composables/useModuleLifecycle';
import {useSynthStore} from '../../storage/synthStore';
import VerticalSlider from '../VerticalSlider.vue';
import BaseButton from '../base/BaseButton.vue';

const engine = useSynthEngine();
const synth = useSynthStore();
const id = 'master-output';
const context = engine.context;

// Nodes
const inputGain = context.createGain();
const masterGain = context.createGain();
useModuleLifecycle(inputGain);

const getInputNode = () => inputGain;

// Routing: input -> master -> speakers
inputGain.connect(masterGain);
masterGain.connect(context.destination);

// Volume state
const DEFAULT_VOLUME = 0.8;
const volume = ref(DEFAULT_VOLUME);
const muted = ref(false);
masterGain.gain.setValueAtTime(volume.value, context.currentTime);

// Meter state
const leftLevel = ref(0);
const rightLevel = ref(0);
const normalise = ref(true);
const GAIN_SCALE = 4;

let splitter, analyserL, analyserR, bufferL, bufferR, rafId;

const updateVolume = () => {
    if (!muted.value) {
        masterGain.gain.setTargetAtTime(
            volume.value,
            context.currentTime,
            0.01
        );
    }
};

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
        return normalise.value ? Math.min(raw * GAIN_SCALE, 1) : raw;
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

const toggleMute = () => {
    muted.value = !muted.value;
    const target = muted.value ? 0 : volume.value;
    masterGain.gain.cancelScheduledValues(context.currentTime);
    masterGain.gain.linearRampToValueAtTime(target, context.currentTime + 0.2);
};

const toggleNormalise = () => {
    normalise.value = !normalise.value;
    if (normalise.value) {
        leftLevel.value = Math.min(leftLevel.value * GAIN_SCALE, 1);
        rightLevel.value = Math.min(rightLevel.value * GAIN_SCALE, 1);
    } else {
        leftLevel.value /= GAIN_SCALE;
        rightLevel.value /= GAIN_SCALE;
    }
};

let vcaOut = null;

const {connectedInputs, handlePatch} = useModuleConnections(id, {getInputNode});

// Patch registration
onMounted(() => {
    synth.setMasterOutputNode?.(masterGain);
    vcaOut = synth.getVCAOutputNode?.();

    if (vcaOut) {
        try {
            vcaOut.disconnect();
        } catch {}
        try {
            vcaOut.connect(inputGain);
        } catch (e) {
            console.warn('Failed to route VCA to MasterOutput', e);
        }
    }

    splitter = context.createChannelSplitter(2);
    analyserL = context.createAnalyser();
    analyserR = context.createAnalyser();
    analyserL.fftSize = 256;
    analyserR.fftSize = 256;
    useModuleLifecycle(splitter, analyserL, analyserR);

    bufferL = new Uint8Array(analyserL.frequencyBinCount);
    bufferR = new Uint8Array(analyserR.frequencyBinCount);

    masterGain.connect(splitter);
    splitter.connect(analyserL, 0);
    splitter.connect(analyserR, 1);

    document.addEventListener('visibilitychange', handleVisibility);

    update();
});

onUnmounted(() => {
    synth.setMasterOutputNode?.(null);

    if (vcaOut) {
        try {
            vcaOut.disconnect(inputGain);
            vcaOut.connect(context.destination);
        } catch {}
    }

    cancelAnimationFrame(rafId);
    document.removeEventListener('visibilitychange', handleVisibility);
    analyserL?.disconnect();
    analyserR?.disconnect();
    splitter?.disconnect();

    inputGain.disconnect();
    masterGain.disconnect();
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
