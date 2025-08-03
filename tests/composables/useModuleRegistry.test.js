import {describe, it, expect} from 'vitest';
import {useModuleRegistry} from '../../src/composables/useModuleRegistry.js';

describe('useModuleRegistry', () => {
    it('registers, retrieves, lists, and unregisters modules', () => {
        const registry = useModuleRegistry();
        const mod = {id: 'm1'};
        registry.register('m1', mod);
        expect(registry.get('m1')).toEqual(mod);
        expect(registry.list()).toEqual([['m1', mod]]);
        registry.unregister('m1');
        expect(registry.get('m1')).toBeUndefined();
    });
});
