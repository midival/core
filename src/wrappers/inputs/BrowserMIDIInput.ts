import { UnregisterCallback } from "@hypersphere/omnibus";
import { IMIDIInput, MIDIMessage, OnMessageCallback } from "./IMIDIInput";

export type MidiMessageCallback = (e: WebMidi.MIDIMessageEvent) => void;

export class BrowserMIDIInput implements IMIDIInput {
  private input: WebMidi.MIDIInput;
  constructor(input: WebMidi.MIDIInput) {
    this.input = input;
  }

  async onMessage(callback: OnMessageCallback): Promise<UnregisterCallback> {
    await this.input.open();
    const wrappedCallback: MidiMessageCallback = (e: WebMidi.MIDIMessageEvent) => {
      callback({
        data: e.data,
        receivedTime: e.timeStamp
      });
    };
    this.input.addEventListener("midimessage", wrappedCallback);
    return () => {
      this.input.removeEventListener("midimessage", wrappedCallback);
    };
  }

  get id(): string {
    return this.input.id;
  }

  get name(): string {
    return this.input.name || "";
  }

  get manufacturer(): string {
    return this.input.manufacturer || "";
  }
}
