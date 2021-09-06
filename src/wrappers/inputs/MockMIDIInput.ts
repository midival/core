import {
  IMIDIInput,
  OnMessageCallback,
  UnregisterCallback,
} from "./IMIDIInput";

export interface MidiDeviceProps {
  id: string;
  name: string;
  manufacturer: string;
}

export class MockMIDIInput implements IMIDIInput {
  private _name: string;
  private _id: string;
  private _manufacturer: string;
  private _callback: OnMessageCallback;

  constructor({ id, name, manufacturer }: MidiDeviceProps) {
    this._id = id;
    this._name = name;
    this._manufacturer = manufacturer;
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
  get manufacturer(): string {
    return this._manufacturer;
  }
}
