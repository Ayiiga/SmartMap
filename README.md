# SPACE ODYSSEY — Journey Beyond Earth 🚀

**Offline 3D Android space adventure built with Godot 4 and GDScript.**

This repository is being converted from SmartMap to SPACE ODYSSEY. The new game is maintained in [`space-odyssey/`](./space-odyssey/), with its [Godot project](./space-odyssey/project.godot) and [Android APK build workflow](./.github/workflows/space-odyssey-android.yml).

## Current gameplay scope

- Select from 12 astronauts: Flight Cadets (Nambe, Ndaani, Mambooda, Abiola), Rocket Pilots (Ayiiga, Atia, Mpoko, Yambilla), and Science Explorers (Zuuri, Wendkuoni, Delwende, Regina)
- Complete Earth training and enter the rocket
- Launch with throttle, altitude, velocity, fuel, and mass instrumentation
- Separate rocket stages, reach simplified guided orbit, save and resume
- Offline play, landscape orientation, and Android Compatibility rendering

Moon transfer and lunar landing are not yet implemented. The source requires actual Godot compilation, APK export, and on-device quality assurance before public release.

## Install on Android

Check the [Android build workflow](./.github/workflows/space-odyssey-android.yml) for a **successful run containing the `SPACE-ODYSSEY-Android-Debug` artifact**. Download that APK and install it for testing only. No APK may be claimed available until export completes. The compiled game does not require a login or internet connection.

## Migration safeguards

This feature branch preserves the old `gigalearn/` Next.js site and `app/` Android starter while validation is under way, avoiding destructive changes to existing data or deployments. The new product's code is in `space-odyssey/`. Retire the old SmartMap implementation only after the new game passes Godot and physical-device tests.

## Development

See [Game README](./space-odyssey/README.md) and [Phase 2 test checklist](./space-odyssey/docs/PHASE2_TEST_CHECKLIST.md).
