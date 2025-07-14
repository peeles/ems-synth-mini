<template>
    <div class="flex flex-col items-center">
        <div
            class="bg-transparent border-2 border-stone-600 rounded-sm px-1.5 py-2 flex flex-col items-center gap-2"
            :class="orientation === 'vertical' ? 'flex-col' : 'flex-row'"
        >
            <div
                v-for="i in count"
                :key="i"
                :class="{
                    'bg-yellow-400': connected.includes(i - 1),
                    'bg-gray-800': !connected.includes(i - 1),
                }"
                :id="`${moduleId}-${type}-${i - 1}`"
                class="w-3 h-3 rounded-full cursor-pointer border border-gray-600"
                @click="handleClick(i - 1)"
            />
        </div>
        <span v-if="type !== null" class="mt-1 text-[8px] uppercase">{{
            type
        }}</span>
    </div>
</template>

<script setup>
const props = defineProps({
    count: {
        type: Number,
        default: 2,
    },
    type: {
        type: String,
        default: null,
        validator: val => ['input', 'output', null].includes(val),
    },
    moduleId: {
        type: String,
        required: true,
    },
    connected: {
        type: Array,
        default: () => [],
    },
    orientation: {
        type: String,
        default: 'vertical',
        validator: val => ['vertical', 'horizontal'].includes(val),
    },
});

const emit = defineEmits(['patch']);

const handleClick = index => {
    emit('patch', {
        type: props.type,
        moduleId: props.moduleId,
        index,
    });
};
</script>

<style>
/* Tailwind doesn't include brown-700/900 by default */
.border-brown-700 {
    border-color: #5c3a21;
}
.border-brown-900 {
    border-color: #3a2312;
}
.bg-brown-700 {
    background-color: #5c3a21;
}
</style>
