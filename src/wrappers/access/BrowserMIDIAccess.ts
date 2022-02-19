import { IMIDIAccess, InputStateChangeCallback, OutputStateChangeCallback, STATUS } from "./IMIDIAccess";
import {IMIDIOutput} from "../outputs/IMIDIOutput";
import {BrowserMIDIOutput} from "../outputs/BrowserMIDIOutput";
import {IMIDIInput} from "../inputs/IMIDIInput";
import {BrowserMIDIInput} from "../inputs/BrowserMIDIInput";
import { Omnibus, UnregisterCallback } from "@hypersphere/omnibus";

interface EventDefinitions {
  inputConnected: [IMIDIInput],
  inputDisconnected: [IMIDIInput],
  outputConnected: [IMIDIOutput]
  outputDisconnected: [IMIDIOutput]
};

export class BrowserMIDIAccess implements IMIDIAccess {
  private access: WebMidi.MIDIAccess;

  private omnibus: Omnibus<EventDefinitions>;

  constructor() {
    this.omnibus = new Omnibus();
    this.listenOnStateChange();
  }
  onInputConnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.omnibus.on('inputConnected', callback);
  }
  onInputDisconnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.omnibus.on('inputDisconnected', callback);
  }
  onOutputConnected(callback: OutputStateChangeCallback): UnregisterCallback {
    return this.omnibus.on('outputConnected', callback);
  }
  onOutputDisconnected(callback: OutputStateChangeCallback): UnregisterCallback {
    return this.omnibus.on('outputDisconnected', callback);
  }

  async connect(sysex: boolean = false): Promise<void> {
    if (!navigator.requestMIDIAccess) {
      throw new Error("requestMIDIAccess not available, make sure you are using MIDI-compatible browser.");
    }
    this.access = await navigator.requestMIDIAccess({ sysex }); // FIXME: check.
  }

  get outputs(): IMIDIOutput[] {
    // FIXME: guard to be called after succesful connect.
    return Array.from(this.access.outputs).map(
      ([, output]) => new BrowserMIDIOutput(output)
    );
  }

  get inputs(): IMIDIInput[] {
    // FIXME: guard to be called after succesful connect.
    return Array.from(this.access.inputs).map(
      ([, input]) => new BrowserMIDIInput(input)
    );
  }

  getInputById(inputId: string): IMIDIInput {
    const input = Array.from(this.access.inputs)
      .map(([, input]) => input)
      .find(({ id }) => id === inputId);
    if (!input) {
      throw new Error(`Cannot find input ${inputId}`);
    }
    return new BrowserMIDIInput(input);
  }

  getOutputById(outputId: string): IMIDIOutput {
    const output = Array.from(this.access.outputs)
      .map(([, output]) => output)
      .find(({ id }) => id === outputId);
    if (!output) {
      throw new Error(`Cannot find output ${outputId}`);
    }
    return new BrowserMIDIOutput(output);
  }

  private async listenOnStateChange() {
    await this.connect();
    this.access.addEventListener(
      "statechange",
      (e: WebMidi.MIDIConnectionEvent) => {
        if (e.port.type === "input") {
          const input = this.getInputById(e.port.id);
          switch (e.port.connection) {
            case "closed":
              this.omnibus.trigger('inputDisconnected', input);
              break;
            case "open":
              this.omnibus.trigger('inputConnected', input);
            case "pending":
              console.log("Input pending.");
              break;
          }
        } else {
          const output = this.getOutputById(e.port.id);
          switch (e.port.connection) {
            case "closed":
              this.omnibus.trigger('outputDisconnected', output);
              break;
            case "open":
              this.omnibus.trigger('outputConnected', output);
            case "pending":
              console.log("Output pending");
              break;
          }
        }
      }
    );
  }
}
