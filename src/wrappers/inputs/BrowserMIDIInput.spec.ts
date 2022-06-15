import { BrowserMIDIInput } from "./BrowserMIDIInput"

const generateInput = (): WebMidi.MIDIInput => (
    {
        id: "1234",
        name: "Input Name",
        manufacturer: "Input Manufacturer",
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        open: jest.fn(),
} as unknown as WebMidi.MIDIInput)

describe("BrowserMIDIInput", () => {
    it("should properly setup BrowserMIDIInput", () => {
        const inputObj = generateInput();
        const input = new BrowserMIDIInput(inputObj);
        expect(input.name).toEqual("Input Name");
        expect(input.manufacturer).toEqual("Input Manufacturer");
        expect(input.id).toEqual("1234");
    });
    it("should properly call event listeners", async () => {
        const inputObj = generateInput();
        const input = new BrowserMIDIInput(inputObj);
        const fn = jest.fn();
        const remove = await input.onMessage(fn);
        expect(inputObj.addEventListener).toBeCalledWith("midimessage", fn);
        expect(inputObj.removeEventListener).not.toBeCalled();
        expect(inputObj.open).toBeCalled();
        remove();
        expect(inputObj.removeEventListener).toBeCalledWith("midimessage", fn);
    })
})