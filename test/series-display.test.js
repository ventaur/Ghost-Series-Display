import Chance from 'chance';
const chance = new Chance();

import should from 'chai';

import SeriesDisplay from '../lib/index.js'; 
import createRandomPost from './createRandomPost.js';


describe('Series Display', function () {
    const seriesTags = [ '', '' ];
    let api;


    before(function () {
        chance.mixin({
            post: createRandomPost
        });

        api = {
            posts: {
                browse: async () => {
                    return {
                        posts: chance.n(chance.post, 12, { ensureSomeTags: seriesTags })
                    };
                }
            }
        }
    });


    it('stub', async function () {
        const seriesDisplay = new SeriesDisplay(api);
        await seriesDisplay.displaySeriesInfo(seriesTags);
        return true;
    });
});
