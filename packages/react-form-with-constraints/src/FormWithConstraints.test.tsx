import React from 'react';
import { mount as _mount } from 'enzyme';

import { FormWithConstraints, FormWithConstraintsProps, FieldFeedbacksProps, FieldFeedback, Async } from './index';
import { SignUp } from './SignUp';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';
import sleep from './sleep';
import beautifyHtml from './beautifyHtml';

function mount(node: React.ReactElement<FormWithConstraintsProps>) {
  return _mount<FormWithConstraintsProps, {}>(node);
}

test('constructor()', () => {
  const form = new_FormWithConstraints({});
  expect(form.fieldsStore.fields).toEqual([]);
});

test('computeFieldFeedbacksKey()', () => {
  const form = new_FormWithConstraints({});
  expect(form.computeFieldFeedbacksKey()).toEqual('0');
  expect(form.computeFieldFeedbacksKey()).toEqual('1');
  expect(form.computeFieldFeedbacksKey()).toEqual('2');
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

  test('stop="first"', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="first" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before Async</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-error"', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="first-error" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before Async</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-warning"', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="first-warning" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before Async</div>
          <div data-feedback="0.1" class="warning">Warning before Async</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-info"', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="first-info" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before Async</div>
          <div data-feedback="0.1" class="warning">Warning before Async</div>
          <div data-feedback="0.2" class="info">Info before Async</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="no"', async () => {
    const wrapper = mount(<FormWithBeforeAsync inputStop="no" />);
    const form = wrapper.instance() as FormWithBeforeAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before Async</div>
          <div data-feedback="0.1" class="warning">Warning before Async</div>
          <div data-feedback="0.2" class="info">Info before Async</div>
          <div data-feedback="0.3" class="error">Async error</div>
        </div>
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

  test('stop="first"', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="first" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.3" class="error">Async error</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-error"', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="first-error" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.3" class="error">Async error</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-warning"', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="first-warning" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.3" class="error">Async error</div>
          <div data-feedback="0.0" class="error">Error after Async</div>
          <div data-feedback="0.1" class="warning">Warning after Async</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-info"', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="first-info" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.3" class="error">Async error</div>
          <div data-feedback="0.0" class="error">Error after Async</div>
          <div data-feedback="0.1" class="warning">Warning after Async</div>
          <div data-feedback="0.2" class="info">Info after Async</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="no"', async () => {
    const wrapper = mount(<FormWithAfterAsync inputStop="no" />);
    const form = wrapper.instance() as FormWithAfterAsync;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.3" class="error">Async error</div>
          <div data-feedback="0.0" class="error">Error after Async</div>
          <div data-feedback="0.1" class="warning">Warning after Async</div>
          <div data-feedback="0.2" class="info">Info after Async</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });
});

