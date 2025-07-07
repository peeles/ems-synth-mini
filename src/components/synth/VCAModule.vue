<template>
    <div class="absolute" :style="{ top: '150px', left: '720px' }">
        <h3 class="text-md font-bold mb-2">VCA</h3>
        <div class="mb-2">
            <label class="block text-sm">Mode:
                <span v-if="vcaMode === 0">Envelope</span>
                <span v-else-if="vcaMode === 1">Ring Mod</span>
                <span v-else>{{ (vcaMode * 100).toFixed(0) + '%' }}</span>
            </label>
            <input type="range" min="0" max="1" step="0.01"
                   v-model.number="vcaMode"
                   @input="onModeChange"
                   class="w-full accent-purple-500" />
        </div>
        <!-- (Optional: could include an output level knob if needed) -->
    </div>
</template>

<script setup>
import {computed} from "vue";
import { useSynthStore } from '../../storage/synthStore';

const synth = useSynthStore();

const vcaMode = computed({
    get: () => synth.vcaMode,
    set: (val) => synth.setVcaMode(val)
});

const onModeChange = () => synth.setVcaMode(vcaMode.value);
</script>
