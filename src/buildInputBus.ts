import { Omnibus, args } from "@hypersphere/omnibus"
import { PitchBendMessage, RegisteredParameterData } from "./MIDIValInput"
import { MidiMessage } from "./utils/MIDIMessageConvert"
import { ControlChangeMessage, NoteMessage, ProgramChangeMessage } from "./types/messages"
import { OmnibusKeys, OmnibusParams, OmnibusValue } from "./types/omnibus"

export const buildInputBus = () => {
    return Omnibus.builder()
      .register('pithchBend', args<PitchBendMessage>())
      .register('sysex', args<[Uint8Array]>())
      .register('channelPressure', args<MidiMessage>())
      .register('noteOn', args<NoteMessage>())
      .register('noteOff', args<NoteMessage>())
      .register('controlChange', args<ControlChangeMessage>())
      .register('programChange', args<ProgramChangeMessage>())
      .register('polyKeyPressure', args<MidiMessage>())
      .register('clockPulse', args<void>())
      .register('clockStart', args<void>())
      .register('clockStop', args<void>())
      .register('clockContinue', args<void>())
      .register('registeredParameterData', args<RegisteredParameterData>())
      .build()
}

export type MIDIValInputBusKeys = OmnibusKeys<ReturnType<typeof buildInputBus>>
export type MIDIValInputBusValue<T extends MIDIValInputBusKeys> = OmnibusValue<ReturnType<typeof buildInputBus>, T>
export type MIDIValInputBusParams<T extends MIDIValInputBusKeys> = OmnibusParams<ReturnType<typeof buildInputBus>, T>
