import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import {
  FormWithConstraintsChildContext,
  FieldFeedback as _FieldFeedback, FieldFeedbackType,
  FieldFeedbacks as _FieldFeedbacks,
  Async as _Async,
  FieldEvent
} from 'react-form-with-constraints';

export interface DisplayFieldsProps {}

export class DisplayFields extends React.Component<DisplayFieldsProps> {
  static contextTypes: React.ValidationMap<FormWithConstraintsChildContext> = {
    form: PropTypes.object.isRequired
  };
  context!: FormWithConstraintsChildContext;

  constructor(props: DisplayFieldsProps) {
    super(props);

    this.fieldAdded = this.fieldAdded.bind(this);
    this.fieldRemoved = this.fieldRemoved.bind(this);
  }

  componentWillMount() {
    this.context.form.fieldsStore.addListener(FieldEvent.Added, this.fieldAdded);
    this.context.form.fieldsStore.addListener(FieldEvent.Removed, this.fieldRemoved);
  }

  componentWillUnmount() {
    this.context.form.fieldsStore.removeListener(FieldEvent.Added, this.fieldAdded);
    this.context.form.fieldsStore.removeListener(FieldEvent.Removed, this.fieldRemoved);
  }

  fieldAdded() {
    //this.forceUpdate();
  }

  fieldRemoved() {
    //this.forceUpdate();
  }

  render() {
    let str = stringifyWithUndefinedAndWithoutPropertyQuotes(this.context.form.fieldsStore, 2);
    //let str = JSON.stringify(this.context.form.fieldsStore, null, 2);

    // Cosmetic: improve formatting
    //
    // Replace this string:
    // {
    //   key: "1.0",
    //   type: "error",
    //   show: true
    // }
    // with this:
    // { key: "1.0", type: "error", show: true }
    str = str.replace(/{\s+key: (.*),\s+type: (.*),\s+show: (.*)\s+}/g, '{ key: $1, type: $2, show: $3 }');
    //str = str + '1';

    return <pre style={{fontSize: 'small'}}>react-form-with-constraints = {str}</pre>;
  }
}

// See Preserving undefined that JSON.stringify otherwise removes https://stackoverflow.com/q/26540706
// See JSON.stringify without quotes on properties? https://stackoverflow.com/q/11233498
function stringifyWithUndefinedAndWithoutPropertyQuotes(obj: object, space?: string | number) {
  let str = JSON.stringify(obj, (_key, value) => value === undefined ? '__undefined__' : value, space);
  str = str.replace(/"__undefined__"/g, 'undefined');
  str = str.replace(/"([^"]+)":/g, '$1:');
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
        if (type !== FieldFeedbackType.WhenValid) {
          textDecoration = 'line-through dotted';
        }
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
    // Hack: make FieldFeedback div 'display: inline' because FieldFeedback is prefixed with a <span>
    // and we want both on the same line.
    // Also make Bootstrap 4 happy because it sets 'display: none', see https://github.com/twbs/bootstrap/blob/v4.0.0/scss/mixins/_forms.scss#L31
    // => d'une pierre, deux coups :-)
    const rootDiv = ReactDOM.findDOMNode(this);
    const fieldFeedbackDivs = rootDiv.querySelectorAll('[data-feedback]');
    for (const fieldFeedbackDiv of fieldFeedbackDivs) {
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
