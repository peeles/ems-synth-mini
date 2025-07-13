import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSynthEngine } from '../composables/useSynthEngine'

export const useSynthStore = defineStore('synth', () => {
    const audioReady = ref(false);
    const engine = useSynthEngine()
    const ctx = engine.context

    // === Synth Parameter State ===
    const vcoFrequency = ref(440)
    const vcoWaveform = ref('sawtooth')
    const lfoFrequency = ref(5)
    const lfoWaveform = ref('sine')
    const filterCutoff = ref(800)
    const filterResonance = ref(1)
    const filterType = ref('lowpass')
    const envelopeAttack = ref(0.2)
    const envelopeDecay = ref(0.5)
    const vcoLevel = ref(1)
    const noiseLevel = ref(1)
    const vcaMode = ref(0)

    // === AudioNode References ===
    let vcoOsc, vcoOutGain
    let lfoOsc, lfoOutGain
    let noiseSrc, noiseOutGain
    let filterNode
    let vcaGainNode
    let inverterGain
    let triggerEnvelope // now from engine.createEnvelopeGain()

    async function resume() {
        await ctx.resume();
        if (ctx.state === 'running') {
            audioReady.value = true;
        }
    }

    // === Modular Initializers ===

    const getVCAOutputNode = () => {
        ensureVCA()
        return vcaGainNode
    }

    const getVCAInputNode = () => {
        ensureVCA()
        return vcaGainNode
    }

    const getVCOOutputNode = () => {
        ensureVCO()
        return vcoOutGain
    }

    const getVCFInputNode = () => {
        ensureVCF()
        return filterNode
    }

    const getVCFOutputNode = () => {
        ensureVCF()
        return filterNode
    }

    const getNoiseOutputNode = () => {
        ensureNoise()
        return noiseOutGain
    }

    const getLFOOutputNode = () => {
        ensureLFO()
        return lfoOutGain
    }

    const initVCF = () => {
        filterNode = engine.createFilterNode({
            type: filterType.value,
            frequency: filterCutoff.value,
            q: filterResonance.value
        })
    }

    const initVCA = () => {
        const envelope = engine.createEnvelopeGain()
        vcaGainNode = envelope.gainNode
        triggerEnvelope = envelope.triggerEnvelope

        // Route filter → VCA → output
        filterNode?.connect(vcaGainNode)
        vcaGainNode.connect(ctx.destination)

        // Create inverter (unused for now)
        inverterGain = ctx.createGain()
        inverterGain.gain.value = -1
    }

    const initVCO = () => {
        const result = engine.createOscillatorNode({
            frequency: vcoFrequency.value,
            type: vcoWaveform.value,
            gain: 1.0
        })
        if (!result) return
        vcoOsc = result.osc
        vcoOutGain = result.gain
        vcoOutGain.connect(filterNode)
    }

    const initLFO = () => {
        const result = engine.createOscillatorNode({
            frequency: lfoFrequency.value,
            type: lfoWaveform.value,
            gain: 1.0
        })
        if (!result) return
        lfoOsc = result.osc
        lfoOutGain = result.gain
        lfoOutGain.connect(vcaGainNode.gain) // ring mod
    }

    const initNoise = () => {
        const result = engine.createNoiseNode()
        if (!result) return
        noiseSrc = result.source
        noiseOutGain = result.gain
        noiseOutGain.connect(filterNode)
    }

    // Lazy initializer helpers
    const ensureVCF = () => {
        if (!filterNode) initVCF()
    }

    const ensureVCA = () => {
        ensureVCF()
        if (!vcaGainNode) initVCA()
    }

    const ensureVCO = () => {
        ensureVCA()
        if (!vcoOsc) initVCO()
    }

    const ensureLFO = () => {
        ensureVCA()
        if (!lfoOsc) initLFO()
    }

    const ensureNoise = () => {
        ensureVCF()
        if (!noiseSrc) initNoise()
    }

    // === Parameter Actions ===

    const setVcoFrequency = (val) => {
        vcoFrequency.value = val
        ensureVCO()
        vcoOsc?.frequency.setValueAtTime(val, ctx.currentTime)
    }

    const setVcoWaveform = (val) => {
        vcoWaveform.value = val
        ensureVCO()
        if (vcoOsc) vcoOsc.type = val
    }

    const setLfoFrequency = (val) => {
        lfoFrequency.value = val
        ensureLFO()
        lfoOsc?.frequency.setValueAtTime(val, ctx.currentTime)
    }

    const setLfoWaveform = (val) => {
        lfoWaveform.value = val
        ensureLFO()
        if (lfoOsc) lfoOsc.type = val
    }

    const setFilterCutoff = (val) => {
        filterCutoff.value = val
        ensureVCF()
        filterNode?.frequency.setValueAtTime(val, ctx.currentTime)
    }

    const setFilterResonance = (val) => {
        filterResonance.value = val
        ensureVCF()
        filterNode?.Q.setValueAtTime(val, ctx.currentTime)
    }

    const setFilterType = (val) => {
        filterType.value = val
        ensureVCF()
        if (filterNode) filterNode.type = val
    }

    const setMixerLevels = (vcoLvl, noiseLvl) => {
        vcoLevel.value = vcoLvl
        noiseLevel.value = noiseLvl
        ensureVCO()
        ensureNoise()
        vcoOutGain?.gain.setValueAtTime(vcoLvl, ctx.currentTime)
        noiseOutGain?.gain.setValueAtTime(noiseLvl, ctx.currentTime)
    }

    const setVcaMode = (mode) => {
        vcaMode.value = mode
        ensureLFO()
        lfoOutGain?.gain.setValueAtTime(mode, ctx.currentTime)
    }

    // === Envelope Action ===
    const triggerVCAEnvelope = () => {
        ensureVCA()
        if (!triggerEnvelope || !vcaGainNode) return

        const peak = 1 - vcaMode.value
        triggerEnvelope({
            attack: envelopeAttack.value,
            decay: envelopeDecay.value,
            peak
        })
    }

    const destroySynth = () => {
        try {
            vcoOsc?.stop();
            vcoOsc?.disconnect();
            lfoOsc?.stop();
            lfoOsc?.disconnect();
            noiseSrc?.stop();
            noiseSrc?.disconnect();
        } catch {}

        ;[vcoOutGain, lfoOutGain, noiseOutGain, filterNode, vcaGainNode].forEach((n) => {
            try { n?.disconnect() } catch {}
        })

        vcoOsc = lfoOsc = noiseSrc = null
        vcoOutGain = lfoOutGain = noiseOutGain = null
        filterNode = vcaGainNode = inverterGain = triggerEnvelope = null
    }

    // Nodes will be lazily initialized by the setter functions above
    return {
        // State
        audioReady, vcoFrequency, vcoWaveform, lfoFrequency, lfoWaveform,
        filterCutoff, filterResonance, filterType,
        envelopeAttack, envelopeDecay,
        vcoLevel, noiseLevel, vcaMode,

        // Actions
        setVcoFrequency, setVcoWaveform,
        setLfoFrequency, setLfoWaveform,
        setFilterCutoff, setFilterResonance, setFilterType,
        setMixerLevels, setVcaMode,
        triggerEnvelope: triggerVCAEnvelope,
        getVCAOutputNode,
        getVCAInputNode,
        getVCOOutputNode,
        getVCFInputNode,
        getVCFOutputNode,
        getNoiseOutputNode,
        getLFOOutputNode,

        // Lifecycle
        resume,
        destroySynth
    }
})
