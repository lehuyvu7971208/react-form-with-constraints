import { FieldFeedbackValidation, FieldFeedbackType } from './FieldFeedbackValidation';

export default class FieldValidation {
              // FIXME Rename to just name or remove completely?
  constructor(public fieldName: string, public fieldFeedbackValidations: FieldFeedbackValidation[]) {}

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
