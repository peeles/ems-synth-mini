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
            class="fixed top-0 right-0 w-96 max-w-full h-full bg-white shadow-xl rounded-l-lg border-l border-stone-200 z-50 flex flex-col"
        >
            <header class="p-4 flex justify-between items-center">
                <button
                    class="text-stone-700 hover:text-stone-900 cursor-pointer focus:outline-none ml-auto"
                    @click="asideStore.close"
                >
                    ✕
                </button>
            </header>

            <section
                class="flex flex-col flex-1 overflow-y-auto justify-between p-4"
            >
                <component
                    :is="asideStore.content"
                    v-bind="asideStore.contentProps"
                />
            </section>
        </aside>
    </transition>
</template>

<script setup>
import {useAsideStore} from '@/storage/asideStore';

const asideStore = useAsideStore();
</script>
