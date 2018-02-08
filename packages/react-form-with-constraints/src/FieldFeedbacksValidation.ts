import FieldFeedbackValidation from './FieldFeedbackValidation';

export default interface FieldFeedbacksValidation {
  fieldName: string;
  isValid: () => boolean;
  fieldFeedbackValidations: FieldFeedbackValidation[];
}
