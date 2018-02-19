export default interface FieldFeedbackValidation {
  key: number;
  invalidatesField: boolean | undefined; // undefined means the FieldFeedback was not checked
}
