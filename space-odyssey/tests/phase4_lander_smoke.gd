extends SceneTree
## Engine smoke: simulate actual Moon + Mars touchdown, staging and recovery physics.
const Lander = preload("res://scripts/flight/odyssey_lander.gd")

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var errors: Array[String] = []
	for planet: String in ["moon", "mars"]:
		var lander: OdysseyLander = Lander.new()
		lander.configure(planet, 1, 1, 1)
		if lander.gravity() <= 0.0 or lander.fuel <= 0.0:
			errors.append("Planet physics not initialized: " + planet)
		var loops: int = 0
		lander.deploy_legs()
		while not lander.landed and not lander.crashed and loops < 12000:
			var desired: float = -clampf(lander.altitude_m / 28.0, 2.0, 6.0)
			var feedback: float = (desired - lander.vertical_velocity_m_s) * 0.8
			lander.set_throttle((lander.gravity() + feedback) / lander.acceleration())
			var move: float = 0.0
			if lander.horizontal_m > 1.0 or (absf(lander.horizontal_m) < 1.0 and lander.horizontal_velocity_m_s > 1.0):
				move = -1.0
			elif lander.horizontal_m < -1.0 or (absf(lander.horizontal_m) < 1.0 and lander.horizontal_velocity_m_s < -1.0):
				move = 1.0
			lander.advance(1.0 / 60.0, move)
			loops += 1
		if not lander.landed:
			errors.append("Safe guided %s landing never completed (alt %.1f x %.1f)" % [planet, lander.altitude_m, lander.horizontal_m])
		if lander.grade() not in ["S", "A+", "A", "B", "C"]:
			errors.append("Invalid landing grade: " + planet)
		var damaged: OdysseyLander = Lander.new()
		damaged.configure(planet, 1, 1, 1)
		damaged.set_throttle(0.0)
		loops = 0
		while not damaged.crashed and loops < 5000:
			damaged.advance(1.0 / 60.0, 0.0)
			loops += 1
		if not damaged.crashed:
			errors.append("Unbraked lander failed to crash on " + planet)
		var checkpoint: Dictionary = damaged.snapshot()
		var restored: OdysseyLander = Lander.new()
		restored.configure(planet, 1, 1, 1)
		if not restored.restore(checkpoint):
			errors.append("Checkpoint restore failed: " + planet)
	var mismatched: OdysseyLander = Lander.new()
	mismatched.configure("mars", 1, 1, 1)
	if mismatched.restore({"planet": "moon", "altitude": 150.0}):
		errors.append("Recovery accepted checkpoint from another planet")
	for issue: String in errors:
		push_error(issue)
	if not errors.is_empty():
		quit(1)
		return
	print("PASS: Moon/Mars guided touchdown, actual gravity, grades, crash and planet-bound checkpoint restore")
	quit(0)
