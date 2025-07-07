<template>
    <div
        class="bg-[#f5c44e] border border-black rounded shadow-inner p-6 font-mono text-black
        uppercase tracking-wide space-y-2"
    >
        <h3 class="text-center text-sm font-medium mb-1">{{ title }}</h3>
        <div class="space-y-3">
            <slot />
        </div>
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
})
</script>
