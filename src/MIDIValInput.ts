import { MessageBus, Callback, UnregisterCallback } from "./MessageBus";
import {MultiMessageBus} from "./MultiMessageBus";
import {
  toMidiMessage,
  logMessage,
  COMMAND,
  CHANNEL_MODE,
  isChannelMode,
  MidiMessage,
} from "./utils/MIDIMessageConvert";
import {IMIDIInput} from "./wrappers/inputs/IMIDIInput";
import {MIDIVal} from "./index";
import {IMIDIAccess} from "./wrappers/access/IMIDIAccess";
import { splitValueIntoFraction } from "./utils/pitchBen";

interface Buses {
  noteOn: MultiMessageBus<number, [MidiMessage]>,
  noteOff: MultiMessageBus<number, [MidiMessage]>,
  controlChange: MultiMessageBus<number, [MidiMessage]>,
  programChange: MultiMessageBus<number, [MidiMessage]>,
  polyKeyPressure: MultiMessageBus<number, [MidiMessage]>,
  channelPressure: MessageBus<[MidiMessage]>,
  pitchBend: MessageBus<[number]>,
  sysex: MessageBus<[Uint8Array]>
}

export class MIDIValInput {
  private midiInput: IMIDIInput;
  private unregisterInput: UnregisterCallback;
  private buses: Buses;

  private buildBuses(): void {
    this.buses = {
      noteOn: new MultiMessageBus<number, [MidiMessage]>("noteOn"),
      noteOff: new MultiMessageBus<number, [MidiMessage]>("noteOff"),
      controlChange: new MultiMessageBus<number, [MidiMessage]>("controlChange"),
      programChange: new MultiMessageBus<number, [MidiMessage]>("programChange"),
      polyKeyPressure: new MultiMessageBus<number, [MidiMessage]>("polyKeyPressure"),
      channelPressure: new MessageBus<[MidiMessage]>("channelPressure"),
      pitchBend: new MessageBus<[number]>("pitchBend"),
      sysex: new MessageBus<[Uint8Array]>("sysex"),
    };
  }

  constructor(input: IMIDIInput) {
    this.buildBuses();
    this.registerInput(input);
  }

  /**
   * Returns new MIDIValInput object based on the interface id.
   * @param interfaceId id of the interface from the MIDIAcces object. 
   * @returns Promise resolving to MIDIValInput.
   */
  static async fromInterfaceId(interfaceId: string): Promise<MIDIValInput> {
    const midiAccess = await this.getMidiAccess();
    const input = midiAccess.inputs.find(({ id }) => id === interfaceId);
    if (!input) {
      throw new Error(`${interfaceId} not found`);
    }
    return new MIDIValInput(input);
  }

  static async fromInterfaceName(interfaceName: string): Promise<MIDIValInput> {
    const midiAccess = await this.getMidiAccess();
    const input = midiAccess.inputs.find(({ name }) => name === interfaceName);
    if (!input) {
      throw new Error(`${interfaceName} not found`);
    }
    return new MIDIValInput(input);
  }

  private static async getMidiAccess(): Promise<IMIDIAccess> {
    const midiAccess: IMIDIAccess = await MIDIVal.connect();
    return midiAccess;
  }

  private async registerInput(input: IMIDIInput): Promise<void> {
    this.midiInput = input;
    this.unregisterInput = await input.onMessage(
      (e: WebMidi.MIDIMessageEvent) => {
        logMessage(toMidiMessage(e.data));
        if (e.data[0] === 0xf0) {
          // sysex
          this.buses.sysex.trigger(e.data);
          return;
        }
        const midiMessage = toMidiMessage(e.data);
        switch (midiMessage.command) {
          case COMMAND.NOTE_ON:
            this.buses.noteOn.trigger(
              midiMessage.data1,
              midiMessage
            );
            break;
          case COMMAND.NOTE_OFF:
            this.buses.noteOff.trigger(
              midiMessage.data1,
              midiMessage
            );
            break;
          case COMMAND.CONTROL_CHANGE:
            this.buses.controlChange.trigger(
              midiMessage.data1,
              midiMessage
            );
            break;
          case COMMAND.PROGRAM_CHANGE:
            this.buses.programChange.trigger(
              midiMessage.data1,
              midiMessage
            );
            break;
          case COMMAND.POLY_KEY_PRESSURE:
            this.buses.polyKeyPressure.trigger(
              midiMessage.data1,
              midiMessage
            );
            break;
          case COMMAND.PITCH_BEND:
            this.buses.pitchBend.trigger(
              splitValueIntoFraction([midiMessage.data1, midiMessage.data2])
            )

          default:
            // TODO: Unknown message.
            break;
        }
      }
    );
  }

  /**
   * Disconnects all listeners.
   */
  public disconnect(): void {
    for (const key of Object.keys(this.buses)) {
      this.buses[key].offAll();
    }
    if (this.unregisterInput) {
      this.unregisterInput();
    }
  }

  /**
   * Registers new callback on every note on event.
   * @param callback Callback that will get called on each note on event. 
   * @returns Callback to unregister.
   */
  onAllNoteOn(callback: Callback<[number, MidiMessage]>): UnregisterCallback {
    return this.buses.noteOn.onAll(callback);
  }

