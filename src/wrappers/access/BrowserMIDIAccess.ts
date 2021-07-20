import { IMIDIAccess, STATUS } from "./IMIDIAccess";
import {IMIDIOutput} from "../outputs/IMIDIOutput";
import {BrowserMIDIOutput} from "../outputs/BrowserMIDIOutput";
import {IMIDIInput} from "../inputs/IMIDIInput";
import {BrowserMIDIInput} from "../inputs/BrowserMIDIInput";
import {MessageBus} from "../../MessageBus";
import {MIDIValOutput} from "../../MIDIValOutput";
import {MIDIValInput} from "../../MIDIValInput";

export class BrowserMIDIAccess implements IMIDIAccess {
  private access: WebMidi.MIDIAccess;

  private buses = {
    inputStateChange: new MessageBus("inputStateChange"),
    outputStateChange: new MessageBus("outputStateChange"),
  };

  constructor() {
    this.listenOnStateChange();
  }

  async connect(sysex: boolean = false): Promise<WebMidi.MIDIAccess> {
    if (!navigator.requestMIDIAccess) {
      throw new Error("requestMIDIAccess not available, make sure you are using MIDI-compatible browser.");
    }
    this.access = await navigator.requestMIDIAccess({ sysex }); // FIXME: check.
    return this.access;
  }

  get outputs(): IMIDIOutput[] {
    return Array.from(this.access.outputs).map(
      ([, output]) => new BrowserMIDIOutput(output)
    );
  }

  get inputs(): IMIDIInput[] {
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
          this.buses.inputStateChange.trigger(
            new MIDIValInput(this.getInputById(e.port.id))
          );
        } else {
          this.buses.outputStateChange.trigger(
            new MIDIValOutput(this.getOutputById(e.port.id))
          );
        }
      }
    );
  }

  onInputStateChange(callback) {
    this.buses.inputStateChange.on(callback);
  }

  onOutputStateChange(callback) {
    this.buses.outputStateChange.on(callback);
  }
}
