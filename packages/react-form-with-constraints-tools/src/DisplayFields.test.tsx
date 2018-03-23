import React from 'react';
import { shallow as _shallow } from 'enzyme';

import { FormWithConstraints, FormWithConstraintsChildContext, fieldWithoutFeedback, FieldEvent } from 'react-form-with-constraints';

import { DisplayFields } from './index';
import new_FormWithConstraints from './FormWithConstraintsEnzymeFix';

function shallow(node: React.ReactElement<{}>, options: {context: FormWithConstraintsChildContext}) {
  return _shallow<{}>(node, options);
}

let form_username: FormWithConstraints;

beforeEach(() => {
  form_username = new_FormWithConstraints({});
  form_username.fieldsStore.fields = {
    username: fieldWithoutFeedback
  };
});

test('componentWillMount() componentWillUnmount()', () => {
  const form = new_FormWithConstraints({});
  const fieldsStoreAddListenerSpy = jest.spyOn(form.fieldsStore, 'addListener');
  const fieldsStoreRemoveListenerSpy = jest.spyOn(form.fieldsStore, 'removeListener');

  const wrapper = shallow(
    <DisplayFields />,
    {context: {form}}
  );
  const displayFields = wrapper.instance() as DisplayFields;

  expect(fieldsStoreAddListenerSpy).toHaveBeenCalledTimes(3);
  expect(fieldsStoreAddListenerSpy.mock.calls).toEqual([
    [FieldEvent.Added, displayFields.fieldAdded],
    [FieldEvent.Removed, displayFields.fieldRemoved],
    [FieldEvent.Updated, displayFields.fieldUpdated]
  ]);
  expect(fieldsStoreRemoveListenerSpy).toHaveBeenCalledTimes(0);

  wrapper.unmount();
  expect(fieldsStoreAddListenerSpy).toHaveBeenCalledTimes(3);
  expect(fieldsStoreRemoveListenerSpy).toHaveBeenCalledTimes(3);
  expect(fieldsStoreRemoveListenerSpy.mock.calls).toEqual([
    [FieldEvent.Added, displayFields.fieldAdded],
    [FieldEvent.Removed, displayFields.fieldRemoved],
    [FieldEvent.Updated, displayFields.fieldUpdated]
  ]);
});

describe('render()', () => {
  test('1 field', () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    expect(wrapper.text()).toEqual(
`Fields = {
  username: {
    validateEventEmitted: false
  }
}`);

    expect(wrapper.html()).toEqual(
`<pre style="font-size:small">Fields = {
  username: {
    validateEventEmitted: false
  }
}</pre>`);
  });

  test('adding field', () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    form_username.fieldsStore.addField('password');

    // See http://airbnb.io/enzyme/docs/guides/migration-from-2-to-3.html#for-mount-updates-are-sometimes-required-when-they-werent-before
    wrapper.update();

    expect(wrapper.text()).toEqual(
`Fields = {
  username: {
    validateEventEmitted: false
  },
  password: {
    validateEventEmitted: false
  }
}`);
  });

  test('removing field', () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    form_username.fieldsStore.removeField('username');

    wrapper.update();

    expect(wrapper.text()).toEqual('Fields = {}');
  });

  test('fieldValidated()', () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    form_username.validateFields();

    // See http://airbnb.io/enzyme/docs/guides/migration-from-2-to-3.html#for-mount-updates-are-sometimes-required-when-they-werent-before
    wrapper.update();

    expect(wrapper.text()).toEqual(
`Fields = {
  username: {
    validateEventEmitted: false
  },
  password: {
    validateEventEmitted: false
  }
}`);
  });

  test('reset()', () => {
    const wrapper = shallow(
      <DisplayFields />,
      {context: {form: form_username}}
    );

    form_username.reset();

    wrapper.update();

    expect(wrapper.text()).toEqual(
`Fields = {
  username: {
    validateEventEmitted: false
  }
}`);
  });
});
