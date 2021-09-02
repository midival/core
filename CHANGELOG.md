# Changelog

## [0.0.14] In progress
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
