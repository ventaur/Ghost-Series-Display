/**
 * A function invoked a number of times.
 * @typedef {Function} BlindAction
 * @param {number} index The index of the iteration.
 * @returns {*}
 */

/**
 * Invokes the action n times, returning an array of the results of each invocation.
 * @param {!number} n The number of times to invoke the action.
 * @param {!BlindAction} action The function invoked per iteration.
 * @returns {Array} Returns an array of the results.
 */
export default function times(n, action) {
    if (n < 0) return [];
    
    const result = Array(n);
    for (let i = 0; i < result.length; i++) {
        result[i] = action(i);
    }

    return result;
}