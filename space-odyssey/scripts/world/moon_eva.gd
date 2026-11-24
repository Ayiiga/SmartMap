extends Node3D
## First offline lunar EVA: leave the lander, collect a sample, return safely.
## Uses existing astronaut physics and touch controls; no network or new assets.
const ASTRONAUT_SCENE = preload("res://scenes/player/astronaut.tscn")
const TOUCH_SCENE = preload("res://scenes/ui/mobile_controls.tscn")
const RocketArt = preload("res://scripts/rocket/rocket_art.gd")
const UI = preload("res://scripts/ui/space_ui.gd")
const SAMPLE_POINT: Vector3 = Vector3(12.0, 0.75, -11.0)
const LANDER_POINT: Vector3 = Vector3(0.0, 0.0, 12.0)
var _player: AstronautController
var _sample: MeshInstance3D
var _goal: Label
var _hint: Label
var _power: Label
var _overlay: CanvasLayer
var _checkpoint_timer: float = 0.0
var _finished: bool = false

func _ready() -> void:
	_build_world()
	_player = ASTRONAUT_SCENE.instantiate() as AstronautController
	var saved: Array = GameState.moon_eva_position
	_player.position = Vector3(float(saved[0]), maxf(1.0, float(saved[1])), float(saved[2]))
	_player.planet_gravity = 1.62
	add_child(_player)
	_player.interact_requested.connect(_interact)
	_build_hud()
	_update_hud()
	GameAudio.communicate("Moon expedition. Follow the cyan marker, collect the geological sample, then return it to the lander.")

func _build_world() -> void:
	var world: WorldEnvironment = WorldEnvironment.new()
	var env: Environment = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("030915")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("869bc0")
	env.ambient_light_energy = 0.70
	world.environment = env
	add_child(world)
	var sunlight: DirectionalLight3D = DirectionalLight3D.new()
	sunlight.rotation_degrees = Vector3(-49, -30, 0)
	sunlight.light_energy = 1.4
	add_child(sunlight)
	var floor_body: StaticBody3D = StaticBody3D.new()
	var collider: CollisionShape3D = CollisionShape3D.new()
	var floor_shape: BoxShape3D = BoxShape3D.new()
	floor_shape.size = Vector3(160, 1.0, 160)
	collider.shape = floor_shape
	floor_body.position = Vector3(0, -0.5, 0)
	floor_body.add_child(collider)
	add_child(floor_body)
	_box(Vector3(0, -0.55, 0), Vector3(160, 1.0, 160), Color("858c9b"))
	_box(Vector3(0, 0.04, 12), Vector3(16, 0.08, 16), Color("495e70"))
	var craft: Dictionary = RocketArt.build_lander(self)
	var rocket: Node3D = craft["root"] as Node3D
	rocket.position = LANDER_POINT + Vector3(0, 0.7, 0)
	rocket.scale = Vector3.ONE * 0.86
	for gear: Node3D in craft["gear_nodes"]:
		gear.visible = true
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = 724901
	for i: int in range(28):
		var x: float = rng.randf_range(-72.0, 72.0)
		var z: float = rng.randf_range(-72.0, 72.0)
		if Vector2(x, z).length() < 19.0:
			continue
		_rock(Vector3(x, 0.42, z), rng.randf_range(0.5, 1.7), Color("b5b7bd"))
	_sample = _rock(SAMPLE_POINT, 0.8, Color("6ce9ff"))
	if GameState.moon_eva_sample_collected:
		_sample.visible = false
	_marker("SAMPLE SITE", SAMPLE_POINT + Vector3(0, 2.0, 0))
	_marker("LANDER / RETURN", LANDER_POINT + Vector3(0, 8.8, 0))
	_rock(Vector3(-80, 38, -160), 3.5, Color("397fa8"))

func _mat(color: Color) -> StandardMaterial3D:
	var material: StandardMaterial3D = StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.82
	return material

func _box(pos: Vector3, dims: Vector3, color: Color) -> void:
	var item: MeshInstance3D = MeshInstance3D.new()
	var mesh: BoxMesh = BoxMesh.new()
	mesh.size = dims
	item.mesh = mesh
	item.position = pos
	item.material_override = _mat(color)
	add_child(item)

func _rock(pos: Vector3, radius: float, color: Color) -> MeshInstance3D:
	var item: MeshInstance3D = MeshInstance3D.new()
	var shape: SphereMesh = SphereMesh.new()
	shape.radius = radius
	shape.height = radius * 2.0
	shape.radial_segments = 12
	shape.rings = 6
	item.mesh = shape
	item.position = pos
	item.scale = Vector3(1.4, 0.65, 1.0)
	item.material_override = _mat(color)
	add_child(item)
	return item

func _marker(caption: String, pos: Vector3) -> void:
	var marker: Label3D = Label3D.new()
	marker.text = caption
	marker.font_size = 38
	marker.pixel_size = 0.011
	marker.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	marker.modulate = Color("9adffc")
	marker.position = pos
	add_child(marker)

