import MessageBus, {
  Callback,
  IMessageBus,
  UnregisterCallback,
} from "./MessageBus";

// write an article about this.

const ALL = "_ALL";

export default class MultiMessageBus {
  private name: string;
  private buses: Map<string, IMessageBus>;
  constructor(name) {
    this.name = name;
    this.buses = new Map();
  }

  onAll(callback: Callback): UnregisterCallback {
    // assuming there is a polymorphism in TypeScript
    if (!this.buses.has(ALL)) {
      this.buses.set(ALL, new MessageBus(name));
    }
    return this.buses.get(ALL).on(callback);
  }

  on(key: string, callback: Callback): UnregisterCallback {
    // FIXME: when the key is not set, we set the callback to "_all" Symbol
    if (!this.buses.has(key)) {
      this.buses.set(key, new MessageBus(name + "::" + key));
    }
    return this.buses.get(key).on(callback);
  }

  off(key: string, callback: Callback): void {
    if (!this.buses.has(key)) {
      return;
    }
    return this.buses.get(key).off(callback);
  }

  offAll(): void {
    for (let [_, bus] of this.buses) {
      bus.offAll();
    }
  }

  trigger(key: string, ...args: any[]): void {
    this._triggerAll(key, ...args);
    if (!this.buses.has(key)) {
      // console.log("No triggers for", key, ...args);
      return;
    }
    this.buses.get(key).trigger(...args);
  }

  _triggerAll(...args: any[]) {
    if (!this.buses.has(ALL)) {
      return;
    }
    this.buses.get(ALL).trigger(...args);
  }
  // is there a polymorphism in TypeScript? If so, we can do the second, single-argument implementation here.
}
