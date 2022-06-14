import {
  IMIDIAccess,
  InputStateChangeCallback,
  OutputStateChangeCallback,
} from "./IMIDIAccess";
import {MockMIDIOutput} from "../outputs/MockMIDIOutput";
import { MidiDeviceProps, MockMIDIInput } from "../inputs/MockMIDIInput";
import { UnregisterCallback } from "../..";
import { Omnibus } from "@hypersphere/omnibus";

export class MockMIDIAccess implements IMIDIAccess {
  private mockInputs: MockMIDIInput[];
  private mockOutputs: MockMIDIOutput[];
  private bus: Omnibus = new Omnibus();

  constructor() {
    this.mockInputs = [];
    this.mockOutputs = [];
  }
  onInputConnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.bus.on("input_connected", callback);
  }
  onInputDisconnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.bus.on("input_disconnected", callback);
  }
  onOutputConnected(callback: OutputStateChangeCallback): UnregisterCallback {
    return this.bus.on("output_connected", callback);
  }
  onOutputDisconnected(callback: OutputStateChangeCallback): UnregisterCallback {
    return this.bus.on("output_disconnected", callback);
  }

  async connect(): Promise<void> {
    await Promise.resolve();
  }

  get inputs(): MockMIDIInput[] {
    return this.mockInputs;
  }

  get outputs(): MockMIDIOutput[] {
    return this.mockOutputs;
  }

  addInput(props: MidiDeviceProps): MockMIDIInput {
    const input = new MockMIDIInput(props);
    this.mockInputs.push(input);
    this.bus.trigger("input_connected", input);
    return input;
  }

  addOutput(props: MidiDeviceProps): MockMIDIOutput {
    const output = new MockMIDIOutput(props);
    this.mockOutputs.push(output);
    this.bus.trigger("output_connected", output);
    return output;
  }
}
