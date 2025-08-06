import {markRaw, ref} from 'vue';
import {acceptHMRUpdate, defineStore} from 'pinia';

export const useAsideStore = defineStore('aside', () => {
    const isOpen = ref(false);
    const content = ref(null);
    const contentProps = ref({});

    const open = async (asideContent, asideProps = {}) => {
        content.value = markRaw(asideContent);
        contentProps.value = asideProps;
        isOpen.value = true;
    };

    const close = () => {
        isOpen.value = false;
        reset();
    };

    const reset = () => {
        content.value = {};
        contentProps.value = {};
    };

    return {
        isOpen,
        content,
        contentProps,
        open,
        close,
        reset,
    };
});

export default useAsideStore;

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAsideStore, import.meta.hot));
}
