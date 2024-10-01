# Talk generator

A quick experiment, built with the help of ChatGPT, to create and manage a talk with auto-generated audio.

Features:
- Vanilla Javascript; no framework required.
- Simple PHP backend; no framework (or database) required.
- UI to display, save and load the talk from a `content.json` file.
- Ability to reorder items and create new items.
- Voices can have a color scheme and avatar.
- Each item can generate its mp3 file with a cloned voice from elevenlabs.
- It's possible to playback those files and hear the entire talk.
- A "talk length" summary, from the sum of the mp3 length.

To do:
- Chapters and sections (with a table of content)
- Different item format, for example a video.
- Add comments on every item/slide.
- Better content reloading for collaborative editing.