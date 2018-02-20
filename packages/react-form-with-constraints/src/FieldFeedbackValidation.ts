export enum FieldFeedbackType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  WhenValid = 'whenValid'
}

export interface FieldFeedbackValidation {
  key: string;
  type: FieldFeedbackType;
  show: boolean | undefined; // undefined => special case for when="valid": always displayed, then FieldFeedbackWhenValid decides what to do
}
