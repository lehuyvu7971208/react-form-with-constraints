import React from 'react';
import { shallow as _shallow, mount as _mount } from 'enzyme';

import { FormWithConstraints, FieldFeedback, FieldFeedbackContext, FieldFeedbackProps, ValidateFieldEvent, ResetEvent } from './index';
import { InputMock, input_username_valueMissing, input_username_valid } from './InputMock';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

function shallow(node: React.ReactElement<FieldFeedbackProps>, options: {context: FieldFeedbackContext}) {
  return _shallow<FieldFeedbackProps>(node, options);
}

function mount(node: React.ReactElement<FieldFeedbackProps>, options: {context: FieldFeedbackContext}) {
  return _mount<FieldFeedbackProps>(node, options);
}

let form_username: FormWithConstraints;
let fieldFeedbacks_username: FieldFeedbacks;

beforeEach(() => {
  form_username = new_FormWithConstraints({});
  fieldFeedbacks_username = new FieldFeedbacks({for: 'username', stop: 'no'}, {form: form_username});
});

describe('constructor()', () => {
  test('key', () => {
    expect(fieldFeedbacks_username.key).toEqual(0);

    const wrapper1 = shallow(
      <FieldFeedback when="*">message</FieldFeedback>,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const fieldFeedback1 = wrapper1.instance() as FieldFeedback;
    expect(fieldFeedback1.key).toEqual('0.0');

    const wrapper2 = shallow(
      <FieldFeedback when="*">message</FieldFeedback>,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const fieldFeedback2 = wrapper2.instance() as FieldFeedback;
    expect(fieldFeedback2.key).toEqual('0.1');
  });

  test('when="valid"', () => {
    expect(() =>
      shallow(
        <FieldFeedback when="valid" error />,
        {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
      )
    ).toThrow('Cannot have an attribute (error, warning...) with FieldFeedback when="valid"');

    expect(() =>
      shallow(
        <FieldFeedback when="valid" warning />,
        {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
      )
    ).toThrow('Cannot have an attribute (error, warning...) with FieldFeedback when="valid"');

    expect(() =>
      shallow(
        <FieldFeedback when="valid" info />,
        {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
      )
    ).toThrow('Cannot have an attribute (error, warning...) with FieldFeedback when="valid"');
  });
});

test('componentWillMount() componentWillUnmount()', () => {
  const addValidateFieldEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'addValidateFieldEventListener');
  const addResetEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'addResetEventListener');
  const removeValidateFieldEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'removeValidateFieldEventListener');
  const removeResetEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'removeResetEventListener');

  const wrapper = shallow(
    <FieldFeedback when="*" />,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );
  expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(addResetEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(0);
  expect(removeResetEventListenerSpy).toHaveBeenCalledTimes(0);
  expect(fieldFeedbacks_username.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toHaveLength(1);
  expect(fieldFeedbacks_username.resetEventEmitter.listeners.get(ResetEvent)).toHaveLength(1);

  wrapper.unmount();
  expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(addResetEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeResetEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(fieldFeedbacks_username.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toEqual(undefined);
  expect(fieldFeedbacks_username.resetEventEmitter.listeners.get(ResetEvent)).toEqual(undefined);
});

describe('validate()', () => {
  describe('when prop', () => {
    describe('string', () => {
      test('unknown', () => {
        shallow(
          <FieldFeedback when={'unknown' as any} />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: false}
        ]);
      });

      test('not matching', () => {
        shallow(
          <FieldFeedback when="badInput" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: false}
        ]);
      });

      test('*', () => {
        shallow(
          <FieldFeedback when="*" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('badInput', () => {
        shallow(
          <FieldFeedback when="badInput" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, badInput: true}, 'Suffering from bad input');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('patternMismatch', () => {
        shallow(
          <FieldFeedback when="patternMismatch" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, patternMismatch: true}, 'Suffering from a pattern mismatch');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('rangeOverflow', () => {
        shallow(
          <FieldFeedback when="rangeOverflow" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, rangeOverflow: true}, 'Suffering from an overflow');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('rangeUnderflow', () => {
        shallow(
          <FieldFeedback when="rangeUnderflow" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, rangeUnderflow: true}, 'Suffering from an underflow');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('stepMismatch', () => {
        shallow(
          <FieldFeedback when="stepMismatch" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, stepMismatch: true}, 'Suffering from a step mismatch');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('tooLong', () => {
        shallow(
          <FieldFeedback when="tooLong" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, tooLong: true}, 'Suffering from being too long');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('tooShort', () => {
        shallow(
          <FieldFeedback when="tooShort" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, tooShort: true}, 'Suffering from being too short');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('typeMismatch', () => {
        shallow(
          <FieldFeedback when="typeMismatch" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, typeMismatch: true}, 'Suffering from bad input');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('valueMissing', () => {
        shallow(
          <FieldFeedback when="valueMissing" />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });

      test('valid', () => {
        shallow(
          <FieldFeedback when="valid">Looks good!</FieldFeedback>,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

        expect(validations).toEqual([
          {key: '0.0', type: 'whenValid', show: undefined}
        ]);
      });
    });

    describe('function', () => {
      test('no error', () => {
        shallow(
          <FieldFeedback when={value => value.length === 0} />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', 'length > 0', {}, '');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: false}
        ]);
      });

      test('error', () => {
        shallow(
          <FieldFeedback when={value => value.length === 0} />,
          {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {}, '');
        const validations = fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(validations).toEqual([
          {key: '0.0', type: 'error', show: true}
        ]);
      });
    });

    test('invalid typeof', () => {
      shallow(
        <FieldFeedback when={2 as any} />,
        {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
      );
      const input = new InputMock('username', '', {}, '');
      expect(() => fieldFeedbacks_username.emitValidateFieldEvent(input)).toThrow(TypeError);
      expect(() => fieldFeedbacks_username.emitValidateFieldEvent(input)).toThrow("Invalid FieldFeedback 'when' type: number");
    });
  });

  test('no prop - default value is error', () => {
    shallow(
      <FieldFeedback when="*" />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'error', show: true}
    ]);
  });

  test('error prop', () => {
    const wrapper = mount(
      <FieldFeedback when="*" error />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'error', show: true}
    ]);

    expect(wrapper.html()).toEqual('<div data-feedback="0.0" class="error">Suffering from being missing</div>');
  });

  test('warning prop', () => {
    shallow(
      <FieldFeedback when="*" warning />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'warning', show: true}
    ]);
  });

  test('info prop', () => {
    shallow(
      <FieldFeedback when="*" info />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'info', show: true}
    ]);
  });
});

describe('render()', () => {
  test('error', () => {
    const fieldFeedback = mount(
      <FieldFeedback when="*" error />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'error', show: true}
    ]);
    expect(fieldFeedback.html()).toEqual('<div data-feedback="0.0" class="error">Suffering from being missing</div>');
  });

  test('warning', () => {
    const fieldFeedback = mount(
      <FieldFeedback when="*" warning />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'warning', show: true}
    ]);
    expect(fieldFeedback.html()).toEqual('<div data-feedback="0.0" class="warning">Suffering from being missing</div>');
  });

  test('info', () => {
    const fieldFeedback = mount(
      <FieldFeedback when="*" info />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'info', show: true}
    ]);
    expect(fieldFeedback.html()).toEqual('<div data-feedback="0.0" class="info">Suffering from being missing</div>');
  });

  test('no error', () => {
    const fieldFeedback = mount(
      <FieldFeedback when="*" />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valid);

    expect(validations).toEqual([
      {key: '0.0', type: 'error', show: false}
    ]);
    expect(fieldFeedback.html()).toEqual(null);
  });

  test('with children', () => {
    const fieldFeedback = mount(
      <FieldFeedback when="*">message</FieldFeedback>,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'error', show: true}
    ]);
    expect(fieldFeedback.html()).toEqual('<div data-feedback="0.0" class="error">message</div>');
  });

  test('with already existing class', () => {
    const fieldFeedback = mount(
      <FieldFeedback when="*" className="alreadyExistingClassName" />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'error', show: true}
    ]);
    expect(fieldFeedback.html()).toEqual('<div data-feedback="0.0" class="alreadyExistingClassName error">Suffering from being missing</div>');
  });

  test('with div props', () => {
    const fieldFeedback = mount(
      <FieldFeedback when="*" style={{color: 'yellow'}} />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const validations = fieldFeedbacks_username.emitValidateFieldEvent(input_username_valueMissing);

    expect(validations).toEqual([
      {key: '0.0', type: 'error', show: true}
    ]);
    expect(fieldFeedback.html()).toEqual('<div data-feedback="0.0" style="color: yellow;" class="error">Suffering from being missing</div>');
  });

  test('when="valid"', async () => {
    const wrapper = mount(
      <FieldFeedback when="valid">Looks good!</FieldFeedback>,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    );

    const fieldValidationsPromise: any = Promise.resolve({isValid: () => true});
    form_username.emitFieldValidatedEvent({name: 'username'} as any, fieldValidationsPromise);
    await fieldValidationsPromise;
    expect(wrapper.html()).toEqual('<div data-feedback="0.0" class="valid">Looks good!</div>');
  });
});
