import { FieldFeedbackType } from './FieldFeedback';

export class LastValidation {
  // FieldFeedback returns FieldFeedbackValidation
  private validationFromFieldFeedback?: FieldFeedbackValidation;

  // FieldFeedbacks returns FieldFeedbackValidation[] | undefined
  // Async returns FieldFeedbackValidation[] | undefined
  private validationFromFieldFeedbacks?: (FieldFeedbackValidation | undefined)[];

  setFieldFeedback(validation: FieldFeedbackValidation) {
    this.validationFromFieldFeedback = validation;
    //console.log('setFieldFeedbackValidation', validation);
  }

  setFieldFeedbacks(validation: (FieldFeedbackValidation | undefined)[]) {
    this.validationFromFieldFeedbacks = validation;
    //console.log('setFieldFeedbacksValidation', validation);
  }

  clear() {
    this.validationFromFieldFeedback = undefined;
    this.validationFromFieldFeedbacks = undefined;
  }

  private getValidations() {
    const validations = [];

    const _validation = this.validationFromFieldFeedback;
    if (_validation !== undefined) validations.push(_validation);

    const _validations = this.validationFromFieldFeedbacks;
    if (_validations !== undefined) validations.push(..._validations);

    return validations;
  }

  hasErrors() {
    const validations = this.getValidations();
    return validations.some(fieldFeedback => fieldFeedback!.type === FieldFeedbackType.Error && fieldFeedback!.show === true);
  }

  hasWarnings() {
    const validations = this.getValidations();
    return validations.some(fieldFeedback => fieldFeedback!.type === FieldFeedbackType.Warning && fieldFeedback!.show === true);
  }

  hasInfos() {
    const validations = this.getValidations();
    return validations.some(fieldFeedback => fieldFeedback!.type === FieldFeedbackType.Info && fieldFeedback!.show === true);
  }

  hasFeedbacks() {
    return this.hasErrors() || this.hasWarnings() || this.hasInfos();
  }
}

// FIXME Split/change this to simple helper functions? FieldFeedbackValidations.hasErrors() + FieldValidation that calls FieldFeedbackValidations?
// or just hasErrors(FieldFeedbackValidation[]) functions?
// FIXME Rename to something generique and not specific to "Field"
// FIXME Change this to make it like FieldFeedbacksValidation, make it as an helper?
export class FieldValidation {
  constructor(public readonly name: string, public readonly validations: FieldFeedbackValidation[]) {}

  hasErrors() {
    return this.validations
      .some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Error && fieldFeedback.show === true);
  }

  hasWarnings() {
    return this.validations
      .some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Warning && fieldFeedback.show === true);
  }

  isValid() {
    return !this.hasErrors();
  }
}

export interface FieldFeedbackValidation {
  readonly key: string;
  readonly type: FieldFeedbackType;

  // undefined => means the FieldFeedback was not checked
  // undefined => special case for when="valid": always displayed, then FieldFeedbackWhenValid decides what to do
  show: boolean | undefined;
}
