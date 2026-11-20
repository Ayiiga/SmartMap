extends Node3D
## Simplified space-navigation challenge: local 3D hazard motion and collision.
## Comets, meteoroids and debris can be dodged with the two large touch controls.
const UI = preload("res://scripts/ui/space_ui.gd")
const RocketArt = preload("res://scripts/rocket/rocket_art.gd")
const LANES: Array[float] = [-4.8, 0.0, 4.8]
const HAZARD_PATTERN: Array[int] = [1, 0, 2, 1, 2, 0, 0, 2, 1, 0, 2, 1, 0, 2]
const REQUIRED_DODGES: int = 8
const WARNING_LEAD: float = 2.6

var _ship: Node3D
var _ship_lane: int = 1
var _camera: Camera3D
var _hazards: Array[Dictionary] = []
var _spawned: int = 0
var _dodge_count: int = 0
var _collisions: int = 0
var _shields: int = 4
var _spawn_timer: float = 1.2
var _elapsed: float = 0.0
var _ended: bool = false
var _hud: CanvasLayer
var _counter: Label
var _radio_label: Label
var _next_hint: Label
var _radio_overlay: CanvasLayer
var _pause_overlay: CanvasLayer
var _finish_overlay: CanvasLayer
var _audio_connected: bool = false

func _ready() -> void:
	GameState.current_mission = "comet_001"
	GameState.save_local()
	_shields = 5 if bool(GameState.settings.get("assisted_controls", true)) else 3
	_make_space()
	_build_hud()
	GameAudio.radio_message.connect(_radio_received)
	_audio_connected = true
	GameAudio.communicate("Odyssey to pilot. Welcome to the comet corridor. Use LEFT and RIGHT to dodge hazards. Tap SHIP RADIO to ask for help.")

func _exit_tree() -> void:
	if _audio_connected and GameAudio.radio_message.is_connected(_radio_received):
		GameAudio.radio_message.disconnect(_radio_received)
	DisplayServer.tts_stop()

func _make_space() -> void:
	var world: WorldEnvironment = WorldEnvironment.new()
	var env: Environment = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("03091c")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("526a90")
	env.ambient_light_energy = 0.5
	world.environment = env
	add_child(world)
	var key_light: DirectionalLight3D = DirectionalLight3D.new()
	key_light.rotation_degrees = Vector3(-40, -35, 0)
	key_light.light_energy = 1.4
	add_child(key_light)
	var stars_rng: RandomNumberGenerator = RandomNumberGenerator.new()
	stars_rng.seed = 20261120
	for i: int in range(95):
		var x: float = stars_rng.randf_range(-100.0, 100.0)
		var y: float = stars_rng.randf_range(-30.0, 60.0)
		var z: float = stars_rng.randf_range(-110.0, -10.0)
		_ball(self, Vector3(x, y, z), stars_rng.randf_range(0.07, 0.20), Color("d2ecff"), false)
	_ball(self, Vector3(42, 12, -100), 12.0, Color("294878"), false)
	var planet: MeshInstance3D = _ball(self, Vector3(42, 12, -100), 10.8, Color("3b9c9e"), false)
	planet.scale = Vector3(0.90, 0.70, 0.92)
	var parts: Dictionary = RocketArt.build(self, 0)
	_ship = parts["root"] as Node3D
	var lower: Node3D = parts["lower_stage"] as Node3D
	lower.visible = false
	_ship.rotation_degrees = Vector3(-90, 0, 0)
	_ship.position = Vector3(0.0, -0.5, 11.0)
	_camera = Camera3D.new()
	_camera.current = true
	_camera.fov = 67.0
	_camera.position = Vector3(0, 6.0, 33.0)
	add_child(_camera)
	_camera.look_at(Vector3(0, 2, -20), Vector3.UP)

func _ball(parent: Node3D, position3: Vector3, radius: float, color: Color, glow: bool) -> MeshInstance3D:
	var mesh: SphereMesh = SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2.0
	mesh.radial_segments = 12 if radius < 2.0 else 20
	mesh.rings = 6 if radius < 2.0 else 12
	var obj: MeshInstance3D = MeshInstance3D.new()
	obj.mesh = mesh
	obj.position = position3
	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.80
	if glow:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = 1.3
	obj.material_override = mat
	parent.add_child(obj)
	return obj

