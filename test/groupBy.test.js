import chai from 'chai';

import groupBy from '../lib/groupBy.js';

const should = chai.should();


describe('groupBy', function () {
    it('returns a Map', function () {
        const result = groupBy([1, 2, 3], oddOrEven);
        result.should.be.an.instanceOf(Map);
    });

    it('has keys for single matching iteratee results', function () {
        let map = groupBy([1, 2, 3], oddOrEven);
        map.should.have.all.keys(['odd', 'even']);

        map = groupBy([2, 4, 6], oddOrEven);
        map.should.have.all.keys(['even']);
    });

    it('has values for single matching keys', function () {
        let actual = groupBy([1, 2, 3], oddOrEven);
        let expected = new Map([
            ['odd', [1, 3]],
            ['even', [2]]
        ]);
        actual.should.deep.equal(expected);

        actual = groupBy([2, 4, 6], oddOrEven);
        expected = new Map([
            ['even', [2, 4, 6]]
        ]);
        actual.should.deep.equal(expected);
    });

    it('has keys for multiple matching iteratee results', function () {
        let map = groupBy([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], oddOrEvenAndDivisbleBy3);
        map.should.have.all.keys(['odd', 'even', 'divisible by 3']);

        map = groupBy([1, 2, 4, 5, 7, 8, 10], oddOrEvenAndDivisbleBy3);
        map.should.have.all.keys(['odd', 'even']);
    });

    it('has values for multiple matching keys', function () {
        let actual = groupBy([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], oddOrEvenAndDivisbleBy3);
        let expected = new Map([
            ['odd', [1, 3, 5, 7, 9]],
            ['even', [2, 4, 6, 8, 10]],
            ['divisible by 3', [3, 6, 9]]
        ]);
        actual.should.deep.equal(expected);

        actual = groupBy([1, 2, 4, 5, 7, 8, 10], oddOrEvenAndDivisbleBy3);
        expected = new Map([
            ['odd', [1, 5, 7]],
            ['even', [2, 4, 8, 10]]
        ]);
        actual.should.deep.equal(expected);
    });
});


function oddOrEven(value) {
    return value % 2 === 1 ? 'odd' : 'even';
}

function oddOrEvenAndDivisbleBy3(value) {
    let keys = [].concat(oddOrEven(value));
    if (value % 3 === 0) {
        keys.push('divisible by 3');
    }

    return keys;
}