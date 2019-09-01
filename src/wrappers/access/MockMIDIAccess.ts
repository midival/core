import IMIDIAccess, {
  InputStateChangeCallback,
  OutputStateChangeCallback,
} from "./IMIDIAccess";
import MockMIDIOutput from "../outputs/MockMIDIOutput";
import MockMIDIInput from "../inputs/MockMIDIInput";

export default class MockMIDIAccess implements IMIDIAccess {
  private mockInputs: MockMIDIInput[];
  private mockOutputs: MockMIDIOutput[];

  constructor() {
    this.mockInputs = [];
    this.mockOutputs = [];
  }

  async connect(): Promise<WebMidi.MIDIAccess> {
    await Promise.resolve();
    return {} as WebMidi.MIDIAccess;
  }

  get inputs(): MockMIDIInput[] {
    return this.mockInputs;
  }

  get outputs(): MockMIDIOutput[] {
    return this.mockOutputs;
  }

  addInput(id: string, name: string): MockMIDIInput {
    const input = new MockMIDIInput(id, name);
    this.mockInputs.push(input);
    return input;
  }

  addOutput(id: string, name: string): MockMIDIOutput {
    const output = new MockMIDIOutput(id, name);
    this.mockOutputs.push(output);
    return output;
  }

  onInputStateChange(callback: InputStateChangeCallback): void {
    throw new Error("Method not implemented.");
  }

  onOutputStateChange(callback: OutputStateChangeCallback): void {
    throw new Error("Method not implemented.");
  }
}
