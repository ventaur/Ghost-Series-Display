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
    let fluffyPosts, decDailyAndFluffyPosts;
    let seriesDisplayForFluffyPosts, seriesDisplayForDecDailyAndFluffyPosts;

    before(function () {
        ({ seriesDisplay: seriesDisplayForFluffyPosts, posts: fluffyPosts } = createSeriesDisplayWithFluffyPosts());
        ({ seriesDisplay: seriesDisplayForDecDailyAndFluffyPosts, posts: decDailyAndFluffyPosts } = createSeriesDisplayWithDecDailyAndFluffyPosts());
    });


    describe('#getSeriesInfoHtml', function () {
        describe('for single series tag', function () {
            let seriesPosts, currentPost, document;

            before(async function () {
                seriesPosts = fluffyPosts;
                currentPost = seriesPosts[1];
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
            let seriesPosts, currentPost, document;

            before(async function () {
                seriesPosts = decDailyAndFluffyPosts;
                currentPost = seriesPosts[1];
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
