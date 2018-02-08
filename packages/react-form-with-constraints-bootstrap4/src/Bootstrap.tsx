import React from 'react';
import PropTypes from 'prop-types';

import {
  FormWithConstraints as _FormWithConstraints, FormWithConstraintsProps, FormWithConstraintsChildContext,
  FieldFeedbacksValidation, Input
} from 'react-form-with-constraints';

export interface FormControlInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  innerRef?: React.Ref<HTMLInputElement>;
}

export interface FormControlInputState {
  pending: boolean;
}

export type FormControlInputContext = FormWithConstraintsChildContext;

export class FormControlInput extends React.Component<FormControlInputProps, FormControlInputState> {
  static contextTypes: React.ValidationMap<FormControlInputContext> = {
    form: PropTypes.object.isRequired
  };
  context!: FormControlInputContext;

  constructor(props: FormControlInputProps) {
    super(props);

    this.state = {
      pending: false
    };

    this.fieldValidated = this.fieldValidated.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillMount() {
    this.context.form.addFieldValidatedEventListener(this.fieldValidated);
    this.context.form.addResetFormEventListener(this.reset);
  }

  componentWillUnmount() {
    this.context.form.removeFieldValidatedEventListener(this.fieldValidated);
    this.context.form.removeResetFormEventListener(this.reset);
  }

  async fieldValidated(input: Input, fieldValidationsPromise: Promise<FieldFeedbacksValidation>) {
    if (input.name === this.props.name) { // Ignore the event if it's not for us
      this.setState({pending: true});
      await fieldValidationsPromise;
      this.setState({pending: false});
    }
  }

  reset() {
    this.setState({pending: false});
  }

  className(name: string | undefined) {
    let className = 'form-control';
    if (this.state.pending !== true && name !== undefined) {
      const form = this.context.form;
      if (form.fieldsStore.hasErrorsFor(name)) {
        className += ' is-invalid';
      }
      else if (form.fieldsStore.hasWarningsFor(name)) {
        // form-control-warning did exist in Bootstrap v4.0.0-alpha.6:
        // see https://v4-alpha.getbootstrap.com/components/forms/#validation
        // see https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.6/scss/_forms.scss#L255
        // In Bootstrap 3 it was done on form-group not an the input directly:
        // see https://getbootstrap.com/docs/3.3/css/#forms-control-validation
        // see https://github.com/twbs/bootstrap/blob/v3.3.7/less/forms.less#L431
        className += ' is-warning';
      }
      else if (form.fieldsStore.isValidWithoutWarnings(name)) {
        className += ' is-valid';
      }
    }
    return className;
  }

  render() {
    const { innerRef, className, children, ...inputProps } = this.props;
    const classes = className !== undefined ? `${className} ${this.className(inputProps.name)}` : this.className(inputProps.name);
    return (
      <input ref={innerRef} {...inputProps} className={classes} />
    );
  }
}

export class FormWithConstraints extends _FormWithConstraints {
  static defaultProps: FormWithConstraintsProps = {
    fieldFeedbackClassNames: {
      error: 'invalid-feedback',
      warning: 'warning-feedback',
      info: 'info-feedback',
      valid: 'valid-feedback'
    }
  };
}

export class FormWithConstraintsTooltip extends _FormWithConstraints {
  static defaultProps: FormWithConstraintsProps = {
    fieldFeedbackClassNames: {
      error: 'invalid-tooltip',
      warning: 'warning-tooltip',
      info: 'info-tooltip',
      valid: 'valid-tooltip'
    }
  };
}
