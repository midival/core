import {MIDIVal} from "./index";
import { matchesConfig } from "./MIDIval";
import {MockMIDIAccess} from "./wrappers/access/MockMIDIAccess";
import { IMIDIInput } from "./wrappers/inputs/IMIDIInput";
import { MockMIDIInput } from "./wrappers/inputs/MockMIDIInput";

describe("MIDIVal", () => {
  let mockMidiAccess: MockMIDIAccess = null;
  beforeEach(() => {
    mockMidiAccess = new MockMIDIAccess();
    MIDIVal.configureAccessObject(mockMidiAccess);
  });

  it("Should get proper access object", async () => {
    const accessObject = await MIDIVal.connect();
    expect(accessObject.constructor).toEqual(MockMIDIAccess);
  });

  it("matchesConfig should work properly", () => {
    let input: IMIDIInput = new MockMIDIInput({
      id: "1",
      name: "MIDI Input",
      manufacturer: "MIDIVal"
    });
    expect(matchesConfig(input, { name: "MIDI Input"})).toEqual(true);
    expect(matchesConfig(input, { name: "XXX"})).toEqual(false);
    expect(matchesConfig(input, {})).toEqual(true);
    expect(matchesConfig(input, { name: /MIDI/ })).toEqual(true);
    expect(matchesConfig(input, { name: /MIDI/, manufacturer: "XXX" })).toEqual(false);
  })

  it("should properly filter input devices", async () => {
    mockMidiAccess.addInput({ id: "1", name: "Device 1", manufacturer: "MIDIVal"});
    mockMidiAccess.addInput({ id: "2", name: "Device 2", manufacturer: "MIDIVal"});
    mockMidiAccess.addInput({ id: "3", name: "Device 3", manufacturer: "MIDIVal"});
    mockMidiAccess.addInput({ id: "4", name: "Device 4", manufacturer: "XXX"});

    const fn = jest.fn();
    await MIDIVal.onInputDeviceWithConfigConnected({
      manufacturer: "MIDIVal"
    }, fn, true);

    expect(fn).toBeCalledTimes(3);
  });

  it("should properly filter output devices", async () => {
    mockMidiAccess.addOutput({ id: "1", name: "Device 1", manufacturer: "MIDIVal"});
    mockMidiAccess.addOutput({ id: "2", name: "Device 2", manufacturer: "MIDIVal"});
    mockMidiAccess.addOutput({ id: "3", name: "Device 3", manufacturer: "MIDIVal"});
    mockMidiAccess.addOutput({ id: "4", name: "Device 4", manufacturer: "XXX"});

    const fn = jest.fn();
    await MIDIVal.onOutputDeviceWithConfigConnected({
      manufacturer: "MIDIVal"
    }, fn, true);

    expect(fn).toBeCalledTimes(3);
  });
});
