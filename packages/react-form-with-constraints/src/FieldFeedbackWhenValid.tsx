import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import { FieldFeedbacksChildContext } from './FieldFeedbacks';
import { FieldValidation } from './FieldValidation';
import Input from './Input';

export interface FieldFeedbackWhenValidProps extends React.HTMLAttributes<HTMLDivElement> {
}

export interface FieldFeedbackWhenValidState {
  fieldIsValid: boolean | undefined;
}

export type FieldFeedbackWhenValidContext = FormWithConstraintsChildContext & FieldFeedbacksChildContext;

export class FieldFeedbackWhenValid extends React.Component<FieldFeedbackWhenValidProps, FieldFeedbackWhenValidState> {
  static contextTypes: React.ValidationMap<FieldFeedbackWhenValidContext> = {
    form: PropTypes.object.isRequired,
    fieldFeedbacks: PropTypes.object.isRequired
  };
  context!: FieldFeedbackWhenValidContext;

  readonly fieldName: string; // Instead of reading props each time

  constructor(props: FieldFeedbackWhenValidProps, context: FieldFeedbackWhenValidContext) {
    super(props);

    this.fieldName = context.fieldFeedbacks.fieldName;
    this.state = {
      fieldIsValid: undefined
    };

    this.fieldValidated = this.fieldValidated.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillMount() {
    this.context.form.addFieldValidatedEventListener(this.fieldValidated);
    this.context.form.addResetEventListener(this.reset);
  }

  componentWillUnmount() {
    this.context.form.removeFieldValidatedEventListener(this.fieldValidated);
    this.context.form.removeResetEventListener(this.reset);
  }

  async fieldValidated(input: Input, fieldValidationsPromise: Promise<FieldValidation>) {
    if (input.name === this.fieldName) { // Ignore the event if it's not for us
      this.setState({fieldIsValid: undefined});
      const fieldValidations = await fieldValidationsPromise;
      this.setState({fieldIsValid: fieldValidations.isValid()});
    }
  }

  reset() {
    this.setState({fieldIsValid: undefined});
  }

  render() {
    const { className, children, ...otherProps } = this.props;
    const { fieldIsValid } = this.state;
    const { form } = this.context;

    let classes = form.props.fieldFeedbackClassNames!.valid;
    classes = className !== undefined ? `${className} ${classes}` : classes;

    return fieldIsValid ? <div {...otherProps} className={classes}>{children}</div> : null;
  }
}
