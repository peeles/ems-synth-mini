import {defineStore} from 'pinia';
import {ref} from 'vue';
import {useSynthEngine} from '../composables/useSynthEngine';
import {useModuleStore} from './moduleStore';

export const DEFAULTS = {
    vcoFrequency: 440,
    lfoFrequency: 5,
    filterCutoff: 800,
    filterResonance: 1,
    envelopeAttack: 0.2,
    envelopeDecay: 0.5,
    vcoLevel: 1,
    noiseLevel: 1,
    vcaMode: 0,
};

export const useSynthStore = defineStore('synth', () => {
    const audioReady = ref(false);
    const engine = useSynthEngine();
    const ctx = engine.context;
    const modules = useModuleStore();

    // === Synth Parameter State ===
    const vcoFrequency = ref(440);
    const vcoWaveform = ref('sawtooth');
    const lfoFrequency = ref(5);
    const lfoWaveform = ref('sine');
    const filterCutoff = ref(800);
    const filterResonance = ref(1);
    const filterType = ref('lowpass');
    const envelopeAttack = ref(0.2);
    const envelopeDecay = ref(0.5);
    const vcoLevel = ref(1);
    const noiseLevel = ref(1);
    const vcaMode = ref(0);
    const masterOutputNode = ref(null);

    async function resume() {
        await ctx.resume();
        if (ctx.state === 'running') {
            audioReady.value = true;
        }
    }

    // === Module Node Accessors ===
    const getVCAOutputNode = () => {
        modules.ensureVCA();
        return modules.getNodes().vcaGainNode;
    };

    const getVCAInputNode = () => {
        modules.ensureVCA();
        return modules.getNodes().vcaGainNode?.gain;
    };

    const getVCOOutputNode = () => {
        modules.ensureVCO();
        return modules.getNodes().vcoOutGain;
    };

    const getVCOInputNode = () => {
        modules.ensureVCO();
        return modules.getNodes().vcoOsc?.frequency || null;
    };

    const getVCFInputNode = index => {
        modules.ensureVCF();
        const {filterInputGain, filterNode} = modules.getNodes();

        if (index === 0) {
            return filterInputGain;
        }
        if (index === 1) {
            return filterNode.frequency;
        }
        if (index === 2) {
            return filterNode.Q;
        }

        return null;
    };

    const getVCFOutputNode = () => {
        modules.ensureVCF();
        return modules.getNodes().filterNode;
    };

    const getNoiseOutputNode = () => {
        modules.ensureNoise();
        return modules.getNodes().noiseOutGain;
    };

    const getMixerOutputNode = () => {
        modules.ensureMixer();
        return modules.getNodes().mixerNode;
    };

    const setMasterOutputNode = node => {
        masterOutputNode.value = node;
    };

    const getMasterOutputNode = () => masterOutputNode.value;

    const getLFOOutputNode = () => {
        modules.ensureLFO();
        return modules.getNodes().lfoOutGain;
    };

    const getLFOInputNode = () => {
        modules.ensureLFO();
        return modules.getNodes().lfoOsc?.frequency || null;
    };

    const getInverterInputNode = () => {
        modules.ensureInverter();
        return modules.getNodes().inverterGain;
    };

    const getInverterOutputNode = () => {
        modules.ensureInverter();
        return modules.getNodes().inverterGain;
    };

    const getEnvelopeTriggerInputNode = () => {
        modules.ensureEnvelopeTrigger();
        return modules.getNodes().envelopeTriggerGain?.gain || null;
    };

    // === Parameter Actions ===

    const setVcoFrequency = val => {
        vcoFrequency.value = val;
        modules.ensureVCO();
        modules
            .getNodes()
            .vcoOsc?.frequency.setValueAtTime(val, ctx.currentTime);
    };

    const setVcoWaveform = val => {
        vcoWaveform.value = val;
        modules.ensureVCO();
        const {vcoOsc} = modules.getNodes();
        if (vcoOsc) vcoOsc.type = val;
    };

    const setLfoFrequency = val => {
        lfoFrequency.value = val;
        modules.ensureLFO();
        modules
            .getNodes()
            .lfoOsc?.frequency.setValueAtTime(val, ctx.currentTime);
    };

    const setLfoWaveform = val => {
        lfoWaveform.value = val;
        modules.ensureLFO();
        const {lfoOsc} = modules.getNodes();
        if (lfoOsc) lfoOsc.type = val;
    };

    const FILTER_MIN_FREQ = 20;
    const FILTER_MIN_Q = 0.1;
    const FILTER_MAX_Q = 20;
    const FILTER_SMOOTH_TIME = 0.02;

    const setFilterCutoff = val => {
        const clamped = Math.max(FILTER_MIN_FREQ, val);
        filterCutoff.value = clamped;
        modules.ensureVCF();
        const {filterNode} = modules.getNodes();
        filterNode?.frequency.setValueAtTime(val, ctx.currentTime);
        if (!filterNode) {
            return;
        }

        const now = ctx.currentTime;
        filterNode.frequency.cancelScheduledValues(now);
        filterNode.frequency.setTargetAtTime(clamped, now, FILTER_SMOOTH_TIME);
    };

    const setFilterResonance = val => {
        const clamped = Math.min(FILTER_MAX_Q, Math.max(FILTER_MIN_Q, val));
        filterResonance.value = clamped;
        modules.ensureVCF();
        const {filterNode} = modules.getNodes();
        filterNode?.Q.setValueAtTime(val, ctx.currentTime);
        if (!filterNode) {
            return;
        }

        const now = ctx.currentTime;
        filterNode.Q.cancelScheduledValues(now);
        filterNode.Q.setTargetAtTime(clamped, now, FILTER_SMOOTH_TIME);
    };

    const setFilterType = val => {
        filterType.value = val;
        modules.ensureVCF();
        const {filterNode} = modules.getNodes();
        if (filterNode) {
            filterNode.type = val;
        }
    };

    const setMixerLevels = (vcoLvl, noiseLvl) => {
        vcoLevel.value = vcoLvl;
        noiseLevel.value = noiseLvl;
        modules.ensureVCO();
        modules.ensureNoise();
        const nodes = modules.getNodes();
        nodes.vcoOutGain?.gain.setValueAtTime(vcoLvl, ctx.currentTime);
        nodes.noiseOutGain?.gain.setValueAtTime(noiseLvl, ctx.currentTime);
    };

    const setVcaMode = mode => {
        vcaMode.value = mode;
        modules.ensureLFO();
        modules
            .getNodes()
            .lfoOutGain?.gain.setValueAtTime(mode, ctx.currentTime);
    };

    const setEnvelopeAttack = val => {
        envelopeAttack.value = val;
    };

    const setEnvelopeDecay = val => {
        envelopeDecay.value = val;
    };

    const resetParam = key => {
        const val = DEFAULTS[key];
        if (val === undefined) return;
        switch (key) {
            case 'vcoFrequency':
                setVcoFrequency(val);
                break;
            case 'lfoFrequency':
                setLfoFrequency(val);
                break;
            case 'filterCutoff':
                setFilterCutoff(val);
                break;
            case 'filterResonance':
                setFilterResonance(val);
                break;
            case 'envelopeAttack':
                setEnvelopeAttack(val);
                break;
            case 'envelopeDecay':
                setEnvelopeDecay(val);
                break;
            case 'vcoLevel':
                setMixerLevels(val, noiseLevel.value);
                break;
            case 'noiseLevel':
                setMixerLevels(vcoLevel.value, val);
                break;
            case 'vcaMode':
                setVcaMode(val);
                break;
        }
    };

    // === Envelope Action ===
    const triggerVCAEnvelope = () => {
        modules.ensureVCA();
        const {triggerEnvelope} = modules.getNodes();
        if (!triggerEnvelope) return;

        const peak = 1 - vcaMode.value;
        triggerEnvelope({
            attack: envelopeAttack.value,
            decay: envelopeDecay.value,
            peak,
        });
    };

    const destroySynth = () => {
        modules.destroyAll();
    };

    return {
        // State
        audioReady,
        vcoFrequency,
        vcoWaveform,
        lfoFrequency,
        lfoWaveform,
        filterCutoff,
        filterResonance,
        filterType,
        envelopeAttack,
        envelopeDecay,
        vcoLevel,
        noiseLevel,
        vcaMode,

        // Actions
        setVcoFrequency,
        setVcoWaveform,
        setLfoFrequency,
        setLfoWaveform,
        setFilterCutoff,
        setFilterResonance,
        setFilterType,
        setMixerLevels,
        setVcaMode,
        setEnvelopeAttack,
        setEnvelopeDecay,
        resetParam,
        triggerEnvelope: triggerVCAEnvelope,
        setMasterOutputNode,
        getMasterOutputNode,
        getVCAOutputNode,
        getVCAInputNode,
        getVCOInputNode,
        getVCOOutputNode,
        getVCFInputNode,
        getVCFOutputNode,
        getNoiseOutputNode,
        getMixerOutputNode,
        getLFOInputNode,
        getLFOOutputNode,
        getInverterInputNode,
        getInverterOutputNode,
        getEnvelopeTriggerInputNode,

        // Lifecycle
        resume,
        destroySynth,
    };
});
