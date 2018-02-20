import React from 'react';
import { mount } from 'enzyme';

import { FormWithConstraints, fieldWithoutFeedback, FieldFeedback, Async } from './index';
import checkUsernameAvailability from './checkUsernameAvailability';
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
  class SignUp extends React.Component {
    form: FormWithConstraints | null | undefined;
    username: HTMLInputElement | null | undefined;
    password: HTMLInputElement | null | undefined;
    passwordConfirm: HTMLInputElement | null | undefined;

    render() {
      return (
        <FormWithConstraints ref={formWithConstraints => this.form = formWithConstraints}>
          <input name="username" ref={username => this.username = username} />
          <FieldFeedbacks for="username" stop="no">
            <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
            <FieldFeedback when={value => value.length < 3}>Should be at least 3 characters long</FieldFeedback>
            <Async
              promise={checkUsernameAvailability}
              then={availability => availability.available ?
                <FieldFeedback info>Username '{availability.value}' available</FieldFeedback> :
                <FieldFeedback>Username '{availability.value}' already taken, choose another</FieldFeedback>
              }
              catch={e => <FieldFeedback>{e.message}</FieldFeedback>}
            />
            <FieldFeedback when="valid">Looks good!</FieldFeedback>
          </FieldFeedbacks>

          <input type="password" name="password" ref={password => this.password = password} />
          <FieldFeedbacks for="password" stop="no">
            <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
            <FieldFeedback when={value => value.length < 5}>Should be at least 5 characters long</FieldFeedback>
            <FieldFeedback when="valid">Looks good!</FieldFeedback>
          </FieldFeedbacks>

          <input type="password" name="passwordConfirm" ref={passwordConfirm => this.passwordConfirm = passwordConfirm} />
          <FieldFeedbacks for="passwordConfirm">
            <FieldFeedback when={value => value !== this.password!.value}>Not the same password</FieldFeedback>
          </FieldFeedbacks>
        </FormWithConstraints>
      );
    }
  }

  describe('validateFields()', () => {
    test('inputs', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
      const fieldFeedbackValidations = await signUp.form!.validateFields(signUp.username!, signUp.password!, signUp.passwordConfirm!);
      expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 0.0, show: true},
            {key: 0.1, show: true},
            {key: 0.2, show: false},
            {key: 0.3, show: false}
          ]
        },
        {
          fieldName: 'password',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 1.0, show: true},
            {key: 1.1, show: true},
            {key: 1.2, show: false}
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
<div data-field-feedback-key="0" class="error">Cannot be empty</div>\
<div data-field-feedback-key="0.1" class="error">Should be at least 3 characters long</div>\
<div data-field-feedback-key="0.3" class="info">Username '' available</div>\
</div>\
<input type="password" name="password">\
<div>\
<div data-field-feedback-key="1" class="error">Cannot be empty</div>\
<div data-field-feedback-key="1.1" class="error">Should be at least 5 characters long</div>\
</div>\
<input type="password" name="passwordConfirm">\
<div>\
</div>\
</form>`
      );
    });

    test('field names', async () => {
      const signUp = mount(<SignUp />).instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
      const fieldFeedbackValidations = await signUp.form!.validateFields('username', 'password', 'passwordConfirm');
      expect(fieldFeedbackValidations).toEqual([
        {
          fieldName: 'username',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 0.0, show: true},
            {key: 0.1, show: true},
            {key: 0.2, show: false},
            {key: 0.3, show: false}
          ]
        },
        {
          fieldName: 'password',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 1.0, show: true},
            {key: 1.1, show: true},
            {key: 1.2, show: false}
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
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 0.0, show: true},
            {key: 0.1, show: true},
            {key: 0.2, show: false},
            {key: 0.3, show: false}
          ]
        },
        {
          fieldName: 'password',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 1.0, show: true},
            {key: 1.1, show: true},
            {key: 1.2, show: false}
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
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 0.0, show: true},
            {key: 0.1, show: true},
            {key: 0.2, show: false},
            {key: 0.3, show: false}
          ]
        },
        {
          fieldName: 'password',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 1.0, show: true},
            {key: 1.1, show: true},
            {key: 1.2, show: false}
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
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 0.0, show: true},
            {key: 0.1, show: true},
            {key: 0.2, show: false},
            {key: 0.3, show: false}
          ]
        },
        {
          fieldName: 'password',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 1.0, show: true},
            {key: 1.1, show: true},
            {key: 1.2, show: false}
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
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 0.0, show: false},
            {key: 0.1, show: false},
            {key: 0.2, show: false},
            {key: 0.4, show: false} // FieldFeedback key incremented because Async created a new FieldFeedback
          ]
        },
        {
          fieldName: 'password',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 1.0, show: false},
            {key: 1.1, show: true},
            {key: 1.2, show: false}
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
<div data-field-feedback-key="0.4" class="info">Username 'jimmy' available</div>\
<div class="valid">Looks good!</div>\
</div>\
<input type="password" name="password">\
<div>\
<div data-field-feedback-key="1.1" class="error">Should be at least 5 characters long</div>\
</div>\
<input type="password" name="passwordConfirm">\
<div>\
<div data-field-feedback-key="2" class="error">Not the same password</div>\
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
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 0.0, show: false},
            {key: 0.1, show: false},
            {key: 0.2, show: false},
            {key: 0.3, show: true}
          ]
        },
        {
          fieldName: 'password',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 1.0, show: false},
            {key: 1.1, show: true},
            {key: 1.2, show: false}
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
<input name="username">\
<div><div data-field-feedback-key="0.3" class="error">Something wrong with username 'error'</div></div>\
<input type="password" name="password">\
<div><div data-field-feedback-key="1.1" class="error">Should be at least 5 characters long</div></div>\
<input type="password" name="passwordConfirm">\
<div><div data-field-feedback-key="2" class="error">Not the same password</div></div>\
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
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 0.0, show: true},
            {key: 0.1, show: true},
            {key: 0.2, show: false},
            {key: 0.3, show: false}
          ]
        },
        {
          fieldName: 'password',
          isValid: expect.any(Function),
          fieldFeedbackValidations: [
            {key: 1.0, show: true},
            {key: 1.1, show: true},
            {key: 1.2, show: false}
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
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      // Fields are already dirty so calling validateForm() again won't do anything

      expect(signUp.form!.fieldsStore.fields).toEqual({
        username: {
          dirty: true,
          errors: new Set([0.0, 0.1]),
          warnings: new Set(),
          infos: new Set([0.3]),
          validationMessage: undefined
        },
        password: {
          dirty: true,
          errors: new Set([1.0, 1.1]),
          warnings: new Set(),
          infos: new Set(),
          validationMessage: undefined
        },
        passwordConfirm: {
          dirty: true,
          errors: new Set(),
          warnings: new Set(),
          infos: new Set(),
          validationMessage: undefined
        }
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
    username: {
      validated: false,
      errors: new Set(),
      warnings: new Set(),
      infos: new Set(),
      validationMessage: ''
    },
    password: {
      validated: false,
      errors: new Set(),
      warnings: new Set(),
      infos: new Set(),
      validationMessage: ''
    }
  };
  expect(form.isValid()).toEqual(true);

  form.fieldsStore.fields = {
    username: {
      validated: true,
      errors: new Set([0]),
      warnings: new Set(),
      infos: new Set(),
      validationMessage: 'Suffering from being missing'
    },
    password: {
      validated: true,
      errors: new Set([0]),
      warnings: new Set(),
      infos: new Set(),
      validationMessage: 'Suffering from being missing'
    }
  };
  expect(form.isValid()).toEqual(false);

  form.fieldsStore.fields = {
    username: {
      validated: true,
      errors: new Set(),
      warnings: new Set([0]),
      infos: new Set(),
      validationMessage: ''
    },
    password: {
      validated: true,
      errors: new Set(),
      warnings: new Set([0]),
      infos: new Set(),
      validationMessage: ''
    }
  };
  expect(form.isValid()).toEqual(true);

  form.fieldsStore.fields = {
    username: {
      validated: true,
      errors: new Set(),
      warnings: new Set(),
      infos: new Set([0]),
      validationMessage: ''
    },
    password: {
      validated: true,
      errors: new Set(),
      warnings: new Set(),
      infos: new Set([0]),
      validationMessage: ''
    }
  };
  expect(form.isValid()).toEqual(true);
});

test('reset()', () => {
  const form = new_FormWithConstraints({});

  form.fieldsStore.fields = {
    username: {
      validated: true,
      errors: new Set([0]),
      warnings: new Set(),
      infos: new Set(),
      validationMessage: 'Suffering from being missing'
    },
    password: {
      validated: true,
      errors: new Set([0]),
      warnings: new Set(),
      infos: new Set(),
      validationMessage: 'Suffering from being missing'
    }
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
