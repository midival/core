import { CallbackType, Omnibus, args } from "@hypersphere/omnibus";
import { MIDIValInput } from "../../MIDIValInput";
import { MPEInputZone } from "./MPEInputZone";
import { OmnibusParams } from "../../types/omnibus";

export interface MPEInputConfig {
  lowerZoneSize?: number;
  upperZoneSize?: number;
}

/**
 * Defines MIDIVal MPE Input connection
 */
export class MPEMidivalInput {
  private eventBus = this.buildBus()

  #lowerZone: MPEInputZone;
  #upperZone: MPEInputZone;

  private buildBus() {
    return Omnibus.builder()
    .register('lowerZoneUpdate', args<MPEInputZone>())
    .register('upperZoneUpdate', args<MPEInputZone>())
    .build()
  }

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

  onLowerZoneUpdate(cb: CallbackType<OmnibusParams<typeof this.eventBus, 'lowerZoneUpdate'>>) {
    const callback = this.eventBus.on("lowerZoneUpdate", cb);
    if (this.lowerZone) {
      this.eventBus.trigger('lowerZoneUpdate', this.lowerZone)
    }
    return callback
  }

  onUpperZoneUpdate(cb: CallbackType<OmnibusParams<typeof this.eventBus, 'upperZoneUpdate'>>) {
    const callback = this.eventBus.on("upperZoneUpdate", cb);
    if (this.upperZone) {
      this.eventBus.trigger('upperZoneUpdate', this.upperZone)
    }
    return callback
  }
}
