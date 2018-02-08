import { EventEmitter, Listener } from './EventEmitter';
import Input from './Input';
import Constructor from './Constructor';
import FieldFeedbacksValidation from './FieldFeedbacksValidation';

export const FieldValidatedEvent = 'FIELD_VALIDATED_EVENT';

// See TypeScript 2.2 Support for Mix-in classes https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
export default function withFieldValidatedEventEmitter<TBase extends Constructor<{}>>(Base: TBase) {
  return class FieldValidatedEventEmitter extends Base {
    fieldValidatedEventEmitter = new EventEmitter();

    emitFieldValidatedEvent(input: Input, fieldValidationsPromise: Promise<FieldFeedbacksValidation>) {
      return this.fieldValidatedEventEmitter.emit(FieldValidatedEvent, input, fieldValidationsPromise);
    }

    addFieldValidatedEventListener(listener: Listener) {
      this.fieldValidatedEventEmitter.addListener(FieldValidatedEvent, listener);
    }

    removeFieldValidatedEventListener(listener: Listener) {
      this.fieldValidatedEventEmitter.removeListener(FieldValidatedEvent, listener);
    }
  };
}
