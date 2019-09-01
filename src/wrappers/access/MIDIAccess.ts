import IMIDIAccess, {
  OutputStateChangeCallback,
  InputStateChangeCallback,
} from "./IMIDIAccess";
import BrowserMIDIAccess from "./BrowserMIDIAccess";
import IMIDIOutput from "../outputs/IMIDIOutput";
import IMIDIInput from "../inputs/IMIDIInput";

export default class MIDIAccess implements IMIDIAccess {
  private access: IMIDIAccess;
  constructor(constructor: new () => IMIDIAccess = null) {
    if (!constructor) {
      this.access = new BrowserMIDIAccess();
    } else {
      this.access = new constructor();
    }
  }

  static async connect(): Promise<MIDIAccess> {
    const access = new MIDIAccess();
    await access.connect();
    return access;
  }

  connect(): Promise<WebMidi.MIDIAccess> {
    return this.access.connect();
  }

  get outputs(): IMIDIOutput[] {
    return this.access.outputs;
  }

  get inputs(): IMIDIInput[] {
    return this.access.inputs;
  }

  onInputStateChange(callback: InputStateChangeCallback): void {
    this.access.onInputStateChange(callback);
  }
  onOutputStateChange(callback: OutputStateChangeCallback): void {
    this.access.onOutputStateChange(callback);
  }
}
