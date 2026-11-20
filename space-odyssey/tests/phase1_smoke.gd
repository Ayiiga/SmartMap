extends SceneTree
## Run using: godot --headless --path . --script res://tests/phase1_smoke.gd
## Read-only checks; does not overwrite user saves.
const ROCKET = preload("res://scripts/rocket/rocket_math.gd")

func _initialize() -> void:
	call_deferred("_run_checks")

func _run_checks() -> void:
	var errors: Array[String] = []
	var scenes: Array[String] = [
		"res://scenes/ui/main_menu.tscn",
		"res://scenes/ui/settings_screen.tscn",
		"res://scenes/ui/missions_screen.tscn",
		"res://scenes/ui/discover_screen.tscn",
		"res://scenes/ui/workshop_screen.tscn",
		"res://scenes/ui/mobile_controls.tscn",
		"res://scenes/player/astronaut.tscn",
		"res://scenes/world/training_world.tscn"
	]
	for scene_path: String in scenes:
		var scene_resource: Resource = load(scene_path)
		if not scene_resource is PackedScene:
			errors.append("Invalid scene: " + scene_path)
	var spec_file: FileAccess = FileAccess.open("res://resources/missions/training.json", FileAccess.READ)
	if spec_file == null:
		errors.append("Cannot read mission spec")
	else:
		var parsed: Variant = JSON.parse_string(spec_file.get_as_text())
		if not parsed is Dictionary:
			errors.append("Invalid mission JSON")
		elif (parsed as Dictionary).get("objectives", []).size() != 3:
			errors.append("Expected exactly three training objectives")
	var sample: Dictionary = ROCKET.estimate(1, 0)
	if float(sample.get("wet_mass_kg", 0.0)) <= float(sample.get("dry_mass_kg", 0.0)):
		errors.append("Rocket mass equation invalid")
	if float(sample.get("ideal_delta_v_m_s", 0.0)) <= 0.0:
		errors.append("Rocket delta-v must be positive")
	if not errors.is_empty():
		for problem: String in errors:
			push_error(problem)
		quit(1)
		return
	print("PASS: Phase 1 resource load, mission data and rocket calculator checks")
	quit(0)
