import { BrowserMIDIOutput } from "./BrowserMIDIOutput";

const generateOutput = (): WebMidi.MIDIOutput =>
  ({
    id: "1234",
    name: "Output Name",
    manufacturer: "Output Manufacturer",
    send: jest.fn(),
  } as unknown as WebMidi.MIDIOutput);

describe("BrowserMIDIOutput", () => {
  it("should properly instantiate object", () => {
    const outputObj = generateOutput();
    const output = new BrowserMIDIOutput(outputObj);
    expect(output.name).toEqual("Output Name");
    expect(output.manufacturer).toEqual("Output Manufacturer");
    expect(output.id).toEqual("1234");
    output.send([1, 2, 3]);
    expect(outputObj.send).toBeCalledWith([1, 2, 3]);
  });
});
