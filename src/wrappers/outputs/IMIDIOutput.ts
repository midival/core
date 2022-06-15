export interface IMIDIOutput {
  send(data: Uint8Array | number[]): void;
  get id(): string;
  get name(): string;
  get manufacturer(): string;
}
