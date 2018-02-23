import { FieldFeedbackType } from './FieldFeedback';
import flatten from './flatten';
import clearArray from './clearArray';

export class FieldFeedbackValidations {
  // FieldFeedback returns Promise<FieldFeedbackValidation>
  private validationsFromFieldFeedback: Promise<FieldFeedbackValidation>[] = [];

  // FieldFeedbacks returns Promise<FieldFeedbackValidation[] | undefined>
  // Async returns Promise<FieldFeedbackValidation[] | undefined>
  private validationsFromFieldFeedbacks: Promise<FieldFeedbackValidation[] | undefined>[] = [];

  addFieldFeedbackValidation(validation: Promise<FieldFeedbackValidation>) {
    this.validationsFromFieldFeedback.push(validation);
  }

  addFieldFeedbacksValidation(validation: Promise<FieldFeedbackValidation[] | undefined>) {
    this.validationsFromFieldFeedbacks.push(validation);
  }

  clear() {
    clearArray(this.validationsFromFieldFeedback);
    clearArray(this.validationsFromFieldFeedbacks);
  }

  private async getValidations() {
    await Promise.all([]);
    console.log('getValidations()', this.validationsFromFieldFeedback);
    const _validationsFromFieldFeedback = await Promise.all(this.validationsFromFieldFeedback);

    console.log('_validationsFromFieldFeedback', _validationsFromFieldFeedback);
    const tmp = await Promise.all(this.validationsFromFieldFeedbacks);
    // Remove undefined results
    // FIXME See Filtering undefined elements out of an array https://codereview.stackexchange.com/a/138289/148847
    const _validations = tmp.filter(validation => validation !== undefined) as FieldFeedbackValidation[][];
    const _validationsFromFieldFeedbacks = flatten(_validations);

    return [..._validationsFromFieldFeedback, ..._validationsFromFieldFeedbacks];
  }

  async hasErrors() {
    const validations = await this.getValidations();
    return validations.some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Error && fieldFeedback.show === true);
  }

  async hasWarnings() {
    const validations = await this.getValidations();
    return validations.some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Warning && fieldFeedback.show === true);
  }

  async hasInfos() {
    const validations = await this.getValidations();
    return validations.some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Info && fieldFeedback.show === true);
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
              // FIXME Rename to just name or remove completely?
  constructor(public readonly fieldName: string, public readonly fieldFeedbackValidations: FieldFeedbackValidation[]) {}

  hasErrors() {
    return this.fieldFeedbackValidations
      .some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Error && fieldFeedback.show === true);
  }

  hasWarnings() {
    return this.fieldFeedbackValidations
      .some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Warning && fieldFeedback.show === true);
  }

  isValid() {
    return !this.hasErrors();
  }
}

// FIXME Merge with FieldValidation?
export interface FieldFeedbackValidation {
  readonly key: string;
  readonly type: FieldFeedbackType;

  // undefined => means the FieldFeedback was not checked
  // or special case for when="valid": always displayed, then FieldFeedbackWhenValid decides what to do
  show: boolean | undefined;
}
