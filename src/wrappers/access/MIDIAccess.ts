import {
  IMIDIAccess,
  OutputStateChangeCallback,
  InputStateChangeCallback,
} from "./IMIDIAccess";
import {BrowserMIDIAccess} from "./BrowserMIDIAccess";
import {IMIDIOutput} from "../outputs/IMIDIOutput";
import {IMIDIInput} from "../inputs/IMIDIInput";
import { UnregisterCallback } from "../../MessageBus";

export class MIDIAccess implements IMIDIAccess {
  private access: IMIDIAccess;
  constructor(constructor: new () => IMIDIAccess = null) {
    if (!constructor) {
      this.access = new BrowserMIDIAccess();
    } else {
      this.access = new constructor();
    }
  }

  onInputConnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.access.onInputConnected(callback);
  }
  onInputDisconnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.access.onInputDisconnected(callback);
  }
  onOutputConnected(callback: OutputStateChangeCallback): UnregisterCallback {
    return this.access.onOutputConnected(callback);
  }
  onOutputDisconnected(callback: OutputStateChangeCallback): UnregisterCallback {
    return this.access.onOutputDisconnected(callback);
  }

  static async connect(): Promise<MIDIAccess> {
    const access = new MIDIAccess();
    await access.connect();
    return access;
  }

  connect(): Promise<void> {
    return this.access.connect();
  }

  get outputs(): IMIDIOutput[] {
    return this.access.outputs;
  }

  get inputs(): IMIDIInput[] {
    return this.access.inputs;
  }
}
