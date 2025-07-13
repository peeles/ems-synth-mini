import { reactive } from 'vue';

const moduleMap = reactive(new Map());

export const useModuleRegistry = () => {
    const register = (id, module) => {
        moduleMap.set(id, module);
    };

    const unregister = (id) => {
        moduleMap.delete(id);
    };

    const get = (id) => {
        return moduleMap.get(id);
    };

    const list = () => {
        return Array.from(moduleMap.entries());
    };

    return {
        register,
        unregister,
        get,
        list
    };
}
