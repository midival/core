import { MIDIVal, MIDIValInput, MIDIValOutput } from "./index";
describe("Main exports", () => {
  it("should properly export classes", () => {
    expect(MIDIVal).not.toBeUndefined();
    expect(MIDIValInput).not.toBeUndefined();
    expect(MIDIValOutput).not.toBeUndefined();
  });
});
