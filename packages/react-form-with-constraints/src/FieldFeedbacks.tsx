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
import FieldFeedbackValidation from './FieldFeedbackValidation';
import flattenDeep from './flattenDeep';

export interface FieldFeedbacksProps {
  for?: string;

  /**
   * first-* => stops on the first * encountered
   * no => shows everything
   * Default is 'first-error'
   */
  stop?: 'first' | 'first-error' | 'first-warning' | 'first-info' | 'no';
}

export type FieldFeedbacksContext = FormWithConstraintsChildContext & Partial<FieldFeedbacksChildContext>;

export interface FieldFeedbacksChildContext {
  fieldFeedbacks: FieldFeedbacks;
}

export class FieldFeedbacksComponent extends React.Component<FieldFeedbacksProps> {}
export class FieldFeedbacks extends
                              withValidateFieldEventEmitter<
                                // FieldFeedback returns FieldFeedbackValidation
                                // Async returns FieldFeedbackValidation[] | undefined
                                // FieldFeedbacks returns (FieldFeedbackValidation | undefined)[]
                                FieldFeedbackValidation | (FieldFeedbackValidation | undefined)[] | undefined,
                                typeof FieldFeedbacksComponent
                              >(
                                FieldFeedbacksComponent
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

  readonly key: string; // '0', '1', '2'...
  readonly fieldName: string; // Instead of reading props each time

  constructor(props: FieldFeedbacksProps, context: FieldFeedbacksContext) {
    super(props, context);

    const { form, fieldFeedbacks: fieldFeedbacksParent } = context;

    this.key = fieldFeedbacksParent ? fieldFeedbacksParent.computeFieldFeedbackKey() : form.computeFieldFeedbacksKey();

    if (fieldFeedbacksParent) {
      this.fieldName = fieldFeedbacksParent.fieldName;
      if (props.for !== undefined) throw new TypeError("FieldFeedbacks cannot have a parent and a 'for' prop");
    } else {
      if (props.for === undefined) throw new TypeError("FieldFeedbacks cannot be without parent and without 'for' prop");
      else this.fieldName = props.for;
    }

    this.validate = this.validate.bind(this);
  }

  private fieldFeedbackKeyCounter = 0;
  computeFieldFeedbackKey() {
    return `${this.key}.${this.fieldFeedbackKeyCounter++}`;
  }

  addFieldFeedback() {
    return this.computeFieldFeedbackKey();
  }

  componentWillMount() {
    const { form, fieldFeedbacks: fieldFeedbacksParent } = this.context;

    form.fieldsStore.addField(this.fieldName);

    const parent = fieldFeedbacksParent ? fieldFeedbacksParent : form;
    parent.addValidateFieldEventListener(this.validate);
  }

  componentWillUnmount() {
    const { form, fieldFeedbacks: fieldFeedbacksParent } = this.context;

    form.fieldsStore.removeField(this.fieldName);

    const parent = fieldFeedbacksParent ? fieldFeedbacksParent : form;
    parent.removeValidateFieldEventListener(this.validate);
  }

  async validate(input: Input) {
    const { form, fieldFeedbacks: fieldFeedbacksParent } = this.context;

    let validations;

    const field = form.fieldsStore.getField(this.fieldName)!;

    if (input.name === this.fieldName) { // Ignore the event if it's not for us
      if (fieldFeedbacksParent !== undefined && (
          fieldFeedbacksParent.props.stop === 'first' && field.hasAnyFeedbacks(fieldFeedbacksParent.key) ||
          fieldFeedbacksParent.props.stop === 'first-error' && field.hasErrors(fieldFeedbacksParent.key) ||
          fieldFeedbacksParent.props.stop === 'first-warning' && field.hasWarnings(fieldFeedbacksParent.key) ||
          fieldFeedbacksParent.props.stop === 'first-info' && field.hasInfos(fieldFeedbacksParent.key))) {
        // Do nothing
      }
      else {
        validations = await this._validate(input);
      }
    }

    return validations;
  }

  async _validate(input: Input) {
    let validations;

    const arrayOfArrays = await this.emitValidateFieldEvent(input);
    validations = flattenDeep<FieldFeedbackValidation | undefined>(arrayOfArrays);

    return validations;
  }

  render() {
    const { children } = this.props;
    // See https://codepen.io/tkrotoff/pen/yzKKdB
    return children !== undefined ? children : null;
  }
}
