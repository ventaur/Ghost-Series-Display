import { insertNodeRelativeToElement } from './insertNodeRelativeToElement.js';
import times from './times.js';


/**
 * @typedef {Object} ElementInsertionInfo
 * @property {!string} selector A CSS selector string for an element to insert relative to.
 * @property {!ElementInsertionPosition} position The position to insert a node relative to an element.
 */


/**
 * Inserts series info into a document.
 * @param {!Document} document The Document to insert into.
 * @param {!DocumentFragment} seriesInfoFragment The Document Fragment containing the series info.
 * @param {!ElementInsertionInfo[]} insertions An array of element insertion infos.
 */
export default function insertSeriesInfo(document, seriesInfoFragment, insertions) {
    // Insert the series info fragment into the appropriate location(s) of the document.
    let fragments = [ seriesInfoFragment ];
    const delayedActions = [];

    for (const insertion of insertions) {
        const elements = document.querySelectorAll(insertion.selector);
        
        // We need to clone the fragment if we have more than one insertion and/or element matching the selector.
        const fragmentCloneCount = elements.length - fragments.length;
        fragments = [...fragments, ...times(fragmentCloneCount, () => seriesInfoFragment.cloneNode(true)) ];
        
        for (const element of elements) {
            const fragment = fragments.pop();
            delayedActions.push(() => insertNodeRelativeToElement(fragment, element, insertion.position));
        }
    }

    // We delayed the actual inserts because after a DocumentFragment is added to a document,
    // its nodes are moved. Therefore, cloning it later means we clone an empty fragment.
    delayedActions.forEach(action => action());
}