func _build_hud() -> void:
	_hud = CanvasLayer.new()
	_hud.layer = 10
	add_child(_hud)
	var root: Control = Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_hud.add_child(root)
	var panel: PanelContainer = UI.panel()
	panel.position = Vector2(20, 18)
	panel.custom_minimum_size = Vector2(350, 0)
	root.add_child(panel)
	var info: VBoxContainer = VBoxContainer.new()
	panel.add_child(info)
	info.add_child(UI.label("SPACE MISSION · DODGE COMETS", 21, UI.ACCENT))
	_counter = UI.label("SHIELDS: 5 · DODGED 0 / 8", 20)
	info.add_child(_counter)
	info.add_child(UI.label("Pilot: %s · Offline radio" % str(GameState.selected_astronaut).capitalize(), 16, UI.MUTED))
	var right: VBoxContainer = VBoxContainer.new()
	right.anchor_left = 1.0
	right.anchor_right = 1.0
	right.offset_left = -270
	right.offset_right = -18
	right.offset_top = 16
	right.add_theme_constant_override("separation", 8)
	root.add_child(right)
	var radio: Button = UI.button("SHIP RADIO / TALK", true)
	right.add_child(radio)
	radio.pressed.connect(_open_radio)
	var pause: Button = UI.button("PAUSE / SAVE")
	right.add_child(pause)
	pause.pressed.connect(_open_pause)
	var instruction: VBoxContainer = VBoxContainer.new()
	instruction.anchor_left = 0.27
	instruction.anchor_right = 0.75
	instruction.anchor_top = 1.0
	instruction.anchor_bottom = 1.0
	instruction.offset_top = -154
	instruction.offset_bottom = -10
	root.add_child(instruction)
	_radio_label = UI.label("MISSION CONTROL: Scan the lane ahead.", 18, Color("a5edee"))
	instruction.add_child(_radio_label)
	_next_hint = UI.label("Avoid rocks in your lane. Tap LEFT or RIGHT.", 17, UI.ACCENT)
	instruction.add_child(_next_hint)
	var controls: HBoxContainer = UI.row()
	controls.anchor_top = 1.0
	controls.anchor_bottom = 1.0
	controls.offset_left = 20
	controls.offset_right = 580
	controls.offset_top = -95
	controls.offset_bottom = -12
	root.add_child(controls)
	var left: Button = UI.button("◀  DODGE LEFT", true)
	left.custom_minimum_size = Vector2(245, 75)
	controls.add_child(left)
	left.pressed.connect(_steer.bind(-1))
	var right_button: Button = UI.button("DODGE RIGHT  ▶", true)
	right_button.custom_minimum_size = Vector2(245, 75)
	controls.add_child(right_button)
	right_button.pressed.connect(_steer.bind(1))

func _process(delta: float) -> void:
	if _ended:
		return
	_elapsed += delta
	_ship.position.x = lerpf(_ship.position.x, LANES[_ship_lane], minf(1.0, 7.0 * delta))
	_ship.rotation_degrees.z = lerpf(_ship.rotation_degrees.z, -15.0 * float(_ship_lane - 1), minf(1.0, delta * 5.0))
	_spawn_timer -= delta
	if _spawn_timer <= 0.0:
		_spawn_timer = WARNING_LEAD + 0.25
		_spawn_hazard()
	for index: int in range(_hazards.size() - 1, -1, -1):
		var entry: Dictionary = _hazards[index]
		var obj: Node3D = entry["node"] as Node3D
		var speed: float = float(entry["speed"])
		obj.position.z += delta * speed
		obj.rotate_y(delta * 0.7)
		if obj.position.z > 12.0:
			if int(entry["lane"]) == _ship_lane:
				_shields -= 1
				_collisions += 1
				GameAudio.effect("impact")
				GameAudio.communicate("Impact detected! Shield integrity reduced. Move away from the next danger lane.", true)
			else:
				_dodge_count += 1
				GameAudio.effect("dodge")
			obj.queue_free()
			_hazards.remove_at(index)
			if _shields <= 0:
				_finish(false)
				return
			if _dodge_count >= REQUIRED_DODGES:
				_finish(true)
				return
	_update_hud()

