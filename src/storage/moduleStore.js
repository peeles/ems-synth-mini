import {defineStore, storeToRefs} from 'pinia';
import {useSynthStore} from './synthStore';
import {useSynthEngine} from '../composables/useSynthEngine';

export const useModuleStore = defineStore('modules', () => {
    const synth = useSynthStore();
    const {
        filterType,
        filterCutoff,
        filterResonance,
        vcoFrequency,
        vcoWaveform,
        lfoFrequency,
        lfoWaveform,
    } = storeToRefs(synth);

    const engine = useSynthEngine();
    const ctx = engine.context;

    // === AudioNode references ===
    let vcoOsc, vcoOutGain;
    let lfoOsc, lfoOutGain;
    let noiseSrc, noiseOutGain;
    let filterInputGain, filterNode;
    let mixerNode;
    let vcaGainNode;
    let inverterGain;
    let triggerEnvelope;
    let envelopeTriggerGain;
    let triggerPollId;
    let prevTrigger = 0;

    const initMixer = () => {
        mixerNode = ctx.createGain();
        if (filterInputGain) {
            mixerNode.connect(filterInputGain);
        }
    };

    const initVCF = () => {
        filterInputGain = ctx.createGain();
        filterNode = engine.createFilterNode({
            type: filterType,
            frequency: filterCutoff,
            q: filterResonance,
        });
        filterInputGain.connect(filterNode);
        mixerNode?.disconnect();
        mixerNode?.connect(filterInputGain);
    };

    const initVCA = () => {
        const envelope = engine.createEnvelopeGain();
        vcaGainNode = envelope.gainNode;
        triggerEnvelope = envelope.triggerEnvelope;
        ensureEnvelopeTrigger();

        filterNode?.connect(vcaGainNode);
        vcaGainNode.connect(ctx.destination);
    };

    const initInverter = () => {
        inverterGain = ctx.createGain();
        inverterGain.gain.value = -1;
    };

    const initVCO = () => {
        const result = engine.createOscillatorNode({
            frequency: vcoFrequency,
            type: vcoWaveform,
            gain: 1.0,
        });
        if (!result) return;
        vcoOsc = result.osc;
        vcoOutGain = result.gain;
        ensureVCF();
        ensureMixer();
        vcoOutGain.connect(mixerNode);
    };

    const initLFO = () => {
        const result = engine.createOscillatorNode({
            frequency: lfoFrequency,
            type: lfoWaveform,
            gain: 1.0,
        });
        if (!result) return;
        lfoOsc = result.osc;
        lfoOutGain = result.gain;
        ensureVCA();
        lfoOutGain.connect(vcaGainNode.gain);
    };

    const initNoise = () => {
        const result = engine.createNoiseNode();
        if (!result) return;
        noiseSrc = result.source;
        noiseOutGain = result.gain;
        ensureVCF();
        ensureMixer();
        noiseOutGain.connect(mixerNode);
    };

    const initEnvelopeTrigger = () => {
        envelopeTriggerGain = ctx.createGain();
        envelopeTriggerGain.gain.value = 0;
        const poll = () => {
            if (envelopeTriggerGain.gain.value > 0.5 && prevTrigger <= 0.5) {
                triggerEnvelope?.();
            }
            prevTrigger = envelopeTriggerGain.gain.value;
            triggerPollId = requestAnimationFrame(poll);
        };
        triggerPollId = requestAnimationFrame(poll);
    };

    // === Lazy Initialisers ===

    const ensureVCF = () => {
        if (!filterNode || !filterInputGain) initVCF();
        if (!mixerNode) initMixer();
    };

    const ensureVCA = () => {
        ensureVCF();
        if (!vcaGainNode) initVCA();
    };

    const ensureVCO = () => {
        ensureVCA();
        if (!vcoOsc) initVCO();
    };

    const ensureLFO = () => {
        ensureVCA();
        if (!lfoOsc) initLFO();
    };

    const ensureNoise = () => {
        ensureVCF();
        if (!noiseSrc) initNoise();
    };

    const ensureMixer = () => {
        if (!mixerNode) initMixer();
    };

    const ensureInverter = () => {
        if (!inverterGain) initInverter();
    };

    const ensureEnvelopeTrigger = () => {
        if (!envelopeTriggerGain) initEnvelopeTrigger();
    };

    const destroyAll = () => {
        const safelyStopAndDisconnect = node => {
            try {
                node?.stop?.();
            } catch (e) {
                console.warn('Error stopping node:', e);
            }
            try {
                node?.disconnect?.();
            } catch (e) {
                console.warn('Error disconnecting node:', e);
            }
        };

        safelyStopAndDisconnect(vcoOsc);
        safelyStopAndDisconnect(lfoOsc);
        safelyStopAndDisconnect(noiseSrc);

        [
            vcoOutGain,
            lfoOutGain,
            noiseOutGain,
            mixerNode,
            filterInputGain,
            filterNode,
            vcaGainNode,
            inverterGain,
            envelopeTriggerGain,
        ].forEach(n => {
            try {
                n?.disconnect();
            } catch (e) {
                console.warn('Error disconnecting node:', e);
            }
        });

        if (triggerPollId) {
            cancelAnimationFrame(triggerPollId);
            triggerPollId = null;
        }

        vcoOsc = lfoOsc = noiseSrc = null;
        vcoOutGain = lfoOutGain = noiseOutGain = null;
        filterInputGain =
            filterNode =
            mixerNode =
            vcaGainNode =
            inverterGain =
                null;
        envelopeTriggerGain = triggerEnvelope = null;
    };

    return {
        ensureVCF,
        ensureVCA,
        ensureVCO,
        ensureLFO,
        ensureNoise,
        ensureMixer,
        ensureInverter,
        ensureEnvelopeTrigger,
        getNodes: () => ({
            vcoOsc,
            vcoOutGain,
            lfoOsc,
            lfoOutGain,
            noiseSrc,
            noiseOutGain,
            filterNode,
            filterInputGain,
            mixerNode,
            vcaGainNode,
            inverterGain,
            envelopeTriggerGain,
            triggerEnvelope,
        }),
        destroyAll,
    };
});
