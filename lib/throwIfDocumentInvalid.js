/**
 * Throws an error if the document is not valid.
 * @param {Document} document The Document to validate.
 * @throws {TypeError}
 */
export default function throwIfDocumentInvalid(document) {
    if (document == undefined) {
        throw new TypeError('document must be provided.');
    }

    if (typeof Document === 'undefined') return;

    const isDocument = (value) => (value instanceof Document || value instanceof HTMLDocument);
    if (Document !== undefined && !isDocument(document)) {
        throw new TypeError('document must be an instance of Document (or HTMLDocument).');
    }
}