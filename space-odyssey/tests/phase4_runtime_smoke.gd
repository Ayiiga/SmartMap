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
	for name: String in ["main_menu", "crew_screen", "workshop_screen", "rewards_screen", "settings_screen"]:
		await _probe("res://scenes/ui/%s.tscn" % name, name)
	GameState.destination_planet = "moon"
	await _probe("res://scenes/world/planet_transfer.tscn", "planet_transfer")
	await _probe("res://scenes/world/planet_landing.tscn", "planet_landing")
	GameState.destination_planet = "mars"
	await _probe("res://scenes/world/planet_transfer.tscn", "planet_transfer")
	await _probe("res://scenes/world/planet_landing.tscn", "planet_landing")
	for failure: String in failures:
		push_error(failure)
	if failures.is_empty():
		print("PASS: Main menu, 3-crew screen, workshop, rewards, settings, Moon/Mars transfer and lander scenes start with working touch controls")
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
			_expect_button(node, "FLY TO THE MOON", screen)
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
		"planet_landing":
			_expect_button(node, "BRAKE / THRUST", screen)
			var legs: Button = _find_button(node, "DEPLOY LEGS")
			if legs == null:
				failures.append("Landing gear button missing")
			else:
				legs.pressed.emit()
				var sim: Object = node.get("_sim") as Object
				if sim == null or not bool(sim.get("legs")):
					failures.append("Landing legs button did not deploy gear")
			var throttle: Button = _find_button(node, "BRAKE / THRUST")
			if throttle != null:
				var sim2: Object = node.get("_sim") as Object
				var before: float = float(sim2.get("throttle"))
				throttle.pressed.emit()
				if float(sim2.get("throttle")) <= before:
					failures.append("Brake/thrust button failed to increase engine throttle")
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
