import { CallbackType, UnregisterCallback } from "@hypersphere/omnibus";
import {IMIDIInput} from "../inputs/IMIDIInput";
import {IMIDIOutput} from "../outputs/IMIDIOutput";

export enum STATUS {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
}

export type InputStateChangeCallback = CallbackType<[IMIDIInput]>; 
export type OutputStateChangeCallback = CallbackType<[IMIDIOutput]>;

export interface IMIDIAccess {
  connect(): Promise<void>;
  inputs: IMIDIInput[];
  outputs: IMIDIOutput[];
  onInputConnected(callback: InputStateChangeCallback): UnregisterCallback;
  onInputDisconnected(callback: InputStateChangeCallback): UnregisterCallback;
  onOutputConnected(callback: OutputStateChangeCallback): UnregisterCallback;
  onOutputDisconnected(callback: OutputStateChangeCallback): UnregisterCallback;
}
