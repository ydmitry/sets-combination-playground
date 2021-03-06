import reduce from 'ramda/src/reduce';
import curry from 'ramda/src/curry';
import prop from 'ramda/src/prop';
import flatten from 'ramda/src/flatten';
import map from 'ramda/src/map';
import intersection from 'ramda/src/intersection';
import clone from 'ramda/src/clone';
import concat from 'ramda/src/concat';
import range from 'ramda/src/range';
import filter from 'ramda/src/filter';
import uniq from 'ramda/src/uniq';
import equals from 'ramda/src/equals';
import pluck from 'ramda/src/pluck';
import repeat from 'ramda/src/repeat';
import mapObjIndexed from 'ramda/src/mapObjIndexed';
import values from 'ramda/src/values';
import head from 'ramda/src/head';
import tail from 'ramda/src/tail';
import length from 'ramda/src/length';

export function minIndexBy(compare, list) {
    let min = null;

    for (let i = 0; i < list.length; i++) {
        let item = list[i];

        if (min === null || compare(item, list[min])) {
            min = i;
        }
    }

    return min;
}

export function pushQueueByItem(lengths, queue, item) {
    let i = 0;
    // Fill by 1 if present 0
    while (i < item.length && item[i] == 0) {

        if (lengths[i] > 1) {
            let newItem = [...item];
            newItem[i] = 1;
            queue.push(newItem);
        }

        i++;
    }

    // The next value +1
    if (i < item.length && lengths[i] > item[i] + 1) {
        let newItem = [...item];

        newItem[i]++;
        queue.push(newItem);
    }

    return queue;
}


export function cartesian(cartConcat) {
    return function() {
        let lists = arguments;
        let result;

        result = reduce((a, b) => {
            let result = [];

            if (a.length == 0) return b;

            for (let i = 0; i < a.length; i++) {
                for (let j = 0; j < b.length; j++) {
                    result.push(cartConcat(a[i], b[j]));
                }
            }
            return result;
        }, [], lists);

        return result;
    };
}

export function lazyCartesianSorted(cartesianConcat, score) {
    return function *cartGen(...lists) {
        let queue = [repeat(0, lists.length)];

        const toValues = function(lists, item) {
            return values(mapObjIndexed((x, i) => {
                return lists[i][x];
            }, item));
        };

        const scoreQueueItem = function(score, lists, item) {
            return score(toValues(lists, item));
        };

        const getMinElementQueueIndex = function getMinElementQueueIndex(score, lists, queue) {
            let min = null;
            let minS = null;

            for (let i = 0; i < queue.length; i++) {
                let item = queue[i];
                let s = scoreQueueItem(score, lists, item);

                if (min === null || s < minS) {
                    min = i;
                    minS = s;
                }
            }

            return min;
        };

        const lengthLists = map(length, lists);

        while (queue.length > 0) {
            let minIndex = getMinElementQueueIndex(score, lists, queue);
            let item = queue[minIndex];
            let itemValues = toValues(lists, item);
            let element = reduce(cartesianConcat, head(itemValues), tail(itemValues));

            yield element;

            queue.splice(minIndex, 1);

            queue = pushQueueByItem(lengthLists, queue, item);
        }
    }
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
    let result = [];
    let cartesianValuesMerge = cartesian(valuesMerge);
    let compositions = setsCompositions(specs, pluck('sets', lists));

    for (let i = 0; i < compositions.length; i++) {
        let c = compositions[i];
        let compositionLists = c.map(listIndex => lists[listIndex].values);
        result = concat(result, cartesianValuesMerge(...compositionLists));
    }

    return result;
}


export function *combineListsScoreSorted(lists, specs, valuesMerge, sortScore, compare) {

    const propValue = prop('value');
    const propDone = prop('done');

    let result = [];
    let cartesianValuesMerge = lazyCartesianSorted(valuesMerge, sortScore);
    let compositions = setsCompositions(specs, pluck('sets', lists));
    let generators = []; // repeat(0, compositions.length);
    let vals = [];

    for (let i = 0; i < compositions.length; i++) {
        let c = compositions[i];
        let compositionLists = c.map(listIndex => lists[listIndex].values);
        let cartGen = cartesianValuesMerge(...compositionLists);

        generators.push(cartGen);
        vals.push(cartGen.next());
    }

    while (filter(x => !propDone(x), vals).length > 0) {
        let mInd = minIndexBy((a, b) => {
            return propDone(b) === true || (propDone(a) !== true && compare(propValue(a), propValue(b)));
        }, vals);


        yield propValue(vals[mInd]);

        vals[mInd] = generators[mInd].next();
    }

    return result;
}
