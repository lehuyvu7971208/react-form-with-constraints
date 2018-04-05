import Field from './Field';
import FieldFeedbackValidation from './FieldFeedbackValidation';
import { FieldFeedbackType } from './FieldFeedback';

test('constructor', () => {
  const field = new Field('password');
  expect(field).toEqual({
    name: 'password',
    validations: []
  });
});

// Validations rules for a password: not empty, minimum length, should contain letters, should contain numbers
const validation_empty: FieldFeedbackValidation = {
  key: '0.0',
  type: FieldFeedbackType.Error,
  show: true
};
const validation_length: FieldFeedbackValidation = {
  key: '0.1',
  type: FieldFeedbackType.Error,
  show: true
};
const validation_letters: FieldFeedbackValidation = {
  key: '1.0',
  type: FieldFeedbackType.Warning,
  show: true
};
const validation_numbers: FieldFeedbackValidation = {
  key: '1.1',
  type: FieldFeedbackType.Warning,
  show: true
};

test('addOrReplaceValidation()', () => {
  const field = new Field('password');
  field.addOrReplaceValidation(validation_empty);
  field.addOrReplaceValidation(validation_length);
  field.addOrReplaceValidation(validation_letters);
  field.addOrReplaceValidation(validation_numbers);
  expect(field).toEqual({
    name: 'password',
    validations: [validation_empty, validation_length, validation_letters, validation_numbers]
  });

  const validation_empty2: FieldFeedbackValidation = {
    key: validation_empty.key,
    type: validation_empty.type,
    show: false
  };
  field.addOrReplaceValidation(validation_empty2);
  expect(field).toEqual({
    name: 'password',
    validations: [validation_empty2, validation_length, validation_letters, validation_numbers]
  });

  const validation_length2: FieldFeedbackValidation = {
    key: validation_length.key,
    type: validation_length.type,
    show: false
  };
  field.addOrReplaceValidation(validation_length2);
  expect(field).toEqual({
    name: 'password',
    validations: [validation_empty2, validation_length2, validation_letters, validation_numbers]
  });
});

test('clear()', () => {
  const field = new Field('password');
  field.addOrReplaceValidation(validation_empty);
  field.addOrReplaceValidation(validation_length);
  field.addOrReplaceValidation(validation_letters);
  field.addOrReplaceValidation(validation_numbers);

  expect(field.validations).toEqual([validation_empty, validation_length, validation_letters, validation_numbers]);

  field.clear();
  expect(field).toEqual({
    name: 'password',
    validations: []
  });
});

