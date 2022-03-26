import { CallbackType, Omnibus, OmnibusRegistrator, UnregisterCallback } from "@hypersphere/omnibus";
import {
  toMidiMessage,
  isChannelMode,
  MidiMessage,
} from "./utils/MIDIMessageConvert";
import {IMIDIInput} from "./wrappers/inputs/IMIDIInput";
import {MIDIVal} from "./index";
import {IMIDIAccess} from "./wrappers/access/IMIDIAccess";
import { splitValueIntoFraction } from "./utils/pitchBend";
import { MidiCommand } from "./utils/midiCommands";
import { MidiControlChange } from "./utils/midiControlChanges";
import { ticksToBPM } from "./utils/clock";
import { MIDIValConfigurationError, MIDIValError } from "./errors";
import { ControlChangeMessage, NoteMessage, ProgramChangeMessage, toControlChangeMessage, toNoteMessage, toProgramMessage } from "./types/messages";


interface EventDefinitions {
  'pitchBend': [number],
  'sysex': [Uint8Array],
  'channelPressure': [MidiMessage],
  'noteOn': [NoteMessage],
  'noteOff': [NoteMessage],
  'controlChange': [ControlChangeMessage],
  'programChange': [ProgramChangeMessage],
  'polyKeyPressure': [MidiMessage],

  'clockPulse': [],
  'clockStart': [],
  'clockStop': [],
  'clockContinue': [],
}

const TEMPO_SAMPLES_LIMIT = 20;

/**
 * MIDIVal Input Configuration Options
 */
export interface MIDIValInputOptions {
  computeClockTempo: boolean,
}

const DefaultOptions: MIDIValInputOptions = {
  computeClockTempo: false,
};

export class MIDIValInput {
  private unregisterInput: UnregisterCallback;
  private omnibus: Omnibus<EventDefinitions>;

  private midiInput: IMIDIInput;

  private tempoSamples: number[];
  private options: MIDIValInputOptions

  constructor(input: IMIDIInput, options: MIDIValInputOptions = DefaultOptions) {
    this.omnibus = new Omnibus<EventDefinitions>();
    this.tempoSamples = [];
    this.registerInput(input);
    this.options = options;
  }

  /**
   * Returns new MIDIValInput object based on the interface id.
   * @param interfaceId id of the interface from the MIDIAcces object. 
   * @throws MIDIValError when interface id is not found.
   * @returns Promise resolving to MIDIValInput.
   */
  static async fromInterfaceId(interfaceId: string, options?: MIDIValInputOptions): Promise<MIDIValInput> {
    const midiAccess = await this.getMidiAccess();
    const input = midiAccess.inputs.find(({ id }) => id === interfaceId);
    if (!input) {
      throw new MIDIValError(`${interfaceId} not found`);
    }
    return new MIDIValInput(input, options);
  }
/**
 * Finds first interface matching the name
 * @param interfaceName interface Name
 * @param options input configuration options
 * @throws MIDIValError when no interface with that name is found
 * @returns MIDIValInput object
 */
  static async fromInterfaceName(interfaceName: string, options?: MIDIValInputOptions): Promise<MIDIValInput> {
    const midiAccess = await this.getMidiAccess();
    const input = midiAccess.inputs.find(({ name }) => name === interfaceName);
    if (!input) {
      throw new MIDIValError(`${interfaceName} not found`);
    }
    return new MIDIValInput(input, options);
  }

  private static async getMidiAccess(): Promise<IMIDIAccess> {
    const midiAccess: IMIDIAccess = await MIDIVal.connect();
    return midiAccess;
  }

  /**
   * Current MIDI Clock tempo
   * @throws MIDIValConfigurationError when computeClockTempo is not on.
   * @returns current tempo in BPM.
   */
  public get tempo(): number {
    if (!this.options.computeClockTempo) {
      throw new MIDIValConfigurationError("To use MIDIValInput.tempo you need to enable computeClockTempo option.");
    }
    return ticksToBPM(this.tempoSamples);
  }

