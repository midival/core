export const MidiCommand = {
    NoteOn: 0b1001 << 4,
    NoteOff: 0b1000 << 4,
    PolyKeyPressure: 0b1010 << 4,
    ControlChange: 0b1011 << 4,
    ProgramChange: 0b1100 << 4,
    ChannelPressure: 0b1101 << 4,
    PitchBend: 0b1110 << 4,
    Sysex: 0b1111 << 4,
    Clock: {
        Start: 0xFA,
        Continue: 0xFB,
        Stop: 0xFC,
        Pulse: 0xF8,
    }
};