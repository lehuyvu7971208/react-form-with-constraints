import React from 'react';
import { shallow as _shallow, mount as _mount } from 'enzyme';

import { FormWithConstraints, fieldWithoutFeedback, FieldFeedback, FieldFeedbackContext, FieldFeedbackProps, ValidateFieldEvent } from './index';
import createFieldFeedbacks from './createFieldFeedbacks';
import InputMock from './InputMock';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

function shallow(node: React.ReactElement<FieldFeedbackProps>, options: {context: FieldFeedbackContext}) {
  return _shallow<FieldFeedbackProps>(node, options);
}

function mount(node: React.ReactElement<FieldFeedbackProps>, options: {context: FieldFeedbackContext}) {
  return _mount<FieldFeedbackProps>(node, options);
}

const initialFieldFeedbackKeyCounter = 1;

let form_username_empty: FormWithConstraints;
let fieldFeedbacks_username: FieldFeedbacks;

beforeEach(() => {
  form_username_empty = new_FormWithConstraints({});
  form_username_empty.fieldsStore.fields = {
    username: fieldWithoutFeedback
  };
  fieldFeedbacks_username = createFieldFeedbacks({for: 'username', stop: 'no'}, form_username_empty, initialFieldFeedbackKeyCounter);
});

describe('constructor()', () => {
  test('key', () => {
    expect(fieldFeedbacks_username.key).toEqual(0);
    expect(fieldFeedbacks_username.fieldFeedbackKeyCounter).toEqual(initialFieldFeedbackKeyCounter);
    const wrapper = shallow(
      <FieldFeedback when="*">message</FieldFeedback>,
      {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const fieldFeedback = wrapper.instance() as FieldFeedback;
    expect(fieldFeedback.key).toEqual(0.1);
    expect(fieldFeedbacks_username.key).toEqual(0);
    expect(fieldFeedbacks_username.fieldFeedbackKeyCounter).toEqual(initialFieldFeedbackKeyCounter + 1);
  });

  test('when="valid"', () => {
    shallow(
      <FieldFeedback when="*">message</FieldFeedback>,
      {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
    );
    // OK, not throwing

    expect(() =>
      shallow(
        <FieldFeedback when="valid" error>message</FieldFeedback>,
        {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
      )
    ).toThrow('Cannot have an attribute (error, warning...) with FieldFeedback when="valid"');

    expect(() =>
      shallow(
        <FieldFeedback when="valid" warning>message</FieldFeedback>,
        {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
      )
    ).toThrow('Cannot have an attribute (error, warning...) with FieldFeedback when="valid"');

    expect(() =>
      shallow(
        <FieldFeedback when="valid" info>message</FieldFeedback>,
        {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
      )
    ).toThrow('Cannot have an attribute (error, warning...) with FieldFeedback when="valid"');
  });
});

test('componentWillMount() componentWillUnmount()', () => {
  const addValidateFieldEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'addValidateFieldEventListener');
  const fieldsStoreAddListenerSpy = jest.spyOn(form_username_empty.fieldsStore, 'addListener');
  const removeValidateFieldEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'removeValidateFieldEventListener');
  const fieldsStoreRemoveListenerSpy = jest.spyOn(form_username_empty.fieldsStore, 'removeListener');

  const wrapper = shallow(
    <FieldFeedback when="*">message</FieldFeedback>,
    {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
  );
  expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(0);
  expect(fieldFeedbacks_username.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toHaveLength(1);
  expect(fieldsStoreAddListenerSpy).toHaveBeenCalledTimes(1);
  expect(fieldsStoreRemoveListenerSpy).toHaveBeenCalledTimes(0);

  wrapper.unmount();
  expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(fieldFeedbacks_username.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toEqual(undefined);
  expect(fieldsStoreAddListenerSpy).toHaveBeenCalledTimes(1);
  expect(fieldsStoreRemoveListenerSpy).toHaveBeenCalledTimes(1);
});

describe('validate()', () => {
  describe('when prop', () => {
    describe('string', () => {
      test('unknown', () => {
        shallow(
          <FieldFeedback when={'unknown' as any} />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set());
      });

      test('not matching', () => {
        shallow(
          <FieldFeedback when="badInput" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set());
      });

      test('*', () => {
        shallow(
          <FieldFeedback when="*" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('badInput', () => {
        shallow(
          <FieldFeedback when="badInput" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, badInput: true}, 'Suffering from bad input');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('patternMismatch', () => {
        shallow(
          <FieldFeedback when="patternMismatch" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, patternMismatch: true}, 'Suffering from a pattern mismatch');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('rangeOverflow', () => {
        shallow(
          <FieldFeedback when="rangeOverflow" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, rangeOverflow: true}, 'Suffering from an overflow');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('rangeUnderflow', () => {
        shallow(
          <FieldFeedback when="rangeUnderflow" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, rangeUnderflow: true}, 'Suffering from an underflow');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('stepMismatch', () => {
        shallow(
          <FieldFeedback when="stepMismatch" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, stepMismatch: true}, 'Suffering from a step mismatch');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('tooLong', () => {
        shallow(
          <FieldFeedback when="tooLong" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, tooLong: true}, 'Suffering from being too long');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('tooShort', () => {
        shallow(
          <FieldFeedback when="tooShort" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, tooShort: true}, 'Suffering from being too short');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('typeMismatch', () => {
        shallow(
          <FieldFeedback when="typeMismatch" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, typeMismatch: true}, 'Suffering from bad input');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('valueMissing', () => {
        shallow(
          <FieldFeedback when="valueMissing" />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });

      test('valid', () => {
        shallow(
          <FieldFeedback when="valid">Looks good!</FieldFeedback>,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );

        let input = new InputMock('username', 'jimmy', {valid: true}, '');
        fieldFeedbacks_username.emitValidateFieldEvent(input);
        expect(form_username_empty.fieldsStore.fields).toEqual({
          username: {
            dirty: true,
            errors: new Set(),
            warnings: new Set(),
            infos: new Set(),
            validationMessage: ''
          }
        });

        input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
        fieldFeedbacks_username.emitValidateFieldEvent(input);
        expect(form_username_empty.fieldsStore.fields).toEqual({
          username: {
            dirty: true,
            errors: new Set(),
            warnings: new Set(),
            infos: new Set(),
            validationMessage: 'Suffering from being missing'
          }
        });
      });
    });

    describe('function', () => {
      test('no error', () => {
        shallow(
          <FieldFeedback when={value => value.length === 0} />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', 'length > 0', {}, '');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set());
      });

      test('error', () => {
        shallow(
          <FieldFeedback when={value => value.length === 0} />,
          {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
        );
        const input = new InputMock('username', '', {}, '');
        fieldFeedbacks_username.emitValidateFieldEvent(input);

        expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set([0.1]));
      });
    });

    test('invalid typeof', () => {
      shallow(
        <FieldFeedback when={2 as any} />,
        {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
      );
      const input = new InputMock('username', '', {}, '');
      expect(() => fieldFeedbacks_username.emitValidateFieldEvent(input)).toThrow(TypeError);
      expect(() => fieldFeedbacks_username.emitValidateFieldEvent(input)).toThrow("Invalid FieldFeedback 'when' type: number");

      expect(form_username_empty.fieldsStore.fields.username!.errors).toEqual(new Set());
    });
  });

  test('error prop - implicit default value', () => {
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    shallow(
      <FieldFeedback when="*" />,
      {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
    );
    fieldFeedbacks_username.emitValidateFieldEvent(input);

    expect(form_username_empty.fieldsStore.fields).toEqual({
      username: {
        dirty: true,
        errors: new Set([0.1]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: 'Suffering from being missing'
      }
    });
  });

  test('error prop', () => {
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    shallow(
      <FieldFeedback when="*" error />,
      {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
    );
    fieldFeedbacks_username.emitValidateFieldEvent(input);

    expect(form_username_empty.fieldsStore.fields).toEqual({
      username: {
        dirty: true,
        errors: new Set([0.1]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: 'Suffering from being missing'
      }
    });
  });

  test('warning prop', () => {
    shallow(
      <FieldFeedback when="*" warning />,
      {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    fieldFeedbacks_username.emitValidateFieldEvent(input);

    expect(form_username_empty.fieldsStore.fields).toEqual({
      username: {
        dirty: true,
        errors: new Set(),
        warnings: new Set([0.1]),
        infos: new Set(),
        validationMessage: 'Suffering from being missing'
      }
    });
  });

  test('info prop', () => {
    shallow(
      <FieldFeedback when="*" info />,
      {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    fieldFeedbacks_username.emitValidateFieldEvent(input);

    expect(form_username_empty.fieldsStore.fields).toEqual({
      username: {
        dirty: true,
        errors: new Set(),
        warnings: new Set(),
        infos: new Set([0.1]),
        validationMessage: 'Suffering from being missing'
      }
    });
  });
});

describe('className()', () => {
  test('error matching', () => {
    const form = new_FormWithConstraints({});
    form.fieldsStore.fields = {
      username: {
        validated: true,
        errors: new Set([0.1]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: ''
      }
    };
    const fieldFeedbacks = createFieldFeedbacks({for: 'username', stop: 'no'}, form, initialFieldFeedbackKeyCounter);

    const wrapper = shallow(
      <FieldFeedback when="*" />,
      {context: {form, fieldFeedbacks}}
    );
    const fieldFeedback = wrapper.instance() as FieldFeedback;

    expect(fieldFeedback.className()).toEqual('error');
  });

  test('warning matching', () => {
    const form = new_FormWithConstraints({});
    form.fieldsStore.fields = {
      username: {
        validated: true,
        errors: new Set(),
        warnings: new Set([0.1]),
        infos: new Set(),
        validationMessage: ''
      }
    };
    const fieldFeedbacks = createFieldFeedbacks({for: 'username', stop: 'no'}, form, initialFieldFeedbackKeyCounter);

    const wrapper = shallow(
      <FieldFeedback when="*" />,
      {context: {form, fieldFeedbacks}}
    );
    const fieldFeedback = wrapper.instance() as FieldFeedback;

    expect(fieldFeedback.className()).toEqual('warning');
  });

  test('info matching', () => {
    const form = new_FormWithConstraints({});
    form.fieldsStore.fields = {
      username: {
        validated: true,
        errors: new Set(),
        warnings: new Set(),
        infos: new Set([0.1]),
        validationMessage: ''
      }
    };
    const fieldFeedbacks = createFieldFeedbacks({for: 'username', stop: 'no'}, form, initialFieldFeedbackKeyCounter);

    const wrapper = shallow(
      <FieldFeedback when="*" />,
      {context: {form, fieldFeedbacks}}
    );
    const fieldFeedback = wrapper.instance() as FieldFeedback;

    expect(fieldFeedback.className()).toEqual('info');
  });

  test('not matching', () => {
    const form = new_FormWithConstraints({});
    form.fieldsStore.fields = {
      username: {
        validated: false,
        errors: new Set(),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: ''
      }
    };
    const fieldFeedbacks = createFieldFeedbacks({for: 'username', stop: 'no'}, form, initialFieldFeedbackKeyCounter);

    const wrapper = shallow(
      <FieldFeedback when="*" />,
      {context: {form, fieldFeedbacks}}
    );
    const fieldFeedback = wrapper.instance() as FieldFeedback;

    expect(fieldFeedback.className()).toEqual(undefined);
  });
});

describe('render()', () => {
  test('with children', () => {
    const form = new_FormWithConstraints({});
    form.fieldsStore.fields = {
      username: {
        validated: true,
        errors: new Set([0.1]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: 'Suffering from being missing'
      }
    };
    const fieldFeedbacks = createFieldFeedbacks({for: 'username', stop: 'no'}, form, initialFieldFeedbackKeyCounter);

    const fieldFeedback = shallow(
      <FieldFeedback when="*">message</FieldFeedback>,
      {context: {form, fieldFeedbacks}}
    );

    expect(fieldFeedback.html()).toEqual('<div data-field-feedback-key="0.1" class="error">message</div>');
  });

  test('without children', () => {
    const form = new_FormWithConstraints({});
    form.fieldsStore.fields = {
      username: {
        validated: true,
        errors: new Set([0.1]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: 'Suffering from being missing'
      }
    };
    const fieldFeedbacks = createFieldFeedbacks({for: 'username', stop: 'no'}, form, initialFieldFeedbackKeyCounter);

    const fieldFeedback = shallow(
      <FieldFeedback when="*" />,
      {context: {form, fieldFeedbacks}}
    );

    expect(fieldFeedback.html()).toEqual('<div data-field-feedback-key="0.1" class="error">Suffering from being missing</div>');
  });

  test('with already existing class', () => {
    const form = new_FormWithConstraints({});
    form.fieldsStore.fields = {
      username: {
        validated: true,
        errors: new Set([0.1]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: ''
      }
    };
    const fieldFeedbacks = createFieldFeedbacks({for: 'username', stop: 'no'}, form, initialFieldFeedbackKeyCounter);

    const fieldFeedback = shallow(
      <FieldFeedback when="*" className="alreadyExistingClassName" />,
      {context: {form, fieldFeedbacks}}
    );

    expect(fieldFeedback.html()).toEqual('<div data-field-feedback-key="0.1" class="alreadyExistingClassName error"></div>');
  });

  test('with already existing class - no error', () => {
    const form = new_FormWithConstraints({});
    form.fieldsStore.fields = {
      username: {
        validated: true,
        errors: new Set(),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: ''
      }
    };
    const fieldFeedbacks = createFieldFeedbacks({for: 'username', stop: 'no'}, form, initialFieldFeedbackKeyCounter);

    const fieldFeedback = shallow(
      <FieldFeedback when="*" className="alreadyExistingClassName" />,
      {context: {form, fieldFeedbacks}}
    );

    expect(fieldFeedback.html()).toEqual(null);
  });

  test('with divProps', () => {
    const form = new_FormWithConstraints({});
    form.fieldsStore.fields = {
      username: {
        validated: true,
        errors: new Set([0.1]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: ''
      }
    };
    const fieldFeedbacks = createFieldFeedbacks({for: 'username', stop: 'no'}, form, initialFieldFeedbackKeyCounter);

    const fieldFeedback = shallow(
      <FieldFeedback when="*" style={{color: 'yellow'}} />,
      {context: {form, fieldFeedbacks}}
    );

    expect(fieldFeedback.html()).toEqual('<div data-field-feedback-key="0.1" style="color:yellow" class="error"></div>');
  });

  test('when="valid"', async () => {
    const wrapper = mount(
      <FieldFeedback when="valid">Looks good!</FieldFeedback>,
      {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
    );

    const fieldValidationsPromise: any = Promise.resolve({isValid: () => true});
    form_username_empty.emitFieldValidatedEvent({name: 'username'} as any, fieldValidationsPromise);
    await fieldValidationsPromise;
    expect(wrapper.html()).toEqual('<div class="valid">Looks good!</div>');
  });
});

describe('reRender()', () => {
  test('known field updated', () => {
    const wrapper = mount(
      <FieldFeedback when="*" />,
      {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    fieldFeedbacks_username.emitValidateFieldEvent(input);

    expect(form_username_empty.fieldsStore.fields).toEqual({
      username: {
        dirty: true,
        errors: new Set([0.1]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: 'Suffering from being missing'
      }
    });
    expect(wrapper.html()).toEqual(
      '<div data-field-feedback-key="0.1" class="error">Suffering from being missing</div>'
    );

    form_username_empty.fieldsStore.updateField('username', fieldWithoutFeedback);
    expect(wrapper.html()).toEqual(null);
  });

  test('unknown field updated', () => {
    const wrapper = mount(
      <FieldFeedback when="*" />,
      {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
    );
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    fieldFeedbacks_username.emitValidateFieldEvent(input);

    expect(form_username_empty.fieldsStore.fields).toEqual({
      username: {
        dirty: true,
        errors: new Set([0.1]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: 'Suffering from being missing'
      }
    });
    expect(wrapper.html()).toEqual(
      '<div data-field-feedback-key="0.1" class="error">Suffering from being missing</div>'
    );

    const assert = console.assert;
    console.assert = jest.fn();
    form_username_empty.fieldsStore.updateField('unknown', fieldWithoutFeedback);
    expect(console.assert).toHaveBeenCalledTimes(2);
    expect((console.assert as jest.Mock<{}>).mock.calls).toEqual([
      [ false, "Unknown field 'unknown'" ],
      [ true, "No listener for event 'FIELD_UPDATED'" ]
    ]);
    console.assert = assert;

    expect(wrapper.html()).toEqual(
      '<div data-field-feedback-key="0.1" class="error">Suffering from being missing</div>'
    );
  });
});
