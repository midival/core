import { COMMAND } from "./MIDIMessageConvert";

describe("MIDIMessageConvert", () => {
  describe("COMMAND", () => {
    it("should commands have proper number representation", () => {
      expect(COMMAND.NOTE_OFF).toEqual(0b1000 << 4);
      expect(COMMAND.NOTE_ON).toEqual(0b1001 << 4);
      expect(COMMAND.POLY_KEY_PRESSURE).toEqual(0b1010 << 4);
      expect(COMMAND.CONTROL_CHANGE).toEqual(0b1011 << 4);
      expect(COMMAND.PROGRAM_CHANGE).toEqual(0b1100 << 4);
      expect(COMMAND.CHANNEL_PRESSURE).toEqual(0b1101 << 4);
      expect(COMMAND.PITCH_BEND).toEqual(0b1110 << 4);
      expect(COMMAND.SYSEX).toEqual(0b1111 << 4);
    });
  });
});
