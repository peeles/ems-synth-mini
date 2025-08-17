export function useMidiInput(onNote) {
    const inputs = new Set();

    const handleMIDIMessage = e => {
        const [status, note, velocity] = e.data || [];
        const command = status & 0xf0;
        if (command === 0x90 && velocity > 0) {
            onNote(note, velocity);
        }
    };

    const bindInput = input => {
        if (!input || typeof input !== 'object') {
            return;
        }

        inputs.add(input);
        input.onmidimessage = handleMIDIMessage;
    };

    const setup = async () => {
        if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
            return;
        }

        try {
            const access = await navigator.requestMIDIAccess();
            access.inputs.forEach(bindInput);
            access.onstatechange = () => access.inputs.forEach(bindInput);
        } catch (err) {
            console.warn('MIDI not available', err);
        }
    };

    const cleanup = () => {
        inputs.forEach(input => {
            input.onmidimessage = null;
        });
        inputs.clear();
    };

    return {
        setup,
        cleanup,
        handleMIDIMessage,
    };
}
