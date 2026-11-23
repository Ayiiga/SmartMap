"""Regression guard for one-tap beginner launch and offline procedural 3D models."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
core = (ROOT / "scripts/core/game_state.gd").read_text()
menu = (ROOT / "scripts/ui/main_menu.gd").read_text()
training = (ROOT / "scripts/world/training_world.gd").read_text()
flight = (ROOT / "scripts/world/launch_world.gd").read_text()
astronaut = (ROOT / "scripts/player/astronaut.gd").read_text()
vehicle = (ROOT / "scripts/rocket/rocket_vehicle.gd").read_text()
art = (ROOT / "scripts/rocket/rocket_art.gd").read_text()
assert "func new_rocket_game()" in core
assert "func start_launch_mission(" in core
assert "if not training_complete:" not in core.split("func start_launch_mission(", 1)[1].split("func record_flight_step(", 1)[0]
assert "AUTO PHOTO MISSION" in menu and "CLASSIC ROCKET PILOT" in menu and "ASSEMBLE 3 ASTRONAUTS" in menu
assert "EARTH TRAINING (OPTIONAL)" in menu
assert "START ROCKET MISSION" in training
assert 'RocketArt.build(self, 2)' in training
assert "func _next_step()" in flight
assert "ENTER EARTH ORBIT" in flight
assert "_auto_step_timer" in flight
assert "RocketArt.build(self, boosters)" in vehicle
assert "func _build_suit()" in astronaut and "CapsuleMesh" in astronaut
assert "CylinderMesh" in art and "SphereMesh" in art
assert "http" not in art and "http" not in astronaut
print("PASS: optional training, immediate launch, one-action assisted flight and offline 3D astronaut/rocket models")
