import {describe, it, expect, beforeEach, vi} from 'vitest';
import {setActivePinia, createPinia} from 'pinia';

vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {
        ...actual,
        useSSRContext: () => ({modules: new Set()}),
    };
});

import PatchOverlay from '../../src/components/patches/PatchPanel.vue';
import {usePatchStore} from '@/storage/patchStore';

describe('PatchOverlay', () => {
    let patchStore;
    beforeEach(() => {
        vi.stubGlobal('localStorage', {getItem: vi.fn(), setItem: vi.fn()});
        setActivePinia(createPinia());
        patchStore = usePatchStore();
    });

    it('clears all patches via resetPatches', () => {
        const emit = vi.fn();
        const {clearAll} = PatchOverlay.setup(
            {open: true},
            {emit, expose: () => {}}
        );
        const spy = vi
            .spyOn(patchStore, 'resetPatches')
            .mockImplementation(() => {});
        clearAll();
        expect(spy).toHaveBeenCalled();
        expect(emit).toHaveBeenCalledWith('close');
    });
});
