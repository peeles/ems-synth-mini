import {onUnmounted} from 'vue';

const subscribers = new Set();
let rafId = null;

const tick = time => {
    subscribers.forEach(cb => {
        try {
            cb(time);
        } catch (e) {
            console.warn('Animation callback failed:', e);
        }
    });
    if (subscribers.size > 0) {
        rafId = requestAnimationFrame(tick);
    } else {
        rafId = null;
    }
};

const subscribe = cb => {
    subscribers.add(cb);
    if (rafId === null) {
        rafId = requestAnimationFrame(tick);
    }
    return () => {
        subscribers.delete(cb);
        if (subscribers.size === 0 && rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    };
};

export const useAnimationSchedule = callback => {
    if (callback) {
        const unsubscribe = subscribe(callback);
        onUnmounted(() => unsubscribe());
        return unsubscribe;
    }
    return {subscribe};
};
