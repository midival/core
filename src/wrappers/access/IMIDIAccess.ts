import {IMIDIInput} from "../inputs/IMIDIInput";
import {IMIDIOutput} from "../outputs/IMIDIOutput";

export enum STATUS {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
}

export type InputStateChangeCallback = (input: IMIDIInput) => void;
export type OutputStateChangeCallback = (output: IMIDIOutput) => void;

export interface IMIDIAccess {
  connect(): Promise<WebMidi.MIDIAccess>;
  inputs: IMIDIInput[];
  outputs: IMIDIOutput[];
  onInputStateChange(callback: InputStateChangeCallback): void;
  onOutputStateChange(callback: OutputStateChangeCallback): void;
}
