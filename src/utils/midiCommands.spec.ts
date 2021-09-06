import { MidiCommand } from "./midiCommands";

describe("MidiCommands", () => {
      it("should commands have proper number representation", () => {
        expect(MidiCommand.NoteOff).toEqual(0b1000 << 4);
        expect(MidiCommand.NoteOn).toEqual(0b1001 << 4);
        expect(MidiCommand.PolyKeyPressure).toEqual(0b1010 << 4);
        expect(MidiCommand.ControlChange).toEqual(0b1011 << 4);
        expect(MidiCommand.ProgramChange).toEqual(0b1100 << 4);
        expect(MidiCommand.ChannelPressure).toEqual(0b1101 << 4);
        expect(MidiCommand.PitchBend).toEqual(0b1110 << 4);
        expect(MidiCommand.Sysex).toEqual(0b1111 << 4);
      });
  });