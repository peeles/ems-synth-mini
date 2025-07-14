import {defineStore} from "pinia";

export const useModuleStore = defineStore('modules', () => {
    let {
        filterType, filterCutoff, filterResonance,
        vcoFrequency, vcoWaveform, lfoFrequency, lfoWaveform
    } = refs;

    let vcoOsc, vcoOutGain;
    let lfoOsc, lfoOutGain;
    let noiseSrc, noiseOutGain;
    let filterNode;
    let mixerNode;
    let vcaGainNode;
    let inverterGain;
    let triggerEnvelope;

    const initMixer = () => {
        mixerNode = ctx.createGain();
        mixerNode.connect(filterNode);
    };

    const initVCF = () => {
        filterNode = engine.createFilterNode({
            type: filterType.value,
            frequency: filterCutoff.value,
            q: filterResonance.value,
        });
        mixerNode?.disconnect();
        mixerNode?.connect(filterNode);
    };

    const initVCA = () => {
        const envelope = engine.createEnvelopeGain();
        vcaGainNode = envelope.gainNode;
        triggerEnvelope = envelope.triggerEnvelope;
        filterNode?.connect(vcaGainNode);
        vcaGainNode.connect(ctx.destination);
    };

    const initInverter = () => {
        inverterGain = ctx.createGain();
        inverterGain.gain.value = -1;
    };

    const initVCO = () => {
        const result = engine.createOscillatorNode({
            frequency: vcoFrequency.value,
            type: vcoWaveform.value,
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
            frequency: lfoFrequency.value,
            type: lfoWaveform.value,
            gain: 1.0,
        });
        if (!result) return;
        lfoOsc = result.osc;
        lfoOutGain = result.gain;
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

    // Lazy initializer helpers
    const ensureVCF = () => {
        if (!filterNode) initVCF();
        ensureMixer();
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

    return {
        initMixer,
        initVCF,
        initVCA,
        initInverter,
        initVCO,
        initLFO,
        initNoise,
        ensureVCF,
        ensureVCA,
        ensureVCO,
        ensureLFO,
        ensureNoise,
        ensureMixer,
        ensureInverter,
        // Expose nodes if needed
        getNodes: () => ({
            vcoOsc, vcoOutGain, lfoOsc, lfoOutGain, noiseSrc, noiseOutGain,
            filterNode, mixerNode, vcaGainNode, inverterGain, triggerEnvelope
        })
    };
});
