import Chance from 'chance';
const chance = new Chance();

import slugify from 'slugify';


const PostScheme = 'https://';
const PostHost = 'not-a-real-site.io';


export default function createRandomPost(ensureSomeTags) {
    // 5 mins to 42 days old
    const ageRangeInMinutes = {
        min: 5,
        max: 42 * 24 * 60
    };

    const now = Date.now();
    const createdAgeMins = chance.natural(ageRangeInMinutes);
    const updatedAgeMins = chance.natural(ageRangeInMinutes);
    const publishedAgeMins = chance.natural(ageRangeInMinutes);

    const createDate = new Date(now - createdAgeMins);
    const updateDate = new Date(now - Math.min(updatedAgeMins, createdAgeMins));
    const publishDate = new Date(now - Math.min(publishedAgeMins, updatedAgeMins));

    const id = chance.string({ pool: 'abcdef0123456789', length: 24 });
    const title = createRandomTitle();
    const slug = slugify(title);

    return {
        id: id,
        comment_id: id,
        uuid: chance.guid(),

        title: title,
        excerpt: chance.sentence(),
        visibility: "public",

        created_at: timeStampString(createDate),
        updated_at: timeStampString(updateDate),
        published_at: timeStampString(publishDate),

        slug: slug,
        url: `${PostScheme}${PostHost}/${slug}/`,
        reading_time: chance.natural({ min: 1, max: 20 }),

        // TODO
        tags: [],
        primary_tag: {}
    };
}


function createRandomTitle() {
    const sentence = chance.sentence({ words: chance.integer({ min: 2, max: 6 }) });
    return titleCase(sentence.slice(0, sentence.length - 1));
}

function timeStampString(date) {
    return date.toISOString().replace('Z', '+00:00');
}

function titleCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}
