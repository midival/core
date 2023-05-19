# Changelog

## [0.1.0] 2023-05-19
- Support for MPE. You can now instantiate `MPEMidivalInput` or `MPEMidivalOutput`
- Added support for Registered Parameters. See [MIDI Documentation, Table 3a](https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2)
- Dependencies were updated to the latest versions including TypeScript 5.0
- Breaking: `onPitchBend` callback changed it's parameter type. Instead of number it recieved object with value and channel. See [Migration guide](./MIGRATION.md) for more information.

## [0.0.17] 2022-06-15
- Fixed `onInputConnected` / `onInputDisconnected` / `onOutputConnected` / `onOutputDisconnected`
- Simplified code
- Added tests
- Added example code.

## [0.0.16] 2022-03-16
- Added MIDI Clock messages.

## [0.0.15] 2022-02-19

- Migrated from custom event bus to `@hypersphere/omnibus`
- Better typings for `MidivalInput` methods
- Slight change in `MidivalInput` callback parameters: see [MIGRATION.md](./MIGRATION.md)

## [0.0.14] 2021-09-06

- Added manufacturer field in IMIDIInput and IMIDIOutput interfaces.
- Ability to listen to only specific devices (based on name / manufacturer).
- Added pitch bend methods for both input and output.
- Refactored `.onLocalControlChange` - first argument for the callback is now boolean of the value control change was set to.
- Added new methods to `MIDIValInput`:
  - `.onOmniModeOff`
  - `.onOmniModeOn`
  - `.onMonoModeOn`
  - `.onPolyModeOn`

## [0.0.13]

First public (alpha) version.
