# Smart Map GitLab Integration

This project is integrated with GitLab project **77966430** ([ayiiga3-group/vibepay](https://gitlab.com/ayiiga3-group/vibepay)).

## CI/CD pipeline

The pipeline in `.gitlab-ci.yml` provides:

| Stage | Job | Purpose |
| --- | --- | --- |
| `environment` | `updateContainer` / `ensureContainer` | Build and push the Android CI Docker image to the GitLab Container Registry |
| `build` | `buildDebug`, `buildRelease` | Compile APKs with fastlane |
| `test` | `testDebug` | Run JVM unit tests |
| `internal` → `production` | Manual publish/promote jobs | Google Play deployment via fastlane `supply` |

Pipeline versioning uses:

- `VERSION_CODE` from `CI_PIPELINE_IID` (monotonic build number)
- `VERSION_SHA` from the first 8 characters of `CI_COMMIT_SHA`

## Required GitLab settings

Enable these in **Settings → CI/CD** for project `77966430`:

1. **Container Registry** — enabled (used by build jobs)
2. **Shared runners** or project runners with Docker-in-Docker support for the `environment` stage

## CI/CD variables

| Variable | Type | Required for | Description |
| --- | --- | --- | --- |
| `SUPPLY_JSON_KEY` | File or masked variable | Play Store publish/promote jobs | Google Play service account JSON from the Play Console |

`SUPPLY_JSON_KEY` is written to `/tmp/google_play_api_key.json` at job runtime. Protect and mask this variable in GitLab.

### Google Play setup

1. Create a service account in Google Cloud with Play Console API access.
2. Download the JSON key.
3. In GitLab: **Settings → CI/CD → Variables** → add `SUPPLY_JSON_KEY` with the JSON contents.
4. Create the app listing in Google Play Console with package name `com.ayiiga3.smartmap`.
5. Run `publishInternal` manually after a successful `buildRelease`.

## Local development parity

```bash
export ANDROID_HOME=/android-sdk-linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export VERSION_SHA=$(git rev-parse --short=8 HEAD)
./gradlew assembleDebug
./gradlew test
```

Optional fastlane commands:

```bash
bundle install
bundle exec fastlane buildDebug
bundle exec fastlane test
```
