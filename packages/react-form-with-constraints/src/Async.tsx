import React from 'react';
import PropTypes from 'prop-types';

import { FieldFeedbacksChildContext } from './FieldFeedbacks';
import { withValidateFieldEventEmitter } from './withValidateFieldEventEmitter';
import withResetEventEmitter from './withResetEventEmitter';
// @ts-ignore
// TS6133: 'EventEmitter' is declared but its value is never read.
// FIXME See https://github.com/Microsoft/TypeScript/issues/9944#issuecomment-309903027
import { EventEmitter } from './EventEmitter';
import { FieldFeedbackValidation } from './FieldValidation';
import Input from './Input';
import setStatePromise from './setStatePromise';

export enum Status {
  None,
  Pending,
  Rejected,
  Resolved
}

export interface AsyncProps<T> {
  promise: (value: string) => Promise<T>;
  pending?: React.ReactNode;
  then?: (value: T) => React.ReactNode;
  catch?: (reason: any) => React.ReactNode;
}

export interface AsyncState<T> {
  status: Status;
  value?: T;
}

export interface AsyncChildContext {
  async: Async<any>;
}

export type AsyncContext = FieldFeedbacksChildContext;

export type AsyncComponentType = AsyncComponent<any>;

// See Asynchronous form errors and messages in AngularJS https://jaysoo.ca/2014/10/14/async-form-errors-and-messages-in-angularjs/
// See Support for asynchronous values (like Promises and Observables) https://github.com/facebook/react/issues/6481
// See https://github.com/capaj/react-promise
// See How to render promises in React https://gist.github.com/hex13/6d46f8b54631871ea8bf87576b635c49
// Cannot be inside a separated npm package since FieldFeedback needs to attach itself to Async
export class AsyncComponent<T = any> extends React.Component<AsyncProps<T>, AsyncState<T>> {}
export class Async<T> extends
                        withResetEventEmitter(
                          withValidateFieldEventEmitter<
                            // FieldFeedback returns FieldFeedbackValidation
                            FieldFeedbackValidation,
                            typeof AsyncComponent
                          >(
                            AsyncComponent
                          )
                        )
                      implements React.ChildContextProvider<AsyncChildContext> {
  static contextTypes: React.ValidationMap<AsyncContext> = {
    fieldFeedbacks: PropTypes.object.isRequired
  };
  context!: AsyncContext;

  static childContextTypes: React.ValidationMap<AsyncChildContext> = {
    async: PropTypes.object.isRequired
  };
  getChildContext(): AsyncChildContext {
    return {
      async: this
    };
  }

  constructor(props: AsyncProps<T>) {
    super(props);

    this.state = {
      status: Status.None
    };

    this.validate = this.validate.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillMount() {
    this.context.fieldFeedbacks.addValidateFieldEventListener(this.validate as any);
    this.context.fieldFeedbacks.addResetEventListener(this.reset);
  }

  componentWillUnmount() {
    this.context.fieldFeedbacks.removeValidateFieldEventListener(this.validate as any);
    this.context.fieldFeedbacks.removeResetEventListener(this.reset);
  }

  async validate(input: Input) {
    const { fieldFeedbacks } = this.context;

    let validations;

    if (fieldFeedbacks.props.stop === 'first' && fieldFeedbacks.lastValidation.hasFeedbacks() ||
        fieldFeedbacks.props.stop === 'first-error' && fieldFeedbacks.lastValidation.hasErrors() ||
        fieldFeedbacks.props.stop === 'first-warning' && fieldFeedbacks.lastValidation.hasWarnings() ||
        fieldFeedbacks.props.stop === 'first-info' && fieldFeedbacks.lastValidation.hasInfos()) {
      // Do nothing
      console.log('Async Do nothing');
    }

    else {
      this.setState({status: Status.Pending});

      const value = await this.props.promise(input.value);
      try {
        await setStatePromise(this, {status: Status.Resolved, value});
      } catch (e) {
        await setStatePromise(this, {status: Status.Rejected, value});
      }

      validations = await this.emitValidateFieldEvent(input);

      fieldFeedbacks.lastValidation.setFieldFeedbacksValidation(validations);

      /*
      validations = this.props.promise(input.value)
        .then(value => setStatePromise(this, {status: Status.Resolved, value}))
        .catch(e => setStatePromise(this, {status: Status.Rejected, value: e}))
        .then(() => this.emitValidateFieldEvent(input));

      fieldFeedbacks.validations.addFieldFeedbacksValidation(validations);
      */
    }

    return validations;
  }

  reset() {
    this.emitResetEvent();
  }

  render() {
    const { props, state } = this;
    let element = null;

    switch (state.status) {
      case Status.None:
        break;
      case Status.Pending:
        if (props.pending) element = props.pending;
        break;
      case Status.Resolved:
        if (props.then) element = props.then(state.value);
        break;
      case Status.Rejected:
        if (props.catch) element = props.catch(state.value);
        break;
    }

    return element;
  }
}
