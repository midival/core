import {
  IMIDIAccess,
  InputStateChangeCallback,
  OutputStateChangeCallback,
} from "./IMIDIAccess";
import {MockMIDIOutput} from "../outputs/MockMIDIOutput";
import { MidiDeviceProps, MockMIDIInput } from "../inputs/MockMIDIInput";
import { UnregisterCallback } from "../..";

export class MockMIDIAccess implements IMIDIAccess {
  private mockInputs: MockMIDIInput[];
  private mockOutputs: MockMIDIOutput[];

  constructor() {
    this.mockInputs = [];
    this.mockOutputs = [];
  }
  onInputConnected(callback: InputStateChangeCallback): UnregisterCallback {
    throw new Error("Method not implemented.");
  }
  onInputDisconnected(callback: InputStateChangeCallback): UnregisterCallback {
    throw new Error("Method not implemented.");
  }
  onOutputConnected(callback: OutputStateChangeCallback): UnregisterCallback {
    throw new Error("Method not implemented.");
  }
  onOutputDisconnected(callback: OutputStateChangeCallback): UnregisterCallback {
    throw new Error("Method not implemented.");
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
    return input;
  }

  addOutput(props: MidiDeviceProps): MockMIDIOutput {
    const output = new MockMIDIOutput(props);
    this.mockOutputs.push(output);
    return output;
  }
}
