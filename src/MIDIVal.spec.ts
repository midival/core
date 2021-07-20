import {MIDIVal} from "./index";
import {MockMIDIAccess} from "./wrappers/access/MockMIDIAccess";

describe("MIDIVal", () => {
  beforeEach(() => {
    MIDIVal.configureAccessObject(new MockMIDIAccess());
  });

  it("Should get proper access object", async () => {
    const accessObject = await MIDIVal.connect();
    expect(accessObject.constructor).toEqual(MockMIDIAccess);
  });
});
