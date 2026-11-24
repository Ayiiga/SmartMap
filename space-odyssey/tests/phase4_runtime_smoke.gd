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
	GameState.destination_planet = "mars"
	await _probe("res://scenes/world/photo_expedition.tscn", "mars_photo")
	GameState.completed_planets["mars"] = true
	for body: String in ["europa", "jupiter", "titan"]:
		GameState.destination_planet = body
		await _probe("res://scenes/world/photo_expedition.tscn", body + "_photo")
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
	if screen == "photo_mission":
		const SaveStore = preload("res://scripts/core/save_store.gd")
		SaveStore.write_checkpoint("user://gigaorbit_photo_checkpoint_v1.json", {"version": 1, "phase": "landing"})
		GameState.current_mission = "photo_fresh_launch"
	var node: Node = packed.instantiate()
	get_tree().root.add_child(node)
	await get_tree().process_frame
	if not is_instance_valid(node):
		failures.append("Scene disappeared unexpectedly: " + path)
		return
	match screen:
		"main_menu":
			_expect_button(node, "LAUNCH FROM EARTH", screen)
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
		"photo_mission", "mars_photo", "europa_photo", "titan_photo", "jupiter_photo":
			await _flight_and_surface(node, screen)
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

func _flight_and_surface(scene: Node, screen: String) -> void:
	var moon: bool = screen == "photo_mission"
	var surface: bool = screen != "jupiter_photo"
	var tick: String = "_physics_process" if moon else "_process"
	var axis_key: String = "_steer" if moon else "_axis"
	var range_key: String = "_eva_x" if moon else "_position"
	scene.set_process(false)
	scene.set_physics_process(false)
	await get_tree().process_frame
	var action := scene.get("_action") as Button
	if scene.get("_phase") != "launch" or "IGNITE" not in action.text:
		failures.append("%s did not start at the Earth launchpad" % screen)
		return
	_touch(0, action.get_global_rect().get_center(), true)
	var emulated := InputEventMouseButton.new()
	emulated.device = InputEvent.DEVICE_ID_EMULATION
	emulated.button_index = MOUSE_BUTTON_LEFT
	emulated.pressed = true
	emulated.position = action.get_global_rect().get_center()
	get_viewport().push_input(emulated, true)
	_touch(0, action.get_global_rect().get_center(), false)
	if not bool(scene.get("_running")):
		failures.append("%s first touch did not ignite once" % screen)
		return
	var stages: Dictionary = {}
	for frame in range(3000):
		stages[scene.get("_ascent_stage")] = true
		if scene.get("_phase") != "launch":
			break
		scene.call(tick, 1.0 / 60.0)
	if stages.size() != 4 or not bool(scene.get("_running")):
		failures.append("%s skipped ascent scenes or stopped at orbit" % screen)
		return
	for frame in range(2600):
		if scene.get("_phase") not in ["transfer", "approach"]:
			break
		scene.call(tick, 1.0 / 60.0)
	if surface:
		await get_tree().process_frame
		var stick := scene.get("_flight_stick") as Control
		var brake := scene.get("_brake_button" if moon else "_brake") as Button
		var stick_point: Vector2 = stick.get_global_rect().get_center() + Vector2(-45, 0)
		_touch(1, stick_point, true)
		_touch(0, brake.get_global_rect().get_center(), true)
		if not bool(scene.get("_braking")) or float((scene.get(axis_key) as Vector2).x) >= -0.4:
			failures.append("%s could not steer and brake together with reversed finger order" % screen)
		_touch(0, brake.get_global_rect().get_center(), false)
		if bool(scene.get("_braking")) or float((scene.get(axis_key) as Vector2).x) >= -0.4:
			failures.append("%s releasing brake interrupted steering" % screen)
		_touch(1, stick_point, false)
		for frame in range(4400):
			if scene.get("_phase") == "explore" and float(scene.get("_touchdown_display")) <= 0.0:
				break
			scene.call(tick, 1.0 / 60.0)
	if scene.get("_phase") != "explore":
		failures.append("%s did not reach its surface or orbit objective" % screen)
		return
	var rover := scene.get("_secondary") as Button
	if surface:
		rover.pressed.emit()
		var vehicle := scene.get("_avatar" if moon else "_vehicle") as TextureRect
		if not vehicle.visible or not vehicle.texture.resource_path.ends_with("eva-rover.webp"):
			failures.append("%s rover mode did not show its vehicle" % screen)
	elif rover.visible:
		failures.append("%s flyby displayed a rover control" % screen)
	var goals: Array[float] = [20.0, 51.0, 82.0]
	if moon:
		goals = [22.0, 48.0, 76.0]
	if screen == "mars_photo":
		goals.append(90.0)
	goals.append(0.0)
	for goal: float in goals:
		var direction: float = signf(goal - float(scene.get(range_key)))
		scene.set(axis_key, Vector2(direction, -direction))
		for frame in range(660):
			scene.call(tick, 1.0 / 60.0)
			if absf(goal - float(scene.get(range_key))) < 5.0:
				break
		scene.set(axis_key, Vector2.ZERO)
		var marker := scene.get("_marker") as Label
		if "IN REACH" not in marker.text:
			failures.append("%s waypoint %d was unreachable" % [screen, goal])
			return
		action.pressed.emit()
	if scene.get("_phase") != "complete":
		failures.append("%s could not complete its mission and return" % screen)

func _touch(index: int, point: Vector2, pressed: bool) -> void:
	var event := InputEventScreenTouch.new()
	event.index = index
	event.position = point
	event.pressed = pressed
	get_viewport().push_input(event, true)

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
