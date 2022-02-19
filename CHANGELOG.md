# Changelog

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
