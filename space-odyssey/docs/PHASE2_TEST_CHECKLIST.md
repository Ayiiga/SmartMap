# Phase 2 acceptance checklist (do not check a box without evidence)

## Import / engine
- [ ] Import `project.godot` in an installed compatible Godot 4.x editor; record engine version.
- [ ] Scene and GDScript import complete with zero parse errors.
- [ ] Run `godot --headless --editor --path . --quit` and collect output.
- [ ] Run `tests/phase1_smoke.gd` and `tests/phase2_smoke.gd` and collect output.
- [ ] F5 opens the landscape main menu, all visible buttons perform the advertised action.

## Twelve astronauts in three roles
- [ ] Menu selector shows all four Flight Cadets (Nambe, Ndaani, Mambooda, Abiola), all four Rocket Pilots (Ayiiga, Atia, Mpoko, Yambilla), and all four Science Explorers (Zuuri, Wendkuoni, Delwende, Regina). Every SELECT updates confirmation.
- [ ] 3D suit palette changes to the chosen character in training.
- [ ] CHOOSE ASTRONAUT opens a 12-person modal with 4 names under each role; a tap updates the suit instantly without UI duplication or jitter.
- [ ] Quit/reopen retains chosen astronaut; setting continues into flight HUD.
- [ ] No changes to old saves that destroy training rewards or settings.

## Beginner Earth launch
- [ ] Complete Phase 1 training, enter spacecraft by pressing INTERACT near rocket.
- [ ] Launch scene starts in Ready, with altitude zero and launch button enabled.
- [ ] Launch starts ascent, altitude and velocity increase and fuel/mass decrease.
- [ ] Throttle ± modifies acceleration and mass-flow; pitch ± modifies steering in manual mode.
- [ ] Assisted flight ON adjusts pitch, and can be disabled using real controls.
- [ ] Stage separation starts disabled; lights up at the allowed stage-one fuel threshold.
- [ ] Staging removes lower stage mesh; mass falls; stage two uses fuel two.
- [ ] GUIDED ORBIT remains disabled until stage two and threshold altitude/speed.
- [ ] Guided orbit updates state to orbit; modal displays science points, no premature Moon claim.
- [ ] Flight failure allows retry; orbit rewards granted once only, even on retries.
- [ ] Workshop tank/booster choices visibly affect fuel/mass and flight.

## Save / offline
- [ ] Pause preserves altitude, stage, speed, fuel and mission step.
- [ ] Continue after app restart resumes correct stage, not a new rocket.
- [ ] Corrupt main save recovers from backup, without crashing.
- [ ] Existing Phase 1 saves remain readable.
- [ ] Airplane mode, fresh install and cold start work; zero network requests.

## Android/device and performance
- [ ] Godot Android export templates installed; debug APK generated and installed.
- [ ] On Tecno Spark 10 Pro: landscape layout, buttons and astronaut joystick respond correctly.
- [ ] Multi-touch movement+camera+action remains stable; no shaking or stuck touch state.
- [ ] 30 FPS baseline (Low preset), monitor draw calls and RAM; verify under thermal load.
- [ ] Android Back pauses, Resume works; terminate/reopen resumes from save.
- [ ] No INTERNET permission in final Android manifest.
- [ ] Production signing keystore secured and signed AAB validated locally.

- [ ] On Earth, CHOOSE ASTRONAUT opens an in-game roster; switching updates suit and saves.
- [ ] Upgrading an old save chooses Nambe/Ayiiga/Zuuri for legacy Nova/Kofi/Zuri, preserving missions.
