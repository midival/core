import { CallbackType, Omnibus } from "@hypersphere/omnibus";
import { IMIDIInput } from "../../wrappers/inputs/IMIDIInput";
import { MIDIValInput } from "../../MIDIValInput";
import { MPEInputZone } from "./MPEInputZone";

interface EventDefinitions {
  lowerZoneUpdate: [MPEInputZone];
  upperZoneUpdate: [MPEInputZone];
}

export interface MPEInputConfig {
  lowerZoneSize?: number;
  upperZoneSize?: number;
}

/**
 * Defines MIDIVal MPE Input connection
 */
export class MPEMidivalInput {
  private eventBus: Omnibus<EventDefinitions> = new Omnibus();

  #lowerZone: MPEInputZone;
  #upperZone: MPEInputZone;

  constructor(private readonly input: MIDIValInput, mpeDefaultZones?: MPEInputConfig) {
    input.onMpeConfiguration(({ channel, msb }) => {
      if (channel === 1) {
        this.instantiateLowerZone(msb)
      }
      if (channel === 16) {
        this.instantiateUpperZone(msb)
      }
    });

    if (mpeDefaultZones?.lowerZoneSize) {
      this.instantiateLowerZone(mpeDefaultZones.lowerZoneSize)
    }
    
    if (mpeDefaultZones?.upperZoneSize) {
      this.instantiateUpperZone(mpeDefaultZones.upperZoneSize)
    }

  }

  private instantiateLowerZone(size: number) {
    if (!size) {
      this.#lowerZone = null;
    } else {
      this.#lowerZone = new MPEInputZone(1, [2, 1 + size], this.input);
    }
    this.eventBus.trigger("lowerZoneUpdate", this.#lowerZone);
  }

  private instantiateUpperZone(size: number) {
    if (!size) {
      this.#upperZone = null;
    } else {
      this.#upperZone = new MPEInputZone(16, [15 - size, 15], this.input);
    }
    this.eventBus.trigger("upperZoneUpdate", this.#upperZone);
  }

  get isMpeEnabled() {
    return this.#lowerZone !== null || this.#upperZone !== null;
  }

  get lowerZone() {
    return this.#lowerZone;
  }

  get upperZone() {
    return this.#upperZone;
  }

  onLowerZoneUpdate(cb: CallbackType<EventDefinitions["lowerZoneUpdate"]>) {
    const callback = this.eventBus.on("lowerZoneUpdate", cb);
    if (this.lowerZone) {
      this.eventBus.trigger('lowerZoneUpdate', this.lowerZone)
    }
    return callback
  }

  onUpperZoneUpdate(cb: CallbackType<EventDefinitions["upperZoneUpdate"]>) {
    const callback = this.eventBus.on("upperZoneUpdate", cb);
    if (this.upperZone) {
      this.eventBus.trigger('upperZoneUpdate', this.upperZone)
    }
    return callback
  }
}
