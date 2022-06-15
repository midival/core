import { UnregisterCallback } from "@hypersphere/omnibus";

export type MIDIMessage = {
  receivedTime: number;
  data: Uint8Array;
};
export type OnMessageCallback = (message: MIDIMessage) => void;
export interface IMIDIInput {
  onMessage(callback: OnMessageCallback): Promise<UnregisterCallback>;
  get id(): string;
  get name(): string;
  get manufacturer(): string;
}
