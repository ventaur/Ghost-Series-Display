/**
 * A function invoked on each value of an Iterable to produce a matching key for.
 * @typedef {Function} KeyProducerIteratee
 * @param {*} value The current value of an Iterable.
 * @returns {(*|Array)} Returns 
 */

/**
 * Groups the values of a collection by the result of a iteratee function for each value.
 * @param {!Iterable} collection The Iterable to group values for.
 * @param {!KeyProducerIteratee} iteratee The iteratee invoked to transform each value of the collection into keys.
 * @returns {Map<*, Array]>} Returns a Map of keys produced by iteratee and an Array of values to map to that key.
 */
export default function groupBy(collection, iteratee) {
    // Basic reduce for Iterable.
    const map = new Map();
    for (const value of collection) {
        // Get the key(s) for this collection value.
        const keys = [].concat(iteratee(value));
        
        for (const key of keys) {
            // Add to any existing array of values for this key.
            const existingValues = map.get(key) ?? [];
            map.set(key, [...existingValues, value]);
        }
    }

    return map;
}