test('has*() + isValid()', () => {
  const field = new Field('password');
  field.addOrReplaceValidation(validation_empty);
  field.addOrReplaceValidation(validation_length);
  field.addOrReplaceValidation(validation_letters);
  field.addOrReplaceValidation(validation_numbers);

  expect(field.validations).toEqual([validation_empty, validation_length, validation_letters, validation_numbers]);

  expect(field.hasErrors()).toEqual(true);
  expect(field.hasErrors('0')).toEqual(true);
  expect(field.hasErrors('1')).toEqual(false);
  expect(field.hasWarnings()).toEqual(true);
  expect(field.hasWarnings('0')).toEqual(false);
  expect(field.hasWarnings('1')).toEqual(true);
  expect(field.hasInfos()).toEqual(false);
  expect(field.hasInfos('0')).toEqual(false);
  expect(field.hasInfos('1')).toEqual(false);
  expect(field.hasAnyFeedbacks()).toEqual(true);
  expect(field.hasAnyFeedbacks('0')).toEqual(true);
  expect(field.hasAnyFeedbacks('1')).toEqual(true);
  expect(field.isValid()).toEqual(false);


  const validation_empty2: FieldFeedbackValidation = {
    key: validation_empty.key,
    type: validation_empty.type,
    show: false
  };
  field.addOrReplaceValidation(validation_empty2);

  expect(field.validations).toEqual([validation_empty2, validation_length, validation_letters, validation_numbers]);

  expect(field.hasErrors()).toEqual(true);
  expect(field.hasErrors('0')).toEqual(true);
  expect(field.hasErrors('1')).toEqual(false);
  expect(field.hasWarnings()).toEqual(true);
  expect(field.hasWarnings('0')).toEqual(false);
  expect(field.hasWarnings('1')).toEqual(true);
  expect(field.hasInfos()).toEqual(false);
  expect(field.hasInfos('0')).toEqual(false);
  expect(field.hasInfos('1')).toEqual(false);
  expect(field.hasAnyFeedbacks()).toEqual(true);
  expect(field.hasAnyFeedbacks('0')).toEqual(true);
  expect(field.hasAnyFeedbacks('1')).toEqual(true);
  expect(field.isValid()).toEqual(false);


  const validation_length2: FieldFeedbackValidation = {
    key: validation_length.key,
    type: validation_length.type,
    show: false
  };
  field.addOrReplaceValidation(validation_length2);

  expect(field.validations).toEqual([validation_empty2, validation_length2, validation_letters, validation_numbers]);

  expect(field.hasErrors()).toEqual(false);
  expect(field.hasErrors('0')).toEqual(false);
  expect(field.hasErrors('1')).toEqual(false);
  expect(field.hasWarnings()).toEqual(true);
  expect(field.hasWarnings('0')).toEqual(false);
  expect(field.hasWarnings('1')).toEqual(true);
  expect(field.hasInfos()).toEqual(false);
  expect(field.hasInfos('0')).toEqual(false);
  expect(field.hasInfos('1')).toEqual(false);
  expect(field.hasAnyFeedbacks()).toEqual(true);
  expect(field.hasAnyFeedbacks('0')).toEqual(false);
  expect(field.hasAnyFeedbacks('1')).toEqual(true);
  expect(field.isValid()).toEqual(true);


  const validation_letters2: FieldFeedbackValidation = {
    key: validation_letters.key,
    type: validation_letters.type,
    show: false
  };
  field.addOrReplaceValidation(validation_letters2);

  expect(field.validations).toEqual([validation_empty2, validation_length2, validation_letters2, validation_numbers]);

  expect(field.hasErrors()).toEqual(false);
  expect(field.hasErrors('0')).toEqual(false);
  expect(field.hasErrors('1')).toEqual(false);
  expect(field.hasWarnings()).toEqual(true);
  expect(field.hasWarnings('0')).toEqual(false);
  expect(field.hasWarnings('1')).toEqual(true);
  expect(field.hasInfos()).toEqual(false);
  expect(field.hasInfos('0')).toEqual(false);
  expect(field.hasInfos('1')).toEqual(false);
  expect(field.hasAnyFeedbacks()).toEqual(true);
  expect(field.hasAnyFeedbacks('0')).toEqual(false);
  expect(field.hasAnyFeedbacks('1')).toEqual(true);
  expect(field.isValid()).toEqual(true);

  expect(field.hasWarnings('1', '1.1')).toEqual(false);
  expect(field.hasAnyFeedbacks('1', '1.1')).toEqual(false);


  const validation_numbers2: FieldFeedbackValidation = {
    key: validation_numbers.key,
    type: validation_numbers.type,
    show: false
  };
  field.addOrReplaceValidation(validation_numbers2);

  expect(field.validations).toEqual([validation_empty2, validation_length2, validation_letters2, validation_numbers2]);

  expect(field.hasErrors()).toEqual(false);
  expect(field.hasErrors('0')).toEqual(false);
  expect(field.hasErrors('1')).toEqual(false);
  expect(field.hasWarnings()).toEqual(false);
  expect(field.hasWarnings('0')).toEqual(false);
  expect(field.hasWarnings('1')).toEqual(false);
  expect(field.hasInfos()).toEqual(false);
  expect(field.hasInfos('0')).toEqual(false);
  expect(field.hasInfos('1')).toEqual(false);
  expect(field.hasAnyFeedbacks()).toEqual(false);
  expect(field.hasAnyFeedbacks('0')).toEqual(false);
  expect(field.hasAnyFeedbacks('1')).toEqual(false);
  expect(field.isValid()).toEqual(true);
});

test('hasFeedbacksOfType() assertions', () => {
  const field = new Field('password');
  field.addOrReplaceValidation(validation_empty);
  const validation_letters2: FieldFeedbackValidation = {
    key: validation_letters.key,
    type: validation_letters.type,
    show: false
  };
  field.addOrReplaceValidation(validation_letters2);

  expect(field.hasErrors()).toEqual(true);
  expect(field.hasErrors('0')).toEqual(true);
  expect(field.hasErrors('1')).toEqual(false);
  expect(() => field.hasErrors('2')).toThrow("No field feedback starting with '2.'");
  expect(field.hasErrors('0', '0.0')).toEqual(false);
  expect(field.hasErrors('1', '1.0')).toEqual(false);
  expect(() => field.hasErrors('0', '0.1')).toThrow("No field feedback matching '0.1'");
  expect(() => field.hasErrors('1', '0.0')).toThrow("No field feedback starting with '1.' and matching '0.0'");
});
