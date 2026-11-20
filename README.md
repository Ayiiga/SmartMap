# SPACE ODYSSEY — Journey Beyond Earth 🚀

**Offline 3D Android space adventure built with Godot 4 and GDScript.**

This repository is being converted from SmartMap to SPACE ODYSSEY. The new game is maintained in [`space-odyssey/`](./space-odyssey/), with its [Godot project](./space-odyssey/project.godot) and [Android APK build workflow](./.github/workflows/space-odyssey-android.yml).

## Current gameplay scope

- Select from 12 astronauts: Flight Cadets (Nambe, Ndaani, Mambooda, Abiola), Rocket Pilots (Ayiiga, Atia, Mpoko, Yambilla), and Science Explorers (Zuuri, Wendkuoni, Delwende, Regina)
- Complete Earth training and enter the rocket
- Launch with throttle, altitude, velocity, fuel, and mass instrumentation
- Separate rocket stages, reach simplified guided orbit, save and resume
- Offline play, landscape orientation, and Android Compatibility rendering

**New in v0.3.0:** Original offline African-inspired WAV soundtrack, separate music/sound/voice settings, ship radio with interactive prompts and optional Android TTS, and a 3D Comet Corridor with shields, touch dodging and local best-score progression. Comet Corridor unlocks after Earth orbit.

Moon transfer and lunar landing are not yet implemented. Godot compilation and Android APK export have passed GitHub Actions, but physical-device gameplay testing and production release signing remain outstanding.

## Install on Android

Download the [SPACE ODYSSEY Radio, Music & Comets Android APK](https://raw.githubusercontent.com/Ayiiga/SmartMap/space-odyssey-apk/SPACE_ODYSSEY_Radio_Comets_Audio.apk) (public GitHub direct download; **debug preview only**). The [successful Godot build](https://github.com/Ayiiga/SmartMap/actions/runs/44833438113) and [public APK publication](https://github.com/Ayiiga/SmartMap/actions/runs/44833431499) are verifiable. After download, open the APK in Android and choose **Install**. Once installed, gameplay does not need an internet connection or Godot editor. If Android refuses to update an older version, its debug signing key may differ; uninstalling the old preview can delete its local saved games.

**First-time controls:** Tap **PLAY ROCKET NOW**, follow **LAUNCH → SEPARATE STAGE → ENTER ORBIT**, then open **SPACE MISSION · DODGE COMETS**. Tap **SHIP RADIO / TALK** for scan and instructions. Open **SETTINGS · MUSIC / SPEAKER** to test and control sounds. Spoken dialogue needs an offline English TTS voice installed on the phone; captions and beeps always work.

## Migration safeguards

The new Godot game has merged into `main`; the old `gigalearn/` Next.js site and `app/` Android starter are preserved, avoiding destructive changes to existing data or deployments. The new product's code is in `space-odyssey/`. Retire the old SmartMap implementation only after the new game passes Godot and physical-device tests.

## Development

See [Game README](./space-odyssey/README.md) and [Phase 2 test checklist](./space-odyssey/docs/PHASE2_TEST_CHECKLIST.md).
