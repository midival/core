import {
  IMIDIInput,
  OnMessageCallback,
  UnregisterCallback,
} from "./IMIDIInput";

export class MockMIDIInput implements IMIDIInput {
  private _name: string;
  private _id: string;
  private _callback: OnMessageCallback;

  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
  }

  onMessage(callback: OnMessageCallback): Promise<UnregisterCallback> {
    this._callback = callback;
    return Promise.resolve(() => {
      this._callback = null;
    });
  }

  sendMessage(data: Uint8Array) {
    if (this._callback) {
      this._callback({
        receivedTime: Date.now(),
        data,
      });
    }
  }

  get name(): string {
    return this._name;
  }

  get id(): string {
    return this._id;
  }
}
