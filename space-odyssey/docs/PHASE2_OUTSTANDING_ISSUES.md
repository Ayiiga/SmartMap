# Phase 2 outstanding issues and limitations — 2026-11-20

## Critical verification gates
1. **Godot editor unavailable in authoring environment.** Static references and mathematical reachability checks are not runtime evidence. Run Godot import, parse checks, smoke tests and playtests; fix discovered issues before merging.
2. **No Android debug APK or signed AAB built.** No Android SDK, export templates or device session were available. Package only after the Godot runtime gates pass.
3. **No physical-device touch or performance evidence.** UI overlaps, multi-touch races, portrait orientation, thermal degradation and camera jitter remain to be checked on Tecno Spark 10 Pro.

## Intended scope limits
4. **Not a true orbit solver.** Thrust/gravity/mass-loss are simplified and orbit is a guided checkpoint; explicit UI text prevents conflating arcade training with realistic orbital mechanics.
5. **No Moon transfer or lunar landing.** These remain future work, not placeholder buttons advertised as functional.
6. **Rocket parts not independently attachable.** Workshop sliders for fuel tanks and boosters affect flight mass/fuel. Procedural visual rocket meshes are original and low-poly.
7. **No embedded audio samples.** Menu/touch animations exist; volume setting is retained, but custom sound design has not been implemented.
8. **Existing save compatibility needs runtime testing.** New JSON fields default safely on loading old saves; retain save backups for verification.
9. **No confirmed 30/60 FPS performance.** Shadowless procedural objects and local coordinates are low-cost design decisions, not device benchmarks.

## Recommended immediate local verification
Run both Python contract checks, perform Godot headless editor import and both GDScript smoke tests, manually play through the Earth training→rocket→orbit loop, then export/install a debug APK and verify in airplane mode. Log actual errors and change only the responsible scripts.

## Migration package audit update — 20 November 2026
- Source change: replaced four raw multiline quoted strings in `scripts/world/launch_world.gd` with explicit escaped newlines.
- Source regression gate: `tests/phase2_release_contract_check.py` now scans all `.gd` sources for raw newlines in ordinary quoted strings and validates Android/asset paths.
- Original standalone Phase 2 project is preserved separately; this migration kit is an independently edited copy.
- Critical remaining issue: Godot engine has not compiled this revised copy; do not produce APK/download success claims without passing the actual workflow.
