// See Merge/flatten an array of arrays in JavaScript? https://stackoverflow.com/q/10865025/990356
export default function flatten<T>(arrayOfArrays: T[][]) {
  return arrayOfArrays.reduce((prev, curr) => prev.concat(curr), []);
}