describe('FormWithNestedFieldFeedbacks2', () => {
  class FormWithNestedFieldFeedbacks2 extends React.Component<FormProps> {
    formWithConstraints: FormWithConstraints | null | undefined;
    input: HTMLInputElement | null | undefined;

    render() {
      const { inputStop } = this.props;

      return (
        <FormWithConstraints ref={formWithConstraints => this.formWithConstraints = formWithConstraints}>
          <input name="input" ref={input => this.input = input} />
          <FieldFeedbacks for="input" stop={inputStop}>
            <FieldFeedbacks stop="no">
              <FieldFeedback when={() => true}>Error before Async1</FieldFeedback>
            </FieldFeedbacks>

            <FieldFeedbacks stop="no">
              <Async
                promise={() => sleep(10)}
                then={() => <FieldFeedback warning>Async1 warning</FieldFeedback>}
              />
            </FieldFeedbacks>

            <FieldFeedbacks stop="no">
              <FieldFeedback when={() => true} info>Info after Async1</FieldFeedback>
            </FieldFeedbacks>

            <FieldFeedbacks stop="no">
              <Async
                promise={() => sleep(10)}
                then={() => <FieldFeedback warning>Async2 warning</FieldFeedback>}
              />
            </FieldFeedbacks>
          </FieldFeedbacks>
        </FormWithConstraints>
      );
    }
  }

  test('stop="first"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks2 inputStop="first" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks2;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedbacks="0.0">
            <div data-feedback="0.0.0" class="error">Error before Async1</div>
          </div>
          <div data-feedbacks="0.1"></div>
          <div data-feedbacks="0.2"></div>
          <div data-feedbacks="0.3"></div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-error"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks2 inputStop="first-error" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks2;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedbacks="0.0">
            <div data-feedback="0.0.0" class="error">Error before Async1</div>
          </div>
          <div data-feedbacks="0.1"></div>
          <div data-feedbacks="0.2"></div>
          <div data-feedbacks="0.3"></div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-warning"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks2 inputStop="first-warning" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks2;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedbacks="0.0">
            <div data-feedback="0.0.0" class="error">Error before Async1</div>
          </div>
          <div data-feedbacks="0.1">
            <div data-feedback="0.1.0" class="warning">Async1 warning</div>
          </div>
          <div data-feedbacks="0.2"></div>
          <div data-feedbacks="0.3"></div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-info"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks2 inputStop="first-info" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks2;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedbacks="0.0">
            <div data-feedback="0.0.0" class="error">Error before Async1</div>
          </div>
          <div data-feedbacks="0.1">
            <div data-feedback="0.1.0" class="warning">Async1 warning</div>
          </div>
          <div data-feedbacks="0.2">
            <div data-feedback="0.2.0" class="info">Info after Async1</div>
          </div>
          <div data-feedbacks="0.3"></div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="no"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks2 inputStop="no" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks2;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedbacks="0.0">
            <div data-feedback="0.0.0" class="error">Error before Async1</div>
          </div>
          <div data-feedbacks="0.1">
            <div data-feedback="0.1.0" class="warning">Async1 warning</div>
          </div>
          <div data-feedbacks="0.2">
            <div data-feedback="0.2.0" class="info">Info after Async1</div>
          </div>
          <div data-feedbacks="0.3">
            <div data-feedback="0.3.0" class="warning">Async2 warning</div>
          </div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });
});

