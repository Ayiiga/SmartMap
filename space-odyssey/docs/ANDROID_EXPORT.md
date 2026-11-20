# Android export instructions — SPACE ODYSSEY Phase 2

Source is configured for **landscape**, **Compatibility / OpenGL ES 3.0**, and **arm64-v8a**. This package **does not contain an APK or AAB**, and does not include any private signing keys.

## Debug APK

1. Install a compatible Godot 4.x stable editor, its **matching official Android export templates**, OpenJDK 17 and the Android SDK (via Android Studio or supported Godot setup).
2. In Godot, configure **Editor → Editor Settings → Export → Android** with valid Java SDK and Android SDK paths (the menu location may differ by editor version).
3. Import `project.godot`. Open **Project → Export** and inspect/add the Android preset, even if a starter preset is already listed.
4. Set the package ID to `com.giga3enterprise.spaceodyssey`, app version, and arm64 architecture. Ensure a suitable Android SDK **target API 36 or higher** for Google Play submission requirements as of November 2026. Do not assume Godot's prebuilt templates target that API; check the actual output.
5. Disable INTERNET and ACCESS_NETWORK_STATE permissions, unless required by the engine build for an unrelated reason; an offline game should not request network access. Confirm by inspecting the exported Android manifest.
6. Choose an Android **debug APK**, export to `build/space-odyssey-debug.apk`, and install it on the phone (`adb install -r build/space-odyssey-debug.apk`).
7. Test in **Airplane mode**, close/reopen the app, and reboot the phone before testing Continue. Do not declare offline success from the editor alone.

## Signed Google Play AAB

1. Install the Godot **Gradle Android build template** via **Project → Install Android Build Template** or the equivalent editor option; enable the Gradle build option in the Android export preset.
2. Generate a release keystore outside the repository and keep its passwords confidential. Example: `keytool -genkeypair -v -keystore space-odyssey-upload.jks -alias odyssey-upload -keyalg RSA -keysize 3072 -validity 10000`. Do **not** commit it.
3. In the Android release preset, configure the release keystore path, alias and password; use environment-based secrets in CI.
4. Select **AAB** (Android App Bundle) as the Gradle export format. Increment version code for every Play upload.
5. Export signed release build. Validate certificate, signing, final manifest permissions, target SDK, ABI support, AAB integrity and size. Use Play Console **internal or closed testing** before production.
6. Test on the **Tecno Spark 10 Pro** and at least one lower-spec Android device. Record measured FPS, crashes, touch handling, orientation, save migration and airplane-mode behavior.

## Official references

- https://docs.godotengine.org/en/4.7/tutorials/export/exporting_for_android.html
- https://docs.godotengine.org/en/stable/tutorials/export/android_gradle_build.html
- https://developer.android.com/google/play/requirements/target-sdk

**2026 Google Play requirement:** New standard Android apps submitted after August 31, 2026 must target Android 16 / API 36 or higher, subject to platform-specific exceptions. Check the current developer policy again before submission.

## Current build status

- Android preset file: **included**
- Local engine export templates: **not available in packaging environment**
- Debug APK compiled: **NO**
- Release AAB compiled/signed: **NO**
- Tecno Spark 10 Pro installed-device test: **NOT RUN**
