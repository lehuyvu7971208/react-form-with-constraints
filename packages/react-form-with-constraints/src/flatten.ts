// Flatten nested arrays using recursion in JavaScript https://stackoverflow.com/q/30582352
// See Merge/flatten an array of arrays in JavaScript? https://stackoverflow.com/q/10865025
export default function flatten<T>(arrayOfArrays: T[][]): T[] {
  return arrayOfArrays
    .reduce(
      (prev, curr) => prev.concat(Array.isArray(curr) ? flatten(curr as any as T[][]) : curr),
      []
    );
}
