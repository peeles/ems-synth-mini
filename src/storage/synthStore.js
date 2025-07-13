import {defineStore} from 'pinia'
import {ref} from 'vue'
import {useSynthEngine} from '../composables/useSynthEngine'

export const useSynthStore = defineStore('synth', () => {
    const audioReady = ref(false)
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
    let mixerNode
    let vcaGainNode
    let inverterGain
    let triggerEnvelope // now from engine.createEnvelopeGain()

    async function resume() {
        await ctx.resume()
        if (ctx.state === 'running') {
            audioReady.value = true
        }
    }

    // === Modular Initializers ===

    const getVCAOutputNode = () => {
        ensureVCA()
        return vcaGainNode
    }

    const getVCAInputNode = () => {
        ensureVCA()
        return vcaGainNode.gain
    }

    const getVCOOutputNode = () => {
        ensureVCO()
        return vcoOutGain
    }

    const getVCOInputNode = () => {
        ensureVCO()
        return vcoOsc?.frequency || null
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

    const getMixerOutputNode = () => {
        ensureMixer()
        return mixerNode
    }

    const getLFOOutputNode = () => {
        ensureLFO()
        return lfoOutGain
    }

    const getLFOInputNode = () => {
        ensureLFO()
        return lfoOsc?.frequency || null
    }

    const initMixer = () => {
        mixerNode = ctx.createGain()
        mixerNode.connect(filterNode)
    }

    const initVCF = () => {
        filterNode = engine.createFilterNode({
            type: filterType.value,
            frequency: filterCutoff.value,
            q: filterResonance.value,
        })
        mixerNode?.disconnect()
        mixerNode?.connect(filterNode)
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
            gain: 1.0,
        })
        if (!result) return
        vcoOsc = result.osc
        vcoOutGain = result.gain
        ensureVCF()
        ensureMixer()
        vcoOutGain.connect(mixerNode)
    }

    const initLFO = () => {
        const result = engine.createOscillatorNode({
            frequency: lfoFrequency.value,
            type: lfoWaveform.value,
            gain: 1.0,
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
        ensureVCF()
        ensureMixer()
        noiseOutGain.connect(mixerNode)
    }

    // Lazy initializer helpers
    const ensureVCF = () => {
        if (!filterNode) initVCF()
        ensureMixer()
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

    const ensureMixer = () => {
        if (!mixerNode) initMixer()
    }

    // === Parameter Actions ===

    const setVcoFrequency = val => {
        vcoFrequency.value = val
        ensureVCO()
        vcoOsc?.frequency.setValueAtTime(val, ctx.currentTime)
    }

    const setVcoWaveform = val => {
        vcoWaveform.value = val
        ensureVCO()
        if (vcoOsc) vcoOsc.type = val
    }

    const setLfoFrequency = val => {
        lfoFrequency.value = val
        ensureLFO()
        lfoOsc?.frequency.setValueAtTime(val, ctx.currentTime)
    }

    const setLfoWaveform = val => {
        lfoWaveform.value = val
        ensureLFO()
        if (lfoOsc) lfoOsc.type = val
    }

    const FILTER_MIN_FREQ = 20
    const FILTER_MIN_Q = 0.1
    const FILTER_MAX_Q = 20
    const FILTER_SMOOTH_TIME = 0.02

    const setFilterCutoff = val => {
        filterCutoff.value = val
        const clamped = Math.max(FILTER_MIN_FREQ, val)
        filterCutoff.value = clamped
        ensureVCF()
        filterNode?.frequency.setValueAtTime(val, ctx.currentTime)
        if (!filterNode) return
        const now = ctx.currentTime
        filterNode.frequency.cancelScheduledValues(now)
        filterNode.frequency.setTargetAtTime(clamped, now, FILTER_SMOOTH_TIME)
    }

    const setFilterResonance = val => {
        filterResonance.value = val
        const clamped = Math.min(FILTER_MAX_Q, Math.max(FILTER_MIN_Q, val))
        filterResonance.value = clamped
        ensureVCF()
        filterNode?.Q.setValueAtTime(val, ctx.currentTime)
        if (!filterNode) return
        const now = ctx.currentTime
        filterNode.Q.cancelScheduledValues(now)
        filterNode.Q.setTargetAtTime(clamped, now, FILTER_SMOOTH_TIME)
    }

    const setFilterType = val => {
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

    const setVcaMode = mode => {
        vcaMode.value = mode
        ensureLFO()
        lfoOutGain?.gain.setValueAtTime(mode, ctx.currentTime)
    }

    const setEnvelopeAttack = val => {
        envelopeAttack.value = val
    }

    const setEnvelopeDecay = val => {
        envelopeDecay.value = val
    }

    // === Envelope Action ===
    const triggerVCAEnvelope = () => {
        ensureVCA()
        if (!triggerEnvelope || !vcaGainNode) return

        const peak = 1 - vcaMode.value
        triggerEnvelope({
            attack: envelopeAttack.value,
            decay: envelopeDecay.value,
            peak,
        })
    }

    const destroySynth = () => {
        try {
            vcoOsc?.stop()
            vcoOsc?.disconnect()
            lfoOsc?.stop()
            lfoOsc?.disconnect()
            noiseSrc?.stop()
            noiseSrc?.disconnect()
        } catch {}

        ;[
            vcoOutGain,
            lfoOutGain,
            noiseOutGain,
            mixerNode,
            filterNode,
            vcaGainNode,
        ].forEach(n => {
            try {
                n?.disconnect()
            } catch {}
        })

        vcoOsc = lfoOsc = noiseSrc = null
        vcoOutGain = lfoOutGain = noiseOutGain = null
        filterNode =
            mixerNode =
            vcaGainNode =
            inverterGain =
            triggerEnvelope =
                null
    }

    // Nodes will be lazily initialized by the setter functions above
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
        triggerEnvelope: triggerVCAEnvelope,
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

        // Lifecycle
        resume,
        destroySynth,
    }
})
