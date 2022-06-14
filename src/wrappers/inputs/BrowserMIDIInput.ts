import { UnregisterCallback } from "@hypersphere/omnibus";
import { IMIDIInput } from "./IMIDIInput";

export type MidiMessageCallback = (e: WebMidi.MIDIMessageEvent) => void;

export class BrowserMIDIInput implements IMIDIInput {
  private input: WebMidi.MIDIInput;
  constructor(input: WebMidi.MIDIInput) {
    this.input = input;
  }

  async onMessage(fn: MidiMessageCallback): Promise<UnregisterCallback> {
    await this.input.open();
    this.input.addEventListener("midimessage", fn);
    return () => {
      this.input.removeEventListener("midimessage", fn);
    };
  }

  get id(): string {
    return this.input.id;
  }

  get name(): string {
    return this.input.name;
  }

  get manufacturer(): string {
    return this.input.manufacturer;
  }
}
