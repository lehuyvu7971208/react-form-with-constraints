import { FieldFeedbackValidation, FieldValidation } from './FieldValidation';
import clearArray from './clearArray';

// Field is a better name than Input, see Django Form fields https://docs.djangoproject.com/en/1.11/ref/forms/fields/
export class Field extends FieldValidation {
  addValidation(validation: FieldFeedbackValidation) {
    this.validations.push(validation);
  }

  clear() {
    clearArray(this.validations);
  }
}
