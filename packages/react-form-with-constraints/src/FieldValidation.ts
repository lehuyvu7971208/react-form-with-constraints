import { FieldFeedbackType } from './FieldFeedback';

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
