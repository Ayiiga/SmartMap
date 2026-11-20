# Test checklist and acceptance gates

**Source written does not mean verified in the Godot engine.** Statuses are initially **NOT RUN** unless explicitly shown below.

| ID | Verification | Expected behavior | Status |
|---|---|---|---|
| S01 | `python3 tests/phase1_contract_check.py` | All local scene paths and JSON valid | PASS (static only) |
| G01 | `godot --headless --editor --path . --quit` | Imports with no parser errors | NOT RUN |
| G02 | `godot --headless --path . --script res://tests/phase1_smoke.gd` | Scenes and arithmetic resources load | NOT RUN |
| M01 | Main menu all active controls | New/Continue/Missions/Workshop/Discover/Settings/Exit respond | NOT RUN |
| M02 | Continue on fresh install | Clearly disabled when no mission save exists | NOT RUN |
| M03 | New Game | Earth training scene loads | NOT RUN |
| P01 | Keyboard WASD/Space/E/Shift | Move/jump/interact/sprint | NOT RUN |
| P02 | Left touch joystick + right touch drag | Independent simultaneous inputs | NOT RUN |
| P03 | Touch Jump/Sprint/Jetpack/Interact | Every control works without stuck state | NOT RUN |
| P04 | Camera drag/collision | No camera jitter or clipping | NOT RUN |
| P05 | Training collision | Astronaut stays above floor and solid walls/rocket | NOT RUN |
| O01 | Beacon | Enter proximity, advances to objective 2 | NOT RUN |
| O02 | Practice sample | Press Interact; sample disappears; objective 3 | NOT RUN |
| O03 | Rocket inspection | Interact; completes mission and awards +50 once | NOT RUN |
| P06 | Fall outside terrain | Recover at last safe checkpoint; no softlock | NOT RUN |
| O04 | Restart training | Restarts objective sequence; no repeat reward exploit | NOT RUN |
| SAVE01 | Save & Main Menu; Continue | Objective and checkpoint restored | NOT RUN |
| SAVE02 | Background/force close; relaunch | Last checkpoint persists | NOT RUN |
| SAVE03 | Corrupt primary save; backup intact | Recovery from previous checkpoint succeeds | NOT RUN |
| SAVE04 | Settings save; relaunch | FPS, volume and toggles remain persisted | NOT RUN |
| SAVE05 | Delete local save, 2-tap confirm | Save removed and Continue disabled | NOT RUN |
| UI01 | Back button and pause | Pause, resume, save, exit without softlock | NOT RUN |
| UI02 | Landscape different aspect ratios | UI remains readable/operable | NOT RUN |
| PERF01 | Debug overlay | FPS/draw/memory figures update | NOT RUN |
| PERF02 | Tecno Spark 10 Pro | 30 FPS baseline under actual gameplay | NOT RUN |
| OFF01 | Airplane mode + reboot | Game and saves remain functional, no downloads | NOT RUN |
| A01 | Android Debug APK export | APK installs and starts on device | NOT RUN |
| A02 | Release AAB and permissions | Signed, valid, API 36+, no unwanted INTERNET | NOT RUN |

## Known risks and limitations requiring Godot run

- GDScript was not parsed by an engine in this environment; unknown compile/runtime errors may remain.
- Main menu and training scene have not been rendered or checked for visual clipping on mobile.
- Touch joystick, camera, scene transitions, and CharacterBody3D contact need a real gameplay test.
- Versioned save logic includes checksum/backup code but real crash-recovery validation has not been run.
- Procedural world currently covers only Earth training, not lunar/planetary environments.
- Rocket workshop contains a simplified ideal delta-v calculator, not real flight control.
- The saved Low/Medium/High preference does not yet reconfigure geometry or textures. FPS setting does apply at runtime.
- The Phase 1 training scene has no atmospheric drag, orbital transfer, Moon landing, stage separation, etc.; these are later phases.

## Required evidence before marking Phase 1 stable

- Godot engine version and `--headless` logs
- Screenshot/video of menu, training, each objective and completion
- Debug APK hash + Android manifest inspection
- Real Tecno Spark 10 Pro test, screen recording, performance measurements
- Offline/airplane-mode test after restart
- Negative tests for corrupt save and touch multitasking
