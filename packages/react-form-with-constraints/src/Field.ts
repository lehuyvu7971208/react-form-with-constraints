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

  hasErrors(excludeKey?: string) {
    return this.validations.some(fieldFeedback =>
      (excludeKey === undefined || fieldFeedback.key !== excludeKey) &&
      fieldFeedback.type === FieldFeedbackType.Error && fieldFeedback.show === true
    );
  }

  hasWarnings(excludeKey?: string) {
    return this.validations.some(fieldFeedback =>
      (excludeKey === undefined || fieldFeedback.key !== excludeKey) &&
      fieldFeedback.type === FieldFeedbackType.Warning && fieldFeedback.show === true
    );
  }

  hasInfos(excludeKey?: string) {
    return this.validations.some(fieldFeedback =>
      (excludeKey === undefined || fieldFeedback.key !== excludeKey) &&
      fieldFeedback.type === FieldFeedbackType.Info && fieldFeedback.show === true
    );
  }

  hasFeedbacks(excludeKey?: string) {
    return this.hasErrors(excludeKey) || this.hasWarnings(excludeKey) || this.hasInfos(excludeKey);
  }

  isValid() {
    return !this.hasErrors();
  }
}
