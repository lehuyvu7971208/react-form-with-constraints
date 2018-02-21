import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import withValidateFieldEventEmitter from './withValidateFieldEventEmitter';
import withResetEventEmitter from './withResetEventEmitter';
import { FieldFeedbackValidation, FieldFeedbackType } from './FieldValidation';
// @ts-ignore
// TS6133: 'EventEmitter' is declared but its value is never read.
// FIXME See https://github.com/Microsoft/TypeScript/issues/9944#issuecomment-309903027
import { EventEmitter } from './EventEmitter';
import Input from './Input';

export interface FieldFeedbacksProps {
  for?: string;

  /**
   * first-error => stops on the first error encountered
   * no => shows everything
   */
  stop?: 'first' | 'first-error' | 'no';
}

export type FieldFeedbacksContext = FormWithConstraintsChildContext & Partial<FieldFeedbacksChildContext>;

export interface FieldFeedbacksChildContext {
  fieldFeedbacks: FieldFeedbacks;
}

export class FieldFeedbacksComponent extends React.Component<FieldFeedbacksProps> {}
export class FieldFeedbacks extends
                              withResetEventEmitter(
                                withValidateFieldEventEmitter<
                                  // FieldFeedback returns FieldFeedbackValidation, FieldFeedbacks returns FieldFeedbackValidation[]
                                  FieldFeedbackValidation | FieldFeedbackValidation[],
                                  typeof FieldFeedbacksComponent
                                >(
                                  FieldFeedbacksComponent
                                )
                              )
                            implements React.ChildContextProvider<FieldFeedbacksChildContext> {
  static defaultProps: Partial<FieldFeedbacksProps> = {
    stop: 'first-error'
  };

  static contextTypes: React.ValidationMap<FieldFeedbacksContext> = {
    form: PropTypes.object.isRequired,
    fieldFeedbacks: PropTypes.object
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

  readonly key: number;
  readonly fieldName: string; // Instead of reading props each time

  constructor(props: FieldFeedbacksProps, context: FieldFeedbacksContext) {
    super(props, context);

    this.key = context.form.computeFieldFeedbacksKey();

    if (context.fieldFeedbacks !== undefined) {
      this.fieldName = context.fieldFeedbacks.fieldName;
      if (props.for !== undefined) throw new TypeError("FieldFeedbacks cannot have a parent and a 'for' prop");
    } else {
      if (props.for === undefined) throw new TypeError("FieldFeedbacks without parent and without 'for' prop");
      else this.fieldName = props.for;
    }

    this.validate = this.validate.bind(this);
    this.resetChilds = this.resetChilds.bind(this);
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
    this.context.form.fieldsStore.addField(this.fieldName);

    if (this.context.fieldFeedbacks) {
      this.context.fieldFeedbacks.addValidateFieldEventListener(this.validate);
      this.context.fieldFeedbacks.addResetEventListener(this.resetChilds);
    }
    else {
      this.context.form.addValidateFieldEventListener(this.validate);
      this.context.form.addResetEventListener(this.resetChilds);
    }
  }

  componentWillUnmount() {
    // FIXME What about multiple FieldFeedbacks for the same field?
    // FIXME FieldFeedbacks.componentWillUnmount() is called before (instead of after) its children FieldFeedback.componentWillUnmount()
    this.context.form.fieldsStore.removeField(this.fieldName);

    if (this.context.fieldFeedbacks) {
      this.context.fieldFeedbacks.removeValidateFieldEventListener(this.validate);
      this.context.fieldFeedbacks.removeResetEventListener(this.resetChilds);
    }
    else {
      this.context.form.removeValidateFieldEventListener(this.validate);
      this.context.form.removeResetEventListener(this.resetChilds);
    }
  }

  invalid = false;

  validate(input: Input) {
    const { fieldFeedbacks } = this.context;

    this.resetChilds();

    console.log('FieldFeedbacks.validate()', this.fieldName, this.key);

    const fieldFeedbackValidations: FieldFeedbackValidation[] = [];

    if (input.name === this.fieldName) { // Ignore the event if it's not for us
      if (fieldFeedbacks !== undefined && fieldFeedbacks.props.stop === 'first-error' && fieldFeedbacks.invalid) {
        // No need to perform validation if another FieldFeedback is already invalid
        console.log('FieldFeedbacks.validate()', this.fieldName, this.key, 'ignore');
      }
      else {
        const twoDimensionalArrayValidations = this.emitValidateFieldEvent(input);
        console.log('FieldFeedbacks.validate()', this.fieldName, this.key, 'twoDimensionalArrayValidations=', twoDimensionalArrayValidations);

        // One-dimensional array
        twoDimensionalArrayValidations.forEach(validations => {
          if (validations instanceof Array) fieldFeedbackValidations.push(...validations); // child is a FieldFeedbacks
          else fieldFeedbackValidations.push(validations); // child is a FieldFeedback
        });

        if (fieldFeedbacks !== undefined) {
          for (const validation of fieldFeedbackValidations) {
            fieldFeedbacks.invalid = fieldFeedbacks.invalid || (validation.type === FieldFeedbackType.Error && validation.show === true);
            if (fieldFeedbacks.invalid) break;
          }
        }
      }
    }

    return fieldFeedbackValidations;
  }

  resetChilds() {
    this.invalid = false;
    this.emitResetEvent();
  }

  render() {
    const { children } = this.props;
    // See https://codepen.io/tkrotoff/pen/yzKKdB
    return children !== undefined ? children : null;
  }
}
