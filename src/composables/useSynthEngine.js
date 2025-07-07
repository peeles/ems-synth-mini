let audioContext = null

export const useSynthEngine = () => {
    const getContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        return audioContext
    }

    const resume = async () => {
        const ctx = getContext()
        if (ctx.state === 'suspended') {
            await ctx.resume()
        }
    }

    const createOscillatorNode = ({
                                      frequency = 440,
                                      type = 'sine',
                                      gain = 0.5,
                                      autoStart = true
                                  } = {}) => {
        const ctx = getContext()
        try {
            const osc = ctx.createOscillator()
            const gainNode = ctx.createGain()

            osc.type = type
            osc.frequency.setValueAtTime(frequency, ctx.currentTime)
            gainNode.gain.setValueAtTime(gain, ctx.currentTime)

            osc.connect(gainNode)
            if (autoStart) osc.start()

            return {
                osc,
                gain: gainNode,
                stop: () => {
                    try {
                        osc.stop()
                        osc.disconnect()
                        gainNode.disconnect()
                    } catch (e) {
                        console.warn('oscillator cleanup failed', e)
                    }
                }
            }
        } catch (e) {
            console.error('createOscillatorNode error:', e)
            return null
        }
    }

    const createFilterNode = ({
                                  type = 'lowpass',
                                  frequency = 800,
                                  q = 1
                              } = {}) => {
        const ctx = getContext()
        try {
            const filter = ctx.createBiquadFilter()
            filter.type = type
            filter.frequency.setValueAtTime(frequency, ctx.currentTime)
            filter.Q.setValueAtTime(q, ctx.currentTime)
            return filter
        } catch (e) {
            console.error('createFilterNode error:', e)
            return null
        }
    }

    const createNoiseNode = () => {
        const ctx = getContext()
        try {
            const bufferSize = ctx.sampleRate
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
            const data = buffer.getChannelData(0)

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1
            }

            const source = ctx.createBufferSource()
            source.buffer = buffer
            source.loop = true

            const gainNode = ctx.createGain()
            source.connect(gainNode)
            source.start()

            return {
                source,
                gain: gainNode,
                stop: () => {
                    try {
                        source.stop()
                        source.disconnect()
                        gainNode.disconnect()
                    } catch (e) {
                        console.warn('noise cleanup failed', e)
                    }
                }
            }
        } catch (e) {
            console.error('createNoiseNode error:', e)
            return null
        }
    }

    const createEnvelopeGain = () => {
        const ctx = getContext()
        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(0, ctx.currentTime)

        const triggerEnvelope = ({
                                     attack = 0.2,
                                     decay = 0.5,
                                     peak = 1,
                                 } = {}) => {
            const now = ctx.currentTime
            gainNode.gain.cancelScheduledValues(now)
            gainNode.gain.setValueAtTime(0, now)

            if (attack > 0) {
                gainNode.gain.linearRampToValueAtTime(peak, now + attack)
            } else {
                gainNode.gain.setValueAtTime(peak, now)
            }

            gainNode.gain.linearRampToValueAtTime(0, now + attack + decay)
        }

        return {
            gainNode,
            triggerEnvelope,
            stop: () => {
                try {
                    gainNode.disconnect()
                } catch (e) {
                    console.warn('envelope gain cleanup failed', e)
                }
            }
        }
    }

    return {
        context: getContext(),
        resume,
        createOscillatorNode,
        createFilterNode,
        createNoiseNode,
        createEnvelopeGain
    }
}
