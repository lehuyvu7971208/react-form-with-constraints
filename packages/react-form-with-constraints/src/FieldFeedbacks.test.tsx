import React from 'react';
import { mount as _mount, shallow as _shallow } from 'enzyme';

import { FormWithConstraintsChildContext, fieldWithoutFeedback, FieldFeedback, FieldFeedbackType, FieldFeedbacksProps, ValidateFieldEvent } from './index';
import InputMock from './InputMock';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

function shallow(node: React.ReactElement<FieldFeedbacksProps>, options: {context: FormWithConstraintsChildContext}) {
  return _shallow<FieldFeedbacksProps>(node, options);
}
function mount(node: React.ReactElement<FieldFeedbacksProps>, options: {context: FormWithConstraintsChildContext}) {
  return _mount<FieldFeedbacksProps>(node, options);
}

test('constructor()', () => {
  const wrapper = shallow(
    <FieldFeedbacks for="username" />,
    {context: {form: new_FormWithConstraints({})}}
  );
  const fieldFeedbacks = wrapper.instance() as FieldFeedbacks;
  expect(fieldFeedbacks.key).toEqual(0);
});

test('computeFieldFeedbackKey()', () => {
  const wrapper = shallow(
    <FieldFeedbacks for="username" />,
    {context: {form: new_FormWithConstraints({})}}
  );
  const fieldFeedbacks = wrapper.instance() as FieldFeedbacks;
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.0');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.1');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.2');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.3');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.4');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.5');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.6');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.7');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.8');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.9');
  expect(fieldFeedbacks.computeFieldFeedbackKey()).toEqual('0.10');
});

describe('componentWillMount()', () => {
  test('initialize FieldsStore', () => {
    const form = new_FormWithConstraints({});
    expect(form.fieldsStore.fields).toEqual({});

    const wrapper = shallow(
      <FieldFeedbacks for="username" />,
      {context: {form}}
    );
    expect(form.fieldsStore.fields).toEqual({
      username: fieldWithoutFeedback
    });

    wrapper.unmount();
    expect(form.fieldsStore.fields).toEqual({});
  });

  test('componentWillUnmount()', () => {
    const form = new_FormWithConstraints({});
    const addValidateFieldEventListenerSpy = jest.spyOn(form, 'addValidateFieldEventListener');
    const removeValidateFieldEventListenerSpy = jest.spyOn(form, 'removeValidateFieldEventListener');

    const wrapper = shallow(
      <FieldFeedbacks for="username" />,
      {context: {form}}
    );
    expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
    expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(0);
    expect(form.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toHaveLength(1);

    wrapper.unmount();
    expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
    expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
    expect(form.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toEqual(undefined);
  });
});

describe('validate()', () => {
  test.only('known input name - emitValidateFieldEvent', async () => {
    const form = new_FormWithConstraints({});
    const fieldFeedbacks = shallow(
      <FieldFeedbacks for="username">
        <FieldFeedback when="*" />
      </FieldFeedbacks>,
      {context: {form}}
    ).instance() as FieldFeedbacks;
    const emitValidateFieldEventSpy = jest.spyOn(fieldFeedbacks, 'emitValidateFieldEvent');

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: []
    }]);
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(1);
    expect(emitValidateFieldEventSpy).toHaveBeenLastCalledWith(input);
  });

  test.only('known input name', async () => {
    const form = new_FormWithConstraints({});
    mount(
      <FieldFeedbacks for="username">
        <FieldFeedback when="*" />
      </FieldFeedbacks>,
      {context: {form}}
    );
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: [
        {key: '0.0', type: FieldFeedbackType.Error, show: true}
      ]
    }]);

    expect(form.fieldsStore.fields).toEqual({
      username: {
        validateEventEmitted: true
      }
    });
  });

  test.only('unknown input name', async () => {
    const form = new_FormWithConstraints({});
    const fieldFeedbacks = shallow(
      <FieldFeedbacks for="username">
        <FieldFeedback when="*" />
      </FieldFeedbacks>,
      {context: {form}}
    ).instance() as FieldFeedbacks;
    const emitValidateFieldEventSpy = jest.spyOn(fieldFeedbacks, 'emitValidateFieldEvent');

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    const input = new InputMock('unknown', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([]);
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);

    expect(form.fieldsStore.fields).toEqual({
      username: fieldWithoutFeedback
    });
  });

  test.only('remove', async () => {
    const form = new_FormWithConstraints({});
    shallow(
      <FieldFeedbacks for="username" />,
      {context: {form}}
    );
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      isValid: expect.any(Function),
      fieldFeedbackValidations: []
    }]);

    expect(form.fieldsStore.fields).toEqual({
      username: {
        dirty: true,
        errors: new Set([1.1]),
        warnings: new Set([1.1]),
        infos: new Set([1.1]),
        validationMessage: 'Suffering from being missing'
      }
    });
  });
});

