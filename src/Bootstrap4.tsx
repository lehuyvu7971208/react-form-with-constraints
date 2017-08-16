import * as React from 'react';
import * as PropTypes from 'prop-types';

import {
  FormWithConstraints as FormWithConstraints_, FormWithConstraintsProps,
  FormWithConstraintsContext, FormFields, Input
} from './FormWithConstraints';

export interface FormControlInputProps extends React.HTMLProps<HTMLInputElement> {
}

export class FormControlInput extends React.Component<FormControlInputProps> {
  static contextTypes = {
    form: PropTypes.object.isRequired
  };

  context: FormWithConstraintsContext;

  constructor(props: FormControlInputProps) {
    super(props);

    this.reRender = this.reRender.bind(this);
  }

  componentDidMount() {
    this.context.form.addInputChangeOrFormSubmitEventListener(this.reRender);
  }

  componentWillUnmount() {
    this.context.form.removeInputChangeOrFormSubmitEventListener(this.reRender);
  }

  reRender(input: Input) {
    const fieldName = this.props.name;
    if (input.name === fieldName) { // Ignore the event if it's not for us
      this.forceUpdate();
    }
  }

  className(name: string | undefined) {
    let className = 'form-control';
    if (name !== undefined) {
      const form = this.context.form;
      if (FormFields.containErrors(form, name)) {
        className += ' is-invalid';
      }
      else if (FormFields.containWarnings(form, name)) {
        // form-control-warning did exist in Bootstrap v4.0.0-alpha.6:
        // see https://v4-alpha.getbootstrap.com/components/forms/#validation
        // see https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.6/scss/_forms.scss#L255
        // In Bootstrap 3 it was done on form-group not an the input directly:
        // see https://getbootstrap.com/docs/3.3/css/#forms-control-validation
        // see https://github.com/twbs/bootstrap/blob/v3.3.7/less/forms.less#L431
        className += ' is-warning';
      }
      else if (FormFields.containInfos(form, name)) {
        // Info type does not exist in Bootstrap 3 and 4
        // In Bootstrap 2 it was done on control-group not an the input directly:
        // see https://getbootstrap.com/2.3.2/base-css.html#forms
        // see https://github.com/twbs/bootstrap/blob/v2.3.2/less/forms.less#L363
        className += ' is-info';
      }
      else if (FormFields.areValidDirtyWithoutWarnings(form, name)) {
        className += ' is-valid';
      }
    }
    return className;
  }

  render() {
    let { children, ...inputProps } = this.props;

    return (
      <input {...inputProps} className={this.className(inputProps.name)} />
    );
  }
}

export class FormWithConstraints<P extends FormWithConstraintsProps = {}, S = {}> extends FormWithConstraints_<P, S> {
  static defaultProps: FormWithConstraintsProps = {
    fieldFeedbackClassNames: {
      error: 'invalid-feedback',
      warning: 'warning-feedback',
      info: 'info-feedback'
    }
  };
}
