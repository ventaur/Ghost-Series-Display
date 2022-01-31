import groupBy from './groupBy.js';
import times from './times.js';


/*
You could create a new GhostContentAPI with your valid Content API key via Code Injection, 
then pass it to your call to this constructor.

var api = new GhostContentAPI({
    url: `${window.location.protocol}//${window.location.host}`,
    key: '0123456789abcdef0123456789',
    version: 'v4'
});
*/ 

/**
 * Represents the minimum properties needed from the SDK for the Ghost Content API.
 * @typedef {Object} GhostContentAPI
 * @property {Object} posts Post endpoints.
 * @property {Function} posts.browse The browse posts endpoint for Ghost.
 */

/**
 * @typedef {Object} SeriesDisplay
 * @property {Function} displaySeriesInfo
 * @property {Function} buildSeriesInfoFragment
 */

/**
 * @typedef {Object} BuildSeriesInfoOptions
 * @property {string} currentPostId The ID of the current post (if any). This is a GUID-like value in Ghost. 
 * @property {(string|string[])} seriesTagSlugs One or more tag slugs for the serie(s) to build info for. 
*/

/**
 * @typedef {Object} DisplaySeriesInfoOptions
 * @property {string} currentPostId The ID of the current post (if any). This is a GUID-like value in Ghost. 
 * @property {(string|string[])} seriesTagSlugs One or more tag slugs for the serie(s) to build info for. 
 * @property {Array<ElementInsertionInfo>} insertions An array element insersion information structures.
 */

/**
 * 
 * @typedef {Object} ElementInsertionInfo
 * @property {!string} selector A CSS selector string for an element to insert relative to.
 * @property {!ElementInsertionPosition} position The position to insert a node relative to an element.
 */


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
 * @param {GhostContentAPI} ghostContentApi An instance of the Ghost Content API.
 * @returns {SeriesDisplay}
 */
