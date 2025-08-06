<template>
    <div class="flex flex-col grow">
        <ul
            v-if="patchStore.patches.length"
            class="flex-1 overflow-y-auto p-4 space-y-2"
        >
            <li
                v-for="(patch, idx) in patchStore.patches"
                :key="idx"
                class="flex justify-between items-center text-sm"
            >
                <p class="text-stone-700">
                    {{ registry.get(patch.from.id)?.name || patch.from.id }} →
                    {{ registry.get(patch.to.id)?.name || patch.to.id }}
                </p>
                <button
                    class="text-red-600 hover:underline"
                    @click="disconnect(patch)"
                >
                    remove
                </button>
            </li>
        </ul>
        <p
            v-else
            class="text-gray-600 text-sm text-center"
        >
            No active patches
        </p>
    </div>
    <div class="flex shrink">
        <button
            class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded cursor-pointer"
            @click="clearAll"
        >
            Clear All Patches
        </button>
    </div>
</template>

<script setup>
import {usePatchStore} from '@/storage/patchStore';
import {useModuleRegistry} from '@/composables/useModuleRegistry';

const emit = defineEmits(['close']);
const patchStore = usePatchStore();
const registry = useModuleRegistry();

const disconnect = patch => {
    const fromModule = registry.get(patch.from.id);
    const toModule = registry.get(patch.to.id);
    if (fromModule && toModule) {
        patchStore.disconnectNodes(
            fromModule,
            patch.from.index,
            toModule,
            patch.to.index
        );
    }
};

const clearAll = () => {
    patchStore.resetPatches();
    emit('close');
};
</script>
