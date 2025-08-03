/**
 * Creates a debounced function.
 * @param {Function} fn The function to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {Function} A debounced version of the function.
 */
export function useDebounce(fn, delay) {
    let timeoutId = null;

    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
}
