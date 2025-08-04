import {describe, it, expect, beforeEach, vi} from 'vitest';
import {setActivePinia, createPinia} from 'pinia';

const ctx = {
    currentTime: 0,
    state: 'suspended',
    resume: vi.fn(() => {
        ctx.state = 'running';
        return Promise.resolve();
    }),
    close: vi.fn(() => Promise.resolve()),
};

const createNodes = () => ({
    vcoOsc: {frequency: {setValueAtTime: vi.fn()}, type: 'sawtooth'},
    filterNode: {
        frequency: {
            setValueAtTime: vi.fn(),
            cancelScheduledValues: vi.fn(),
            setTargetAtTime: vi.fn(),
        },
        Q: {
            setValueAtTime: vi.fn(),
            cancelScheduledValues: vi.fn(),
            setTargetAtTime: vi.fn(),
        },
    },
    vcoOutGain: {gain: {setValueAtTime: vi.fn()}},
    noiseOutGain: {gain: {setValueAtTime: vi.fn()}},
    lfoOutGain: {gain: {setValueAtTime: vi.fn()}},
    triggerEnvelope: vi.fn(),
});

let nodes;
const audioEngine = {
    context: ctx,
    resume: vi.fn(() => ctx.resume()),
    ensureVCO: vi.fn(),
    ensureVCF: vi.fn(),
    ensureVCA: vi.fn(),
    ensureNoise: vi.fn(),
    ensureLFO: vi.fn(),
    ensureMixer: vi.fn(),
    ensureInverter: vi.fn(),
    ensureEnvelopeTrigger: vi.fn(),
    getNodes: () => nodes,
    destroyAll: vi.fn(),
};

vi.mock('../../src/audio/AudioEngine.js', () => ({
    AudioEngine: vi.fn(() => audioEngine),
}));

import {useSynthStore, DEFAULTS} from '@/storage/synthStore';

describe('synthStore', () => {
    let synth;
    beforeEach(() => {
        setActivePinia(createPinia());
        nodes = createNodes();
        ctx.state = 'suspended';
        vi.clearAllMocks();
        synth = useSynthStore();
    });

    it('resumes the audio context', async () => {
        await synth.resume();
        expect(ctx.resume).toHaveBeenCalled();
        expect(synth.audioReady).toBe(true);
    });

    it('sets VCO frequency', () => {
        synth.setVcoFrequency(880);
        expect(synth.vcoFrequency).toBe(880);
        expect(audioEngine.ensureVCO).toHaveBeenCalled();
        expect(nodes.vcoOsc.frequency.setValueAtTime).toHaveBeenCalledWith(
            880,
            ctx.currentTime
        );
    });

    it('clamps filter cutoff and schedules changes', () => {
        synth.setFilterCutoff(10);
        expect(synth.filterCutoff).toBe(20);
        expect(audioEngine.ensureVCF).toHaveBeenCalled();
        expect(nodes.filterNode.frequency.setValueAtTime).toHaveBeenCalledWith(
            20,
            ctx.currentTime
        );
        expect(nodes.filterNode.frequency.setTargetAtTime).toHaveBeenCalledWith(
            20,
            ctx.currentTime,
            0.02
        );
    });

    it('sets mixer levels', () => {
        synth.setMixerLevels(0.5, 0.3);
        expect(synth.vcoLevel).toBe(0.5);
        expect(synth.noiseLevel).toBe(0.3);
        expect(audioEngine.ensureVCO).toHaveBeenCalled();
        expect(audioEngine.ensureNoise).toHaveBeenCalled();
        expect(nodes.vcoOutGain.gain.setValueAtTime).toHaveBeenCalledWith(
            0.5,
            ctx.currentTime
        );
        expect(nodes.noiseOutGain.gain.setValueAtTime).toHaveBeenCalledWith(
            0.3,
            ctx.currentTime
        );
    });

    it('resets parameters to defaults', () => {
        synth.setVcoFrequency(880);
        expect(synth.vcoFrequency).toBe(880);
        synth.resetParam('vcoFrequency');
        expect(synth.vcoFrequency).toBe(DEFAULTS.vcoFrequency);
    });

    it('triggers envelope', () => {
        synth.triggerEnvelope();
        expect(audioEngine.ensureVCA).toHaveBeenCalled();
        expect(nodes.triggerEnvelope).toHaveBeenCalledWith({
            attack: synth.envelopeAttack,
            decay: synth.envelopeDecay,
            peak: 1 - synth.vcaMode,
        });
    });

    it('destroys synth', async () => {
        await synth.destroySynth();
        expect(audioEngine.destroyAll).toHaveBeenCalled();
    });
});
