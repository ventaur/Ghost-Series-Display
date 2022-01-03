import cloneDeep from 'lodash.clonedeep';
import { loadJsonFile } from 'load-json-file';

import SeriesDisplay from '../lib/index.js';


export const SeriesTagDecDaily = 'series-december-daily-2021';
export const SeriesTagFluffy = 'series-fluffy-2021';

const TagsBySlug = await loadJsonFile('./test/test-tags.json');
const TestPosts = await loadJsonFile('./test/test-posts.json'); // 12 posts


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

function createApi(posts) {
    return { posts: { browse: async () => ({ posts }) } };
}


export function createSeriesDisplayWithFluffyPosts() {
    // 8 posts
    const fluffyPosts = TestPosts.slice(4);
    const posts = cloneDeep(fluffyPosts);
    addTagToPosts(SeriesTagFluffy, posts);
    
    const api = createApi(posts);
    return {
        seriesDisplay: new SeriesDisplay(api),
        posts
    };
}

export function createSeriesDisplayWithDecDailyAndFluffyPosts() {
    // 12 posts
    const posts = cloneDeep(TestPosts);
    addTagToPosts(SeriesTagDecDaily, posts, [0, 1, 2, 3, 10]);
    addTagToPosts(SeriesTagFluffy, posts, [4, 5, 6, 7, 8, 9, 10, 11]);
    
    const api = createApi(posts);
    return {
        seriesDisplay: new SeriesDisplay(api),
        posts
    };
}
