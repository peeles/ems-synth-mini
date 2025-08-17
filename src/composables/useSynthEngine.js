let defaultAudioContext = null;

export const resetDefaultAudioContext = () => {
    defaultAudioContext = null;
};

export const useSynthEngine = (injectedContext = null) => {
    const getContext = () => {
        if (injectedContext) {
            return injectedContext;
        }

        if (typeof window === 'undefined') {
            return null;
        }

        if (!defaultAudioContext) {
            const AudioContextCtor =
                window.AudioContext || window.webkitAudioContext;
            if (!AudioContextCtor) {
                return null;
            }
            defaultAudioContext = new AudioContextCtor();
        }

        return defaultAudioContext;
    };

    const resume = async () => {
        const ctx = getContext();
        if (ctx && ctx.state === 'suspended') {
            await ctx.resume();
        }
    };

    const createOscillatorNode = ({
        frequency = 440,
        type = 'sine',
        gain = 0.5,
        autoStart = true,
    } = {}) => {
        const ctx = getContext();

        if (!ctx) {
            return null;
        }

        try {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
            gainNode.gain.setValueAtTime(gain, ctx.currentTime);

            osc.connect(gainNode);
            if (autoStart) osc.start();

            return {
                osc,
                gain: gainNode,
                stop: () => {
                    try {
                        osc.stop();
                        osc.disconnect();
                        gainNode.disconnect();
                    } catch (e) {
                        console.warn('oscillator cleanup failed', e);
                    }
                },
            };
        } catch (e) {
            console.error('createOscillatorNode error:', e);
            return null;
        }
    };

    const createFilterNode = ({
        type = 'lowpass',
        frequency = 800,
        q = 1,
    } = {}) => {
        const ctx = getContext();

        if (!ctx) {
            return null;
        }

        try {
            const filter = ctx.createBiquadFilter();
            const minFreq = 20;
            const maxFreq = ctx.sampleRate / 2;
            const clampedFreq = Math.min(maxFreq, Math.max(minFreq, frequency));
            filter.type = type;
            filter.frequency.setValueAtTime(clampedFreq, ctx.currentTime);
            filter.Q.setValueAtTime(q, ctx.currentTime);

            return filter;
        } catch (e) {
            console.error('createFilterNode error:', e);
            return null;
        }
    };

    const createNoiseNode = () => {
        const ctx = getContext();

        if (!ctx) {
            return null;
        }

        try {
            // Use a short buffer to minimise memory usage.
            const bufferSize = Math.floor(ctx.sampleRate / 10);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            const fillBuffer = () => {
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
            };
            fillBuffer();

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            // Refresh the buffer at the buffer's duration to avoid repeating
            // noise patterns while keeping allocations small.
            const updateIntervalMs = (bufferSize / ctx.sampleRate) * 1000;
            const intervalId = setInterval(fillBuffer, updateIntervalMs);

            const gainNode = ctx.createGain();
            source.connect(gainNode);
            source.start();

            // Ensure interval is cleared when the source is stopped.
            const originalStop = source.stop.bind(source);
            source.stop = (...args) => {
                clearInterval(intervalId);
                originalStop(...args);
            };

            return {
                source,
                gain: gainNode,
            };
        } catch (e) {
            console.error('createNoiseNode error:', e);
            return null;
        }
    };

    const createEnvelopeGain = () => {
        const ctx = getContext();

        if (!ctx) {
            return null;
        }

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0, ctx.currentTime);

        const triggerEnvelope = ({
            attack = 0.2,
            decay = 0.5,
            peak = 1,
        } = {}) => {
            const now = ctx.currentTime;
            if (typeof gainNode.gain.cancelAndHoldAtTime === 'function') {
                gainNode.gain.cancelAndHoldAtTime(now);
            } else {
                const current = gainNode.gain.value;
                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(current, now);
            }

            if (attack > 0) {
                gainNode.gain.linearRampToValueAtTime(peak, now + attack);
            } else {
                gainNode.gain.setValueAtTime(peak, now);
            }

            gainNode.gain.linearRampToValueAtTime(0, now + attack + decay);
        };

        return {
            gainNode,
            triggerEnvelope,
            stop: () => {
                try {
                    gainNode.disconnect();
                } catch (e) {
                    console.warn('envelope gain cleanup failed', e);
                }
            },
        };
    };

    return {
        context: getContext(),
        resume,
        createOscillatorNode,
        createFilterNode,
        createNoiseNode,
        createEnvelopeGain,
    };
};