  private async registerInput(input: IMIDIInput): Promise<void> {
    this.midiInput = input;
    this.unregisterInput = await input.onMessage(
      (e: WebMidi.MIDIMessageEvent) => {
        if (e.data[0] === 0xf0) {
          // sysex
          this.omnibus.trigger('sysex', e.data);
          return;
        }
        if (this.isClockCommand(e)) {
          return;
        }
        const midiMessage = toMidiMessage(e.data);
        switch (midiMessage.command) {
          case MidiCommand.NoteOn:
            this.omnibus.trigger('noteOn', toNoteMessage(midiMessage));
            break;
          case MidiCommand.NoteOff:
            this.omnibus.trigger('noteOff', toNoteMessage(midiMessage));
            break;
          case MidiCommand.ControlChange:
            this.omnibus.trigger('controlChange', toControlChangeMessage(midiMessage));
            break;
          case MidiCommand.ProgramChange:
            this.omnibus.trigger('programChange', toProgramMessage(midiMessage));
            break;
          case MidiCommand.PolyKeyPressure:
            this.omnibus.trigger('polyKeyPressure', midiMessage);
            break;
          case MidiCommand.PitchBend:
            this.omnibus.trigger('pitchBend', splitValueIntoFraction([midiMessage.data1, midiMessage.data2]));
            break;
          default:
            // TODO: Unknown message.
            console.log('unknown msg', midiMessage);
            break;
        }
      }
    );

    if (this.options.computeClockTempo) {
      this.onClockPulse(() => {
        // compute time 
        this.tempoSamples.push(performance.now());
        if (this.tempoSamples.length > TEMPO_SAMPLES_LIMIT) {
          this.tempoSamples.shift();
        }
      });

      const resetSamples = () => {
        this.tempoSamples = [];
      };

      this.onClockContinue(resetSamples);
      this.onClockStart(resetSamples);
    }
  }

  private isClockCommand(e: WebMidi.MIDIMessageEvent): boolean {
    switch (e.data[0]) {
      case MidiCommand.Clock.Pulse:
        this.omnibus.trigger('clockPulse');
        return true;
      case MidiCommand.Clock.Start:
        this.omnibus.trigger('clockStart');
        return true;
      case MidiCommand.Clock.Continue:
        this.omnibus.trigger('clockContinue');
        return true;
      case MidiCommand.Clock.Stop:
        this.omnibus.trigger('clockStop');
        return true;
      default:
        return false;
    }
  }

  private onBusKeyValue<K extends keyof EventDefinitions>(event: K, key: keyof EventDefinitions[K][0], value: EventDefinitions[K][0][keyof EventDefinitions[K][0]], callback: (obj: EventDefinitions[K][0]) => void) {
    return this.omnibus.on(event, (...args) => {
      if (!args.length) {
        return;
      }
      const obj: EventDefinitions[K][0] = args[0];
      // FIXME: how to do it so we have multiple args?
      if (obj[key] === value) {
        callback(obj);
      }
    })
  }

  /**
   * Disconnects all listeners.
   */
  public disconnect(): void {
    this.omnibus.offAll();
    if (this.unregisterInput) {
      this.unregisterInput();
    }
  }

  /**
   * Registers new callback on every note on event.
   * @param callback Callback that will get called on each note on event. 
   * @returns Callback to unregister.
   */
  onAllNoteOn(callback: CallbackType<[NoteMessage]>): UnregisterCallback {
    return this.omnibus.on('noteOn', callback);
  }

  /**
   * Registers new callback on specific note on event.
   * @param key the key number
   * @param callback Callback that gets called on every note on on this specific key
   * @returns Callback to unregister.
   */
  onNoteOn(key: number, callback: CallbackType<[NoteMessage]>): UnregisterCallback {
    return this.omnibus.on('noteOn', (midiMessage) => {
      if (midiMessage.note !== key) {
        return;
      }
      return callback(midiMessage);
    });
  }

  /**
   * Registers new callback on all notes off.
   * @param callback Callback that gets called on every note off.
   * @returns Unregister callback
   */
  onAllNoteOff(callback: CallbackType<[NoteMessage]>): UnregisterCallback {
    return this.omnibus.on('noteOff', callback);
  }

    /**
   * Registers new callback on specific note off.
   * @param key key number
   * @param callback Callback that gets called on every note off on this specific key
   * @returns Unregister callback
   */
     onNoteOff(key: number, callback: CallbackType<[NoteMessage]>): UnregisterCallback {
       return this.onBusKeyValue('noteOff', 'note', key, callback);
    }

  /**
   * Registers new callback on pitch bend message
   * @param callback Callback that gets called on every pitch bend message. It gets value of the bend in the range of -1.0 to 1.0 using 16-bit precision (if supported by sending device).
   * @returns Unregister callback.
   */
  onPitchBend(callback: CallbackType<[number]>): UnregisterCallback {
    return this.omnibus.on('pitchBend', callback);
  }

  /**
   * Registers callback on every control change message
   * @param callback Callback that will get called on control change.
   * @returns Unregister callback.
   */
  onAllControlChange(callback: CallbackType<[ControlChangeMessage]>): UnregisterCallback {
    return this.omnibus.on('controlChange', callback);
  }

