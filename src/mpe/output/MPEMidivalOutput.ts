import { MIDIValOutput } from "../../MIDIValOutput";
import { IMIDIOutput } from "../../wrappers/outputs/IMIDIOutput";
import { MPEOutputZone } from "./MPEOutputZone";

export interface MPEOutputConfig {
  lowerZoneSize?: number;
  upperZoneSize?: number;
}

export class MPEMidivalOutput {
  private midivalOutput: MIDIValOutput;

  #lowerZone: MPEOutputZone = null;
  #upperZone: MPEOutputZone = null;

  get lowerZone() {
    return this.#lowerZone;
  }

  get upperZone() {
    return this.#upperZone;
  }

  constructor(output: IMIDIOutput, private readonly options: MPEOutputConfig) {
    this.midivalOutput = new MIDIValOutput(output);
    this.midivalOutput.initializeMPE(
      this.options.lowerZoneSize || 0,
      this.options.upperZoneSize || 0,
      10
    );

    if (this.options.lowerZoneSize) {
      this.#lowerZone = new MPEOutputZone(
        1,
        [2, 2 + this.options.lowerZoneSize],
        this.midivalOutput
      );
    }

    if (this.options.upperZoneSize) {
      this.#upperZone = new MPEOutputZone(
        16,
        [15 - this.options.upperZoneSize, 15],
        this.midivalOutput
      );
    }
  }

  disconnect() {
    this.midivalOutput.initializeMPE(0, 0);
    this.#lowerZone = null;
    this.#upperZone = null;
  }
}
