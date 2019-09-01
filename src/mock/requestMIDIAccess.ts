/*
 Mock for requestMIDIAccess function
*/

type requestMIDIAccessFactoryOptions = {
  inputs: Array<string>;
  outputs: Array<string>;
};

const makeFakeInput = (name: string): WebMidi.MIDIInput => {
  return {
    name, // TODO: other fake stuff
  } as WebMidi.MIDIInput;
};

const makeFakeOutput = (name: string): WebMidi.MIDIOutput => {
  return {
    name, // TODO: other fake stuff.
  } as WebMidi.MIDIOutput;
};

const makeInputsMap = (
  options: requestMIDIAccessFactoryOptions
): Map<string, WebMidi.MIDIInput> => {
  const inputs = new Map();
  for (const inputName of options.inputs) {
    inputs.set(inputName, makeFakeInput(inputName));
  }
  return inputs;
};

const makeOutputsMap = (
  options: requestMIDIAccessFactoryOptions
): Map<string, WebMidi.MIDIOutput> => {
  const outputs = new Map();
  for (const outputName of options.outputs) {
    outputs.set(outputName, makeFakeOutput(outputName));
  }
  return outputs;
};

export default (options: requestMIDIAccessFactoryOptions) => async (): Promise<
  WebMidi.MIDIAccess
> => {
  return {
    inputs: makeInputsMap(options),
    outputs: makeOutputsMap(options),
    onstatechange: null,
  } as WebMidi.MIDIAccess;
};
