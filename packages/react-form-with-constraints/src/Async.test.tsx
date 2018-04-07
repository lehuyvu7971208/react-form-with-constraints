import React from 'react';
import { shallow as _shallow, mount as _mount } from 'enzyme';

import {
  FormWithConstraints, FieldFeedbacksProps, Async, AsyncProps, AsyncContext, Status,
  FieldFeedback, FieldFeedbacksContext, ValidateFieldEvent, ResetEvent
} from './index';
import checkUsernameAvailability from './checkUsernameAvailability';
import { InputMock, input_unknown_valueMissing, input_username_valid, input_username_error_valid } from './InputMock';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

function shallow(node: React.ReactElement<AsyncProps<any>>, options: {context: AsyncContext}) {
  return _shallow<AsyncProps<any>>(node, options);
}

function mount(node: React.ReactElement<FieldFeedbacksProps>, options: {context: FieldFeedbacksContext}) {
  return _mount<FieldFeedbacksProps>(node, options);
}

let form_username: FormWithConstraints;
let fieldFeedbacks_username: FieldFeedbacks;

beforeEach(() => {
  form_username = new_FormWithConstraints({});
  form_username.fieldsStore.addField('username');
  fieldFeedbacks_username = new FieldFeedbacks({for: 'username', stop: 'no'}, {form: form_username});
});

test('constructor()', () => {
  const wrapper = shallow(
    <Async promise={checkUsernameAvailability} />,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );
  const async = wrapper.instance() as Async<boolean>;
  expect(async.state).toEqual({status: Status.None});
});

test('componentWillMount() componentWillUnmount()', () => {
  const addValidateFieldEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'addValidateFieldEventListener');
  const removeValidateFieldEventListenerSpy = jest.spyOn(fieldFeedbacks_username, 'removeValidateFieldEventListener');

  const wrapper = shallow(
    <Async promise={checkUsernameAvailability} />,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );
  expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(0);
  expect(fieldFeedbacks_username.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toHaveLength(1);

  wrapper.unmount();
  expect(addValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeValidateFieldEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(fieldFeedbacks_username.validateFieldEventEmitter.listeners.get(ValidateFieldEvent)).toEqual(undefined);
});

describe('validate()', () => {
  test('known input name - emitValidateFieldEvent', async () => {
    const wrapper = shallow(
      <Async promise={checkUsernameAvailability} />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    ).instance() as Async<boolean>;

    const emitValidateFieldEventSpy = jest.spyOn(wrapper, 'emitValidateFieldEvent');

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    const validations = await fieldFeedbacks_username.emitValidateFieldEvent(input_username_valid);

    expect(validations).toEqual([[]]); // FIXME
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(1);
    expect(emitValidateFieldEventSpy).toHaveBeenLastCalledWith(input_username_valid);
  });

  test('unknown input name - emitValidateFieldEvent', async () => {
    const wrapper = shallow(
      <Async promise={checkUsernameAvailability} />,
      {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
    ).instance() as Async<boolean>;

    const emitValidateFieldEventSpy = jest.spyOn(wrapper, 'emitValidateFieldEvent');

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    const validations = await form_username.validateFields(input_unknown_valueMissing);
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
    expect(wrapper.html()).toEqual('<div data-feedbacks="1"></div>');

    const input = {...input_username_valid};
    let fieldFeedbackValidationsPromise = form_username.validateFields(input);
    expect(wrapper.html()).toEqual('<div data-feedbacks="1">Pending...</div>');

    let fields = await fieldFeedbackValidationsPromise;
    expect(fields).toEqual([
      {
        name: 'username',
        validations: [
          {key: '1.0', type: 'info', show: true}
        ]
      }
    ]);
    expect(wrapper.html()).toEqual(`<div data-feedbacks="1"><div data-feedback="1.0" class="info">Username 'jimmy' available</div></div>`);

    input.value = 'john';
    fieldFeedbackValidationsPromise = form_username.validateFields(input);
    expect(wrapper.html()).toEqual('<div data-feedbacks="1">Pending...</div>');

    fields = await fieldFeedbackValidationsPromise;
    expect(fields).toEqual([
      {
        name: 'username',
        validations: [
          {key: '1.1', type: 'error', show: true}
        ]
      }
    ]);
    expect(wrapper.html()).toEqual(`<div data-feedbacks="1"><div data-feedback="1.1" class="error">Username 'john' already taken, choose another</div></div>`);
  });

  test('catch()', async () => {
    const wrapper = mount(
      <FieldFeedbacks for="username">
        <Async
          promise={checkUsernameAvailability}
          pending={'Pending...'}
          then={availability => availability.available ?
            `Username '${availability.value}' available` :
            `Username '${availability.value}' already taken, choose another`
          }
          catch={e => <FieldFeedback>{e.message}</FieldFeedback>}
        />
      </FieldFeedbacks>,
      {context: {form: form_username}}
    );
    expect(wrapper.html()).toEqual('<div data-feedbacks="1"></div>');

    const fieldFeedbackValidationsPromise = form_username.validateFields(input_username_error_valid);
    expect(wrapper.html()).toEqual('<div data-feedbacks="1">Pending...</div>');

    const fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([
      {
        name: 'username',
        validations: [
          {key: '1.0', type: 'error', show: true}
        ]
      }
    ]);
    expect(wrapper.html()).toEqual(`<div data-feedbacks="1"><div data-feedback="1.0" class="error">Something wrong with username 'error'</div></div>`);
  });

  test('no catch()', async () => {
    const wrapper = mount(
      <FieldFeedbacks for="username">
        <Async
          promise={checkUsernameAvailability}
          pending={'Pending...'}
          then={availability => availability.available ?
            `Username '${availability.value}' available` :
            `Username '${availability.value}' already taken, choose another`
          }
        />
      </FieldFeedbacks>,
      {context: {form: form_username}}
    );
    expect(wrapper.html()).toEqual('<div data-feedbacks="1"></div>');

    const fieldFeedbackValidationsPromise = form_username.validateFields(input_username_error_valid);
    expect(wrapper.html()).toEqual('<div data-feedbacks="1">Pending...</div>');

    const fieldFeedbackValidations = await fieldFeedbackValidationsPromise;
    expect(fieldFeedbackValidations).toEqual([
      {name: 'username', validations: []}
    ]);
    expect(wrapper.html()).toEqual('<div data-feedbacks="1"></div>');
  });
});
