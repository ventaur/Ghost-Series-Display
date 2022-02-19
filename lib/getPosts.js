/**
 * Gets posts via the Content API for one or more series tag slugs.
 * @param {!import(".").GhostContentAPI} ghostContentApi An instance of the Content API used to query posts.
 * @param {string[]} seriesTagSlugs An array of tag slugs for one or more series.
 * @param {Map<string, Array} cachedPosts A Map of posts keyed by the filter used to query on.
 * @returns {Array} Returns an array of posts.
 */
export default async function getPosts(ghostContentApi, seriesTagSlugs, cachedPosts) {
    if (!seriesTagSlugs || seriesTagSlugs.length === 0) return [];

    // The filter should conform to the pattern: 'tag:some-tag+tag:another-tag'
    const postFilter = seriesTagSlugs
                        .map(tag => 'tag:' + tag)
                        .join(',');

    if (cachedPosts?.has(postFilter)) {
        return cachedPosts.get(postFilter);
    } else {
        try {
            const posts = await ghostContentApi.posts.browse({
                filter: postFilter,
                fields: 'id,title,slug,url',
                include: 'tags',
                order: 'published_at asc'
            });

            cachedPosts.set(postFilter, posts);
            return posts;
        } catch (err) {
            throw new Error('An error occurred while calling the posts.browse endpoint of the GhostContentAPI.\n' + err);
        }
    }
}