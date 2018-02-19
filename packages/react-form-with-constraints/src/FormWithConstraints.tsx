import React from 'react';
import PropTypes from 'prop-types';

import withValidateFieldEventEmitter from './withValidateFieldEventEmitter';
import withFieldValidatedEventEmitter from './withFieldValidatedEventEmitter';
import withResetFormEventEmitter from './withResetFormEventEmitter';
import FieldFeedbackValidation from './FieldFeedbackValidation';
import FieldFeedbacksValidation from './FieldFeedbacksValidation';
// @ts-ignore
// TS6133: 'EventEmitter' is declared but its value is never read.
// FIXME See https://github.com/Microsoft/TypeScript/issues/9944#issuecomment-309903027
import { EventEmitter } from './EventEmitter';
import Input from './Input';
import { FieldsStore } from './FieldsStore';

// See Form data validation https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation
// See ReactJS Form Validation Approaches http://moduscreate.com/reactjs-form-validation-approaches/

/*
FormWithConstraints
  - input
  - FieldFeedbacks
    - FieldFeedback
    - FieldFeedback
    - ...
  - input
  - FieldFeedbacks
    - FieldFeedback
    - FieldFeedback
    - ...
  - ...

FormWithConstraints contains the FieldsStore:
{
  username: {
    dirty: true,
    errors: [0.0], // List of FieldFeedback keys
    warnings: [0.2, 1.1],
    infos: []
  },
  password: {
    dirty: false,
    errors: [],
    warnings: [],
    infos: []
  }
}
FieldsStore is passed to FieldFeedbacks and FieldFeedback thanks to React context.

Most of the intelligence is inside FieldFeedback validate() and render()

When an input changes (validateFields()):
 => FormWithConstraints notifies all FieldFeedbacks
  => FieldFeedbacks filters unrelated input changes and then notifies its FieldFeedback (validate())
   => FieldFeedback updates the FieldsStore and emits FieldEvent.Updated (validate())
    => All related FieldFeedback re-render
*/

export interface FormWithConstraintsChildContext {
  form: FormWithConstraints;
}

export interface FormWithConstraintsProps extends React.FormHTMLAttributes<HTMLFormElement> {
  fieldFeedbackClassNames?: {
    error: string;
    warning: string;
    info: string;
    valid: string;
  };
}

// FieldFeedbacks returns FieldFeedbackValidation[] | undefined and Async returns Promise<FieldFeedbackValidation[]> | undefined
type ValidateFieldEventListenerReturnType = FieldFeedbackValidation[] | Promise<FieldFeedbackValidation[]> | undefined | void /* void for react-form-with-constraints-bootstrap4 */;

