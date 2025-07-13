<template>
    <SynthPanel :title="'Inverter'">
        <div class="text-xs text-center text-gray-700">
            This utility inverts any signal connected to phase shift.
        </div>

        <div class="mt-3 text-center">
            <span
                class="inline-block px-2 py-1 bg-gray-200 text-[10px] font-mono rounded"
            >
                Gain = –1
            </span>
        </div>
    </SynthPanel>
</template>

<script setup>
// No interactive logic — this is a routing utility
import SynthPanel from '../SynthPanel.vue';
</script>
