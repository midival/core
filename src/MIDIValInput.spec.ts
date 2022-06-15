import { MIDIVal } from "./MIDIval";
import { MIDIValInput } from "./MIDIValInput";
import { MockMIDIAccess } from "./wrappers/access/MockMIDIAccess";
import { makeMessage } from "./utils/MIDIMessageConvert";
import { MidiCommand } from "./utils/midiCommands";
import { MidiControlChange } from "./utils/midiControlChanges";
import { MidiDeviceProps } from "./wrappers/inputs/MockMIDIInput";

const createInput = async (props: MidiDeviceProps) => {
  const access = <MockMIDIAccess>await MIDIVal.connect();
  const input = access.addInput(props);
  return { input: new MIDIValInput(input), mock: input };
};

describe("MIDIValInput", () => {
  beforeEach(() => {
    MIDIVal.configureAccessObject(new MockMIDIAccess());
  });

  it("should properly instantiate MIDIValInput object", async () => {
    const { input } = await createInput({
      id: "1",
      name: "Input",
      manufacturer: "MIDIVal",
    });
    expect(input.constructor).toEqual(MIDIValInput);
  });

  it(".noteOn", async () => {
    const { input, mock } = await createInput({
      id: "1",
      name: "Input",
      manufacturer: "MIDIVal",
    });
    const allCallback = jest.fn();
    const note65Callback = jest.fn();
    const note66Callback = jest.fn();

    input.onAllNoteOn(allCallback);
    input.onNoteOn(65, note65Callback);
    input.onNoteOn(66, note66Callback);

    mock.sendMessage(
      makeMessage({
        channel: 1,
        command: MidiCommand.NoteOn,
        data1: 65,
        data2: 128,
      })
    );

    expect(allCallback).toBeCalledTimes(1);
    expect(note65Callback).toBeCalledTimes(1);
    expect(note66Callback).toBeCalledTimes(0);

    expect(allCallback.mock.calls[0][0]).toEqual({
      command: MidiCommand.NoteOn,
      channel: 1,
      data1: 65,
      data2: 128,
      note: 65,
      velocity: 128,
    });
  });

  it(".noteOff", async () => {
    const { input, mock } = await createInput({
      id: "1",
      name: "Input",
      manufacturer: "MIDIVal",
    });
    const allCallback = jest.fn();
    const note20Callback = jest.fn();
    const note50Callback = jest.fn();

    input.onAllNoteOff(allCallback);
    input.onNoteOff(20, note20Callback);
    input.onNoteOff(50, note50Callback);

    mock.sendMessage(
      makeMessage({
        channel: 1,
        command: MidiCommand.NoteOff,
        data1: 20,
        data2: 0, // velocity is usually ignored
      })
    );

    expect(allCallback).toBeCalledTimes(1);
    expect(note20Callback).toBeCalledTimes(1);
    expect(note50Callback).toBeCalledTimes(0);

    expect(allCallback.mock.calls[0][0]).toEqual({
      command: MidiCommand.NoteOff,
      channel: 1,
      data1: 20,
      data2: 0,
      note: 20,
      velocity: 0,
    });
  });

  it(".onControlChange", async () => {
    const { input, mock } = await createInput({
      id: "1",
      name: "Input",
      manufacturer: "MIDIVal",
    });
    const allCallback = jest.fn();
    const control20Change = jest.fn();
    const control21Change = jest.fn();

    input.onAllControlChange(allCallback);
    input.onControlChange(20, control20Change);
    input.onControlChange(21, control21Change);

    mock.sendMessage(
      makeMessage({
        channel: 1,
        command: MidiCommand.ControlChange,
        data1: 20,
        data2: 0,
      })
    );

    expect(allCallback).toBeCalledTimes(1);
    expect(control20Change).toBeCalledTimes(1);
    expect(control21Change).toBeCalledTimes(0);

    expect(allCallback.mock.calls[0][0]).toEqual({
      command: MidiCommand.ControlChange,
      channel: 1,
      data1: 20,
      data2: 0,
      control: 20,
      value: 0,
    });
  });

  it(".onProgramChange", async () => {
    const { input, mock } = await createInput({
      id: "1",
      name: "Input",
      manufacturer: "MIDIVal",
    });
    const allCallback = jest.fn();
    const program20Change = jest.fn();
    const program21Change = jest.fn();

    input.onAllProgramChange(allCallback);
    input.onProgramChange(20, program20Change);
    input.onProgramChange(21, program21Change);

    mock.sendMessage(
      makeMessage({
        command: MidiCommand.ProgramChange,
        channel: 1,
        data1: 20,
        data2: 23,
      })
    );

    expect(allCallback).toBeCalledTimes(1);
    expect(program20Change).toBeCalledTimes(1);
    expect(program21Change).toBeCalledTimes(0);

    expect(allCallback.mock.calls[0][0]).toEqual({
      command: MidiCommand.ProgramChange,
      channel: 1,
      data1: 20,
      data2: 23,
      program: 20,
      value: 23,
    });
  });

  it(".onAllSoundsOff", async () => {
    const { input, mock } = await createInput({
      id: "1",
      name: "Input",
      manufacturer: "MIDIVal",
    });
    const callback = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();

    input.onAllSoundsOff(callback);
    input.onControlChange(MidiControlChange.AllSoundsOff, callback2);
    input.onAllControlChange(callback3);

    mock.sendMessage(
      makeMessage({
        channel: 1,
        command: MidiCommand.ControlChange,
        data1: MidiControlChange.AllSoundsOff,
        data2: null,
      })
    );
    expect(callback3).toBeCalledTimes(1);
    expect(callback2).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
  });

  it(".onLocalControlChange", async () => {
    const { input, mock } = await createInput({
      id: "1",
      name: "Input",
      manufacturer: "MIDIVal",
    });
    const callback = jest.fn();
    input.onLocalControlChange(callback);
    let msg = {
      channel: 1,
      command: MidiCommand.ControlChange,
      data1: MidiControlChange.LocalControlOnOff,
      data2: 127, // ON
    };
    mock.sendMessage(makeMessage(msg));
    expect(callback).toBeCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith(true, {
      ...msg,
      value: 127,
      control: MidiControlChange.LocalControlOnOff,
    });

    let msg2 = {
      channel: 1,
      command: MidiCommand.ControlChange,
      data1: MidiControlChange.LocalControlOnOff,
      data2: 0, // OFF
      control: MidiControlChange.LocalControlOnOff,
      value: 0,
    };
    mock.sendMessage(makeMessage(msg2));
    expect(callback).toBeCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith(false, msg2);
  });
});
