import FieldFeedbackValidation from './FieldFeedbackValidation';
import { FieldFeedbackType } from './FieldFeedback';
import clearArray from './clearArray';

// Field is a better name than Input, see Django Form fields https://docs.djangoproject.com/en/1.11/ref/forms/fields/
export default class Field {
  public readonly validations: FieldFeedbackValidation[];

  constructor(public readonly name: string) {
    this.validations = [];
  }

  addOrReplaceValidation(validation: FieldFeedbackValidation) {
    // See Update if exists or add new element to array of objects https://stackoverflow.com/a/49375465/990356
    const i = this.validations.findIndex(_validation => _validation.key === validation.key);
    if (i > -1) this.validations[i] = validation;
    else this.validations.push(validation);
  }

  clear() {
    clearArray(this.validations);
  }

  hasFeedbacksOfType(type: FieldFeedbackType, fieldFeedbacksKey?: string, excludeKey?: string) {
    return this.validations.some(fieldFeedback =>
      (fieldFeedbacksKey === undefined || fieldFeedback.key.startsWith(`${fieldFeedbacksKey}.`)) &&
      (excludeKey === undefined || fieldFeedback.key !== excludeKey) &&
      fieldFeedback.type === type && fieldFeedback.show === true
    );
  }

  hasErrors(fieldFeedbacksKey?: string, excludeFieldFeedbackKey?: string) {
    return this.hasFeedbacksOfType(FieldFeedbackType.Error, fieldFeedbacksKey, excludeFieldFeedbackKey);
  }

  hasWarnings(fieldFeedbacksKey?: string, excludeFieldFeedbackKey?: string) {
    return this.hasFeedbacksOfType(FieldFeedbackType.Warning, fieldFeedbacksKey, excludeFieldFeedbackKey);
  }

  hasInfos(fieldFeedbacksKey?: string, excludeFieldFeedbackKey?: string) {
    return this.hasFeedbacksOfType(FieldFeedbackType.Info, fieldFeedbacksKey, excludeFieldFeedbackKey);
  }

  hasAnyFeedbacks(fieldFeedbacksKey?: string, excludeFieldFeedbackKey?: string) {
    return this.hasErrors(fieldFeedbacksKey, excludeFieldFeedbackKey) ||
           this.hasWarnings(fieldFeedbacksKey, excludeFieldFeedbackKey) ||
           this.hasInfos(fieldFeedbacksKey, excludeFieldFeedbackKey);
  }

  isValid() {
    return !this.hasErrors();
  }
}
