import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import withValidateFieldEventEmitter from './withValidateFieldEventEmitter';
import { FieldFeedbackValidation } from './FieldFeedbackValidation';
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

    this.key = context.form.computeFieldFeedbacksKey();

    this.validate = this.validate.bind(this);
  }

  // FieldFeedback key = FieldFeedbacks key + increment
  // Examples:
  // 0.0, 0.1, 0.2 with 0 being the FieldFeedbacks key
  // 1.0, 1.1, 1.2 with 1 being the FieldFeedbacks key
  //
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
  // Public instead of private because of the unit tests
  fieldFeedbackKeyCounter = 0;
  computeFieldFeedbackKey() {
    return `${this.key}.${this.fieldFeedbackKeyCounter++}`;
  }

  addFieldFeedback() {
    return this.computeFieldFeedbackKey();
  }

  componentWillMount() {
    // FIXME What about multiple FieldFeedbacks for the same field?
    const fieldName = this.props.for;
    this.context.form.fieldsStore.addField(fieldName);

    this.context.form.addValidateFieldEventListener(this.validate);
  }

  componentWillUnmount() {
    // FIXME What about multiple FieldFeedbacks for the same field?
    // FIXME FieldFeedbacks.componentWillUnmount() is called before (instead of after) its children FieldFeedback.componentWillUnmount()
    const fieldName = this.props.for;
    this.context.form.fieldsStore.removeField(fieldName);

    this.context.form.removeValidateFieldEventListener(this.validate);
  }

  // FIXME Remove? cannot because of Async
  validate(input: Input) {
    const { for: fieldName } = this.props;

    let fieldFeedbackValidations;

    if (input.name === fieldName) { // Ignore the event if it's not for us
      fieldFeedbackValidations = this.emitValidateFieldEvent(input);
    }

    return fieldFeedbackValidations;
  }

  render() {
    const { children } = this.props;
    // See https://codepen.io/tkrotoff/pen/yzKKdB
    return children !== undefined ? children : null;
  }
}
