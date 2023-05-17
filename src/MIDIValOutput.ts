import { IMIDIOutput } from "./wrappers/outputs/IMIDIOutput";
import { MIDIVal } from "./index";
import { IMIDIAccess } from "./wrappers/access/IMIDIAccess";
import { fractionToPitchBendAsUints } from "./utils/pitchBend";
import { MidiCommand } from "./utils/midiCommands";
import { MidiControlChange } from "./utils/midiControlChanges";
import { MIDIRegisteredParameters } from "./utils/midiRegisteredParameters";

export class MIDIValOutput {
  private midiOutput: IMIDIOutput;
  private defaultChannel: number;
  constructor(output: IMIDIOutput) {
    this.midiOutput = output;
    this.defaultChannel = 1;
  }

  /**
   * Sends raw message to MIDI out
   * @param msgs Message as an array of UInt8 values
   * @returns
   */
  send(msgs: Uint8Array | number[]): void {
    if (!this.midiOutput) {
      return;
    }
    this.midiOutput.send(msgs);
  }

  /**
   * Changes default channel the messages are sent on
   * @param channel Channel value. Integer between 1 and 16
   */
  setChannel(channel: number): void {
    this.defaultChannel = channel;
  }

  private getChannel(channel?: number) {
    if (!channel) {
      return this.defaultChannel - 1;
    }
    return channel - 1;
  }

  /**
   * Creates MIDIValOutput based on the interface name
   * @param interfaceName Name of the interface
   * @returns MIDIValOutput object
   */
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

  /**
   * Sends note on message
   * @param note Note key value to be sent.
   * @param velocity Velocity - number between 0 and 128
   * @param channel Channel. By default will use channel set by setChannel method
   * @returns
   */
  sendNoteOn(note: number, velocity: number, channel?: number): void {
    return this.send([
      MidiCommand.NoteOn + this.getChannel(channel),
      note,
      velocity,
    ]);
  }

  /**
   * Sends note off message.
   * @param note Note key to be set off
   * @param channel Channel. By default will use channel set by setChannel method
   * @returns
   */
  sendNoteOff(note: number, channel?: number): void {
    return this.send([MidiCommand.NoteOff + this.getChannel(channel), note, 0]);
  }

  sendPolyKeyPressure(key: number, velocity: number, channel?: number): void {
    return this.send([
      MidiCommand.PolyKeyPressure + this.getChannel(channel),
      key,
      velocity,
    ]);
  }

  sendControlChange(controller: number, value: number, channel?: number): void {
    // FIXME: channel mode check here
    return this.send([
      MidiCommand.ControlChange + this.getChannel(channel),
      controller,
      value,
    ]);
  }

  sendProgramChange(program: number, channel?: number): void {
    return this.send([
      MidiCommand.ProgramChange + this.getChannel(channel),
      program,
    ]);
  }

  sendChannelPressure(velocity: number, channel?: number): void {
    return this.send([
      MidiCommand.ChannelPressure + this.getChannel(channel),
      velocity,
    ]);
  }

  /**
   * Sends pitch bend value.
   * @param bendValue Ben value ranging from -1.0 to 1.0.
   * @param channel Optional channel on which bend should be sent on
   * @returns
   * @throws Throws exception if bendValue is outside the range.
   */
  sendPitchBend(bendValue: number, channel?: number): void {
    return this.send(
      new Uint8Array([
        MidiCommand.PitchBend + this.getChannel(channel),
        ...fractionToPitchBendAsUints(bendValue),
      ])
    );
  }

  // Special Channel Modes
  sendAllSoundOff(channel?: number): void {
    return this.send([
      MidiCommand.ControlChange + this.getChannel(channel),
      MidiControlChange.AllSoundsOff,
      0,
    ]);
  }

  sendResetAllControllers(channel?: number): void {
    // v = x: Value must only be zero unless otherwise allowed in a specific Recommended Practice.
    return this.send([
      MidiCommand.ControlChange + this.getChannel(channel),
      MidiControlChange.ResetAllControllers,
      0,
    ]);
  }

  sendLocalControlOff(channel?: number): void {
    return this.send([
      MidiCommand.ControlChange + this.getChannel(channel),
      MidiControlChange.LocalControlOnOff,
      0,
    ]);
  }

  sendLocalControlOn(channel?: number): void {
    return this.send([
      MidiCommand.ControlChange + this.getChannel(channel),
      MidiControlChange.LocalControlOnOff,
      127,
    ]);
  }

  sendAllNotesOff(channel?: number): void {
    return this.send([
      MidiCommand.ControlChange + this.getChannel(channel),
      MidiControlChange.AllNotesOff,
      0,
    ]);
  }

  sendClockStart(): void {
    return this.send([MidiCommand.Clock.Start]);
  }

  sendClockStop(): void {
    return this.send([MidiCommand.Clock.Stop]);
  }

  sendClockContinue(): void {
    return this.send([MidiCommand.Clock.Continue]);
  }

  sendClockPulse(): void {
    return this.send([MidiCommand.Clock.Pulse]);
  }

  // RPN
  sendRPNSelection([msb, lsb]: readonly [number, number], channel?: number) {
    this.sendControlChange(MidiControlChange.RegisteredParameterNumberMSB, msb, channel)
    this.sendControlChange(MidiControlChange.RegisteredParameterNumberLSB, lsb, channel)
  }

  sendRPDataMSB(data: number, channel?: number) {
    this.sendControlChange(MidiControlChange.DataEntryMSB, data, channel)
  }

  sendRPDataLSB(data: number, channel?: number) {
    this.sendControlChange(MidiControlChange.DataEntryLSB, data, channel)
  }

  incrementRPData(incrementValue: number, channel?: number) {
    this.sendControlChange(MidiControlChange.DataIncrement, incrementValue, channel)
  }

  decrementRPData(decrementValue: number, channel?: number) {
    this.sendControlChange(MidiControlChange.DataDecrement, decrementValue, channel)
  }

  sendRPNNull() {
  }

  initializeMPE(lowerChannelSize: number, upperChannelSize: number) {
    this.sendRPNSelection(MIDIRegisteredParameters.MPE_CONFIGURATION_MESSAGE, 1)
    this.sendRPDataMSB(lowerChannelSize, 1)
    this.sendRPDataMSB(upperChannelSize, 16)
    this.sendRPNNull()
  }

  setPitchBendSensitivity(semitones: number, cents: number, channel?: number) {
    // FIXME: probably calculate it here?
    this.sendRPNSelection(MIDIRegisteredParameters.PITCH_BEND_SENSITIVITY, channel)
    this.sendRPDataMSB(semitones, channel)
    this.sendRPNNull()
  }
}
