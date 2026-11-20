# SPACE ODYSSEY — Audio, Radio and Comet Corridor (Phase 2.5)

## What this version actually does

- **Settings:** Low/Medium/High graphics settings change 3D render resolution and high-quality antialiasing; 30/60 FPS changes the engine frame-rate cap; master, music, effects, TTS speaker, guided flight, camera inversion, and performance overlay are individually adjustable. Changes persist in `user://` immediately. Reset, test sound and test radio buttons all have actions.
- **African-inspired music:** Original, locally synthesized 4-bar rhythm using pentatonic plucked notes, syncopated percussion, shaker, bass drum and bell. The composition and its effects are procedural and freely distributable. It is **not** a recorded commercial African track.
- **Rocket/space audio:** Offline launch, stage separation, warning, impact, scan, steering and success tones.
- **Ship radio:** Tap **SHIP RADIO / TALK** during rocket launch or comet flight. Choose **STATUS**, **GUIDANCE**, **SCAN**, **REPEAT**, and steering commands. Every response has on-screen text and an offline radio tone.
- **Speech:** Godot sends spoken English radio messages to Android's installed text-to-speech service **if a compatible system voice is available**. A voice is not bundled with the APK. If unavailable, subtitles and synthetic radio tones still work offline. No cloud speech API or login is used.
- **Comet Corridor:** Unlocks after first successful Earth orbit. 3-lane spacecraft dodging challenge featuring animated 3D comets, meteoroids, and debris, a 5-shield assisted mode (3 shields manual), collision penalties, radio scanner, best score, first-clear reward of +80 science points, and replay.
- **Safe persistence:** Mission scores, crew choices, and settings persist locally. No network permissions are requested by the Godot Android build.

## On-phone instructions

1. Start SPACE ODYSSEY. Original background music starts if Music is enabled.
2. Open **SETTINGS · MUSIC / SPEAKER** to change music and sounds. Tap **TEST ROCKET SOUND** and **TEST SHIP SPEAKER**.
3. Start **PLAY ROCKET NOW**, keep Guided Flight ON, launch, separate the stage, and enter Earth orbit.
4. In rocket flight, tap **SHIP RADIO / TALK** for altitude, fuel, guidance, and repeatable instructions.
5. After orbit, tap **ENTER SPACE · DODGE COMETS**. Comet Corridor becomes available in the main menu thereafter.
6. Watch the hazard warning and tap the large **DODGE LEFT** or **DODGE RIGHT** button. Use **SHIP RADIO** to scan, receive recommendations, or send a status request. Dodge 8 hazards without losing all shields.
7. Pause to store your best result and return later.

## Scientific caveat

Comet Corridor is an **arcade-style local obstacle course**, not an accurate depiction of orbital debris or the natural prevalence of comets near Earth. Hazards are intentionally frequent for gameplay. Moon transfer/landing remains planned.

## Build and validation

GitHub Actions: `.github/workflows/space-odyssey-android.yml`
- Python source contracts (Phase 1, 2, 2.5)
- Godot 4.4.1 headless import with strict error detection
- Godot headless phase 1, 2, and audio/comet smoke tests
- Signed-debug ARM64 Android APK generation and ZIP integrity check
- GitHub Actions APK artifact

These checks cannot prove audio volume, system voice availability, 30 FPS stability, or touch responsiveness on the Tecno Spark 10 Pro. Those require a phone test.

## Known limitations

- Android voices are controlled by the phone's system TTS availability; no voice assets are packaged.
- The current music is a procedural chiptune-like rhythm, not a multitrack recorded traditional performance.
- Comet radio uses predefined interactive options and contextual responses, **not** unrestricted conversational AI.
- The challenge is a short, simplified near-Earth space scene; Moon navigation and landing are not in this release.
- Debug APKs generated with fresh CI debug keys may require uninstalling the previous APK before installing. That erases old local saves. Avoid replacing the old version if saved progress is important.