  /**
   * Registers new callback on specific note on event.
   * @param key the key number
   * @param callback Callback that gets called on every note on on this specific key
   * @returns Callback to unregister.
   */
  onNoteOn(key: number, callback: Callback<[MidiMessage]>): UnregisterCallback {
    return this.buses.noteOn.on(key, callback);
  }

  /**
   * Registers new callback on all notes off.
   * @param callback Callback that gets called on every note off.
   * @returns Unregister callback
   */
  onAllNoteOff(callback: Callback<[number, MidiMessage]>): UnregisterCallback {
    return this.buses.noteOff.onAll(callback);
  }

  /**
   * Registers new callback on pitch bend message
   * @param callback Callback that gets called on every pitch bend message. It gets value of the bend in the range of -1.0 to 1.0 using 16-bit precision (if supported by sending device).
   * @returns Unregister callback.
   */
  onPitchBend(callback: Callback<[number]>): UnregisterCallback {
    return this.buses.pitchBend.on(callback);
  }

  /**
   * Registers new callback on specific note off.
   * @param key key number
   * @param callback Callback that gets called on every note off on this specific key
   * @returns Unregister callback
   */
  onNoteOff(key: number, callback: Callback<[MidiMessage]>): UnregisterCallback {
    return this.buses.noteOff.on(key, callback);
  }

  /**
   * Registers callback on every control change message
   * @param callback Callback that will get called on control change.
   * @returns Unregister callback.
   */
  onAllControlChange(callback: Callback<[number, MidiMessage]>): UnregisterCallback {
    return this.buses.controlChange.onAll(callback);
  }

  /**
   * Registers callback on specific control change key.
   * @param key Control change key value
   * @param callback Callback to be called
   * @returns Unregister function
   */
  onControlChange(key: number, callback: Callback<[MidiMessage]>): UnregisterCallback {
    if (isChannelMode(key)) {
      console.warn(
        "use designated Channel Mode callback instead of onControlChange for " +
          key
      );
    }
    return this.buses.controlChange.on(key, callback);
  }

  /**
   * Registers callback to be called on every program change event
   * @param callback Callback to be called
   * @returns Unregister function.
   */
  onAllProgramChange(callback: Callback<[number, MidiMessage]>): UnregisterCallback {
    return this.buses.programChange.onAll(callback);
  }

  /**
   * Registers callback to be called on specific program change
   * @param key Program value for key change
   * @param callback Callback to be called
   * @returns Unregister function
   */
  onProgramChange(key: number, callback: Callback<[MidiMessage]>): UnregisterCallback {
    return this.buses.programChange.on(key, callback);
  }

  /**
   * Registers callback on all poly key pressure events
   * @param callback Callback to be called
   * @returns Unregister function
   */
  onAllPolyKeyPressure(callback: Callback<[number, MidiMessage]>): UnregisterCallback {
    return this.buses.polyKeyPressure.onAll(callback);
  }

  /**
   * Registers callback on specific poly key pressure event
   * @param key Key for poly key pressure
   * @param callback Callback to be called
   * @returns Unregister function
   */
  onPolyKeyPressure(key: number, callback: Callback<[MidiMessage]>): UnregisterCallback {
    return this.buses.polyKeyPressure.on(key, callback);
  }

  /**
   * Registers callback on sysex message
   * @param callback Callback to be called
   * @returns Unregister callback
   */
  onSysex(callback: Callback<[Uint8Array]>): UnregisterCallback {
    return this.buses.sysex.on(callback);
  }

  /**
   * Registers callback on all sounds off event
   * @param callback Callback to be called
   * @returns Unregister callback
   */
  onAllSoundsOff(callback: Callback<[MidiMessage]>): UnregisterCallback {
    return this.buses.controlChange.on(
      CHANNEL_MODE.ALL_SOUND_OFF,
      callback
    );
  }

  /**
   * Registers callback on reset all controllers event
   * @param callback Callback to be called
   * @returns Unregister callback
   */
  onResetAllControllers(callback: Callback<[MidiMessage]>): UnregisterCallback {
    return this.buses.controlChange.on(
      CHANNEL_MODE.RESET_ALL_CONTROLLERS,
      callback
    );
  }

  /**
   * Registers callback on local control change event
   * @param callback Callback to be called
   * @returns Unregister event
   */
  onLocalControlChange(callback: Callback<[MidiMessage]>): UnregisterCallback {
    // FIXME: Maybe split this into two separate callbacks?
    return this.buses.controlChange.on(
      CHANNEL_MODE.LOCAL_CONTROL,
      callback
    );
  }

  /**
   * Registers callback on all notes off
   * @param callback Callback to be called
   * @returns Unregister callback
   */
  onAllNotesOff(callback: Callback<[MidiMessage]>): UnregisterCallback {
    return this.buses.controlChange.on(
      CHANNEL_MODE.ALL_NOTES_OFF,
      callback
    );
  }

  // OMNI MODE Off

  // OMNI MODE ON

  // MONO_MODE_ON

  // Poly ON
}
