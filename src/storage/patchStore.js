import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useModuleRegistry } from '../composables/useModuleRegistry';

export const usePatchStore = defineStore('patch', () => {
    const patches = ref([]);
    const selectedJack = ref(null);
    const registry = useModuleRegistry();

    const connectNodes = (fromModule, fromIndex, toModule, toIndex) => {
        const output = fromModule.getOutputNode(fromIndex);
        const input = toModule.getInputNode(toIndex);

        if (output && input) {
            try {
                output.connect(input);
            } catch (e) {
                console.error('Patch failed:', e);
            }
        }
        patches.value.push({
            from: { id: fromModule.id, index: fromIndex },
            to: { id: toModule.id, index: toIndex }
        });
    };

    const disconnectNodes = (fromModule, fromIndex, toModule, toIndex) => {
        const output = fromModule.getOutputNode(fromIndex);
        const input = toModule.getInputNode(toIndex);

        if (output && input) {
            try {
                output.disconnect(input);
            } catch (e) {
                console.error('Unpatch failed:', e);
            }
        }
        patches.value = patches.value.filter(
            p =>
                !(p.from.id === fromModule.id &&
                    p.from.index === fromIndex &&
                    p.to.id === toModule.id &&
                    p.to.index === toIndex)
        );
    };

    const removeConnectionsForModule = (moduleId) => {
        const toRemove = patches.value.filter(
            (p) => p.from.id === moduleId || p.to.id === moduleId
        );

        toRemove.forEach((p) => {
            const fromModule = registry.get(p.from.id);
            const toModule = registry.get(p.to.id);
            if (fromModule && toModule) {
                try {
                    const out = fromModule.getOutputNode(p.from.index);
                    const inp = toModule.getInputNode(p.to.index);
                    out?.disconnect?.(inp);
                } catch (e) {
                    console.error('Patch cleanup failed:', e);
                }
            }
        });

        patches.value = patches.value.filter(
            (p) => p.from.id !== moduleId && p.to.id !== moduleId
        );
    };

    const togglePatch = (fromModule, fromIndex, toModule, toIndex) => {
        const exists = patches.value.find(
            p =>
                p.from.id === fromModule.id &&
                p.from.index === fromIndex &&
                p.to.id === toModule.id &&
                p.to.index === toIndex
        );

        if (exists) {
            disconnectNodes(fromModule, fromIndex, toModule, toIndex);
        } else {
            connectNodes(fromModule, fromIndex, toModule, toIndex);
        }
    };

    const getConnectionsFor = (moduleId, isOutput) => {
        return patches.value.filter(p =>
            isOutput ? p.from.id === moduleId : p.to.id === moduleId
        );
    };

    const selectJack = (jack) => {
        if (!selectedJack.value) {
            selectedJack.value = jack;
            return;
        }

        const first = selectedJack.value;
        const second = jack;

        // ignore if same type or same jack
        if (first.moduleId === second.moduleId && first.index === second.index && first.type === second.type) {
            selectedJack.value = null;
            return;
        }

        if (first.type === second.type) {
            // start new selection
            selectedJack.value = second;
            return;
        }

        const from = first.type === 'output' ? first : second;
        const to = first.type === 'input' ? first : second;

        const fromModule = registry.get(from.moduleId);
        const toModule = registry.get(to.moduleId);

        if (fromModule && toModule) {
            togglePatch(fromModule, from.index, toModule, to.index);
        }

        selectedJack.value = null;
    };

    return {
        patches,
        selectedJack,
        connectNodes,
        disconnectNodes,
        togglePatch,
        getConnectionsFor,
        selectJack,
        removeConnectionsForModule
    };
});
