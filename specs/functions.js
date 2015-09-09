import assert from "assert";

import merge from 'ramda/src/merge';
import take from 'ramda/src/take';
import sum from 'ramda/src/sum';
import {cartesian, combineLists, setsCompositions, lazyCartesianSorted} from "../functions";

const add = function(a, b) {
    return a + b;
};

describe('setsCompositions(sets, specs)', () => {
    it('should return correct array of indexes lists', () => {
        assert.deepEqual([[0, 2], [1, 2]], setsCompositions(['FT', 'FF'], [['FT'], ['FT'], ['FF']]));
        assert.deepEqual([[2], [0, 1]], setsCompositions(['FT', 'FF', 'H'], [['FT', 'FF'], ['H'], ['FT', 'FF', 'H']]));
        assert.deepEqual(
            [[2], [0, 1], [1, 3, 4]],
            setsCompositions(
                ['FT', 'FF', 'H'], [
                    ['FT', 'FF'], ['H'], ['FT', 'FF', 'H'], ['FT'], ['FF']
                ]
            )
        );
    });
});

describe('cartesian(...)', () => {
    it('should work with add function', () => {
        let cartesianAdd = cartesian(add);

        assert.deepEqual([11, 21, 12, 22], cartesianAdd([1, 2], [10, 20]));
    });
});

describe('lazyCartesianSorted(cartConcat, score)', () => {
    let lazyCartesianSortedAddSum = lazyCartesianSorted(add, sum);

    it('returns function', () => {
        assert.equal('function', typeof lazyCartesianSortedAddSum);
    });

    it('generates first 1, 2, 2, 3  by [0, 1] x [1, 2]', () => {
        let cartGen = lazyCartesianSortedAddSum([0, 1], [1, 2]);
        assert.equal(1, cartGen.next().value);
        assert.equal(2, cartGen.next().value);
        assert.equal(2, cartGen.next().value);
        assert.equal(3, cartGen.next().value);
        assert.equal(true, cartGen.next().done);
    });

    it('generates first 11, 12, 21, 22, 31, 32  by [1, 2] x [10, 20, 30]', () => {
        let cartGen = lazyCartesianSortedAddSum([1, 2], [10, 20, 30]);
        assert.equal(11, cartGen.next().value);
        assert.equal(12, cartGen.next().value);
        assert.equal(21, cartGen.next().value);
        assert.equal(22, cartGen.next().value);
        assert.equal(31, cartGen.next().value);
        assert.equal(32, cartGen.next().value);
        assert.equal(true, cartGen.next().done);
    });
});

describe('combineLists(lists, spec)', function() {
    it('should make combinations from lists with addition', function () {
        assert.deepEqual([ 11, 21, 31, 12, 22, 32, 13, 23, 33 ].sort(), combineLists([{
            sets: ['FT'],
            values: [1, 2, 3]
        }, {
            sets: ['FF'],
            values: [10, 20, 30]
        }], ['FT', 'FF'], add).sort());

        assert.deepEqual([ 11, 21, 31, 12, 22, 32, 13, 23, 33 ].sort(), combineLists([{
            sets: ['FT'],
            values: [1]
        }, {
            sets: ['FT'],
            values: [2, 3]
        }, {
            sets: ['FF'],
            values: [10, 20, 30]
        }], ['FT', 'FF'], add).sort());

        assert.deepEqual([ 13, 14, 23, 24 ].sort(), combineLists([{
            sets: ['H'],
            values: [1]
        }, {
            sets: ['FT'],
            values: [2, 3]
        }, {
            sets: ['FF'],
            values: [10, 20]
        }], ['H', 'FT', 'FF'], add).sort());

        let take10 = take(10);

        assert.deepEqual([ 3, 4, 5, 6, 6, 7, 7, 7, 8, 9 ], take10(combineLists([{
            sets: ['H'],
            values: [1, 5, 7]
        }, {
            sets: ['FT'],
            values: [1, 2, 5]
        }, {
            sets: ['FF'],
            values: [1, 3, 4]
        }], ['H', 'FT', 'FF'], add).sort((a, b) => a - b)));

    });

    it('should make combinations from lists with objects merge and price sum', function () {

        function mergingSumPrice(a, b) {
            return merge(a, merge(b, {
                price: a.price + b.price
            }));
        }

        assert.deepEqual([{
            price: 20,
            flightTo: 'FT1',
            flightFrom: 'FF1'
        }, {
            price: 30,
            flightTo: 'FT2',
            flightFrom: 'FF1'
        }, {
            price: 40,
            flightTo: 'FT3',
            flightFrom: 'FF1'
        }], combineLists([{
            sets: ['FT'],
            values: [{
                price: 10,
                flightTo: 'FT1'
            }, {
                price: 20,
                flightTo: 'FT2'
            }, {
                price: 30,
                flightTo: 'FT3'
            }]
        }, {
            sets: ['FF'],
            values: [{
                price: 10,
                flightFrom: 'FF1'
            }]
        }], ['FT', 'FF'], mergingSumPrice));


        assert.deepEqual([{
            price: 11,
            flightTo: 'FT1',
            flightFrom: 'FF1'
        }, {
            price: 12,
            flightTo: 'FT1',
            flightFrom: 'FF2'
        }, {
            price: 21,
            flightTo: 'FT2',
            flightFrom: 'FF1'
        }, {
            price: 22,
            flightTo: 'FT2',
            flightFrom: 'FF2'
        }], combineLists([{
            sets: ['FT'],
            values: [{
                price: 10,
                flightTo: 'FT1'
            }, {
                price: 20,
                flightTo: 'FT2'
            }]
        }, {
            sets: ['FF'],
            values: [{
                price: 1,
                flightFrom: 'FF1'
            }, {
                price: 2,
                flightFrom: 'FF2'
            }]
        }], ['FT', 'FF'], mergingSumPrice));
    });
});

