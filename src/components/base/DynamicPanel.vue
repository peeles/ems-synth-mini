<template>
    <transition
        name="slide"
        enter-active-class="transition-all duration-300 ease-in-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition-all duration-300 ease-in-out"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
    >
        <aside
            v-if="asideStore.isOpen"
            class="fixed top-0 right-0 w-96 max-w-full h-full bg-white shadow-xl rounded-l-lg border-l border-gray-200 z-50 flex flex-col"
        >
            <header
                class="p-4 flex justify-between items-center"
            >
                <h2 class="text-lg text-stone-700 font-medium">
                    {{ asideStore.contentProps.title }}
                </h2>
                <button
                    class="text-gray-700 hover:text-gray-900 cursor-pointer focus:outline-none"
                    @click="asideStore.close"
                >
                    ✕
                </button>
            </header>

            <section class="flex flex-col flex-1 overflow-y-auto justify-between p-4">
                <component
                    :is="asideStore.content"
                    v-bind="asideStore.contentProps"
                />
            </section>
        </aside>
    </transition>
</template>

<script setup>
import useAsideStore from '@/storage/asideStore';

defineEmits(['close']);

const asideStore = useAsideStore();
</script>
