import clearArray from './clearArray';

test('clearArray', () => {
  let array = [1, 2, 3, 4, 5];
  clearArray(array);
  expect(array.length).toEqual(0);
  expect(array[0]).toEqual(undefined);
  expect(array[4]).toEqual(undefined);

  // Even with undefined or null inside
  array = [1, undefined, 3, null, 5];
  clearArray(array);
  expect(array.length).toEqual(0);
  expect(array[0]).toEqual(undefined);
  expect(array[4]).toEqual(undefined);
});
