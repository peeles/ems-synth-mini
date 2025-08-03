import {describe, it, expect} from 'vitest';
import {useSynthEngine} from '../../src/composables/useSynthEngine.js';

class FakeAudioContext {
    constructor() {
        this.state = 'suspended';
        this.resumeCalled = false;
    }

    resume() {
        this.state = 'running';
        this.resumeCalled = true;
        return Promise.resolve();
    }
}

describe('useSynthEngine', () => {
    it('uses injected AudioContext instance', async () => {
        const ctx = new FakeAudioContext();
        const engine = useSynthEngine(ctx);

        expect(engine.context).toBe(ctx);
        await engine.resume();
        expect(ctx.resumeCalled).toBe(true);
        expect(ctx.state).toBe('running');
    });
});
