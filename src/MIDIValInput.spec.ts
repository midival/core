import MIDIVal from "./MIDIval";
import MIDIValInput from "./MIDIValInput";
import MockMIDIAccess from "./wrappers/access/MockMIDIAccess";
import {
  makeMessage,
  COMMAND,
  commandToString,
  CHANNEL_MODE,
} from "./utils/MIDIMessageConvert";

const createInput = async (id, name) => {
  const access = <MockMIDIAccess>await MIDIVal.connect();
  const input = access.addInput(id, name);
  return { input: new MIDIValInput(input), mock: input };
};

describe("MIDIValInput", () => {
  beforeEach(() => {
    MIDIVal.configureAccessObject(new MockMIDIAccess());
  });

  it("should properly instantiate MIDIValInput object", async () => {
    const { input } = await createInput("1", "Input");
    expect(input.constructor).toEqual(MIDIValInput);
  });

  it(".noteOn", async () => {
    const { input, mock } = await createInput("1", "Input");
    const allCallback = jest.fn();
    const note65Callback = jest.fn();
    const note66Callback = jest.fn();

    input.onAllNoteOn(allCallback);
    input.onNoteOn(65, note65Callback);
    input.onNoteOn(66, note66Callback);

    mock.sendMessage(
      makeMessage({
        channel: 1,
        command: COMMAND.NOTE_ON,
        data1: 65,
        data2: 128,
      })
    );

    expect(allCallback).toBeCalledTimes(1);
    expect(note65Callback).toBeCalledTimes(1);
    expect(note66Callback).toBeCalledTimes(0);

    expect(allCallback.mock.calls[0][1]).toEqual({
      command: COMMAND.NOTE_ON,
      channel: 1,
      data1: 65,
      data2: 128,
    });
  });

  it(".noteOff", async () => {
    const { input, mock } = await createInput("1", "Input");
    const allCallback = jest.fn();
    const note20Callback = jest.fn();
    const note50Callback = jest.fn();

    input.onAllNoteOff(allCallback);
    input.onNoteOff(20, note20Callback);
    input.onNoteOff(50, note50Callback);

    mock.sendMessage(
      makeMessage({
        channel: 1,
        command: COMMAND.NOTE_OFF,
        data1: 20,
        data2: 0, // velocity is usually ignored
      })
    );

    expect(allCallback).toBeCalledTimes(1);
    expect(note20Callback).toBeCalledTimes(1);
    expect(note50Callback).toBeCalledTimes(0);

    expect(allCallback.mock.calls[0][1]).toEqual({
      command: COMMAND.NOTE_OFF,
      channel: 1,
      data1: 20,
      data2: 0,
    });
  });

  it(".onControlChange", async () => {
    const { input, mock } = await createInput("1", "Input");
    const allCallback = jest.fn();
    const control20Change = jest.fn();
    const control21Change = jest.fn();

    input.onAllControlChange(allCallback);
    input.onControlChange(20, control20Change);
    input.onControlChange(21, control21Change);

    mock.sendMessage(
      makeMessage({
        channel: 1,
        command: COMMAND.CONTROL_CHANGE,
        data1: 20,
        data2: 0,
      })
    );

    expect(allCallback).toBeCalledTimes(1);
    expect(control20Change).toBeCalledTimes(1);
    expect(control21Change).toBeCalledTimes(0);

    expect(allCallback.mock.calls[0][1]).toEqual({
      command: COMMAND.CONTROL_CHANGE,
      channel: 1,
      data1: 20,
      data2: 0,
    });
  });

  it(".onProgramChange", async () => {
    const { input, mock } = await createInput("1", "Input");
    const allCallback = jest.fn();
    const program20Change = jest.fn();
    const program21Change = jest.fn();

    input.onAllProgramChange(allCallback);
    input.onProgramChange(20, program20Change);
    input.onProgramChange(21, program21Change);

    mock.sendMessage(
      makeMessage({
        command: COMMAND.PROGRAM_CHANGE,
        channel: 1,
        data1: 20,
        data2: 23,
      })
    );

    expect(allCallback).toBeCalledTimes(1);
    expect(program20Change).toBeCalledTimes(1);
    expect(program21Change).toBeCalledTimes(0);

    expect(allCallback.mock.calls[0][1]).toEqual({
      command: COMMAND.PROGRAM_CHANGE,
      channel: 1,
      data1: 20,
      data2: 23,
    });
  });

  it.skip(".onAllSoundsOff", async () => {
    const { input, mock } = await createInput("1", "Input");
    const callback = jest.fn();
    input.onAllSoundsOff(callback);
    mock.sendMessage(
      makeMessage({
        channel: 1,
        command: COMMAND.CONTROL_CHANGE,
        data1: CHANNEL_MODE.ALL_NOTES_OFF,
        data2: null,
      })
    );

    expect(callback).toBeCalledTimes(1);
  });
});
