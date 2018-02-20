import React from 'react';
import { mount } from 'enzyme';

import { FieldFeedback } from 'react-form-with-constraints';

import { FormWithConstraints, FormWithConstraintsTooltip, FormControlInput } from './index';
import FieldFeedbacks from '../../react-form-with-constraints/src/FieldFeedbacksEnzymeFix';

describe('FormWithConstraints', () => {
  class SignUp extends React.Component {
    form: FormWithConstraints | null | undefined;
    username: HTMLInputElement | null | undefined;
    password: HTMLInputElement | null | undefined;
    passwordConfirm: HTMLInputElement | null | undefined;

    render() {
      return (
        <FormWithConstraints ref={formWithConstraints => this.form = formWithConstraints}>
          <FormControlInput type="email" name="username" innerRef={username => this.username = username} />
          <FieldFeedbacks for="username" stop="no">
            <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
            <FieldFeedback when={value => value.length < 3}>Should be at least 3 characters long</FieldFeedback>
            <FieldFeedback when="valid">Looks good!</FieldFeedback>
          </FieldFeedbacks>

          <FormControlInput type="password" name="password" innerRef={password => this.password = password} />
          <FieldFeedbacks for="password" stop="no">
            <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
            <FieldFeedback when={value => value.length < 5}>Should be at least 5 characters long</FieldFeedback>
            <FieldFeedback when={value => !/\d/.test(value)} warning>Should contain numbers</FieldFeedback>
            <FieldFeedback when={value => !/[a-z]/.test(value)} warning>Should contain small letters</FieldFeedback>
            <FieldFeedback when={value => !/[A-Z]/.test(value)} warning>Should contain capital letters</FieldFeedback>
            <FieldFeedback when={value => !/\W/.test(value)} warning>Should contain special characters</FieldFeedback>
            <FieldFeedback when="valid">Looks good!</FieldFeedback>
          </FieldFeedbacks>

          <FormControlInput type="password" name="passwordConfirm" innerRef={passwordConfirm => this.passwordConfirm = passwordConfirm} />
          <FieldFeedbacks for="passwordConfirm">
            <FieldFeedback when={value => value !== this.password!.value}>Not the same password</FieldFeedback>
          </FieldFeedbacks>
        </FormWithConstraints>
      );
    }
  }

  test('render()', async () => {
    const wrapper = mount(<SignUp />);
    const signUp = wrapper.instance() as SignUp;
    let fieldFeedbackValidations = await signUp.form!.validateFields(signUp.username!, signUp.password!, signUp.passwordConfirm!);
    expect(fieldFeedbackValidations).toEqual([
      {
        fieldName: 'username',
        isValid: expect.any(Function),
        fieldFeedbackValidations: [
          {key: 0.0, show: true},
          {key: 0.1, show: true},
          {key: 0.2, show: false}
        ]
      },
      {
        fieldName: 'password',
        isValid: expect.any(Function),
        fieldFeedbackValidations: [
          {key: 1.0, show: true},
          {key: 1.1, show: true},
          {key: 1.2, show: false},
          {key: 1.3, show: false},
          {key: 1.4, show: false},
          {key: 1.5, show: false},
          {key: 1.6, show: false}
        ]
      },
      {
        fieldName: 'passwordConfirm',
        isValid: expect.any(Function),
        fieldFeedbackValidations: [
          {key: 2.0, show: false}
        ]
      }
    ]);
    expect(wrapper.html()).toEqual(`\
<form>\
<input type="email" name="username" class="form-control is-invalid">\
<div>\
<div data-field-feedback-key="0" class="invalid-feedback">Cannot be empty</div>\
<div data-field-feedback-key="0.1" class="invalid-feedback">Should be at least 3 characters long</div>\
</div>\
<input type="password" name="password" class="form-control is-invalid">\
<div>\
<div data-field-feedback-key="1" class="invalid-feedback">Cannot be empty</div>\
<div data-field-feedback-key="1.1" class="invalid-feedback">Should be at least 5 characters long</div>\
<div data-field-feedback-key="1.2" class="warning-feedback">Should contain numbers</div>\
<div data-field-feedback-key="1.3" class="warning-feedback">Should contain small letters</div>\
<div data-field-feedback-key="1.4" class="warning-feedback">Should contain capital letters</div>\
<div data-field-feedback-key="1.5" class="warning-feedback">Should contain special characters</div>\
</div>\
<input type="password" name="passwordConfirm" class="form-control is-valid">\
<div></div>\
</form>`
    );

    // Change the inputs
    signUp.username!.value = 'jimmy';
    signUp.password!.value = '1234';
    signUp.passwordConfirm!.value = '123';
    fieldFeedbackValidations = await signUp.form!.validateFields();
    expect(fieldFeedbackValidations).toEqual([
      {
        fieldName: 'username',
        isValid: expect.any(Function),
        fieldFeedbackValidations: [
          {key: 0.0, show: false},
          {key: 0.1, show: false},
          {key: 0.2, show: false}
        ]
      },
      {
        fieldName: 'password',
        isValid: expect.any(Function),
        fieldFeedbackValidations: [
          {key: 1.0, show: false},
          {key: 1.1, show: true},
          {key: 1.2, show: false},
          {key: 1.3, show: false},
          {key: 1.4, show: false},
          {key: 1.5, show: false},
          {key: 1.6, show: false}
        ]
      },
      {
        fieldName: 'passwordConfirm',
        isValid: expect.any(Function),
        fieldFeedbackValidations: [
          {key: 2.0, show: true}
        ]
      }
    ]);
    expect(wrapper.html()).toEqual(`\
<form>\
<input type="email" name="username" class="form-control is-valid">\
<div>\
<div class="valid-feedback">Looks good!</div>\
</div>\
<input type="password" name="password" class="form-control is-invalid">\
<div>\
<div data-field-feedback-key="1.1" class="invalid-feedback">Should be at least 5 characters long</div>\
<div data-field-feedback-key="1.3" class="warning-feedback">Should contain small letters</div>\
<div data-field-feedback-key="1.4" class="warning-feedback">Should contain capital letters</div>\
<div data-field-feedback-key="1.5" class="warning-feedback">Should contain special characters</div>\
</div>\
<input type="password" name="passwordConfirm" class="form-control is-invalid">\
<div>\
<div data-field-feedback-key="2" class="invalid-feedback">Not the same password</div>\
</div>\
</form>`
    );
  });
});

describe('FormWithConstraintsTooltip', () => {
  class Form extends React.Component {
    form: FormWithConstraintsTooltip | null | undefined;

    render() {
      return (
        <FormWithConstraintsTooltip ref={formWithConstraints => this.form = formWithConstraints} />
      );
    }
  }

  test('render()', async () => {
    const wrapper = mount(<Form />);
    const form = wrapper.instance() as Form;
    expect(form.form!.props.fieldFeedbackClassNames).toEqual({
      error: 'invalid-tooltip',
      warning: 'warning-tooltip',
      info: 'info-tooltip',
      valid: 'valid-tooltip'
    });
  });
});
