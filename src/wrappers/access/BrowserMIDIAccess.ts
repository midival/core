import { IMIDIAccess, InputStateChangeCallback, OutputStateChangeCallback, STATUS } from "./IMIDIAccess";
import {IMIDIOutput} from "../outputs/IMIDIOutput";
import {BrowserMIDIOutput} from "../outputs/BrowserMIDIOutput";
import {IMIDIInput} from "../inputs/IMIDIInput";
import {BrowserMIDIInput} from "../inputs/BrowserMIDIInput";
import {MessageBus, UnregisterCallback} from "../../MessageBus";
import {MIDIValOutput} from "../../MIDIValOutput";
import {MIDIValInput} from "../../MIDIValInput";

interface Buses {
  inputConnected: MessageBus<[IMIDIInput]>,
  inputDisconnected: MessageBus<[IMIDIInput]>,
  outputConnected: MessageBus<[IMIDIOutput]>
  outputDisconnected: MessageBus<[IMIDIOutput]>
};

export class BrowserMIDIAccess implements IMIDIAccess {
  private access: WebMidi.MIDIAccess;

  private buses: Buses = {
    inputConnected: new MessageBus<[IMIDIInput]>("inputStateChange"),
    inputDisconnected: new MessageBus<[IMIDIInput]>("inputStateChange"),
    outputConnected: new MessageBus<[IMIDIOutput]>("outputStateChange"),
    outputDisconnected: new MessageBus<[IMIDIOutput]>("outputStateChange"),
  };

  constructor() {
    this.listenOnStateChange();
  }
  onInputConnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.buses.inputConnected.on(callback);
  }
  onInputDisconnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.buses.inputDisconnected.on(callback);
  }
  onOutputConnected(callback: OutputStateChangeCallback): UnregisterCallback {
    return this.buses.outputConnected.on(callback);
  }
  onOutputDisconnected(callback: OutputStateChangeCallback): UnregisterCallback {
    return this.buses.outputDisconnected.on(callback);
  }

  async connect(sysex: boolean = false): Promise<WebMidi.MIDIAccess> {
    if (!navigator.requestMIDIAccess) {
      throw new Error("requestMIDIAccess not available, make sure you are using MIDI-compatible browser.");
    }
    this.access = await navigator.requestMIDIAccess({ sysex }); // FIXME: check.
    return this.access;
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
              this.buses.inputDisconnected.trigger(input);
              break;
            case "open":
              this.buses.inputConnected.trigger(input);
            case "pending":
              console.log("Input pending.");
              break;
          }
        } else {
          const output = this.getOutputById(e.port.id);
          switch (e.port.connection) {
            case "closed":
              this.buses.outputDisconnected.trigger(output);
              break;
            case "open":
              this.buses.outputConnected.trigger(output);
            case "pending":
              console.log("Output pending");
              break;
          }
        }
      }
    );
  }
}
