# @midival/core

`midival` is the library to handle MIDI messages in JavaScript (TypeScript) with ease. It provides simple programming interface to interact with both MIDI IN and MIDI OUT.

The library is currently in alpha state. Feel free to contribute, post bug reports, comments and ideas.

More information: [midival.github.io](https://midival.github.io)

## Installation

```bash
yarn add @midival/core
```

## Getting started

To get started you need to initialise the library and ask for available devices:

```javascript
import { MIDIVal } from "@midival/core";

MIDIVal.connect().then((accessObject) => {
  console.log("Inputs", accessObject.inputs);
  console.log("Outputs", accessObject.outputs);
});
```

### Listening to devices

You can also listen to new devices and react when they are connected:

```javascript
import { MIDIVal } from "@midival/core";

MIDIVal.onDeviceConnected((device) => {
  console.log("Device", device);
});
```

You can also listen to disconnect events:

```javascript
import { MIDIVal } from "@midival/core";

MIDIVal.onDeviceDisconnected((device) => {
  console.log("Device", device);
});
```

Once you obtain reference to device, you can use it by creating `MIDIValInput` / `MIDIValOutput` object from it:

```javascript
MIDIVal.connect().then((accessObject) => {
  const input = new MIDIValInput(accessObject.inputs[0]);
});
```

## MIDI Inputs

Once you obtain access to the MIDI Input you can interact with it.

### Note On

You can subscribe to note on.

```javascript
input.onAllNoteOn(({ note, velocity }) => {
  console.log("Note On:", note, "velocity:", velocity);
});
```

You can also subscribe to a specific key:

```javascript
input.onNoteOn(60, ({ velocity }) => {
  console.log("C pressed with velocity", velocity);
});
```

### Note Off

You can subscribe to note off. The note off takes into account both Note Off message as well as Note On with Velocity 0.

```javascript
input.onAllNoteOff(({ note }) => {
  console.log("Note Off:", note);
});
```

You can also subscribe to a specific key:

```javascript
input.onNoteOff(60, ({ velocity }) => {
  console.log("C depressed with velocity", velocity); // velocity should be 0.
});
```

### Control Change

To listen to Control Change (MIDI CC) messages like modulation, synth parameter change and more, you can do the following:

```javascript
input.onAllControlChange(({ control, value }) => {
  console.log(`Param: ${control}, value: ${value}`);
});
```

You can also listen to the single control parameter (like Modulation wheel, Volume or Pan only). The full table with MIDI CC messages can be found in [the official MIDI CC documentation](https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2).

```javascript
input.onControlChange(7, ({value}) => {
    console.log('Volume change to value:', value));
});

input.onControlChange(1, ({value}) => {
    console.log('Modulation Wheel value changed to:', value);
})
```

### Program Change

You can listen to program change messages:

```javascript
input.onAllProgramChange(({ program, value }) => {
  console.log(`Program ${program} changed to: ${value}`);
});
```

You can also listen to a single program channel:

```javascript
input.onProgramChange(1, ({ value }) => {
  console.log(`Program 1 changed to:`, value);
});
```

### Poly Key Pressure

You can listen to Poly Key Pressure:

```javascript
input.onAllPolyKeyPressure((midiMessage) => {});
```

you can listen to a specific key:

```javascript
input.onPolyKeyPressure(5, (midiMessage) => {});
```

### Systex

You can listen to systex message:

```javascript
input.onSysex((midiMessage) => {});
```

### All Sounds Off

You can listen to all sounds off message

```javascript
input.onAllSoundsOff(() => {});
```

### Reset All Controllers

You can listen to the signal to reset all controllers

```javascript
input.onResetAllControllers(() => {});
```

### Local Control Change

Under construction

### All Notes Off

You can listen to all notes off

```javascript
input.onAllNotesOff(() => {});
```

### MIDI Clock

You can listen to MIDI Clock messages:

- `onClockStart`
- `onClockStop`
- `onClockContinue`
- `onClockPulse` - sent 24 times every quarternote.

### To Be Added

The following features are planned to be added to MIDI Input:

- Better support for sysex
- Better documentation

### Disconnect

If you want to stop listening to all the messages and unregister all callbacks simply call:

```javascript
input.disconnect();
```

## Changelog and migration guide

For changelog see [CHANGELOG.md](./CHANGELOG.md).

For migration guide see [MIGRATION.md](./MIGRATION.md).

# Community

[Join our Discord Community](https://discord.gg/GV88v3k56a) to ask questions or discuss all MIDI related topics!