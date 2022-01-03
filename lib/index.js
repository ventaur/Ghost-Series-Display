/*
You could create a new GhostContentAPI with your valid Content API key via Code Injection, 
then pass it to your call to this constructor.

var api = new GhostContentAPI({
    url: `${window.location.protocol}//${window.location.host}`,
    key: '0123456789abcdef0123456789',
    version: 'v4'
});
*/ 

export default function SeriesDisplay(ghostContentApi) {
    const cachedPosts = new Map();


    async function getPosts(seriesTags) {
        // Ensure seriesTags is an array.
        // The filter should conform to the pattern: 'tag:some-tag+tag:another-tag'
        seriesTags = [].concat(seriesTags);
        const postFilter = seriesTags
                            .map(tag => 'tag:' + tag)
                            .join('+');

        if (cachedPosts.has(postFilter)) {
            return cachedPosts.get(postFilter);
        } else {
            try {
                const browseResults = await ghostContentApi.posts.browse({
                    filter: postFilter, 
                    fields: 'title,slug',
                    order: 'published_at asc'
                });
                const posts = browseResults.posts;

                cachedPosts.set(postFilter, posts);
                return posts;
            } catch (err) {
                throw new Error('An error occurred while calling the posts.browse endpoint of the GhostContentAPI.');
            }
        }
    }


    async function displaySeriesInfo(seriesTags, options) {
        const html = await getSeriesInfoHtml(seriesTags, options);
        
        // TODO: Display one ToC per series tag of the other posts in that series (with the same tag).
        return 'TBD';
    }

    async function getSeriesInfoHtml(seriesTags, options) {
        const posts = await getPosts(seriesTags);
        
        const listItemsHtml = posts.map((post) => `<li>${post.title}`);
        return `<ol>${listItemsHtml}</ol>`;
    }
    

    return {
        displaySeriesInfo,
        getSeriesInfoHtml
    };
};
