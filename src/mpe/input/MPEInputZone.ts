import { Omnibus } from "@hypersphere/omnibus";
import { Callback, MIDIValInput, MidiMessage, NoteMessage } from "../..";
import { PitchBendMessage } from "../../MIDIValInput";

interface MemberPitchBendMessage {
    masterPitchBend: number,
    memberPitchBend: number,
    channel: number
}

interface ChannelValueMessage {
    channel: number;
    value: number;
}

interface MemberPressureMessage {
    channel: number;
    masterPressure: number;
    memberPressure: number;
}

interface MemberTimbreMessage {
    channel: number;
    masterTimbre: number;
    memberTimbre: number;
}

interface EventDefinitions {
    noteOn: [NoteMessage],
    noteOff: [NoteMessage],
    masterPitchBend: [PitchBendMessage],
    memberPitchBend: [MemberPitchBendMessage]

    masterTimbre: [ChannelValueMessage],
    memberTimbre: [MemberTimbreMessage],

    masterPressure: [ChannelValueMessage],
    memberPressure: [MemberPressureMessage]
}

export class MPEInputZone {

    private eventBus: Omnibus<EventDefinitions> = new Omnibus()

    #pitchBend: number = 0
    #timbre: number = 0
    #pressure: number = 0

    constructor(private masterChannel: number, private memberChannelRange: [number, number], private input: MIDIValInput) {
        this.bindEvents()
    }

    private bindEvents() {
        const [minCh, maxCh] = this.memberChannelRange
        this.input.onAllNoteOn(note => {
            if (note.channel >= minCh && note.channel <= maxCh) {
                this.eventBus.trigger("noteOn", note)
            }
        })

        this.input.onAllNoteOff(note => {
            if (note.channel >= minCh && note.channel <= maxCh) {
                this.eventBus.trigger("noteOff", note)
            }
        })

        this.input.onPitchBend(pitchBend => {
            if (pitchBend.channel === this.masterChannel) {
                this.eventBus.trigger("masterPitchBend", pitchBend)
                this.#pitchBend = pitchBend.value
                return
            }
            if (pitchBend.channel >= minCh && pitchBend.channel <= maxCh) {
                this.eventBus.trigger("memberPitchBend", {
                    channel: pitchBend.channel,
                    memberPitchBend: pitchBend.value,
                    masterPitchBend: this.#pitchBend
                })
            }
        })

        this.input.onChannelPressure(message => {
            if (message.channel === this.masterChannel) {
                this.eventBus.trigger("masterPressure", {
                    channel: message.channel,
                    value: message.data2
                })
                this.#pressure = message.data2
                return
            }
            if (message.channel >= minCh && message.channel <= maxCh) {
                this.eventBus.trigger("memberPressure", {
                    channel: message.channel,
                    memberPressure: message.data2,
                    masterPressure: this.#pressure
                })
            }
        })

        this.input.onControlChange(74, message => {
            if (message.channel === this.masterChannel) {
                this.eventBus.trigger("masterTimbre", {
                    channel: message.channel,
                    value: message.data2
                })
                this.#timbre = message.data2
                return
            }
            if (message.channel >= minCh && message.channel <= maxCh) {
                this.eventBus.trigger("memberTimbre", {
                    channel: message.channel,
                    memberTimbre: message.data2,
                    masterTimbre: this.#timbre
                })
            }
        })
    }

    onNoteOn(cb: Callback<EventDefinitions["noteOn"]>) {
        return this.eventBus.on("noteOn", cb)
    }

    onNoteOff(cb: Callback<EventDefinitions["noteOff"]>) {
        return this.eventBus.on("noteOff", cb)
    }

    onMasterPitchBend(cb: Callback<EventDefinitions["masterPitchBend"]>) {
        return this.eventBus.on("masterPitchBend", cb)
    }

    onMemberPitchBend(cb: Callback<EventDefinitions["memberPitchBend"]>) {
        return this.eventBus.on("memberPitchBend", cb)
    }

    onMasterTimbre(cb: Callback<EventDefinitions["masterTimbre"]>) {
        return this.eventBus.on("masterTimbre", cb)
    }

    onMemberTimbre(cb: Callback<EventDefinitions["memberTimbre"]>) {
        return this.eventBus.on("memberTimbre", cb)
    }

    onMasterPressure(cb: Callback<EventDefinitions["masterPressure"]>) {
        return this.eventBus.on("masterPressure", cb)
    }

    onMemberPressure(cb: Callback<EventDefinitions["memberPressure"]>) {
        return this.eventBus.on("memberPressure", cb)
    }
}