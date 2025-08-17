import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {setActivePinia, createPinia} from 'pinia';

let unmount;
vi.mock('vue', async () => {
    const actual = await vi.importActual('vue');
    return {
        ...actual,
        useSSRContext: () => ({modules: new Set()}),
        onMounted: fn => fn(),
        onUnmounted: fn => (unmount = fn),
    };
});

afterEach(() => {
    if (unmount) unmount();
});

import {nextTick} from 'vue';
import {usePatchStore} from '../../src/storage/patchStore.js';
import PatchCables from '@components/patches/PatchCables.vue';

describe('PatchCables component', () => {
    let patchStore;
    let svg, lines, paths, calculatePathLength;

    beforeEach(() => {
        const elements = {
            'a-output-0': {
                getBoundingClientRect: () => ({
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0,
                }),
            },
            'b-input-0': {
                getBoundingClientRect: () => ({
                    left: 100,
                    top: 100,
                    width: 0,
                    height: 0,
                }),
            },
        };
        vi.stubGlobal('requestAnimationFrame', fn => fn());
        vi.stubGlobal('document', {
            getElementById: id => elements[id],
        });
        vi.stubGlobal('window', {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
        });

        setActivePinia(createPinia());
        patchStore = usePatchStore();

        // initialise component setup
        ({svg, lines, paths, calculatePathLength} = PatchCables.setup(
            {},
            {expose: () => {}}
        ));

        svg.value = {
            getBoundingClientRect: () => ({left: 0, top: 0}),
        };
    });

    it('generates SVG paths and calculates lengths as patches change', async () => {
        patchStore.patches.push({
            from: {id: 'a', index: 0},
            to: {id: 'b', index: 0},
            colour: '#000',
        });
        await nextTick();

        expect(lines.value).toHaveLength(1);
        expect(lines.value[0].path).toBe('M 0 0 C 50 -50, 50 -50, 100 100');

        paths.value = [{getTotalLength: () => 123}];
        calculatePathLength();
        await nextTick();
        expect(lines.value[0].length).toBe(123);

        patchStore.patches.splice(0, 1);
        paths.value = [];
        await nextTick();
        expect(lines.value).toHaveLength(0);
    });
});
