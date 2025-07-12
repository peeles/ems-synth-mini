<template>
    <div
        class="bg-[#f5c44e] flex flex-col h-full border border-black rounded shadow-inner p-6 text-black
        tracking-wide space-y-2"
    >
        <slot name="heading" />
        <div class="flex- 1 space-y-3">
            <slot />
        </div>
    </div>
</template>

<script setup>
</script>
