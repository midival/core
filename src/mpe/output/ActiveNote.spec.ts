import { MIDIValOutput } from "../../MIDIValOutput"
import { MockMIDIInput } from "../../wrappers/inputs/MockMIDIInput"
import { MockMIDIOutput } from "../../wrappers/outputs/MockMIDIOutput"
import { ActiveNote } from "./ActiveNote"

describe('Active Note', () => {
    it('should properly setup active note', () => {
        const mock = new MockMIDIOutput({ id: "123", name: "", manufacturer: "" })
        const output = new MIDIValOutput(mock)
        const spy = jest.fn();
        mock.onMessage(spy)

        const note = new ActiveNote(64, 100, 2, output)
        expect(spy).toBeCalledWith(expect.objectContaining({ data: [145, 64, 100] }))
    })

    it('should properly simulate lifecyce of a note', () => {
        const mock = new MockMIDIOutput({ id: "123", name: "", manufacturer: "" })
        const output = new MIDIValOutput(mock)
        const spy = jest.fn();
        mock.onMessage(spy)

        const note = new ActiveNote(64, 100, 2, output)
        expect(spy).toBeCalledWith(expect.objectContaining({ data: [145, 64, 100] }))
        expect(note.isActive).toBeTruthy()

        expect(note.x).toEqual(0)
        note.x = 0.5
        expect(spy).toBeCalledTimes(2)
        expect(spy).toBeCalledWith(expect.objectContaining({ data: [145, 64, 100]}))
        expect(note.x).toBeCloseTo(0.5)
        
        note.noteOff()
        expect(spy).toBeCalledWith(expect.objectContaining({ data: [129, 64, 0]}))
        expect(note.isActive).toBeFalsy()
    })
})