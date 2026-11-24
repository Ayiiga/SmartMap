from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
read = lambda p: (ROOT / p).read_text()
audio = read("scripts/core/game_audio.gd")
state = read("scripts/core/game_state.gd")
settings = read("scripts/ui/settings_screen.gd")
ship = read("scripts/world/launch_world.gd")
comets = read("scripts/world/comet_field.gd")
menu = read("scripts/ui/main_menu.gd")
project = read("project.godot")
export = read("export_presets.cfg")
mission = json.loads(read("resources/missions/comet_001.json"))
assert mission["id"] == "comet_001"
assert mission["success_conditions"]["min_dodged"] == 8
assert mission["rewards"]["science_points_first_clear"] == 80
assert 'GameAudio="*res://scripts/core/game_audio.gd"' in project
assert "general/text_to_speech=true" in project
assert "res://scenes/world/comet_field.tscn" in state
assert "func start_comet_mission()" in state
assert "comet_best" in state and "comet_completed" in state
for setting in ["music_enabled", "music_volume", "sound_enabled", "sound_volume", "voice_enabled", "volume", "graphics", "assisted_controls"]:
    assert setting in settings and setting in state, setting
assert 'var _loading: bool = true' in settings
assert "GameState.save_settings()" in settings
for button in ["TEST ROCKET SOUND", "TEST SHIP SPEAKER", "RESET SETTINGS", "BACK TO MENU", "SAVE SETTINGS"]:
    assert button in settings, button
assert "signal radio_message" in audio
assert "AudioStreamWAV" in audio
assert "assets/audio/afro_space_theme.ogg" in audio
assert "theme.loop = true" in audio
theme_path = ROOT / "assets/audio/afro_space_theme.ogg"
assert theme_path.is_file(), "Original music file not bundled"
assert theme_path.stat().st_size > 100_000
with theme_path.open("rb") as theme:
    assert theme.read(4) == b"OggS"
assert "tts_get_voices_for_language" in audio
assert "no external" in audio.lower() or "No copyrighted" in audio
assert "SHIP RADIO" in comets and "MOVE LEFT" in comets and "MOVE RIGHT" in comets
assert "SCAN NEXT COMET" in comets and "REPEAT LAST WARNING" in comets
assert "SHIELDS" in comets and "REQUIRED_DODGES" in comets
assert "GameState.record_comet_result" in comets
assert "DODGE COMETS" in ship
assert "REQUEST ROCKET STATUS" in ship and "WHAT SHOULD I DO NEXT?" in ship
assert "MISSIONS & PLANETS" in menu
assert "PLAY COMET DODGE" in read("scripts/ui/missions_screen.gd")
assert "package/version_code=7" in export
assert "permissions/internet=false" in export
print("PASS: offline audio settings, original rhythm, optional TTS, comet dodge controls and mission progression")
