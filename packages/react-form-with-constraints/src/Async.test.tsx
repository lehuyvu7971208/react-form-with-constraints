import React from 'react';
import { shallow as _shallow, mount as _mount } from 'enzyme';

import { FormWithConstraints, Async, AsyncProps, AsyncContext, Status, fieldWithoutFeedback, FieldFeedback, FieldFeedbacksContext, ValidateFieldEvent, ResetEvent, FieldFeedbackType } from './index';
import checkUsernameAvailability from './checkUsernameAvailability';
import { InputMock, input_username_valid } from './InputMock';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

function shallow(node: React.ReactElement<AsyncProps<any>>, options: {context: AsyncContext}) {
  return _shallow<AsyncProps<any>>(node, options);
}

function mount(node: React.ReactElement<FieldFeedbacks>, options: {context: FieldFeedbacksContext}) {
  return _mount<FieldFeedbacks>(node, options);
}

let form_username: FormWithConstraints;
let fieldFeedbacks_username: FieldFeedbacks;

beforeEach(() => {
  form_username = new_FormWithConstraints({});
  form_username.fieldsStore.fields = {
    username: fieldWithoutFeedback
  };
  fieldFeedbacks_username = new FieldFeedbacks({for: 'username', stop: 'no'}, {form: form_username});
});

test('constructor()', () => {
  const wrapper = shallow(
    <Async promise={checkUsernameAvailability} />,
    {context: {fieldFeedbacks: fieldFeedbacks_username}}
  );
  const async = wrapper.instance() as Async<boolean>;
  expect(async.state).toEqual({status: Status.None});
});

test('componentWillMount() componentWillUnmount()', () => {
  const addValidateFieldEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'addValidateFieldEventListener');
  const addResetEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'addResetEventListener');
  const removeValidateFieldEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'removeValidateFieldEventListener');
  const removeResetEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'removeResetEventListener');

  const wrapper = shallow(
    <Async promise={checkUsernameAvailability} />,
    {context: {fieldFeedbacks: fieldFeedbacks_username}}
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
  test('known input name - emitValidateFieldEvent', async () => {
    const async = shallow(
      <Async promise={checkUsernameAvailability} />,
      {context: {fieldFeedbacks: fieldFeedbacks_username}}
    ).instance() as Async<boolean>;

    const emitValidateFieldEventSpy = jest.spyOn(async, 'emitValidateFieldEvent');

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    const input = input_username_valid;
    const validations = await fieldFeedbacks_username.emitValidateFieldEvent(input);

    expect(validations).toEqual([Promise.resolve({})]);
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(1);
    expect(emitValidateFieldEventSpy).toHaveBeenLastCalledWith(input);
  });

  test('unknown input name - emitValidateFieldEvent', async () => {
    const async = shallow(
      <Async promise={checkUsernameAvailability} />,
      {context: {fieldFeedbacks: fieldFeedbacks_username}}
    ).instance() as Async<boolean>;

    const emitValidateFieldEventSpy = jest.spyOn(async, 'emitValidateFieldEvent');

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    const input = new InputMock('unknown', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const validations = await form_username.validateFields(input);
    expect(validations).toEqual([]);
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
  });
});

describe('render()', () => {
  test('then()', async () => {
    const wrapper = mount(
      <FieldFeedbacks for="username">
        <Async
          promise={checkUsernameAvailability}
          pending={'Pending...'}
          then={availability => availability.available ?
            <FieldFeedback info>Username '{availability.value}' available</FieldFeedback> :
            <FieldFeedback>Username '{availability.value}' already taken, choose another</FieldFeedback>
          }
          catch={e => <FieldFeedback>{e.message}</FieldFeedback>}
        />
      </FieldFeedbacks>,
      {context: {form: form_username}}
    );
    expect(wrapper.html()).toEqual('<div></div>');

    const input = input_username_valid;
    let fieldFeedbackValidationsPromise = form_username.validateFields(input);
    expect(wrapper.html()).toEqual('<div>Pending...</div>');

    let fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: [
        {key: '1.0', type: FieldFeedbackType.Info, show: true}
      ]
    }]);
    expect(wrapper.html()).toEqual(`<div><div data-field-feedback-key="1.0" class="info">Username 'jimmy' available</div></div>`);

    input.value = 'john';
    fieldFeedbackValidationsPromise = form_username.validateFields(input);
    expect(wrapper.html()).toEqual('<div>Pending...</div>');

    fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: [
        {key: '1.1', type: FieldFeedbackType.Error, show: true}
      ]
    }]);
    expect(wrapper.html()).toEqual(`<div><div data-field-feedback-key="1.1" class="error">Username 'john' already taken, choose another</div></div>`);
  });

  test('catch()', async () => {
    const wrapper = mount(
      <FieldFeedbacks for="username">
        <Async
          promise={checkUsernameAvailability}
          pending={'Pending...'}
          then={availability => availability.available ? `Username '${availability.value}' available` : `Username '${availability.value}' already taken, choose another`}
          catch={e => <FieldFeedback>{e.message}</FieldFeedback>}
        />
      </FieldFeedbacks>,
      {context: {form: form_username}}
    );
    expect(wrapper.html()).toEqual('<div></div>');

    const input = new InputMock('username', 'error', {valid: true}, '');
    const fieldFeedbackValidationsPromise = form_username.validateFields(input);
    expect(wrapper.html()).toEqual('<div>Pending...</div>');

    const fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: [
        {key: '1.0', type: FieldFeedbackType.Error, show: true}
      ]
    }]);
    expect(wrapper.html()).toEqual(`<div><div data-field-feedback-key="1.0" class="error">Something wrong with username 'error'</div></div>`);
  });

  test('no catch()', async () => {
    const wrapper = mount(
      <FieldFeedbacks for="username">
        <Async
          promise={checkUsernameAvailability}
          pending={'Pending...'}
          then={availability => availability.available ? `Username '${availability.value}' available` : `Username '${availability.value}' already taken, choose another`}
        />
      </FieldFeedbacks>,
      {context: {form: form_username}}
    );
    expect(wrapper.html()).toEqual('<div></div>');

    const input = new InputMock('username', 'error', {valid: true}, '');
    const fieldFeedbackValidationsPromise = form_username.validateFields(input);
    expect(wrapper.html()).toEqual('<div>Pending...</div>');

    const fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      fieldFeedbackValidations: []
    }]);
    expect(wrapper.html()).toEqual('<div></div>');
  });
});
