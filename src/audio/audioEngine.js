import {useSynthEngine} from '@/composables/useSynthEngine';

export class AudioEngine {
    constructor(
        {
            vcoFrequency = 440,
            vcoWaveform = 'sawtooth',
            lfoFrequency = 5,
            lfoWaveform = 'sine',
            filterCutoff = 800,
            filterResonance = 1,
            filterType = 'lowpass',
        } = {},
        engine = useSynthEngine()
    ) {
        this.engine = engine;
        this.ctx = engine.context;
        this.context = this.ctx;

        this.vcoFrequency = vcoFrequency;
        this.vcoWaveform = vcoWaveform;
        this.lfoFrequency = lfoFrequency;
        this.lfoWaveform = lfoWaveform;
        this.filterCutoff = filterCutoff;
        this.filterResonance = filterResonance;
        this.filterType = filterType;

        // Node references
        this.vcoOsc = null;
        this.vcoOutGain = null;
        this.lfoOsc = null;
        this.lfoOutGain = null;
        this.noiseSrc = null;
        this.noiseOutGain = null;
        this.filterInputGain = null;
        this.filterNode = null;
        this.mixerNode = null;
        this.vcaGainNode = null;
        this.inverterGain = null;
        this.triggerEnvelope = null;
        this.envelopeTriggerGain = null;
        this.triggerPollId = null;
        this.prevTrigger = 0;
    }

    async resume() {
        return this.engine.resume ? this.engine.resume() : Promise.resolve();
    }

    // === Node initialisers ===
    initMixer() {
        this.mixerNode = this.ctx.createGain();
        if (this.filterInputGain) {
            this.mixerNode.connect(this.filterInputGain);
        }
    }

    initVCF() {
        this.filterInputGain = this.ctx.createGain();
        this.filterNode = this.engine.createFilterNode({
            type: this.filterType,
            frequency: this.filterCutoff,
            q: this.filterResonance,
        });
        this.filterInputGain.connect(this.filterNode);
        this.mixerNode?.disconnect();
        this.mixerNode?.connect(this.filterInputGain);
    }

    initVCA() {
        const envelope = this.engine.createEnvelopeGain();
        this.vcaGainNode = envelope.gainNode;
        this.triggerEnvelope = envelope.triggerEnvelope;
        this.ensureEnvelopeTrigger();

        this.filterNode?.connect(this.vcaGainNode);
        this.vcaGainNode.connect(this.ctx.destination);
    }

    initInverter() {
        this.inverterGain = this.ctx.createGain();
        this.inverterGain.gain.value = -1;
    }

    initVCO() {
        const result = this.engine.createOscillatorNode({
            frequency: this.vcoFrequency,
            type: this.vcoWaveform,
            gain: 1.0,
        });
        if (!result) return;
        this.vcoOsc = result.osc;
        this.vcoOutGain = result.gain;
        this.ensureVCF();
        this.ensureMixer();
        this.vcoOutGain.connect(this.mixerNode);
    }

    initLFO() {
        const result = this.engine.createOscillatorNode({
            frequency: this.lfoFrequency,
            type: this.lfoWaveform,
            gain: 1.0,
        });
        if (!result) return;
        this.lfoOsc = result.osc;
        this.lfoOutGain = result.gain;
        this.ensureVCA();
        this.lfoOutGain.connect(this.vcaGainNode.gain);
    }

    initNoise() {
        const result = this.engine.createNoiseNode();
        if (!result) return;
        this.noiseSrc = result.source;
        this.noiseOutGain = result.gain;
        this.ensureVCF();
        this.ensureMixer();
        this.noiseOutGain.connect(this.mixerNode);
    }

    initEnvelopeTrigger() {
        this.envelopeTriggerGain = this.ctx.createGain();
        this.envelopeTriggerGain.gain.value = 0;
        const poll = () => {
            if (
                this.envelopeTriggerGain.gain.value > 0.5 &&
                this.prevTrigger <= 0.5
            ) {
                this.triggerEnvelope?.();
            }
            this.prevTrigger = this.envelopeTriggerGain.gain.value;
            this.triggerPollId = requestAnimationFrame(poll);
        };
        this.triggerPollId = requestAnimationFrame(poll);
    }

    // === Lazy initialisers ===
    ensureVCF() {
        if (!this.filterNode || !this.filterInputGain) this.initVCF();
        if (!this.mixerNode) this.initMixer();
    }

    ensureVCA() {
        this.ensureVCF();
        if (!this.vcaGainNode) this.initVCA();
    }

    ensureVCO() {
        this.ensureVCA();
        if (!this.vcoOsc) this.initVCO();
    }

    ensureLFO() {
        this.ensureVCA();
        if (!this.lfoOsc) this.initLFO();
    }

    ensureNoise() {
        this.ensureVCF();
        if (!this.noiseSrc) this.initNoise();
    }

    ensureMixer() {
        if (!this.mixerNode) this.initMixer();
    }

    ensureInverter() {
        if (!this.inverterGain) this.initInverter();
    }

    ensureEnvelopeTrigger() {
        if (!this.envelopeTriggerGain) this.initEnvelopeTrigger();
    }

    getNodes() {
        return {
            vcoOsc: this.vcoOsc,
            vcoOutGain: this.vcoOutGain,
            lfoOsc: this.lfoOsc,
            lfoOutGain: this.lfoOutGain,
            noiseSrc: this.noiseSrc,
            noiseOutGain: this.noiseOutGain,
            filterNode: this.filterNode,
            filterInputGain: this.filterInputGain,
            mixerNode: this.mixerNode,
            vcaGainNode: this.vcaGainNode,
            inverterGain: this.inverterGain,
            envelopeTriggerGain: this.envelopeTriggerGain,
            triggerEnvelope: this.triggerEnvelope,
        };
    }

    destroyAll() {
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

        safelyStopAndDisconnect(this.vcoOsc);
        safelyStopAndDisconnect(this.lfoOsc);
        safelyStopAndDisconnect(this.noiseSrc);

        [
            this.vcoOutGain,
            this.lfoOutGain,
            this.noiseOutGain,
            this.mixerNode,
            this.filterInputGain,
            this.filterNode,
            this.vcaGainNode,
            this.inverterGain,
            this.envelopeTriggerGain,
        ].forEach(n => {
            try {
                n?.disconnect();
            } catch (e) {
                console.warn('Error disconnecting node:', e);
            }
        });

        if (this.triggerPollId) {
            cancelAnimationFrame(this.triggerPollId);
            this.triggerPollId = null;
        }

        this.vcoOsc = this.lfoOsc = this.noiseSrc = null;
        this.vcoOutGain = this.lfoOutGain = this.noiseOutGain = null;
        this.filterInputGain =
            this.filterNode =
            this.mixerNode =
            this.vcaGainNode =
            this.inverterGain =
                null;
        this.envelopeTriggerGain = this.triggerEnvelope = null;
    }
}

export default AudioEngine;
