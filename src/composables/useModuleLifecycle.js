import {onUnmounted} from 'vue';
export const useModuleLifecycle = nodeRef => {
    onUnmounted(() => {
        try {
            nodeRef?.stop?.();
            nodeRef?.disconnect?.();
        } catch (e) {
            console.warn('Module cleanup failed:', e);
        }
    });
};
