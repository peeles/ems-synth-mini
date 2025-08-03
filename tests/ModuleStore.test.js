import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';

globalThis.requestAnimationFrame = vi.fn(() => 1);
globalThis.cancelAnimationFrame = vi.fn();

const createMockNode = () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    stop: vi.fn(),
    gain: { value: 1, connect: vi.fn(), disconnect: vi.fn() },
});

const ctx = {
    createGain: vi.fn(() => createMockNode()),
    destination: createMockNode(),
    currentTime: 0,
};

const engine = {
    context: ctx,
    createFilterNode: vi.fn(() => ({
        connect: vi.fn(),
        disconnect: vi.fn(),
        frequency: {},
        Q: {},
    })),
    createOscillatorNode: vi.fn(() => ({
        osc: createMockNode(),
        gain: createMockNode(),
    })),
    createNoiseNode: vi.fn(() => ({
        source: createMockNode(),
        gain: createMockNode(),
    })),
    createEnvelopeGain: vi.fn(() => ({
        gainNode: createMockNode(),
        triggerEnvelope: vi.fn(),
    })),
};

vi.mock('../src/composables/useSynthEngine.js', () => ({
    useSynthEngine: () => engine,
}));

vi.mock('../src/storage/synthStore.js', () => ({
    useSynthStore: () => ({
        filterType: ref('lowpass'),
        filterCutoff: ref(800),
        filterResonance: ref(1),
        vcoFrequency: ref(440),
        vcoWaveform: ref('sawtooth'),
        lfoFrequency: ref(5),
        lfoWaveform: ref('sine'),
    }),
}));

import { useModuleStore } from '../src/storage/moduleStore.js';

describe('moduleStore', () => {
    let modules;

    beforeEach(() => {
        setActivePinia(createPinia());
        modules = useModuleStore();
        vi.clearAllMocks();
    });

    it('creates nodes lazily', () => {
        modules.ensureVCO();
        modules.ensureVCO();

        expect(engine.createOscillatorNode).toHaveBeenCalledTimes(1);
        expect(engine.createEnvelopeGain).toHaveBeenCalledTimes(1);
        expect(engine.createFilterNode).toHaveBeenCalledTimes(1);
    });

    it('destroys nodes and allows reinitialisation', () => {
        modules.ensureVCO();
        modules.ensureLFO();
        const nodes = modules.getNodes();

        modules.destroyAll();

        expect(nodes.vcoOsc.stop).toHaveBeenCalled();
        expect(nodes.vcoOsc.disconnect).toHaveBeenCalled();
        expect(nodes.lfoOsc.stop).toHaveBeenCalled();
        expect(nodes.lfoOsc.disconnect).toHaveBeenCalled();
        expect(nodes.vcoOutGain.disconnect).toHaveBeenCalled();
        expect(nodes.lfoOutGain.disconnect).toHaveBeenCalled();
        expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
        const cleared = modules.getNodes();
        expect(cleared.vcoOsc).toBeNull();
        expect(cleared.lfoOsc).toBeNull();

        engine.createOscillatorNode.mockClear();
        modules.ensureVCO();
        expect(engine.createOscillatorNode).toHaveBeenCalledTimes(1);
    });
});

