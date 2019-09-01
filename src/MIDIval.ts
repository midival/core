import MessageBus, { Callback } from "./MessageBus";
import MIDIValInput from "./MIDIValInput";
import MIDIValOutput from "./MIDIValOutput";

import IMIDIInput from "./wrappers/inputs/IMIDIInput";

import MIDIAccess from "./wrappers/access/MIDIAccess";
import IMIDIOutput from "./wrappers/outputs/IMIDIOutput";
import IMIDIAccess from "./wrappers/access/IMIDIAccess";

type StaticBuses = {
  deviceConnected: MessageBus;
  inputDeviceConnected: MessageBus;
  inputDeviceDisconnected: MessageBus;
  outputDeviceConnected: MessageBus;
  outputDeviceDisconnected: MessageBus;
  deviceDisconnected: MessageBus;
};

export default class MIDIVal {
  private static staticBuses: StaticBuses = {
    deviceConnected: new MessageBus("deviceConnected"),
    inputDeviceConnected: new MessageBus("inputDeviceConnected"),
    inputDeviceDisconnected: new MessageBus("inputDeviceDisconnected"),
    outputDeviceConnected: new MessageBus("outputDeviceConnected"),
    outputDeviceDisconnected: new MessageBus("outputDeviceDisconnected"),
    deviceDisconnected: new MessageBus("deviceDisconnected"),
  };

  private static isSetup: boolean = false;
  private static accessObject: IMIDIAccess;

  public static configureAccessObject(newAccess: IMIDIAccess): void {
    this.isSetup = false;
    this.accessObject = newAccess;
  }

  public static async onDeviceConnected(fn: Callback) {
    await this.setupDeviceWatchers();
    this.staticBuses.deviceConnected.on(fn);

    // rework later.
    for (const input of this.accessObject.inputs) {
      fn(input);
    }
    for (const output of this.accessObject.outputs) {
      fn(output);
    }
  }

  public static onDeviceDisconnected(fn: Callback) {
    this.staticBuses.deviceDisconnected.on(fn);
    this.setupDeviceWatchers();
  }

  public static fromMIDIInput(input: IMIDIInput): MIDIValInput {
    return new MIDIValInput(input);
  }

  public static fromMIDIOutput(output: IMIDIOutput): MIDIValOutput {
    return new MIDIValOutput(output);
  }

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
      this.staticBuses.deviceConnected.trigger(input);
    }
    for (const output of this.accessObject.outputs) {
      this.staticBuses.deviceConnected.trigger(output);
    }

    access.onstatechange = (e: WebMidi.MIDIConnectionEvent) => {
      if (e.port.state === "connected") {
        this.staticBuses.deviceConnected.trigger(e.port);
      } else {
        this.staticBuses.deviceDisconnected.trigger(e.port);
      }
    };
  }
}
