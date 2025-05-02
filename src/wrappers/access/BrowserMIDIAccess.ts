import {
  IMIDIAccess,
  InputStateChangeCallback,
  OutputStateChangeCallback,
  STATUS,
} from "./IMIDIAccess";
import { IMIDIOutput } from "../outputs/IMIDIOutput";
import { BrowserMIDIOutput } from "../outputs/BrowserMIDIOutput";
import { IMIDIInput } from "../inputs/IMIDIInput";
import { BrowserMIDIInput } from "../inputs/BrowserMIDIInput";
import { Omnibus, UnregisterCallback } from "@hypersphere/omnibus";

interface EventDefinitions {
  inputConnected: [IMIDIInput];
  inputDisconnected: [IMIDIInput];
  outputConnected: [IMIDIOutput];
  outputDisconnected: [IMIDIOutput];
}

export class BrowserMIDIAccess implements IMIDIAccess {
  private access: MIDIAccess | null = null;

  private bus: Omnibus<EventDefinitions> = new Omnibus<EventDefinitions>();

  onInputConnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.bus.on("inputConnected", callback);
  }
  onInputDisconnected(callback: InputStateChangeCallback): UnregisterCallback {
    return this.bus.on("inputDisconnected", callback);
  }
  onOutputConnected(callback: OutputStateChangeCallback): UnregisterCallback {
    return this.bus.on("outputConnected", callback);
  }
  onOutputDisconnected(
    callback: OutputStateChangeCallback
  ): UnregisterCallback {
    return this.bus.on("outputDisconnected", callback);
  }

  async connect(sysex: boolean = false): Promise<void> {
    if (!navigator.requestMIDIAccess) {
      throw new Error(
        "requestMIDIAccess not available, make sure you are using MIDI-compatible browser."
      );
    }
    this.access = await navigator.requestMIDIAccess({ sysex }); // FIXME: check.
    this.listenOnStateChange();
  }

  get outputs(): IMIDIOutput[] {
    if (!this.access) {
      throw new Error("MIDI access not initialized, call connect() first");
    }
    return Array.from(this.access.outputs).map(
      ([, output]) => new BrowserMIDIOutput(output as unknown as WebMidi.MIDIOutput)
    );
  }

  get inputs(): IMIDIInput[] {
    if (!this.access) {
      throw new Error("MIDI access not initialized, call connect() first");
    }
    return Array.from(this.access.inputs).map(
      ([, input]) => new BrowserMIDIInput(input as unknown as WebMidi.MIDIInput)
    );
  }

  getInputById(inputId: string): IMIDIInput {
    if (!this.access) {
      throw new Error("MIDI access not initialized, call connect() first");
    }
    const input = Array.from(this.access.inputs)
      .map(([, input]) => input)
      .find(({ id }) => id === inputId);
    if (!input) {
      throw new Error(`Cannot find input ${inputId}`);
    }
    return new BrowserMIDIInput(input as unknown as WebMidi.MIDIInput);
  }

  getOutputById(outputId: string): IMIDIOutput {
    if (!this.access) {
      throw new Error("MIDI access not initialized, call connect() first");
    }
    const output = Array.from(this.access.outputs)
      .map(([, output]) => output)
      .find(({ id }) => id === outputId);
    if (!output) {
      throw new Error(`Cannot find output ${outputId}`);
    }
    return new BrowserMIDIOutput(output as unknown as WebMidi.MIDIOutput);
  }

  private listenOnStateChange() {
    if (!this.access) {
      throw new Error("MIDI access not initialized, call connect() first");
    }
    this.access.addEventListener(
      "statechange",
      (e: MIDIConnectionEvent) => {
        if (e.port?.type === "input") {
          switch (e.port?.state) {
            case "disconnected":
              this.bus.trigger(
                "inputDisconnected",
                new BrowserMIDIInput(e.port as unknown as WebMidi.MIDIInput)
              );
              break;
            case "connected":
              this.bus.trigger(
                "inputConnected",
                new BrowserMIDIInput(e.port as unknown as WebMidi.MIDIInput)
              );
              break;
          }
        } else {
          switch (e.port?.state) {
            case "disconnected":
              this.bus.trigger(
                "outputDisconnected",
                new BrowserMIDIOutput(e.port as unknown as WebMidi.MIDIOutput)
              );
              break;
            case "connected":
              this.bus.trigger(
                "outputConnected",
                new BrowserMIDIOutput(e.port as unknown as WebMidi.MIDIOutput)
              );
              break;
          }
        }
      }
    );
  }
}
