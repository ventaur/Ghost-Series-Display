import chai from 'chai';
chai.should();
import { parseHTML } from 'linkedom';

import {
    SeriesTagDecDaily, SeriesTagFluffy, 
    createSeriesDisplayWithFluffyPosts,
    createSeriesDisplayWithDecDailyAndFluffyPosts
} from './testScenarios.js';


describe('Series Display', function () {
    let fluffyPosts, decDailyAndFluffyPosts;
    let seriesDisplayForFluffyPosts, seriesDisplayForDecDailyAndFluffyPosts;

    before(function () {
        ({ seriesDisplay: seriesDisplayForFluffyPosts, posts: fluffyPosts } = createSeriesDisplayWithFluffyPosts());
        ({ seriesDisplay: seriesDisplayForDecDailyAndFluffyPosts, posts: decDailyAndFluffyPosts } = createSeriesDisplayWithDecDailyAndFluffyPosts());
    });


    describe('getSeriesInfoHtml', function () {
        it('contains an ordered list with 1 item per post for single series tag', async function () {
            const html = await seriesDisplayForFluffyPosts.getSeriesInfoHtml(SeriesTagFluffy);
            const { document } = parseHTML(html);

            const list = document.querySelector('ol');
            list.childElementCount.should.equal(fluffyPosts.length);
        });
        
        it('caches repeat API calls for same series tags', function () {
            
        });
    });

    describe('displaySeriesInfo', function () {
        
    });
});
