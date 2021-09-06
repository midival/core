import {IMIDIOutput} from "./IMIDIOutput";
import { OnMessageCallback } from "../inputs/IMIDIInput";
import { MidiDeviceProps } from "../inputs/MockMIDIInput";

export class MockMIDIOutput implements IMIDIOutput {
  _id: string;
  _name: string;
  _manufacturer: string;
  _callback: OnMessageCallback;

  constructor({ id, name, manufacturer }: MidiDeviceProps) {
    this._id = id;
    this._name = name;
    this._manufacturer = manufacturer;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get manufacturer(): string {
    return this._manufacturer;
  }

  onMessage(callback: OnMessageCallback) {
    this._callback = callback;
  }

  send(data: Uint8Array) {
    if (this._callback) {
      this._callback({
        data,
        receivedTime: Date.now(),
      });
    }
  }
}
