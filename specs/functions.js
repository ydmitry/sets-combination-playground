import assert from "assert";

import {cartesian, combineLists, setsCompositions} from "../functions";

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

describe('combineLists(lists, spec)', function() {
    it('should make combinations from lists', function () {
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
    });
});

