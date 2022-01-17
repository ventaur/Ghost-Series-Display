import groupBy from './groupBy.js';


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
 * Represents the SDK for the Ghost Content API.
 * @typedef {Object} GhostContentAPI
 * @property {Object} posts Post endpoints.
 * @property {Function} browse The browse posts endpoint for Ghost.
 */

/**
 * @typedef {Object} SeriesDisplay
 * @property {Function} displaySeriesInfo
 * @property {Function} buildSeriesInfoHtml
 */

/**
 * @typedef {Object} BuildSeriesInfoOptions
 * @property {string} currentPostId The ID of the current post (if any). This is a GUID-like value in Ghost. 
 */

/**
 * @typedef {Object} DisplaySeriesInfoOptions
 * @extends BuildSeriesInfoOptions
 */


/**
 * @param {GhostContentAPI} ghostContentApi An instance of the Ghost Content API.
 * @returns {SeriesDisplay}
 */
export default function SeriesDisplay(ghostContentApi) {
    const cachedPosts = new Map();


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


    /**
     * Displays series information in the DOM for specific posts that share one or more tags.
     * @param {(string|string[])} seriesTagSlugs One or more tag slugs for the serie(s) to display info for.
     * @param {DisplaySeriesInfoOptions} options The options for displaying.
     */
    async function displaySeriesInfo(seriesTagSlugs, options) {
        const html = await buildSeriesInfoHtml(seriesTagSlugs, options);

        // TODO: Insert the series info HTML into the appropriate location(s) of the document.
        return html;
    }

    /**
     * Builds series information HTML for specific posts that share one or more tags.
     * @param {(string|string[])} seriesTagSlugs One or more tag slugs for the serie(s) to display info for.
     * @param {BuildSeriesInfoOptions} options The options for displaying.
     * @returns {string} Raw HTML string.
     */
    async function buildSeriesInfoHtml(seriesTagSlugs, options) {
        // Ensure seriesTagSlugs is an array.
        seriesTagSlugs = [].concat(seriesTagSlugs);
        
        // Ensure options are mixed with defaults.
        const defaultOptions = {};
        const { currentPostId } = Object.assign({}, defaultOptions, options);
        
        const posts = await getPosts(seriesTagSlugs);
        const seriesTags = getTagsFromPosts(posts, seriesTagSlugs);
        const postsGroupedBySeriesTags = groupBy(
            posts, 
            post => seriesTags.filter(
                seriesTag => post.tags.some(
                    tag => tag.slug === seriesTag.slug
                )
            )
        );

        // Generate one list of links per series tag of the other posts in that series (with the same tag).
        let html = '';
        for (const [ seriesTag, posts ] of postsGroupedBySeriesTags) {
            const listTitle = `Other Posts in ${seriesTag.name}`;
            const listItemsHtml = posts.map(post => {
                return post.id == currentPostId
                    ? `<li>${post.title}</li>`
                    : `<li><a href="${post.url}">${post.title}</a></li>`;
            });
            html += `<aside><h1>${listTitle}</h1><ol>${listItemsHtml}</ol></aside>`;
        }
        
        return html;
    }
    

    return {
        displaySeriesInfo,
        buildSeriesInfoHtml
    };
}
