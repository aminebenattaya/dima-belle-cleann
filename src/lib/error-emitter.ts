// src/lib/error-emitter.ts
import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

// This is a simple event emitter to decouple error throwing from error handling.
// Components can throw permission errors without knowing how they will be displayed.
// A central listener (e.g., in a layout or provider) can subscribe to these
// errors and display them to the user (e.g., in a toast or modal).

type AppEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class TypedEventEmitter {
  private emitter = new EventEmitter();

  emit<E extends keyof AppEvents>(event: E, ...args: Parameters<AppEvents[E]>) {
    this.emitter.emit(event, ...args);
  }

  on<E extends keyof AppEvents>(event: E, listener: AppEvents[E]) {
    this.emitter.on(event, listener);
  }

  off<E extends keyof AppEvents>(event: E, listener: AppEvents[E]) {
    this.emitter.off(event, listener);
  }
}

export const errorEmitter = new TypedEventEmitter();
