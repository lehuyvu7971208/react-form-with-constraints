import { EventEmitter } from './EventEmitter';
import Constructor from './Constructor';
import Field from './Field';

// See TypeScript 2.2 Support for Mix-in classes https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
export default function withFieldDidValidateEventEmitter<TBase extends Constructor<{}>>(Base: TBase) {
  const FieldDidValidateEvent = 'FIELD_DID_VALIDATE_EVENT';
  type Listener = (fieldName: string, field: Field) => void;

  return class FieldDidValidateEventEmitter extends Base {
    fieldDidValidateEventEmitter = new EventEmitter();

    emitFieldDidValidateEvent(fieldName: string, field: Field) {
      return this.fieldDidValidateEventEmitter.emit(FieldDidValidateEvent, fieldName, field);
    }

    addFieldDidValidateEventListener(listener: Listener) {
      this.fieldDidValidateEventEmitter.addListener(FieldDidValidateEvent, listener);
    }

    removeFieldDidValidateEventListener(listener: Listener) {
      this.fieldDidValidateEventEmitter.removeListener(FieldDidValidateEvent, listener);
    }
  };
}
