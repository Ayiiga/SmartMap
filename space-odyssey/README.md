# SPACE ODYSSEY — Journey Beyond Earth

**Phase 2 · Godot 4.x / GDScript / Android landscape / offline · v0.2.2-ci-prep**

This release extends the Phase 1 Godot project. It includes a playable-in-source astronaut training mission, a 12-astronaut selector across three roles, spacecraft boarding, a simulated two-stage launch, fuel/altitude/speed telemetry, stage separation, a guided orbital insertion and local progress saves. Everything uses local scripts, bundled JSON and procedural geometry; there is **no internet dependency, login, advertising or cloud save**.

**Verification notice:** Static checks and an independent mathematical trajectory simulation have passed. A Godot editor and Android export tools were **not available** in the authoring runtime. Godot GDScript parsing, real game execution, touch controls on a device, APK/AAB builds and FPS are **not verified**. Treat this as an implementation requiring local Godot QA, not as a certified playable release.

## Quick start

1. Extract this ZIP and import `project.godot` with the current Godot 4.x standard (non-C#) editor.
2. Project uses Compatibility/OpenGL rendering and landscape at 1280 × 720.
3. Press **F5**. Main menu: **CHOOSE ASTRONAUT** (12 named astronauts in three roles) → **NEW GAME**.
4. Training: use WASD (or left touch joystick), mouse right drag (or drag right screen), Space / Jump, E / Interact. Touch **CHOOSE ASTRONAUT**, or press C, to open the full 12-person roster; your choice saves immediately.
5. Reach the beacon, collect the sample, and inspect the rocket. Select **BOARD ROCKET — PHASE 2** on completion, or walk back to the rocket and press INTERACT. Alternatively go to **MISSIONS** → **START ROCKET MISSION** after training.
6. Rocket cockpit: tap **1 · LAUNCH**. Watch HEIGHT, SPEED and FUEL increase/change. When available tap **2 · SEPARATE STAGE**. Keep climbing, then tap **3 · GUIDED ORBIT** when enabled. Rocket flight assist defaults ON.
7. Use **PAUSE / SAVE** or Android back to pause. CONTINUE resumes the most recent flight checkpoint. **RETRY** resets that flight without re-awarding previous rewards.
8. The Moon, lunar transfer and landing remain locked for Phase 3.

## Twelve selectable astronauts across three roles

| Astronaut | Appearance | Role |
|---|---|---|
| Nambe, Ndaani, Mambooda, Abiola | Four distinct blue/teal/cream/lilac suits | Flight Cadets |
| Ayiiga, Atia, Mpoko, Yambilla | Four orange/copper/gold/steel suits | Rocket Pilots |
| Zuuri, Wendkuoni, Delwende, Regina | Four violet/mint/rose/white suits | Science Explorers |

These are twelve individually colored **procedural 3D suit avatars**, not external or copyrighted models. Choose from the main menu or tap CHOOSE ASTRONAUT in Earth training to select a specific character. Previous Phase 2 selections migrate automatically: Nova → Nambe, Kofi → Ayiiga, Zuri → Zuuri. Save key: `selected_astronaut`. The chosen pilot name appears in the flight HUD.

## Spaceflight gameplay model (educational simplification)

- Simulation uses **metres, seconds, kilograms, newtons**, mass-dependent thrust acceleration, standard Earth gravity, exponential atmospheric density, drag, throttle, fuel mass loss, and dry-mass reduction at staging.
- Stage 1 burns the liquid fuel tanks (boosters are approximated as part of stage one). Stage 2 uses its own smaller fuel supply. Workshop tanks and booster counts modify the starting mass, fuel and thrust/mass behavior.
- Time is **2.3× compressed** so beginners can reach the next step quickly. Pitch assistance adjusts tilt; players may disable it.
- To teach the idea of orbital insertion without an entire orbital mechanics solver, GUIDED ORBIT becomes available after **12 km altitude and 460 m/s speed in Stage 2**. Activating it sets a **gameplay checkpoint at 120 km altitude and 7,800 m/s horizontal orbital velocity**. It is not a physically continuous orbit, live ephemeris, docking solution or Moon transfer.
- The rendered rocket altitude is capped to a **small local coordinate range** for floating-origin-style precision safety. Telemetry retains simulation altitude. No whole-Solar-System high-detail scene is loaded.
- Orbital completion awards **150 science points once**. The Earth training reward is 50 points once.

## Main project paths

- `scenes/ui/crew_screen.tscn`, `scripts/ui/crew_screen.gd`: 12-character selection.
- `scenes/player/astronaut.tscn`, `scripts/player/astronaut.gd`: visible suits / movement.
- `scripts/world/training_world.gd`: training, in-world spacecraft interaction, character switching.
- `scenes/rocket/trainer_rocket.tscn`, `scripts/rocket/rocket_vehicle.gd`: stage state machine, propulsion, fuel, stage jettison, orbital condition, snapshot.
- `scenes/world/launch_world.tscn`, `scripts/world/launch_world.gd`: flight environment, beginner controls, telemetry, mission UI, pause/fail/win.
- `resources/missions/launch.json`: stage-based objectives, progression and scientific caveats.
- `scripts/core/game_state.gd` and `save_store.gd`: previous Phase 1-compatible versioned checksummed, backed-up `user://` save.
- `scripts/missions/mission_manager.gd`: training and flight mission definitions.
- `tests/phase2_contract_check.py`, `tests/phase2_smoke.gd`, `docs/PHASE2_TEST_CHECKLIST.md`.

## Checks

Static references, definition checks and numerical trajectory viability (Python; **not Godot**):

```bash
python3 tests/phase1_contract_check.py
python3 tests/phase2_contract_check.py
```

Godot project load and GDScript/physics smoke (**requires actual installed Godot 4.x editor**):

```bash
godot --headless --editor --path . --quit
godot --headless --path . --script res://tests/phase1_smoke.gd
godot --headless --path . --script res://tests/phase2_smoke.gd
```

Manual touch QA and Android exports are essential; see `docs/PHASE2_TEST_CHECKLIST.md`, `docs/ANDROID_EXPORT.md`, and `docs/PHASE2_OUTSTANDING_ISSUES.md`.

## Existing Phase 1 saves

The file envelope version remains **1**, with added optional fields and defaults for backward compatibility. An existing training completion should still unlock the Phase 2 mission. Checkpoint snapshots are local to the device, never sent to a remote server. Before running on a real device, make a backup of any save you care about; backward compatibility was implemented but has not been verified in Godot.

## What is not yet implemented

The Phase 2 flight uses a simulated rocket, **not true 3D rigid-body orbital dynamics**. No Moon transfer, lunar lander, lunar EVA, Mars gameplay, rocket part attachment editor, Android APK or signed AAB exists in this package. All further destinations remain intentionally locked.


## SmartMap repository conversion
The companion migration overlay places this project at `space-odyssey/` in `Ayiiga/SmartMap` and adds `.github/workflows/space-odyssey-android.yml`. Existing SmartMap source is preserved until the game passes actual Android testing. The source project still needs engine validation before any APK can be called working.

## Android installation
This ZIP is **source code**, not an APK. Android installation requires a successful Godot 4.4.1 import, headless smoke tests, a configured Android SDK/export template, and a successful `--export-debug Android` command. The included `docs/ANDROID_EXPORT.md` has the steps. No live download URL exists until the APK has been compiled.
