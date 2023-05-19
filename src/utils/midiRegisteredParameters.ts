export const MIDIRegisteredParameters = {
  PITCH_BEND_SENSITIVITY: [0, 0],
  CHANNEL_FINE_TUNING: [0, 1],
  CHANNEL_COARSE_TUNING: [0, 2],
  TUNING_PROGRAM_CHANGE: [0, 3],
  TUNING_BANK_SELECT: [0, 4],
  MODULATION_DEPTH_CHANGE: [0, 5],
  MPE_CONFIGURATION_MESSAGE: [0, 6],
} as const;

export const toRegisteredParameterKey = (
  data: [number, number]
): keyof typeof MIDIRegisteredParameters => {
  for (const [key, value] of Object.entries(MIDIRegisteredParameters)) {
    if (value[0] === data[0] && value[1] === data[1]) {
      return key as keyof typeof MIDIRegisteredParameters;
    }
  }
  throw new Error("Unknown registered parameter");
};
