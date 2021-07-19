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
import MIDIVal from "@midival/core";

MIDIVal.connect()
.then(accessObject => {
    console.log("Inputs", accessObject.inputs);
    console.log("Outputs", accessObject.outputs);
})
```

### Listening to devices
You can also listen to new devices and react when they are connected:

```javascript
import MIDIVal from "@midival/core";

MIDIVal.onDeviceConnected(device => {
    console.log("Device", device);
});
```

You can also listen to disconnect events:

```javascript
import MIDIVal from "@midival/core";

MIDIVal.onDeviceDisconnected(device => {
    console.log("Device", device);
});
```

Once you obtain reference to device, you can use it by creating `MIDIValInput` / `MIDIValOutput` object from it:

```javascript
MIDIVal.connect()
.then(accessObject => {
    const input = new MIDIValInput(accessObject.inputs[0]);
});
```

## MIDI Inputs
Once you obtain access to the MIDI Input you can interact with it.

### Note On
You can subscribe to note on.

```javascript
input.onAllNoteOn((key, midiMessage) => {
    console.log("Note On:", key, "velocity:", cmidiMessage.data2);
});
```

You can also subscribe to a specific key:

```javascript
input.onNoteOn(60, (midiMessage) => {
    console.log("C pressed with velocity", midiMessage.data2);
});
```

### Note Off

You can subscribe to note off. The note off takes into account both Note Off message as well as Note On with Velocity 0.

```javascript
input.onAllNoteOff((key, midiMessage) => {
    console.log("Note Off:", key);
});
```

You can also subscribe to a specific key:
```javascript
input.onNoteOff(60, (midiMessage) => {
    console.log("C depressed with velocity", midiMessage.data2); // velocity should be 0.
});
```

### Control Change

To listen to Control Change (MIDI CC) messages like modulation, synth parameter change and more, you can do the following:

```javascript
input.onAllControlChange((param, midiMessage => {
    console.log(`Param: ${param}, value: ${midiMessage.data2}`);
}));
```

You can also listen to the single control parameter (like Modulation wheel, Volume or Pan only). The full table with MIDI CC messages can be found in [the official MIDI CC documentation](https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2). 

```javascript
input.onControlChange(7, (midiMessage) => {
    console.log('Volume change to value:', midiMessage.data2));
});

input.onControlChange(1, (midiMessage) => {
    console.log('Modulation Wheel value changed to:', midiMessage.data2);
})
```

### Program Change

You can listen to program change messages:

```javascript
input.onAllProgramChange((program, midiMessage) => {
    console.log(`Program ${program} changed to: ${midiMessage.data2}`);
});
```

You can also listen to a single program channel:

```javascript
input.onProgramChange(1, (midiMessage) => {
    console.log(`Program 1 changed to:`, midiMessage.data2);
});
```

### Poly Key Pressure

You can listen to Poly Key Pressure:

```javascript
input.onAllPolyKeyPressure((key, midiMessage) => {});
```

you can listen to a specific key:

```javascript
input.onPolyKeyPressure(5, (midiMessage) => { });
```

### Systex

You can listen to systex message:

```javascript
input.onSysex((midiMessage) => { });
```

### All Sounds Off

You can listen to all sounds off message

```javascript
input.onAllSoundsOff(() => { });
```

### Reset All Controllers

You can listen to the signal to reset all controllers

```javascript
input.onResetAllControllers(() => { });
```

### Local Control Change

Under construction

### All Notes Off

You can listen to all notes off

```javascript
input.onAllNotesOff(() => { });
```

### To Be Added
The following features are planned to be added to MIDI Input:
- Omni Mode On
- Omni Mode Off
- Mode Mode On
- Poly On
- Better support for sysex

### Disconnect

If you want to stop listening to all the messages and unregister all callbacks simply call:

```javascript
input.disconnect();
```

## MIDI Outputs

Under construction.