import { MidiMessage } from "../utils/MIDIMessageConvert";

/**
 * Message used in Note On / Note Off Callbacks.
 * @category MIDI Messages
 */
export interface NoteMessage extends MidiMessage {
  note: number;
  velocity: number;
}

export const toNoteMessage = (m: MidiMessage): NoteMessage => ({
  ...m,
  note: m.data1,
  velocity: m.data2,
});

/**
 * Message used in Control Change Callbacks.
 * @category MIDI Messages
 */
export interface ControlChangeMessage extends MidiMessage {
  control: number;
  value: number;
}

export const toControlChangeMessage = (
  m: MidiMessage
): ControlChangeMessage => ({
  ...m,
  control: m.data1,
  value: m.data2,
});

/**
 * Message used in Program Change Callbacks.
 * @category MIDI Messages
 */
export interface ProgramChangeMessage extends MidiMessage {
  program: number;
  value: number;
}

export const toProgramMessage = (m: MidiMessage): ProgramChangeMessage => ({
  ...m,
  program: m.data1,
  value: m.data2,
});
