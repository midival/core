import MessageBus, { Callback, UnregisterCallback } from "./MessageBus";
import MultiMessageBus from "./MultiMessageBus";
import toMidiMessage, {
  logMessage,
  COMMAND,
  CHANNEL_MODE,
  isChannelMode,
} from "./utils/MIDIMessageConvert";
import IMIDIInput from "./wrappers/inputs/IMIDIInput";
import MIDIVal from "./index";
import IMIDIAccess from "./wrappers/access/IMIDIAccess";

export default class MIDIValInput {
  private midiInput: IMIDIInput;
  private unregisterInput: UnregisterCallback;
  private buses: any;

  private buildBuses(): void {
    this.buses = {
      noteOn: new MultiMessageBus("noteOn"),
      noteOff: new MultiMessageBus("noteOff"),
      controlChange: new MultiMessageBus("controlChange"),
      programChange: new MultiMessageBus("programChange"),
      polyKeyPressure: new MultiMessageBus("polyKeyPressure"),
      channelPressure: new MessageBus("channelPressure"),
      sysex: new MessageBus("sysex"),
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
              midiMessage.data1.toString(),
              midiMessage
            );
            break;
          case COMMAND.NOTE_OFF:
            this.buses.noteOff.trigger(
              midiMessage.data1.toString(),
              midiMessage
            );
            break;
          case COMMAND.CONTROL_CHANGE:
            this.buses.controlChange.trigger(
              midiMessage.data1.toString(),
              midiMessage
            );
            break;
          case COMMAND.PROGRAM_CHANGE:
            this.buses.programChange.trigger(
              midiMessage.data1.toString(),
              midiMessage
            );
            break;
          case COMMAND.POLY_KEY_PRESSURE:
            this.buses.polyKeyPressure.trigger(
              midiMessage.data1.toString(),
              midiMessage
            );
            break;

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
  onAllNoteOn(callback: Callback): UnregisterCallback {
    return this.buses.noteOn.onAll(callback);
  }

  /**
   * Registers new callback on specific note on event.
   * @param key string representation of the key number (To be reworked to number in future version)
   * @param callback Callback that gets called on every note on on this specific key
   * @returns Callback to unregister.
   */
  onNoteOn(key: string, callback: Callback): UnregisterCallback {
    return this.buses.noteOn.on(key, callback);
  }

  onAllNoteOff(callback: Callback): UnregisterCallback {
    return this.buses.noteOff.onAll(callback);
  }

  onNoteOff(key: string, callback: Callback): UnregisterCallback {
    return this.buses.noteOff.on(key, callback);
  }

  onAllControlChange(callback: Callback): UnregisterCallback {
    return this.buses.controlChange.onAll(callback);
  }

  onControlChange(key: number, callback: Callback): UnregisterCallback {
    if (isChannelMode(key)) {
      console.warn(
        "use designated Channel Mode callback instead of onControlChange for " +
          key
      );
    }
    return this.buses.controlChange.on(String(key), callback);
  }

  onAllProgramChange(callback: Callback): UnregisterCallback {
    return this.buses.programChange.onAll(callback);
  }

  onProgramChange(key: string, callback: Callback): UnregisterCallback {
    return this.buses.programChange.on(key, callback);
  }

  onAllPolyKeyPressure(callback: Callback): UnregisterCallback {
    return this.buses.polyKeyPressure.onAll(callback);
  }

  onPolyKeyPressure(key: string, callback: Callback): UnregisterCallback {
    return this.buses.polyKeyPressure.on(key, callback);
  }

  onSysex(callback: Callback): UnregisterCallback {
    return this.buses.sysex.on(callback);
  }

  onAllSoundsOff(callback: Callback): UnregisterCallback {
    return this.buses.controlChange.on(
      String(CHANNEL_MODE.ALL_SOUND_OFF),
      callback
    );
  }

  onResetAllControllers(callback: Callback): UnregisterCallback {
    return this.buses.controlChange.on(
      String(CHANNEL_MODE.RESET_ALL_CONTROLLERS),
      callback
    );
  }

  // FIXME: Maybe split this into two separate callbacks?
  onLocalControlChange(callback: Callback): UnregisterCallback {
    return this.buses.controlChange.on(
      String(CHANNEL_MODE.LOCAL_CONTROL),
      callback
    );
  }

  onAllNotesOff(callback: Callback): UnregisterCallback {
    return this.buses.controlChange.on(
      String(CHANNEL_MODE.ALL_NOTES_OFF),
      callback
    );
  }

  // OMNI MODE Off

  // OMNI MODE ON

  // MONO_MODE_ON

  // Poly ON
}
