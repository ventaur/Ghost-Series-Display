export default function groupBy(collection, iteratee) {
    return collection.reduce((map, value) => {
        // Get the key(s) for this collection value.
        const keys = [...iteratee(value)];

        for (const key of keys) {
            // Add to any existing array of values for this key.
            const existingValues = map.get(key) ?? [];
            map.set(key, [...existingValues, value]);
        }

        return map;
    }, new Map());
}