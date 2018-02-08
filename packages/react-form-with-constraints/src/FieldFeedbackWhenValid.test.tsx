import React from 'react';
import { shallow as _shallow } from 'enzyme';

import {
  FormWithConstraints, fieldWithoutFeedback,
  FieldValidatedEvent, ResetFormEvent,
  FieldFeedbackWhenValid, FieldFeedbackWhenValidProps, FieldFeedbackWhenValidContext
} from './index';
import createFieldFeedbacks from './createFieldFeedbacks';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

function shallow(node: React.ReactElement<FieldFeedbackWhenValidProps>, options: {context: FieldFeedbackWhenValidContext}) {
  return _shallow<FieldFeedbackWhenValidProps>(node, options);
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

test('constructor', () => {
  const wrapper = shallow(
    <FieldFeedbackWhenValid />,
    {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
  );
  const fieldFeedbackWhenValid = wrapper.instance() as FieldFeedbackWhenValid;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
});

test('componentWillMount() componentWillUnmount()', () => {
  const addFieldValidatedEventListenerSpy = jest.spyOn(form_username_empty, 'addFieldValidatedEventListener');
  const addResetFormEventListenerSpy = jest.spyOn(form_username_empty, 'addResetFormEventListener');
  const removeFieldValidatedEventListenerSpy = jest.spyOn(form_username_empty, 'removeFieldValidatedEventListener');
  const removeResetFormEventListenerSpy = jest.spyOn(form_username_empty, 'removeResetFormEventListener');

  const wrapper = shallow(
    <FieldFeedbackWhenValid />,
    {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
  );
  expect(addFieldValidatedEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeFieldValidatedEventListenerSpy).toHaveBeenCalledTimes(0);
  expect(form_username_empty.fieldValidatedEventEmitter.listeners.get(FieldValidatedEvent)).toHaveLength(1);
  expect(addResetFormEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeResetFormEventListenerSpy).toHaveBeenCalledTimes(0);
  expect(form_username_empty.resetEventEmitter.listeners.get(ResetFormEvent)).toHaveLength(1);

  wrapper.unmount();
  expect(addFieldValidatedEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeFieldValidatedEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(form_username_empty.fieldValidatedEventEmitter.listeners.get(FieldValidatedEvent)).toEqual(undefined);
  expect(addResetFormEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(removeResetFormEventListenerSpy).toHaveBeenCalledTimes(1);
  expect(form_username_empty.resetEventEmitter.listeners.get(ResetFormEvent)).toEqual(undefined);
});

test('fieldValidated()', async () => {
  const wrapper = shallow(
    <FieldFeedbackWhenValid />,
    {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
  );
  const fieldFeedbackWhenValid = wrapper.instance() as FieldFeedbackWhenValid;

  let fieldValidationsPromise: any = Promise.resolve({isValid: () => true});
  form_username_empty.emitFieldValidatedEvent({name: 'username'} as any, fieldValidationsPromise);
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
  await fieldValidationsPromise;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(true);

  fieldValidationsPromise = Promise.resolve({isValid: () => false});
  form_username_empty.emitFieldValidatedEvent({name: 'username'} as any, fieldValidationsPromise);
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
  await fieldValidationsPromise;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(false);

  fieldValidationsPromise = Promise.resolve({isValid: () => true});
  form_username_empty.emitFieldValidatedEvent({name: 'unknown'} as any, fieldValidationsPromise);
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(false);
  await fieldValidationsPromise;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(false);
});

test('reset()', async () => {
  const wrapper = shallow(
    <FieldFeedbackWhenValid />,
    {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
  );
  const fieldFeedbackWhenValid = wrapper.instance() as FieldFeedbackWhenValid;

  const fieldValidationsPromise: any = Promise.resolve({isValid: () => true});
  form_username_empty.emitFieldValidatedEvent({name: 'username'} as any, fieldValidationsPromise);
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
  await fieldValidationsPromise;
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(true);

  form_username_empty.emitResetFormEvent();
  expect(fieldFeedbackWhenValid.state.fieldIsValid).toEqual(undefined);
});

test('render()', () => {
  let wrapper = shallow(
    <FieldFeedbackWhenValid>Looks good!</FieldFeedbackWhenValid>,
    {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
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
    {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
  );
  wrapper.setState({fieldIsValid: true});
  expect(wrapper.html()).toEqual('<div class="hello valid">Looks good!</div>');

  // With div props
  wrapper = shallow(
    <FieldFeedbackWhenValid style={{color: 'green'}}>Looks good!</FieldFeedbackWhenValid>,
    {context: {form: form_username_empty, fieldFeedbacks: fieldFeedbacks_username}}
  );
  wrapper.setState({fieldIsValid: true});
  expect(wrapper.html()).toEqual('<div style="color:green" class="valid">Looks good!</div>');
});
