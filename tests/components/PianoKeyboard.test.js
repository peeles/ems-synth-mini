import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';

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

vi.mock('@/composables/useMidiInput', () => ({
    useMidiInput: () => ({setup: vi.fn(), cleanup: vi.fn()}),
}));

let synth;
vi.mock('@/storage/synthStore', () => ({
    useSynthStore: () => synth,
}));

import PianoKeyboard from '../../src/components/keyboard/pianoKeyboard.vue';
import {midiToFrequency} from '../../src/utils/helpers.js';

describe('PianoKeyboard component', () => {
    let param;
    beforeEach(() => {
        vi.stubGlobal('window', {
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });
        param = {setValueAtTime: vi.fn(), context: {currentTime: 0}};
        synth = {
            getVCOInputNode: vi.fn(() => param),
            triggerEnvelope: vi.fn(),
            setVcoFrequency: vi.fn(),
        };
    });

    afterEach(() => {
        if (unmount) unmount();
    });

    it('sets oscillator frequency without updating VCO store state', () => {
        const {playNote} = PianoKeyboard.setup({}, {expose: () => {}});
        playNote(60);
        expect(synth.setVcoFrequency).not.toHaveBeenCalled();
        expect(synth.getVCOInputNode).toHaveBeenCalled();
        expect(param.setValueAtTime).toHaveBeenCalledWith(
            midiToFrequency(60),
            param.context.currentTime
        );
        expect(synth.triggerEnvelope).toHaveBeenCalled();
    });
});
