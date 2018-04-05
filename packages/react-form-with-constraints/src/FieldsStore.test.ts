import { FieldsStore, FieldEvent, FieldFeedbackValidation, FieldFeedbackType } from './index';

const validation_empty: FieldFeedbackValidation = {
  key: '0.0',
  type: FieldFeedbackType.Error,
  show: true
};

test('constructor()', () => {
  const store = new FieldsStore();
  expect(store.fields).toEqual([]);
});

test('clear()', () => {
  const store = new FieldsStore();

  expect(store.fields).toEqual([]);

  store.addField('username');
  const username = store.getField('username')!;
  username.addOrReplaceValidation(validation_empty);

  store.addField('password');
  const password = store.getField('password')!;
  password.addOrReplaceValidation(validation_empty);

  expect(store.fields).toEqual([
    {name: 'username', validations: [validation_empty]},
    {name: 'password', validations: [validation_empty]}
  ]);

  store.clear();
  expect(store.fields).toEqual([
    {name: 'username', validations: []},
    {name: 'password', validations: []}
  ]);
});

test('getField()', () => {
  const store = new FieldsStore();

  store.addField('username');
  const username = store.getField('username');
  expect(username).toEqual({name: 'username', validations: []});

  const unknown = store.getField('unknown');
  expect(unknown).toEqual(undefined);
});

test('addField()', () => {
  const store = new FieldsStore();
  const emitSpy = jest.spyOn(store, 'emit');

  store.addField('username');
  expect(emitSpy).toHaveBeenCalledTimes(1);
  expect(emitSpy).toHaveBeenLastCalledWith(FieldEvent.Added, {name: 'username', validations: []});

  store.addField('password');
  expect(emitSpy).toHaveBeenCalledTimes(2);
  expect(emitSpy).toHaveBeenLastCalledWith(FieldEvent.Added, {name: 'password', validations: []});

  expect(store.fields).toEqual([
    {name: 'username', validations: []},
    {name: 'password', validations: []}
  ]);
});

test('addField() - existing field', () => {
  const store = new FieldsStore();

  store.addField('username');
  store.addField('username');

  expect(store.fields).toEqual([
    {name: 'username', validations: []}
  ]);
});

test('removeField()', () => {
  const store = new FieldsStore();
  const emitSpy = jest.spyOn(store, 'emit');

  store.addField('username');
  expect(emitSpy).toHaveBeenCalledTimes(1);
  store.addField('password');
  expect(emitSpy).toHaveBeenCalledTimes(2);
  expect(store.fields).toEqual([
    {name: 'username', validations: []},
    {name: 'password', validations: []}
  ]);

  store.removeField('username');
  expect(emitSpy).toHaveBeenCalledTimes(3);
  expect(emitSpy).toHaveBeenLastCalledWith(FieldEvent.Removed, 'username');
  expect(store.fields).toEqual([
    {name: 'password', validations: []}
  ]);

  store.removeField('password');
  expect(emitSpy).toHaveBeenCalledTimes(4);
  expect(emitSpy).toHaveBeenLastCalledWith(FieldEvent.Removed, 'password');
  expect(store.fields).toEqual([]);
});

test('removeField() - unknown field', () => {
  const store = new FieldsStore();
  store.addField('username');

  store.removeField('password');
  expect(store.fields).toEqual([
    {name: 'username', validations: []}
  ]);
});

test('isValid()', () => {
  const store = new FieldsStore();

  store.addField('username');
  store.addField('password');

  expect(store.isValid()).toEqual(true);

  const username = store.getField('username')!;
  username.addOrReplaceValidation(validation_empty);
  expect(store.isValid()).toEqual(false);

  const password = store.getField('password')!;
  password.addOrReplaceValidation(validation_empty);
  expect(store.isValid()).toEqual(false);
});
