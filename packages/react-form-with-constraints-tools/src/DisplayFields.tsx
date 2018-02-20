import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {
  FormWithConstraintsChildContext,
  FieldFeedback as _FieldFeedback,
  FieldFeedbacks as _FieldFeedbacks,
  Async as _Async,
  Input, FieldValidation, FieldEvent
} from 'react-form-with-constraints';

export interface DisplayFieldsProps {}

export interface Fields {
  [fieldName: string]: FieldValidation;
}

export interface DisplayFieldsState {
  fields: Fields;
}

export class DisplayFields extends React.Component<DisplayFieldsProps, DisplayFieldsState> {
  static contextTypes: React.ValidationMap<FormWithConstraintsChildContext> = {
    form: PropTypes.object.isRequired
  };
  context!: FormWithConstraintsChildContext;

  constructor(props: DisplayFieldsProps) {
    super(props);

    this.state = {
      // Why Object.create(null) instead of just {}? See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Objects_and_maps_compared
      fields: Object.create(null)
    };

    this.fieldValidated = this.fieldValidated.bind(this);
    this.fieldAdded = this.fieldAdded.bind(this);
    this.fieldRemoved = this.fieldRemoved.bind(this);
    this.fieldUpdated = this.fieldUpdated.bind(this);
  }

  componentWillMount() {
    this.context.form.fieldsStore.addListener(FieldEvent.Added, this.fieldAdded);
    this.context.form.fieldsStore.addListener(FieldEvent.Removed, this.fieldRemoved);
    this.context.form.fieldsStore.addListener(FieldEvent.Updated, this.fieldUpdated);

    this.context.form.addFieldValidatedEventListener(this.fieldValidated);
  }

  componentWillUnmount() {
    this.context.form.fieldsStore.removeListener(FieldEvent.Added, this.fieldAdded);
    this.context.form.fieldsStore.removeListener(FieldEvent.Removed, this.fieldRemoved);
    this.context.form.fieldsStore.removeListener(FieldEvent.Updated, this.fieldUpdated);

    this.context.form.removeFieldValidatedEventListener(this.fieldValidated);
  }

  fieldAdded() {
    this.forceUpdate();
  }

  fieldRemoved() {
    this.forceUpdate();
  }

  fieldUpdated() {
    this.forceUpdate();
  }

  async fieldValidated(_input: Input, fieldValidationPromise: Promise<FieldValidation>) {
    const fieldValidation = await fieldValidationPromise;
    this.setState(prevState => (
      {fields: {...prevState.fields, ...{[fieldValidation.fieldName]: fieldValidation}}}
    ));
  }

  render() {
    const { fields } = this.state;

    // Why Object.create(null) instead of just {}? See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Objects_and_maps_compared
    let merged = Object.create(null);

    // tslint:disable-next-line:forin
    for (const fieldName in this.context.form.fieldsStore.fields) {
      merged[fieldName] = {...this.context.form.fieldsStore.fields[fieldName], ...fields[fieldName]};
      delete merged[fieldName].fieldName;
    }

    merged = JSON.stringify(merged, null, 2);

    // See JSON.stringify without quotes on properties? https://stackoverflow.com/q/11233498
    merged = merged.replace(/\"([^(\")"]+)\":/g, '$1:');

    return <pre style={{fontSize: 'small'}}>react-form-with-constraints = {merged}</pre>;
  }
}

export class FieldFeedbacks extends _FieldFeedbacks {
  render() {
    return (
      <>
        <span style={{fontSize: 'small'}}>{this.key}</span>
        <ul>
          {super.render()}
        </ul>
      </>
    );
  }
}

export class FieldFeedback extends _FieldFeedback {
  render() {
    const { show } = this.state.validation;

    const style: any = {
      fontSize: 'small'
    };

    if (show === false) {
      style.textDecoration = 'line-through';
    } else if (show === undefined) {
      // Special case for when="valid": always displayed, then FieldFeedbackWhenValid decides what to do
      style.filter = 'brightness(300%)';
    }

    return (
      <li>
        <span style={style}>{this.key}</span>{' '}
        {super.render()}
      </li>
    );
  }

  componentDidUpdate() {
    const rootDiv = ReactDOM.findDOMNode(this);
    const fieldFeedbackDiv = rootDiv.querySelector('[data-field-feedback-key]');
    if (fieldFeedbackDiv !== null) {
      (fieldFeedbackDiv as HTMLDivElement).style.display = 'inline';
    }
  }
}

export class Async<T> extends _Async<T> {
  render() {
    const style = {
      fontSize: 'small',
      filter: 'brightness(300%)'
    };

    return (
      <li>
        <span style={style}>Async</span>
        <ul>
          {super.render()}
        </ul>
      </li>
    );
  }
}
