import { EventEmitter } from './EventEmitter';
import Constructor from './Constructor';
import { FieldValidation } from './FieldValidation';

export const FieldValidatedEvent = 'FIELDS_VALIDATED_EVENT';

// See TypeScript 2.2 Support for Mix-in classes https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
export default function withFieldValidatedEventEmitter<TBase extends Constructor<{}>>(Base: TBase) {
  type Listener = (fieldName: string, field: Promise<FieldValidation>) => void;

  return class FieldValidatedEventEmitter extends Base {
    fieldValidatedEventEmitter = new EventEmitter();

    emitFieldValidatedEvent(fieldName: string, field: Promise<FieldValidation>) {
      return this.fieldValidatedEventEmitter.emit(FieldValidatedEvent, fieldName, field);
    }

    addFieldValidatedEventListener(listener: Listener) {
      this.fieldValidatedEventEmitter.addListener(FieldValidatedEvent, listener);
    }

    removeFieldValidatedEventListener(listener: Listener) {
      this.fieldValidatedEventEmitter.removeListener(FieldValidatedEvent, listener);
    }
  };
}
