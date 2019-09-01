import IMIDIOutput from "./IMIDIOutput";
import { OnMessageCallback } from "../inputs/IMIDIInput";

export default class MockMIDIOutput implements IMIDIOutput {
  _id: string;
  _name: string;
  _callback: OnMessageCallback;

  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
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
