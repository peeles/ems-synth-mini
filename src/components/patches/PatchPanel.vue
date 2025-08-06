<template>
    <div class="flex flex-col grow">
        <div class="p-4 border-b flex items-center gap-2">
            <select
                v-model="selectedPreset"
                class="border rounded p-1 flex-1 text-sm"
            >
                <option disabled value="">Select Preset</option>
                <optgroup label="Built-in">
                    <option
                        v-for="p in presetStore.builtinPresets"
                        :key="p.name"
                        :value="p.name"
                    >
                        {{ p.name }}
                    </option>
                </optgroup>
                <optgroup label="User">
                    <option
                        v-for="p in presetStore.userPresets"
                        :key="p.name"
                        :value="p.name"
                    >
                        {{ p.name }}
                    </option>
                </optgroup>
            </select>
            <button
                class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
                :disabled="!selectedPreset"
                @click="loadSelected"
            >
                Load
            </button>
            <button
                class="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
                @click="saveCurrent"
            >
                Save
            </button>
            <button
                class="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
                @click="presetStore.resetToDefault"
            >
                Default
            </button>
        </div>
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
        <p v-else class="text-gray-600 text-sm text-center">
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
import {usePresetStore} from '@/storage/presetStore';
import {useModuleRegistry} from '@/composables/useModuleRegistry';
import {ref} from 'vue';

const emit = defineEmits(['close']);
const patchStore = usePatchStore();
const presetStore = usePresetStore();
const registry = useModuleRegistry();

const selectedPreset = ref('');

const loadSelected = () => {
    if (selectedPreset.value) {
        presetStore.loadPresetByName(selectedPreset.value);
    }
};

const saveCurrent = () => {
    const name = window.prompt('Preset name?');
    if (name) {
        presetStore.savePreset(name);
        selectedPreset.value = name;
    }
};

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
