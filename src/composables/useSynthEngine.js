peeles
let audioContext = null;

export const useSynthEngine = () => {
    // Lazily get or create a singleton AudioContext
    const getContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    };

    // Resume context (for user interaction unlock on some browsers)
    const resume = async () => {
        const ctx = getContext();
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
    };

    // Create an oscillator with an attached gain (amplitude control)
    const createOscillatorNode = ({ frequency = 440, type = 'sine', gain = 0.5 }) => {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);
        gainNode.gain.setValueAtTime(gain, ctx.currentTime);
        osc.connect(gainNode);
        osc.start();  // start oscillator immediately
        return { osc, gain: gainNode };
    };

    // Create a noise source using a looping audio buffer of random data
    const createNoiseNode = () => {
        const ctx = getContext();
        // Create a 1-second buffer filled with random samples (-1.0 to 1.0)
        const bufferSize = ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;
        const gainNode = ctx.createGain();
        noiseSource.connect(gainNode);
        noiseSource.start();
        return { source: noiseSource, gain: gainNode };
    };

    // Create a biquad filter node for the VCF
    const createFilterNode = ({ type = 'lowpass', frequency = 800, q = 1 }) => {
        const ctx = getContext();
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.setValueAtTime(frequency, ctx.currentTime);
        filter.Q.setValueAtTime(q, ctx.currentTime);
        return filter;
    };

    return {
        context: getContext(),
        resume,
        createOscillatorNode,
        createNoiseNode,
        createFilterNode
    };
};
