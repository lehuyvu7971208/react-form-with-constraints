import React from 'react';
import PropTypes from 'prop-types';

import {
  FormWithConstraints as _FormWithConstraints, FormWithConstraintsProps, FormWithConstraintsChildContext,
  FieldValidation, Input
} from 'react-form-with-constraints';

export interface FormControlInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  innerRef?: React.Ref<HTMLInputElement>;
}

export interface FormControlInputState {
  fieldValidation: FieldValidation | undefined; /* undefined means pending + do not show anything */
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
      fieldValidation: undefined
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

  async fieldValidated(input: Input, fieldValidationPromise: Promise<FieldValidation>) {
    if (input.name === this.props.name) { // Ignore the event if it's not for us
      this.setState({fieldValidation: undefined});
      const fieldValidation = await fieldValidationPromise;
      this.setState({fieldValidation});
    }
  }

  reset() {
    this.setState({fieldValidation: undefined});
  }

  className() {
    const { fieldValidation } = this.state;

    let className = 'form-control';

    if (fieldValidation !== undefined) {
      if (fieldValidation.hasErrors()) {
        className += ' is-invalid';
      }
      else if (fieldValidation.hasWarnings()) {
        // form-control-warning did exist in Bootstrap v4.0.0-alpha.6:
        // see https://v4-alpha.getbootstrap.com/components/forms/#validation
        // see https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.6/scss/_forms.scss#L255
        // In Bootstrap 3 it was done on form-group not an the input directly:
        // see https://getbootstrap.com/docs/3.3/css/#forms-control-validation
        // see https://github.com/twbs/bootstrap/blob/v3.3.7/less/forms.less#L431
        className += ' is-warning';
      }
      else if (fieldValidation.isValid()) {
        className += ' is-valid';
      }
    }
    return className;
  }

  render() {
    const { innerRef, className, children, ...inputProps } = this.props;
    const classes = className !== undefined ? `${className} ${this.className()}` : this.className();
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
