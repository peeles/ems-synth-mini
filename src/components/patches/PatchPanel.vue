<template>
    <div class="flex flex-col grow">
        <div class="border-b border-b-stone-500 flex flex-col mb-6 pb-6">
            <select
                v-model="selectedPreset"
                class="border-2 rounded p-2 flex flex-1 text-sm border-stone-600 text-stone-700 mb-3"
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
            <section class="flex justify-between items-center gap-2">
                <BaseButton
                    class="text-xs"
                    :disabled="!selectedPreset"
                    @click="loadSelected"
                >
                    Load
                </BaseButton>
                <BaseButton class="text-xs" @click="saveCurrent">
                    Save
                </BaseButton>
                <BaseButton class="text-xs" @click="presetStore.resetToDefault">
                    Default
                </BaseButton>
            </section>
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
                <BaseButton
                    class="text-xs !w-18 items-center justify-center !text-red-700 !border-red-600"
                    :disabled="
                        !registry.get(patch.from.id) ||
                        !registry.get(patch.to.id)
                    "
                    :class="{
                        'cursor-not-allowed':
                            !registry.get(patch.from.id) ||
                            !registry.get(patch.to.id),
                    }"
                    @click="disconnect(patch)"
                >
                    remove
                </BaseButton>
            </li>
        </ul>
        <p v-else class="text-stone-600 text-sm text-center">
            No active patches
        </p>
    </div>
    <div class="flex shrink">
        <BaseButton
            class="w-full !text-red-700 !text-center py-2 rounded cursor-pointer items-center justify-center"
            @click="clearAll"
        >
            Clear All Patches
        </BaseButton>
    </div>
</template>

<script setup>
import {ref} from 'vue';
import {usePatchStore} from '@/storage/patchStore';
import {usePresetStore} from '@/storage/presetStore';
import {useModuleRegistry} from '@/composables/useModuleRegistry';

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
    // TODO: move to use modal or similar
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
