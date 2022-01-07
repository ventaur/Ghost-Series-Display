import chai from 'chai';
import { parseHTML } from 'linkedom';

import {
    SeriesTagDecDaily, SeriesTagFluffy, 
    createSeriesDisplayWithFluffyPosts,
    createSeriesDisplayWithDecDailyAndFluffyPosts
} from './testScenarios.js';

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
            let currentPost, document;

            before(async function () {
                currentPost = fluffyPosts[1];
                const options = {
                    currentPostId: currentPost.id
                };
                const html = await seriesDisplayForFluffyPosts.getSeriesInfoHtml(SeriesTagFluffy, options);
                ({ document } = parseHTML(html));
            });

            it('contains an ordered list', function () {
                const list = document.querySelector('ol');
                should.exist(list);
            });

            it('contains 1 list item per post', function () {
                const listItems = document.querySelectorAll('ol > li');
                listItems.length.should.equal(fluffyPosts.length);
            });
            
            it('contains series post title per list item', function () {
                const listItems = document.querySelectorAll('ol > li');
                const listItemsText = [...listItems].map(item => item.textContent);
                const postTitles = fluffyPosts.map(post => post.title);
                listItemsText.should.deep.equal(postTitles);
            });

            it('contains an anchor for all except current post', function () {
                const anchors = document.querySelectorAll('ol > li > a');
                anchors.length.should.equal(fluffyPosts.length - 1);

                const listItems = document.querySelectorAll('ol > li');
                const listItemWithoutAnchor = [...listItems].find(item => item.querySelector('a') === null);
                listItemWithoutAnchor.textContent.should.equal(currentPost.title);
            });
        });
        
        it('caches repeat API calls for same series tags', function () {
            
        });
    });

    describe('#displaySeriesInfo', function () {
        
    });
});
