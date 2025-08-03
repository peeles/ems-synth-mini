<template>
    <button
        :type="type"
        :class="[
            'flex w-full py-1.5 px-2 bg-transparent border-2 border-stone-700 rounded cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent focus:bg-stone-50/75',
            'active:bg-stone-100 active:border-stone-800',
            'disabled:cursor-not-allowed disabled:bg-stone-200 disabled:border-stone-300 disabled:text-stone-400',
        ]"
        :disabled="disabled"
        @keydown.enter="$emit('click')"
        @keydown.space="$emit('click')"
        @keydown="e => e.stopPropagation()"
        @mousedown.prevent="$emit('click')"
        @touchstart.prevent="$emit('click')"
        @click.stop.prevent="$emit('click')"
    >
        <slot>{{ label }}</slot>
    </button>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'button',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});
</script>
