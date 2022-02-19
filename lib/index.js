import buildSeriesInfoFragmentFromPosts from './buildSeriesInfoFragmentFromPosts.js';
import getPosts from './getPosts.js';
import { ElementInsertionPosition } from './insertNodeRelativeToElement.js';
import insertSeriesInfo from './insertSeriesInfo.js';
import throwIfDocumentInvalid from './throwIfDocumentInvalid.js';

export { ElementInsertionPosition } from './insertNodeRelativeToElement.js';


/**
 * Represents the minimum properties needed from the SDK for the Ghost Content API.
 * @typedef {Object} GhostContentAPI
 * @property {Object} posts Post endpoints.
 * @property {Function} posts.browse The browse posts endpoint for Ghost.
 */

/**
 * @typedef {Object} SeriesDisplay
 * @property {Function} buildSeriesInfoFragment
 * @property {Function} displaySeriesInfo
 */

/**
 * @typedef {Object} BuildSeriesInfoOptions
 * @property {string} currentPostId The ID of the current post (if any). This is a GUID-like value in Ghost. 
 * @property {(string|string[])} seriesTagSlugs One or more tag slugs for the serie(s) to build info for.
 * @property {boolean} hideSinglePostSeries A flag indicating whether or not to hide series with a single post.
 * @property {string} comingSoonText The text to display to indicate more posts are coming for a single post series.
*/

/**
 * @typedef {Object} DisplaySeriesInfoOptions
 * @property {string} currentPostId The ID of the current post (if any). This is a GUID-like value in Ghost. 
 * @property {(string|string[])} seriesTagSlugs One or more tag slugs for the serie(s) to build info for. 
 * @property {boolean} hideSinglePostSeries A flag indicating whether or not to hide series with a single post.
 * @property {string} comingSoonText The text to display to indicate more posts are coming for a single post series.
 * @property {Array<import("./insertSeriesInfo").ElementInsertionInfo>} insertions An array element insersion information structures.
 */


/**
 * @param {GhostContentAPI} ghostContentApi An instance of the Ghost Content API.
 * @returns {SeriesDisplay}
 */
export function SeriesDisplay(ghostContentApi) {
    const HtmlTagClassNamePrefix = 'tag-';
    const DefaultSeriesTagSlugPrefix = 'series-';

    /** @type {BuildSeriesInfoOptions} */
    const DefaultBuildOptions = {
        hideSinglePostSeries: false,
        comingSoonText: 'Coming soon…'
    };

    /** @type {DisplaySeriesInfoOptions} */
    const DefaultDisplayOptions = {
        insertions: [
            {
                selector: 'main .post .gh-content',
                position: ElementInsertionPosition.END
            }
        ]
    };

    const cachedPosts = new Map();


    function findSeriesTagSlugsInDocument(document, seriesTagSlugPrefix = DefaultSeriesTagSlugPrefix) {
        const bodyClasses = document.body.className.split(' ');
        return bodyClasses
            .filter(c => c.startsWith(HtmlTagClassNamePrefix + seriesTagSlugPrefix))
            .map(c => c.replace(HtmlTagClassNamePrefix, ''));
    }

    function normailizeBuildOptions(options, defaultSeriesTagSlugFinder) {
        // Ensure seriesTagSlugs is an array or find them all from the document if not explicitly provided.
        const seriesTagSlugs = options.seriesTagSlugs ?? defaultSeriesTagSlugFinder();
        options.seriesTagSlugs = [].concat(seriesTagSlugs);
        return options;
    }

    function throwIfDisplayOptionsInvalid(/** @type DisplaySeriesInfoOptions */ options) {
        if (options.insertions == undefined || !Array.isArray(options.insertions)) {
            throw new TypeError('option.insertions is required and must be an array.');
        }
    }


    /**
     * Builds series information document fragment for specific posts that share one or more tags.
     * @param {!Document} document A document object for manipuling the DOM.
     * @param {BuildSeriesInfoOptions} options The options for building.
     * @returns {Promise<DocumentFragment>} A document fragment containing series information.
     */
    async function buildSeriesInfoFragment(document, options) {
        throwIfDocumentInvalid(document);
        const backupOptions = { currentPostUrl: document.location?.origin + document.location?.pathname };
        
        // Ensure options are mixed with defaults.
        options = Object.assign({}, DefaultBuildOptions, backupOptions, options);
        options = normailizeBuildOptions(options, () => findSeriesTagSlugsInDocument(document));
        const { seriesTagSlugs } = options;

        const posts = await getPosts(ghostContentApi, seriesTagSlugs, cachedPosts);
        return await buildSeriesInfoFragmentFromPosts(document, posts, options);
    }

    /**
     * Displays series information in the DOM for specific posts that share one or more tags.
     * @param {!Document} document A document object for manipuling the DOM.
     * @param {DisplaySeriesInfoOptions} options The options for displaying.
     */
    async function displaySeriesInfo(document, options) {
        throwIfDocumentInvalid(document);

        // Ensure options are mixed with defaults and valid.
        options = Object.assign({}, DefaultDisplayOptions, options);
        const { insertions } = normailizeBuildOptions(options, () => findSeriesTagSlugsInDocument(document));
        throwIfDisplayOptionsInvalid(options);

        const seriesInfoFragment = await buildSeriesInfoFragment(document, options);
        if (!seriesInfoFragment) return;

        // Ensure the DOM is loaded first.
        const insertClosure = () => insertSeriesInfo(document, seriesInfoFragment, insertions);
        if (document.readyState !== 'loading') {
            insertClosure();
        } else {
            document.addEventListener('DOMContentLoaded', insertClosure);
        }
    }


    return {
        buildSeriesInfoFragment,
        displaySeriesInfo    
    };
}
