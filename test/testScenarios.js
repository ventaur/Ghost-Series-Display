import cloneDeep from 'lodash.clonedeep';
import { loadJsonFile } from 'load-json-file';
import { loadTextFile } from 'load-text-file';

import { SeriesDisplay } from '../lib/index.js';


export const SeriesTagSlugDecDaily = 'series-december-daily-2021';
export const SeriesTagSlugFluffy = 'series-fluffy-2021';

/** @type Object */
export const TagsBySlug = await loadJsonFile('./test/test-tags.json');
/** @type Array<Object> */
const TestPosts = await loadJsonFile('./test/test-posts.json'); // 12 posts

/** @type string */
export const BasicPostHtml = await loadTextFile('./test/post-basic.html');
/** @type string */
export const NonSeriesPostHtml = await loadTextFile('./test/post-non-series.html');


/**
 * Adds a tag to posts spcecified in-place (mutates posts).
 * @param {string} tagSlug The slug for a tag to add to the posts.
 * @param {Array<Object>} posts An array of post objects.
 * @param {Array<number>} postIndeces An array of indeces for the posts to add the tag to.
 */
function addTagToPosts(tagSlug, posts, postIndeces) {
    const tag = TagsBySlug[tagSlug];

    // Tag all posts.
    if (postIndeces === undefined) {
        posts.forEach(post => {
            post.tags.push(tag);
        });
        return;
    }

    // Tag just the posts with indeces specified.
    for (const postIndex of postIndeces) {
        posts[postIndex].tags.push(tag);
    }
}

function addMetadataToPosts(posts) {
    let pagination = {
        page: 1,
        limit: 15,
        pages: undefined,
        total: posts.length,
        next: null
    };
    pagination.pages = Math.ceil(posts.length / pagination.limit);

    posts.meta = {
        pagination
    };
}

/**
 * 
 * @param {Array<Object>} posts An array of post objects to be returned by this fake API's posts.browse "endpoint".
 * @returns {import('../lib/index.js').GhostContentAPI} A fake Ghost Content API.
 */
function createApi(posts) {
    return { posts: { browse: async () => posts } };
}

/**
 * Maps specific post properties onto a list of posts.
 * @param {Array<Object>} posts An array of posts to map properties to.
 * @returns {Array<Object>} Returns a new array of post objects, with just the properties expected.
 */
function mapPostProperties(posts) {
    return posts.map(post => ({ id: post.id, title: post.title, slug: post.slug, url: post.url, tags: post.tags }));
}


/**
 * @typedef {Object} SeriesDisplayWithPosts
 * @property {SeriesDisplay} seriesDisplay An instance of SeriesDisplay with fake API.
 * @property {Array<Object>} posts An array of post objects for the test scenario.
 */


/**
 * Creates a test scenario for SeriesDisplay with posts for a single series tag, "Fluffy 2021".
 * @returns {SeriesDisplayWithPosts}
 */
export function createSeriesDisplayWithFluffyPosts() {
    // 8 posts
    const fluffyPosts = TestPosts.slice(4);
    const posts = mapPostProperties(cloneDeep(fluffyPosts));
    addTagToPosts(SeriesTagSlugFluffy, posts);
    addMetadataToPosts(posts);
    
    const api = createApi(posts);
    return {
        seriesDisplay: new SeriesDisplay(api),
        posts
    };
}

/**
 * Creates a test scenario for SeriesDisplay with posts for 2 series tags, "December Daily 2021" and "Fluffy 2021".
 * @returns {SeriesDisplayWithPosts}
 */
 export function createSeriesDisplayWithDecDailyAndFluffyPosts() {
    // 12 posts, 1 in both series
    const posts = mapPostProperties(cloneDeep(TestPosts));
    addTagToPosts(SeriesTagSlugDecDaily, posts, [0, 1, 2, 3, 10]);
    addTagToPosts(SeriesTagSlugFluffy, posts, [4, 5, 6, 7, 8, 9, 10, 11]);
    addMetadataToPosts(posts);
    
    const api = createApi(posts);
    return {
        seriesDisplay: new SeriesDisplay(api),
        posts
    };
}
