import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import withValidateFieldEventEmitter from './withValidateFieldEventEmitter';
import FieldFeedbackValidation from './FieldFeedbackValidation';
// @ts-ignore
// TS6133: 'EventEmitter' is declared but its value is never read.
// FIXME See https://github.com/Microsoft/TypeScript/issues/9944#issuecomment-309903027
import { EventEmitter } from './EventEmitter';
import Input from './Input';

export interface FieldFeedbacksProps {
  for: string;

  /**
   * first-error => stops on the first error encountered
   * no => shows everything
   */
  stop?: 'first-error' | 'no';
}

export type FieldFeedbacksContext = FormWithConstraintsChildContext;

export interface FieldFeedbacksChildContext {
  fieldFeedbacks: FieldFeedbacks;
}

// FieldFeedback returns FieldFeedbackValidation
export type ListenerReturnType = FieldFeedbackValidation;

export class FieldFeedbacksComponent extends React.Component<FieldFeedbacksProps> {}
export class FieldFeedbacks extends withValidateFieldEventEmitter<ListenerReturnType, typeof FieldFeedbacksComponent>(FieldFeedbacksComponent)
                            implements React.ChildContextProvider<FieldFeedbacksChildContext> {
  static defaultProps: Partial<FieldFeedbacksProps> = {
    stop: 'first-error'
  };

  static contextTypes: React.ValidationMap<FieldFeedbacksContext> = {
    form: PropTypes.object.isRequired
  };
  context!: FieldFeedbacksContext;

  static childContextTypes: React.ValidationMap<FieldFeedbacksChildContext> = {
    fieldFeedbacks: PropTypes.object.isRequired
  };
  getChildContext(): FieldFeedbacksChildContext {
    return {
      fieldFeedbacks: this
    };
  }

  key: number;

  constructor(props: FieldFeedbacksProps, context: FieldFeedbacksContext) {
    super(props, context);

    this.validate = this.validate.bind(this);

    this.key = context.form.computeFieldFeedbacksKey();
  }

  // FieldFeedback key = FieldFeedbacks key + increment
  // Examples:
  // 0.0, 0.1, 0.2 with 0 being the FieldFeedbacks key
  // 1.0, 1.1, 1.2 with 1 being the FieldFeedbacks key
  //
  // This solves the problem when having multiple FieldFeedbacks with the same for attribute:
  // <FieldFeedbacks for="username" stop="first-error"> key=0
  //   <FieldFeedback ...> key=0.0
  //   <FieldFeedback ...> key=0.1
  // </FieldFeedbacks>
  // <FieldFeedbacks for="username" stop="no"> key=1
  //   <FieldFeedback ...> key=1.0
  //   <FieldFeedback ...> key=1.1
  //   <FieldFeedback ...> key=1.2
  // </FieldFeedbacks>
  //
  // We could use a string here instead of a number
  //
  // Public instead of private because of the unit tests
  fieldFeedbackKeyCounter = 0;
  computeFieldFeedbackKey() {
    // Example: this.key = 5, this.fieldFeedbackKey = 2 => 5.2
    if (this.fieldFeedbackKeyCounter !== 0 && this.fieldFeedbackKeyCounter % 10 === 0) {
      // Avoid 10, 100, 1000... and make it 11, 101, 1001...
      // otherwise 1.10 becomes 1.1 as a number => bug
      this.fieldFeedbackKeyCounter += 1;
    }
    return parseFloat(`${this.key}.${this.fieldFeedbackKeyCounter++}`);
  }

  addFieldFeedback() {
    return this.computeFieldFeedbackKey();
  }

  removeFieldFeedback(key: number) {
    const fieldName = this.props.for;
    this.context.form.fieldsStore.removeFieldFor(fieldName, key);
  }

  componentWillMount() {
    const fieldName = this.props.for;
    this.context.form.fieldsStore.addField(fieldName);

    this.context.form.addValidateFieldEventListener(this.validate);
  }

  componentWillUnmount() {
    // FieldFeedbacks.componentWillUnmount() is called before (instead of after) its children FieldFeedback.componentWillUnmount()
    const fieldName = this.props.for;
    this.context.form.fieldsStore.removeField(fieldName);

    this.context.form.removeValidateFieldEventListener(this.validate);
  }

  validate(input: Input) {
    const { for: fieldName } = this.props;

    let fieldFeedbackValidations;

    if (input.name === fieldName) { // Ignore the event if it's not for us
      // Clear the errors/warnings/infos each time we re-validate the input
      this.context.form.fieldsStore.removeFieldFor(fieldName, this.key);

      fieldFeedbackValidations = this.emitValidateFieldEvent(input);
    }

    return fieldFeedbackValidations;
  }

  hasErrors() {
    const { for: fieldName } = this.props;
    const field = this.context.form.fieldsStore.getFieldFor(fieldName, this.key);
    return field.errors.size > 0;
  }

  render() {
    const { children } = this.props;
    // See https://codepen.io/tkrotoff/pen/yzKKdB
    return children !== undefined ? children : null;
  }
}
