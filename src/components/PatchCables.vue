<template>
    <svg
        ref="svg"
        class="absolute z-50 top-0 left-0 right-0 bottom-0 pointer-events-none"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="cableGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stop-color="#888" />
                <stop offset="100%" stop-color="#444" />
            </linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.3)" />
            </filter>
        </defs>

        <path
            v-for="(patch, idx) in lines"
            :key="idx"
            ref="paths"
            :d="patch.path"
            fill="none"
            stroke="url(#cableGradient)"
            stroke-width="8"
            stroke-linecap="round"
            stroke-linejoin="round"
            :stroke-dasharray="patch.length"
            :stroke-dashoffset="patch.length"
            :style="{'animation': 'drawCable 2s ease-out forwards'}"
            filter="url(#shadow)"
        />
    </svg>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, nextTick } from 'vue';
import { usePatchStore } from '../storage/patchStore';

const patchStore = usePatchStore();
const svg = ref(null);
const resizeTrigger = ref(0);
const paths = ref([]); // Store path refs

const getPosition = (moduleId, type, index) => {
    const el = document.getElementById(`${moduleId}-${type}-${index}`);
    const svgEl = svg.value;
    if (!el || !svgEl) {
        return { x: 0, y: 0 };
    }

    const rect = el.getBoundingClientRect();
    const svgRect = svgEl.getBoundingClientRect();
    return {
        x: rect.left - svgRect.left + rect.width / 2,
        y: rect.top - svgRect.top + rect.height / 2,
    };
};

// Calculate smooth Bezier curve and animate stroke
const lines = computed(() => {
    resizeTrigger.value;
    return patchStore.patches.map(p => {
        const from = getPosition(p.from.id, 'output', p.from.index);
        const to = getPosition(p.to.id, 'input', p.to.index);

        // Control point for the Bezier curve (middle point between A and B, adjusted for a smooth arc)
        const controlX = (from.x + to.x) / 2;
        const controlY = (from.y + to.y) / 2 - 100;  // Adjust for more curve

        // Generate the Bezier path
        const path = `M ${from.x} ${from.y} C ${controlX} ${controlY}, ${controlX} ${controlY}, ${to.x} ${to.y}`;

        return {
            path,
            length: 0 // Placeholder for path length
        };
    });
});

const updateLines = () => {
    resizeTrigger.value++;
};

const calculatePathLength = () => {
    nextTick(() => {
        paths.value.forEach((pathElement, index) => {
            const length = pathElement.getTotalLength();
            lines.value[index].length = length; // Set the path length dynamically
        });
    });
};

onMounted(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
    calculatePathLength(); // Calculate path lengths after mounted
});

onUnmounted(() => {
    window.removeEventListener('resize', updateLines);
});
</script>

<style scoped>
@keyframes drawCable {
    to {
        stroke-dashoffset: 0;
    }
}
</style>
