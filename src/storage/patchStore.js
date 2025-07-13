import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePatchStore = defineStore('patch', () => {
    const patches = ref([]);

    const connectNodes = (fromModule, fromIndex, toModule, toIndex) => {
        const output = fromModule.getOutputNode(fromIndex);
        const input = toModule.getInputNode(toIndex);

        if (output && input) {
            try {
                output.connect(input);
                patches.value.push({
                    from: { id: fromModule.id, index: fromIndex },
                    to: { id: toModule.id, index: toIndex }
                });
            } catch (e) {
                console.error('Patch failed:', e);
            }
        }
    };

    const disconnectNodes = (fromModule, fromIndex, toModule, toIndex) => {
        const output = fromModule.getOutputNode(fromIndex);
        const input = toModule.getInputNode(toIndex);

        if (output && input) {
            try {
                output.disconnect(input);
                patches.value = patches.value.filter(
                    p =>
                        !(p.from.id === fromModule.id &&
                            p.from.index === fromIndex &&
                            p.to.id === toModule.id &&
                            p.to.index === toIndex)
                );
            } catch (e) {
                console.error('Unpatch failed:', e);
            }
        }
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

    return {
        patches,
        connectNodes,
        disconnectNodes,
        togglePatch,
        getConnectionsFor
    };
});
