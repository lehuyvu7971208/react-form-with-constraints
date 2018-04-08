import React from 'react';
import { Text, View } from 'react-native';
import { TextInput } from './react-native-TextInput-fix'; // Specific to TypeScript

import {
  FormWithConstraints as _FormWithConstraints,
  FieldFeedbacks as _FieldFeedbacks,
  Async,
  FieldFeedback as _FieldFeedback,
  FieldFeedbackWhenValid as _FieldFeedbackWhenValid,
  Field
} from 'react-form-with-constraints';

// Recursive React.Children.forEach()
// Taken from https://github.com/fernandopasik/react-children-utilities/blob/v0.2.2/src/index.js#L68
function deepForEach(children: React.ReactNode, fn: (child: React.ReactElement<any>) => void) {
  React.Children.forEach(children, child => {
    const element = child as React.ReactElement<any>;
    if (element.props && element.props.children && typeof element.props.children === 'object') {
      deepForEach(element.props.children, fn);
    }
    fn(element);
  });
}

// Overrides Input and remove type, validity and validationMessage properties
export interface Input {
  name: string;

  // Tested: TextInput props.value is always a string and never undefined (empty string instead)
  // Still need to make it optional
  value?: string;
}

export class FormWithConstraints extends _FormWithConstraints {
  // @ts-ignore
  // TS2416: Property 'validateFields' in type 'FormWithConstraints' is not assignable to the same property in base type 'FormWithConstraints'
  validateFields(...inputsOrNames: Array<TextInput | string>) {
    return this._validateFields(true /* forceValidateFields */, ...inputsOrNames);
  }

  private async _validateFields(forceValidateFields: boolean, ...inputsOrNames: Array<TextInput | string>) {
    const fields = new Array<Readonly<Field>>();

    const inputs = this.normalizeInputs(...inputsOrNames);

    for (const input of inputs) {
      const fieldName = input.props.name;

      const _input = {
        name: fieldName,
        type: undefined as any,
        value: input.props.value!, // Tested: TextInput props.value is always a string and never undefined (empty string instead)
        validity: undefined as any,
        validationMessage: undefined as any
      };

      const field = await this.validateField(forceValidateFields, _input);
      if (field !== undefined) fields.push(field);
    }

    return fields;
  }

  // If called without arguments, returns all fields
  // Returns the inputs in the same order they were given
  private normalizeInputs(...inputsOrNames: Array<TextInput | string>) {
    const inputs: React.ReactElement<Input>[] = [];

    if (inputsOrNames.length === 0) {
      // Find all children with a name
      deepForEach(this.props.children, (child: React.ReactElement<Input>) => {
        if (child.props !== undefined) {
          const fieldName = child.props.name;
          if (fieldName !== undefined && fieldName.length > 0) {
            inputs.push(child);
          }
        }
      });
    } else {
      inputsOrNames.forEach(input => {
        if (typeof input === 'string') {
          deepForEach(this.props.children, (child: React.ReactElement<Input>) => {
            if (child.props !== undefined) {
              const fieldName = child.props.name;
              if (input === fieldName) {
                inputs.push(child);
              }
            }
          });
        } else {
          inputs.push(input as any as React.ReactElement<Input>);
        }
      });
    }

    // Checks

    const namesFound = inputs.map(input => input.props.name);
    namesFound.forEach((name, index, self) => {
      if (self.indexOf(name) !== index) {
        throw new Error(`Multiple elements matching '[name="${name}"]' inside the form`);
      }
    });

    const names = inputsOrNames.filter(input => typeof input === 'string') as string[];
    names.forEach(name => {
      if (!namesFound.includes(name)) {
        throw new Error(`Could not find field '[name="${name}"]' inside the form`);
      }
    });

    return inputs;
  }

  render() {
    // FIXME See Support for Fragments in react native instead of view https://react-native.canny.io/feature-requests/p/support-for-fragments-in-react-native-instead-of-view
    return <View {...this.props as any} />;
  }
}


// FIXME See Support for Fragments in react native instead of view https://react-native.canny.io/feature-requests/p/support-for-fragments-in-react-native-instead-of-view
export class FieldFeedbacks extends _FieldFeedbacks {
  render() {
    return <View {...this.props} />;
  }
}


export { Async };


export class FieldFeedback extends _FieldFeedback {
  render() {
    const { when, error, warning, info, children, ...textProps } = this.props;
                      // React Native implementation needs to access props thus the cast
    const { style } = (this.context.form as any as FormWithConstraints).props;

    // Special case for when="valid"
    if (when === 'valid') {
      return <FieldFeedbackWhenValid data-feedback={this.key} {...textProps}>{children}</FieldFeedbackWhenValid>;
    }

    const className = this.className();

    let feedback = null;
    if (className !== undefined) { // Means the FieldFeedback should be displayed
      const tmp = style !== undefined ? style[className] : undefined;

      // The last style property is the one applied
      feedback = children !== undefined ? <Text style={tmp} {...textProps}>{children}</Text> : null;
    }

    return feedback;
  }
}


export class FieldFeedbackWhenValid extends _FieldFeedbackWhenValid {
  render() {
    const { fieldIsValid } = this.state;
    const { form } = this.context;
                      // React Native implementation needs to access props thus the cast
    const { style } = (form as any as FormWithConstraints).props;

    const className = form.props.fieldFeedbackClassNames!.valid;
    const tmp = style !== undefined ? style[className] : undefined;

    return fieldIsValid ? <Text style={tmp} {...this.props} /> : null;
  }
}
