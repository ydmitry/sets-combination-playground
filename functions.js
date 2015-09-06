import reduce from 'ramda/src/reduce';
import flatten from 'ramda/src/flatten';
import map from 'ramda/src/map';
import intersection from 'ramda/src/intersection';
import clone from 'ramda/src/clone';
import concat from 'ramda/src/concat';
import range from 'ramda/src/range';
import filter from 'ramda/src/filter';
import uniq from 'ramda/src/uniq';
import equals from 'ramda/src/equals';


export function cartesian(cartConcat) {
    return (a, b) => {
        let result = [];
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                result.push(cartConcat(a[i], b[j]));
            }
        }
        return result;
    };
}

// Returns
// [[0, 2], [1, 2]] == setsCompositions(['FT', 'FF'], [['FT'], ['FT'], ['FF']])
export function setsCompositions(specs, sets) {
    let indexes = map(x => [x], range(0, sets.length));

    // [0, 1] x [2] =
    let cartesianConcat = cartesian(concat);

    let result = [];
    let prevResult = indexes;

    for (let len = 0; len < specs.length; len++) {
        result = concat(result, prevResult);
        prevResult = cartesianConcat(prevResult, indexes);
    }

    result = concat(result, prevResult);


    result = uniq(map(x => x.sort(), result));
    result = filter(list => {
        let norm = reduce((l, index) => {
            return concat(l, sets[index]);
        }, [], list);
        return equals(norm.sort(), specs.sort()); //
    }, result);

    return result;
}

export function combineLists(lists, specs, valuesMerge) {
    let result;
    let cartesianValuesMerge = cartesian(valuesMerge);

    result = reduce((r, itemSpec) => {
        r = reduce((specR, itemList) => {

            if (itemList.sets.indexOf(itemSpec) !== -1) {
                specR = r.length > 0 ? cartesianValuesMerge(r, itemList.values) : itemList.values;
            }

            return specR;
        }, [], lists);

        return r;
    }, [], specs);


    return result;
}
