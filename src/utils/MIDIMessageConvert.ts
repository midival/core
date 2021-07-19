export type MidiMessage = {
  channel: number;
  command: number;
  data1: number;
  data2: number;
};

type MidiData = Uint8Array;

export const COMMAND = {
  NOTE_OFF: 0b1000 << 4,
  NOTE_ON: 0b1001 << 4,
  POLY_KEY_PRESSURE: 0b1010 << 4,
  CONTROL_CHANGE: 0b1011 << 4,
  PROGRAM_CHANGE: 0b1100 << 4,
  CHANNEL_PRESSURE: 0b1101 << 4,
  PITCH_BEND: 0b1110 << 4,
  SYSEX: 0b1111 << 4,
};

export const CHANNEL_MODE = {
  ALL_SOUND_OFF: 120,
  RESET_ALL_CONTROLLERS: 121,
  LOCAL_CONTROL: 122,
  ALL_NOTES_OFF: 123,
  OMNI_MODE_OFF: 124,
  OMNI_MODE_ON: 125,
  MONO_MODE_ON: 126,
  POLY_MODE_ON: 127,
};

export const isChannelMode = (channel: number): boolean => channel >= 120;

export const commandToString = (cmd: number): string => {
  // FIXME: add channel mode here.
  switch (cmd) {
    case COMMAND.NOTE_ON:
      return "Note On";
    case COMMAND.NOTE_OFF:
      return "Note Off";
    case COMMAND.POLY_KEY_PRESSURE:
      return "Poly Key Pressure";
    case COMMAND.CONTROL_CHANGE:
      return "Control Change";
    case COMMAND.PROGRAM_CHANGE:
      return "Program Change";
    case COMMAND.CHANNEL_PRESSURE:
      return "Channel Pressure";
    case COMMAND.PITCH_BEND:
      return "Pitch bend";
    default:
      return "Unknown command (" + cmd + ")";
  }
};

export const logMessage = ({
  channel,
  command,
  data1,
  data2,
}: MidiMessage): void => {
  if (true) {
    return;
  }
  console.log(
    "CH: " +
      channel +
      ", CMD: " +
      commandToString(command) +
      ", " +
      data1 +
      ", " +
      data2
  );
};

export const makeMessage = ({
  channel,
  command,
  data1,
  data2,
}: MidiMessage): Uint8Array => {
  return Uint8Array.from([command + (channel - 1), data1, data2]);
};

export default ([status, data1, data2]: MidiData): MidiMessage => {
  const command: number = (status >> 4) << 4; // cleaning lower bits
  const channel: number = status - command + 1;
  return {
    channel,
    command,
    data1,
    data2,
  };
};