export class FormWithConstraintsComponent extends React.Component<FormWithConstraintsProps> {}
export class FormWithConstraints
  extends
    withResetFormEventEmitter(
      withFieldValidatedEventEmitter(
        withValidateFieldEventEmitter<ValidateFieldEventListenerReturnType, typeof FormWithConstraintsComponent>(
          FormWithConstraintsComponent
        )
      )
    )
  implements React.ChildContextProvider<FormWithConstraintsChildContext> {

  static defaultProps: FormWithConstraintsProps = {
    fieldFeedbackClassNames: {
      error: 'error',
      warning: 'warning',
      info: 'info',
      valid: 'valid'
    }
  };

  static childContextTypes: React.ValidationMap<FormWithConstraintsChildContext> = {
    form: PropTypes.object.isRequired
  };
  getChildContext(): FormWithConstraintsChildContext {
    return {
      form: this
    };
  }

  // Could be named innerRef instead, see https://github.com/ant-design/ant-design/issues/5489#issuecomment-332208652
  private form: HTMLFormElement | null | undefined;

  fieldsStore = new FieldsStore();

  private fieldFeedbacksKeyCounter = 0;
  computeFieldFeedbacksKey() {
    return this.fieldFeedbacksKeyCounter++;
  }

  /**
   * Validates the given fields, either HTMLInputElements or field names.
   * If called without arguments, validates all fields ($('[name]')).
   */
  validateFields(...inputsOrNames: Array<Input | string>) {
    return this._validateFields(true /* validateDirtyFields */, ...inputsOrNames);
  }

  // Validates only what's necessary (e.g. non-dirty fields)
  validateForm() {
    return this._validateFields(false /* validateDirtyFields */);
  }

  private _validateFields(validateDirtyFields: boolean, ...inputsOrNames: Array<Input | string>) {
    const fieldValidationPromises = new Array<Promise<FieldFeedbacksValidation>>();

    const inputs = this.normalizeInputs(...inputsOrNames);

    inputs.forEach(input => {
      const fieldName = input.name;

      const field = this.fieldsStore.fields[fieldName];
      if (validateDirtyFields || (field !== undefined && !field.dirty)) {
        const fieldFeedbackValidationsPromises = this.emitValidateFieldEvent(input)
          .filter(fieldFeedbackValidations => fieldFeedbackValidations !== undefined) // Remove undefined results
          .map(fieldFeedbackValidations => Promise.resolve(fieldFeedbackValidations!)); // Transforms all results into Promises

        const fieldValidationPromise = Promise.all(fieldFeedbackValidationsPromises)
          .then(validations =>
            // See Merge/flatten an array of arrays in JavaScript? https://stackoverflow.com/q/10865025/990356
            validations.reduce((prev, curr) => prev.concat(curr), [])
          )
          .then(fieldFeedbackValidations => (
            // tslint:disable-next-line:no-object-literal-type-assertion
            {
              fieldName,
              isValid: () => fieldFeedbackValidations.every(fieldFeedbackValidation => !fieldFeedbackValidation.invalidatesField),
              fieldFeedbackValidations
            } as FieldFeedbacksValidation
          ));

        this.emitFieldValidatedEvent(input, fieldValidationPromise);

        fieldValidationPromises.push(fieldValidationPromise);
      }
    });

    return Promise.all(fieldValidationPromises);
  }

  // If called without arguments, returns all fields ($('[name]'))
  // Returns the inputs in the same order they were given
  private normalizeInputs(...inputsOrNames: Array<Input | string>) {
    let inputs;

    if (inputsOrNames.length === 0) {
      // [name] matches <input name="...">, <select name="...">, <button name="...">, ...
      // See Convert JavaScript NodeList to Array? https://stackoverflow.com/a/33822526/990356
      inputs = [...this.form!.querySelectorAll<HTMLInputElement>('[name]')];
      inputs
        .filter(input => input.type !== 'checkbox' && input.type !== 'radio')
        .map(input => input.name)
        .forEach((name, index, self) => {
          if (self.indexOf(name) !== index) {
            throw new Error(`Multiple elements matching '[name="${name}"]' inside the form`);
          }
        });
    } else {
      inputs = inputsOrNames.map(input => {
        if (typeof input === 'string') {
          const query = `[name="${input}"]`;
          const elements = [...this.form!.querySelectorAll<HTMLInputElement>(query)];
          if (elements.filter(element => element.type !== 'checkbox' && element.type !== 'radio').length > 1) {
            throw new Error(`Multiple elements matching '${query}' inside the form`);
          }
          return elements[0];
        } else {
          return input;
        }
      });
    }

    return inputs;
  }

  // Lazy check => the fields structure might be incomplete
  isValid() {
    const fieldNames = Object.keys(this.fieldsStore.fields);
    return fieldNames.every(fieldName => !this.fieldsStore.hasErrorsFor(fieldName));
  }

  reset() {
    this.fieldsStore.reset();
    this.emitResetFormEvent();
  }

  render() {
    const { children, fieldFeedbackClassNames, ...formProps } = this.props;
    return <form ref={form => this.form = form} {...formProps}>{children}</form>;
  }
}
