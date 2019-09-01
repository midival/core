export type Callback = (...args: any[]) => void;
export type UnregisterCallback = () => void;

export interface IMessageBus {
  on(callback: Callback): UnregisterCallback;
  off(callback: Callback): void;
  offAll(): void;
  trigger(...args: any): void;
}

export default class MessageBus implements IMessageBus {
  private bus: Callback[];
  private name: string;

  constructor(name: string) {
    this.bus = [];
    this.name = name;
  }

  on(callback: Callback): UnregisterCallback {
    this.bus.push(callback);
    return () => this.off(callback);
  }

  off(callback: Callback): void {
    this.bus = this.bus.filter((c) => c !== callback);
  }

  offAll(): void {
    this.bus = [];
  }

  trigger(...args: any[]) {
    this.bus.forEach((c: Callback) => c(...args));
  }
}