// FIXME simplify?
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

  test('stop="first"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks fieldFeedbacksWithBeforeAsyncStop="first" fieldFeedbacksWithAfterAsyncStop="first" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before FieldFeedbacks</div>
          <div data-feedback="0.1" class="warning">Warning before FieldFeedbacks</div>
          <div data-feedback="0.2" class="info">Info before FieldFeedbacks</div>
          <div data-feedbacks="0.3">
            <div data-feedback="0.3.0" class="error">Error before Async</div>
          </div>
          <div data-feedbacks="0.4">
            <div data-feedback="0.4.3" class="error">Async error</div>
          </div>
          <div data-feedback="0.5" class="error">Error after FieldFeedbacks</div>
          <div data-feedback="0.6" class="warning">Warning after FieldFeedbacks</div>
          <div data-feedback="0.7" class="info">Info after FieldFeedbacks</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-error"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks fieldFeedbacksWithBeforeAsyncStop="first-error" fieldFeedbacksWithAfterAsyncStop="first-error" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before FieldFeedbacks</div>
          <div data-feedback="0.1" class="warning">Warning before FieldFeedbacks</div>
          <div data-feedback="0.2" class="info">Info before FieldFeedbacks</div>
          <div data-feedbacks="0.3">
            <div data-feedback="0.3.0" class="error">Error before Async</div>
          </div>
          <div data-feedbacks="0.4">
            <div data-feedback="0.4.3" class="error">Async error</div>
          </div>
          <div data-feedback="0.5" class="error">Error after FieldFeedbacks</div>
          <div data-feedback="0.6" class="warning">Warning after FieldFeedbacks</div>
          <div data-feedback="0.7" class="info">Info after FieldFeedbacks</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-warning"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks fieldFeedbacksWithBeforeAsyncStop="first-warning" fieldFeedbacksWithAfterAsyncStop="first-warning" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before FieldFeedbacks</div>
          <div data-feedback="0.1" class="warning">Warning before FieldFeedbacks</div>
          <div data-feedback="0.2" class="info">Info before FieldFeedbacks</div>
          <div data-feedbacks="0.3">
            <div data-feedback="0.3.0" class="error">Error before Async</div>
            <div data-feedback="0.3.1" class="warning">Warning before Async</div>
          </div>
          <div data-feedbacks="0.4">
            <div data-feedback="0.4.3" class="error">Async error</div>
            <div data-feedback="0.4.0" class="error">Error after Async</div>
            <div data-feedback="0.4.1" class="warning">Warning after Async</div>
          </div>
          <div data-feedback="0.5" class="error">Error after FieldFeedbacks</div>
          <div data-feedback="0.6" class="warning">Warning after FieldFeedbacks</div>
          <div data-feedback="0.7" class="info">Info after FieldFeedbacks</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="first-info"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks fieldFeedbacksWithBeforeAsyncStop="first-info" fieldFeedbacksWithAfterAsyncStop="first-info" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before FieldFeedbacks</div>
          <div data-feedback="0.1" class="warning">Warning before FieldFeedbacks</div>
          <div data-feedback="0.2" class="info">Info before FieldFeedbacks</div>
          <div data-feedbacks="0.3">
            <div data-feedback="0.3.0" class="error">Error before Async</div>
            <div data-feedback="0.3.1" class="warning">Warning before Async</div>
            <div data-feedback="0.3.2" class="info">Info before Async</div>
          </div>
          <div data-feedbacks="0.4">
            <div data-feedback="0.4.3" class="error">Async error</div>
            <div data-feedback="0.4.0" class="error">Error after Async</div>
            <div data-feedback="0.4.1" class="warning">Warning after Async</div>
            <div data-feedback="0.4.2" class="info">Info after Async</div>
          </div>
          <div data-feedback="0.5" class="error">Error after FieldFeedbacks</div>
          <div data-feedback="0.6" class="warning">Warning after FieldFeedbacks</div>
          <div data-feedback="0.7" class="info">Info after FieldFeedbacks</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('stop="no"', async () => {
    const wrapper = mount(<FormWithNestedFieldFeedbacks fieldFeedbacksWithBeforeAsyncStop="no" fieldFeedbacksWithAfterAsyncStop="no" />);
    const form = wrapper.instance() as FormWithNestedFieldFeedbacks;

    await form.formWithConstraints!.validateFields(form.input!);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="input">
        <div data-feedbacks="0">
          <div data-feedback="0.0" class="error">Error before FieldFeedbacks</div>
          <div data-feedback="0.1" class="warning">Warning before FieldFeedbacks</div>
          <div data-feedback="0.2" class="info">Info before FieldFeedbacks</div>
          <div data-feedbacks="0.3">
            <div data-feedback="0.3.0" class="error">Error before Async</div>
            <div data-feedback="0.3.1" class="warning">Warning before Async</div>
            <div data-feedback="0.3.2" class="info">Info before Async</div>
            <div data-feedback="0.3.3" class="error">Async error</div>
          </div>
          <div data-feedbacks="0.4">
            <div data-feedback="0.4.3" class="error">Async error</div>
            <div data-feedback="0.4.0" class="error">Error after Async</div>
            <div data-feedback="0.4.1" class="warning">Warning after Async</div>
            <div data-feedback="0.4.2" class="info">Info after Async</div>
          </div>
          <div data-feedback="0.5" class="error">Error after FieldFeedbacks</div>
          <div data-feedback="0.6" class="warning">Warning after FieldFeedbacks</div>
          <div data-feedback="0.7" class="info">Info after FieldFeedbacks</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });
});

