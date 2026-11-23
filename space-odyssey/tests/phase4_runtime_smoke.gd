extends Node
## Real scene startup smoke test. Run as a main-scene override so autoloads exist.
## This is not a physical Android touchscreen or rendering quality test.
var failures: Array[String] = []

func _ready() -> void:
	call_deferred("_run")

func _run() -> void:
	GameState.coins = 2000
	GameState.flight_complete = true
	GameState.flight_rewards_claimed = true
	GameState.crew_confirmed = true
	GameState.completed_planets["moon"] = true
	GameState.upgrades["engine"] = 2
	GameState.upgrades["landing_gear"] = 2
	GameState.moon_eva_sample_collected = false
	GameState.moon_eva_complete = false
	for name: String in ["main_menu", "crew_screen", "missions_screen", "workshop_screen", "rewards_screen", "settings_screen"]:
		await _probe("res://scenes/ui/%s.tscn" % name, name)
	await _probe("res://scenes/world/launch_world.tscn", "launch_world")
	GameState.destination_planet = "moon"
	await _probe("res://scenes/world/planet_transfer.tscn", "planet_transfer")
	await _probe("res://scenes/world/planet_landing.tscn", "planet_landing")
	await _probe("res://scenes/world/moon_eva.tscn", "moon_eva")
	GameState.destination_planet = "mars"
	await _probe("res://scenes/world/planet_transfer.tscn", "planet_transfer")
	await _probe("res://scenes/world/planet_landing.tscn", "planet_landing")
	await _probe("res://scenes/world/photo_mission.tscn", "photo_mission")
	for failure: String in failures:
		push_error(failure)
	if failures.is_empty():
		print("PASS: Main menu, crew, flight joystick, Moon/Mars landers and playable photo-based Earth-to-Moon flight/EVA")
		get_tree().quit(0)
	else:
		get_tree().quit(1)

func _probe(path: String, screen: String) -> void:
	var packed: PackedScene = load(path) as PackedScene
	if packed == null:
		failures.append("Missing playable scene: " + path)
		return
	var node: Node = packed.instantiate()
	get_tree().root.add_child(node)
	await get_tree().process_frame
	if not is_instance_valid(node):
		failures.append("Scene disappeared unexpectedly: " + path)
		return
	match screen:
		"main_menu":
			_expect_button(node, "ASSEMBLE 3 ASTRONAUTS", screen)
			_expect_button(node, "MISSIONS & PLANETS", screen)
		"missions_screen":
			_expect_button(node, "FLY TO THE MOON", screen)
			_expect_button(node, "FLY TO MARS", screen)
		"crew_screen":
			_expect_button(node, "CONFIRM 3 CREW", screen)
			_expect_button(node, "NAMBE", screen, false)
		"workshop_screen":
			_expect_button(node, "SAVE ROCKET DESIGN", screen)
		"settings_screen":
			_expect_button(node, "TEST ROCKET SOUND", screen)
		"rewards_screen":
			_expect_button(node, "UPGRADE ROCKET", screen)
		"planet_transfer":
			_expect_button(node, "BEGIN GUIDED TRANSFER", screen)
		"launch_world":
			if node.find_child("FlightStick", true, false) == null:
				failures.append("GigaOrbit rocket steering joystick missing")
		"moon_eva":
			_expect_button(node, "PAUSE / SAVE", screen)
			var astronaut: Node3D = node.get("_player") as Node3D
			if astronaut == null:
				failures.append("Moon EVA astronaut missing")
			else:
				astronaut.position = Vector3(12.0, 1.0, -11.0)
				node.call("_interact")
				if not GameState.moon_eva_sample_collected:
					failures.append("Moon EVA sample collection failed")
				astronaut.position = Vector3(0.0, 1.0, 12.0)
				node.call("_interact")
				if not GameState.moon_eva_complete:
					failures.append("Moon EVA sample return did not award completion")
		"photo_mission":
			_expect_button(node, "IGNITE", screen)
			_expect_button(node, "PAUSE", screen)
			if node.find_child("FlightStick", true, false) == null:
				failures.append("Photo mission missing working touch joystick")
			var ignite: Button = _find_button(node, "IGNITE")
			if ignite != null:
				ignite.pressed.emit()
				if not bool(node.get("_running")):
					failures.append("Photorealistic launch action did not start flight")
			node.call("_complete_orbit")
			if str(node.get("_phase")) != "transfer":
				failures.append("Photo mission never entered orbital transfer")
			node.call("_enter_landing")
			var deploy: Button = _find_button(node, "DEPLOY GEAR")
			if deploy != null:
				deploy.pressed.emit()
				if not bool(node.get("_gear")):
					failures.append("Photo mission landing gear button does not work")
			node.set("_descent", 3.5)
			node.set("_offset", 1.0)
			node.call("_finish_landing")
			if str(node.get("_phase")) != "explore":
				failures.append("Photo mission never reached playable lunar EVA")
			for distance: float in [22.0, 48.0, 76.0]:
				node.set("_eva_x", distance)
				node.call("_collect_or_return")
			node.set("_eva_x", 0.0)
			node.call("_collect_or_return")
			if str(node.get("_phase")) != "complete":
				failures.append("Photo sample collection and safe return failed")
		"planet_landing":
			_expect_button(node, "BRAKE", screen)
			_expect_button(node, "FUEL +35", screen)
			if node.find_child("FlightStick", true, false) == null:
				failures.append("Landing steering joystick missing")
			var legs: Button = _find_button(node, "GEAR")
			if legs == null:
				failures.append("Landing gear button missing")
			else:
				legs.pressed.emit()
				var sim: Object = node.get("_sim") as Object
				if sim == null or not bool(sim.get("legs")):
					failures.append("Landing legs button did not deploy gear")
			var throttle: Button = _find_button(node, "BRAKE")
			if throttle != null:
				var sim2: Object = node.get("_sim") as Object
				var before: float = float(sim2.get("throttle"))
				throttle.pressed.emit()
				if float(sim2.get("throttle")) <= before:
					failures.append("Brake/thrust button failed to increase engine throttle")
	get_tree().paused = false
	node.queue_free()
	await get_tree().process_frame

func _expect_button(root: Node, phrase: String, where: String, report: bool = true) -> void:
	if _find_button(root, phrase) == null and report:
		failures.append("%s button missing from %s" % [phrase, where])

func _find_button(root: Node, phrase: String) -> Button:
	if root is Button and phrase.to_upper() in (root as Button).text.to_upper():
		return root as Button
	for child: Node in root.get_children():
		var found: Button = _find_button(child, phrase)
		if found != null:
			return found
	return null
