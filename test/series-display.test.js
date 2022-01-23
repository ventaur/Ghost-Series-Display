import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { parseHTML } from 'linkedom';
import sinon from 'sinon';

import SeriesDisplay, { ElementInsertionPosition } from '../lib/index.js';

import {
    SeriesTagSlugDecDaily, SeriesTagSlugFluffy, 
    TagsBySlug, BasicPostHtml,
    createSeriesDisplayWithFluffyPosts,
    createSeriesDisplayWithDecDailyAndFluffyPosts
} from './testScenarios.js';

chai.use(chaiAsPromised);
chai.should();

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
                    currentPostId: currentPost.id,
                    seriesTagSlugs: SeriesTagSlugFluffy
                };
                fragment = await seriesDisplayForFluffyPosts.buildSeriesInfoFragment(document, options);
            });

            it('contains a heading in an aside', function () {
                assertHeadingInAside(fragment, 1);
            });

            it('contains a title in the heading', function () {
                assertTitleInHeading(fragment, [ TagsBySlug[SeriesTagSlugFluffy].name ]);
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
                    currentPostId: currentPost.id,
                    seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
                };
                fragment = await seriesDisplayForDecDailyAndFluffyPosts.buildSeriesInfoFragment(document, options);
            });

            it('contains 2 headings, each in an aside', function () {
                assertHeadingInAside(fragment, 2);
            });

            it('contains a title in each heading', function () {
                assertTitleInHeading(fragment, [ TagsBySlug[SeriesTagSlugDecDaily].name, TagsBySlug[SeriesTagSlugFluffy].name ]);
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
                    currentPostId: postInBothSeries.id,
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

        it('caches repeat API calls for same series tags', async function () {
            const api = { posts: { browse: sinon.fake.returns({ posts: fluffyPosts}) }};
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
            const api = { posts: { browse: sinon.fake.returns({ posts: fluffyPosts}) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            }

            await seriesDisplay.buildSeriesInfoFragment(undefined, options).should.be.rejectedWith(TypeError, /document must be provided/);
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
                    currentPostId: currentPost.id,
                    seriesTagSlugs: SeriesTagSlugFluffy
                };
                await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);
            });

            it('inserts a heading in an aside', function () {
                assertHeadingInAside(document, 1);
            });

            it('inserts a title in the heading', function () {
                assertTitleInHeading(document, [ TagsBySlug[SeriesTagSlugFluffy].name ]);
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
                    currentPostId: currentPost.id,
                    seriesTagSlugs: [ SeriesTagSlugDecDaily, SeriesTagSlugFluffy ]
                };
                await seriesDisplayForDecDailyAndFluffyPosts.displaySeriesInfo(document, options);
            });

            it('inserts 2 headings, each in an aside', function () {
                assertHeadingInAside(document, 2);
            });

            it('inserts a title in each heading', function () {
                assertTitleInHeading(document, [ TagsBySlug[SeriesTagSlugDecDaily].name, TagsBySlug[SeriesTagSlugFluffy].name ]);
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
                    currentPostId: postInBothSeries.id,
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

        it('inserts by default at end of main post element', async function () {
            /** @type {Document} */
            const { document } = parseHTML(BasicPostHtml);
            /** @type import('../lib/index.js').DisplaySeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            };
            await seriesDisplayForFluffyPosts.displaySeriesInfo(document, options);

            assertSeriesInfoIsLastChild(document, 'main .post', 1);
        });

        it('caches repeat API calls for same series tags', async function () {
            const api = { posts: { browse: sinon.fake.returns({ posts: fluffyPosts}) }};
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
            const api = { posts: { browse: sinon.fake.returns({ posts: fluffyPosts}) }};
            const seriesDisplay = new SeriesDisplay(api);

            /** @type import('../lib/index.js').BuildSeriesInfoOptions */
            const options = {
                seriesTagSlugs: SeriesTagSlugFluffy
            }

            await seriesDisplay.displaySeriesInfo(undefined, options).should.be.rejectedWith(TypeError, /document must be provided/);
        });
    });
});


function assertHeadingInAside(node, expectedCount) {
    const headings = node.querySelectorAll(`.${SeriesInfoClass} aside > h1`);
    headings.should.have.lengthOf(expectedCount);
}

function assertTitleInHeading(node, tagNames) {
    const headings = node.querySelectorAll(`.${SeriesInfoClass} h1`);
    for (const [i, tag ] of tagNames.entries()) {
        headings[i].textContent.should.contain(`Other Posts in ${tag}`);
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

function assertSeriesInfoIsFirstChild(document, elementsSelector, expectedCount) {
    const elements = document.querySelectorAll(elementsSelector);
    elements.should.have.lengthOf(expectedCount);

    for (const element of elements) {
        element.firstElementChild.className.should.equal(SeriesInfoClass);
    }
}

function assertSeriesInfoIsLastChild(document, elementsSelector, expectedCount) {
    const elements = document.querySelectorAll(elementsSelector);
    elements.should.have.lengthOf(expectedCount);

    for (const element of elements) {
        element.lastElementChild.className.should.equal(SeriesInfoClass);
    }    
}

function assertSeriesInfoIsSiblingBefore(document, elementsSelector, expectedCount) {
    const elements = document.querySelectorAll(elementsSelector);
    elements.should.have.lengthOf(expectedCount);

    for (const element of elements) {
        element.previousElementSibling.className.should.equal(SeriesInfoClass);
    }    
}

function assertSeriesInfoIsSiblingAfter(document, elementsSelector, expectedCount) {
    const elements = document.querySelectorAll(elementsSelector);
    elements.should.have.lengthOf(expectedCount);

    for (const element of elements) {
        element.nextElementSibling.className.should.equal(SeriesInfoClass);
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