# GigaOrbit Photo Mission — Asset and Release Notes

The standalone Android Godot project now has a **separate, playable, image-based
2.5D Earth-to-Moon mission** at `res://scenes/world/photo_mission.tscn`.
It is the primary action in the main menu; the existing original 3D mode remains
available as Classic Rocket Pilot.

## Bundled artwork (fully offline)

- `earth-launchpad.webp` — photoreal launchpad backdrop, animated by
  parallax and image scaling during rocket ascent
- `earth-orbit.webp` — orbital/spaceflight background
- `moon-surface.webp` — lunar landing / on-surface panorama
- `eva-suit.webp` and `eva-rover.webp` — interactive foreground Moon and Mars vehicles
- `gigaorbit-icon.webp` — supplied game logo

The launchpad and lunar surface backdrops, game icon, crew portraits, and standalone
equipment sprites were generated for GigaOrbit. The orbital background was inherited
from the project. See the [asset provenance ledger](../assets/textures/NASA-SOURCES.md)
for credits on actual NASA mission imagery used in the planetary expeditions.

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

The Earth-to-Moon route and Mars expeditions combine generated photographic-style
assets with interactive flight, walking, driving and equipment work. The original
3D training and Classic Rocket Pilot modes remain available. Physical-device
touch handling, frame pacing, audio playback and installation still require Android
qualification before a production release.
