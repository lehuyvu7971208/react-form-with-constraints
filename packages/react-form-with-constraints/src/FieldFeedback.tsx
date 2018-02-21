import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import { FieldFeedbacksChildContext } from './FieldFeedbacks';
import { AsyncChildContext } from './Async';
import Input from './Input';
import { FieldFeedbackValidation } from './FieldValidation';
import { FieldFeedbackWhenValid } from './FieldFeedbackWhenValid';

export enum FieldFeedbackType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  WhenValid = 'whenValid'
}

export type WhenString =
  | 'valid'
  | '*'
  | 'badInput'        // input type="number"
  | 'patternMismatch' // pattern attribute
  | 'rangeOverflow'   // max attribute
  | 'rangeUnderflow'  // min attribute
  | 'stepMismatch'    // step attribute
  | 'tooLong'         // maxlength attribute
  | 'tooShort'        // minlength attribute
  | 'typeMismatch'    // input type="email" or input type="url"
  | 'valueMissing';   // required attribute
export type WhenFn = (value: string) => boolean;
export type When = WhenString | WhenFn;

export interface FieldFeedbackProps extends React.HTMLAttributes<HTMLDivElement> {
  when?: When;
  error?: boolean;
  warning?: boolean;
  info?: boolean;
}

export interface FieldFeedbackState {
  validation: FieldFeedbackValidation;

  // Copy of input.validationMessage
  // See https://developer.mozilla.org/en/docs/Web/API/HTMLInputElement
  // See https://www.w3.org/TR/html51/sec-forms.html#the-constraint-validation-api
  validationMessage: string;
}

export type FieldFeedbackContext = FormWithConstraintsChildContext & FieldFeedbacksChildContext & Partial<AsyncChildContext>;

export class FieldFeedback extends React.Component<FieldFeedbackProps, FieldFeedbackState> {
  static defaultProps: Partial<FieldFeedbackProps> = {
    when: () => true
  };

  static contextTypes: React.ValidationMap<FieldFeedbackContext> = {
    form: PropTypes.object.isRequired,
    fieldFeedbacks: PropTypes.object.isRequired,
    async: PropTypes.object
  };
  context!: FieldFeedbackContext;

  readonly key: string; // Example: key="0.1"

  constructor(props: FieldFeedbackProps, context: FieldFeedbackContext) {
    super(props, context);

    this.key = context.fieldFeedbacks.addFieldFeedback();

    const { error, warning, info, when } = props;

    let type = FieldFeedbackType.Error; // Default is error
    if (when === 'valid') type = FieldFeedbackType.WhenValid;
    else if (warning) type = FieldFeedbackType.Warning;
    else if (info) type = FieldFeedbackType.Info;

    // Special case for when="valid"
    if (type === FieldFeedbackType.WhenValid && (error || warning || info)) {
      throw new Error('Cannot have an attribute (error, warning...) with FieldFeedback when="valid"');
    }

    this.state = {
      validation: {
        key: this.key,
        type,
        show: undefined // undefined means the FieldFeedback was not checked
      },
      validationMessage: ''
    };

    this.validate = this.validate.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillMount() {
    if (this.context.async) {
      this.context.async.addValidateFieldEventListener(this.validate);
      this.context.async.addResetEventListener(this.reset);
    }
    else {
      this.context.fieldFeedbacks.addValidateFieldEventListener(this.validate);
      this.context.fieldFeedbacks.addResetEventListener(this.reset);
    }
  }

  componentWillUnmount() {
    if (this.context.async) {
      this.context.async.removeValidateFieldEventListener(this.validate);
      this.context.async.removeResetEventListener(this.reset);
    }
    else {
      this.context.fieldFeedbacks.removeValidateFieldEventListener(this.validate);
      this.context.fieldFeedbacks.removeResetEventListener(this.reset);
    }
  }

  validate(input: Input) {
    const { when } = this.props;
    const { fieldFeedbacks } = this.context;
    const { stop } = fieldFeedbacks.props;

    let show: boolean | undefined; // undefined means the FieldFeedback was not checked

    if (stop === 'first' && fieldFeedbacks.hasFeedbacks() ||
        stop === 'first-error' && fieldFeedbacks.hasErrors ||
        stop === 'first-warning' && fieldFeedbacks.hasWarnings ||
        stop === 'first-info' && fieldFeedbacks.hasInfos) {
      // Do nothing
    }

    else {
      show = false;

      if (typeof when === 'function') {
        show = when(input.value);
      }

      else if (typeof when === 'string') {
        if (when === 'valid') {
          // undefined => special case for when="valid": always displayed, then FieldFeedbackWhenValid decides what to do
          show = undefined;
        } else {
          const validity = input.validity;

          if (!validity.valid) {
            if (when === '*') {
              show = true;
            }
            else if (
              validity.badInput && when === 'badInput' ||
              validity.patternMismatch && when === 'patternMismatch' ||
              validity.rangeOverflow && when === 'rangeOverflow' ||
              validity.rangeUnderflow && when === 'rangeUnderflow' ||
              validity.stepMismatch && when === 'stepMismatch' ||
              validity.tooLong && when === 'tooLong' ||
              validity.tooShort && when === 'tooShort' ||
              validity.typeMismatch && when === 'typeMismatch' ||
              validity.valueMissing && when === 'valueMissing') {

              show = true;
            }
          }
        }
      }

      else {
        throw new TypeError(`Invalid FieldFeedback 'when' type: ${typeof when}`);
      }
    }

    const validation = {...this.state.validation}; // Copy state so we don't modify it directly (use of setState() instead)
    validation.show = show;

    fieldFeedbacks.hasErrors = fieldFeedbacks.hasErrors || (validation.type === FieldFeedbackType.Error && show === true);
    fieldFeedbacks.hasWarnings = fieldFeedbacks.hasWarnings || (validation.type === FieldFeedbackType.Warning && show === true);
    fieldFeedbacks.hasInfos = fieldFeedbacks.hasInfos || (validation.type === FieldFeedbackType.Info && show === true);

    this.setState({
      validation,
      validationMessage: input.validationMessage
    });

    return validation;
  }

  reset() {
    this.setState(prevState => ({
      validation: {...prevState.validation, ...{show: undefined}},
      validationMessage: ''
    }));
  }

  className() {
    const { validation } = this.state;
    const classNames = this.context.form.props.fieldFeedbackClassNames!;

    return validation.show ? classNames[validation.type] : undefined;
  }

  render() {
    const { when, error, warning, info, className, children, ...divProps } = this.props;
    const { validation, validationMessage } = this.state;

    // Special case for when="valid": always displayed, then FieldFeedbackWhenValid decides what to do
    if (validation.type === FieldFeedbackType.WhenValid) {
      return <FieldFeedbackWhenValid data-field-feedback-key={this.key} {...divProps}>{children}</FieldFeedbackWhenValid>;
    }

    let classes = this.className();

    let feedback = null;
    if (classes !== undefined) { // Means the FieldFeedback should be displayed
      classes = className !== undefined ? `${className} ${classes}` : classes;
      feedback = children !== undefined ? children : validationMessage;
    }

    return feedback !== null ? <div data-field-feedback-key={this.key} {...divProps} className={classes}>{feedback}</div> : null;
  }
}
