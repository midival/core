/**
 * Generic message interface.
 * @category MIDI Messages
 */
export interface MidiMessage {
  channel: number;
  command: number;
  data1: number;
  data2: number;
}

type MidiData = Uint8Array;
export const isChannelMode = (channel: number): boolean => channel >= 120;

export const makeMessage = ({
  channel,
  command,
  data1,
  data2,
}: MidiMessage): Uint8Array => {
  return Uint8Array.from([command + (channel - 1), data1, data2]);
};

export const toMidiMessage = ([
  status,
  data1,
  data2,
]: MidiData): MidiMessage => {
  const command: number = (status >> 4) << 4; // cleaning lower bits
  const channel: number = status - command + 1;
  return {
    channel,
    command,
    data1,
    data2,
  };
};
