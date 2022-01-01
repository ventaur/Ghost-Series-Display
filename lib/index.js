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


    function getPosts(seriesTags) {
        return new Promise((resolve, reject) => {
            // Ensure seriesTags is an array.
            // The filter should conform to the pattern: 'tag:some-tag+tag:another-tag'
            seriesTags = [].concat(seriesTags);
            const postFilter = seriesTags
                                .map(tag => 'tag:' + tag)
                                .join('+');
    
            if (cachedPosts.has(postFilter)) {
                resolve(cachedPosts.get(postFilter));
            } else {
                ghostContentApi.posts
                    .browse({
                        filter: postFilter, 
                        fields: 'title,slug',
                        order: 'published_at asc'
                    })
                    .then(posts => {
                        cachedPosts.set(postFilter, posts);
                        resolve(posts);
                    })
                    .catch(err => {
                        reject(err);
                    })
                ;
            }
        });
    }    


    async function displaySeriesInfo(seriesTags, options) {
        const posts = await getPosts(seriesTags);
    
        // TODO: Display one ToC per series tag of the other posts in that series (with the same tag).
        
    }
    

    return {
        displaySeriesInfo
    }
};