describe('render()', () => {
  test('without children', () => {
    const form = new_FormWithConstraints({});
    const wrapper = mount(
      <FieldFeedbacks for="username" />,
      {context: {form}}
    );

    expect(wrapper.html()).toEqual(
      '<div></div>'
    );
  });

  test('children', async () => {
    const form = new_FormWithConstraints({});
    const wrapper = mount(
      <FieldFeedbacks for="username">
        <FieldFeedback when="*" />
      </FieldFeedbacks>,
      {context: {form}}
    );
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: [{
        key: '0.0',
        show: true
      }]
    }]);

    expect(form.fieldsStore.fields).toEqual({
      username: {
        dirty: true,
        errors: new Set([0.0]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: 'Suffering from being missing'
      }
    });
    expect(wrapper.html()).toEqual(
      '<div><div data-field-feedback-key="0" class="error">Suffering from being missing</div></div>'
    );
  });

  test('children with <div> inside hierarchy', async () => {
    const form = new_FormWithConstraints({});
    const wrapper = mount(
      <FieldFeedbacks for="username">
        <div>
          <FieldFeedback when="*" />
        </div>
      </FieldFeedbacks>,
      {context: {form}}
    );
    const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: [{
        key: '0.0',
        show: true
      }]
    }]);

    expect(form.fieldsStore.fields).toEqual({
      username: {
        dirty: true,
        errors: new Set([0.0]),
        warnings: new Set(),
        infos: new Set(),
        validationMessage: 'Suffering from being missing'
      }
    });
    expect(wrapper.html()).toEqual(
      '<div><div><div data-field-feedback-key="0" class="error">Suffering from being missing</div></div></div>'
    );
  });

  test('unknown input name', async () => {
    const form = new_FormWithConstraints({});
    const wrapper = mount(
      <FieldFeedbacks for="username">
        <FieldFeedback when="*" />
      </FieldFeedbacks>,
      {context: {form}}
    );
    const input = new InputMock('unknown', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'unknown',
      fieldFeedbackValidations: []
    }]);

    expect(form.fieldsStore.fields).toEqual({
      username: fieldWithoutFeedback
    });
    expect(wrapper.html()).toEqual(
      '<div></div>'
    );
  });

  describe('stop prop', () => {
    test('stop="no" multiple FieldFeedback', async () => {
      const form = new_FormWithConstraints({});
      const wrapper = mount(
        <FieldFeedbacks for="username" stop="no">
          <FieldFeedback when="*" />
          <FieldFeedback when="*" />
          <FieldFeedback when="*" />
        </FieldFeedbacks>,
        {context: {form}}
      );
      const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
      const fieldFeedbackValidations = await form.validateFields(input);
      expect(fieldFeedbackValidations).toEqual([{
        fieldName: 'username',
        fieldFeedbackValidations: [
          {key: '0.0', show: true},
          {key: '0.1', show: true},
          {key: '0.2', show: true}
        ]
      }]);

      expect(form.fieldsStore.fields).toEqual({
        username: {
          dirty: true,
          errors: new Set([0.0, 0.1, 0.2]),
          warnings: new Set(),
          infos: new Set(),
          validationMessage: 'Suffering from being missing'
        }
      });

      expect(wrapper.html()).toEqual(
        '<div>' +
        '<div data-field-feedback-key="0" class="error">Suffering from being missing</div>' +
        '<div data-field-feedback-key="0.1" class="error">Suffering from being missing</div>' +
        '<div data-field-feedback-key="0.2" class="error">Suffering from being missing</div>' +
        '</div>'
      );
    });

    test('stop="first-error" multiple FieldFeedback', async () => {
      const form = new_FormWithConstraints({});
      const wrapper = mount(
        <FieldFeedbacks for="username" stop="first-error">
          <FieldFeedback when="*" />
          <FieldFeedback when="*" />
          <FieldFeedback when="*" />
        </FieldFeedbacks>,
        {context: {form}}
      );
      const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
      const fieldFeedbackValidations = await form.validateFields(input);
      expect(fieldFeedbackValidations).toEqual([{
        fieldName: 'username',
        fieldFeedbackValidations: [
          {key: '0.0', show: true},
          {key: '0.1', show: undefined},
          {key: '0.2', show: undefined}
        ]
      }]);

      expect(form.fieldsStore.fields).toEqual({
        username: {
          dirty: true,
          errors: new Set([0.0]),
          warnings: new Set(),
          infos: new Set(),
          validationMessage: 'Suffering from being missing'
        }
      });

      expect(wrapper.html()).toEqual(
        '<div><div data-field-feedback-key="0" class="error">Suffering from being missing</div></div>'
      );
    });

    test('stop="first-error" multiple FieldFeedback with error, warning, info', async () => {
      const form = new_FormWithConstraints({});
      const wrapper = mount(
        <FieldFeedbacks for="username" stop="first-error">
          <FieldFeedback when="*" warning />
          <FieldFeedback when="*" error />
          <FieldFeedback when="*" info />
        </FieldFeedbacks>,
        {context: {form}}
      );
      const input = new InputMock('username', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
      const fieldFeedbackValidations = await form.validateFields(input);
      expect(fieldFeedbackValidations).toEqual([{
        fieldName: 'username',
        fieldFeedbackValidations: [
          {key: '0.0', type: FieldFeedbackType.Error, show: false},
          {key: '0.1', type: FieldFeedbackType.Error, show: true},
          {key: '0.2', type: FieldFeedbackType.Error, show: undefined}
        ]
      }]);

      expect(form.fieldsStore.fields).toEqual({
        username: {
          dirty: true,
          errors: new Set([0.1]),
          warnings: new Set([0.0]),
          infos: new Set(),
          validationMessage: 'Suffering from being missing'
        }
      });

      expect(wrapper.html()).toEqual(
        '<div><div data-field-feedback-key="0" class="warning">Suffering from being missing</div><div data-field-feedback-key="0.1" class="error">Suffering from being missing</div></div>'
      );
    });
  });
});
