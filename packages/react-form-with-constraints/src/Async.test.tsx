import React from 'react';
import { shallow as _shallow, mount as _mount } from 'enzyme';

import { FormWithConstraints, Async, AsyncProps, AsyncContext, Status, FieldFeedback, FieldFeedbacksContext, ValidateFieldEvent } from './index';
import createFieldFeedbacks from './createFieldFeedbacks';
import checkUsernameAvailability from './checkUsernameAvailability';
import InputMock from './InputMock';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

function shallow(node: React.ReactElement<AsyncProps<any>>, options: {context: AsyncContext}) {
  return _shallow<AsyncProps<any>>(node, options);
}

function mount(node: React.ReactElement<FieldFeedbacks>, options: {context: FieldFeedbacksContext}) {
  return _mount<FieldFeedbacks>(node, options);
}

let form: FormWithConstraints;

function createFieldFeedbacks_username() {
  const initialFieldFeedbackKeyCounter = 1;
  return createFieldFeedbacks({for: 'username'}, form, initialFieldFeedbackKeyCounter);
}

beforeEach(() => {
  form = new_FormWithConstraints({});
});

test('constructor()', () => {
  const wrapper = shallow(
    <Async promise={checkUsernameAvailability} />,
    {context: {form, fieldFeedbacks: createFieldFeedbacks_username()}}
  );
  const async = wrapper.instance() as Async<boolean>;
  expect(async.state).toEqual({status: Status.None});
});

test('componentWillMount() componentWillUnmount()', () => {
  const addValidateFieldEventListenerSpy = jest.spyOn(form, 'addValidateFieldEventListener');
  const removeValidateFieldEventListenerSpy = jest.spyOn(form, 'removeValidateFieldEventListener');

  const wrapper = shallow(
    <Async promise={checkUsernameAvailability} />,
    {context: {form, fieldFeedbacks: createFieldFeedbacks_username()}}
  );
  expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(0);
  expect(form.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toHaveLength(1);

  wrapper.unmount();
  expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(form.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toEqual(undefined);
});

describe('validate()', () => {
  test('known input name - emitValidateFieldEvent', async () => {
    const async = shallow(
      <Async promise={checkUsernameAvailability} />,
      {context: {form, fieldFeedbacks: createFieldFeedbacks_username()}}
    ).instance() as Async<boolean>;

    const emitValidateFieldEventSpy = jest.spyOn(async, 'emitValidateFieldEvent');

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    const input = new InputMock('username', 'jimmy', {valid: true}, '');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      isValid: expect.any(Function),
      fieldFeedbackValidations: []
    }]);
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(1);
    expect(emitValidateFieldEventSpy).toHaveBeenLastCalledWith(input);
  });

  test('unknown input name - emitValidateFieldEvent', async () => {
    const async = shallow(
      <Async promise={checkUsernameAvailability} />,
      {context: {form, fieldFeedbacks: createFieldFeedbacks_username()}}
    ).instance() as Async<boolean>;

    const emitValidateFieldEventSpy = jest.spyOn(async, 'emitValidateFieldEvent');

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    const input = new InputMock('unknown', '', {valid: false, valueMissing: true}, 'Suffering from being missing');
    const fieldFeedbackValidations = await form.validateFields(input);
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'unknown',
      isValid: expect.any(Function),
      fieldFeedbackValidations: []
    }]);
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
      {context: {form}}
    );
    wrapper.update();
    expect(wrapper.html()).toEqual('<div></div>');

    const input = new InputMock('username', 'jimmy', {valid: true}, '');
    let fieldFeedbackValidationsPromise = form.validateFields(input);
    wrapper.update();
    expect(wrapper.html()).toEqual('<div>Pending...</div>');

    let fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      isValid: expect.any(Function),
      fieldFeedbackValidations: [{key: 0.0, isValid: true}]
    }]);
    wrapper.update();
    expect(wrapper.html()).toEqual(`<div><div data-field-feedback-key="0" class="info">Username 'jimmy' available</div></div>`);

    input.value = 'john';
    fieldFeedbackValidationsPromise = form.validateFields(input);
    wrapper.update();
    expect(wrapper.html()).toEqual('<div>Pending...</div>');

    fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      isValid: expect.any(Function),
      fieldFeedbackValidations: [{key: 0.1, isValid: false}]
    }]);
    wrapper.update();
    expect(wrapper.html()).toEqual(`<div><div data-field-feedback-key="0.1" class="error">Username 'john' already taken, choose another</div></div>`);
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
      {context: {form}}
    );
    wrapper.update();
    expect(wrapper.html()).toEqual('<div></div>');

    const input = new InputMock('username', 'error', {valid: true}, '');
    const fieldFeedbackValidationsPromise = form.validateFields(input);
    wrapper.update();
    expect(wrapper.html()).toEqual('<div>Pending...</div>');

    const fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      isValid: expect.any(Function),
      fieldFeedbackValidations: [{key: 0.0, isValid: false}]
    }]);
    wrapper.update();
    expect(wrapper.html()).toEqual(`<div><div data-field-feedback-key="0" class="error">Something wrong with username 'error'</div></div>`);
  });

  test('no catch()', async () => {
    const wrapper = shallow(
      <Async
        promise={checkUsernameAvailability}
        pending={'Pending...'}
        then={availability => availability.available ? `Username '${availability.value}' available` : `Username '${availability.value}' already taken, choose another`}
      />,
      {context: {form, fieldFeedbacks: createFieldFeedbacks_username()}}
    );
    wrapper.update();
    expect(wrapper.html()).toEqual(null);

    const input = new InputMock('username', 'error', {valid: true}, '');
    const fieldFeedbackValidationsPromise = form.validateFields(input);
    wrapper.update();
    expect(wrapper.text()).toEqual('Pending...');

    const fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([{
      fieldName: 'username',
      isValid: expect.any(Function),
      fieldFeedbackValidations: []
    }]);
    wrapper.update();
    expect(wrapper.html()).toEqual(null);
  });
});
