# Run SPACE ODYSSEY on your Android phone

**This source has not yet passed real Godot engine compilation.** The ZIP is not itself an APK, and the steps below may reveal GDScript errors that need fixing.

1. Install the official **Godot Engine 4** editor on Android: https://play.google.com/store/apps/details?id=org.godotengine.editor.v4
2. Download `SPACE_ODYSSEY_Godot_Phase2_Crew12_Source.zip` from the conversation. Extract it into a folder (or use Godot's ZIP import if offered).
3. Open Godot → Import → choose `SPACE_ODYSSEY_Phase2/project.godot`. Allow file access and wait for resource import.
4. Press Play to **test** the game in the editor. Choose a flight cadet, pilot or science explorer, start training and try the rocket flight. Report any error messages before exporting.
5. For a **standalone test APK**, open Project → Export → Android, install matching export templates if requested and configure the Android export preset. Try Export Project → Debug APK. Install it from Files once a valid APK has been generated.
6. If the editor requests Gradle build support, install the official companion **GABE**: https://play.google.com/store/apps/details?id=org.godotengine.godot_gradle_build_environment and follow its prompts. The first export can download SDK/build dependencies and therefore requires internet; the finished game itself is intended to run offline.
7. On the phone, test Airplane mode, orientation, joystick and camera, all 12 astronauts, boarding, throttle, stage separation, orbit, Save/Continue and retry.

Official source: https://godotengine.org/article/gabe-stable-release/ (2 June 2026). Godot's mobile editor interface can be difficult without a mouse/keyboard.
