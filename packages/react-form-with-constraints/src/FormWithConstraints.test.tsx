import React from 'react';
import { mount } from 'enzyme';
const pretty = require('pretty');
const beautify = require('js-beautify').html;

import { FormWithConstraints, fieldWithoutFeedback, FieldFeedback } from './index';
import { SignUp } from './SignUp';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

// See Event: 'unhandledRejection' https://nodejs.org/api/process.html#process_event_unhandledrejection
// See Bluebird Error management configuration http://bluebirdjs.com/docs/api/error-management-configuration.html
process.on('unhandledRejection', (reason: Error | any, _promise: Promise<any>) => {
  console.error('Unhandled promise rejection:', reason);
});

// FYI "Suffering from being missing" string and friends come from the HTML specification https://www.w3.org/TR/html52/sec-forms.html#suffer-from-being-missing

test('constructor()', () => {
  const form = new_FormWithConstraints({});
  expect(form.fieldsStore.fields).toEqual({});
});

test('computeFieldFeedbacksKey()', () => {
  const form = new_FormWithConstraints({});
  expect(form.computeFieldFeedbacksKey()).toEqual(0);
  expect(form.computeFieldFeedbacksKey()).toEqual(1);
  expect(form.computeFieldFeedbacksKey()).toEqual(2);
});

