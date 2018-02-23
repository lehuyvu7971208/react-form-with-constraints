import React from 'react';
import { shallow } from 'enzyme';
import { StyleSheet, /*TextInput,*/ View } from 'react-native';
import { TextInput } from './react-native-TextInput-fix'; // Specific to TypeScript
import renderer from 'react-test-renderer';

import { fieldWithoutFeedback, FieldFeedbacksProps } from 'react-form-with-constraints';

import { FormWithConstraints, FieldFeedbacks, FieldFeedback } from './index';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';

// Taken and adapted from FormWithConstraints.test.tsx
describe('FormWithConstraints', () => {
  describe('validate', () => {
    class SignUp extends React.Component {
      form: FormWithConstraints | null | undefined;
      username: TextInput | null | undefined;
      password: TextInput | null | undefined;
      passwordConfirm: TextInput | null | undefined;

      render() {
        return (
          <FormWithConstraints ref={formWithConstraints => this.form = formWithConstraints}>
            <TextInput
              name="username"
              ref={username => this.username = username as any}
            />
            <TextInput
              name="password"
              secureTextEntry
              ref={password => this.password = password as any}
            />
            <TextInput
              name="passwordConfirm"
              secureTextEntry
              ref={passwordConfirm => this.passwordConfirm = passwordConfirm as any}
            />
          </FormWithConstraints>
        );
      }
    }

    describe('validateFields()', () => {
      test('inputs', async () => {
        const signUp = renderer.create(<SignUp />).getInstance() as any as SignUp;
        const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
        const fieldFeedbackValidations = await signUp.form!.validateFields(signUp.username!, signUp.password!, signUp.passwordConfirm!);
        expect(fieldFeedbackValidations).toEqual([
          {
            fieldName: 'username',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'password',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'passwordConfirm',
            fieldFeedbackValidations: []
          }
        ]);
        expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
        expect(emitValidateFieldEventSpy.mock.calls).toEqual([
          [{name: 'username', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'password', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'passwordConfirm', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}]
        ]);
      });

      test('field names', async () => {
        const signUp = renderer.create(<SignUp />).getInstance() as any as SignUp;
        const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
        const fieldFeedbackValidations = await signUp.form!.validateFields('username', 'password', 'passwordConfirm');
        expect(fieldFeedbackValidations).toEqual([
          {
            fieldName: 'username',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'password',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'passwordConfirm',
            fieldFeedbackValidations: []
          }
        ]);
        expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
        expect(emitValidateFieldEventSpy.mock.calls).toEqual([
          [{name: 'username', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'password', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'passwordConfirm', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}]
        ]);
      });

      test('inputs + field names', async () => {
        const signUp = renderer.create(<SignUp />).getInstance() as any as SignUp;
        const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
        const fieldFeedbackValidations = await signUp.form!.validateFields(signUp.username!, 'password', signUp.passwordConfirm!);
        expect(fieldFeedbackValidations).toEqual([
          {
            fieldName: 'username',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'password',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'passwordConfirm',
            fieldFeedbackValidations: []
          }
        ]);
        expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
        expect(emitValidateFieldEventSpy.mock.calls).toEqual([
          [{name: 'username', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'password', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'passwordConfirm', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}]
        ]);
      });

      test('without arguments', async () => {
        const signUp = renderer.create(<SignUp />).getInstance() as any as SignUp;
        const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
        const fieldFeedbackValidations = await signUp.form!.validateFields();
        expect(fieldFeedbackValidations).toEqual([
          {
            fieldName: 'username',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'password',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'passwordConfirm',
            fieldFeedbackValidations: []
          }
        ]);
        expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
        expect(emitValidateFieldEventSpy.mock.calls).toEqual([
          [{name: 'username', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'password', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'passwordConfirm', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}]
        ]);
      });
    });

    describe('validateForm()', () => {
      test('validateDirtyFields = false', async () => {
        const signUp = renderer.create(<SignUp />).getInstance() as any as SignUp;
        const fieldsStore = signUp.form!.fieldsStore;
        fieldsStore.fields = {
          username: fieldWithoutFeedback,
          password: fieldWithoutFeedback,
          passwordConfirm: fieldWithoutFeedback
        };
        const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
        let fieldFeedbackValidations = await signUp.form!.validateForm();
        expect(fieldFeedbackValidations).toEqual([
          {
            fieldName: 'username',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'password',
            fieldFeedbackValidations: []
          },
          {
            fieldName: 'passwordConfirm',
            fieldFeedbackValidations: []
          }
        ]);
        expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
        expect(emitValidateFieldEventSpy.mock.calls).toEqual([
          [{name: 'username', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'password', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}],
          [{name: 'passwordConfirm', type: undefined, value: undefined, validity: undefined, validationMessage: undefined}]
        ]);

        fieldsStore.fields.username!.dirty = true;
        fieldsStore.fields.password!.dirty = true;
        fieldsStore.fields.passwordConfirm!.dirty = true;
        emitValidateFieldEventSpy.mockClear();
        // Fields are dirty so calling validateForm() again won't do anything
        fieldFeedbackValidations = await signUp.form!.validateForm();
        expect(fieldFeedbackValidations).toEqual([]);
        expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
        expect(emitValidateFieldEventSpy.mock.calls).toEqual([]);
      });
    });
  });

  describe('render()', () => {
    test('without children', () => {
      const wrapper = renderer.create(<FormWithConstraints />);
      const form = wrapper.getInstance() as any as FormWithConstraints;
      expect(form.fieldsStore.fields).toEqual({});
      expect(form.isValid()).toEqual(true);
    });

    test('children', () => {
      const wrapper = renderer.create(
        <FormWithConstraints>
          <TextInput name="username" keyboardType="email-address" />
          <FieldFeedbacks for="username">
            <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
          </FieldFeedbacks>

          <TextInput name="password" secureTextEntry />
          <FieldFeedbacks for="password">
            <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
          </FieldFeedbacks>
        </FormWithConstraints>
      );

      expect(wrapper.toJSON()).toEqual(
        {
          type: 'View',
          props: {},
          children: [
            { type: 'TextInput', props: { name: 'username', keyboardType: 'email-address', allowFontScaling: true }, children: null },
            { type: 'View', props: {}, children: null },
            { type: 'TextInput', props: { name: 'password', secureTextEntry: true, allowFontScaling: true }, children: null },
            { type: 'View', props: {}, children: null }
          ]
        }
      );

      const form = wrapper.getInstance() as any as FormWithConstraints;
      expect(form.fieldsStore.fields).toEqual({
        username: fieldWithoutFeedback,
        password: fieldWithoutFeedback
      });
    });

    test('children with <View> inside hierarchy', () => {
      const wrapper = renderer.create(
        <FormWithConstraints>
          <View>
            <TextInput name="username" keyboardType="email-address" />
            <View>
              <FieldFeedbacks for="username">
                <View>
                <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
                </View>
              </FieldFeedbacks>
            </View>

            <TextInput name="password" secureTextEntry />
            <View>
              <FieldFeedbacks for="password">
                <View>
                <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
                </View>
              </FieldFeedbacks>
            </View>
          </View>
        </FormWithConstraints>
      );

      const form = wrapper.getInstance() as any as FormWithConstraints;
      expect(form.fieldsStore.fields).toEqual({
        username: fieldWithoutFeedback,
        password: fieldWithoutFeedback
      });
    });

    test('children with <View> inside hierarchy + multiple FieldFeedbacks', () => {
      const wrapper = renderer.create(
        <FormWithConstraints>
          <View>
            <TextInput name="username" keyboardType="email-address" />
            <View>
              <FieldFeedbacks for="username">
                <View>
                <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
                </View>
              </FieldFeedbacks>
            </View>
            <View>
              <FieldFeedbacks for="username">
                <View>
                <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
                </View>
              </FieldFeedbacks>
            </View>

            <TextInput name="password" secureTextEntry />
            <View>
              <FieldFeedbacks for="password">
                <View>
                <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
                </View>
              </FieldFeedbacks>
            </View>
            <View>
              <FieldFeedbacks for="password">
                <View>
                <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
                </View>
              </FieldFeedbacks>
            </View>
          </View>
        </FormWithConstraints>
      );

      const form = wrapper.getInstance() as any as FormWithConstraints;
      expect(form.fieldsStore.fields).toEqual({
        username: fieldWithoutFeedback,
        password: fieldWithoutFeedback
      });
    });
  });
});

