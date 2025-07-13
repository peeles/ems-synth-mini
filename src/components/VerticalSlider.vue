<template>
    <div class="h-52 w-10 flex items-center justify-center relative">
        <div v-if="showLabels" class="absolute top-0 text-xs text-gray-500">
            {{ max }}
        </div>
        <input
            type="range"
            :min="min"
            :max="max"
            :step="step"
            v-model="value"
            @input="$emit('update:modelValue', +value)"
            class="absolute origin-center rotate-[-90deg] h-2 rounded accent-black bg-black/10 cursor-pointer"
            :class="!showLabels ? 'w-52' : 'w-40'"
        />
        <div v-if="showLabels" class="absolute bottom-0 text-xs text-gray-500">
            {{ min }}
        </div>
    </div>
</template>

<script setup>
import {ref, watch} from 'vue';

const props = defineProps({
    modelValue: {
        type: Number,
        required: true,
    },
    min: {
        type: Number,
        default: 0,
    },
    max: {
        type: Number,
        default: 100,
    },
    step: {
        type: Number,
        default: 1,
    },
    showLabels: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['update:modelValue']);
const value = ref(props.modelValue);

watch(
    () => props.modelValue,
    v => {
        value.value = v;
    }
);
</script>
