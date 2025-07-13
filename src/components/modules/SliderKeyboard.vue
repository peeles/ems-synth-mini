<template>
    <div
        class="bg-[#f5c44e] border border-black rounded-sm shadow-md p-2 font-mono text-[10px] text-black uppercase tracking-wide"
    >
        <h3 class="text-xs font-bold uppercase text-center">Slider Keyboard</h3>

        <div class="space-y-2">
            <div
                class="bg-gradient-to-t from-black to-gray-800 h-[40px] rounded-sm"
            >
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    v-model.number="position"
                    @change="playNote"
                    class="w-full h-[8px] accent-black bg-black/10 rounded-full"
                />
            </div>

            <div class="mt-2 text-center text-xs">
                Frequency: <strong>{{ currentFrequency.toFixed(1) }} Hz</strong>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, computed} from 'vue';
import {useSynthStore} from '../../storage/synthStore';

const synth = useSynthStore();

// 0–100 slider position (normalized "touch strip")
const position = ref(50);

// Map position to frequency (e.g. 200–1000 Hz)
const currentFrequency = computed(() => {
    const min = 200;
    const max = 1000;
    return min + (max - min) * (position.value / 100);
});

// On slider release, set frequency and trigger envelope
const playNote = () => {
    synth.setVcoFrequency(currentFrequency.value);
    synth.triggerEnvelope();
};
</script>
