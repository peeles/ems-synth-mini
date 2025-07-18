import {defineStore} from 'pinia';
import {ref} from 'vue';
import {useModuleRegistry} from '../composables/useModuleRegistry';

export const usePatchStore = defineStore('patch', () => {
    const patches = ref([]);
    const selectedJack = ref(null);
    const registry = useModuleRegistry();

    const colours = [
        '#ffcc00',
        '#33ccff',
        '#ff66cc',
        '#66ff66',
        '#ff9933',
        '#cc66ff',
    ];
    const nextColourIndex = ref(0);

    const getNextColour = () => {
        const colour = colours[nextColourIndex.value % colours.length];
        nextColourIndex.value++;
        return colour;
    };

    const connectNodes = (fromModule, fromIndex, toModule, toIndex) => {
        const output = fromModule.getOutputNode(fromIndex);
        const input = toModule.getInputNode(toIndex);

        if (!output || !input) {
            return false;
        }

        try {
            output.connect(input);
            patches.value.push({
                from: {id: fromModule.id, index: fromIndex},
                to: {id: toModule.id, index: toIndex},
                colour: getNextColour(),
            });
            return true;
        } catch (e) {
            console.error('Patch failed:', e);
            return false;
        }
    };

    const disconnectNodes = (fromModule, fromIndex, toModule, toIndex) => {
        const output = fromModule.getOutputNode(fromIndex);
        const input = toModule.getInputNode(toIndex);

        if (!output || !input) {
            return false;
        }

        try {
            output.disconnect(input);
            patches.value = patches.value.filter(
                p =>
                    !(
                        p.from.id === fromModule.id &&
                        p.from.index === fromIndex &&
                        p.to.id === toModule.id &&
                        p.to.index === toIndex
                    )
            );
            return true;
        } catch (e) {
            console.error('Unpatch failed:', e);
            return false;
        }
    };

    const removeConnectionsForModule = moduleId => {
        const toRemove = patches.value.filter(
            p => p.from.id === moduleId || p.to.id === moduleId
        );

        toRemove.forEach(p => {
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
            p => p.from.id !== moduleId && p.to.id !== moduleId
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
            return disconnectNodes(fromModule, fromIndex, toModule, toIndex);
        }

        return connectNodes(fromModule, fromIndex, toModule, toIndex);
    };

    const getConnectionsFor = (moduleId, isOutput) => {
        return patches.value.filter(p =>
            isOutput ? p.from.id === moduleId : p.to.id === moduleId
        );
    };

    const selectJack = jack => {
        if (!selectedJack.value) {
            selectedJack.value = jack;
            return;
        }

        const first = selectedJack.value;
        const second = jack;

        // ignore if same type or same jack
        if (
            first.moduleId === second.moduleId &&
            first.index === second.index &&
            first.type === second.type
        ) {
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

        // disallow connections from a module back into itself
        if (from.moduleId === to.moduleId) {
            selectedJack.value = null;
            return;
        }

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
        removeConnectionsForModule,
    };
});