describe('validate', () => {
  describe('validateFields()', () => {
    test.only('inputs', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
      const fieldFeedbackValidations = await signUp.form!.validateFields(signUp.username!, signUp.password!, signUp.passwordConfirm!);
      /*expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          fieldFeedbackValidations: [
            {key: '0.0', type: 'error', show: true},
            {key: '0.1', type: 'error', show: true},
            {key: '0.3', type: 'info', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'password',
          fieldFeedbackValidations: [
            {key: '1.0', type: 'error', show: true},
            {key: '1.1', type: 'error', show: true},
            {key: '1.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'passwordConfirm',
          fieldFeedbackValidations: [
            {key: '2.0', type: 'error', show: false}
          ]
        }
      ]);*/
      /*expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);*/
      console.log(pretty(wrapper.html()));
      /*expect(wrapper.html()).toEqual(`\
<form>\
<input name="username">\
<div>\
<div data-feedback="0.0" class="error">Cannot be empty</div>\
<div data-feedback="0.1" class="error">Should be at least 3 characters long</div>\
<div data-feedback="0.3" class="info">Username '' available</div>\
</div>\
<input type="password" name="password">\
<div>\
<div data-feedback="1.0" class="error">Cannot be empty</div>\
<div data-feedback="1.1" class="error">Should be at least 5 characters long</div>\
</div>\
<input type="password" name="passwordConfirm">\
<div>\
</div>\
</form>`
      );*/
    });

    test('field names', async () => {
      const signUp = mount(<SignUp />).instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
      const fieldFeedbackValidations = await signUp.form!.validateFields('username', 'password', 'passwordConfirm');
      expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          fieldFeedbackValidations: [
            {key: '0.0', type: 'error', show: true},
            {key: '0.1', type: 'error', show: true},
            {key: '0.3', type: 'info', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'password',
          fieldFeedbackValidations: [
            {key: '1.0', type: 'error', show: true},
            {key: '1.1', type: 'error', show: true},
            {key: '1.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'passwordConfirm',
          fieldFeedbackValidations: [
            {key: '2.0', type: 'error', show: false}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);
    });

    test('inputs + field names', async () => {
      const signUp = mount(<SignUp />).instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
      const fieldFeedbackValidations = await signUp.form!.validateFields(signUp.username!, 'password', signUp.passwordConfirm!);
      expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          fieldFeedbackValidations: [
            {key: '0.0', type: 'error', show: true},
            {key: '0.1', type: 'error', show: true},
            {key: '0.3', type: 'info', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'password',
          fieldFeedbackValidations: [
            {key: '1.0', type: 'error', show: true},
            {key: '1.1', type: 'error', show: true},
            {key: '1.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'passwordConfirm',
          fieldFeedbackValidations: [
            {key: '2.0', type: 'error', show: false}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);
    });

    test('without arguments', async () => {
      const signUp = mount(<SignUp />).instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
      const fieldFeedbackValidations = await signUp.form!.validateFields();
      expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          fieldFeedbackValidations: [
            {key: '0.0', type: 'error', show: true},
            {key: '0.1', type: 'error', show: true},
            {key: '0.3', type: 'info', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'password',
          fieldFeedbackValidations: [
            {key: '1.0', type: 'error', show: true},
            {key: '1.1', type: 'error', show: true},
            {key: '1.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'passwordConfirm',
          fieldFeedbackValidations: [
            {key: '2.0', type: 'error', show: false}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);
    });

    test('change inputs', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
      let fieldFeedbackValidations = await signUp.form!.validateFields();
      expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          fieldFeedbackValidations: [
            {key: '0.0', type: 'error', show: true},
            {key: '0.1', type: 'error', show: true},
            {key: '0.3', type: 'info', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'password',
          fieldFeedbackValidations: [
            {key: '1.0', type: 'error', show: true},
            {key: '1.1', type: 'error', show: true},
            {key: '1.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'passwordConfirm',
          fieldFeedbackValidations: [
            {key: '2.0', type: 'error', show: false}
          ]
        }
      ]);
      expect(fieldFeedbackValidations[0].isValid()).toEqual(false);
      expect(fieldFeedbackValidations[1].isValid()).toEqual(false);
      expect(fieldFeedbackValidations[2].isValid()).toEqual(true);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      emitValidateFieldEventSpy.mockClear();
      signUp.username!.value = 'jimmy';
      signUp.password!.value = '1234';
      signUp.passwordConfirm!.value = '123';
      fieldFeedbackValidations = await signUp.form!.validateFields();
      expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          fieldFeedbackValidations: [
            {key: '0.0', type: 'error', show: false},
            {key: '0.1', type: 'error', show: false},
            {key: '0.4', type: 'info', show: true}, // FieldFeedback key incremented because Async created a new FieldFeedback
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'password',
          fieldFeedbackValidations: [
            {key: '1.0', type: 'error', show: false},
            {key: '1.1', type: 'error', show: true},
            {key: '1.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'passwordConfirm',
          fieldFeedbackValidations: [
            {key: '2.0', type: 'error', show: true}
          ]
        }
      ]);
      expect(fieldFeedbackValidations[0].isValid()).toEqual(true);
      expect(fieldFeedbackValidations[1].isValid()).toEqual(false);
      expect(fieldFeedbackValidations[2].isValid()).toEqual(false);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      expect(wrapper.html()).toEqual(`\
<form>\
<input name="username">\
<div>\
<div data-feedback="0.4" class="info">Username 'jimmy' available</div>\
<div data-feedback="0.2" class="valid">Looks good!</div>\
</div>\
<input type="password" name="password">\
<div>\
<div data-feedback="1.1" class="error">Should be at least 5 characters long</div>\
</div>\
<input type="password" name="passwordConfirm">\
<div>\
<div data-feedback="2.0" class="error">Not the same password</div>\
</div>\
</form>`
      );
    });

    test('change inputs - Async catch()', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;

      signUp.username!.value = 'error';
      signUp.password!.value = '1234';
      signUp.password!.value = '1234';
      const fieldFeedbackValidations = await signUp.form!.validateFields();
      expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          fieldFeedbackValidations: [
            {key: '0.0', type: 'error', show: false},
            {key: '0.1', type: 'error', show: false},
            {key: '0.3', type: 'error', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'password',
          fieldFeedbackValidations: [
            {key: '1.0', type: 'error', show: false},
            {key: '1.1', type: 'error', show: true},
            {key: '1.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'passwordConfirm',
          fieldFeedbackValidations: [
            {key: '2.0', type: 'error', show: true}
          ]
        }
      ]);
      expect(wrapper.html()).toEqual(`\
<form>\
<input name="username">\
<div><div data-feedback="0.3" class="error">Something wrong with username 'error'</div></div>\
<input type="password" name="password">\
<div><div data-feedback="1.1" class="error">Should be at least 5 characters long</div></div>\
<input type="password" name="passwordConfirm">\
<div><div data-feedback="2.0" class="error">Not the same password</div></div>\
</form>`
      );
    });
  });

  describe('validateForm()', () => {
    test('validateDirtyFields = false', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
      let fieldFeedbackValidations = await signUp.form!.validateForm();
      expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          fieldFeedbackValidations: [
            {key: '0.0', type: 'error', show: true},
            {key: '0.1', type: 'error', show: true},
            {key: '0.3', type: 'info', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'password',
          fieldFeedbackValidations: [
            {key: '1.0', type: 'error', show: true},
            {key: '1.1', type: 'error', show: true},
            {key: '1.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          fieldName: 'passwordConfirm',
          fieldFeedbackValidations: [
            {key: '2.0', type: 'error', show: false}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      // Fields are already dirty so calling validateForm() again won't do anything

      expect(signUp.form!.fieldsStore.fields).toEqual({
        username: {validateEventEmitted: true},
        password: {validateEventEmitted: true},
        passwordConfirm: {validateEventEmitted: true}
      });

      emitValidateFieldEventSpy.mockClear();
      signUp.username!.value = 'jimmy';
      signUp.password!.value = '1234';
      signUp.passwordConfirm!.value = '1234';
      fieldFeedbackValidations = await signUp.form!.validateForm();
      expect(fieldFeedbackValidations).toEqual([]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([]);
    });
  });

  test('normalizeInputs - multiple elements matching', () => {
    const form = mount(
      <FormWithConstraints>
        <input name="username" />
        <input type="password" name="password" />
        <input type="password" name="password" />
        <input type="password" name="password" />
      </FormWithConstraints>
    ).instance() as FormWithConstraints;

    form.validateFields('username');
    expect(() => form.validateFields()).toThrow(`Multiple elements matching '[name="password"]' inside the form`);
    expect(() => form.validateFields('password')).toThrow(`Multiple elements matching '[name="password"]' inside the form`);
  });
});

test('isValid()', () => {
  const form = new_FormWithConstraints({});

  form.fieldsStore.fields = {
    username: {validateEventEmitted: false},
    password: {validateEventEmitted: false}
  };
  expect(form.isValid()).toEqual(true);
});

test('reset()', () => {
  const form = new_FormWithConstraints({});

  form.fieldsStore.fields = {
    username: {validateEventEmitted: true},
    password: {validateEventEmitted: true}
  };

  form.reset();

  expect(form.fieldsStore.fields).toEqual({
    username: fieldWithoutFeedback,
    password: fieldWithoutFeedback
  });
});

describe('render()', () => {
  test('without children', () => {
    const form = mount(<FormWithConstraints />).instance() as FormWithConstraints;
    expect(form.fieldsStore.fields).toEqual({});
    expect(form.isValid()).toEqual(true);
  });

  test('children', () => {
    const signIn = mount(
      <FormWithConstraints>
        <input name="username" required minLength={3} />
        <FieldFeedbacks for="username">
          <FieldFeedback when="*" />
        </FieldFeedbacks>

        <input type="password" name="password" required pattern=".{5,}" />
        <FieldFeedbacks for="password">
          <FieldFeedback when="*" />
        </FieldFeedbacks>
      </FormWithConstraints>
    ).instance() as FormWithConstraints;

    expect(signIn.fieldsStore.fields).toEqual({
      username: fieldWithoutFeedback,
      password: fieldWithoutFeedback
    });
  });

  test('children with <div> inside hierarchy', () => {
    const signIn = mount(
      <FormWithConstraints>
        <div>
          <input name="username" required minLength={3} />
          <div>
            <FieldFeedbacks for="username">
              <div>
                <FieldFeedback when="*" />
              </div>
            </FieldFeedbacks>
          </div>

          <input type="password" name="password" required pattern=".{5,}" />
          <div>
            <FieldFeedbacks for="password">
              <div>
                <FieldFeedback when="*" />
              </div>
            </FieldFeedbacks>
          </div>
        </div>
      </FormWithConstraints>
    ).instance() as FormWithConstraints;

    expect(signIn.fieldsStore.fields).toEqual({
      username: fieldWithoutFeedback,
      password: fieldWithoutFeedback
    });
  });

  test('children with <div> inside hierarchy + multiple FieldFeedbacks', () => {
    const signIn = mount(
      <FormWithConstraints>
        <div>
          <input name="username" required minLength={3} />
          <div>
            <FieldFeedbacks for="username">
              <div>
                <FieldFeedback when="*" />
              </div>
            </FieldFeedbacks>
          </div>
          <div>
            <FieldFeedbacks for="username">
              <div>
                <FieldFeedback when="*" />
              </div>
            </FieldFeedbacks>
          </div>

          <input type="password" name="password" required pattern=".{5,}" />
          <div>
            <FieldFeedbacks for="password">
              <div>
                <FieldFeedback when="*" />
              </div>
            </FieldFeedbacks>
          </div>
          <div>
            <FieldFeedbacks for="password">
              <div>
                <FieldFeedback when="*" />
              </div>
            </FieldFeedbacks>
          </div>
        </div>
      </FormWithConstraints>
    ).instance() as FormWithConstraints;

    expect(signIn.fieldsStore.fields).toEqual({
      username: fieldWithoutFeedback,
      password: fieldWithoutFeedback
    });
  });
});
