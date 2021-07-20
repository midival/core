import {
  MessageBus,
  Callback,
  IMessageBus,
  UnregisterCallback,
} from "./MessageBus";

export class MultiMessageBus<Key, Args extends any[]> {
  private name: string;
  private buses: Map<string, IMessageBus<Args>>;
  private allBus: IMessageBus<[Key, ...Args]>;
  constructor(name) {
    this.name = name;
    this.buses = new Map();
    this.allBus = new MessageBus(this.name + "::all");
  }

  onAll(callback: Callback<[Key, ...Args]>): UnregisterCallback {
    return this.allBus.on(callback);
  }

  on(key: Key, callback: Callback<Args>): UnregisterCallback {
    // FIXME: when the key is not set, we set the callback to "_all" Symbol
    if (!this.buses.has(key.toString())) {
      this.buses.set(key.toString(), new MessageBus(this.name + "::" + key.toString()));
    }
    return this.buses.get(key.toString()).on(callback);
  }

  off(key: string, callback: Callback<Args>): void {
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

  trigger(key: Key, ...args: Args): void {
    this._triggerAll(key, ...args);
    if (!this.buses.has(key.toString())) {
      return;
    }
    this.buses.get(key.toString()).trigger(...args);
  }

  _triggerAll(...args: [Key, ...Args]) {
    this.allBus.trigger(...args);
  }
}
