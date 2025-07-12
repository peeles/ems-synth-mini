<template>
    <div
        class="bg-transparent border-2 border-stone-600 rounded-sm px-1.5 py-2 flex flex-col items-center gap-2"
    >
        <div
            v-for="(jack, index) in count"
            :key="index"
            class="w-3 h-3 rounded-full bg-brown-700 shadow-inner border border-stone-800 cursor-pointer"
            @click="$emit('toggle', index)"
        ></div>
    </div>
</template>

<script setup>
defineProps({
    count: {
        type: Number,
        default: 2
    }
})
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
