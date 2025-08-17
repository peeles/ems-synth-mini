<template>
    <button
        :type="type"
        :class="[
            'flex w-full py-1.5 px-2 bg-transparent border-2 border-stone-700 text-stone-700 rounded cursor-pointer transition ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent focus:bg-stone-50/75',
            'disabled:cursor-not-allowed disabled:bg-stone-200 disabled:border-stone-300 disabled:text-stone-400',
            {
                'ring-2 ring-stone-700 !border-transparent !bg-stone-50/75':
                    active,
            },
        ]"
        :disabled="disabled"
        @click="emitClick($event)"
    >
        <slot>{{ label }}</slot>
    </button>
</template>

<script setup>
import {nextTick, onMounted} from 'vue';

defineProps({
    active: {
        type: Boolean,
        default: false,
    },
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

const emit = defineEmits(['click']);

onMounted(() => {
    nextTick(() => {
        const button = document.querySelector('button');
        if (button) {
            button.blur();
        }
    });
});

const emitClick = event => {
    emit('click');
    event.currentTarget.blur();
};
</script>
