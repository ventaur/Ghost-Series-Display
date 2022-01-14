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