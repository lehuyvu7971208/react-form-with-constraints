import React from 'react';
import PropTypes from 'prop-types';

import { FormWithConstraintsChildContext } from './FormWithConstraints';
import withValidateFieldEventEmitter from './withValidateFieldEventEmitter';
import withResetEventEmitter from './withResetEventEmitter';
// @ts-ignore
// TS6133: 'EventEmitter' is declared but its value is never read.
// FIXME See https://github.com/Microsoft/TypeScript/issues/9944#issuecomment-309903027
import { EventEmitter } from './EventEmitter';
import Input from './Input';
import { FieldFeedbackValidation } from './FieldValidation';
import { FieldFeedbackType } from './FieldFeedback';

export interface FieldFeedbacksProps {
  for?: string;

  /**
   * first-* => stops on the first * encountered
   * no => shows everything
   */
  stop?: 'first' | 'first-error' | 'first-warning' | 'first-info' | 'no';
}

export type FieldFeedbacksContext = FormWithConstraintsChildContext & Partial<FieldFeedbacksChildContext>;

export interface FieldFeedbacksChildContext {
  fieldFeedbacks: FieldFeedbacks;
}

export class FieldFeedbacksComponent extends React.Component<FieldFeedbacksProps> {}
export class FieldFeedbacks extends
                              withResetEventEmitter(
                                withValidateFieldEventEmitter<
                                  // FieldFeedback returns FieldFeedbackValidation
                                  // FieldFeedbacks returns Promise<FieldFeedbackValidation[]> | undefined
                                  // Async returns Promise<FieldFeedbackValidation[]> | undefined
                                  FieldFeedbackValidation | Promise<FieldFeedbackValidation[]> | undefined,
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
      if (props.for === undefined) throw new TypeError("FieldFeedbacks cannot be without parent and without 'for' prop");
      else this.fieldName = props.for;
    }

    this.validate = this.validate.bind(this);
    this.reset = this.reset.bind(this);
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
    this.context.form.fieldsStore.addField(this.fieldName);

    if (this.context.fieldFeedbacks) {
      this.context.fieldFeedbacks.addValidateFieldEventListener(this.validate);
      this.context.fieldFeedbacks.addResetEventListener(this.reset);
    }
    else {
      this.context.form.addValidateFieldEventListener(this.validate);
      this.context.form.addResetEventListener(this.reset);
    }
  }

  componentWillUnmount() {
    // FIXME What about multiple FieldFeedbacks for the same field?
    this.context.form.fieldsStore.removeField(this.fieldName);

    if (this.context.fieldFeedbacks) {
      this.context.fieldFeedbacks.removeValidateFieldEventListener(this.validate);
      this.context.fieldFeedbacks.removeResetEventListener(this.reset);
    }
    else {
      this.context.form.removeValidateFieldEventListener(this.validate);
      this.context.form.removeResetEventListener(this.reset);
    }
  }

  hasErrors = false;
  hasWarnings = false;
  hasInfos = false;

  private resetErrors() {
    this.hasErrors = false;
    this.hasWarnings = false;
    this.hasInfos = false;
  }

  hasFeedbacks() {
    return this.hasErrors || this.hasWarnings || this.hasInfos;
  }

  validate(input: Input) {
    const { form, fieldFeedbacks } = this.context;

    let validationsPromise;

    if (input.name === this.fieldName) { // Ignore the event if it's not for us

      if (fieldFeedbacks !== undefined && (
          (fieldFeedbacks.props.stop === 'first' && fieldFeedbacks.hasFeedbacks()) ||
          (fieldFeedbacks.props.stop === 'first-error' && fieldFeedbacks.hasErrors) ||
          (fieldFeedbacks.props.stop === 'first-warning' && fieldFeedbacks.hasWarnings) ||
          (fieldFeedbacks.props.stop === 'first-info' && fieldFeedbacks.hasInfos)
         )) {
        // Do nothing
      }

      else {
        this.resetErrors();

        const allValidations = this.emitValidateFieldEvent(input);

        const promises = allValidations
          .filter(promise => promise !== undefined) // Remove undefined results
          .map(validations => {
            if (validations instanceof Promise) {
              return validations;
            } else {
              return Promise.resolve(validations!);
            }
          });

        const promisesMerged = promises
          .map(promise => {
            return (promise as Promise<any>).then(validations => {
              if (validations instanceof Array) {
                return validations as FieldFeedbackValidation[];
              } else {
                return [validations as FieldFeedbackValidation];
              }
            });
          });

        validationsPromise = Promise.all(promisesMerged)
          .then(validations =>
            // See Merge/flatten an array of arrays in JavaScript? https://stackoverflow.com/q/10865025/990356
            validations.reduce((prev, curr) => prev.concat(curr), [])
          );

        const parent = fieldFeedbacks !== undefined ? fieldFeedbacks : form;

        validationsPromise.then(validations => {
          for (const validation of validations) {
            parent.hasErrors = parent.hasErrors || (validation.type === FieldFeedbackType.Error && validation.show === true);
            parent.hasWarnings = parent.hasWarnings || (validation.type === FieldFeedbackType.Warning && validation.show === true);
            parent.hasInfos = parent.hasInfos || (validation.type === FieldFeedbackType.Info && validation.show === true);
          }
        });
      }
    }

    return validationsPromise;
  }

  reset() {
    this.resetErrors();
    this.emitResetEvent();
  }

  render() {
    const { children } = this.props;
    // See https://codepen.io/tkrotoff/pen/yzKKdB
    return children !== undefined ? children : null;
  }
}
