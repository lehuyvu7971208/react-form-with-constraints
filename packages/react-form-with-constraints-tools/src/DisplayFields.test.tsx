import React from 'react';
import { shallow as _shallow } from 'enzyme';

import { FormWithConstraints, FormWithConstraintsChildContext, FieldEvent, Field, FieldFeedbackValidation, FieldFeedbackType } from 'react-form-with-constraints';

import { DisplayFields } from './index';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';

function shallow(node: React.ReactElement<{}>, options: {context: FormWithConstraintsChildContext}) {
  return _shallow<{}>(node, options);
}

test('componentWillMount() componentWillUnmount()', () => {
  const form = new_FormWithConstraints({});
  const fieldsStoreAddListenerSpy = jest.spyOn(form.fieldsStore, 'addListener');
  const fieldsStoreRemoveListenerSpy = jest.spyOn(form.fieldsStore, 'removeListener');

  const wrapper = shallow(
    <DisplayFields />,
    {context: {form}}
  );
  const displayFields = wrapper.instance() as DisplayFields;

  expect(fieldsStoreAddListenerSpy).toHaveBeenCalledTimes(2);
  expect(fieldsStoreAddListenerSpy.mock.calls).toEqual([
    [FieldEvent.Added, displayFields.reRender],
    [FieldEvent.Removed, displayFields.reRender]
  ]);
  expect(fieldsStoreRemoveListenerSpy).toHaveBeenCalledTimes(0);

  wrapper.unmount();
  expect(fieldsStoreAddListenerSpy).toHaveBeenCalledTimes(2);
  expect(fieldsStoreRemoveListenerSpy).toHaveBeenCalledTimes(2);
  expect(fieldsStoreRemoveListenerSpy.mock.calls).toEqual([
    [FieldEvent.Added, displayFields.reRender],
    [FieldEvent.Removed, displayFields.reRender]
  ]);
});


describe('render()', () => {
  let form_username: FormWithConstraints;

  const validation_empty: FieldFeedbackValidation = {
    key: '0.0',
    type: FieldFeedbackType.Error,
    show: true
  };

  beforeEach(() => {
    form_username = new_FormWithConstraints({});
  });

  test('0 field', () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    expect(wrapper.text()).toEqual(`Fields = []`);
    expect(wrapper.html()).toEqual(`<pre style="font-size:small">Fields = []</pre>`);
  });

  test('add field', () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    form_username.fieldsStore.addField('username');

    // See http://airbnb.io/enzyme/docs/guides/migration-from-2-to-3.html#for-mount-updates-are-sometimes-required-when-they-werent-before
    wrapper.update();

    expect(wrapper.text()).toEqual(
`Fields = [
  {
    name: "username",
    validations: []
  }
]`);

    form_username.fieldsStore.addField('password');
    wrapper.update();
    expect(wrapper.text()).toEqual(
`Fields = [
  {
    name: "username",
    validations: []
  },
  {
    name: "password",
    validations: []
  }
]`);
  });

  test('remove field', () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    form_username.fieldsStore.addField('username');
    form_username.fieldsStore.addField('password');
    wrapper.update();
    expect(wrapper.text()).toEqual(
`Fields = [
  {
    name: "username",
    validations: []
  },
  {
    name: "password",
    validations: []
  }
]`);

    form_username.fieldsStore.removeField('password');
    wrapper.update();
    expect(wrapper.text()).toEqual(
`Fields = [
  {
    name: "username",
    validations: []
  }
]`);
  });

  test('form.emitFieldDidValidateEvent()', async () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    form_username.fieldsStore.addField('username');
    form_username.fieldsStore.addField('password');
    const username = form_username.fieldsStore.getField('username')!;
    username.addOrReplaceValidation(validation_empty);
    await form_username.emitFieldDidValidateEvent(username);

    // See http://airbnb.io/enzyme/docs/guides/migration-from-2-to-3.html#for-mount-updates-are-sometimes-required-when-they-werent-before
    wrapper.update();

    expect(wrapper.text()).toEqual(
`Fields = [
  {
    name: "username",
    validations: [
      { key: "0.0", type: "error", show: true }
    ]
  },
  {
    name: "password",
    validations: []
  }
]`);
  });

  test('form.reset()', async () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    form_username.fieldsStore.addField('username');
    form_username.fieldsStore.addField('password');
    const username = form_username.fieldsStore.getField('username')!;
    username.addOrReplaceValidation(validation_empty);
    await form_username.emitFieldDidValidateEvent(username);
    wrapper.update();
    expect(wrapper.text()).toEqual(
`Fields = [
  {
    name: "username",
    validations: [
      { key: "0.0", type: "error", show: true }
    ]
  },
  {
    name: "password",
    validations: []
  }
]`);

    await form_username.reset();
    wrapper.update();
    expect(wrapper.text()).toEqual(
`Fields = [
  {
    name: "username",
    validations: []
  },
  {
    name: "password",
    validations: []
  }
]`);
  });
});
