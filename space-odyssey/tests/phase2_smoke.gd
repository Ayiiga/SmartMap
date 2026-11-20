extends SceneTree
## Requires actual Godot editor: godot --headless --path . --script res://tests/phase2_smoke.gd
## Does not modify user progress or write to user://.
const VEHICLE_SCENE = preload("res://scenes/rocket/trainer_rocket.tscn")
const Crew = preload("res://scripts/player/crew_catalog.gd")

func _initialize() -> void:
	call_deferred("_check")

func _check() -> void:
	var issues: Array[String] = []
	if Crew.IDS.size() != 12:
		issues.append("Expected 12 astronauts in three groups")
	if Crew.GROUPS.size() != 3:
		issues.append("Expected three astronaut roles")
	var unique_names: Dictionary = {}
	for role: String in Crew.GROUPS:
		var role_members: Array = Crew.GROUPS[role]
		if role_members.size() != 4:
			issues.append("Role must contain four astronauts: " + role)
		for crew_id: String in role_members:
			if str(Crew.profile_for(crew_id).get("name", "")) == "":
				issues.append("Crew missing: " + crew_id)
			unique_names[crew_id] = true
	if unique_names.size() != 12:
		issues.append("Astronaut identifiers must be unique")
	for legacy: String in Crew.LEGACY_NAMES:
		if Crew.normalize_id(legacy) != str(Crew.LEGACY_NAMES[legacy]):
			issues.append("Save migration mismatch: " + legacy)
	for scene: String in ["res://scenes/ui/crew_screen.tscn", "res://scenes/world/launch_world.tscn", "res://scenes/rocket/trainer_rocket.tscn"]:
		if not load(scene) is PackedScene:
			issues.append("Missing scene: " + scene)
	var vehicle: RocketVehicle = VEHICLE_SCENE.instantiate() as RocketVehicle
	root.add_child(vehicle)
	vehicle.assisted = true
	if vehicle.can_separate() or vehicle.can_insert_orbit():
		issues.append("Stage/orbit cannot be ready before launch")
	if not vehicle.ignite():
		issues.append("Ignition failed")
	var before: float = vehicle.current_mass_kg()
	vehicle._physics_process(1.0 / 60.0)
	if vehicle.current_mass_kg() >= before or vehicle.altitude_m <= 0.0:
		issues.append("Thrust did not consume fuel or increase altitude")
	var loops: int = 0
	while not vehicle.can_separate() and loops < 3000 and vehicle.phase != RocketVehicle.Phase.FAILED:
		vehicle._physics_process(1.0 / 60.0)
		loops += 1
	if not vehicle.can_separate():
		issues.append("Stage separation never unlocked")
	else:
		var mass_before: float = vehicle.current_mass_kg()
		if not vehicle.separate_stage():
			issues.append("Stage separator did not respond")
		if vehicle.current_mass_kg() >= mass_before:
			issues.append("Separating did not reduce vehicle mass")
	var saved: Dictionary = vehicle.snapshot()
	var resumed: RocketVehicle = VEHICLE_SCENE.instantiate() as RocketVehicle
	root.add_child(resumed)
	resumed.restore(saved)
	if absf(resumed.altitude_m - vehicle.altitude_m) > 0.01 or resumed.phase != vehicle.phase:
		issues.append("Flight checkpoint restore mismatch")
	loops = 0
	while not resumed.can_insert_orbit() and loops < 5000 and resumed.phase != RocketVehicle.Phase.FAILED:
		resumed._physics_process(1.0 / 60.0)
		loops += 1
	if not resumed.can_insert_orbit():
		issues.append("Guided orbit never unlocked")
	elif not resumed.insert_guided_orbit():
		issues.append("Orbit insertion failed")
	elif resumed.phase != RocketVehicle.Phase.ORBIT:
		issues.append("Orbit state not reached")
	for problem: String in issues:
		push_error(problem)
	if not issues.is_empty():
		quit(1)
		return
	print("PASS: Twelve astronauts across three roles, phase 2 scenes, fuel burn, staging, checkpoint, guided orbit")
	quit(0)