export function SeriesDisplay(ghostContentApi) {
    const HtmlTagClassNamePrefix = 'tag-';
    const DefaultSeriesTagSlugPrefix = 'series-';

    /** @type {BuildSeriesInfoOptions} */
    const DefaultBuildOptions = {};

    /** @type {DisplaySeriesInfoOptions} */
    const DefaultDisplayOptions = {
        insertions: [
            {
                selector: 'main .post',
                position: ElementInsertionPosition.END
            }
        ]
    };

    const cachedPosts = new Map();


    function findSeriesTagSlugs(document, seriesTagSlugPrefix = DefaultSeriesTagSlugPrefix) {
        const bodyClasses = document.body.className.split(' ');
        return bodyClasses
            .filter(c => c.startsWith(HtmlTagClassNamePrefix + seriesTagSlugPrefix))
            .map(c => c.replace(HtmlTagClassNamePrefix));
    }

    async function getPosts(seriesTagSlugs) {
        // The filter should conform to the pattern: 'tag:some-tag+tag:another-tag'
        const postFilter = seriesTagSlugs
                            .map(tag => 'tag:' + tag)
                            .join('+');

        if (cachedPosts.has(postFilter)) {
            return cachedPosts.get(postFilter);
        } else {
            try {
                const browseResults = await ghostContentApi.posts.browse({
                    filter: postFilter, 
                    fields: 'id,title,slug,tags',
                    order: 'published_at asc'
                });
                const posts = browseResults.posts;

                cachedPosts.set(postFilter, posts);
                return posts;
            } catch (err) {
                throw new Error('An error occurred while calling the posts.browse endpoint of the GhostContentAPI.');
            }
        }
    }

    function getTagsFromPosts(posts, seriesTagSlugs) {
        const allTags = posts.map(post => post.tags).flat();
        return seriesTagSlugs
            .map(seriesTagSlug => allTags.find(tag => tag.slug === seriesTagSlug))
            .filter(tag => tag !== undefined);
    }

    function groupPostsBySeriesTags(posts, seriesTags) {
        return groupBy(
            posts,
            post => seriesTags.filter(
                seriesTag => post.tags.some(
                    tag => tag.slug === seriesTag.slug
                )
            )
        );
    }

    function insertNodeRelativeToElement(node, element, insertionPosition) {
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

    function normailizeBuildOptions(options, defaultSeriesTagSlugFinder) {
        // Ensure seriesTagSlugs is an array or find them all from the document if not explicitly provided.
        options.seriesTagSlugs = [].concat(options.seriesTagSlugs) ?? defaultSeriesTagSlugFinder();
        return options;
    }

    function throwIfDisplayOptionsInvalid(/** @type DisplaySeriesInfoOptions */ options) {
        if (options.insertions == undefined || !Array.isArray(options.insertions)) {
            throw new TypeError('option.insertions is required and must be an array.');
        }
    }

    function throwIfDocumentInvalid(document) {
        if (document == undefined) {
            throw new TypeError('document must be provided.');
        }

        if (typeof Document === 'undefined') return;
        if (Document !== undefined && Document.prototype !== Object.getPrototypeOf(document)) {
            throw new TypeError('document must be an instance of Document.');
        }
    }


    /**
     * Builds series information document fragment for specific posts that share one or more tags.
     * @param {Document} document A document object for manipuling the DOM.
     * @param {BuildSeriesInfoOptions} options The options for building.
     * @returns {Promise<DocumentFragment>} A document fragment containing series information.
     */
    async function buildSeriesInfoFragment(document, options) {
        throwIfDocumentInvalid(document);

        // Ensure options are mixed with defaults.
        options = Object.assign({}, DefaultBuildOptions, options);
        const { currentPostId, seriesTagSlugs } = normailizeBuildOptions(options, () => findSeriesTagSlugs(document));

        const posts = await getPosts(seriesTagSlugs);
        const seriesTags = getTagsFromPosts(posts, seriesTagSlugs);
        const postsGroupedBySeriesTags = groupPostsBySeriesTags(posts, seriesTags);

        // Generate one list of links per series tag of the other posts in that series (with the same tag).
        const fragment = document.createDocumentFragment();
        const section = document.createElement('section');
        section.className = 'series-info';
        fragment.appendChild(section);

        for (const [ seriesTag, posts ] of postsGroupedBySeriesTags) {            
            const aside = document.createElement('aside');
            section.appendChild(aside);
            
            const heading = document.createElement('h1');
            heading.textContent = `Other Posts in ${seriesTag.name}`;
            aside.appendChild(heading);

            const list = document.createElement('ol');
            for (const post of posts) {
                const item = document.createElement('li');
                if (post.id === currentPostId) {
                    item.textContent = post.title;
                } else {
                    const link = document.createElement('a');
                    link.textContent = post.title;
                    link.href = post.url;
                    item.appendChild(link);
                }

                list.appendChild(item);
            }

            aside.appendChild(list);
        }
        
        return fragment;
    }
    
    /**
     * Displays series information in the DOM for specific posts that share one or more tags.
     * @param {Document} document A document object for manipuling the DOM.
     * @param {DisplaySeriesInfoOptions} options The options for displaying.
     */
    async function displaySeriesInfo(document, options) {
        throwIfDocumentInvalid(document);

        // Ensure options are mixed with defaults and valid.
        options = Object.assign({}, DefaultDisplayOptions, options);
        const { insertions } = normailizeBuildOptions(options, () => findSeriesTagSlugs(document));
        throwIfDisplayOptionsInvalid(options);

        const seriesInfoFragment = await buildSeriesInfoFragment(document, options);
        let fragments = [ seriesInfoFragment ];
        const delayedActions = [];
        
        // Insert the series info fragment into the appropriate location(s) of the document.
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


    return {
        buildSeriesInfoFragment,
        displaySeriesInfo    
    };
}
