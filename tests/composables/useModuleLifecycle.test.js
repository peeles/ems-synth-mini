import {describe, it, expect, vi} from 'vitest';

let unmount;
vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {...actual, onUnmounted: fn => (unmount = fn)};
});

import {useModuleLifecycle} from '../../src/composables/useModuleLifecycle.js';

describe('useModuleLifecycle', () => {
    it('stops and disconnects nodes on unmount', () => {
        const node1 = {stop: vi.fn(), disconnect: vi.fn()};
        const node2 = {stop: vi.fn(), disconnect: vi.fn()};
        useModuleLifecycle(node1, node2);
        unmount();
        expect(node1.stop).toHaveBeenCalled();
        expect(node1.disconnect).toHaveBeenCalled();
        expect(node2.stop).toHaveBeenCalled();
        expect(node2.disconnect).toHaveBeenCalled();
    });
});
