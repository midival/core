import { MessageBus, Callback, UnregisterCallback } from "./MessageBus";
import {MIDIValInput} from "./MIDIValInput";
import {MIDIValOutput} from "./MIDIValOutput";

import {IMIDIInput} from "./wrappers/inputs/IMIDIInput";

import {MIDIAccess} from "./wrappers/access/MIDIAccess";
import {IMIDIOutput} from "./wrappers/outputs/IMIDIOutput";
import {IMIDIAccess} from "./wrappers/access/IMIDIAccess";

type StaticBuses = {
  inputDeviceConnected: MessageBus<[IMIDIInput]>;
  inputDeviceDisconnected: MessageBus<[IMIDIInput]>;
  outputDeviceConnected: MessageBus<[IMIDIOutput]>;
  outputDeviceDisconnected: MessageBus<[IMIDIOutput]>;
};

export class MIDIVal {
  private static staticBuses: StaticBuses = {
    inputDeviceConnected: new MessageBus<[IMIDIInput]>("inputDeviceConnected"),
    inputDeviceDisconnected: new MessageBus<[IMIDIInput]>("inputDeviceDisconnected"),
    outputDeviceConnected: new MessageBus<[IMIDIOutput]>("outputDeviceConnected"),
    outputDeviceDisconnected: new MessageBus<[IMIDIOutput]>("outputDeviceDisconnected"),
  };

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
   * @param fn Callback to be registered
   * @param callOnAlreadyConnected If set to true, the function will instantly trigger for all already connected devices. Default to false
   * @returns Promise resolving to unregister callback when finishes.
   */
  public static async onInputDeviceConnected(fn: Callback<[IMIDIInput]>, callOnAlreadyConnected: boolean = false): Promise<UnregisterCallback> {
    await this.setupDeviceWatchers();
    const unregister = this.staticBuses.inputDeviceConnected.on(fn);

    if (!callOnAlreadyConnected) {
      return unregister;
    }

    // rework later.
    for (const input of this.accessObject.inputs) {
      fn(input);
    }

    return unregister;
  }

  /**
   * Calls callback on every output device that gets connected.
   * @param fn Callback to be registered
   * @param callOnAlreadyConnected If set to true, the function will instantly trigger for all already connected devices. Default to false
   * @returns Promise resolving to unregister callback when finishes.
   */
   public static async onOutputDeviceConnected(fn: Callback<[IMIDIOutput]>, callOnAlreadyConnected: boolean = false): Promise<UnregisterCallback> {
    await this.setupDeviceWatchers();
    const unregister = this.staticBuses.outputDeviceConnected.on(fn);

    if (!callOnAlreadyConnected) {
      return unregister;
    }

    // rework later.
    for (const output of this.accessObject.outputs) {
      fn(output);
    }

    return unregister;
  }

  /**
   * Regusters callback on an event of input device being disconnected.
   * @param fn Callback to be called.
   * @returns promise resolving to unregister callback
   */
  public static async onInputDeviceDisconnected(fn: Callback<[IMIDIInput]>): Promise<UnregisterCallback> {
    const unregister = this.staticBuses.inputDeviceConnected.on(fn);
    await this.setupDeviceWatchers();
    return unregister;
  }

  /**
   * Regusters callback on an event of input device being disconnected.
   * @param fn Callback to be called.
   * @returns promise resolving to unregister callback
   */
   public static async onOutputDeviceDisconnected(fn: Callback<[IMIDIOutput]>): Promise<UnregisterCallback> {
    const unregister = this.staticBuses.outputDeviceDisconnected.on(fn);
    await this.setupDeviceWatchers();
    return unregister;
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

    const access = await this.accessObject.connect();

    for (const input of this.accessObject.inputs) {
      this.staticBuses.inputDeviceConnected.trigger(input);
    }
    for (const output of this.accessObject.outputs) {
      this.staticBuses.outputDeviceConnected.trigger(output);
    }

    

    // FIXME: move somewhere else....
    // access.onstatechange = (e: WebMidi.MIDIConnectionEvent) => {
    //   if (e.port.state === "connected") {
    //     this.staticBuses.deviceConnected.trigger(e.port);
    //   } else {
    //     this.staticBuses.deviceDisconnected.trigger(e.port);
    //   }
    // };
  }
}
