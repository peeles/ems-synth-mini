import {describe, it, expect, vi} from 'vitest';

let unmount;
vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {
        ...actual,
        onMounted: fn => fn(),
        onUnmounted: fn => (unmount = fn),
    };
});

import {ref, nextTick} from 'vue';

const patches = ref([]);
const patchStore = {
    patches,
    getConnectionsFor: vi.fn((id, isOutput) =>
        patches.value.filter(p =>
            isOutput ? p.from.id === id : p.to.id === id
        )
    ),
    selectJack: vi.fn(),
    removeConnectionsForModule: vi.fn(),
};
vi.mock('../../src/storage/patchStore.js', () => ({
    usePatchStore: () => patchStore,
}));

const registry = {
    register: vi.fn(),
    unregister: vi.fn(),
    get: vi.fn(),
    list: vi.fn(),
};
vi.mock('../../src/composables/useModuleRegistry.js', () => ({
    useModuleRegistry: () => registry,
}));

import {useModuleConnections} from '../../src/composables/useModuleConnections.js';

describe('useModuleConnections', () => {
    it('tracks connections and handles lifecycle', async () => {
        const result = useModuleConnections('mod1');

        expect(registry.register).toHaveBeenCalledWith(
            'mod1',
            expect.objectContaining({
                id: 'mod1',
                getInputNode: null,
                getOutputNode: null,
            })
        );

        expect(result.connectedInputs.value).toEqual([]);
        expect(result.connectedOutputs.value).toEqual([]);

        patches.value.push({
            from: {id: 'other', index: 0},
            to: {id: 'mod1', index: 1},
        });
        patches.value.push({
            from: {id: 'mod1', index: 2},
            to: {id: 'other', index: 3},
        });
        await nextTick();
        expect(result.connectedInputs.value).toEqual([1]);
        expect(result.connectedOutputs.value).toEqual([2]);

        const jack = {moduleId: 'mod1', index: 0};
        result.handlePatch(jack);
        expect(patchStore.selectJack).toHaveBeenCalledWith(jack);

        unmount();
        expect(patchStore.removeConnectionsForModule).toHaveBeenCalledWith(
            'mod1'
        );
        expect(registry.unregister).toHaveBeenCalledWith('mod1');
    });
});
