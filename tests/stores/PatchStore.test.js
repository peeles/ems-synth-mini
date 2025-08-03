import {describe, it, expect, beforeEach, vi} from 'vitest';
import {setActivePinia, createPinia} from 'pinia';
import {usePatchStore} from '../../src/storage/patchStore.js';
import {useModuleRegistry} from '../../src/composables/useModuleRegistry.js';

globalThis.AudioParam = class {};

const createModule = id => {
    const outputs = [{connect: vi.fn(), disconnect: vi.fn()}];
    const inputs = [{connect: vi.fn(), disconnect: vi.fn()}];
    return {
        id,
        getOutputNode: vi.fn(index => outputs[index]),
        getInputNode: vi.fn(index => inputs[index]),
        outputs,
        inputs,
    };
};

describe('patchStore', () => {
    let patchStore;
    let registry;
    let mod1, mod2, mod3;

    beforeEach(() => {
        setActivePinia(createPinia());
        patchStore = usePatchStore();
        registry = useModuleRegistry();
        mod1 = createModule('1');
        mod2 = createModule('2');
        mod3 = createModule('3');
        registry.register('1', mod1);
        registry.register('2', mod2);
        registry.register('3', mod3);
    });

    describe('connectNodes and disconnectNodes', () => {
        it('connects and disconnects modules', () => {
            const connected = patchStore.connectNodes(mod1, 0, mod2, 0);
            expect(connected).toBe(true);
            expect(mod1.outputs[0].connect).toHaveBeenCalledWith(
                mod2.inputs[0]
            );
            expect(patchStore.patches.length).toBe(1);

            const disconnected = patchStore.disconnectNodes(mod1, 0, mod2, 0);
            expect(disconnected).toBe(true);
            expect(mod1.outputs[0].disconnect).toHaveBeenCalledWith(
                mod2.inputs[0]
            );
            expect(patchStore.patches.length).toBe(0);
        });
    });

    describe('undo and redo', () => {
        it('reverses and reapplies patch actions', () => {
            patchStore.connectNodes(mod1, 0, mod2, 0);
            patchStore.disconnectNodes(mod1, 0, mod2, 0);
            expect(patchStore.patches.length).toBe(0);

            patchStore.undo();
            expect(patchStore.patches.length).toBe(1);
            expect(mod1.outputs[0].connect).toHaveBeenCalledTimes(2);

            patchStore.redo();
            expect(patchStore.patches.length).toBe(0);
            expect(mod1.outputs[0].disconnect).toHaveBeenCalledTimes(2);
        });
    });

    describe('removeConnectionsForModule', () => {
        beforeEach(() => {
            patchStore.connectNodes(mod1, 0, mod2, 0);
            patchStore.connectNodes(mod2, 0, mod3, 0);
            patchStore.connectNodes(mod1, 0, mod3, 0);
        });

        it('disconnects and removes patches for a specific module', () => {
            patchStore.removeConnectionsForModule('2');

            expect(patchStore.patches.length).toBe(1);
            const remaining = patchStore.patches[0];
            expect(remaining.from.id).toBe('1');
            expect(remaining.to.id).toBe('3');
            expect(mod1.outputs[0].disconnect).toHaveBeenCalledWith(
                mod2.inputs[0]
            );
            expect(mod2.outputs[0].disconnect).toHaveBeenCalledWith(
                mod3.inputs[0]
            );
            expect(mod1.outputs[0].disconnect).toHaveBeenCalledTimes(1);
            expect(mod1.outputs[0].disconnect).not.toHaveBeenCalledWith(
                mod3.inputs[0]
            );

            patchStore.connectNodes(mod1, 0, mod2, 0);
            expect(patchStore.patches.length).toBe(2);
            expect(mod1.outputs[0].connect).toHaveBeenCalledTimes(3);
        });
    });
});
