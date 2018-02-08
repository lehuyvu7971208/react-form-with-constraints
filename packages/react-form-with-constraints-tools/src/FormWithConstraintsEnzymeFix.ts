import { FormWithConstraints, FormWithConstraintsProps } from 'react-form-with-constraints';

// See https://github.com/airbnb/enzyme/issues/384#issuecomment-363830335
function new_FormWithConstraints(props: FormWithConstraintsProps) {
  const defaultProps = {
    fieldFeedbackClassNames: {
      error: 'error',
      warning: 'warning',
      info: 'info',
      valid: 'valid'
    }
  };
  return new FormWithConstraints({...defaultProps, ...props});
}

export default new_FormWithConstraints;
