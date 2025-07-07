import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSynthEngine } from '@/composables/useSynthEngine';

export const useSynthStore = defineStore('synth', () => {
    const engine = useSynthEngine();
    const ctx = engine.context;

    // Module parameter state (reactive)
    const vcoFrequency = ref(440);
    const vcoWaveform = ref('sawtooth');
    const lfoFrequency = ref(5);
    const lfoWaveform = ref('sine');
    const filterCutoff = ref(800);
    const filterResonance = ref(1);
    const filterType = ref('lowpass');
    const envelopeAttack = ref(0.2);    // trapezoid rise time (seconds)
    const envelopeDecay = ref(0.5);     // trapezoid fall time (seconds)
    const vcoLevel = ref(1);            // mixer level for VCO
    const noiseLevel = ref(1);          // mixer level for noise
    const vcaMode = ref(0);             // VCA mode mix (0 = pure envelope, 1 = pure LFO ring-mod)

    // Internal AudioNode references (not exposed as state)
    let vcoOsc, vcoOutGain;
    let lfoOsc, lfoOutGain;
    let noiseSrc, noiseOutGain;
    let filterNode;
    let vcaNode;
    let inverterGain;

    // Initialize audio nodes and static wiring between modules
    const initSynth = () => {
        // Create Oscillator (VCO) and LFO
        ({ osc: vcoOsc, gain: vcoOutGain } = engine.createOscillatorNode({
            frequency: vcoFrequency.value,
            type: vcoWaveform.value,
            gain: 1.0            // VCO initial amplitude pre-VCA
        }));
        ({ osc: lfoOsc, gain: lfoOutGain } = engine.createOscillatorNode({
            frequency: lfoFrequency.value,
            type: lfoWaveform.value,
            gain: 1.0            // LFO amplitude (will use gain to modulate VCA)
        }));
        // Create Noise source
        ({ source: noiseSrc, gain: noiseOutGain } = engine.createNoiseNode());
        // Create Filter (VCF) and VCA
        filterNode = engine.createFilterNode({
            type: filterType.value,
            frequency: filterCutoff.value,
            q: filterResonance.value
        });
        vcaNode = ctx.createGain();
        vcaNode.gain.value = 0;  // start with amplifier closed (no sound)

        // Create Inverter (Gain node with -1 gain)
        inverterGain = ctx.createGain();
        inverterGain.gain.value = -1;

        // Static signal routing:
        // VCO and Noise -> Mixer -> Filter -> VCA -> Output
        // (We use each source's output gain as its mixer level control)
        vcoOutGain.connect(filterNode);
        noiseOutGain.connect(filterNode);
        filterNode.connect(vcaNode);
        vcaNode.connect(ctx.destination);

        // Connect LFO to VCA gain input for ring modulation
        lfoOutGain.connect(vcaNode.gain);
        // (Note: We could also use LFO to modulate VCO frequency or filter, but by default it’s used for the VCA ring mod effect)

        // No default connection for inverter (available for future use).
        // For example, to invert a control signal: someNode.connect(inverterGain).
    };

    // Actions to update module parameters and corresponding node properties:
    const setVcoFrequency = (value) => {
        vcoFrequency.value = value;
        if (vcoOsc) {
            vcoOsc.frequency.setValueAtTime(value, ctx.currentTime);
        }
    };
    const setVcoWaveform = (wave) => {
        vcoWaveform.value = wave;
        if (vcoOsc) {
            vcoOsc.type = wave;
        }
    };
    const setLfoFrequency = (value) => {
        lfoFrequency.value = value;
        if (lfoOsc) {
            lfoOsc.frequency.setValueAtTime(value, ctx.currentTime);
        }
    };
    const setLfoWaveform = (wave) => {
        lfoWaveform.value = wave;
        if (lfoOsc) {
            lfoOsc.type = wave;
        }
    };
    const setFilterCutoff = (value) => {
        filterCutoff.value = value;
        if (filterNode) {
            filterNode.frequency.setValueAtTime(value, ctx.currentTime);
        }
    };
    const setFilterResonance = (q) => {
        filterResonance.value = q;
        if (filterNode) {
            filterNode.Q.setValueAtTime(q, ctx.currentTime);
        }
    };
    const setFilterType = (type) => {
        filterType.value = type;
        if (filterNode) {
            filterNode.type = type;
        }
    };
    const setMixerLevels = (vcoLvl, noiseLvl) => {
        // Update mixer levels for VCO and Noise
        vcoLevel.value = vcoLvl;
        noiseLevel.value = noiseLvl;
        if (vcoOutGain && noiseOutGain) {
            vcoOutGain.gain.setValueAtTime(vcoLvl, ctx.currentTime);
            noiseOutGain.gain.setValueAtTime(noiseLvl, ctx.currentTime);
        }
    };
    const setVcaMode = (mode) => {
        // mode: 0 (all envelope) to 1 (all LFO ring-mod)
        vcaMode.value = mode;
        if (lfoOutGain) {
            // Use VCA mode value as LFO depth for ring mod
            lfoOutGain.gain.setValueAtTime(mode, ctx.currentTime);
        }
    };

    // Envelope trigger action: triggers the trapezoid envelope for the VCA
    const triggerEnvelope = () => {
        if (!vcaNode) return;
        const attack = envelopeAttack.value;
        const decay = envelopeDecay.value;
        const now = ctx.currentTime;
        // Cancel any ongoing envelope
        vcaNode.gain.cancelScheduledValues(now);
        // Set initial gain to 0 and ramp up to peak (scaled by (1 - vcaMode) so envelope is weaker if ring-mod mix is higher)
        vcaNode.gain.setValueAtTime(0, now);
        const peakLevel = 1 - vcaMode.value;
        if (attack > 0) {
            vcaNode.gain.linearRampToValueAtTime(peakLevel, now + attack);
        } else {
            vcaNode.gain.setValueAtTime(peakLevel, now);
        }
        // Ramp down to 0 over decay time
        vcaNode.gain.linearRampToValueAtTime(0, now + attack + decay);
    };

    // Call initSynth once when the store is first used
    initSynth();

    return {
        // state (as refs)
        vcoFrequency, vcoWaveform, lfoFrequency, lfoWaveform,
        filterCutoff, filterResonance, filterType,
        envelopeAttack, envelopeDecay,
        vcoLevel, noiseLevel, vcaMode,
        // actions
        setVcoFrequency, setVcoWaveform,
        setLfoFrequency, setLfoWaveform,
        setFilterCutoff, setFilterResonance, setFilterType,
        setMixerLevels, setVcaMode,
        triggerEnvelope,
        // audio control
        resume: engine.resume  // allow components to resume AudioContext on user gesture
    };
});
