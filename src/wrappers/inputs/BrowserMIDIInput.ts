import { IMIDIInput, MIDIMessage, UnregisterCallback } from "./IMIDIInput";

export type MidiMessageCallback = (e: WebMidi.MIDIMessageEvent) => void;

export class BrowserMIDIInput implements IMIDIInput {
  private input: WebMidi.MIDIInput;
  constructor(input: WebMidi.MIDIInput) {
    this.input = input;
  }

  async onMessage(fn: MidiMessageCallback): Promise<UnregisterCallback> {
    await this.input.open();

    const f = (e: WebMidi.MIDIMessageEvent) => fn(e);

    this.input.addEventListener("midimessage", f);

    return () => {
      this.input.removeEventListener("midimessage", f);
    };
  }

  get id(): string {
    return this.input.id;
  }

  get name(): string {
    return this.input.name;
  }
}
