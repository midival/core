import IMIDIOutput from "./outputs/IMIDIOutput";

export default class MIDIOutput implements IMIDIOutput {
  send(data: Uint8Array | number[]): void {
    throw new Error("Method not implemented.");
  }
  id: string;
  name: string;
}
