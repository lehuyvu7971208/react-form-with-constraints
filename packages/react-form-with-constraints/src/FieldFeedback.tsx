import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import { FieldFeedbacksChildContext } from './FieldFeedbacks';
import { AsyncChildContext } from './Async';
import Input from './Input';
import FieldFeedbackValidation from './FieldFeedbackValidation';
import { FieldEvent } from './FieldsStore';
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

export type FieldFeedbackContext = FormWithConstraintsChildContext & FieldFeedbacksChildContext & Partial<AsyncChildContext>;

export class FieldFeedback extends React.Component<FieldFeedbackProps> {
  static defaultProps: Partial<FieldFeedbackProps> = {
    when: () => true
  };

  static contextTypes: React.ValidationMap<FieldFeedbackContext> = {
    form: PropTypes.object.isRequired,
    fieldFeedbacks: PropTypes.object.isRequired,
    async: PropTypes.object
  };
  context!: FieldFeedbackContext;

  // Example: key=0.1
  key: number;

  constructor(props: FieldFeedbackProps, context: FieldFeedbackContext) {
    super(props);

    this.key = context.fieldFeedbacks.addFieldFeedback();

    // Special case for when="valid"
    const { error, warning, info, when } = props;
    if (when === 'valid' && (error || warning || info)) {
      throw new Error('Cannot have an attribute (error, warning...) with FieldFeedback when="valid"');
    }

    this.validate = this.validate.bind(this);
    this.reRender = this.reRender.bind(this);
  }

  componentWillMount() {
    if (this.context.async) this.context.async.addValidateFieldEventListener(this.validate);
    else this.context.fieldFeedbacks.addValidateFieldEventListener(this.validate);

    this.context.form.fieldsStore.addListener(FieldEvent.Updated, this.reRender);
  }

  componentWillUnmount() {
    // FieldFeedbacks.componentWillUnmount() is called before (instead of after) its children FieldFeedback.componentWillUnmount()
    this.context.fieldFeedbacks.removeFieldFeedback(this.key);

    if (this.context.async) this.context.async.removeValidateFieldEventListener(this.validate);
    else this.context.fieldFeedbacks.removeValidateFieldEventListener(this.validate);

    this.context.form.fieldsStore.removeListener(FieldEvent.Updated, this.reRender);
  }

  // Generates Field for Fields structure
  validate(input: Input) {
    const { when } = this.props;
    const { fieldFeedbacks } = this.context;

    const fieldFeedbackValidation: FieldFeedbackValidation = {
      key: this.key,
      isValid: undefined // undefined means the FieldFeedback was not checked
    };

    if (fieldFeedbacks.props.stop === 'first-error' && fieldFeedbacks.hasErrors()) {
      // No need to perform validation if another FieldFeedback is already invalid
    }
    else {
      let show = false;

      if (typeof when === 'function') {
        show = when(input.value);
      }

      else if (typeof when === 'string') {
        if (when === 'valid') {
          show = true;
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

      const invalidatesField = this.updateFieldsStore(input, show);

      fieldFeedbackValidation.isValid = !invalidatesField;
    }

    return fieldFeedbackValidation;
  }

  // Update the Fields structure
  updateFieldsStore(input: Input, show: boolean) {
    const { warning, info, when } = this.props;
    const fieldName = this.context.fieldFeedbacks.props.for;

    let invalidatesField = false;

    const field = this.context.form.fieldsStore.cloneField(fieldName);
    field.dirty = true;
    field.validationMessage = input.validationMessage;
    if (show) {
      // No need to "append if not already there": Set ignores duplicates
      if (warning) field.warnings.add(this.key);
      else if (info) field.infos.add(this.key);
      else if (when === 'valid') { /* Do nothing */ }
      else {
        field.errors.add(this.key); // Feedback type is error if nothing is specified
        invalidatesField = true;
      }
    }
    this.context.form.fieldsStore.updateField(fieldName, field);

    return invalidatesField;
  }

  className() {
    const { form, fieldFeedbacks } = this.context;
    const { for: fieldName } = fieldFeedbacks.props;

    // Retrieve errors/warnings/infos only related to the parent FieldFeedbacks
    const { errors, warnings, infos } = this.context.form.fieldsStore.getFieldFor(fieldName, fieldFeedbacks.key);

    let className: string | undefined;

    if (errors.has(this.key)) className = form.props.fieldFeedbackClassNames!.error;
    else if (warnings.has(this.key)) className = form.props.fieldFeedbackClassNames!.warning;
    else if (infos.has(this.key)) className = form.props.fieldFeedbackClassNames!.info;

    return className;
  }

  reRender(_fieldName: string) {
    const fieldName = this.context.fieldFeedbacks.props.for;
    if (fieldName === _fieldName) { // Ignore the event if it's not for us
      this.forceUpdate();
    }
  }

  render() {
    const { when, error, warning, info, className, children, ...divProps } = this.props;
    const { form, fieldFeedbacks } = this.context;
    const { for: fieldName } = fieldFeedbacks.props;
    const { validationMessage } = form.fieldsStore.getFieldFor(fieldName, fieldFeedbacks.key);

    // Special case for when="valid"
    if (when === 'valid') {
      return <FieldFeedbackWhenValid>{children}</FieldFeedbackWhenValid>;
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
