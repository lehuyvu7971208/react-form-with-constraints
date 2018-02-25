import React from 'react';
import PropTypes from 'prop-types';

import { withValidateFieldEventEmitter } from './withValidateFieldEventEmitter';
import withFieldValidatedEventEmitter from './withFieldValidatedEventEmitter';
import withResetEventEmitter from './withResetEventEmitter';
// @ts-ignore
// TS6133: 'EventEmitter' is declared but its value is never read.
// FIXME See https://github.com/Microsoft/TypeScript/issues/9944#issuecomment-309903027
import { EventEmitter } from './EventEmitter';
import Input from './Input';
import { FieldsStore } from './FieldsStore';
import { FieldValidation, FieldFeedbackValidation } from './FieldValidation';
//import flattenDeep from './flattenDeep';
import * as _ from 'lodash';

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
    validateEventEmitted: true
  },
  password: {
    validateEventEmitted: true
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
    [index: string]: string;
  };
}

export class FormWithConstraintsComponent extends React.Component<FormWithConstraintsProps> {}
export class FormWithConstraints
  extends
    withResetEventEmitter(
      withFieldValidatedEventEmitter(
        withValidateFieldEventEmitter<
          // FieldFeedback returns FieldFeedbackValidation
          // FieldFeedbacks returns FieldFeedbackValidation[] | undefined
          // Async returns FieldFeedbackValidation[] | undefined
          FieldFeedbackValidation[] | undefined,
          typeof FormWithConstraintsComponent
        >(
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
    return this._validateFields(true /* forceValidateFields */, ...inputsOrNames);
  }

  // Validates only what's necessary (e.g. non-checked fields)
  validateForm() {
    return this._validateFields(false /* forceValidateFields */);
  }

  async validateField(forceValidateFields: boolean, input: Input) {
    const fieldName = input.name;
    const field = this.fieldsStore.fields[fieldName];

    let fieldValidation;

    if (field === undefined) {
      // Means the field (<input name="username">) does not have a FieldFeedbacks
      // so let's ignore this field
    }

    else if (forceValidateFields || !field.validateEventEmitted) {
      field.validateEventEmitted = true;

      const arrayOfArrays = await this.emitValidateFieldEvent(input);
      console.log('form emitValidateFieldEvent=', arrayOfArrays);
      const validations = _.flattenDeep(arrayOfArrays).filter(notUndefined);

      fieldValidation = new FieldValidation(fieldName, validations);

      this.emitFieldValidatedEvent(input, fieldValidation);
    }

    return fieldValidation;
  }

  private async _validateFields(forceValidateFields: boolean, ...inputsOrNames: Array<Input | string>) {
    const fieldValidations = new Array<FieldValidation>();

    const inputs = this.normalizeInputs(...inputsOrNames);

    for (const input of inputs) {
      const fieldValidation = await this.validateField(forceValidateFields, input);
      if (fieldValidation !== undefined) fieldValidations.push(fieldValidation);
    }

    return fieldValidations;
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
          if (elements.filter(el => el.type !== 'checkbox' && el.type !== 'radio').length > 1) {
            throw new Error(`Multiple elements matching '${query}' inside the form`);
          }
          const element = elements[0];
          if (element === undefined) {
            throw new Error(`Could not find field '${query}' inside the form`);
          }
          return element;
        } else {
          return input;
        }
      });
    }

    return inputs;
  }

  // Does not check if fields are dirty
  isValid() {
    return true;
  }

  reset() {
    this.fieldsStore.clear();
    this.emitResetEvent();
  }

  render() {
    const { children, fieldFeedbackClassNames, ...formProps } = this.props;
    return <form ref={form => this.form = form} {...formProps}>{children}</form>;
  }
}

// See "TypeScript static analysis is unable to track this behavior" https://codereview.stackexchange.com/a/138289/148847
// See TypeScript filter out nulls from an array https://stackoverflow.com/q/43118692
function notUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
