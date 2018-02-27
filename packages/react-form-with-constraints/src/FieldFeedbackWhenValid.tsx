import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import { FieldFeedbacksChildContext } from './FieldFeedbacks';
import { FieldValidation } from './FieldValidation';

export interface FieldFeedbackWhenValidProps extends React.HTMLAttributes<HTMLDivElement> {
}

export interface FieldFeedbackWhenValidState {
  fieldIsValid: boolean | undefined;
}

export type FieldFeedbackWhenValidContext = FormWithConstraintsChildContext & FieldFeedbacksChildContext;

// FIXME AsynWithFormValidity?
export class FieldFeedbackWhenValid extends React.Component<FieldFeedbackWhenValidProps, FieldFeedbackWhenValidState> {
  static contextTypes: React.ValidationMap<FieldFeedbackWhenValidContext> = {
    form: PropTypes.object.isRequired,
    fieldFeedbacks: PropTypes.object.isRequired
  };
  context!: FieldFeedbackWhenValidContext;

  constructor(props: FieldFeedbackWhenValidProps) {
    super(props);

    this.state = {
      fieldIsValid: undefined
    };

    this.fieldWillValidate = this.fieldWillValidate.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillMount() {
    this.context.form.addFieldWillValidateEventListener(this.fieldWillValidate);
    this.context.form.addResetEventListener(this.reset);
  }

  componentWillUnmount() {
    this.context.form.removeFieldWillValidateEventListener(this.fieldWillValidate);
    this.context.form.removeResetEventListener(this.reset);
  }

  async fieldWillValidate(fieldName: string, _field: Promise<FieldValidation>) {
    if (fieldName === this.context.fieldFeedbacks.fieldName) { // Ignore the event if it's not for us
      this.setState({fieldIsValid: undefined});
      const field = await _field;
      this.setState({fieldIsValid: field.isValid()});
    }
  }

  reset() {
    this.setState({fieldIsValid: undefined});
  }

  render() {
    const { className, ...otherProps } = this.props;
    const { fieldIsValid } = this.state;
    const { form } = this.context;

    let classes = form.props.fieldFeedbackClassNames!.valid;
    classes = className !== undefined ? `${className} ${classes}` : classes;

    return fieldIsValid ? <div {...otherProps} className={classes} /> : null;
  }
}
