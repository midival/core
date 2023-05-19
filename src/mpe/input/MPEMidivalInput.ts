import { CallbackType, Omnibus } from "@hypersphere/omnibus";
import { IMIDIInput } from "../../wrappers/inputs/IMIDIInput";
import { MIDIValInput } from "../../MIDIValInput";
import { MPEInputZone } from "./MPEInputZone";

interface EventDefinitions {
  lowerZoneUpdate: [MPEInputZone];
  upperZoneUpdate: [MPEInputZone];
}

/**
 * Defines MIDIVal MPE Input connection
 */
export class MPEMidivalInput {
  private eventBus: Omnibus<EventDefinitions> = new Omnibus();

  #lowerZone: MPEInputZone;
  #upperZone: MPEInputZone;

  constructor(input: MIDIValInput) {
    input.onMpeConfiguration(({ channel, msb }) => {
      if (channel === 1) {
        if (!msb) {
          this.#lowerZone = null;
        } else {
          this.#lowerZone = new MPEInputZone(channel, [2, 1 + msb], input);
        }
        this.eventBus.trigger("lowerZoneUpdate", this.#lowerZone);
      }
      if (channel === 16) {
        // Updating upper zone
        if (!msb) {
          this.#upperZone = null;
        } else {
          this.#upperZone = new MPEInputZone(channel, [15 - msb, 15], input);
        }
        this.eventBus.trigger("upperZoneUpdate", this.#upperZone);
      }
    });
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
    return this.eventBus.on("lowerZoneUpdate", cb);
  }

  onUpperZoneUpdate(cb: CallbackType<EventDefinitions["upperZoneUpdate"]>) {
    return this.eventBus.on("upperZoneUpdate", cb);
  }
}
