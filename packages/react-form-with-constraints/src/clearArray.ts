// See How do I empty an array in JavaScript? http://stackoverflow.com/q/1232040
export default function clear<T>(array: T[]) {
  while (array.length) {
    array.pop();
  }
}
