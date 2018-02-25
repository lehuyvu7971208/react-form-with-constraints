// Flatten nested arrays using recursion in JavaScript https://stackoverflow.com/q/30582352
// See Merge/flatten an array of arrays in JavaScript? https://stackoverflow.com/q/10865025
// See Lodash _.flattenDeep(array) https://lodash.com/docs/4.17.5#flattenDeep
export default function flattenDeep<T>(arrayOfArrays: T[][]): T[] {
  return arrayOfArrays
    .reduce<T[] /* instead of never[] as of TypeScript 2.7.2 */>(
      (prev, curr) => prev.concat(Array.isArray(curr) ? flattenDeep(curr as any as T[][]) : curr),
      []
    );
}

export function flatten2<T>(arrayOfArrays: T[] | T[][]): T[] {
  return (arrayOfArrays as T[][])
    .reduce<T[] /* instead of never[] as of TypeScript 2.7.2 */>(
      (prev, curr) => {
        console.log('prev []=', prev, 'curr= 1', curr);
        const isArray = Array.isArray(curr);
        const array = isArray ? flatten<T>(curr as any) : curr;
        const newArray = prev.concat(array);
        return newArray;
      },
      []
    );
}

function flatten3(arrayOfArrays) {
  return arrayOfArrays
    .reduce(
      (prev, curr) => {
        console.log('prev=', prev, 'curr=', curr);
        const isArray = Array.isArray(curr);
        const array = isArray ? flatten(curr) : curr;
        const newArray = prev.concat(array);
        return newArray;
      },
      []
    );
}

flatten([[[1]]]);
flatten([[1]]);
flatten([1]);


flatten2([
  [1, 2],
  3,
  [4, [[5]]]
]);

const result = [1, 2, 3, 4].reduce((accumulator, currentValue) => accumulator + currentValue);

[0, 1].reduce(
  (acc, cur) => acc.concat(cur),
  []
);
