/**
 * The position for insertion of an element.
 * @readonly
 * @enum {string}
 */
 export const ElementInsertionPosition = {
    BEFORE: 'before',
    AFTER: 'after',
    BEGIN: 'begin',
    END: 'end'
};

/**
 * Insert a node relative to an element.
 * @param {!Node} node The DOM Node to insert.
 * @param {!Element} element The DOM Element to insert the node relative to.
 * @param {!ElementInsertionPosition} insertionPosition The position to insert the node.
 */
export function insertNodeRelativeToElement(node, element, insertionPosition) {
    switch (insertionPosition) {
        case ElementInsertionPosition.BEFORE:
            element.before(node);
            break;

        case ElementInsertionPosition.AFTER:
            element.after(node);
            break;

        case ElementInsertionPosition.BEGIN:
            element.prepend(node);
            break;

        case ElementInsertionPosition.END:
            element.append(node);
            break;

        default:
            throw new RangeError('insertionPosition must be one of ElementInsertionPosition.');
    }
}