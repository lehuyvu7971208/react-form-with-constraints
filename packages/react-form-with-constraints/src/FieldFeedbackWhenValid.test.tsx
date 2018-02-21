import React from 'react';
import { shallow as _shallow } from 'enzyme';

import {
  FormWithConstraints,
  FieldValidatedEvent, ResetEvent,
  FieldFeedbackWhenValid, FieldFeedbackWhenValidProps, FieldFeedbackWhenValidContext
} from './index';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

function shallow(node: React.ReactElement<FieldFeedbackWhenValidProps>, options: {context: FieldFeedbackWhenValidContext}) {
  return _shallow<FieldFeedbackWhenValidProps>(node, options);
}

let form_username: FormWithConstraints;
let fieldFeedbacks_username: FieldFeedbacks;

beforeEach(() => {
  form_username = new_FormWithConstraints({});
  fieldFeedbacks_username = new FieldFeedbacks({for: 'username', stop: 'no'}, {form: form_username});
});

test('constructor', () => {
  const wrapper = shallow(
    <FieldFeedbackWhenValid />,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );
  const fieldFeedbackWhenValid = wrapper.instance() as FieldFeedbackWhenValid;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
});

test('componentWillMount() componentWillUnmount()', () => {
  const addFieldValidatedEventListenerSpy = jest.spyOn(form_username, 'addFieldValidatedEventListener');
  const addResetEventListenerSpy = jest.spyOn(form_username, 'addResetEventListener');
  const removeFieldValidatedEventListenerSpy = jest.spyOn(form_username, 'removeFieldValidatedEventListener');
  const removeResetEventListenerSpy = jest.spyOn(form_username, 'removeResetEventListener');

  const wrapper = shallow(
    <FieldFeedbackWhenValid />,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );
  expect(addFieldValidatedEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeFieldValidatedEventListenerSpy).toHaveBeenCalledTimes(0);
  expect(form_username.fieldValidatedEventEmitter.listeners.get(FieldValidatedEvent)).toHaveLength(1);
  expect(addResetEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeResetEventListenerSpy).toHaveBeenCalledTimes(0);
  expect(form_username.resetEventEmitter.listeners.get(ResetEvent)).toHaveLength(1);

  wrapper.unmount();
  expect(addFieldValidatedEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeFieldValidatedEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(form_username.fieldValidatedEventEmitter.listeners.get(FieldValidatedEvent)).toEqual(undefined);
  expect(addResetEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeResetEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(form_username.resetEventEmitter.listeners.get(ResetEvent)).toEqual(undefined);
});

test('fieldValidated()', async () => {
  const wrapper = shallow(
    <FieldFeedbackWhenValid />,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );
  const fieldFeedbackWhenValid = wrapper.instance() as FieldFeedbackWhenValid;

  let fieldValidationsPromise: any = Promise.resolve({isValid: () => true});
  form_username.emitFieldValidatedEvent({name: 'username'} as any, fieldValidationsPromise);
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
  await fieldValidationsPromise;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(true);

  fieldValidationsPromise = Promise.resolve({isValid: () => false});
  form_username.emitFieldValidatedEvent({name: 'username'} as any, fieldValidationsPromise);
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
  await fieldValidationsPromise;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(false);

  fieldValidationsPromise = Promise.resolve({isValid: () => true});
  form_username.emitFieldValidatedEvent({name: 'unknown'} as any, fieldValidationsPromise);
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(false);
  await fieldValidationsPromise;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(false);
});

test('reset()', async () => {
  const wrapper = shallow(
    <FieldFeedbackWhenValid />,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );
  const fieldFeedbackWhenValid = wrapper.instance() as FieldFeedbackWhenValid;

  const fieldValidationsPromise: any = Promise.resolve({isValid: () => true});
  form_username.emitFieldValidatedEvent({name: 'username'} as any, fieldValidationsPromise);
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
  await fieldValidationsPromise;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(true);

  form_username.emitResetEvent();
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
});

test('render()', () => {
  let wrapper = shallow(
    <FieldFeedbackWhenValid>Looks good!</FieldFeedbackWhenValid>,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );

  expect(wrapper.html()).toEqual(null);

  wrapper.setState({fieldIsValid: undefined});
  expect(wrapper.html()).toEqual(null);

  wrapper.setState({fieldIsValid: true});
  expect(wrapper.html()).toEqual('<div class="valid">Looks good!</div>');

  wrapper.setState({fieldIsValid: false});
  expect(wrapper.html()).toEqual(null);

  // With className
  wrapper = shallow(
    <FieldFeedbackWhenValid className="hello">Looks good!</FieldFeedbackWhenValid>,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );
  wrapper.setState({fieldIsValid: true});
  expect(wrapper.html()).toEqual('<div class="hello valid">Looks good!</div>');

  // With div props
  wrapper = shallow(
    <FieldFeedbackWhenValid style={{color: 'green'}}>Looks good!</FieldFeedbackWhenValid>,
    {context: {form: form_username, fieldFeedbacks: fieldFeedbacks_username}}
  );
  wrapper.setState({fieldIsValid: true});
  expect(wrapper.html()).toEqual('<div style="color:green" class="valid">Looks good!</div>');
});
