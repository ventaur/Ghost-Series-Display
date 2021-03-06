import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { parseHTML } from 'linkedom';
import sinon from 'sinon';

import { SeriesDisplay, ElementInsertionPosition } from '../lib/index.js';

import {
    SeriesTagSlugDecDaily, SeriesTagSlugFluffy, 
    TagsBySlug, BasicPostHtml, NonSeriesPostHtml, 
    createSeriesDisplayWithFluffyPosts,
    createSeriesDisplayWithDecDailyAndFluffyPosts
} from './testScenarios.js';

chai.use(chaiAsPromised);
const should = chai.should();

const SeriesInfoClass = 'series-info';


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


    describe('#buildSeriesInfoFragment', function () {
        describe('for single series tag', function () {
            /** @type {Array<Object>} */
            let seriesPosts;
            let currentPost;
            
            /** @type {DocumentFragment} */
            let fragment;

            before(async function () {
                seriesPosts = fluffyPosts;
                currentPost = seriesPosts[1];

                /** @type {Document} */
                const { document } = parseHTML('');
                /** @type import('../lib/index.js').BuildSeriesInfoOptions */
                const options = {
                    currentPostUrl: currentPost.url,
                    seriesTagSlugs: SeriesTagSlugFluffy
                };
                fragment = await seriesDisplayForFluffyPosts.buildSeriesInfoFragment(document, options);
            });

            it('contains a heading in an aside', function () {
                assertHeadingInAside(fragment, 1);
            });

            it('contains a title in the heading', function () {
                assertTitleInHeading(fragment, [ `Other Posts in ${TagsBySlug[SeriesTagSlugFluffy].name}` ]);
            });

            it('contains an ordered list in an aside', function () {
                assertOrderedListInAside(fragment, 1);
            });

            it('contains 1 list item per post', function () {
                assertListItemsInOrderedList(fragment, seriesPosts.length);
            });
            
            it('contains series post title per list item', function () {
                const postTitles = seriesPosts.map(post => post.title);
                assertTextForListItems(fragment, postTitles);
            });

            it('contains an anchor for all except current post', function () {
                assertAnchorsInListItemsExcept(fragment, seriesPosts.length - 1, currentPost.title);
            });

            it('contains an anchor for all posts if no current id specified', async function () {
                /** @type {Document} */
                const { document } = parseHTML('');
                /** @type import('../lib/index.js').BuildSeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy
                }
                const fragment = await seriesDisplayForFluffyPosts.buildSeriesInfoFragment(document, options);
                
                assertAnchorsInListItems(fragment, seriesPosts.length);
            });

            it('contains anchors with hrefs to post urls', function () {
                const postUrls = seriesPosts
                    .filter(post => post !== currentPost)
                    .map(post => post.url);
                assertUrlsForAnchorHrefs(fragment, postUrls);
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

            /** @type {DocumentFragment} */
            let fragment;

            before(async function () {
                seriesPosts = decDailyAndFluffyPosts;
                currentPost = seriesPosts[1];
                postInBothSeries = filterPostsWithAllTags(seriesPosts, SeriesTagSlugFluffy, SeriesTagSlugDecDaily)[0];

                fluffyPosts = filterPostsWithTag(seriesPosts, SeriesTagSlugFluffy);
                decDailyPosts = filterPostsWithTag(seriesPosts, SeriesTagSlugDecDaily);

                /** @type {Document} */
                const { document } = parseHTML('');
                /** @type import('../lib/index.js').BuildSeriesInfoOptions */
                const options = {
                    currentPostUrl: currentPost.url,
                    seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
                };
                fragment = await seriesDisplayForDecDailyAndFluffyPosts.buildSeriesInfoFragment(document, options);
            });

            it('contains 2 headings, each in an aside', function () {
                assertHeadingInAside(fragment, 2);
            });

            it('contains a title in each heading', function () {
                assertTitleInHeading(fragment, [
                    `Other Posts in ${TagsBySlug[SeriesTagSlugDecDaily].name}`, 
                    `Other Posts in ${TagsBySlug[SeriesTagSlugFluffy].name}`
                ]);
            });

            it('contains 2 ordered lists in an aside', function () {
                assertOrderedListInAside(fragment, 2);
            });

            it('contains 1 list item per post per series', function () {
                assertListItemsInOrderedList(fragment, fluffyPosts.length + decDailyPosts.length);
            });
            
            it('contains series post title per list item', function () {
                const postTitles = [].concat(
                    decDailyPosts.map(post => post.title),
                    fluffyPosts.map(post => post.title)
                );
                assertTextForListItems(fragment, postTitles);
            });

            it('contains same list item twice for post in both series', function () {
                assertSameListItemTextTwice(fragment, postInBothSeries.title);
            });

            it('contains an anchor for all except current post', function () {
                assertAnchorsInListItemsExcept(fragment, fluffyPosts.length + decDailyPosts.length - 1, currentPost.title);
            });

            it('contains an anchor for all except 2 when current post in both series', async function () {
                /** @type {Document} */
                const { document } = parseHTML('');
                /** @type import('../lib/index.js').BuildSeriesInfoOptions */
                const options = {
                    currentPostUrl: postInBothSeries.url,
                    seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
                };
                const fragment = await seriesDisplayForDecDailyAndFluffyPosts.buildSeriesInfoFragment(document, options);
                
                assertAnchorsInListItemsExcept(fragment, fluffyPosts.length + decDailyPosts.length - 2, postInBothSeries.title);
            });

            it('contains an anchor for all posts if no current id specified', async function () {
                /** @type {Document} */
                const { document } = parseHTML('');
                /** @type import('../lib/index.js').BuildSeriesInfoOptions */
                const options = {
                    seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
                };
                const fragment = await seriesDisplayForDecDailyAndFluffyPosts.buildSeriesInfoFragment(document, options);
                
                assertAnchorsInListItems(fragment, fluffyPosts.length + decDailyPosts.length);
            });

            it('contains anchors with hrefs to post urls', function () {
                const postUrls = decDailyPosts.concat(fluffyPosts)
                    .filter(post => post !== currentPost)
                    .map(post => post.url);
                assertUrlsForAnchorHrefs(fragment, postUrls)
            });
        });

        it('queries API with OR operator for multiple series tags', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML('');
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
            };

            await seriesDisplay.buildSeriesInfoFragment(document, options);
            api.posts.browse.firstArg.filter.should.equal(`tag:${SeriesTagSlugDecDaily},tag:${SeriesTagSlugFluffy}`)
        });

        it('caches repeat API calls for same series tags', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML('');
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const singleTagOptions = {
                seriesTagSlugs: SeriesTagSlugFluffy
            };
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const bothTagsOptions = {
                seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
            };

            await seriesDisplay.buildSeriesInfoFragment(document, singleTagOptions);
            await seriesDisplay.buildSeriesInfoFragment(document, singleTagOptions);
            api.posts.browse.callCount.should.equal(1);

            await seriesDisplay.buildSeriesInfoFragment(document, bothTagsOptions);
            api.posts.browse.callCount.should.equal(2);
        });

        it('throws if document is undefined', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            }

            await seriesDisplay.buildSeriesInfoFragment(undefined, options).should.be.rejectedWith(TypeError, /document must be provided/);
        });

        it('uses document location URL if none for post is specified', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            const seriesPosts = fluffyPosts;
            const currentPost = seriesPosts[1];

            /** @type {Document} */
            const { document } = parseHTML('');
            document.location = {
                origin: 'https://not-a-real-site.io',
                pathname: `/${currentPost.slug}/`
            };
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            }

            const fragment = await seriesDisplay.buildSeriesInfoFragment(document, options);
            assertAnchorsInListItemsExcept(fragment, seriesPosts.length - 1, currentPost.title);
        });

        it('finds series tag slugs from body if undefined', async function () {
            const browse = sinon.fake.returns(fluffyPosts);
            const api = { posts: { browse: browse }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);

            await seriesDisplay.buildSeriesInfoFragment(document);
            browse.firstArg.filter.should.contains('tag:series-buying-new-house');
            browse.firstArg.filter.should.contains('tag:series-surveying-land');
        });

        it('does not call API endpoint if not in a series', async function () {
            const browse = sinon.fake.returns(fluffyPosts);
            const api = { posts: { browse: browse }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(NonSeriesPostHtml);

            await seriesDisplay.buildSeriesInfoFragment(document);
            browse.called.should.be.false;
        });

        it('returns null if not in a series', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(NonSeriesPostHtml);

            const fragment = await seriesDisplay.buildSeriesInfoFragment(document);
            should.equal(fragment, null);
        });
        
        it('contains empty section if only one in a series with option to hide', async function () {
            const seriesPosts = [ fluffyPosts[0] ];
            const currentPost = seriesPosts[0];
            
            const api = { posts: { browse: sinon.fake.returns(seriesPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                currentPostUrl: currentPost.url,
                seriesTagSlugs: SeriesTagSlugFluffy,
                hideSinglePostSeries: true 
            }

            const fragment = await seriesDisplay.buildSeriesInfoFragment(document, options);
            assertAsideInSection(fragment, 0);
        });

        it('contains coming soon text if only one in a series without hiding', async function () {
            const seriesPosts = [ fluffyPosts[0] ];
            const currentPost = seriesPosts[0];
            
            const api = { posts: { browse: sinon.fake.returns(seriesPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                currentPostUrl: currentPost.url,
                seriesTagSlugs: SeriesTagSlugFluffy,
                hideSinglePostSeries: false
            }

            let fragment = await seriesDisplay.buildSeriesInfoFragment(document, options);
            assertTextForListItems(fragment, [ currentPost.title, 'Coming soon???' ]);
            
            options.comingSoonText = 'More to come!';
            fragment = await seriesDisplay.buildSeriesInfoFragment(document, options);
            assertTextForListItems(fragment, [ currentPost.title, options.comingSoonText ]);

        });

        it('contains custom heading text template', async function () {
            const api = { posts: { browse: sinon.fake.returns(decDailyAndFluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML('');
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ],
                headingTextTemplate: 'Other {{seriesTagName}} Posts'
            }

            const fragment = await seriesDisplay.buildSeriesInfoFragment(document, options);
            assertTitleInHeading(fragment, [
                `Other ${TagsBySlug[SeriesTagSlugDecDaily].name} Posts`,
                `Other ${TagsBySlug[SeriesTagSlugFluffy].name} Posts`
            ]);
        });
    });

    describe('#displaySeriesInfo', function () {
        describe('for single series tag', function () {
            /** @type {Array<Object>} */
            let seriesPosts;
            let currentPost;
            
            /** @type {Document} */
            let document;

            before(async function () {
                seriesPosts = fluffyPosts;
                currentPost = seriesPosts[1];

                ({ document } = parseHTML(BasicPostHtml));
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    currentPostUrl: currentPost.url,
                    seriesTagSlugs: SeriesTagSlugFluffy
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);
            });

            it('inserts a heading in an aside', function () {
                assertHeadingInAside(document, 1);
            });

            it('inserts a title in the heading', function () {
                assertTitleInHeading(document, [ `Other Posts in ${TagsBySlug[SeriesTagSlugFluffy].name}` ]);
            });

            it('inserts an ordered list in an aside', function () {
                assertOrderedListInAside(document, 1);
            });

            it('inserts 1 list item per post', function () {
                assertListItemsInOrderedList(document, seriesPosts.length);
            });
            
            it('inserts series post title per list item', function () {
                const postTitles = seriesPosts.map(post => post.title);
                assertTextForListItems(document, postTitles);
            });

            it('inserts an anchor for all except current post', function () {
                assertAnchorsInListItemsExcept(document, seriesPosts.length - 1, currentPost.title);
            });

            it('inserts an anchor for all posts if no current id specified', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy
                }
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);
                
                assertAnchorsInListItems(document, seriesPosts.length);
            });

            it('inserts anchors with hrefs to post urls', function () {
                const postUrls = seriesPosts
                    .filter(post => post !== currentPost)
                    .map(post => post.url);
                assertUrlsForAnchorHrefs(document, postUrls);
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
                postInBothSeries = filterPostsWithAllTags(seriesPosts, SeriesTagSlugFluffy, SeriesTagSlugDecDaily)[0];

                fluffyPosts = filterPostsWithTag(seriesPosts, SeriesTagSlugFluffy);
                decDailyPosts = filterPostsWithTag(seriesPosts, SeriesTagSlugDecDaily);

                ({ document } = parseHTML(BasicPostHtml));
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    currentPostUrl: currentPost.url,
                    seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
                };
                await seriesDisplayForDecDailyAndFluffyPosts.displaySeriesInfo(document, options);
            });

            it('inserts 2 headings, each in an aside', function () {
                assertHeadingInAside(document, 2);
            });

            it('inserts a title in each heading', function () {
                assertTitleInHeading(document, [
                    `Other Posts in ${TagsBySlug[SeriesTagSlugDecDaily].name}`, 
                    `Other Posts in ${TagsBySlug[SeriesTagSlugFluffy].name}`
                ]);
            });

            it('inserts 2 ordered lists in an aside', function () {
                assertOrderedListInAside(document, 2);
            });

            it('inserts 1 list item per post per series', function () {
                assertListItemsInOrderedList(document, fluffyPosts.length + decDailyPosts.length);
            });
            
            it('inserts series post title per list item', function () {
                const postTitles = [].concat(
                    decDailyPosts.map(post => post.title),
                    fluffyPosts.map(post => post.title)
                );
                assertTextForListItems(document, postTitles);
            });

            it('inserts same list item twice for post in both series', function () {
                assertSameListItemTextTwice(document, postInBothSeries.title);
            });

            it('inserts an anchor for all except current post', function () {
                assertAnchorsInListItemsExcept(document, fluffyPosts.length + decDailyPosts.length - 1, currentPost.title);
            });

            it('inserts an anchor for all except 2 when current post in both series', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    currentPostUrl: postInBothSeries.url,
                    seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
                };
                await seriesDisplayForDecDailyAndFluffyPosts.displaySeriesInfo(document, options);
                
                assertAnchorsInListItemsExcept(document, fluffyPosts.length + decDailyPosts.length - 2, postInBothSeries.title);
            });

            it('inserts an anchor for all posts if no current id specified', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
                };
                await seriesDisplayForDecDailyAndFluffyPosts.displaySeriesInfo(document, options);
                
                assertAnchorsInListItems(document, fluffyPosts.length + decDailyPosts.length);
            });

            it('inserts anchors with hrefs to post urls', function () {
                const postUrls = decDailyPosts.concat(fluffyPosts)
                    .filter(post => post !== currentPost)
                    .map(post => post.url);
                assertUrlsForAnchorHrefs(document, postUrls)
            });
        });

        describe('inserts relative to selector', function () {
            it('as first child', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy,
                    insertions: [
                        {
                            selector: '.meta',
                            position: ElementInsertionPosition.BEGIN
                        }
                    ]
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

                assertSeriesInfoIsFirstChild(document, '.meta', 1);
            });

            it('as first child, multiple matches', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy,
                    insertions: [
                        {
                            selector: '.navigator',
                            position: ElementInsertionPosition.BEGIN
                        }
                    ]
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

                assertSeriesInfoIsFirstChild(document, '.navigator', 2);
            });

            it('as last child', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy,
                    insertions: [
                        {
                            selector: '.meta',
                            position: ElementInsertionPosition.END
                        }
                    ]
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

                assertSeriesInfoIsLastChild(document, '.meta', 1);
            });

            it('as last child, multiple matches', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy,
                    insertions: [
                        {
                            selector: '.navigator',
                            position: ElementInsertionPosition.END
                        }
                    ]
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

                assertSeriesInfoIsLastChild(document, '.navigator', 2);
            });

            it('as previous sibling', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy,
                    insertions: [
                        {
                            selector: '.meta',
                            position: ElementInsertionPosition.BEFORE
                        }
                    ]
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

                assertSeriesInfoIsSiblingBefore(document, '.meta', 1);
            });

            it('as previous sibling, multiple matches', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy,
                    insertions: [
                        {
                            selector: '.navigator',
                            position: ElementInsertionPosition.BEFORE
                        }
                    ]
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

                assertSeriesInfoIsSiblingBefore(document, '.navigator', 2);
            });

            it('as next sibling', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy,
                    insertions: [
                        {
                            selector: '.meta',
                            position: ElementInsertionPosition.AFTER
                        }
                    ]
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

                assertSeriesInfoIsSiblingAfter(document, '.meta', 1);
            });
            
            it('as next sibling, multiple matches', async function () {
                /** @type {Document} */
                const { document } = parseHTML(BasicPostHtml);
                /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
                const options = {
                    seriesTagSlugs: SeriesTagSlugFluffy,
                    insertions: [
                        {
                            selector: '.navigator',
                            position: ElementInsertionPosition.AFTER
                        }
                    ]
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

                assertSeriesInfoIsSiblingAfter(document, '.navigator', 2);
            });
        });

        it('inserts relative to multiple selectors and matches', async function () {
            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy,
                insertions: [
                    {
                        selector: '.meta',
                        position: ElementInsertionPosition.BEGIN
                    },
                    {
                        selector: '.navigator',
                        position: ElementInsertionPosition.AFTER
                    }
                ]
            };
            await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

            assertSeriesInfoIsFirstChild(document, '.meta', 1);
            assertSeriesInfoIsSiblingAfter(document, '.navigator', 2);
        });

        it('inserts relative to multiple selectors and matches with overlap', async function () {
            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy,
                insertions: [
                    {
                        selector: '.meta',
                        position: ElementInsertionPosition.BEGIN
                    },
                    {
                        selector: '.navigator',
                        position: ElementInsertionPosition.AFTER
                    },
                    {
                        selector: 'main .post, .navigator',
                        position: ElementInsertionPosition.AFTER
                    }
                ]
            };
            await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

            assertSeriesInfoIsFirstChild(document, '.meta', 1);
            assertSeriesInfoIsSiblingAfter(document, '.navigator', 2, 2);
            assertSeriesInfoIsSiblingAfter(document, 'main .post', 1);
        });

        it('inserts by default at end of main post element', async function () {
            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            };
            await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

            assertSeriesInfoIsLastChild(document, 'main .post .gh-content', 1);
        });

        it('explicit insertions do not include the default insert', async function () {
            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy,
                insertions: [
                    {
                        selector: '.meta',
                        position: ElementInsertionPosition.BEGIN
                    }
                ]
            };
            await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

            assertSeriesInfoIsNotChild(document, 'main .post');
        });

        it('queries API with OR operator for multiple series tags', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML('');
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
            };

            await seriesDisplay.displaySeriesInfo(document, options);
            api.posts.browse.firstArg.filter.should.equal(`tag:${SeriesTagSlugDecDaily},tag:${SeriesTagSlugFluffy}`)
        });

        it('caches repeat API calls for same series tags', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML('');
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const singleTagOptions = {
                seriesTagSlugs: SeriesTagSlugFluffy
            };
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const bothTagsOptions = {
                seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
            };

            await seriesDisplay.displaySeriesInfo(document, singleTagOptions);
            await seriesDisplay.displaySeriesInfo(document, singleTagOptions);
            api.posts.browse.callCount.should.equal(1);

            await seriesDisplay.displaySeriesInfo(document, bothTagsOptions);
            api.posts.browse.callCount.should.equal(2);
        });

        it('throws if document is undefined', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            }

            await seriesDisplay.displaySeriesInfo(undefined, options).should.be.rejectedWith(TypeError, /document must be provided/);
        });

        it('throws if options.insertions is undefined or not an array', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML('');
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const optionsMissingInsertions = {
                seriesTagSlugs: SeriesTagSlugFluffy,
                insertions: undefined
            }
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const optionsWithInvalidInsertions = {
                seriesTagSlugs: SeriesTagSlugFluffy,
                insertions: 333
            }

            await seriesDisplay.displaySeriesInfo(document, optionsMissingInsertions).should.be.rejectedWith(TypeError, /insertions.*required/);
            await seriesDisplay.displaySeriesInfo(document, optionsWithInvalidInsertions).should.be.rejectedWith(TypeError, /insertions.*array/);
        });

        it('throws if options.insertions.selector is invalid', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML('');
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy,
                insertions: [
                    {
                        selector: 555,
                        position: ElementInsertionPosition.END
                    }
                ]
            }

            await seriesDisplay.displaySeriesInfo(document, options).should.be.rejected;
        });

        it('throws if options.insertions.position is invalid', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy,
                insertions: [
                    {
                        selector: 'div',
                        position: 'wrong'
                    }
                ]
            }

            await seriesDisplay.displaySeriesInfo(document, options).should.be.rejected;
        });

        it('uses document location URL if none for post is specified', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            const seriesPosts = fluffyPosts;
            const currentPost = seriesPosts[1];

            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            document.location = {
                origin: 'https://not-a-real-site.io',
                pathname: `/${currentPost.slug}/`
            };
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            }

            await seriesDisplay.displaySeriesInfo(document, options);
            assertAnchorsInListItemsExcept(document, seriesPosts.length - 1, currentPost.title);
        });

        it('finds series tag slugs from body if undefined', async function () {
            const browse = sinon.fake.returns(fluffyPosts);
            const api = { posts: { browse: browse }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);

            await seriesDisplay.displaySeriesInfo(document);
            browse.firstArg.filter.should.contains('tag:series-buying-new-house');
            browse.firstArg.filter.should.contains('tag:series-surveying-land');
        });

        it('does not call API endpoint if not in a series', async function () {
            const browse = sinon.fake.returns(fluffyPosts);
            const api = { posts: { browse: browse }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(NonSeriesPostHtml);

            await seriesDisplay.displaySeriesInfo(document);
            browse.called.should.be.false;
        });

        it('does not display if not in a series', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(NonSeriesPostHtml);

            await seriesDisplay.displaySeriesInfo(document);
            assertSeriesInfoIsNotChild(document, 'body');
            document.body.innerText.should.not.contain('null');
        });

        it('insert empty section if only one in a series with option to hide', async function () {
            const seriesPosts = [ fluffyPosts[0] ];
            const currentPost = seriesPosts[0];
            
            const api = { posts: { browse: sinon.fake.returns(seriesPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                currentPostUrl: currentPost.url,
                seriesTagSlugs: SeriesTagSlugFluffy,
                hideSinglePostSeries: true 
            }

            await seriesDisplay.displaySeriesInfo(document, options);
            assertAsideInSection(document, 0);
        });

        it('inserts coming soon text if only one in a series without hiding', async function () {
            const seriesPosts = [ fluffyPosts[0] ];
            const currentPost = seriesPosts[0];
            
            const api = { posts: { browse: sinon.fake.returns(seriesPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            let { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                currentPostUrl: currentPost.url,
                seriesTagSlugs: SeriesTagSlugFluffy,
                hideSinglePostSeries: false
            }

            await seriesDisplay.displaySeriesInfo(document, options);
            assertTextForListItems(document, [ currentPost.title, 'Coming soon???' ]);
            
            ({ document } = parseHTML(BasicPostHtml));
            options.comingSoonText = 'More to come!';
            await seriesDisplay.displaySeriesInfo(document, options);
            assertTextForListItems(document, [ currentPost.title, options.comingSoonText ]);
        });

        it('inserts custom heading text template', async function () {
            const api = { posts: { browse: sinon.fake.returns(decDailyAndFluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ],
                headingTextTemplate: 'More {{seriesTagName}} Posts'
            }

            await seriesDisplay.displaySeriesInfo(document, options);
            assertTitleInHeading(document, [
                `More ${TagsBySlug[SeriesTagSlugDecDaily].name} Posts`,
                `More ${TagsBySlug[SeriesTagSlugFluffy].name} Posts`
            ]);
        });

        it('does not insert until DOM content loaded', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            let { Event, document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            }

            document.readyState = 'loading';
            await seriesDisplay.displaySeriesInfo(document, options);
            assertSeriesElementIsNotPresent(document);

            document.dispatchEvent(new Event('DOMContentLoaded'));
            await seriesDisplay.displaySeriesInfo(document, options);
            assertSeriesElementIsPresent(document);
        });

        it('inserts immediately if document is not loading', async function () {
            const api = { posts: { browse: sinon.fake.returns(fluffyPosts) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type {Document} */
            let { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            }

            document.readyState = 'interactive';
            await seriesDisplay.displaySeriesInfo(document, options);
            assertSeriesElementIsPresent(document);

            ({ document } = parseHTML(BasicPostHtml));
            document.readyState = 'complete';
            await seriesDisplay.displaySeriesInfo(document, options);
            assertSeriesElementIsPresent(document);
        });
    });
});


function assertSeriesElementIsPresent(document) {
    const seriesElement = document.querySelector(`.${SeriesInfoClass}`);
    should.not.equal(seriesElement, null);
}

function assertSeriesElementIsNotPresent(document) {
    const seriesElement = document.querySelector(`.${SeriesInfoClass}`);
    should.equal(seriesElement, null);
}

function assertAsideInSection(node, expectedCount) {
    const asides = node.querySelectorAll(`.${SeriesInfoClass} aside`);
    asides.should.have.lengthOf(expectedCount);
}

function assertHeadingInAside(node, expectedCount) {
    const headings = node.querySelectorAll(`.${SeriesInfoClass} aside > h2`);
    headings.should.have.lengthOf(expectedCount);
}

function assertTitleInHeading(node, titles) {
    const headings = node.querySelectorAll(`.${SeriesInfoClass} h2`);
    for (const [i, title ] of titles.entries()) {
        headings[i].textContent.should.equal(title);
    }
}

function assertOrderedListInAside(node, expectedCount) {
    const lists = node.querySelectorAll(`.${SeriesInfoClass} aside > ol`);
    lists.should.have.lengthOf(expectedCount);
}

function assertListItemsInOrderedList(node, expectedCount) {
    const listItems = node.querySelectorAll(`.${SeriesInfoClass} ol > li`);
    listItems.should.have.lengthOf(expectedCount);
}

function assertTextForListItems(node, texts) {
    const listItems = node.querySelectorAll(`.${SeriesInfoClass} ol > li`);
    const listItemsText = [...listItems].map(item => item.textContent);
    listItemsText.should.deep.equal(texts);
}

function assertSameListItemTextTwice(fragment, repeatedText) {
    const listItems = fragment.querySelectorAll(`.${SeriesInfoClass} ol > li`);
    const listItemsText = [...listItems].map(item => item.textContent);
    const textsForPostInBothSeries = listItemsText.filter(text => text === repeatedText);
    textsForPostInBothSeries.should.have.lengthOf(2);
}

function assertAnchorsInListItems(node, expectedCount) {
    const anchors = node.querySelectorAll(`.${SeriesInfoClass} ol > li > a`);
    anchors.should.have.lengthOf(expectedCount);
}

function assertAnchorsInListItemsExcept(node, expectedCount, exceptionText) {
    assertAnchorsInListItems(node, expectedCount);
    
    const listItems = node.querySelectorAll(`.${SeriesInfoClass} ol > li`);
    const listItemWithoutAnchors = [...listItems].filter(item => item.querySelector('a') === null);
    listItemWithoutAnchors.every(listItem => listItem.textContent.should.equal(exceptionText));
}

function assertUrlsForAnchorHrefs(node, urls) {
    const anchors = node.querySelectorAll(`.${SeriesInfoClass} a`);
    const anchorHrefs = [...anchors].map(a => a.getAttribute('href'));
    anchorHrefs.should.deep.equal(urls);
}

function assertSeriesInfoIsFirstChild(document, elementsSelector, expectedCount, consecutiveCount = 1) {
    const elements = document.querySelectorAll(elementsSelector);
    elements.should.have.lengthOf(expectedCount);

    for (const element of elements) {
        element.firstElementChild.className.should.equal(SeriesInfoClass);
        assertSeriesInfoAreConsecutiveSiblingsAfter(element.firstElementChild, consecutiveCount);
    }
}

function assertSeriesInfoIsLastChild(document, elementsSelector, expectedCount, consecutiveCount = 1) {
    const elements = document.querySelectorAll(elementsSelector);
    elements.should.have.lengthOf(expectedCount);

    for (const element of elements) {
        element.lastElementChild.className.should.equal(SeriesInfoClass);
        assertSeriesInfoAreConsecutiveSiblingsBefore(element.lastElementChild, consecutiveCount);
    }    
}

function assertSeriesInfoIsSiblingBefore(document, elementsSelector, expectedCount, consecutiveCount = 1) {
    const elements = document.querySelectorAll(elementsSelector);
    elements.should.have.lengthOf(expectedCount);

    for (const element of elements) {
        element.previousElementSibling.className.should.equal(SeriesInfoClass);
        assertSeriesInfoAreConsecutiveSiblingsBefore(element.previousElementSibling, consecutiveCount);
    }    
}

function assertSeriesInfoIsSiblingAfter(document, elementsSelector, expectedCount, consecutiveCount = 1) {
    const elements = document.querySelectorAll(elementsSelector);
    elements.should.have.lengthOf(expectedCount);

    for (const element of elements) {
        element.nextElementSibling.className.should.equal(SeriesInfoClass);
        assertSeriesInfoAreConsecutiveSiblingsAfter(element.nextElementSibling, consecutiveCount);
    }    
}

function assertSeriesInfoIsNotChild(document, elementsSelector) {
    const elements = document.querySelectorAll(elementsSelector);
    elements.should.have.lengthOf.at.least(1);

    for (const element of elements) {
        should.not.exist(element.querySelector(`.${SeriesInfoClass}`));
    }
}

function assertSeriesInfoAreConsecutiveSiblingsBefore(element, consecutiveCount) {
    for (let i = 1; i < consecutiveCount; i++) {
        element = element.previousElementSibling;
        element.className.should.equal(SeriesInfoClass);
    }
}

function assertSeriesInfoAreConsecutiveSiblingsAfter(element, consecutiveCount) {
    for (let i = 1; i < consecutiveCount; i++) {
        element = element.nextElementSibling;
        element.className.should.equal(SeriesInfoClass);
    }
}


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