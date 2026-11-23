"""Photo-based GigaOrbit mission source contract.
Automated source checks, not a substitute for real-device visual performance QA.
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
read = lambda p: (root / p).read_text(encoding="utf-8")
mission = read("scripts/world/photo_mission.gd")
menu = read("scripts/ui/main_menu.gd")
state = read("scripts/core/game_state.gd")
scene = read("scenes/world/photo_mission.tscn")
shader = read("assets/shaders/rocket_photo_mask.gdshader")
workflow = Path(__file__).resolve().parents[2] / ".github/workflows/space-odyssey-android.yml"
for name in ("launch-rocket.webp", "earth-orbit.webp", "lunar-rover.webp", "astronaut-eva.webp"):
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
assert "photo_mission.tscn" in menu
assert 'current_mission == "photo_earth_moon"' in state
assert "[node name=\"PhotoMission\" type=\"Control\"]" in scene
assert "shader_type canvas_item" in shader
assert "permissions/internet=false" in read("export_presets.cfg")
assert "phase7_photo_contract.py" in workflow.read_text(encoding="utf-8"), "Photo mission not covered by build gate"
print("PASS: playable image-layered 2.5D mission assets, controls, rewards, offline checkpoint routing")
print("NOT VERIFIED: photographic sprite quality and 30 FPS on a real Android phone")
