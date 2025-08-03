import {describe, it, expect, vi} from 'vitest';
import {useDebounce} from '../src/composables/useDebounce.js';

describe('useDebounce', () => {
    it('runs the debounced function with the latest arguments', async () => {
        const fn = vi.fn();
        const {run} = useDebounce(fn, 10);

        run('first');
        run('second');

        expect(fn).not.toHaveBeenCalled();
        await new Promise(resolve => setTimeout(resolve, 20));

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('second');
    });

    it('cancels a pending call', async () => {
        const fn = vi.fn();
        const {run, cancel} = useDebounce(fn, 10);

        run('value');
        cancel();

        await new Promise(resolve => setTimeout(resolve, 20));

        expect(fn).not.toHaveBeenCalled();
    });
});
