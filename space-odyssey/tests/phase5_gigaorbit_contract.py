"""GigaOrbit Milestone 1 and Moon EVA source contracts.
Source-only assertions: Godot parser, gameplay runtime and Android device require separate evidence.
"""
from pathlib import Path
R = Path(__file__).resolve().parents[1]
read = lambda path: (R / path).read_text(encoding="utf-8")
project = read("project.godot")
preset = read("export_presets.cfg")
menu = read("scripts/ui/main_menu.gd")
rocket = read("scripts/rocket/rocket_vehicle.gd")
flight = read("scripts/world/launch_world.gd")
eva = read("scripts/world/moon_eva.gd")
state = read("scripts/core/game_state.gd")
landing = read("scripts/world/planet_landing.gd")
store = read("scripts/core/save_store.gd")

assert 'config/name="GigaOrbit: Beyond Earth"' in project
assert 'package/name="GigaOrbit: Beyond Earth"' in preset
assert 'package/unique_name="com.giga3enterprise.spaceodyssey.missionpreview"' in preset
assert 'permissions/internet=false' in preset
assert 'GigaOrbit' in menu and 'BEYOND EARTH' in menu
assert 'GIGAORBIT 01' in read("scripts/rocket/rocket_art.gd")
assert (R / "scripts/flight/flight_stick.gd").is_file()
assert 'signal axis_changed' in read("scripts/flight/flight_stick.gd")
for method in ('steer_yaw', 'snapshot', 'restore'):
    assert f'func {method}(' in rocket
assert all(name in rocket for name in ('heading_deg', 'east_m', 'north_m'))
assert 'FLIGHT_STICK.new()' in flight and 'steer_yaw(' in flight
assert 'Vector3(0, 6.2, 19.5)' in flight
assert (R / "scenes/world/moon_eva.tscn").is_file()
assert 'ASTRONAUT_SCENE.instantiate()' in eva
assert 'planet_gravity = 1.62' in eva
assert 'GameState.collect_moon_sample()' in eva
assert 'GameState.complete_moon_eva()' in eva
assert 'GameState.begin_moon_eva()' in landing
for name in ('begin_moon_eva', 'collect_moon_sample', 'complete_moon_eva', 'save_moon_eva_position'):
    assert f'func {name}(' in state
for key in ('moon_eva_complete', 'moon_eva_sample_collected', 'moon_eva_position'):
    assert f'"{key}":' in state
    assert f'data.get("{key}"' in state
assert 'FILE_PATH: String = "user://odyssey_save.json"' in store
assert 'VERSION: int = 1' in store
print("PASS: GigaOrbit branding, package/save compatibility, steering, Moon EVA, sample return and offline contracts")
print("NOT VERIFIED: actual Earth-to-Moon gameplay, physical phone touch/FPS, production release")
