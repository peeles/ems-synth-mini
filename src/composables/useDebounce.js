/**
 * Creates a debounced function.
 * @param {Function} fn The function to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns { run: Function, cancel: Function } Object with run and cancel methods.
 */
export function useDebounce(fn, delay) {
    let timeoutId = null;

    /**
     * Clears any scheduled invocation.
     */
    const cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = null;
    }

    /**
     * Schedules the debounced function call.
     * @param {...any} args Arguments to pass to the original function.
     */
    const run = (...args) => {
        cancel();
        timeoutId = setTimeout(() => {
                fn(...args);
                timeoutId = null;
            }, delay);
    };

    return {
        run,
        cancel
    };
}
