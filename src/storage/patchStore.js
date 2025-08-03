import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useModuleRegistry } from '../composables/useModuleRegistry';

export const usePatchStore = defineStore('patch', () => {
    const registry = useModuleRegistry();
    const STORAGE_KEY = 'patches_v4';

    const patches = ref([]);
    const selectedJack = ref(null);
    const nextColourIndex = ref(0);
    const undoStack = ref([]);
    const redoStack = ref([]);
    const activeConnections = new Map();

    const colours = [
        '#ffcc00',
        '#33ccff',
        '#ff66cc',
        '#66ff66',
        '#ff9933',
        '#cc66ff',
    ];

    const getNextColour = () => {
        const colour = colours[nextColourIndex.value % colours.length];
        nextColourIndex.value++;
        return colour;
    };

    const makeKey = (from, to) => `${from.id}:${from.index}->${to.id}:${to.index}`;

    const loadFromStorage = () => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        try {
            const parsed = JSON.parse(stored);
            patches.value = parsed.patches || [];
            nextColourIndex.value = parsed.nextColourIndex ?? 0;
        } catch {}
    };

    const saveToStorage = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    patches: patches.value,
                    nextColourIndex: nextColourIndex.value,
                })
            );
        }
    };

    watch(
        () => JSON.stringify({ patches: patches.value, idx: nextColourIndex.value }),
        saveToStorage
    );

    const connectNodes = (fromModule, fromIndex, toModule, toIndex) => {
        const output = fromModule.getOutputNode(fromIndex);
        const input = toModule.getInputNode(toIndex);
        if (!output || !input) return false;
        const key = makeKey({ id: fromModule.id, index: fromIndex }, { id: toModule.id, index: toIndex });
        if (activeConnections.has(key)) return true;
        try {
            output.connect(input);
            const patch = {
                from: { id: fromModule.id, index: fromIndex },
                to: { id: toModule.id, index: toIndex },
                colour: getNextColour(),
                group: fromModule.type || 'ungrouped',
            };
            patches.value.push(patch);
            activeConnections.set(key, { output, input, isParam: input instanceof AudioParam });
            pushUndo({ type: 'connect', patch });
            redoStack.value = [];
            return true;
        } catch (e) {
            console.error('Patch failed:', e);
            return false;
        }
    };

    const safeDisconnect = (fromModule, fromIndex, toModule, toIndex) => {
        const key = makeKey({ id: fromModule.id, index: fromIndex }, { id: toModule.id, index: toIndex });
        const connection = activeConnections.get(key);
        if (!connection) return;
        const { output, input } = connection;
        try {
            output.disconnect(input);
        } catch {
            try {
                output.disconnect();
            } catch (inner) {
                console.warn('Disconnect fallback failed:', inner);
            }
        }
        activeConnections.delete(key);
    };

    const disconnectNodes = (fromModule, fromIndex, toModule, toIndex) => {
        const existingPatch = patches.value.find(
            p =>
                p.from.id === fromModule.id &&
                p.from.index === fromIndex &&
                p.to.id === toModule.id &&
                p.to.index === toIndex
        );
        if (!existingPatch) return false;
        safeDisconnect(fromModule, fromIndex, toModule, toIndex);
        patches.value = patches.value.filter(p => p !== existingPatch);
        pushUndo({ type: 'disconnect', patch: existingPatch });
        redoStack.value = [];
        return true;
    };

    const togglePatch = (fromModule, fromIndex, toModule, toIndex) => {
        const exists = patches.value.find(
            p =>
                p.from.id === fromModule.id &&
                p.from.index === fromIndex &&
                p.to.id === toModule.id &&
                p.to.index === toIndex
        );
        return exists
            ? disconnectNodes(fromModule, fromIndex, toModule, toIndex)
            : connectNodes(fromModule, fromIndex, toModule, toIndex);
    };

    const pushUndo = action => {
        undoStack.value.push(action);
        if (undoStack.value.length > 50) undoStack.value.shift();
    };

    const undo = () => {
        const last = undoStack.value.pop();
        if (!last) return;
        if (last.type === 'connect') {
            const patch = last.patch;
            const fromModule = registry.get(patch.from.id);
            const toModule = registry.get(patch.to.id);
            safeDisconnect(fromModule, patch.from.index, toModule, patch.to.index);
            patches.value = patches.value.filter(p => p !== patch);
        } else if (last.type === 'disconnect') {
            const patch = last.patch;
            const fromModule = registry.get(patch.from.id);
            const toModule = registry.get(patch.to.id);
            connectNodes(fromModule, patch.from.index, toModule, patch.to.index);
        }
        redoStack.value.push(last);
    };

    const redo = () => {
        const action = redoStack.value.pop();
        if (!action) return;
        if (action.type === 'connect') {
            const patch = action.patch;
            const fromModule = registry.get(patch.from.id);
            const toModule = registry.get(patch.to.id);
            connectNodes(fromModule, patch.from.index, toModule, patch.to.index);
        } else if (action.type === 'disconnect') {
            const patch = action.patch;
            const fromModule = registry.get(patch.from.id);
            const toModule = registry.get(patch.to.id);
            disconnectNodes(fromModule, patch.from.index, toModule, patch.to.index);
        }
        undoStack.value.push(action);
    };

    const getPatchesByGroup = group => patches.value.filter(p => p.group === group);

    const recallGroup = group => {
        resetPatches();
        const groupPatches = getPatchesByGroup(group);
        groupPatches.forEach(p => {
            const fromModule = registry.get(p.from.id);
            const toModule = registry.get(p.to.id);
            connectNodes(fromModule, p.from.index, toModule, p.to.index);
        });
    };

    const resetPatches = () => {
        patches.value.forEach(p => {
            const fromModule = registry.get(p.from.id);
            const toModule = registry.get(p.to.id);
            safeDisconnect(fromModule, p.from.index, toModule, p.to.index);
        });
        patches.value = [];
        undoStack.value = [];
        redoStack.value = [];
        activeConnections.clear();
        nextColourIndex.value = 0;
        saveToStorage();
    };

    const reapplyAllConnections = () => {
        patches.value = patches.value.filter(p => {
            const fromModule = registry.get(p.from.id);
            const toModule = registry.get(p.to.id);
            return connectNodes(fromModule, p.from.index, toModule, p.to.index);
        });
        saveToStorage();
    };

    const selectJack = jack => {
        if (!selectedJack.value) {
            selectedJack.value = jack;
            return;
        }
        const first = selectedJack.value;
        const second = jack;
        if (
            first.moduleId === second.moduleId &&
            first.index === second.index &&
            first.type === second.type
        ) {
            selectedJack.value = null;
            return;
        }
        if (first.type === second.type) {
            selectedJack.value = second;
            return;
        }
        const from = first.type === 'output' ? first : second;
        const to = first.type === 'input' ? first : second;
        if (from.moduleId === to.moduleId) {
            selectedJack.value = null;
            return;
        }
        const fromModule = registry.get(from.moduleId);
        const toModule = registry.get(to.moduleId);
        if (fromModule && toModule) togglePatch(fromModule, from.index, toModule, to.index);
        selectedJack.value = null;
    };

    const getConnectionsFor = (moduleId, isOutput) =>
        patches.value.filter(p => (isOutput ? p.from.id === moduleId : p.to.id === moduleId));

    loadFromStorage();

    return {
        patches,
        selectedJack,
        connectNodes,
        disconnectNodes,
        togglePatch,
        getConnectionsFor,
        selectJack,
        removeConnectionsForModule: resetPatches,
        reapplyAllConnections,
        resetPatches,
        undo,
        redo,
        getPatchesByGroup,
        recallGroup,
        undoStack,
        redoStack,
    };
});
