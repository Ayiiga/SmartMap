"""GigaOrbit Android low-obstruction HUD, real consumables and bundled visual regression gate.
Source checks only; the engine CI verifies parser, scene startup, tests and signed debug APK.
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
read = lambda p: (root / p).read_text(encoding="utf-8")
launch = read("scripts/world/launch_world.gd")
land = read("scripts/world/planet_landing.gd")
art = read("scripts/rocket/rocket_art.gd")
menu = read("scripts/ui/main_menu.gd")
ui = read("scripts/ui/space_ui.gd")
shop = read("scripts/ui/workshop_screen.gd")
state = read("scripts/core/game_state.gd")
lander = read("scripts/flight/odyssey_lander.gd")
eva = read("scripts/world/moon_eva.gd")

assets = ("gigaorbit-icon.webp", "earth-orbit.webp", "earth-launchpad.webp",
          "moon-surface.webp", "eva-suit.webp")
for name in assets:
    photo = root / "assets" / "textures" / name
    assert photo.is_file() and 10_000 < photo.stat().st_size < 5_000_000, f"missing real photo {name}"
    binary = photo.read_bytes()
    assert binary[:4] == b"RIFF" and binary[8:12] == b"WEBP", f"invalid WebP: {name}"
assert "res://assets/textures/earth-orbit.webp" in ui
assert "res://assets/textures/gigaorbit-icon.webp" in menu
assert "func build_lander(" in art and 'gear_nodes' in art
assert "RocketArt.build_lander(self)" in land and "RocketArt.build_lander(self)" in eva
assert 'FLIGHT_STICK.new()' in land and 'FLIGHT_STICK.new()' in launch
assert 'stick.connect("axis_changed"' in land and 'stick.connect("axis_changed"' in launch
assert 'buttons.offset_right = 1150' not in land, "old five-button row still obscures the viewport"
assert 'lower.anchor_left = 0.25' not in land, "oversized center-bottom panel is still on screen"
assert "FUEL +35" in land and "func _refuel(" in land
assert "func refuel(" in lander and "fuel_capacity" in lander
for method in ("buy_supply", "use_supply", "repair_lander_checkpoint"):
    assert f"func {method}(" in state
assert '"supplies": supplies' in state and 'data.get("supplies"' in state
assert 'GameState.buy_supply' in shop
assert "GEAR" in land and "▲ BRAKE" in land
assert "TROPHIES & AWARDS" in menu and "MISSIONS & PLANETS" in menu
assert "permissions/internet=false" in read("export_presets.cfg")
print("PASS: bundled WebP art, unobstructed joystick HUD, usable fuel/repair supplies, persisted coins and true lander model")
print("NOT VERIFIED: physical Android phone rendering, touch latency, actual quality or 30fps")
