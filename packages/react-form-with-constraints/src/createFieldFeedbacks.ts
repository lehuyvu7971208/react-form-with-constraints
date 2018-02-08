import {
  FormWithConstraints,
  FieldFeedbacks,
  FieldFeedbacksProps
} from './index';

export default function createFieldFeedbacks(props: FieldFeedbacksProps, form: FormWithConstraints, initialFieldFeedbackKeyCounter: number) {
  const fieldFeedbacks = new FieldFeedbacks(props, {form});
  fieldFeedbacks.fieldFeedbackKeyCounter = initialFieldFeedbackKeyCounter;
  return fieldFeedbacks;
}
