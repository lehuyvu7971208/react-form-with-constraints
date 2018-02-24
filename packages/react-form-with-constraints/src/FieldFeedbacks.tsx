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
import { LastValidation, FieldFeedbackValidation } from './FieldValidation';
import flatten from './flatten';

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
                                  // FieldFeedbacks returns Promise<FieldFeedbackValidation[] | undefined>
                                  //                        (Promise<FieldFeedbackValidation[] | undefined>)[]
                                  // Async returns Promise<FieldFeedbackValidation[] | undefined>
                                  FieldFeedbackValidation | Promise<FieldFeedbackValidation[] | undefined>,
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

  private fieldFeedbackKeyCounter = 0;
  computeFieldFeedbackKey() {
    return `${this.key}.${this.fieldFeedbackKeyCounter++}`;
  }

  addFieldFeedback() {
    return this.computeFieldFeedbackKey();
  }

  componentWillMount() {
    this.context.form.fieldsStore.addField(this.fieldName);

    if (this.context.fieldFeedbacks) {
      this.context.fieldFeedbacks.addValidateFieldEventListener(this.validate as any);
      this.context.fieldFeedbacks.addResetEventListener(this.reset);
    }
    else {
      this.context.form.addValidateFieldEventListener(this.validate as any);
      this.context.form.addResetEventListener(this.reset);
    }
  }

  componentWillUnmount() {
    // FIXME What about multiple FieldFeedbacks for the same field?
    this.context.form.fieldsStore.removeField(this.fieldName);

    if (this.context.fieldFeedbacks) {
      this.context.fieldFeedbacks.removeValidateFieldEventListener(this.validate as any);
      this.context.fieldFeedbacks.removeResetEventListener(this.reset);
    }
    else {
      this.context.form.removeValidateFieldEventListener(this.validate as any);
      this.context.form.removeResetEventListener(this.reset);
    }
  }

  lastValidation = new LastValidation();

  async validate(input: Input) {
    let validations;

    if (input.name === this.fieldName) { // Ignore the event if it's not for us
      validations = await this._validate(input);
    }

    return validations;
  }

  async _validate(input: Input) {
    const { fieldFeedbacks: fieldFeedbacksParent } = this.context;

    this.lastValidation.clear();

    let validations;

    if (fieldFeedbacksParent !== undefined && (
        fieldFeedbacksParent.props.stop === 'first' && fieldFeedbacksParent.lastValidation.hasFeedbacks() ||
        fieldFeedbacksParent.props.stop === 'first-error' && fieldFeedbacksParent.lastValidation.hasErrors() ||
        fieldFeedbacksParent.props.stop === 'first-warning' && fieldFeedbacksParent.lastValidation.hasWarnings() ||
        fieldFeedbacksParent.props.stop === 'first-info' && fieldFeedbacksParent.lastValidation.hasInfos())) {
      // Do nothing
    }

    else {
      const arrayOfValidations = await this.emitValidateFieldEvent(input);
      console.log(this.key, 'this.emitValidateFieldEvent=', arrayOfValidations);

      const arrayOfPromises = arrayOfValidations
        .filter(_validations => _validations !== undefined)
        .map(_validations => {
          if (_validations instanceof Promise) {
            return _validations;
          } else {
            // FIXME There is a ! because "TypeScript static analysis is unable to track this behavior", see https://codereview.stackexchange.com/a/138289/148847
            return Promise.resolve([_validations!]);
          }
        });

      const arrayOfArrays = await Promise.all(arrayOfPromises);

      // FIXME "TypeScript static analysis is unable to track this behavior", see https://codereview.stackexchange.com/a/138289/148847
      const tmp = arrayOfArrays.filter(item => item !== undefined) as FieldFeedbackValidation[][];
      console.log(this.key, 'before flatten=', tmp);
      validations = flatten(tmp);
      console.log(this.key, 'after flatten=', validations);

      if (fieldFeedbacksParent !== undefined) {
        fieldFeedbacksParent.lastValidation.setFieldFeedbacksValidation(validations as any);
      }
    }

    return validations;
  }

  reset() {
    this.lastValidation.clear();
    this.emitResetEvent();
  }

  render() {
    const { children } = this.props;
    // See https://codepen.io/tkrotoff/pen/yzKKdB
    return children !== undefined ? children : null;
  }
}
