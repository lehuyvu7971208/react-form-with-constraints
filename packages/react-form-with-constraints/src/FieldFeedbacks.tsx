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
import { FieldFeedbackValidations, FieldFeedbackValidation } from './FieldValidation';
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
                                  // FieldFeedback returns Promise<FieldFeedbackValidation>
                                  // FieldFeedbacks returns Promise<FieldFeedbackValidation[]> | undefined
                                  // Async returns Promise<FieldFeedbackValidation[] | undefined>
                                  //Promise<FieldFeedbackValidation> | Promise<FieldFeedbackValidation[] | undefined>,
                                  Promise<FieldFeedbackValidation | FieldFeedbackValidation[] | undefined>,
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

  validations = new FieldFeedbackValidations();

  async validate(input: Input) {
    const { form, fieldFeedbacks: fieldFeedbacksParent } = this.context;

    let validations;

    if (input.name === this.fieldName) { // Ignore the event if it's not for us
      console.log(this.key, 'validate() begin');

      this.validations.clear();
      validations = this._validate(input);

      const parent = fieldFeedbacksParent !== undefined ? fieldFeedbacksParent : form;
      parent.validations.addFieldFeedbacksValidation(validations);

      console.log(this.key, 'validate() end');
    }

    return validations;
  }

  async _validate(input: Input) {
    const { fieldFeedbacks: fieldFeedbacksParent } = this.context;
    console.log('=>', this.key, '_validate() begin');

    let validations;

    if (fieldFeedbacksParent !== undefined && (
        fieldFeedbacksParent.props.stop === 'first' && await fieldFeedbacksParent.validations.hasFeedbacks() ||
        fieldFeedbacksParent.props.stop === 'first-error' && await fieldFeedbacksParent.validations.hasErrors() ||
        fieldFeedbacksParent.props.stop === 'first-warning' && await fieldFeedbacksParent.validations.hasWarnings() ||
        fieldFeedbacksParent.props.stop === 'first-info' && await fieldFeedbacksParent.validations.hasInfos())) {
      // Do nothing
      console.log('=>', this.key, '_validate() do nothing');
    }

    else {
      console.log('=>', this.key, '_validate() wait');
      const arrayOfArrays = await Promise.all(this.emitValidateFieldEvent(input));

      const tmp = arrayOfArrays
        .filter(item => item !== undefined)
        .map(item => {
          if (item instanceof Array) {
            return item;
          } else {
            // FIXME There is a ! because "TypeScript static analysis is unable to track this behavior", see https://codereview.stackexchange.com/a/138289/148847
            return [item!];
          }
        });

      validations = flatten(tmp);

      console.log('=>', this.key, '_validate() done', validations);
    }
    console.log('=>', this.key, '_validate() end');

    return validations;
  }

  reset() {
    this.validations.clear();
    this.emitResetEvent();
  }

  render() {
    const { children } = this.props;
    // See https://codepen.io/tkrotoff/pen/yzKKdB
    return children !== undefined ? children : null;
  }
}
