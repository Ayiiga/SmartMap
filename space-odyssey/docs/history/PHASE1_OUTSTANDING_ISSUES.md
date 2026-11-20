# Phase 1 — outstanding issues and development log (20 Nov 2026)

**Created:** A Godot 4.x project with local `.tscn`, GDScript game systems, procedural Earth training environment, mission JSON, desktop/mobile controls, menu screens, local save/checkpoint system, rocket calculator and documentation.

**Static verification:** PASS via `python3 tests/phase1_contract_check.py`. The first check revealed an incorrect expected project settings key in the *checker*, which was fixed and re-run successfully; it was not an engine compilation failure.

**Runtime compilation:** NOT RUN (no Godot engine binary in packaging environment).
**Android export:** NOT RUN (Android SDK/export templates unavailable).
**Live phone test:** NOT RUN.
**GitHub changes:** NONE — the existing SmartMap repository and production branches were not modified.

## Priority blockers

1. **P0:** Import in official Godot editor, identify/fix any parser or scene errors; then run headless smoke test.
2. **P0:** Play through 3 training objectives, verify collision, camera, touch input, pause, checkpoint and no repeat reward.
3. **P0:** Verify Android export templates, target API 36+, signing, install and airplane-mode tests.
4. **P1:** Confirm Godot 4.x `export_presets.cfg` compatibility; regenerate preset from editor if necessary.
5. **P1:** Tune touch target size and GUI safe areas on physical landscape Android displays.
6. **P1:** Verify backup save migration and recovery using deliberately corrupted copies in test user data.
7. **P2:** Optimize detailed graphical settings; current graphics preference is stored but not applied as a separate visual quality setting.
8. **P2:** Add more polished model assets, procedural animation and local sound design only after gameplay stability.

## Next increments

- Phase C: boarding, rocket assembly, modular parts and staging.
- Phase D: launchpad, physical thrust, fuel/mass, altitude and safety reset.
- Phase E: local orbital state and guided transfer (long-range travel abstracted, no massive coordinates).
- Phase F: lunar terrain, landing burn and touchdown.
- Phase G: Moon EVA, sample collection and rewards.
- Phase H/I: full save migration and Android performance/export quality gates.
- Phase J: Mars expansion only when Earth→Moon loop is demonstrated.
