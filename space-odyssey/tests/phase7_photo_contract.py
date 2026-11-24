"""Photo-based GigaOrbit mission source contract.
Automated source checks, not a substitute for real-device visual performance QA.
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
read = lambda p: (root / p).read_text(encoding="utf-8")
mission = read("scripts/world/photo_mission.gd") + read("scripts/flight/photo_flight.gd")
menu = read("scripts/ui/main_menu.gd")
state = read("scripts/core/game_state.gd")
scene = read("scenes/world/photo_mission.tscn")
workflow = Path(__file__).resolve().parents[2] / ".github/workflows/space-odyssey-android.yml"
for name in ("earth-launchpad.webp", "earth-orbit.webp", "moon-surface.webp", "eva-suit.webp", "moon-rover.webp", "lunar-sample.webp", "eva-antenna.webp",
             "lunar-lander.webp", "heavy-lift-rocket.webp", "orbital-craft.webp",
             "earth-stratosphere.webp", "cislunar-starfield.webp", "lunar-touchdown-dust.webp"):
    assert (root / "assets/textures" / name).is_file(), name
    assert f'res://assets/textures/{name}' in mission, f"Photo not integrated into playable scene: {name}"
for key in ("launch", "transfer", "landing", "explore", "complete"):
    assert f'"{key}"' in mission, f"Missing playable mission phase: {key}"
for control in ("_steer", "_braking", "_throttle", "_gear", "_rover", "_samples"):
    assert control in mission, f"Missing interactive game control: {control}"
for func in ("_complete_orbit", "_finish_landing", "_collect_or_return",
             "_save_checkpoint", "_restore_checkpoint", "_clear_checkpoint", "_refresh_photo"):
    assert f"func {func}(" in mission
for safe_api in ("GameState.record_flight_step", "GameState.award_landing",
                 "GameState.collect_moon_sample", "GameState.complete_moon_eva",
                 "GameState.buy_supply", "GameState.use_supply"):
    assert safe_api in mission, f"Game progression not attached to persistent wallet: {safe_api}"
assert "GameState.start_earth_launch" in menu and "photo_fresh_launch" in state
for new_control in ("_cycle_camera", "_change_zoom", "_perform_eva_action", "_select_eva_mission", "_auto_eva_mission"):
    assert f"func {new_control}(" in mission, f"Missing interactive feature: {new_control}"
for task in ("Lunar Repair Specialist", "Lunar Flag Explorer", "Ghana flag raised"):
    assert task in mission, f"Missing playable EVA event: {task}"
assert 'camera_mode' in state and 'camera_zoom' in state
settings = read("scripts/ui/settings_screen.gd")
assert 'func _setting_row(' in settings and 'CAMERA VIEW' in settings and 'RADIO VOICE VOLUME' in settings
assert 'var grid: GridContainer' not in settings, "Old Android settings label overflow regression"
assert '"photo_earth_moon"' in state and '"photo_transfer_moon"' in state
assert 'PHOTO_MISSION if planet == "moon" else TRANSFER' in state, "Moon transfer still uses primitive 3D scene"
assert 'current_mission = "photo_transfer_moon"' in state, "Legacy saved Moon transfer not migrated"
assert 'far_pan' in mission and '_eva_x / 100.0' in mission, "Moon EVA photo must move with player"
assert 'ANDROID UI v3' in settings
assert 'CenterContainer.new()' not in settings, "Settings still uses compressed layout"
assert 'var row: VBoxContainer = _setting_row(' in settings
assert "[node name=\"PhotoMission\" type=\"Control\"]" in scene
assert "permissions/internet=false" in read("export_presets.cfg")
assert "phase7_photo_contract.py" in workflow.read_text(encoding="utf-8"), "Photo mission not covered by build gate"
print("PASS: playable image-layered 2.5D mission assets, controls, rewards, offline checkpoint routing")
print("NOT VERIFIED: photographic sprite quality and 30 FPS on a real Android phone")