func _build_hud() -> void:
	var layer: CanvasLayer = CanvasLayer.new()
	add_child(layer)
	var root: Control = Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(root)
	var mission: PanelContainer = UI.panel()
	mission.position = Vector2(18, 16)
	mission.custom_minimum_size = Vector2(420, 0)
	root.add_child(mission)
	var text: VBoxContainer = VBoxContainer.new()
	mission.add_child(text)
	text.add_child(UI.label("GIGAORBIT  ·  MOON EVA", 22, UI.ACCENT))
	_goal = UI.label("Find the lunar sample", 18)
	text.add_child(_goal)
	_power = UI.label("Moon gravity 1.62 m/s²", 15, UI.MUTED)
	text.add_child(_power)
	var pause: Button = UI.button("PAUSE / SAVE")
	pause.anchor_left = 1.0
	pause.anchor_right = 1.0
	pause.offset_left = -220
	pause.offset_right = -18
	pause.offset_top = 18
	pause.offset_bottom = 72
	root.add_child(pause)
	pause.pressed.connect(_pause)
	_hint = UI.label("Left joystick: move · Right side: look · INTERACT: collect", 16, UI.ACCENT)
	_hint.anchor_left = 0.25
	_hint.anchor_right = 0.76
	_hint.anchor_top = 1.0
	_hint.anchor_bottom = 1.0
	_hint.offset_top = -100
	_hint.offset_bottom = -55
	root.add_child(_hint)
	var touch: Control = TOUCH_SCENE.instantiate() as Control
	root.add_child(touch)
	touch.movement_changed.connect(func(axis: Vector2) -> void: _player.move_stick = axis)
	touch.camera_dragged.connect(func(amount: Vector2) -> void: _player.look_delta(amount))
	touch.jump_pressed.connect(func() -> void: _player.request_jump())
	touch.interact_pressed.connect(func() -> void: _player.request_interact())
	touch.sprint_changed.connect(func(running: bool) -> void: _player.sprinting = running)
	touch.jetpack_changed.connect(func(active: bool) -> void: _player.jetpacking = active)

func _process(delta: float) -> void:
	if _finished:
		return
	_checkpoint_timer += delta
	if _checkpoint_timer >= 8.0:
		_checkpoint_timer = 0.0
		GameState.save_moon_eva_position(_player.position)
	if _player.global_position.y < -8.0:
		_player.position = Vector3(0, 1.5, 4)
		_player.velocity = Vector3.ZERO
	_update_hud()

func _update_hud() -> void:
	if GameState.moon_eva_sample_collected:
		_goal.text = "Sample collected · Return to the lander"
		_hint.text = "Bring the sample to the rocket · INTERACT to finish"
	else:
		_goal.text = "Collect the cyan lunar sample"
		_hint.text = "Walk to the cyan rock · INTERACT when nearby"
	_power.text = "Moon gravity 1.62 m/s²  ·  Suit power %d%%" % int(_player.power)

func _interact() -> void:
	if not GameState.moon_eva_sample_collected:
		if _player.position.distance_to(SAMPLE_POINT) <= 4.2:
			GameState.collect_moon_sample()
			_sample.visible = false
			GameState.save_moon_eva_position(_player.position)
			GameAudio.effect("scan")
			GameAudio.communicate("Sample secured. Return to the landing craft to complete your exploration mission.")
		else:
			_hint.text = "Move closer to the glowing sample."
	elif _player.position.distance_to(LANDER_POINT) <= 6.0:
		_complete()
	else:
		_hint.text = "Return to the lander before completing the mission."

func _complete() -> void:
	var first_clear: bool = not GameState.moon_eva_complete
	if not GameState.complete_moon_eva():
		return
	_finished = true
	GameAudio.effect("success")
	GameAudio.communicate("Lunar sample returned! Your science expedition is complete.")
	var actions: VBoxContainer = _overlay_panel("LUNAR SAMPLE RETURNED",
		"Moon exploration complete.\n%s" % ("+125 science and +200 coins · First completion bonus" if first_clear else "Replay complete · Previous rewards preserved"))
	_button(actions, "MISSION CONTROL / MAIN MENU", _menu, true)
	_button(actions, "EXPLORE THE MOON AGAIN", _replay)
	get_tree().paused = true

func _overlay_panel(title: String, subtitle: String) -> VBoxContainer:
	_overlay = CanvasLayer.new()
	_overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	_overlay.layer = 35
	add_child(_overlay)
	var shade: ColorRect = ColorRect.new()
	shade.color = Color(0.01, 0.025, 0.06, 0.93)
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_overlay.add_child(shade)
	var center: CenterContainer = CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_overlay.add_child(center)
	var panel: PanelContainer = UI.panel()
	center.add_child(panel)
	var actions: VBoxContainer = VBoxContainer.new()
	actions.add_theme_constant_override("separation", 13)
	panel.add_child(actions)
	actions.add_child(UI.label(title, 28, UI.ACCENT))
	actions.add_child(UI.label(subtitle, 18))
	return actions

func _button(parent: VBoxContainer, label: String, callback: Callable, primary: bool = false) -> void:
	var action: Button = UI.button(label, primary)
	parent.add_child(action)
	action.pressed.connect(callback)

func _pause() -> void:
	if _overlay != null and is_instance_valid(_overlay):
		return
	GameState.save_moon_eva_position(_player.position)
	var actions: VBoxContainer = _overlay_panel("MOON EXPEDITION PAUSED", "Your sample and position are saved locally.")
	_button(actions, "RESUME EXPLORATION", _resume, true)
	_button(actions, "SAVE & MAIN MENU", _menu)
	get_tree().paused = true

func _resume() -> void:
	get_tree().paused = false
	if _overlay != null and is_instance_valid(_overlay):
		_overlay.queue_free()
	_overlay = null

func _replay() -> void:
	get_tree().paused = false
	GameState.begin_moon_eva()

func _menu() -> void:
	get_tree().paused = false
	if not _finished:
		GameState.save_moon_eva_position(_player.position)
	get_tree().change_scene_to_file(GameState.MENU)

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		_pause()
