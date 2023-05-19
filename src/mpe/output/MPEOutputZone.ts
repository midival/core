import { MIDIValOutput } from "../../MIDIValOutput";
import { ActiveNote } from "./ActiveNote";

export class MPEOutputZone {
  constructor(
    private masterChannel: number,
    private childChannelsRange: [number, number],
    private output: MIDIValOutput
  ) {}

  #notes: ActiveNote[] = [];

  private getOpenChannel(): number {
    const ch = this.notesPerChannel;
    const min = Math.min(...Array.from(ch.values()));
    for (const [key, value] of ch.entries()) {
      if (value === min) {
        return key;
      }
    }
  }

  private forEachMember(fn: (channel: number) => void) {
    const [minCh, maxCh] = this.childChannelsRange;
    for (let i = minCh; i < maxCh; i++) {
      fn(i);
    }
  }

  private get notesPerChannel() {
    const [minCh, maxCh] = this.childChannelsRange;
    const ch: Map<number, number> = new Map();
    for (let i = minCh; i < maxCh; i++) {
      ch.set(i, 0);
    }
    this.#notes.forEach((n) => {
      ch.set(n.channel, ch.get(n.channel) + 1);
    });
    // Filter out notes that are off
    this.#notes = this.#notes.filter((n) => n.isActive);
    return ch;
  }

  setMasterPitchBend(value: number) {
    this.output.sendPitchBend(value, this.masterChannel);
  }

  setMasterTimbre(value: number) {
    this.output.sendControlChange(74, value, this.masterChannel);
  }

  setMasterVelocity(value: number) {
    this.output.sendChannelPressure(value, this.masterChannel);
  }

  setMasterPitchBendSensitivity(semitones: number) {
    this.output.setPitchBendSensitivity(semitones, 0, this.masterChannel);
  }

  setMemberPitchBendSensitivity(semitones: number) {
    this.forEachMember((channel) => {
      this.output.setPitchBendSensitivity(semitones, 0, channel);
    });
  }

  sendNoteOn(note: number, velocity: number) {
    const channel = this.getOpenChannel();
    const activeNote = new ActiveNote(note, velocity, channel, this.output);
    this.#notes.push(activeNote);
    return activeNote;
  }
}
