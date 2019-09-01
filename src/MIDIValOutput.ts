import toMidiMessage, {
  logMessage,
  COMMAND,
  CHANNEL_MODE,
  isChannelMode,
} from "./utils/MIDIMessageConvert";
import IMIDIOutput from "./wrappers/outputs/IMIDIOutput";
import MIDIAccess from "./wrappers/access/MIDIAccess";
import MIDIVal from "./index";
import IMIDIAccess from "./wrappers/access/IMIDIAccess";

export default class MIDIValOutput {
  private midiOutput: IMIDIOutput;
  private defaultChannel: number;
  constructor(output: IMIDIOutput) {
    this.midiOutput = output;
    this.defaultChannel = 1;
  }

  send(msgs: Uint8Array | number[]): void {
    if (!this.midiOutput) {
      return;
    }
    this.midiOutput.send(msgs);
  }

  setChannel(channel: number): void {
    this.defaultChannel = channel;
  }

  private getChannel(channel?: number) {
    if (!channel) {
      return this.defaultChannel - 1;
    }
    return channel - 1;
  }

  public static async fromInterfaceName(
    interfaceName: string
  ): Promise<MIDIValOutput> {
    const midiAccess = await this.getMidiAccess();
    const output = midiAccess.outputs.find(
      ({ name }) => name === interfaceName
    );
    if (!output) {
      throw new Error(`${interfaceName} not found`);
    }
    return new MIDIValOutput(output);
  }

  private static async getMidiAccess(): Promise<IMIDIAccess> {
    const midiAccess: IMIDIAccess = await MIDIVal.connect();
    return midiAccess;
  }

  // Note On and off
  sendNoteOn(note: number, velocity: number, channel?: number) {
    return this.send([
      COMMAND.NOTE_ON + this.getChannel(channel),
      note,
      velocity,
    ]);
  }

  sendNoteOff(note: number, channel?: number): void {
    return this.send([COMMAND.NOTE_OFF + this.getChannel(channel), note, 0]);
  }

  sendPolyKeyPressure(key: number, velocity: number, channel?: number): void {
    return this.send([
      COMMAND.POLY_KEY_PRESSURE + this.getChannel(channel),
      key,
      velocity,
    ]);
  }

  sendControlChange(controller: number, value: number, channel?: number): void {
    // FIXME: channel mode check here
    return this.send([
      COMMAND.CONTROL_CHANGE + this.getChannel(channel),
      controller,
      value,
    ]);
  }

  sendProgramChange(program: number, channel?: number): void {
    return this.send([
      COMMAND.PROGRAM_CHANGE + this.getChannel(channel),
      program,
    ]);
  }

  sendChannelPressure(velocity: number, channel?: number): void {
    return this.send([
      COMMAND.CHANNEL_PRESSURE + this.getChannel(channel),
      velocity,
    ]);
  }

  sendPitchBend(bendValue: number, channel?: number): void {
    // Pitch bend destructuring here.
    if (bendValue > (1 << 16) - 1) {
      throw new Error("bendValue too big");
    }
    // FIXME: finish.
  }

  // Special Channel Modes
  sendAllSoundOff(channel?: number): void {
    return this.send([
      COMMAND.CONTROL_CHANGE + this.getChannel(channel),
      CHANNEL_MODE.ALL_SOUND_OFF,
      0,
    ]);
  }

  sendResetAllControllers(channel?: number): void {
    // v = x: Value must only be zero unless otherwise allowed in a specific Recommended Practice.
    return this.send([
      COMMAND.CONTROL_CHANGE + this.getChannel(channel),
      CHANNEL_MODE.RESET_ALL_CONTROLLERS,
      0,
    ]);
  }

  sendLocalControlOff(channel?: number): void {
    return this.send([
      COMMAND.CONTROL_CHANGE + this.getChannel(channel),
      CHANNEL_MODE.LOCAL_CONTROL,
      0,
    ]);
  }

  sendLocalControlOn(channel?: number): void {
    return this.send([
      COMMAND.CONTROL_CHANGE + this.getChannel(channel),
      CHANNEL_MODE.LOCAL_CONTROL,
      127,
    ]);
  }

  sendAllNotesOff(channel?: number): void {
    return this.send([
      COMMAND.CONTROL_CHANGE + this.getChannel(channel),
      CHANNEL_MODE.ALL_NOTES_OFF,
      0,
    ]);
  }
}
