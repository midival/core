---
"@midival/core": minor
---

- Added sysex support! Now you can pass extra options to connect function
- Added generic `message` event to MIDIValInput to subscribe when you want to process messages raw
- fix: removed console log for unrecognised messages - now you can handle them with `message` event
- Added explicit MIT Licence to the repository