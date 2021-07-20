/**
 * Generic callback type
 */
export type Callback<Args extends any[]> = (...args: Args) => void;

/**
 * Unregister method causing callback to no longer respond to the events it was connected to.
 */
export type UnregisterCallback = () => void;

export interface IMessageBus<T extends any[]> {
  
  /**
   * Registers new callback on the message bus
   */
  on(callback: Callback<T>): UnregisterCallback;

  /**
   * Unregisters callback from the message bus
   * @param callback 
   */
  off(callback: Callback<T>): void;

  /**
   * Unregisters all callbacks from the message bus
   */
  offAll(): void;

  /**
   * Triggers an event and calls all the callbacks that are registered on the bus.
   * @param args Arguments to be passed to the message bus.
   */
  trigger(...args: T): void;
}

export class MessageBus<T extends any[]> implements IMessageBus<T> {
  private bus: Callback<T>[];
  private name: string;

  constructor(name: string) {
    this.bus = [];
    this.name = name;
  }

  on(callback: Callback<T>): UnregisterCallback {
    this.bus.push(callback);
    return () => this.off(callback);
  }

  off(callback: Callback<T>): void {
    this.bus = this.bus.filter((c) => c !== callback);
  }

  offAll(): void {
    this.bus = [];
  }

  trigger(...args: T) {
    this.bus.forEach((c: Callback<T>) => c(...args));
  }
}
