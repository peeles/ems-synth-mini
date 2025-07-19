<template>
    <ul class="flex gap-1 my-3 text-xs mx-auto">
        <li
            v-for="(option, index) in options"
            :key="index"
            class="relative flex-1"
        >
            <input
                class="sr-only peer"
                type="radio"
                :value="option.value"
                :name="name"
                :id="name + '_' + option.value"
                v-model="selectedValue"
                @change="selectOption(option.value)"
            />
            <label
                class="flex w-full py-1.5 px-2 bg-transparent border-2 border-stone-700 rounded cursor-pointer focus:outline-none
                peer-checked:ring-stone-700 peer-checked:ring-2 peer-checked:border-transparent peer-checked:bg-stone-50/75"
                :for="name + '_' + option.value"
            >
                {{ option.name }}
            </label>
        </li>
    </ul>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    options: {
        type: Array,
        required: true,
    },
    modelValue: {
        type: [String, Number],
        default: null,
    }
});

const emit = defineEmits(['update:modelValue']);
const selectedValue = ref(props.modelValue);

const selectOption = (value) => {
    selectedValue.value = value;
    emit('update:modelValue', value);
};

watch(() => props.modelValue, (newValue) => {
    selectedValue.value = newValue;
});
</script>
