import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import { FieldFeedbacksChildContext } from './FieldFeedbacks';
import { AsyncChildContext } from './Async';
import Input from './Input';
import { FieldFeedbackType, FieldFeedbackValidation } from './FieldFeedbackValidation';
import { FieldFeedbackWhenValid } from './FieldFeedbackWhenValid';

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

  // Example: key="0.1"
  key: string;

  constructor(props: FieldFeedbackProps, context: FieldFeedbackContext) {
    super(props);

    this.key = context.fieldFeedbacks.addFieldFeedback();

    const { error, warning, info, when } = props;

    let type = FieldFeedbackType.Error; // Default is error
    if (warning) type = FieldFeedbackType.Warning;
    else if (info) type = FieldFeedbackType.Info;
    else if (when === 'valid') type = FieldFeedbackType.WhenValid;

    // Special case for when="valid"
    if (type === FieldFeedbackType.WhenValid && (error || warning || info)) {
      throw new Error('Cannot have an attribute (error, warning...) with FieldFeedback when="valid"');
    }

    this.state = {
      validation: {
        key: this.key,
        type,
        show: false
      },
      validationMessage: ''
    };

    this.validate = this.validate.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillMount() {
    if (this.context.async) this.context.async.addValidateFieldEventListener(this.validate);
    else this.context.fieldFeedbacks.addValidateFieldEventListener(this.validate);

    this.context.form.addResetFormEventListener(this.reset);
  }

  componentWillUnmount() {
    if (this.context.async) this.context.async.removeValidateFieldEventListener(this.validate);
    else this.context.fieldFeedbacks.removeValidateFieldEventListener(this.validate);

    this.context.form.removeResetFormEventListener(this.reset);
  }

  // Generates FieldFeedbackValidation structure
  validate(input: Input) {
    const { when } = this.props;
    const { form, fieldFeedbacks } = this.context;

    let show: boolean | undefined = false;

    const fieldName = fieldFeedbacks.props.for;
    const field = form.fieldsStore.fields[fieldName]!;

    if (fieldFeedbacks.props.stop === 'first-error' && field.validated && field.invalid) {
      // No need to perform validation if another FieldFeedback is already invalid
    }
    else {
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

    form.fieldsStore.updateField(fieldName, {
      validated: true,
      invalid: field.invalid || (validation.type === FieldFeedbackType.Error && show === true)
    });

    this.setState({
      validation,
      validationMessage: input.validationMessage
    });

    return validation;
  }

  reset() {
    this.setState(prevState => ({
      validation: {...prevState.validation, ...{show: false}},
      validationMessage: ''
    }));
  }

  className() {
    const { validation } = this.state;
    const classNames = this.context.form.props.fieldFeedbackClassNames!;

    let className;

    if (validation.show) {
      if (validation.type === FieldFeedbackType.Error) className = classNames.error;
      else if (validation.type === FieldFeedbackType.Warning) className = classNames.warning;
      else if (validation.type === FieldFeedbackType.Info) className = classNames.info;
    }

    return className;
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
