import should from 'chai';

import { SeriesTagDecDaily, SeriesTagFluffy, createSeriesDisplayWithDecDailyAndFluffy } from './testScenarios.js';


describe('Series Display', function () {
    let seriesDisplayWithDecDailyAndFluffy;

    before(function () {
        seriesDisplayWithDecDailyAndFluffy = createSeriesDisplayWithDecDailyAndFluffy();
    });


    it('stub', async function () {
        const html = await seriesDisplayWithDecDailyAndFluffy.getSeriesInfoHtml([ SeriesTagDecDaily, SeriesTagFluffy ]);
        return true;
    });
});
