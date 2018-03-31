import React from 'react';
import { mount as _mount, ReactWrapper } from 'enzyme';
const pretty = require('pretty');
//const beautify = require('js-beautify').html;

import { FormWithConstraints, FormWithConstraintsProps, FieldFeedbacksProps, FieldFeedback, Async } from './index';
import { SignUp } from './SignUp';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';
import checkUsernameAvailability from './checkUsernameAvailability';
import sleep from './sleep';

function mount(node: React.ReactElement<FormWithConstraintsProps>) {
  return _mount<FormWithConstraintsProps, {}>(node);
}

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

interface FormProps {
  inputStop: FieldFeedbacksProps['stop'];
}

describe('FormWithBeforeAsync', () => {
  class FormWithBeforeAsync extends React.Component<FormProps> {
    formWithConstraints: FormWithConstraints | null | undefined;
    input: HTMLInputElement | null | undefined;

    render() {
      const { inputStop } = this.props;

      return (
        <FormWithConstraints ref={formWithConstraints => this.formWithConstraints = formWithConstraints}>
          <input name="input" ref={input => this.input = input} />
          <FieldFeedbacks for="input" stop={inputStop}>
          <FieldFeedback when={() => true}>Error before Async</FieldFeedback>
            <FieldFeedback when={() => true} warning>Warning before Async</FieldFeedback>
            <FieldFeedback when={() => true} info>Info before Async</FieldFeedback>
            <Async
              promise={() => sleep(10)}
              then={() => <FieldFeedback>Async error</FieldFeedback>}
            />
          </FieldFeedbacks>
        </FormWithConstraints>
      );
    }
  }

  test.only('should stop at first FieldFeedback', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="first" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    console.log(pretty(wrapper.html()));
    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.0" class="error">Error before Async</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });

  test.only('should stop at first-error FieldFeedback', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="first-error" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    console.log(pretty(wrapper.html()));
    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.0" class="error">Error before Async</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });

  test.only('should stop at first-warning FieldFeedback', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="first-warning" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.0" class="error">Error before Async</div>\
<div data-feedback="0.1" class="warning">Warning before Async</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });

  test.only('should stop at first-info FieldFeedback', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="first-info" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.0" class="error">Error before Async</div>\
<div data-feedback="0.1" class="warning">Warning before Async</div>\
<div data-feedback="0.2" class="info">Info before Async</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });

  test.only('should not stop', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="no" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.0" class="error">Error before Async</div>\
<div data-feedback="0.1" class="warning">Warning before Async</div>\
<div data-feedback="0.2" class="info">Info before Async</div>\
<div data-feedback="0.3" class="error">Async error</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });
});

describe('FormWithAfterAsync', () => {
  class FormWithAfterAsync extends React.Component<FormProps> {
    formWithConstraints: FormWithConstraints | null | undefined;
    input: HTMLInputElement | null | undefined;

    render() {
      const { inputStop } = this.props;

      return (
        <FormWithConstraints ref={formWithConstraints => this.formWithConstraints = formWithConstraints}>
          <input name="input" ref={input => this.input = input} />
          <FieldFeedbacks for="input" stop={inputStop}>
            <Async
              promise={() => sleep(10)}
              then={() => <FieldFeedback>Async error</FieldFeedback>}
            />
            <FieldFeedback when={() => true}>Error after Async</FieldFeedback>
            <FieldFeedback when={() => true} warning>Warning after Async</FieldFeedback>
            <FieldFeedback when={() => true} info>Info after Async</FieldFeedback>
          </FieldFeedbacks>
        </FormWithConstraints>
      );
    }
  }

  test.only('should stop at first FieldFeedback', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="first" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    console.log(pretty(wrapper.html()));
    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.3" class="error">Async error</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });

  test.only('should stop at first-error FieldFeedback', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="first-error" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    console.log(pretty(wrapper.html()));
    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.3" class="error">Async error</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });

  test.only('should stop at first-warning FieldFeedback', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="first-warning" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.3" class="error">Async error</div>\
<div data-feedback="0.0" class="error">Error after Async</div>\
<div data-feedback="0.1" class="warning">Warning after Async</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });

  test.only('should stop at first-info FieldFeedback', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="first-info" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.3" class="error">Async error</div>\
<div data-feedback="0.0" class="error">Error after Async</div>\
<div data-feedback="0.1" class="warning">Warning after Async</div>\
<div data-feedback="0.2" class="info">Info after Async</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });

  test.only('should not stop', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="no" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.3" class="error">Async error</div>\
<div data-feedback="0.0" class="error">Error after Async</div>\
<div data-feedback="0.1" class="warning">Warning after Async</div>\
<div data-feedback="0.2" class="info">Info after Async</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });
});

describe('FormWithNestedFieldFeedbacks', () => {
  interface FormWithNestedFieldFeedbacksProps {
    fieldFeedbacksWithBeforeAsyncStop: FieldFeedbacksProps['stop'];
    fieldFeedbacksWithAfterAsyncStop: FieldFeedbacksProps['stop'];
  }

  class FormWithNestedFieldFeedbacks extends React.Component<FormWithNestedFieldFeedbacksProps> {
    formWithConstraints: FormWithConstraints | null | undefined;
    input: HTMLInputElement | null | undefined;

    render() {
      const { fieldFeedbacksWithBeforeAsyncStop, fieldFeedbacksWithAfterAsyncStop } = this.props;

      return (
        <FormWithConstraints ref={formWithConstraints => this.formWithConstraints = formWithConstraints}>
          <input name="input" ref={input => this.input = input} />
          <FieldFeedbacks for="input" stop="no">
            <FieldFeedback when={() => true}>Error before FieldFeedbacks</FieldFeedback>
            <FieldFeedback when={() => true} warning>Warning before FieldFeedbacks</FieldFeedback>
            <FieldFeedback when={() => true} info>Info before FieldFeedbacks</FieldFeedback>

            <FieldFeedbacks stop={fieldFeedbacksWithBeforeAsyncStop}>
              <FieldFeedback when={() => true}>Error before Async</FieldFeedback>
              <FieldFeedback when={() => true} warning>Warning before Async</FieldFeedback>
              <FieldFeedback when={() => true} info>Info before Async</FieldFeedback>
              <Async
                promise={() => sleep(10)}
                then={() => <FieldFeedback>Async error</FieldFeedback>}
              />
            </FieldFeedbacks>

            <FieldFeedbacks stop={fieldFeedbacksWithAfterAsyncStop}>
              <Async
                promise={() => sleep(10)}
                then={() => <FieldFeedback>Async error</FieldFeedback>}
              />
              <FieldFeedback when={() => true}>Error after Async</FieldFeedback>
              <FieldFeedback when={() => true} warning>Warning after Async</FieldFeedback>
              <FieldFeedback when={() => true} info>Info after Async</FieldFeedback>
            </FieldFeedbacks>

            <FieldFeedback when={() => true}>Error after FieldFeedbacks</FieldFeedback>
            <FieldFeedback when={() => true} warning>Warning after FieldFeedbacks</FieldFeedback>
            <FieldFeedback when={() => true} info>Info after FieldFeedbacks</FieldFeedback>
          </FieldFeedbacks>
        </FormWithConstraints>
      );
    }
  }

  test.only('should stop at first FieldFeedbacks', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks fieldFeedbacksWithBeforeAsyncStop="first" fieldFeedbacksWithAfterAsyncStop="first" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks;

    await form.formWithConstraints!.validateFields(form.input!);

    console.log(pretty(wrapper.html()));
    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.0" class="error">Error before FieldFeedbacks</div>\
<div data-feedback="0.1" class="warning">Warning before FieldFeedbacks</div>\
<div data-feedback="0.2" class="info">Info before FieldFeedbacks</div>\
<div data-feedbacks="1"></div>\
<div data-feedbacks="2"></div>\
<div data-feedback="0.3" class="error">Error after FieldFeedbacks</div>\
<div data-feedback="0.4" class="warning">Warning after FieldFeedbacks</div>\
<div data-feedback="0.5" class="info">Info after FieldFeedbacks</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });

  test.only('should stop at first-error FieldFeedbacks', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks fieldFeedbacksWithBeforeAsyncStop="first-error" fieldFeedbacksWithAfterAsyncStop="first-error" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks;

    await form.formWithConstraints!.validateFields(form.input!);

    console.log(pretty(wrapper.html()));
    expect(wrapper.html()).toEqual(`\
<form>\
<input name="input">\
<div data-feedbacks="0">\
<div data-feedback="0.0" class="error">Error before FieldFeedbacks</div>\
<div data-feedback="0.1" class="warning">Warning before FieldFeedbacks</div>\
<div data-feedback="0.2" class="info">Info before FieldFeedbacks</div>\
<div data-feedbacks="1"></div>\
<div data-feedbacks="2"></div>\
<div data-feedback="0.3" class="error">Error after FieldFeedbacks</div>\
<div data-feedback="0.4" class="warning">Warning after FieldFeedbacks</div>\
<div data-feedback="0.5" class="info">Info after FieldFeedbacks</div>\
</div>\
</form>`
    );

    wrapper.unmount();
  });
});





describe('SignUp', () => {
  let wrapper: ReactWrapper<FormWithConstraintsProps>;
  let signUp: SignUp;

  beforeEach(() => {
    // FIXME Cannot update an input and expect the HTML returned by Enzyme to be updated
    // Tested with Enzyme 3.3.0 and enzyme-adapter-react-16 1.1.1 (2018-03-29)
    // See enzyme@3: wrapper is not updated even if there was a new render https://github.com/airbnb/enzyme/issues/1153
    // See Enzyme 3.2.0 Wrapper not updated after state change https://github.com/airbnb/enzyme/issues/1400
    wrapper = mount(<SignUp />);
    signUp = wrapper.instance() as SignUp;
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('valid username + valid password with warnings', async () => {
    signUp.username!.value = 'tanguy';
    signUp.password!.value = 'password';
    signUp.passwordConfirm!.value = 'password';
    await signUp.form!.validateFields(signUp.username!, signUp.password!, signUp.passwordConfirm!);

    console.log(pretty(wrapper.html()));
    expect(wrapper.html()).toEqual(`\
<form>\
<input name="username">\
<div data-feedbacks="0">\
<div data-feedback="0.3" class="info">Username 'tanguy' available</div>\
<div data-feedback="0.2" class="valid">Looks good!</div>\
</div>\
<input type="password" name="password">\
<div data-feedbacks="1">\
<div data-feedbacks="2"></div>\
<div data-feedbacks="3">\
<div data-feedback="3.0" class="warning">Should contain numbers</div>\
<div data-feedback="3.2" class="warning">Should contain capital letters</div>\
<div data-feedback="3.3" class="warning">Should contain special characters</div>\
</div>\
<div data-feedback="1.0" class="valid">Looks good!</div>\
</div>\
<input type="password" name="passwordConfirm">\
<div data-feedbacks="4">\
<div data-feedback="4.1" class="valid">Looks good!</div>\
</div>\
</form>`
    );
  });

  test('empty fields', async () => {
    const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');

    signUp.username!.value = '';
    signUp.password!.value = '';
    signUp.passwordConfirm!.value = '';
    const validations = await signUp.form!.validateFields(signUp.username!, signUp.password!, signUp.passwordConfirm!);

    expect(validations).toEqual([
      {
        name: 'username',
        validations: [
          {key: '0.0', type: 'error', show: true},
          {key: '0.1', type: 'error', show: undefined},
          {key: '0.2', type: 'whenValid', show: undefined}
        ]
      },
      {
        name: 'password',
        validations: [
          {key: '2.0', type: 'error', show: true},
          {key: '2.1', type: 'error', show: undefined},
          {key: '1.0', type: 'whenValid', show: undefined}
        ]
      },
      {
        name: 'passwordConfirm',
        validations: [
          {key: '4.0', type: 'error', show: false},
          {key: '4.1', type: 'whenValid', show: undefined}
        ]
      }
    ]);

    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
    expect(emitValidateFieldEventSpy.mock.calls).toEqual([
      [signUp.username],
      [signUp.password],
      [signUp.passwordConfirm]
    ]);

    console.log(pretty(wrapper.html()));
    expect(wrapper.html()).toEqual(`\
<form>\
<input name="username">\
<div data-feedbacks="0">\
<div data-feedback="0.0" class="error">Cannot be empty</div>\
</div>\
<input type="password" name="password">\
<div data-feedbacks="1">\
<div data-feedbacks="2">\
<div data-feedback="2.0" class="error">Cannot be empty</div>\
</div>\
<div data-feedbacks="3"></div>\
</div>\
<input type="password" name="passwordConfirm">\
<div data-feedbacks="4">\
<div data-feedback="4.1" class="valid">Looks good!</div>\
</div>\
</form>`
    );
  });
});






describe('validate', () => {
  describe('validateFields()', () => {
    test('inputs', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');
      signUp.username!.value = '';
      signUp.password!.value = '';
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
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
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

/*
test('isValid()', () => {
  const form = new_FormWithConstraints({});
  expect(form.isValid()).toEqual(true);
  // FIXME
});

test('reset()', () => {
  const form = new_FormWithConstraints({});
  form.reset();
  // FIXME
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
*/
