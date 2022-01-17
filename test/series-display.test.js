import chai from 'chai';
import { parseHTML } from 'linkedom';
import sinon from 'sinon';

import {
    SeriesTagDecDaily, SeriesTagFluffy, 
    createSeriesDisplayWithFluffyPosts,
    createSeriesDisplayWithDecDailyAndFluffyPosts
} from './testScenarios.js';

import SeriesDisplay from '../lib/index.js';

const should = chai.should();


describe('SeriesDisplay', function () {
    /** @type {Array<Object>} */
    let fluffyPosts;
    /** @type {Array<Object>} */
    let decDailyAndFluffyPosts;
    
    /** @type {SeriesDisplay} */
    let seriesDisplayForFluffyPosts;
    /** @type {SeriesDisplay} */
    let seriesDisplayForDecDailyAndFluffyPosts;

    before(function () {
        ({ seriesDisplay: seriesDisplayForFluffyPosts, posts: fluffyPosts } = createSeriesDisplayWithFluffyPosts());
        ({ seriesDisplay: seriesDisplayForDecDailyAndFluffyPosts, posts: decDailyAndFluffyPosts } = createSeriesDisplayWithDecDailyAndFluffyPosts());
    });


    describe('#getSeriesInfoHtml', function () {
        describe('for single series tag', function () {
            /** @type {Array<Object>} */
            let seriesPosts;
            let currentPost;
            
            /** @type {Document} */
            let document;

            before(async function () {
                seriesPosts = fluffyPosts;
                currentPost = seriesPosts[1];
                /** @type import('../lib/index.js').BuildSeriesInfoOptions */
                const options = {
                    currentPostId: currentPost.id
                };
                const html = await seriesDisplayForFluffyPosts.getSeriesInfoHtml(SeriesTagFluffy, options);
                ({ document } = parseHTML(html));
            });

            it('contains an ordered list', function () {
                const list = document.querySelectorAll('ol');
                should.exist(list);
                list.length.should.equal(1);
            });

            it('contains 1 list item per post', function () {
                const listItems = document.querySelectorAll('ol > li');
                listItems.length.should.equal(seriesPosts.length);
            });
            
            it('contains series post title per list item', function () {
                const listItems = document.querySelectorAll('ol > li');
                const listItemsText = [...listItems].map(item => item.textContent);
                const postTitles = seriesPosts.map(post => post.title);
                listItemsText.should.deep.equal(postTitles);
            });

            it('contains an anchor for all except current post', function () {
                const anchors = document.querySelectorAll('ol > li > a');
                anchors.length.should.equal(seriesPosts.length - 1);

                const listItems = document.querySelectorAll('ol > li');
                const listItemWithoutAnchor = [...listItems].find(item => item.querySelector('a') === null);
                listItemWithoutAnchor.textContent.should.equal(currentPost.title);
            });

            it('contains an anchor for all posts if no current id specified', async function () {
                const html = await seriesDisplayForFluffyPosts.getSeriesInfoHtml(SeriesTagFluffy);
                ({ document } = parseHTML(html));

                const anchors = document.querySelectorAll('ol > li > a');
                anchors.length.should.equal(seriesPosts.length);
            });
        });
        
        describe('for double series tag', function () {
            /** @type {Array<Object>} */
            let seriesPosts;
            let currentPost;
            let postInBothSeries;

            /** @type {Array<Object>} */
            let fluffyPosts;
            /** @type {Array<Object>} */
            let decDailyPosts;

            /** @type {Document} */
            let document;

            before(async function () {
                seriesPosts = decDailyAndFluffyPosts;
                currentPost = seriesPosts[1];
                postInBothSeries = filterPostsWithAllTags(seriesPosts, SeriesTagFluffy, SeriesTagDecDaily)[0];

                fluffyPosts = filterPostsWithTag(seriesPosts, SeriesTagFluffy);
                decDailyPosts = filterPostsWithTag(seriesPosts, SeriesTagDecDaily);

                /** @type import('../lib/index.js').BuildSeriesInfoOptions */
                const options = {
                    currentPostId: currentPost.id
                };
                const html = await seriesDisplayForDecDailyAndFluffyPosts.getSeriesInfoHtml([SeriesTagDecDaily, SeriesTagFluffy], options);
                ({ document } = parseHTML(html));
            });

            it('contains 2 ordered lists', function () {
                const list = document.querySelectorAll('ol');
                should.exist(list);
                list.length.should.equal(2);
            });

            it('contains 1 list item per post per series', function () {
                const listItems = document.querySelectorAll('ol > li');
                listItems.length.should.equal(fluffyPosts.length + decDailyPosts.length);
            });
            
            it('contains series post title per list item', function () {
                const listItems = document.querySelectorAll('ol > li');
                const listItemsText = [...listItems].map(item => item.textContent);
                const postTitles = [].concat(
                    decDailyPosts.map(post => post.title),
                    fluffyPosts.map(post => post.title)
                );
                listItemsText.should.deep.equal(postTitles);
            });

            it('contains same list item twice for post in both series', function () {
                const listItems = document.querySelectorAll('ol > li');
                const listItemsText = [...listItems].map(item => item.textContent);
                const textsForPostInBothSeries = listItemsText.filter(text => text === postInBothSeries.title);
                textsForPostInBothSeries.length.should.equal(2);
            });

            it('contains an anchor for all except current post', function () {
                const anchors = document.querySelectorAll('ol > li > a');
                anchors.length.should.equal(fluffyPosts.length + decDailyPosts.length - 1);

                const listItems = document.querySelectorAll('ol > li');
                const listItemWithoutAnchor = [...listItems].find(item => item.querySelector('a') === null);
                listItemWithoutAnchor.textContent.should.equal(currentPost.title);
            });

            it('contains an anchor for all except 2 when current post in both series', async function () {
                /** @type import('../lib/index.js').BuildSeriesInfoOptions */
                const options = {
                    currentPostId: postInBothSeries.id
                };
                const html = await seriesDisplayForDecDailyAndFluffyPosts.getSeriesInfoHtml([SeriesTagDecDaily, SeriesTagFluffy], options);
                ({ document } = parseHTML(html));

                const anchors = document.querySelectorAll('ol > li > a');
                anchors.length.should.equal(fluffyPosts.length + decDailyPosts.length - 2);

                const listItems = document.querySelectorAll('ol > li');
                const listItemsWithoutAnchor = [...listItems].filter(item => item.querySelector('a') === null);
                listItemsWithoutAnchor.every(listItem => listItem.textContent.should.equal(postInBothSeries.title));
            });

            it('contains an anchor for all posts if no current id specified', async function () {
                const html = await seriesDisplayForDecDailyAndFluffyPosts.getSeriesInfoHtml([SeriesTagDecDaily, SeriesTagFluffy]);
                ({ document } = parseHTML(html));

                const anchors = document.querySelectorAll('ol > li > a');
                anchors.length.should.equal(fluffyPosts.length + decDailyPosts.length);
            });
        });

        it('caches repeat API calls for same series tags', async function () {
            const api = { posts: { browse: sinon.fake.returns({ posts: fluffyPosts}) }};
            const seriesDisplay = new SeriesDisplay(api);

            await seriesDisplay.getSeriesInfoHtml(SeriesTagFluffy);
            await seriesDisplay.getSeriesInfoHtml(SeriesTagFluffy);
            api.posts.browse.callCount.should.equal(1);

            await seriesDisplay.getSeriesInfoHtml(SeriesTagDecDaily);
            api.posts.browse.callCount.should.equal(2);
        });
    });

    describe('#displaySeriesInfo', function () {
        
    });
});


/**
 * Filters to the posts with all the specified tags (slugs).
 * @param {Array<Object>} posts An array of posts to filter.
 * @param  {...string} tagSlugs The slugs for tags to filter posts with. 
 * @returns {Array<object>} The filtered array of posts.
 */
function filterPostsWithAllTags(posts, ...tagSlugs) {
    return posts.filter(
        post => tagSlugs.every(
            tagSlug => post.tags.some(
                tag => tag.slug === tagSlug
            )
        )
    );
}

/**
 * Filters to the posts with a specified tag (slug).
 * @param {Array<Object>} posts An array of posts to filter.
 * @param {string} tagSlug The slug for a tag to filter posts with.
 * @returns {Array<object>} The filtered array of posts.
 */
function filterPostsWithTag(posts, tagSlug) {
    return posts.filter(
        post => post.tags.some(
            tag => tag.slug === tagSlug
        )
    );
}