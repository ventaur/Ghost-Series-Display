import chai from 'chai';

import times from '../lib/times.js';

chai.should();


describe('#times', function () {
    it('returns an Array', function () {
        const result = times(3, answerToTheUniverse);
        result.should.be.an.instanceOf(Array);
    });

    it('returns n of the same value for constant action', function () {
        const actual = times(3, answerToTheUniverse);
        const expected = Array(3).fill(answerToTheUniverse());
        actual.should.deep.equal(expected);
    });

    it('returns index if echoed by action', function () {
        const actual = times(5, echo);
        const expected = [ 0, 1, 2, 3, 4 ];
        actual.should.deep.equal(expected);
    });

    it('returns single value if n is 1', function () {
        const actual = times(1, answerToTheUniverse);
        const expected = [ answerToTheUniverse() ];
        actual.should.deep.equal(expected);
    });

    it('returns an empty array if n is 0', function () {
        const actual = times(0, answerToTheUniverse);
        actual.should.be.empty;
    });
    
    it('returns an empty array if n is negative', function () {
        let actual = times(-1, answerToTheUniverse);
        actual.should.be.empty;

        actual = times(-5, answerToTheUniverse);
        actual.should.be.empty;
    });
});


function answerToTheUniverse() {
    return 42;
}

function echo(index) {
    return index;
}