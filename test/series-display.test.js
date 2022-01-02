import Chance from 'chance';
const chance = new Chance();

import cloneDeep from 'lodash.clonedeep';
import { loadJsonFile } from 'load-json-file';
import should from 'chai';

import SeriesDisplay from '../lib/index.js';


const SeriesTagDecDaily = 'series-december-daily-2021';
const SeriesTagFluffy = 'series-fluffy-2021';
const TagsBySlug = await loadJsonFile('./test/test-tags.json');
const TestPosts = await loadJsonFile('./test/test-posts.json');


describe('Series Display', function () {
    let seriesDisplayWithDecDailyAndFluffy;


    function addTagToPosts(tagSlug, posts, postIndeces) {
        const tag = TagsBySlug[tagSlug];
        for (const postIndex of postIndeces) {
            posts[postIndex].tags.push(tag);
        }
    }

    function createApi(posts) {
        return { posts: { browse: async () => ({ posts }) } };
    }

    function createSeriesDisplayWithDecDailyAndFluffy() {
        const posts = cloneDeep(TestPosts);
        addTagToPosts(SeriesTagDecDaily, posts, [0, 1, 2, 3, 10]);
        addTagToPosts(SeriesTagFluffy, posts, [4, 5, 6, 7, 8, 9, 10, 11]);
        
        const api = createApi(posts);
        return new SeriesDisplay(api);
    }    

    before(function () {
        seriesDisplayWithDecDailyAndFluffy = createSeriesDisplayWithDecDailyAndFluffy();
    });


    it('stub', async function () {
        const html = await seriesDisplayWithDecDailyAndFluffy.getSeriesInfoHtml([ SeriesTagDecDaily, SeriesTagFluffy ]);
        console.log(TestPosts[10]);
        console.log(html[10]);
    });
});
