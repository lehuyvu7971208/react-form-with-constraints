import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {
  FormWithConstraintsChildContext,
  FieldFeedback as _FieldFeedback,
  FieldFeedbacks as _FieldFeedbacks,
  Async as _Async,
  FieldValidation, FieldEvent, FieldFeedbackValidation, Field
} from 'react-form-with-constraints';

export interface DisplayFieldsProps {}

export interface Field2 extends Partial<Field> {
  validations?: FieldFeedbackValidation[];
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

  async fieldValidated(fieldName: string, _field: Promise<FieldValidation>) {
    const field = await _field;
    this.setState(prevState => ({
      fields: {...prevState.fields, ...{[fieldName]: field}}
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
      //delete (merged[fieldName] as any).fieldName;
    }

    if (merged !== undefined) {
      // tslint:disable-next-line:forin
      for (const fieldName in merged) {
        const field = merged[fieldName]!;
        if (field.validations !== undefined) {
          const validations: string[] = [];
          for (const fieldFeedbackValidation of field.validations) {
            const fieldFeedbackValidationStr = `${stringifyWithUndefinedAndWithoutPropertyQuotes(fieldFeedbackValidation, 1)}`;
            validations.push(fieldFeedbackValidationStr);
          }
          (field as any).validations = validations;
        }
      }
    }

    let str = JSON.stringify(merged, null, 2);
    // => "{\n key: \"0.0\",\n type: \"error\",\n show: false\n}"

    str = str.replace(/\\\"/g, '"');
    // => "{\n key: "0.0",\n type: "error",\n show: false\n}"

    str = str.replace(/"{/g, '{');
    // => {\n key: "0.0",\n type: "error",\n show: false\n}"

    str = str.replace(/\\n}"/g, ' }');
    // => {\n key: "0.0",\n type: "error",\n show: false }

    str = str.replace(/\\n/g, '');
    // => { key: "0.0", type: "error", show: false }

    return <pre style={{fontSize: 'small'}}>react-form-with-constraints = {str}</pre>;
  }
}

// See Preserving undefined that JSON.stringify otherwise removes https://stackoverflow.com/q/26540706
// See JSON.stringify without quotes on properties? https://stackoverflow.com/q/11233498
function stringifyWithUndefinedAndWithoutPropertyQuotes(obj: object, space?: string | number) {
  let str = JSON.stringify(obj, (_key, value) => value === undefined ? '__undefined__' : value, space);
  str = str.replace(/\"__undefined__\"/g, 'undefined');
  str = str.replace(/\"([^(\")"]+)\":/g, '$1:');
  return str;
}

export class FieldFeedbacks extends _FieldFeedbacks {
  render() {
    const { for: fieldName, stop } = this.props;

    let attr = '';
    if (fieldName) attr += `for="${fieldName}" `;
    attr += `stop="${stop}"`;

    return (
      <>
        <li>key="{this.key}" {attr}</li>
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

    let textDecoration = '';
    switch (show) {
      case false:
        textDecoration = 'line-through';
        break;
      case undefined:
        textDecoration = 'line-through dotted';
        break;
    }

    return (
      <li>
        <span style={{textDecoration}}>key="{key}" type="{type}"</span>{' '}
        {super.render()}
      </li>
    );
  }

  componentDidUpdate() {
    const rootDiv = ReactDOM.findDOMNode(this);
    const fieldFeedbackDiv = rootDiv.querySelector('[data-feedback]');
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
