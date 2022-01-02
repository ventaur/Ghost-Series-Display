import Chance from 'chance';
const chance = new Chance();

import slugify from 'slugify';


const PostScheme = 'https://';
const PostHost = 'not-a-real-site.io';


export default function createRandomPost() {
    // 5 mins to 42 days old
    const ageRangeInMinutes = {
        min: 5,
        max: 42 * 24 * 60
    };

    const now = Date.now();
    const createdAgeMins = chance.natural(ageRangeInMinutes);
    const updatedAgeMins = chance.natural(ageRangeInMinutes);
    const publishedAgeMins = chance.natural(ageRangeInMinutes);

    const createDate = new Date(now - createdAgeMins * 60 * 1000);
    const updateDate = new Date(now - Math.min(updatedAgeMins, createdAgeMins) * 60 * 1000);
    const publishDate = new Date(now - Math.min(publishedAgeMins, updatedAgeMins) * 60 * 1000);

    const id = createRandomId();
    const title = createRandomTitle();
    const slug = slugify(title, { lower: true });

    const tags = chance.n(createRandomTag, chance.natural({ min: 1, max: 3 }));

    return {
        id,
        comment_id: id,
        uuid: chance.guid(),

        title,
        excerpt: chance.sentence(),
        visibility: "public",

        created_at: timeStampString(createDate),
        updated_at: timeStampString(updateDate),
        published_at: timeStampString(publishDate),

        slug,
        url: `${PostScheme}${PostHost}/${slug}/`,
        reading_time: chance.natural({ min: 1, max: 20 }),

        tags,
        primary_tag: tags[0]
    };
}


function createRandomId() {
    return chance.string({ pool: 'abcdef0123456789', length: 24 });
}

function createRandomTag() {
    const name = createRandomTitle(3);
    const slug = slugify(name, { lower: true });

    return {
        id: createRandomId(),
        name,
        visibility: "public",

        slug,
        url: `${PostScheme}${PostHost}/tag/${slug}/`,
    };
}

function createRandomTitle(maxWords) {
    const sentence = chance.sentence({ words: chance.integer({ min: 2, max: maxWords ?? 6 }) });
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
