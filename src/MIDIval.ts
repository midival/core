import {MIDIValInput} from "./MIDIValInput";
import {MIDIValOutput} from "./MIDIValOutput";

import {IMIDIInput} from "./wrappers/inputs/IMIDIInput";

import {MIDIAccess} from "./wrappers/access/MIDIAccess";
import {IMIDIOutput} from "./wrappers/outputs/IMIDIOutput";
import {IMIDIAccess} from "./wrappers/access/IMIDIAccess";
import { CallbackType, UnregisterCallback } from "@hypersphere/omnibus";

export interface ConfigScheme {
  name?: string | RegExp,
  manufacturer?: string | RegExp,
}

export const matchesConfig = (input: IMIDIInput | IMIDIOutput, scheme: ConfigScheme): boolean => {
  return Object.keys(scheme).reduce((acc, key) => {
    const val = scheme[key] as string | RegExp;
    if (typeof val === "string") {
      return acc && input[key] === val;
    } else {
      return acc && val.test(input[key]);
    }
  }, true);
}

export class MIDIVal {
  private static isSetup: boolean = false;
  private static accessObject: IMIDIAccess;

  /**
   * Allows to reconfigure access object to use project in different environment as the default one (browser): See @midival/node, @midival/react-native for more details.
   * @param newAccess Implementation of IMIDIAccess to be used to provide MIDI objects.
   */
  public static configureAccessObject(newAccess: IMIDIAccess): void {
    this.isSetup = false;
    this.accessObject = newAccess;
  }

  /**
   * Calls callback on every input device that gets connected.
   * @param callback Callback to be registered
   * @param callOnAlreadyConnected If set to true, the function will instantly trigger for all already connected devices. Default to false
   * @returns Promise resolving to unregister callback when finishes.
   */
  public static async onInputDeviceConnected(callback: CallbackType<[IMIDIInput]>, callOnAlreadyConnected: boolean = false): Promise<UnregisterCallback> {
    if (callOnAlreadyConnected) {
      this.accessObject.inputs.forEach(callback);
    }
    return this.accessObject.onInputConnected(callback);
  }
/**
 * Listens to all input devices with a certain config (like name or manufacturer). Configuration can be provided as a string or regex. The callback unlike `onInputDeviceConnected` accepts MIDIValInput. `onInputDeviceConnected` is suitable when you want to filter devices yourself, beyond this configuration object so it does not instantiate objects.
 * @param config Configuration object used to match with device connected
 * @param fn Callback on connection. Connection is already wrapped in MIDIValInput object
 * @returns Promise for Unregister Callback
 */
  public static async onInputDeviceWithConfigConnected(config: ConfigScheme, fn: (input: MIDIValInput) => void, callOnAlreadyConnected: boolean = false): Promise<UnregisterCallback> {
    return this.onInputDeviceConnected((input) => {
      if (matchesConfig(input, config)) {
        fn(new MIDIValInput(input));
      }
    }, callOnAlreadyConnected);
  }
  
/**
 * Listens to all output devices with a certain config (like name or manufacturer). Configuration can be provided as a string or regex. The callback unlike `onOutputDeviceConnected` accepts MIDIValOutput. `onOutputDeviceConnected` is suitable when you want to filter devices yourself, beyond this configuration object so it does not instantiate objects.
 * @param config Configuration object used to match with device connected
 * @param fn Callback on connection. Connection is already wrapped in MIDIValOutput object
 * @returns Promise for Unregister Callback
 */
  public static async onOutputDeviceWithConfigConnected(config: ConfigScheme, fn: (output: MIDIValOutput) => void, callOnAlreadyConnected: boolean = false): Promise<UnregisterCallback> {
    return this.onOutputDeviceConnected((output) => {
      if (matchesConfig(output, config)) {
        fn(new MIDIValOutput(output));
      }
    }, callOnAlreadyConnected);
  }

  /**
   * Calls callback on every output device that gets connected.
   * @param callback Callback to be registered
   * @param callOnAlreadyConnected If set to true, the function will instantly trigger for all already connected devices. Default to false
   * @returns Promise resolving to unregister callback when finishes.
   */
   public static async onOutputDeviceConnected(callback: CallbackType<[IMIDIOutput]>, callOnAlreadyConnected: boolean = false): Promise<UnregisterCallback> {
    if (callOnAlreadyConnected) {
      this.accessObject.outputs.forEach(callback);
    }
    return this.accessObject.onOutputConnected(callback);
  }

  /**
   * Regusters callback on an event of input device being disconnected.
   * @param callback Callback to be called.
   * @returns promise resolving to unregister callback
   */
  public static async onInputDeviceDisconnected(callback: CallbackType<[IMIDIInput]>): Promise<UnregisterCallback> {
    return this.accessObject.onInputDisconnected(callback);
  }

  /**
   * Regusters callback on an event of input device being disconnected.
   * @param callback Callback to be called.
   * @returns promise resolving to unregister callback
   */
   public static async onOutputDeviceDisconnected(callback: CallbackType<[IMIDIOutput]>): Promise<UnregisterCallback> {
    return this.accessObject.onOutputDisconnected(callback);
  }

  /**
   * Creates MIDIValInput instance from implementation of IMIDIInput interface.
   * @param input Implementation of IMIDIInput interface
   * @returns MIDIValInput object
   */
  public static fromMIDIInput(input: IMIDIInput): MIDIValInput {
    return new MIDIValInput(input);
  }

  /**
   * Creates MIDIValOutput instance from implementation of IMIDIOut interface
   * @param output Implementation of IMIDIOutput interface
   * @returns MIDIValOutput object
   */
  public static fromMIDIOutput(output: IMIDIOutput): MIDIValOutput {
    return new MIDIValOutput(output);
  }

  /**
   * Connects to MIDI interface and returns implementation of IMIDIAccess
   * @returns Promise resolving to IMIDIAccess
   */
  public static async connect(): Promise<IMIDIAccess> {
    await this.setupDeviceWatchers();
    return this.accessObject;
  }

  private static async setupDeviceWatchers() {
    if (this.isSetup) {
      return;
    }
    this.isSetup = true;

    if (!this.accessObject) {
      this.accessObject = new MIDIAccess();
    }

    await this.accessObject.connect();
  }
}
