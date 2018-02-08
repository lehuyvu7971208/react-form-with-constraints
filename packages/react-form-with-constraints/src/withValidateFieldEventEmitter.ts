import { EventEmitter, Listener } from './EventEmitter';
import Input from './Input';
import Constructor from './Constructor';

export const ValidateFieldEvent = 'VALIDATE_FIELD_EVENT';

// See TypeScript 2.2 Support for Mix-in classes https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
export default function withValidateEventEmitter<ListenerReturnType, TBase extends Constructor<{}>>(Base: TBase) {
  return class ValidateFieldEventEmitter extends Base {
    validateFieldEventEmitter = new EventEmitter<ListenerReturnType>();

    emitValidateFieldEvent(input: Input) {
      return this.validateFieldEventEmitter.emit(ValidateFieldEvent, input);
    }

    addValidateFieldEventListener(listener: Listener<ListenerReturnType>) {
      this.validateFieldEventEmitter.addListener(ValidateFieldEvent, listener);
    }

    removeValidateFieldEventListener(listener: Listener<ListenerReturnType>) {
      this.validateFieldEventEmitter.removeListener(ValidateFieldEvent, listener);
    }
  };
}
