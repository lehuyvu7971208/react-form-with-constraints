import { EventEmitter } from './EventEmitter';
import Constructor from './Constructor';

// See TypeScript 2.2 Support for Mix-in classes https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
export default function withResetEventEmitter<TBase extends Constructor<{}>>(Base: TBase) {
  const ResetEvent = 'RESET_EVENT';
  type Listener = () => void;

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
