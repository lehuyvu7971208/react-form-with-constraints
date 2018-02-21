import React from 'react';
import { mount as _mount, shallow as _shallow } from 'enzyme';

import { FormWithConstraintsChildContext, FieldFeedback, FieldFeedbacksProps, ValidateFieldEvent } from './index';
import { InputMock, input_username_valueMissing, input_username_valid } from './InputMock';
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
      username: {validateEventEmitted: false}
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
  test('known input name', async () => {
    const form = new_FormWithConstraints({});
    const fieldFeedbacks = shallow(
      <FieldFeedbacks for="username">
        <FieldFeedback when="*" />
      </FieldFeedbacks>,
      {context: {form}}
    ).instance() as FieldFeedbacks;
    const emitValidateFieldEventSpy = jest.spyOn(fieldFeedbacks, 'emitValidateFieldEvent');

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    const fieldFeedbackValidations = await form.validateFields(input_username_valid);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: []
    }]);
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(1);
    expect(emitValidateFieldEventSpy).toHaveBeenLastCalledWith(input_username_valid);

    expect(form.fieldsStore.fields).toEqual({
      username: {validateEventEmitted: true}
    });
  });

  test('known input name - mount', async () => {
    const form = new_FormWithConstraints({});
    mount(
      <FieldFeedbacks for="username">
        <FieldFeedback when="*" />
      </FieldFeedbacks>,
      {context: {form}}
    );
    const fieldFeedbackValidations = await form.validateFields(input_username_valid);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: [
        {key: '0.0', type: 'error', show: false}
      ]
    }]);

    expect(form.fieldsStore.fields).toEqual({
      username: {validateEventEmitted: true}
    });
  });

  test('unknown input name - emitValidateFieldEvent', async () => {
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
      username: {validateEventEmitted: false}
    });
  });

  test('unknown input name - mount', async () => {
    const form = new_FormWithConstraints({});
    mount(
      <FieldFeedbacks for="username">
        <FieldFeedback when="*" />
      </FieldFeedbacks>,
      {context: {form}}
    );
    const input = new InputMock('unknown', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([]);

    expect(form.fieldsStore.fields).toEqual({
      username: {validateEventEmitted: false}
    });
  });

  // FIXME What is this?
  test('remove', async () => {
    const form = new_FormWithConstraints({});
    shallow(
      <FieldFeedbacks for="username" />,
      {context: {form}}
    );
    const fieldFeedbackValidations = await form.validateFields(input_username_valid);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: []
    }]);

    expect(form.fieldsStore.fields).toEqual({
      username: {validateEventEmitted: true}
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
    const fieldFeedbackValidations = await form.validateFields(input_username_valueMissing);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: [
        {key: '0.0', type: 'error', show: true}
      ]
    }]);

    expect(wrapper.html()).toEqual(
      '<div><div data-field-feedback-key="0.0" class="error">Suffering from being missing</div></div>'
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
    const fieldFeedbackValidations = await form.validateFields(input_username_valueMissing);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: [
        {key: '0.0', type: 'error', show: true}
      ]
    }]);

    expect(wrapper.html()).toEqual(
      '<div><div><div data-field-feedback-key="0.0" class="error">Suffering from being missing</div></div></div>'
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
    expect(fieldFeedbackValidations).toEqual([]);

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
      const fieldFeedbackValidations = await form.validateFields(input_username_valueMissing);
      expect(fieldFeedbackValidations).toEqual([{
        fieldName: 'username',
        fieldFeedbackValidations: [
          {key: '0.0', type: 'error', show: true},
          {key: '0.1', type: 'error', show: true},
          {key: '0.2', type: 'error', show: true}
        ]
      }]);

      expect(wrapper.html()).toEqual(
        '<div>' +
        '<div data-field-feedback-key="0.0" class="error">Suffering from being missing</div>' +
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
      const fieldFeedbackValidations = await form.validateFields(input_username_valueMissing);
      expect(fieldFeedbackValidations).toEqual([{
        fieldName: 'username',
        fieldFeedbackValidations: [
          {key: '0.0', type: 'error', show: true},
          {key: '0.1', type: 'error', show: undefined},
          {key: '0.2', type: 'error', show: undefined}
        ]
      }]);

      expect(wrapper.html()).toEqual(
        '<div><div data-field-feedback-key="0.0" class="error">Suffering from being missing</div></div>'
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
      const fieldFeedbackValidations = await form.validateFields(input_username_valueMissing);
      expect(fieldFeedbackValidations).toEqual([{
        fieldName: 'username',
        fieldFeedbackValidations: [
          {key: '0.0', type: 'warning', show: true},
          {key: '0.1', type: 'error', show: true},
          {key: '0.2', type: 'info', show: undefined}
        ]
      }]);

      expect(wrapper.html()).toEqual(
        '<div><div data-field-feedback-key="0.0" class="warning">Suffering from being missing</div><div data-field-feedback-key="0.1" class="error">Suffering from being missing</div></div>'
      );
    });
  });
});
