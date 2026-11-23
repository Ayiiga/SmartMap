# GigaOrbit Photo Mission — Asset and Release Notes

The standalone Android Godot project now has a **separate, playable, image-based
2.5D Earth-to-Moon mission** at `res://scenes/world/photo_mission.tscn`.
It is the primary action in the main menu; the existing original 3D mode remains
available as Classic Rocket Pilot.

## Bundled artwork (fully offline)

- `launch-rocket.webp` — photographed/illustrated rocket launch, animated by
  parallax and image scaling during rocket ascent
- `earth-orbit.webp` — orbital/spaceflight background
- `lunar-rover.webp` — lunar landing / on-surface panorama
- `astronaut-eva.webp` — distant astronaut parallax detail
- `gigaorbit-icon.webp` — supplied game logo

These images were **supplied with the project**. Independent NASA/ESA provenance
and public-redistribution permissions have **not yet been verified**. Do not
describe them as NASA photographs or distribute them under a new license until
their origins and rights are confirmed. No copyrighted film or other game frames
were added in this work.

## Gameplay: not a static slideshow

Actual simulated launch acceleration/altitude/fuel and orbit rewards, guided
transfer with steering, steerable descent with hold-to-brake, landing gear
conditions, real touch joystick, lunar sample collection at three distinct
positions, return to lander, rover movement speed, persistent saved checkpoints,
spendable fuel cells/repair kits and existing first-clear achievements.

**Existing Godot scene physics, economy, achievements and save files remain
unchanged**; this new mode uses only new `user://gigaorbit_photo_checkpoint_v1.json`
state and previously established GameState awards / virtual coins.

## Quality limitations

This is a **photograph-led 2.5D playable vertical slice**, not a finished
photorealistic AAA game. The photo rocket foreground is derived from a masked
crop of the bundled launch photograph, not a dedicated verified transparent
sprite. Additional correctly licensed sprites are required for truly authentic
lunar landers, walking astronaut frames and driving rovers. A complete
Mars/outer-planets 2.5D mission expansion is still future work.

CI: Godot headless parse, actual runtime scene probe, fuel/landing/EVA mission
transitions, source contracts, Android ARM64 debug APK export and ZIP integrity.
Required device QA: landscape safe areas, joystick capture, image quality,
touch precision, thermal FPS 30, mission retry/save and package compatibility.

No claim of physical-device verification is made from CI alone.