describe('validate', () => {
  describe('validateFields()', () => {
    test('inputs', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');

      signUp.username!.value = 'john';
      signUp.password!.value = '123456';
      signUp.passwordConfirm!.value = '12345';

      const fields = await signUp.form!.validateFields(signUp.username!, signUp.password!, signUp.passwordConfirm!);
      expect(fields).toEqual([
        {
          name: 'username',
          validations: [
            {key: '0.0', type: 'error', show: false},
            {key: '0.1', type: 'error', show: false},
            {key: '0.3', type: 'error', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'password',
          validations: [
            {key: '1.0', type: 'error', show: false},
            {key: '1.1', type: 'error', show: false},
            {key: '1.2', type: 'warning', show: false},
            {key: '1.3', type: 'warning', show: true},
            {key: '1.4', type: 'warning', show: true},
            {key: '1.5', type: 'warning', show: true},
            {key: '1.6', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'passwordConfirm',
          validations: [
            {key: '2.0', type: 'error', show: true},
            {key: '2.1', type: 'whenValid', show: undefined}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      expect(beautifyHtml(wrapper.html(), '        ')).toEqual(`\
        <form>
          <input name="username">
          <div data-feedbacks="0">
            <div data-feedback="0.3" class="error">Username 'john' already taken, choose another</div>
          </div>
          <input type="password" name="password">
          <div data-feedbacks="1">
            <div data-feedback="1.3" class="warning">Should contain small letters</div>
            <div data-feedback="1.4" class="warning">Should contain capital letters</div>
            <div data-feedback="1.5" class="warning">Should contain special characters</div>
            <div data-feedback="1.6" class="valid">Looks good!</div>
          </div>
          <input type="password" name="passwordConfirm">
          <div data-feedbacks="2">
            <div data-feedback="2.0" class="error">Not the same password</div>
          </div>
        </form>`
      );

      wrapper.unmount();
    });

    test('field names', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');

      signUp.username!.value = 'john';
      signUp.password!.value = '123456';
      signUp.passwordConfirm!.value = '12345';

      const fields = await signUp.form!.validateFields('username', 'password', 'passwordConfirm');
      expect(fields).toEqual([
        {
          name: 'username',
          validations: [
            {key: '0.0', type: 'error', show: false},
            {key: '0.1', type: 'error', show: false},
            {key: '0.3', type: 'error', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'password',
          validations: [
            {key: '1.0', type: 'error', show: false},
            {key: '1.1', type: 'error', show: false},
            {key: '1.2', type: 'warning', show: false},
            {key: '1.3', type: 'warning', show: true},
            {key: '1.4', type: 'warning', show: true},
            {key: '1.5', type: 'warning', show: true},
            {key: '1.6', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'passwordConfirm',
          validations: [
            {key: '2.0', type: 'error', show: true},
            {key: '2.1', type: 'whenValid', show: undefined}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      wrapper.unmount();
    });

    test('inputs + field names', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');

      signUp.username!.value = 'john';
      signUp.password!.value = '123456';
      signUp.passwordConfirm!.value = '12345';

      const fields = await signUp.form!.validateFields(signUp.username!, 'password', signUp.passwordConfirm!);
      expect(fields).toEqual([
        {
          name: 'username',
          validations: [
            {key: '0.0', type: 'error', show: false},
            {key: '0.1', type: 'error', show: false},
            {key: '0.3', type: 'error', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'password',
          validations: [
            {key: '1.0', type: 'error', show: false},
            {key: '1.1', type: 'error', show: false},
            {key: '1.2', type: 'warning', show: false},
            {key: '1.3', type: 'warning', show: true},
            {key: '1.4', type: 'warning', show: true},
            {key: '1.5', type: 'warning', show: true},
            {key: '1.6', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'passwordConfirm',
          validations: [
            {key: '2.0', type: 'error', show: true},
            {key: '2.1', type: 'whenValid', show: undefined}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      wrapper.unmount();
    });

    test('without arguments', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');

      signUp.username!.value = 'john';
      signUp.password!.value = '123456';
      signUp.passwordConfirm!.value = '12345';

      const fields = await signUp.form!.validateFields();
      expect(fields).toEqual([
        {
          name: 'username',
          validations: [
            {key: '0.0', type: 'error', show: false},
            {key: '0.1', type: 'error', show: false},
            {key: '0.3', type: 'error', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'password',
          validations: [
            {key: '1.0', type: 'error', show: false},
            {key: '1.1', type: 'error', show: false},
            {key: '1.2', type: 'warning', show: false},
            {key: '1.3', type: 'warning', show: true},
            {key: '1.4', type: 'warning', show: true},
            {key: '1.5', type: 'warning', show: true},
            {key: '1.6', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'passwordConfirm',
          validations: [
            {key: '2.0', type: 'error', show: true},
            {key: '2.1', type: 'whenValid', show: undefined}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      wrapper.unmount();
    });

    test('change inputs', async () => {
      const wrapper = mount(<SignUp />);
      const signUp = wrapper.instance() as SignUp;
      const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');

      signUp.username!.value = '';
      signUp.password!.value = '';
      signUp.passwordConfirm!.value = '';

      let fields = await signUp.form!.validateFields();
      expect(fields).toEqual([
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
            {key: '1.0', type: 'error', show: true},
            {key: '1.1', type: 'error', show: undefined},
            {key: '1.2', type: 'warning', show: undefined},
            {key: '1.3', type: 'warning', show: undefined},
            {key: '1.4', type: 'warning', show: undefined},
            {key: '1.5', type: 'warning', show: undefined},
            {key: '1.6', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'passwordConfirm',
          validations: [
            {key: '2.0', type: 'error', show: false},
            {key: '2.1', type: 'whenValid', show: undefined}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      emitValidateFieldEventSpy.mockClear();

      signUp.username!.value = 'john';
      signUp.password!.value = '123456';
      signUp.passwordConfirm!.value = '12345';

      fields = await signUp.form!.validateFields();
      expect(fields).toEqual([
        {
          name: 'username',
          validations: [
            {key: '0.0', type: 'error', show: false},
            {key: '0.1', type: 'error', show: false},
            {key: '0.3', type: 'error', show: true},
            {key: '0.2', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'password',
          validations: [
            {key: '1.0', type: 'error', show: false},
            {key: '1.1', type: 'error', show: false},
            {key: '1.2', type: 'warning', show: false},
            {key: '1.3', type: 'warning', show: true},
            {key: '1.4', type: 'warning', show: true},
            {key: '1.5', type: 'warning', show: true},
            {key: '1.6', type: 'whenValid', show: undefined}
          ]
        },
        {
          name: 'passwordConfirm',
          validations: [
            {key: '2.0', type: 'error', show: true},
            {key: '2.1', type: 'whenValid', show: undefined}
          ]
        }
      ]);
      expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
      expect(emitValidateFieldEventSpy.mock.calls).toEqual([
        [signUp.username],
        [signUp.password],
        [signUp.passwordConfirm]
      ]);

      expect(beautifyHtml(wrapper.html(), '        ')).toEqual(`\
        <form>
          <input name="username">
          <div data-feedbacks="0">
            <div data-feedback="0.3" class="error">Username 'john' already taken, choose another</div>
          </div>
          <input type="password" name="password">
          <div data-feedbacks="1">
            <div data-feedback="1.3" class="warning">Should contain small letters</div>
            <div data-feedback="1.4" class="warning">Should contain capital letters</div>
            <div data-feedback="1.5" class="warning">Should contain special characters</div>
            <div data-feedback="1.6" class="valid">Looks good!</div>
          </div>
          <input type="password" name="passwordConfirm">
          <div data-feedbacks="2">
            <div data-feedback="2.0" class="error">Not the same password</div>
          </div>
        </form>`
      );

      wrapper.unmount();
    });
  });

  test('validateForm()', async () => {
    const wrapper = mount(<SignUp />);
    const signUp = wrapper.instance() as SignUp;
    const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');

    signUp.username!.value = 'john';
    signUp.password!.value = '123456';
    signUp.passwordConfirm!.value = '12345';

    const fields1 = await signUp.form!.validateForm();
    expect(fields1).toEqual([
      {
        name: 'username',
        validations: [
          {key: '0.0', type: 'error', show: false},
          {key: '0.1', type: 'error', show: false},
          {key: '0.3', type: 'error', show: true},
          {key: '0.2', type: 'whenValid', show: undefined}
        ]
      },
      {
        name: 'password',
        validations: [
          {key: '1.0', type: 'error', show: false},
          {key: '1.1', type: 'error', show: false},
          {key: '1.2', type: 'warning', show: false},
          {key: '1.3', type: 'warning', show: true},
          {key: '1.4', type: 'warning', show: true},
          {key: '1.5', type: 'warning', show: true},
          {key: '1.6', type: 'whenValid', show: undefined}
        ]
      },
      {
        name: 'passwordConfirm',
        validations: [
          {key: '2.0', type: 'error', show: true},
          {key: '2.1', type: 'whenValid', show: undefined}
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

    emitValidateFieldEventSpy.mockClear();

    signUp.username!.value = 'jimmy';
    signUp.password!.value = '12345';
    signUp.passwordConfirm!.value = '12345';

    const fields2 = await signUp.form!.validateForm();
    expect(fields2).toEqual(fields1);
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(0);
    expect(emitValidateFieldEventSpy.mock.calls).toEqual([]);

    wrapper.unmount();
  });

  describe('normalizeInputs', () => {
    test('Multiple elements matching', async () => {
      const wrapper = mount(
        <FormWithConstraints>
          <input name="username" />
          <FieldFeedbacks for="username" />

          <input type="password" name="password" />
          <input type="password" name="password" />
          <input type="password" name="password" />
          <FieldFeedbacks for="password" />
        </FormWithConstraints>
      );
      const form = wrapper.instance() as FormWithConstraints;

      // See async/await toThrow is not working https://github.com/facebook/jest/issues/1700

      await expect(form.validateFields('username')).resolves.toEqual([{name: 'username', validations: []}]);
      await expect(form.validateFields()).rejects.toEqual(new Error(`Multiple elements matching '[name="password"]' inside the form`));
      await expect(form.validateFields('password')).rejects.toEqual(new Error(`Multiple elements matching '[name="password"]' inside the form`));

      wrapper.unmount();
    });

    test('Could not find field', async () => {
      const wrapper = mount(
        <FormWithConstraints>
          <input name="username" />
        </FormWithConstraints>
      );
      const form = wrapper.instance() as FormWithConstraints;

      await expect(form.validateFields()).resolves.toEqual([]); // Ignore input without FieldFeedbacks
      await expect(form.validateFields('unknown')).rejects.toEqual(new Error(`Could not find field '[name="unknown"]' inside the form`));

      wrapper.unmount();
    });

    test('Could not find field - child with props undefined', async () => {
      const wrapper = mount(
        <FormWithConstraints>
          ChildWithPropsUndefined
        </FormWithConstraints>
      );
      const form = wrapper.instance() as FormWithConstraints;

      await expect(form.validateFields()).resolves.toEqual([]);
      await expect(form.validateFields('unknown')).rejects.toEqual(new Error(`Could not find field '[name="unknown"]' inside the form`));

      wrapper.unmount();
    });
  });
});

describe('Async', () => {
  test('then', async () => {
    const wrapper = mount(<SignUp />);
    const signUp = wrapper.instance() as SignUp;
    const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');

    signUp.username!.value = 'jimmy';
    signUp.password!.value = '12345';
    signUp.passwordConfirm!.value = '12345';

    const fields = await signUp.form!.validateFields();
    expect(fields).toEqual([
      {
        name: 'username',
        validations: [
          {key: '0.0', type: 'error', show: false},
          {key: '0.1', type: 'error', show: false},
          {key: '0.3', type: 'info', show: true},
          {key: '0.2', type: 'whenValid', show: undefined}
        ]
      },
      {
        name: 'password',
        validations: [
          {key: '1.0', type: 'error', show: false},
          {key: '1.1', type: 'error', show: false},
          {key: '1.2', type: 'warning', show: false},
          {key: '1.3', type: 'warning', show: true},
          {key: '1.4', type: 'warning', show: true},
          {key: '1.5', type: 'warning', show: true},
          {key: '1.6', type: 'whenValid', show: undefined}
        ]
      },
      {
        name: 'passwordConfirm',
        validations: [
          {key: '2.0', type: 'error', show: false},
          {key: '2.1', type: 'whenValid', show: undefined}
        ]
      }
    ]);
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
    expect(emitValidateFieldEventSpy.mock.calls).toEqual([
      [signUp.username],
      [signUp.password],
      [signUp.passwordConfirm]
    ]);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="username">
        <div data-feedbacks="0">
          <div data-feedback="0.3" class="info">Username 'jimmy' available</div>
          <div data-feedback="0.2" class="valid">Looks good!</div>
        </div>
        <input type="password" name="password">
        <div data-feedbacks="1">
          <div data-feedback="1.3" class="warning">Should contain small letters</div>
          <div data-feedback="1.4" class="warning">Should contain capital letters</div>
          <div data-feedback="1.5" class="warning">Should contain special characters</div>
          <div data-feedback="1.6" class="valid">Looks good!</div>
        </div>
        <input type="password" name="passwordConfirm">
        <div data-feedbacks="2">
          <div data-feedback="2.1" class="valid">Looks good!</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });

  test('catch', async () => {
    const wrapper = mount(<SignUp />);
    const signUp = wrapper.instance() as SignUp;
    const emitValidateFieldEventSpy = jest.spyOn(signUp.form!, 'emitValidateFieldEvent');

    signUp.username!.value = 'error';
    signUp.password!.value = '123456';
    signUp.passwordConfirm!.value = '12345';

    const fields = await signUp.form!.validateFields();
    expect(fields).toEqual([
      {
        name: 'username',
        validations: [
          {key: '0.0', type: 'error', show: false},
          {key: '0.1', type: 'error', show: false},
          {key: '0.3', type: 'error', show: true},
          {key: '0.2', type: 'whenValid', show: undefined}
        ]
      },
      {
        name: 'password',
        validations: [
          {key: '1.0', type: 'error', show: false},
          {key: '1.1', type: 'error', show: false},
          {key: '1.2', type: 'warning', show: false},
          {key: '1.3', type: 'warning', show: true},
          {key: '1.4', type: 'warning', show: true},
          {key: '1.5', type: 'warning', show: true},
          {key: '1.6', type: 'whenValid', show: undefined}
        ]
      },
      {
        name: 'passwordConfirm',
        validations: [
          {key: '2.0', type: 'error', show: true},
          {key: '2.1', type: 'whenValid', show: undefined}
        ]
      }
    ]);
    expect(emitValidateFieldEventSpy).toHaveBeenCalledTimes(3);
    expect(emitValidateFieldEventSpy.mock.calls).toEqual([
      [signUp.username],
      [signUp.password],
      [signUp.passwordConfirm]
    ]);

    expect(beautifyHtml(wrapper.html(), '      ')).toEqual(`\
      <form>
        <input name="username">
        <div data-feedbacks="0">
          <div data-feedback="0.3" class="error">Something wrong with username 'error'</div>
        </div>
        <input type="password" name="password">
        <div data-feedbacks="1">
          <div data-feedback="1.3" class="warning">Should contain small letters</div>
          <div data-feedback="1.4" class="warning">Should contain capital letters</div>
          <div data-feedback="1.5" class="warning">Should contain special characters</div>
          <div data-feedback="1.6" class="valid">Looks good!</div>
        </div>
        <input type="password" name="passwordConfirm">
        <div data-feedbacks="2">
          <div data-feedback="2.0" class="error">Not the same password</div>
        </div>
      </form>`
    );

    wrapper.unmount();
  });
});

test('isValid()', async () => {
  const wrapper = mount(<SignUp />);
  const signUp = wrapper.instance() as SignUp;

  signUp.username!.value = 'john';
  signUp.password!.value = '123456';
  signUp.passwordConfirm!.value = '12345';

  let fields = await signUp.form!.validateFields(signUp.username!, signUp.password!, signUp.passwordConfirm!);
  expect(fields.every(field => field.isValid())).toEqual(false);
  expect(signUp.form!.isValid()).toEqual(false);

  signUp.username!.value = 'jimmy';
  signUp.password!.value = '12345';
  signUp.passwordConfirm!.value = '12345';

  fields = await signUp.form!.validateFields(signUp.username!, signUp.password!, signUp.passwordConfirm!);
  expect(fields.every(field => field.isValid())).toEqual(true);
  expect(signUp.form!.isValid()).toEqual(true);

  wrapper.unmount();
});

test('reset()', async () => {
  const wrapper = mount(<SignUp />);
  const signUp = wrapper.instance() as SignUp;

  signUp.username!.value = 'john';
  signUp.password!.value = '123456';
  signUp.passwordConfirm!.value = '12345';

  await signUp.form!.validateFields();

  expect(beautifyHtml(wrapper.html(), '    ')).toEqual(`\
    <form>
      <input name="username">
      <div data-feedbacks="0">
        <div data-feedback="0.3" class="error">Username 'john' already taken, choose another</div>
      </div>
      <input type="password" name="password">
      <div data-feedbacks="1">
        <div data-feedback="1.3" class="warning">Should contain small letters</div>
        <div data-feedback="1.4" class="warning">Should contain capital letters</div>
        <div data-feedback="1.5" class="warning">Should contain special characters</div>
        <div data-feedback="1.6" class="valid">Looks good!</div>
      </div>
      <input type="password" name="passwordConfirm">
      <div data-feedbacks="2">
        <div data-feedback="2.0" class="error">Not the same password</div>
      </div>
    </form>`
  );

  await signUp.form!.reset();

  expect(beautifyHtml(wrapper.html(), '    ')).toEqual(`\
    <form>
      <input name="username">
      <div data-feedbacks="0"></div>
      <input type="password" name="password">
      <div data-feedbacks="1"></div>
      <input type="password" name="passwordConfirm">
      <div data-feedbacks="2"></div>
    </form>`
  );

  signUp.username!.value = 'jimmy';
  signUp.password!.value = '12345';
  signUp.passwordConfirm!.value = '12345';

  await signUp.form!.validateFields();

  expect(beautifyHtml(wrapper.html(), '    ')).toEqual(`\
    <form>
      <input name="username">
      <div data-feedbacks="0">
        <div data-feedback="0.4" class="info">Username 'jimmy' available</div>
        <div data-feedback="0.2" class="valid">Looks good!</div>
      </div>
      <input type="password" name="password">
      <div data-feedbacks="1">
        <div data-feedback="1.3" class="warning">Should contain small letters</div>
        <div data-feedback="1.4" class="warning">Should contain capital letters</div>
        <div data-feedback="1.5" class="warning">Should contain special characters</div>
        <div data-feedback="1.6" class="valid">Looks good!</div>
      </div>
      <input type="password" name="passwordConfirm">
      <div data-feedbacks="2">
        <div data-feedback="2.1" class="valid">Looks good!</div>
      </div>
    </form>`
  );

  wrapper.unmount();
});
