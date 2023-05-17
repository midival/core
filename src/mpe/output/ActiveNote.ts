import { MIDIValOutput } from "../MIDIValOutput";

export class ActiveNote {

    #pitchBend: number = 0
    #timbre: number = 0
    #afterTouch: number = 0

    #isActive: boolean = true

    constructor(private readonly note: number, private velocity: number, public readonly channel: number, private readonly output: MIDIValOutput) {
        this.output.sendNoteOn(note, velocity, channel)
    }

    changeVelocity(newVelocity: number) {
        if (!this.isActive) {
            return;
        }
        this.output.sendChannelPressure(newVelocity, this.channel)
        this.velocity = newVelocity
    }

    changeBend(newBend: number) {
        if (!this.isActive) {
            return;
        }
        this.output.sendPitchBend(newBend, this.channel)
        this.#pitchBend = newBend
    }
    
    changeTimbre(newSlide: number) {
        if (!this.isActive) {
            return;
        }
        this.output.sendControlChange(74, newSlide, this.channel)
        this.#timbre = newSlide
    }

    get x() {
        return this.#pitchBend
    }

    get y() {
        return this.#timbre
    }

    get z() {
        return this.#afterTouch
    }

    set x(newValue: number) {
        this.changeBend(newValue)
    }

    set y(newValue: number) {
        this.changeTimbre(newValue)
    }

    set z(newValue: number) {
        this.changeVelocity(newValue)
    }

    get isActive() {
        return this.#isActive
    }

    noteOff() {
        this.output.sendNoteOff(this.note, this.channel)
        this.#isActive = false;
    }
}