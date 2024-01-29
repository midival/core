import { Omnibus, args } from "@hypersphere/omnibus";
import { Callback, MIDIValInput, MidiMessage, NoteMessage } from "../..";
import { PitchBendMessage } from "../../MIDIValInput";
import { OmnibusParams } from "../../types/omnibus";

export interface MemberPitchBendMessage {
  masterPitchBend: number;
  memberPitchBend: number;
  channel: number;
}

export interface ChannelValueMessage {
  channel: number;
  value: number;
}

export interface MemberPressureMessage {
  channel: number;
  masterPressure: number;
  memberPressure: number;
}

export interface MemberTimbreMessage {
  channel: number;
  masterTimbre: number;
  memberTimbre: number;
}

export class MPEInputZone {
  private eventBus = this.buildBus()

  #pitchBend: number = 0;
  #timbre: number = 0;
  #pressure: number = 0;

  constructor(
    public masterChannel: number,
    public readonly memberChannelRange: [number, number],
    private input: MIDIValInput
  ) {
    this.bindEvents();
  }


  private buildBus() {
    return Omnibus.builder()
      .register('noteOn', args<NoteMessage>())
      .register('noteOff', args<NoteMessage>())
      .register('masterPitchBend', args<PitchBendMessage>())
      .register('memberPitchBend', args<MemberPitchBendMessage>())
      .register('masterTimbre', args<ChannelValueMessage>())
      .register('memberTimbre', args<MemberTimbreMessage>())
      .register('masterPressure', args<ChannelValueMessage>())
      .register('memberPressure', args<MemberPressureMessage>())
      .build()

  }

  private bindEvents() {
    const [minCh, maxCh] = this.memberChannelRange;
    this.input.onAllNoteOn((note) => {
      if (note.channel >= minCh && note.channel <= maxCh) {
        this.eventBus.trigger("noteOn", note);
      }
    });

    this.input.onAllNoteOff((note) => {
      if (note.channel >= minCh && note.channel <= maxCh) {
        this.eventBus.trigger("noteOff", note);
      }
    });

    this.input.onPitchBend((pitchBend) => {
      if (pitchBend.channel === this.masterChannel) {
        this.eventBus.trigger("masterPitchBend", pitchBend);
        this.#pitchBend = pitchBend.value;
        return;
      }
      if (pitchBend.channel >= minCh && pitchBend.channel <= maxCh) {
        this.eventBus.trigger("memberPitchBend", {
          channel: pitchBend.channel,
          memberPitchBend: pitchBend.value,
          masterPitchBend: this.#pitchBend,
        });
      }
    });

    this.input.onChannelPressure((message) => {
      if (message.channel === this.masterChannel) {
        this.eventBus.trigger("masterPressure", {
          channel: message.channel,
          value: message.data2,
        });
        this.#pressure = message.data2;
        return;
      }
      if (message.channel >= minCh && message.channel <= maxCh) {
        this.eventBus.trigger("memberPressure", {
          channel: message.channel,
          memberPressure: message.data2,
          masterPressure: this.#pressure,
        });
      }
    });

    this.input.onControlChange(74, (message) => {
      if (message.channel === this.masterChannel) {
        this.eventBus.trigger("masterTimbre", {
          channel: message.channel,
          value: message.data2,
        });
        this.#timbre = message.data2;
        return;
      }
      if (message.channel >= minCh && message.channel <= maxCh) {
        this.eventBus.trigger("memberTimbre", {
          channel: message.channel,
          memberTimbre: message.data2,
          masterTimbre: this.#timbre,
        });
      }
    });
  }

  onNoteOn(cb: Callback<OmnibusParams<typeof this.eventBus, 'noteOn'>>) {
    return this.eventBus.on("noteOn", cb);
  }

  onNoteOff(cb: Callback<OmnibusParams<typeof this.eventBus, 'noteOff'>>) {
    return this.eventBus.on("noteOff", cb);
  }

  onMasterPitchBend(cb: Callback<OmnibusParams<typeof this.eventBus, 'masterPitchBend'>>) {
    return this.eventBus.on("masterPitchBend", cb);
  }

  onMemberPitchBend(cb: Callback<OmnibusParams<typeof this.eventBus, 'memberPitchBend'>>) {
    return this.eventBus.on("memberPitchBend", cb);
  }

  onMasterTimbre(cb: Callback<OmnibusParams<typeof this.eventBus, 'masterTimbre'>>) {
    return this.eventBus.on("masterTimbre", cb);
  }

  onMemberTimbre(cb: Callback<OmnibusParams<typeof this.eventBus, 'memberTimbre'>>) {
    return this.eventBus.on("memberTimbre", cb);
  }

  onMasterPressure(cb: Callback<OmnibusParams<typeof this.eventBus, 'masterPressure'>>) {
    return this.eventBus.on("masterPressure", cb);
  }

  onMemberPressure(cb: Callback<OmnibusParams<typeof this.eventBus, 'memberPressure'>>) {
    return this.eventBus.on("memberPressure", cb);
  }
}
