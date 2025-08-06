import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {AudioEngine} from '/src/audio/AudioEngine';

globalThis.requestAnimationFrame = vi.fn(() => 1);
globalThis.cancelAnimationFrame = vi.fn();

const createMockNode = () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    stop: vi.fn(),
    gain: {value: 1, connect: vi.fn(), disconnect: vi.fn()},
});

const ctx = {
    createGain: vi.fn(() => createMockNode()),
    createWaveShaper: vi.fn(() => createMockNode()),
    destination: createMockNode(),
    currentTime: 0,
};

const engine = {
    context: ctx,
    resume: vi.fn(),
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

describe('AudioEngine', () => {
    let audio;

    beforeEach(() => {
        vi.clearAllMocks();
        audio = new AudioEngine({}, engine);
    });

    afterEach(() => {
        audio.destroyAll();
    });

    it('creates nodes lazily', () => {
        audio.ensureVCO();
        audio.ensureVCO();

        expect(engine.createOscillatorNode).toHaveBeenCalledTimes(1);
        expect(engine.createEnvelopeGain).toHaveBeenCalledTimes(1);
        expect(engine.createFilterNode).toHaveBeenCalledTimes(1);
    });

    it('destroys nodes and allows reinitialisation', () => {
        audio.ensureVCO();
        audio.ensureLFO();
        const nodes = audio.getNodes();

        audio.destroyAll();

        expect(nodes.vcoOsc.stop).toHaveBeenCalled();
        expect(nodes.vcoOsc.disconnect).toHaveBeenCalled();
        expect(nodes.lfoOsc.stop).toHaveBeenCalled();
        expect(nodes.lfoOsc.disconnect).toHaveBeenCalled();
        expect(nodes.vcoOutGain.disconnect).toHaveBeenCalled();
        expect(nodes.lfoOutGain.disconnect).toHaveBeenCalled();
        const cleared = audio.getNodes();
        expect(cleared.vcoOsc).toBeNull();
        expect(cleared.lfoOsc).toBeNull();

        engine.createOscillatorNode.mockClear();
        audio.ensureVCO();
        expect(engine.createOscillatorNode).toHaveBeenCalledTimes(1);
    });
});
