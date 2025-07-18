import {computed, onMounted, onUnmounted} from 'vue';
import {usePatchStore} from '../storage/patchStore';
import {useModuleRegistry} from './useModuleRegistry';

/**
 * Helper composable to register a module with the global registry
 * and expose reactive lists of connected jacks.
 */
export const useModuleConnections = (id, {getInputNode = null, getOutputNode = null} = {}) => {
    const patchStore = usePatchStore();
    const registry = useModuleRegistry();

    onMounted(() => {
        registry.register(id, {id, getInputNode, getOutputNode});
    });

    onUnmounted(() => {
        patchStore.removeConnectionsForModule(id);
        registry.unregister(id);
    });

    const connectedInputs = computed(() =>
        patchStore.getConnectionsFor(id, false).map(p => p.to.index)
    );

    const connectedOutputs = computed(() =>
        patchStore.getConnectionsFor(id, true).map(p => p.from.index)
    );

    const handlePatch = jack => {
        patchStore.selectJack(jack);
    };

    return {connectedInputs, connectedOutputs, handlePatch};
};
