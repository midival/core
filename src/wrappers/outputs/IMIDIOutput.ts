export default interface IMIDIOutput {
  send(data: Uint8Array | number[]): void;
  id: string;
  name: string;
}