  /**
   * Registers callback on specific control change key.
   * @param channel Control change channel value
   * @param callback Callback to be called
   * @returns Unregister function
   */
  onControlChange(control: number, callback: CallbackType<[MidiMessage]>): UnregisterCallback {
    if (isChannelMode(control)) {
      console.warn(
        "use designated Channel Mode callback instead of onControlChange for " +
        control
      );
    }
    return this.omnibus.on('controlChange', (m) => {
      if (m.control !== control) {
        return;
      }
      callback(m);
    })
  }

  /**
   * Registers callback to be called on every program change event
   * @param callback Callback to be called
   * @returns Unregister function.
   */
  onAllProgramChange(callback: CallbackType<[ProgramChangeMessage]>): UnregisterCallback {
    return this.omnibus.on('programChange', callback);
  }

  /**
   * Registers callback to be called on specific program change
   * @param key Program value for key change
   * @param callback Callback to be called
   * @returns Unregister function
   */
  onProgramChange(program: number, callback: CallbackType<[ProgramChangeMessage]>): UnregisterCallback {
    return this.onBusKeyValue('programChange', 'program', program, callback);
  }

  /**
   * Registers callback on all poly key pressure events
   * @param callback Callback to be called
   * @returns Unregister function
   */
  onAllPolyKeyPressure(callback: CallbackType<[MidiMessage]>): UnregisterCallback {
    return this.omnibus.on('polyKeyPressure', callback);
  }

  /**
   * Registers callback on specific poly key pressure event
   * @param key Key for poly key pressure
   * @param callback Callback to be called
   * @returns Unregister function
   */
  onPolyKeyPressure(key: number, callback: CallbackType<[MidiMessage]>): UnregisterCallback {
    return this.onBusKeyValue('polyKeyPressure', 'data1', key, callback);
  }

  /**
   * Registers callback on sysex message
   * @param callback Callback to be called
   * @returns Unregister callback
   */
  onSysex(callback: CallbackType<[Uint8Array]>): UnregisterCallback {
    return this.omnibus.on('sysex', callback);
  }

  /**
   * Registers callback on all sounds off event
   * @param callback Callback to be called
   * @returns Unregister callback
   */
  onAllSoundsOff(callback: CallbackType<[ControlChangeMessage]>): UnregisterCallback {
    return this.onBusKeyValue('controlChange', 'control', MidiControlChange.AllSoundsOff, callback);
  }

  /**
   * Registers callback on reset all controllers event
   * @param callback Callback to be called
   * @returns Unregister callback
   */
  onResetAllControllers(callback: CallbackType<[ControlChangeMessage]>): UnregisterCallback {
    return this.onBusKeyValue('controlChange', 'control', MidiControlChange.ResetAllControllers, callback);
  }

  /**
   * Registers callback on local control change event
   * @param callback Callback to be called: first argument to the callback is a boolean representing if the local control was set on or off
   * @returns Unregister event
   */
  onLocalControlChange(callback: CallbackType<[isLocalControlOn: boolean, message: ControlChangeMessage]>): UnregisterCallback {
    return this.onBusKeyValue('controlChange', 'control', MidiControlChange.LocalControlOnOff, (m) => {
      callback(m.data2 === 127, m);
    });
  }

  /**
   * Registers callback on all notes off
   * @param callback Callback to be called
   * @returns Unregister callback
   */
  onAllNotesOff(callback: CallbackType<[MidiMessage]>): UnregisterCallback {
    return this.onBusKeyValue('controlChange', 'control', MidiControlChange.AllNotesOff, callback);
  }

  onOmniModeOff(callback: CallbackType<[MidiMessage]>): UnregisterCallback {
    return this.onBusKeyValue('controlChange', 'control', MidiControlChange.OmniModeOff, callback);
  }

  onOmniModeOn(callback: CallbackType<[MidiMessage]>): UnregisterCallback {
    return this.onBusKeyValue('controlChange', 'control', MidiControlChange.OmniModeOn, callback);
  }

  onMonoModeOn(callback: CallbackType<[MidiMessage]>): UnregisterCallback {
    return this.onBusKeyValue('controlChange', 'control', MidiControlChange.MonoModeOn, callback);
  }

  onPolyModeOn(callback: CallbackType<[MidiMessage]>): UnregisterCallback {
    return this.onBusKeyValue('controlChange', 'control', MidiControlChange.PolyModeOn, callback);
  }

  onClockPulse(callback: CallbackType<[]>): UnregisterCallback {
    return this.omnibus.on('clockPulse', callback);
  }

  onClockStart(callback: CallbackType<[]>): UnregisterCallback {
    return this.omnibus.on('clockStart', callback);
  }

  onClockStop(callback: CallbackType<[]>): UnregisterCallback {
    return this.omnibus.on('clockStop', callback);
  }

  onClockContinue(callback: CallbackType<[]>): UnregisterCallback {
    return this.omnibus.on('clockContinue', callback);
  }
}
