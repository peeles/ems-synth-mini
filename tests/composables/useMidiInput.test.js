import {describe, it, expect, beforeEach, vi} from 'vitest';
import {useMidiInput} from '@/composables/useMidiInput';

describe('useMidiInput', () => {
    let onNote;
    let mockInput;
    let access;

    beforeEach(() => {
        onNote = vi.fn();
        mockInput = {};
        access = {
            inputs: new Map([[1, mockInput]]),
            onstatechange: null,
        };
        access.inputs.forEach = function (cb) {
            for (const v of this.values()) cb(v);
        };
        global.navigator = {
            requestMIDIAccess: vi.fn().mockResolvedValue(access),
        };
    });

    it('binds inputs, handles messages and cleans up', async () => {
        const {setup, cleanup, handleMIDIMessage} = useMidiInput(onNote);
        await setup();
        expect(mockInput.onmidimessage).toBe(handleMIDIMessage);

        // Note on message
        handleMIDIMessage({data: [0x90, 60, 127]});
        expect(onNote).toHaveBeenCalledWith(60, 127);

        // State change rebinding
        mockInput.onmidimessage = null;
        access.onstatechange();
        expect(mockInput.onmidimessage).toBe(handleMIDIMessage);

        cleanup();
        expect(mockInput.onmidimessage).toBeNull();
    });

    it('ignores non-note-on messages', () => {
        const {handleMIDIMessage} = useMidiInput(onNote);
        handleMIDIMessage({data: [0x80, 60, 0]});
        expect(onNote).not.toHaveBeenCalled();
    });

    it('handles missing navigator gracefully', async () => {
        delete global.navigator;
        const {setup} = useMidiInput(onNote);
        await setup();
        expect(onNote).not.toHaveBeenCalled();
    });

    it('warns when requestMIDIAccess fails', async () => {
        const error = new Error('fail');
        global.navigator = {
            requestMIDIAccess: vi.fn().mockRejectedValue(error),
        };
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const {setup} = useMidiInput(onNote);
        await setup();
        expect(warn).toHaveBeenCalledWith('MIDI not available', error);
        warn.mockRestore();
    });
});
