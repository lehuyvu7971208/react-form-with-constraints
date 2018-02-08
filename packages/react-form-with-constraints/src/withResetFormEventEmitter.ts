import { EventEmitter, Listener } from './EventEmitter';
import Constructor from './Constructor';

export const ResetFormEvent = 'RESET_FORM_EVENT';

// See TypeScript 2.2 Support for Mix-in classes https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
export default function withResetEventEmitter<TBase extends Constructor<{}>>(Base: TBase) {
  return class ResetFormEventEmitter extends Base {
    resetEventEmitter = new EventEmitter();

    emitResetFormEvent() {
      return this.resetEventEmitter.emit(ResetFormEvent);
    }

    addResetFormEventListener(listener: Listener) {
      this.resetEventEmitter.addListener(ResetFormEvent, listener);
    }

    removeResetFormEventListener(listener: Listener) {
      this.resetEventEmitter.removeListener(ResetFormEvent, listener);
    }
  };
}
