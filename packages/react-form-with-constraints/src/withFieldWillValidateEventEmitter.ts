import { EventEmitter } from './EventEmitter';
import Constructor from './Constructor';

// See TypeScript 2.2 Support for Mix-in classes https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
export default function withFieldWillValidateEventEmitter<TBase extends Constructor<{}>>(Base: TBase) {
  const FieldWillValidateEvent = 'FIELD_WILL_VALIDATE_EVENT';
  type Listener = (fieldName: string) => void;

  return class FieldWillValidateEventEmitter extends Base {
    fieldWillValidateEventEmitter = new EventEmitter();

    emitFieldWillValidateEvent(fieldName: string) {
      return this.fieldWillValidateEventEmitter.emit(FieldWillValidateEvent, fieldName);
    }

    addFieldWillValidateEventListener(listener: Listener) {
      this.fieldWillValidateEventEmitter.addListener(FieldWillValidateEvent, listener);
    }

    removeFieldWillValidateEventListener(listener: Listener) {
      this.fieldWillValidateEventEmitter.removeListener(FieldWillValidateEvent, listener);
    }
  };
}
