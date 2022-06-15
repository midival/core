import { IMIDIOutput } from "./IMIDIOutput";

export class BrowserMIDIOutput implements IMIDIOutput {
  private output: WebMidi.MIDIOutput;
  constructor(output: WebMidi.MIDIOutput) {
    this.output = output;
  }

  send(data: Uint8Array | number[]): void {
    this.output.send(data);
  }

  get id(): string {
    return this.output.id;
  }

  get name(): string {
    return this.output.name;
  }

  get manufacturer(): string {
    return this.output.manufacturer;
  }
}
