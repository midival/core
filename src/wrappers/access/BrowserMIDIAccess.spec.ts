/**
 * @jest-environment jsdom
 */
import { Omnibus } from "@hypersphere/omnibus";
import { BrowserMIDIAccess } from "./BrowserMIDIAccess";
const _bus = new Omnibus();
const access: WebMidi.MIDIAccess = {
  inputs: new Map(),
  outputs: new Map(),
  onstatechange: jest.fn(),
  addEventListener: jest.fn((event, callback: (any) => void) =>
    _bus.on(event, callback)
  ),
  sysexEnabled: false,
  dispatchEvent: jest.fn(),
  removeEventListener: jest.fn(),
};

describe("BrowserMIDIAccess", () => {
  beforeAll(() => {
    // @ts-ignore
    navigator.requestMIDIAccess = (options) =>
      Promise.resolve(access as unknown as WebMidi.MIDIAccess);
  });

  it("should properly instantiate BrowserMIDIAccess", async () => {
    const accessObject = new BrowserMIDIAccess();
    await accessObject.connect();
    expect(access.addEventListener).toBeCalledTimes(1);
  });

  it("should properly add event listeners for inputs", async () => {
    const accessObject = new BrowserMIDIAccess();
    await accessObject.connect();
    const inputConnectedCallback = jest.fn();
    accessObject.onInputConnected(inputConnectedCallback);
    access.inputs.set("1234", {
      id: "1234",
    } as undefined);
    _bus.trigger("statechange", {
      port: {
        type: "input",
        state: "connected",
        id: "1234",
      },
    });
    expect(inputConnectedCallback).toBeCalledTimes(1);

    const inputDisconnectedCallback = jest.fn();
    accessObject.onInputDisconnected(inputDisconnectedCallback);
    _bus.trigger("statechange", {
      port: {
        type: "input",
        state: "disconnected",
        id: "1234",
      },
    });
    expect(inputDisconnectedCallback).toBeCalledTimes(1);
  });

  it("should properly add event listeners for outputs", async () => {
    const accessObject = new BrowserMIDIAccess();
    await accessObject.connect();
    const outputConnectedCallback = jest.fn();
    accessObject.onOutputConnected(outputConnectedCallback);
    access.outputs.set("1234", {
      id: "1234",
    } as undefined);
    _bus.trigger("statechange", {
      port: {
        type: "output",
        state: "connected",
        id: "1234",
      },
    });
    expect(outputConnectedCallback).toBeCalledTimes(1);

    const outputDisconnectedCallback = jest.fn();
    accessObject.onOutputDisconnected(outputDisconnectedCallback);
    _bus.trigger("statechange", {
      port: {
        type: "output",
        state: "disconnected",
        id: "1234",
      },
    });
    expect(outputDisconnectedCallback).toBeCalledTimes(1);
  });

  it("should throw error when there's no navigator.requestMIDIAccess", () => {
    const accessObject = new BrowserMIDIAccess();
    const prevNav = navigator.requestMIDIAccess;
    navigator.requestMIDIAccess = null;
    expect(accessObject.connect()).rejects.toEqual(
      new Error(
        "requestMIDIAccess not available, make sure you are using MIDI-compatible browser."
      )
    );
    navigator.requestMIDIAccess = prevNav;
  });

  it("should properly return inputs", async () => {
    const accessObject = new BrowserMIDIAccess();
    access.inputs.clear();
    access.inputs.set("1234", {
      type: "input",
      id: "1234",
      name: "MIDI In",
    } as unknown as WebMidi.MIDIInput);
    await accessObject.connect();
    expect(accessObject.inputs).toHaveLength(1);
    expect(accessObject.inputs[0].name).toEqual("MIDI In");
  });

  it("should properly return outputs", async () => {
    const accessObject = new BrowserMIDIAccess();
    access.outputs.clear();
    access.outputs.set("1234", {
      type: "output",
      id: "1234",
      name: "MIDI Out",
    } as unknown as WebMidi.MIDIOutput);
    await accessObject.connect();
    expect(accessObject.outputs).toHaveLength(1);
    expect(accessObject.outputs[0].name).toEqual("MIDI Out");
  });
});
