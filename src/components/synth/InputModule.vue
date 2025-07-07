<template>
    <SynthPanel :title="'Input Module'">
        <div>
            <label class="block text-xs font-semibold mb-1">
                External Signal Level
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="extSignal"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                Envelope In Level
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="extEnvelope"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                High-Level Input
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="highLevel"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>

        <div>
            <label class="block text-xs font-semibold mb-1">
                Low-Level Input
            </label>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                v-model.number="lowLevel"
                class="w-full h-[8px] accent-black bg-black/10 rounded-full"
            />
        </div>
    </SynthPanel>
</template>

<script setup>
import { ref } from 'vue'
import SynthPanel from "../SynthPanel.vue";

// Placeholder state — can wire into synthStore or audio input later
const extSignal = ref(0.5)
const extEnvelope = ref(0.5)
const highLevel = ref(0.5)
const lowLevel = ref(0.5)
</script>
