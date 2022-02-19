import groupBy from './groupBy.js';

import templater from 'templater.js';


function getTagsFromPosts(posts, seriesTagSlugs) {
    const allTags = posts.map(post => post.tags).flat();
    return seriesTagSlugs
        .map(seriesTagSlug => allTags.find(tag => tag.slug === seriesTagSlug))
        .filter(tag => tag !== undefined);
}

function groupPostsBySeriesTags(posts, seriesTags) {
    return groupBy(
        posts,
        post => seriesTags.filter(
            seriesTag => post.tags.some(
                tag => tag.slug === seriesTag.slug
            )
        )
    );
}


/**
 * Builds series information document fragment for specific posts that share one or more tags.
 * @param {Document} document A document object for manipuling the DOM.
 * @param {Array} posts An array of posts.
 * @param {import(".").BuildSeriesInfoOptions} options The options for building.
 * @returns {Promise<DocumentFragment>} A document fragment containing series information.
 */
 export default async function buildSeriesInfoFragmentFromPosts(document, posts, options) {
    const { currentPostUrl, hideSinglePostSeries, headingTextTemplate, comingSoonText, seriesTagSlugs } = options;
    if (!posts || !posts.length) return null;

    const seriesTags = getTagsFromPosts(posts, seriesTagSlugs);
    const postsGroupedBySeriesTags = groupPostsBySeriesTags(posts, seriesTags);

    // Generate one list of links per series tag of the other posts in that series (with the same tag).
    const fragment = document.createDocumentFragment();
    const section = document.createElement('section');
    section.className = 'series-info';
    fragment.appendChild(section);

    for (const [ seriesTag, posts ] of postsGroupedBySeriesTags) {
        // Skip this series info if indicated and only 1 post exists.
        if (hideSinglePostSeries === true && posts.length === 1) continue;
        
        const aside = document.createElement('aside');
        section.appendChild(aside);
        
        const heading = document.createElement('h2');
        heading.textContent = templater(headingTextTemplate)({ seriesTagName: seriesTag.name });
        aside.appendChild(heading);

        const list = document.createElement('ol');
        for (const post of posts) {
            const item = document.createElement('li');
            if (post.url === currentPostUrl) {
                item.textContent = post.title;
            } else {
                const link = document.createElement('a');
                link.textContent = post.title;
                link.href = post.url;
                item.appendChild(link);
            }

            list.appendChild(item);
        }

        // Add a special item to indicate a series in progress if only 1 post exists. 
        if (posts.length === 1) {
            const item = document.createElement('li');
            item.textContent = comingSoonText;
            list.appendChild(item);
        }

        aside.appendChild(list);
    }
    
    return fragment;
}