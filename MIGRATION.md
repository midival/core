# Migration Guide

This is migration guide explaining breaking changes between versions:

## [0.1.0]

### Breaking changes
- MIDIValInput.onPitchBend now sends information about channel. To do that the signature of the callback changed from Callback<[number]> to Callback<[PitchBend]> where PitchBend is an interface containing channel and value fields.

## [0.0.15]

### Method signature changes

- `onAll*` methods do not have separate key extracted as a first argument. Instead they comply with other callbacks (first parameter is always `MidiMessage` or derived interface)
- `onAllControlChange` and `onControlChange` now expose it's parameters in better form: In addition to `MidiMessage` interface they now include `control` and `value`.
- `onAllProgramChange` and `onProgramChange` now expose it's parameters in better form: In addition to `MidiMessage` interface they now include `program` and `value`.
- `onAllNoteOn`, `onAllNoteOff`, `onNoteOn` and `onNoteOff` and now expose it's parameters in better form: In addition to `MidiMessage` interface they now include `note` and `velocity`.
