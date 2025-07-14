<template>
    <svg
        ref="svg"
        class="absolute z-50 top-0 left-0 right-0 bottom-0 pointer-events-none"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
    >
        <line
            v-for="(patch, idx) in lines"
            :key="idx"
            :x1="patch.x1"
            :y1="patch.y1"
            :x2="patch.x2"
            :y2="patch.y2"
            :stroke="patch.colour"
            stroke-width="2"
        />
    </svg>
</template>

<script setup>
import {onMounted, onUnmounted, computed, ref} from 'vue';
import {usePatchStore} from '../storage/patchStore';

const patchStore = usePatchStore();
const svg = ref(null);
const resizeTrigger = ref(0);

const getPosition = (moduleId, type, index) => {
    const el = document.getElementById(`${moduleId}-${type}-${index}`);
    const svgEl = svg.value;
    if (!el || !svgEl) {
        return {x: 0, y: 0};
    }

    const rect = el.getBoundingClientRect();
    const svgRect = svgEl.getBoundingClientRect();
    return {
        x: rect.left - svgRect.left + rect.width / 2,
        y: rect.top - svgRect.top + rect.height / 2,
    };
};

const lines = computed(() => {
    resizeTrigger.value;
    return patchStore.patches.map(p => {
        const from = getPosition(p.from.id, 'output', p.from.index);
        const to = getPosition(p.to.id, 'input', p.to.index);
        return {x1: from.x, y1: from.y, x2: to.x, y2: to.y, colour: p.colour};
    });
});

const updateLines = () => {
    resizeTrigger.value++;
};

onMounted(() => {
    updateLines();
    window.addEventListener('resize', updateLines);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateLines);
});
</script>
