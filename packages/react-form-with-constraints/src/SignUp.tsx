import React from 'react';

import { FormWithConstraints, FieldFeedback, Async } from './index';
import checkUsernameAvailability from './checkUsernameAvailability';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  innerRef?: React.Ref<HTMLInputElement>;
}

function _TextInput(props: InputProps) {
  const { innerRef, children, ...inputProps } = props;
  return (
    <input ref={innerRef} {...inputProps} />
  );
}

function _PasswordInput(props: InputProps) {
  const { innerRef, children, ...inputProps } = props;
  return (
    <input type="password" ref={innerRef} {...inputProps} />
  );
}

export interface SignUpProps {
  TextInput: (props: InputProps) => JSX.Element;
  PasswordInput: (props: InputProps) => JSX.Element;
}

export class SignUp extends React.Component<Partial<SignUpProps>> {
  static defaultProps: SignUpProps = {
    TextInput: _TextInput,
    PasswordInput: _PasswordInput
  };

  form: FormWithConstraints | null | undefined;
  username: HTMLInputElement | null | undefined;
  password: HTMLInputElement | null | undefined;
  passwordConfirm: HTMLInputElement | null | undefined;

  render() {
    const { TextInput, PasswordInput } = this.props as SignUpProps;

    return (
      <FormWithConstraints ref={formWithConstraints => this.form = formWithConstraints}>
        <TextInput name="username" innerRef={username => this.username = username} />
        <FieldFeedbacks for="username">
          <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
          <FieldFeedback when={value => value.length < 3}>Should be at least 3 characters long</FieldFeedback>
          <Async
            promise={checkUsernameAvailability}
            then={availability => availability.available ?
              <FieldFeedback info>Username '{availability.value}' available</FieldFeedback> :
              <FieldFeedback>Username '{availability.value}' already taken, choose another</FieldFeedback>
            }
            catch={e => <FieldFeedback>{e.message}</FieldFeedback>}
          />
          <FieldFeedback when="valid">Looks good!</FieldFeedback>
        </FieldFeedbacks>

        <PasswordInput name="password" innerRef={password => this.password = password} />
        <FieldFeedbacks for="password">
          <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
          <FieldFeedback when={value => value.length < 5}>Should be at least 5 characters long</FieldFeedback>
          <FieldFeedback when={value => !/\d/.test(value)} warning>Should contain numbers</FieldFeedback>
          <FieldFeedback when={value => !/[a-z]/.test(value)} warning>Should contain small letters</FieldFeedback>
          <FieldFeedback when={value => !/[A-Z]/.test(value)} warning>Should contain capital letters</FieldFeedback>
          <FieldFeedback when={value => !/\W/.test(value)} warning>Should contain special characters</FieldFeedback>
          <FieldFeedback when="valid">Looks good!</FieldFeedback>
        </FieldFeedbacks>

        <PasswordInput name="passwordConfirm" innerRef={passwordConfirm => this.passwordConfirm = passwordConfirm} />
        <FieldFeedbacks for="passwordConfirm">
          <FieldFeedback when={value => value !== this.password!.value}>Not the same password</FieldFeedback>
          <FieldFeedback when="valid">Looks good!</FieldFeedback>
        </FieldFeedbacks>
      </FormWithConstraints>
    );
  }
}
