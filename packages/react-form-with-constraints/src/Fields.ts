import { FieldFeedbackValidation, FieldValidation } from './FieldValidation';
import { FieldFeedbackType } from './FieldFeedback';
import clearArray from './clearArray';

// Field is a better name than Input, see Django Form fields https://docs.djangoproject.com/en/1.11/ref/forms/fields/
export class Field extends FieldValidation {
  addValidation(validation: FieldFeedbackValidation) {
    this.validations.push(validation);
  }

  clear() {
    clearArray(this.validations);
  }

  hasInfos() {
    return this.validations.some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Info && fieldFeedback.show === true);
  }

  hasFeedbacks() {
    return this.hasErrors() || this.hasWarnings() || this.hasInfos();
  }
}