describe('FieldFeedbacks', () => {
  test('render()', () => {
    const form = new_FormWithConstraints({});
    const wrapper = shallow(
      <FieldFeedbacks for="username">
        <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
      </FieldFeedbacks>,
      {context: {form}}
    );
    expect(wrapper.debug()).toEqual(
`<View>
  <FieldFeedback when={[Function: when]}>
    Cannot be empty
  </FieldFeedback>
</View>`
    );
  });
});

// Taken and adapted from FieldFeedback.test.tsx
describe('FieldFeedback', () => {
  const initialFieldFeedbackKeyCounter = 1;

  describe('render()', () => {
    test('should not render', () => {
      const form = new_FormWithConstraints({});
      form.fieldsStore.fields = {
        username: {
          dirty: true,
          errors: new Set(),
          warnings: new Set(),
          infos: new Set(),
          validationMessage: ''
        }
      };
      const fieldFeedbacks = new FieldFeedbacks({for: 'username', stop: 'no'}, {form: form as any});

      const fieldFeedback = shallow(
        <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>,
        {context: {form, fieldFeedbacks}}
      );

      expect(fieldFeedback.debug()).toEqual('');
    });

    test('with children', () => {
      const form = new_FormWithConstraints({});
      form.fieldsStore.fields = {
        username: {
          dirty: true,
          errors: new Set([0.1]),
          warnings: new Set(),
          infos: new Set(),
          validationMessage: ''
        }
      };
      const fieldFeedbacks = new FieldFeedbacks({for: 'username', stop: 'no'}, {form: form as any});

      const fieldFeedback = shallow(
        <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>,
        {context: {form, fieldFeedbacks}}
      );

      expect(fieldFeedback.debug()).toEqual(
`<Text style={[undefined]} accessible={true} allowFontScaling={true} ellipsizeMode="tail">
  Cannot be empty
</Text>`
      );
    });

    test('without children', () => {
      const form = new_FormWithConstraints({});
      form.fieldsStore.fields = {
        username: {
          dirty: true,
          errors: new Set([0.1]),
          warnings: new Set(),
          infos: new Set(),
          validationMessage: ''
        }
      };
      const fieldFeedbacks = new FieldFeedbacks({for: 'username', stop: 'no'}, {form: form as any});

      const fieldFeedback = shallow(
        <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>,
        {context: {form, fieldFeedbacks}}
      );

      expect(fieldFeedback.debug()).toEqual(
`<Text style={[undefined]} accessible={true} allowFontScaling={true} ellipsizeMode="tail">
  Cannot be empty
</Text>`
      );
    });

    test('with style', () => {
      const feedbacksStyles = StyleSheet.create({
        error: { color: 'red' },
        warning: { color: 'orange' },
        info: { color: 'blue' }
      });

      const form = new_FormWithConstraints({style: feedbacksStyles});
      form.fieldsStore.fields = {
        username: {
          dirty: true,
          errors: new Set([0.1]),
          warnings: new Set(),
          infos: new Set(),
          validationMessage: ''
        }
      };
      const fieldFeedbacks = new FieldFeedbacks({for: 'username', stop: 'no'}, {form: form as any});

      const fieldFeedback = shallow(
        <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>,
        {context: {form, fieldFeedbacks}}
      );

      expect(fieldFeedback.debug()).toEqual(
`<Text style={{...}} accessible={true} allowFontScaling={true} ellipsizeMode="tail">
  Cannot be empty
</Text>`
      );
      expect(fieldFeedback.props().style).toEqual({color: 'red'});
    });

    test('when="valid"', () => {
      const form = new_FormWithConstraints({});
      form.fieldsStore.fields = {
        username: {
          dirty: true,
          errors: new Set([0.1]),
          warnings: new Set(),
          infos: new Set(),
          validationMessage: ''
        }
      };
      const fieldFeedbacks = new FieldFeedbacks({for: 'username', stop: 'no'}, {form: form as any});

      const fieldFeedback = shallow(
        <FieldFeedback when="valid">Looks good!</FieldFeedback>,
        {context: {form, fieldFeedbacks}}
      );

      expect(fieldFeedback.debug()).toEqual(
`<FieldFeedbackWhenValid>
  Looks good!
</FieldFeedbackWhenValid>`
      );
    });
  });
});
