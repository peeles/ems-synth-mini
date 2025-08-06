import {describe, it, expect, beforeEach, vi} from 'vitest';
import {setActivePinia, createPinia} from 'pinia';

vi.mock('../../src/audio/AudioEngine.js', () => ({
    AudioEngine: vi.fn(() => audioEngine),
}));

import {usePatchStore} from '@/storage/patchStore';
import {usePresetStore} from '@/storage/presetStore';
import {useSynthStore} from '@/storage/synthStore';
import {useModuleRegistry} from '@/composables/useModuleRegistry';

let audioEngine;
let nodes;
let ctx;

const createNodes = () => ({
    vcoOsc: {frequency: {setValueAtTime: vi.fn()}, type: 'sawtooth'},
    vcoOutGain: {gain: {setValueAtTime: vi.fn()}},
    noiseOutGain: {gain: {setValueAtTime: vi.fn()}},
    lfoOutGain: {gain: {setValueAtTime: vi.fn()}},
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
    triggerEnvelope: vi.fn(),
});

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

describe('presetStore', () => {
    let patchStore;
    let presetStore;
    let synth;
    let registry;
    let mod1, mod2;

    beforeEach(() => {
        vi.stubGlobal('localStorage', {getItem: vi.fn(), setItem: vi.fn()});
        globalThis.AudioParam = class {};
        setActivePinia(createPinia());

        ctx = {
            currentTime: 0,
            state: 'suspended',
            resume: vi.fn(),
            close: vi.fn(),
        };
        nodes = createNodes();
        audioEngine = {
            context: ctx,
            resume: vi.fn(() => Promise.resolve()),
            ensureVCO: vi.fn(),
            ensureVCF: vi.fn(),
            ensureVCA: vi.fn(),
            ensureNoise: vi.fn(),
            ensureLFO: vi.fn(),
            ensureMixer: vi.fn(),
            ensureInverter: vi.fn(),
            getNodes: () => nodes,
            destroyAll: vi.fn(),
        };

        synth = useSynthStore();
        patchStore = usePatchStore();
        presetStore = usePresetStore();
        registry = useModuleRegistry();
        mod1 = createModule('1');
        mod2 = createModule('2');
        registry.register('1', mod1);
        registry.register('2', mod2);
    });

    it('saves and loads presets', () => {
        synth.setVcoFrequency(880);
        patchStore.connectNodes(mod1, 0, mod2, 0);
        presetStore.savePreset('Test');

        synth.setVcoFrequency(440);
        patchStore.resetPatches();
        expect(patchStore.patches.length).toBe(0);

        presetStore.loadPresetByName('Test');
        expect(synth.vcoFrequency).toBe(880);
        expect(patchStore.patches.length).toBe(1);
    });
});