func _spawn_hazard() -> void:
	var lane: int = HAZARD_PATTERN[_spawned % HAZARD_PATTERN.size()]
	var label: String = "COMET" if _spawned % 3 == 0 else ("METEOROID" if _spawned % 3 == 1 else "SPACE DEBRIS")
	_spawned += 1
	var danger: Node3D = Node3D.new()
	danger.position = Vector3(LANES[lane], 1.0, -65.0)
	add_child(danger)
	var tint: Color = Color("e6b07a") if label == "COMET" else (Color("b0b7c3") if label == "METEOROID" else Color("8fd6dd"))
	var core: MeshInstance3D = _ball(danger, Vector3.ZERO, 1.45 if label != "SPACE DEBRIS" else 0.95, tint, true)
	core.scale = Vector3(1.0, 0.85, 1.30)
	for j: int in range(5):
		var theta: float = float(j) * TAU / 5.0
		_ball(danger, Vector3(cos(theta) * 1.15, sin(theta) * 0.92, -0.30), 0.23, Color("555d67"), false)
	if label == "COMET":
		var tail: MeshInstance3D = _ball(danger, Vector3(0, 0.0, -3.2), 1.05, Color("ef9863"), true)
		tail.scale = Vector3(0.5, 0.5, 3.8)
	_hazards.append({"node": danger, "lane": lane, "label": label, "speed": 27.0})
	var safe: String = "LEFT" if lane != 0 else "RIGHT"
	if lane == 2:
		safe = "LEFT"
	if lane == 0:
		safe = "RIGHT"
	_next_hint.text = "%s in %s lane · steer %s" % [label, _lane_name(lane), safe]
	GameAudio.communicate("Warning. %s approaching in %s lane. Move away using the left or right button." % [label.to_lower(), _lane_name(lane).to_lower()], true)

func _lane_name(index: int) -> String:
	return ["LEFT", "CENTER", "RIGHT"][clampi(index, 0, 2)]

func _update_hud() -> void:
	_counter.text = "SHIELDS %d  |  DODGED %d / %d  |  BEST %d" % [_shields, _dodge_count, REQUIRED_DODGES, GameState.comet_best]

func _steer(direction: int) -> void:
	if _ended:
		return
	var new_lane: int = clampi(_ship_lane + direction, 0, 2)
	if new_lane != _ship_lane:
		_ship_lane = new_lane
		GameAudio.effect("dodge")
		_next_hint.text = "Now in %s lane. Keep watching the approaching hazards." % _lane_name(_ship_lane)
	else:
		_next_hint.text = "Already in the %s lane; steer the other way." % _lane_name(_ship_lane)

func _radio_received(message: String) -> void:
	if _radio_label != null:
		_radio_label.text = "MISSION CONTROL: %s" % message
	if _radio_overlay != null and is_instance_valid(_radio_overlay):
		var message_ui: Label = _radio_overlay.get_node_or_null("Backdrop/Panel/Column/Message") as Label
		if message_ui != null:
			message_ui.text = message

func _scan() -> void:
	GameAudio.effect("scan")
	if _hazards.is_empty():
		GameAudio.communicate("Scanner is clear. A new hazard will appear shortly. Keep to the center until warned.")
		return
	var closest: Dictionary = _hazards[0]
	var lane: int = int(closest["lane"])
	var preferred: String = "RIGHT" if lane == 0 else "LEFT"
	GameAudio.communicate("Scanner: %s ahead in the %s lane. Recommended action: move %s." % [str(closest["label"]).to_lower(), _lane_name(lane).to_lower(), preferred])

func _status_report() -> void:
	GameAudio.communicate("Odyssey report. Shields %d. You have successfully dodged %d of %d hazards. Current lane is %s." % [_shields, _dodge_count, REQUIRED_DODGES, _lane_name(_ship_lane).to_lower()])

func _open_radio() -> void:
	if _radio_overlay != null:
		return
	_radio_overlay = _modal("SHIP RADIO · MISSION CONTROL", "Touch to communicate. Replies include offline beeps and subtitles.")
	var column: VBoxContainer = _radio_overlay.get_node("Backdrop/Panel/Column") as VBoxContainer
	var message: Label = UI.label("What do you want to know?", 19, UI.ACCENT)
	message.name = "Message"
	column.add_child(message)
	_add_action(column, "SCAN NEXT COMET / DEBRIS", _scan)
	_add_action(column, "SEND STATUS REPORT", _status_report)
	_add_action(column, "REPEAT LAST WARNING", func() -> void: GameAudio.repeat_radio())
	var controls: HBoxContainer = UI.row()
	column.add_child(controls)
	_add_action(controls, "MOVE LEFT", func() -> void: _steer(-1))
	_add_action(controls, "MOVE RIGHT", func() -> void: _steer(1))
	_add_action(column, "BACK TO FLYING", _close_radio, true)
	get_tree().paused = true
	_scan()

