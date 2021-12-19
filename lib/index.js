// NOTE: Can/should we access this externally?
// E.g.: https://unpkg.com/@tryghost/content-api@{version}/umd/content-api.min.js
import GhostContentAPI from '@tryghost/content-api';

// NOTE: You could add your API key to a valid Content API key globally (e.g., via Code Injection), 
// then pass it in to your call to the constructor.


export function SeriesDisplay(apiKey) {
    const api = new GhostContentAPI({
        url: `${window.location.protocol}//${window.location.host}`,
        key: apiKey,
        version: 'v4'
    });
    
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
                api.posts
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


    return {
        displaySeriesInfo: async function (seriesTags, options) {
            const posts = await getPosts(seriesTags);
        
            // TODO: Display one ToC per series tag of the other posts in that series (with the same tag).
            
        }
    }
}
