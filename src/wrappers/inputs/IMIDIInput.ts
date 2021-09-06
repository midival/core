export type MIDIMessage = {
  receivedTime: number;
  data: Uint8Array;
};
export type OnMessageCallback = (message: MIDIMessage) => void;
export type UnregisterCallback = () => void;
export interface IMIDIInput {
  onMessage(callback: OnMessageCallback): Promise<UnregisterCallback>;
  id: string;
  name: string;
  manufacturer: string;
}
