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

        // Colour stage
        this.colourNode = null;
        this.colourDry = null;
        this.colourWet = null;
        this.colourMix = null;
        this.colourAmount = 0;
        this._colourConnectedToMixer = false;
        this._colourConnectedToFilter = false;
    }

    async resume() {
        return this.engine.resume ? this.engine.resume() : Promise.resolve();
    }

    // === Node initialise===
    initMixer() {
        this.mixerNode = this.ctx.createGain();
        if (this.filterInputGain) {
            this.mixerNode.connect(this.filterInputGain);
        }

        this._colourConnectedToMixer = false;
        this.ensureColour();
    }

    initVCF() {
        const prevFilterInputGain = this.filterInputGain;

        this.filterInputGain = this.ctx.createGain();
        this.filterNode = this.engine.createFilterNode({
            type: this.filterType,
            frequency: this.filterCutoff,
            q: this.filterResonance,
        });

        this.filterInputGain.connect(this.filterNode);

        if (prevFilterInputGain) {
            this.colourMix?.disconnect(prevFilterInputGain);
        }

        this._colourConnectedToFilter = false;
        this.ensureColour();
    }

    initVCA() {
        const envelope = this.engine.createEnvelopeGain();
        this.vcaGainNode = envelope.gainNode;
        this.triggerEnvelope = envelope.triggerEnvelope;

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
        if (!result) {
            return;
        }
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
        if (!result) {
            return;
        }
        this.lfoOsc = result.osc;
        this.lfoOutGain = result.gain;
        this.ensureVCA();
        this.lfoOutGain.connect(this.vcaGainNode.gain);
    }

    initNoise() {
        const result = this.engine.createNoiseNode();
        if (!result) {
            return;
        }
        this.noiseSrc = result.source;
        this.noiseOutGain = result.gain;
        this.ensureVCF();
        this.ensureMixer();
        this.noiseOutGain.connect(this.mixerNode);
    }

    initColour() {
        this.colourNode = this.ctx.createWaveShaper();
        const n = 44100;
        const curve = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const x = (i * 2) / n - 1;
            curve[i] = Math.tanh(x * 2);
        }
        this.colourNode.curve = curve;
        this.colourDry = this.ctx.createGain();
        this.colourWet = this.ctx.createGain();
        this.colourMix = this.ctx.createGain();
        this.colourDry.gain.value = 1 - this.colourAmount;
        this.colourWet.gain.value = this.colourAmount;
        this.colourNode.connect(this.colourWet);
        this.colourDry.connect(this.colourMix);
        this.colourWet.connect(this.colourMix);
        this._colourConnectedToMixer = false;
        this._colourConnectedToFilter = false;
    }

    ensureColour() {
        if (
            !this.colourNode ||
            !this.colourDry ||
            !this.colourWet ||
            !this.colourMix
        ) {
            this.initColour();
        }

        if (this.mixerNode && !this._colourConnectedToMixer) {
            this.mixerNode.connect(this.colourDry);
            this.mixerNode.connect(this.colourNode);
            this._colourConnectedToMixer = true;
        }

        if (this.filterInputGain && !this._colourConnectedToFilter) {
            this.colourMix.connect(this.filterInputGain);
            this._colourConnectedToFilter = true;
        }
    }

    setColourAmount(amount) {
        this.colourAmount = amount;
        this.ensureColour();
        this.colourDry.gain.setValueAtTime(1 - amount, this.ctx.currentTime);
        this.colourWet.gain.setValueAtTime(amount, this.ctx.currentTime);
    }

    // Lazy Module Loaders
    ensureVCF() {
        if (!this.filterNode || !this.filterInputGain) {
            this.initVCF();
        }

        if (!this.mixerNode) {
            this.initMixer();
        }

        this.ensureColour();
    }

    ensureVCA() {
        this.ensureVCF();

        if (!this.vcaGainNode) {
            this.initVCA();
        }
    }

    ensureVCO() {
        this.ensureVCA();

        if (!this.vcoOsc) {
            this.initVCO();
        }
    }

    ensureLFO() {
        this.ensureVCA();
        if (!this.lfoOsc) {
            this.initLFO();
        }
    }

    ensureNoise() {
        this.ensureVCF();
        if (!this.noiseSrc) {
            this.initNoise();
        }
    }

    ensureMixer() {
        if (!this.mixerNode) {
            this.initMixer();
        }
        this.ensureColour();
    }

    ensureInverter() {
        if (!this.inverterGain) {
            this.initInverter();
        }
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
            colourNode: this.colourNode,
            colourDry: this.colourDry,
            colourWet: this.colourWet,
            colourMix: this.colourMix,
            vcaGainNode: this.vcaGainNode,
            inverterGain: this.inverterGain,
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
            this.colourNode,
            this.colourDry,
            this.colourWet,
            this.colourMix,
            this.filterInputGain,
            this.filterNode,
            this.vcaGainNode,
            this.inverterGain,
        ].forEach(n => {
            try {
                n?.disconnect();
            } catch (e) {
                console.warn('Error disconnecting node:', e);
            }
        });

        this.vcoOsc = this.lfoOsc = this.noiseSrc = null;
        this.vcoOutGain = this.lfoOutGain = this.noiseOutGain = null;
        this.filterInputGain = this.filterNode = this.mixerNode = null;
        this.colourNode =
            this.colourDry =
            this.colourWet =
            this.colourMix =
                null;
        this.vcaGainNode = this.inverterGain = null;
        this._colourConnectedToMixer = false;
        this._colourConnectedToFilter = false;
        this.triggerEnvelope = null;
    }
}

export default AudioEngine;
