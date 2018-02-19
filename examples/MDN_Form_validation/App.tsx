import React from 'react';
import ReactDOM from 'react-dom';

import { FormWithConstraints, FieldFeedbacks, FieldFeedback } from 'react-form-with-constraints';

import './style.css';
import './index.html';
import './original.html';

class Form extends React.Component {
  form: FormWithConstraints | null | undefined;

  constructor(props: {}) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    this.form!.validateFields(e.currentTarget);
  }

  async handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await this.form!.validateForm();
    if (this.form!.isValid()) {
      alert('Valid form');
    } else {
      alert('Invalid form');
    }
  }

  render() {
    return (
      <FormWithConstraints ref={formWithConstraints => this.form = formWithConstraints}
                           onSubmit={this.handleSubmit} noValidate>
        <p>
          <fieldset>
            <legend>Title<abbr title="This field is mandatory">*</abbr></legend>
            <input type="radio" required name="title" id="r1" value="Mr" onChange={this.handleChange} /><label htmlFor="r1">Mr.</label>
            <input type="radio" required name="title" id="r2" value="Ms" onChange={this.handleChange} /><label htmlFor="r2">Ms.</label>
            <FieldFeedbacks for="title">
              <FieldFeedback when="*" />
            </FieldFeedbacks>
          </fieldset>
        </p>
        <p>
          <label htmlFor="n1">How old are you?</label>
          {/* The pattern attribute can act as a fallback for browsers which
              don't implement the number input type but support the pattern attribute.
              Please note that browsers that support the pattern attribute will make it
              fail silently when used with a number field.
              Its usage here acts only as a fallback */}
          <input type="number" min={12} max={120} step={1} id="n1" name="age"
                 pattern="\d+" onChange={this.handleChange} />
          <FieldFeedbacks for="age">
            <FieldFeedback when="*" />
          </FieldFeedbacks>
        </p>
        <p>
          <label htmlFor="t1">What's your favorite fruit?<abbr title="This field is mandatory">*</abbr></label>
          <input type="text" id="t1" name="fruit" list="l1" required
                 pattern="[Bb]anana|[Cc]herry|[Aa]pple|[Ss]trawberry|[Ll]emon|[Oo]range" onChange={this.handleChange} />
          <datalist id="l1">
            <option>Banana</option>
            <option>Cherry</option>
            <option>Apple</option>
            <option>Strawberry</option>
            <option>Lemon</option>
            <option>Orange</option>
          </datalist>
          <FieldFeedbacks for="fruit">
            <FieldFeedback when="*" />
          </FieldFeedbacks>
        </p>
        <p>
          <label htmlFor="t2">What's your e-mail?</label>
          <input type="email" id="t2" name="email" onChange={this.handleChange} />
          <FieldFeedbacks for="email">
            <FieldFeedback when="*" />
          </FieldFeedbacks>
        </p>
        <p>
          <label htmlFor="t3">Leave a short message</label>
          <textarea id="t3" name="msg" maxLength={140} rows={5} onChange={this.handleChange} />
          <FieldFeedbacks for="msg">
            <FieldFeedback when="*" />
          </FieldFeedbacks>
        </p>
        <p>
          <button>Submit</button>
        </p>
      </FormWithConstraints>
    );
  }
}

const App = () => (
  <>
    Taken and adapted from <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Form_validation">MDN - Form data validation</a>: <a href="original.html">original demo</a>
    <Form />
  </>
);

ReactDOM.render(<App />, document.getElementById('app'));
