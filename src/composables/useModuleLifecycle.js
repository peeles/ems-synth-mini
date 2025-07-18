import {onUnmounted} from 'vue';

/**
 * Ensure provided AudioNodes are properly stopped and disconnected
 * when the component using them unmounts.
 */
export const useModuleLifecycle = (...nodes) => {
    onUnmounted(() => {
        nodes.forEach(node => {
            try {
                node?.stop?.();
            } catch (e) {
                console.warn('Module cleanup failed while stopping:', e);
            }
            try {
                node?.disconnect?.();
            } catch (e) {
                console.warn('Module cleanup failed while disconnecting:', e);
            }
        });
    });
};
