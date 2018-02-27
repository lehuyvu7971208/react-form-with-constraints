import { FieldFeedbackType } from './FieldFeedback';

export class FieldValidation {
  constructor(public readonly name: string, public readonly validations: FieldFeedbackValidation[]) {}

  hasErrors() {
    return this.validations.some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Error && fieldFeedback.show === true);
  }

  hasWarnings() {
    return this.validations.some(fieldFeedback => fieldFeedback.type === FieldFeedbackType.Warning && fieldFeedback.show === true);
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
