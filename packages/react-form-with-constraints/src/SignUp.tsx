import React from 'react';

import { FormWithConstraints, FieldFeedback, Async } from './index';
import checkUsernameAvailability from './checkUsernameAvailability';
import FieldFeedbacks from './FieldFeedbacksEnzymeFix';

export interface SignUpProps {
}

export class SignUp extends React.Component<SignUpProps> {
  form: FormWithConstraints | null | undefined;
  username: HTMLInputElement | null | undefined;
  password: HTMLInputElement | null | undefined;
  passwordConfirm: HTMLInputElement | null | undefined;

  render() {
    return (
      <FormWithConstraints ref={formWithConstraints => this.form = formWithConstraints}>
        <input name="username" ref={username => this.username = username} />
        <FieldFeedbacks for="username">
          <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
          <FieldFeedback when={value => value.length < 3}>Should be at least 3 characters long</FieldFeedback>
          <Async
            promise={checkUsernameAvailability}
            pending="..."
            then={availability => availability.available ?
              <FieldFeedback info>Username '{availability.value}' available</FieldFeedback> :
              <FieldFeedback>Username '{availability.value}' already taken, choose another</FieldFeedback>
            }
            catch={e => <FieldFeedback>{e.message}</FieldFeedback>}
          />
          <FieldFeedback when="valid">Looks good!</FieldFeedback>
        </FieldFeedbacks>

        <input type="password" name="password" ref={password => this.password = password} />
        <FieldFeedbacks for="password">
          <FieldFeedback when={value => value.length === 0}>Cannot be empty</FieldFeedback>
          <FieldFeedback when={value => value.length < 5}>Should be at least 5 characters long</FieldFeedback>
          <FieldFeedback when={value => !/\d/.test(value)} warning>Should contain numbers</FieldFeedback>
          <FieldFeedback when={value => !/[a-z]/.test(value)} warning>Should contain small letters</FieldFeedback>
          <FieldFeedback when={value => !/[A-Z]/.test(value)} warning>Should contain capital letters</FieldFeedback>
          <FieldFeedback when={value => !/\W/.test(value)} warning>Should contain special characters</FieldFeedback>
          <FieldFeedback when="valid">Looks good!</FieldFeedback>
        </FieldFeedbacks>

        <input type="password" name="passwordConfirm" ref={passwordConfirm => this.passwordConfirm = passwordConfirm} />
        <FieldFeedbacks for="passwordConfirm">
          <FieldFeedback when={value => value !== this.password!.value}>Not the same password</FieldFeedback>
          <FieldFeedback when="valid">Looks good!</FieldFeedback>
        </FieldFeedbacks>
      </FormWithConstraints>
    );
  }
}