func _close_radio() -> void:
	get_tree().paused = false
	if _radio_overlay != null:
		_radio_overlay.queue_free()
		_radio_overlay = null

func _open_pause() -> void:
	if _pause_overlay != null:
		return
	GameState.record_comet_result(_dodge_count, false)
	_pause_overlay = _modal("SPACE MISSION PAUSED", "Your comet mission and best score are saved locally.")
	var column: VBoxContainer = _pause_overlay.get_node("Backdrop/Panel/Column") as VBoxContainer
	_add_action(column, "RESUME DODGING", _close_pause, true)
	_add_action(column, "RETRY COMET MISSION", _retry)
	_add_action(column, "SETTINGS · SOUND / SPEAKER", _settings)
	_add_action(column, "SAVE & MAIN MENU", _menu)
	get_tree().paused = true

func _close_pause() -> void:
	get_tree().paused = false
	if _pause_overlay != null:
		_pause_overlay.queue_free()
		_pause_overlay = null

func _modal(title: String, subtitle: String) -> CanvasLayer:
	var overlay: CanvasLayer = CanvasLayer.new()
	overlay.layer = 40
	overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(overlay)
	var backdrop: CenterContainer = CenterContainer.new()
	backdrop.name = "Backdrop"
	backdrop.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(backdrop)
	var dim: ColorRect = ColorRect.new()
	dim.color = Color(0.01, 0.02, 0.06, 0.95)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	overlay.add_child(dim)
	overlay.move_child(dim, 0)
	var panel: PanelContainer = UI.panel()
	panel.name = "Panel"
	panel.custom_minimum_size.x = 700
	backdrop.add_child(panel)
	var column: VBoxContainer = VBoxContainer.new()
	column.name = "Column"
	column.add_theme_constant_override("separation", 10)
	panel.add_child(column)
	column.add_child(UI.label(title, 27, UI.ACCENT))
	column.add_child(UI.label(subtitle, 17, UI.MUTED))
	return overlay

func _add_action(parent: Node, title: String, callback: Callable, primary: bool = false) -> Button:
	var button: Button = UI.button(title, primary)
	parent.add_child(button)
	button.pressed.connect(callback)
	return button

func _finish(success: bool) -> void:
	if _ended:
		return
	_ended = true
	GameState.record_comet_result(_dodge_count, success)
	GameAudio.effect("success" if success else "warning")
	var title: String = "MISSION COMPLETE · COMET SURVIVOR" if success else "SHIP SHIELDS DEPLETED"
	var description: String = "Great flying! You dodged %d hazards. +80 science points on your first completion." % _dodge_count if success else "You dodged %d hazards. Keep steering and use SHIP RADIO for warnings." % _dodge_count
	GameAudio.communicate("Excellent piloting. The path is clear." if success else "Mission ended. Your best score is saved. Try again when ready.")
	_finish_overlay = _modal(title, description)
	var column: VBoxContainer = _finish_overlay.get_node("Backdrop/Panel/Column") as VBoxContainer
	_add_action(column, "PLAY AGAIN", _retry, true)
	_add_action(column, "RETURN TO MAIN MENU", _menu)
	get_tree().paused = true

func _retry() -> void:
	get_tree().paused = false
	get_tree().reload_current_scene()

func _settings() -> void:
	GameState.record_comet_result(_dodge_count, false)
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/ui/settings_screen.tscn")

func _menu() -> void:
	GameState.record_comet_result(_dodge_count, false)
	get_tree().paused = false
	get_tree().change_scene_to_file(GameState.MENU)

func _unhandled_key_input(event: InputEvent) -> void:
	if not event is InputEventKey:
		return
	var key: InputEventKey = event as InputEventKey
	if not key.pressed or key.echo:
		return
	match key.keycode:
		KEY_LEFT, KEY_A: _steer(-1)
		KEY_RIGHT, KEY_D: _steer(1)
		KEY_R: _open_radio()
		KEY_S: _scan()
		KEY_ESCAPE: _open_pause()

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		_open_pause()
