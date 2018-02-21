import { EventEmitter, Listener } from './EventEmitter';
import Constructor from './Constructor';

export const ResetEvent = 'RESET_EVENT';

// See TypeScript 2.2 Support for Mix-in classes https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
export default function withResetEventEmitter<TBase extends Constructor<{}>>(Base: TBase) {
  return class ResetEvenEmitter extends Base {
    resetEventEmitter = new EventEmitter();

    emitResetEvent() {
      return this.resetEventEmitter.emit(ResetEvent);
    }

    addResetEventListener(listener: Listener) {
      this.resetEventEmitter.addListener(ResetEvent, listener);
    }

    removeResetEventListener(listener: Listener) {
      this.resetEventEmitter.removeListener(ResetEvent, listener);
    }
  };
}
