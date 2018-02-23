import { fieldWithoutFeedback, FieldsStore, FieldEvent } from './index';

test('constructor()', () => {
  const store = new FieldsStore();
  expect(store.fields).toEqual({});

  // Check Object.prototype properties don't exist
  expect(store.fields.constructor).toEqual(undefined);
  expect(store.fields.toString).toEqual(undefined);
});

test('reset()', () => {
  const store = new FieldsStore();

  expect(store.fields).toEqual({});

  store.addField('username');
  store.addField('password');

  expect(store.fields).toEqual({
    username: fieldWithoutFeedback,
    password: fieldWithoutFeedback
  });

  const emitSpy = jest.spyOn(store, 'emit');
  store.clear();
  expect(emitSpy).toHaveBeenCalledTimes(2);
  expect(emitSpy.mock.calls).toEqual([
    [FieldEvent.Updated, 'username'],
    [FieldEvent.Updated, 'password']
  ]);
  expect(store.fields).toEqual({
    username: fieldWithoutFeedback,
    password: fieldWithoutFeedback
  });
});

test('addField()', () => {
  const store = new FieldsStore();
  const emitSpy = jest.spyOn(store, 'emit');

  store.addField('username');
  expect(emitSpy).toHaveBeenCalledTimes(1);
  expect(emitSpy).toHaveBeenLastCalledWith(FieldEvent.Added, 'username', fieldWithoutFeedback);

  store.addField('password');
  expect(emitSpy).toHaveBeenCalledTimes(2);
  expect(emitSpy).toHaveBeenLastCalledWith(FieldEvent.Added, 'password', fieldWithoutFeedback);

  expect(store.fields).toEqual({
    username: fieldWithoutFeedback,
    password: fieldWithoutFeedback
  });
});

test('addField() - existing field', () => {
  const store = new FieldsStore();

  store.addField('username');
  store.addField('username');

  expect(store.fields).toEqual({
    username: fieldWithoutFeedback
  });
});

test('removeField()', () => {
  const store = new FieldsStore();
  const emitSpy = jest.spyOn(store, 'emit');

  store.addField('username');
  expect(emitSpy).toHaveBeenCalledTimes(1);
  store.addField('password');
  expect(emitSpy).toHaveBeenCalledTimes(2);
  expect(store.fields).toEqual({
    username: fieldWithoutFeedback,
    password: fieldWithoutFeedback
  });

  store.removeField('username');
  expect(emitSpy).toHaveBeenCalledTimes(3);
  expect(emitSpy).toHaveBeenLastCalledWith(FieldEvent.Removed, 'username');
  expect(store.fields).toEqual({
    password: fieldWithoutFeedback
  });

  store.removeField('password');
  expect(emitSpy).toHaveBeenCalledTimes(4);
  expect(emitSpy).toHaveBeenLastCalledWith(FieldEvent.Removed, 'password');
  expect(store.fields).toEqual({});
});

test('removeField() - unknown field', () => {
  const store = new FieldsStore();
  store.addField('username');
  expect(() => store.removeField('password')).toThrow("Unknown field 'password'");
  expect(store.fields).toEqual({
    username: fieldWithoutFeedback
  });
});
