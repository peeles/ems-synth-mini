<template>
    <svg
        ref="svg"
        class="absolute inset-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg"
    >
        <line
            v-for="(patch, idx) in lines"
            :key="idx"
            :x1="patch.x1"
            :y1="patch.y1"
            :x2="patch.x2"
            :y2="patch.y2"
            stroke="#ffcc00"
            stroke-width="2"
        />
    </svg>
</template>

<script setup>
import {onMounted, watch, ref} from 'vue'
import { usePatchStore } from '../storage/patchStore'

const patchStore = usePatchStore();
const lines = ref([]);
const svg = ref(null);

const getPosition = (moduleId, type, index) => {
    const el = document.getElementById(`${moduleId}-${type}-${index}`)
    const svgEl = svg.value;
    if (!el || !svgEl) {
        return {x: 0, y: 0}
    }

    const rect = el.getBoundingClientRect()
    const svgRect = svgEl.getBoundingClientRect()
    return {
        x: rect.left - svgRect.left + rect.width / 2,
        y: rect.top - svgRect.top + rect.height / 2,
    }
}

const updateLines = () => {
    lines.value = patchStore.patches.map(p => {
        const from = getPosition(p.from.id, 'output', p.from.index)
        const to = getPosition(p.to.id, 'input', p.to.index)
        return { x1: from.x, y1: from.y, x2: to.x, y2: to.y }
    })
}

watch(
    () => patchStore.patches,
    () => updateLines(),
    { deep: true }
)

onMounted(() => {
    updateLines()
    window.addEventListener('resize', updateLines)
})
</script>
