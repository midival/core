import { MIDIValOutput } from "../../MIDIValOutput";

export class ActiveNote {
  #pitchBend: number = 0;
  #timbre: number = 0;
  #pressure: number = 0;

  #isActive: boolean = true;

  constructor(
    public readonly note: number,
    public readonly velocity: number,
    public readonly channel: number,
    private readonly output: MIDIValOutput
  ) {
    this.output.sendNoteOn(note, velocity, channel);
  }

  changePressure(pressure: number) {
    if (!this.isActive) {
      return;
    }
    this.output.sendChannelPressure(pressure, this.channel);
    this.#pressure = pressure;
  }

  changeBend(newBend: number) {
    if (!this.isActive) {
      return;
    }
    this.output.sendPitchBend(newBend, this.channel);
    this.#pitchBend = newBend;
  }

  changeTimbre(newSlide: number) {
    if (!this.isActive) {
      return;
    }
    this.output.sendControlChange(74, newSlide, this.channel);
    this.#timbre = newSlide;
  }

  get x() {
    return this.#pitchBend;
  }

  get y() {
    return this.#timbre;
  }

  get z() {
    return this.#pressure;
  }

  set x(newValue: number) {
    this.changeBend(newValue);
  }

  set y(newValue: number) {
    this.changeTimbre(newValue);
  }

  set z(newValue: number) {
    this.changePressure(newValue);
  }

  get pitchBend() {
    return this.#pitchBend
  }

  get timbre() {
    return this.#timbre
  }

  get pressure() {
    return this.#pressure
  }

  get isActive() {
    return this.#isActive;
  }

  noteOff() {
    this.output.sendNoteOff(this.note, this.channel);
    this.#isActive = false;
  }
}
