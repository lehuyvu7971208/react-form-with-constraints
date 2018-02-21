import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {
  FormWithConstraintsChildContext,
  FieldFeedback as _FieldFeedback,
  FieldFeedbacks as _FieldFeedbacks,
  Async as _Async,
  Input, FieldValidation, FieldEvent, FieldFeedbackValidation, Field
} from 'react-form-with-constraints';

export interface DisplayFieldsProps {}

export interface Field2 extends Partial<Field> {
  fieldFeedbackValidations?: FieldFeedbackValidation[];
}

export interface Fields2 {
  [fieldName: string]: Field2 | undefined;
}

export interface DisplayFieldsState {
  fields: Fields2;
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
    this.reset = this.reset.bind(this);
    this.fieldAdded = this.fieldAdded.bind(this);
    this.fieldRemoved = this.fieldRemoved.bind(this);
    this.fieldUpdated = this.fieldUpdated.bind(this);
  }

  componentWillMount() {
    this.context.form.addFieldValidatedEventListener(this.fieldValidated);
    this.context.form.addResetEventListener(this.reset);

    this.context.form.fieldsStore.addListener(FieldEvent.Added, this.fieldAdded);
    this.context.form.fieldsStore.addListener(FieldEvent.Removed, this.fieldRemoved);
    this.context.form.fieldsStore.addListener(FieldEvent.Updated, this.fieldUpdated);
  }

  componentWillUnmount() {
    this.context.form.removeFieldValidatedEventListener(this.fieldValidated);
    this.context.form.removeResetEventListener(this.reset);

    this.context.form.fieldsStore.removeListener(FieldEvent.Added, this.fieldAdded);
    this.context.form.fieldsStore.removeListener(FieldEvent.Removed, this.fieldRemoved);
    this.context.form.fieldsStore.removeListener(FieldEvent.Updated, this.fieldUpdated);
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

    this.setState(prevState => ({
      fields: {...prevState.fields, ...{[fieldValidation.fieldName]: fieldValidation}}
    }));
  }

  reset() {
    const { fieldsStore } = this.context.form;

    this.setState({
      fields: fieldsStore.fields
    });
  }

  render() {
    const { fields } = this.state;
    const { fieldsStore } = this.context.form;

    // Why Object.create(null) instead of just {}? See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Objects_and_maps_compared
    const merged: Fields2 = Object.create(null);

    // tslint:disable-next-line:forin
    for (const fieldName in fieldsStore.fields) {
      merged[fieldName] = {...fieldsStore.fields[fieldName], ...fields[fieldName]};
      delete (merged[fieldName] as any).fieldName;
    }

    let str = JSON.stringify(merged, null, 2);

    // See JSON.stringify without quotes on properties? https://stackoverflow.com/q/11233498
    str = str.replace(/\"([^(\")"]+)\":/g, '$1:');

    return <pre style={{fontSize: 'small'}}>react-form-with-constraints = {str}</pre>;
  }
}

export class FieldFeedbacks extends _FieldFeedbacks {
  render() {
    const style = {
    };

    return (
      <>
        <li style={style}>{this.key}</li>
        <ul>
          {super.render()}
        </ul>
      </>
    );
  }
}

export class FieldFeedback extends _FieldFeedback {
  render() {
    const { key, type, show } = this.state.validation;

    const style = {
      textDecoration: 'none'
    };
    if (show === false) {
      style.textDecoration = 'line-through';
    } else if (show === undefined) {
      style.textDecoration = 'line-through dotted';
    }

    return (
      <li>
        <span style={style}>{key} ({type})</span>{' '}
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
      textDecoration: 'line-through dotted'
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
