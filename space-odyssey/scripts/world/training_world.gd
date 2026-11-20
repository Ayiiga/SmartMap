extends Node3D
## Phase 1 playable 3D Earth training: walk, camera, jump, jetpack, 3 real objectives.
const ASTRONAUT_SCENE = preload("res://scenes/player/astronaut.tscn")
const TOUCH_SCENE = preload("res://scenes/ui/mobile_controls.tscn")
const UI = preload("res://scripts/ui/space_ui.gd")
var _player: AstronautController
var _hud_layer: CanvasLayer
var _objective: Label
var _status: Label
var _power_label: Label
var _hint: Label
var _performance: Label
var _crew_label: Label
var _crew_overlay: CanvasLayer
const Crew = preload("res://scripts/player/crew_catalog.gd")
var _targets: Dictionary = {}
var _sample_mesh: MeshInstance3D
var _sample_platform: MeshInstance3D
var _paused_overlay: CanvasLayer
var _complete_shown: bool = false
var _fps_time: float = 0.0
var _status_timeout: float = 0.0

func _ready() -> void:
	_build_world()
	_player = ASTRONAUT_SCENE.instantiate() as AstronautController
	var saved: Array = GameState.checkpoint_position
	_player.position = Vector3(float(saved[0]), maxf(0.1, float(saved[1])), float(saved[2]))
	add_child(_player)
	_player.interact_requested.connect(_interact)
	_build_hud()
	GameState.progress_changed.connect(_progress_updated)
	_progress_updated()
	if GameState.objective_index >= 2 and _targets.has("sample"):
		(_targets["sample"] as Area3D).visible = false
		(_targets["sample"] as Area3D).monitoring = false
		(_targets["sample"] as Area3D).collision_layer = 0
		_sample_mesh.visible = false
		_sample_platform.visible = false
	if GameState.training_complete:
		_status.text = "Training complete! Walk to the rocket, then tap INTERACT to board."

func _physics_process(_delta: float) -> void:
	if _player.global_position.y < -8.0:
		var saved: Array = GameState.checkpoint_position
		_player.global_position = Vector3(float(saved[0]), maxf(0.5, float(saved[1])), float(saved[2]))
		_player.velocity = Vector3.ZERO
		_set_status("Explorer recovered at the previous saved checkpoint.")
	if not GameState.training_complete and GameState.objective_index == 0:
		if _player.global_position.distance_to(Vector3(7, 0, 6)) < 3.3:
			GameState.save_checkpoint(_player.position)
			MissionManager.record_event("player_near_beacon")

func _process(delta: float) -> void:
	_fps_time += delta
	if _fps_time > 0.30:
		_fps_time = 0.0
		if bool(GameState.settings.get("debug_overlay", false)):
			_performance.text = "FPS %d   draw %d   memory %.1f MB" % [Engine.get_frames_per_second(), Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME), float(Performance.get_monitor(Performance.MEMORY_STATIC)) / (1024.0 * 1024.0)]
		else:
			_performance.text = ""
	_power_label.text = "O₂ 100% (training)  ·  Jetpack power %d%%" % int(_player.power)
	if _status_timeout > 0.0:
		_status_timeout -= delta
		if _status_timeout <= 0.0:
			_status.text = ""
	_hint.text = _nearby_hint()

func _nearby_hint() -> String:
	var target: Area3D = _choose_target()
	if target == null:
		return "WASD / left joystick: move    •    Drag right side: look    •    SPACE: jump    •    E: interact"
	match target.name:
		"Sample":
			return "Geological practice sample nearby — press E or INTERACT"
		"Craft":
			return "Press E or INTERACT to board the rocket" if GameState.training_complete else "Press E or INTERACT to inspect the rocket"
		"Beacon":
			return "Navigation beacon — approach to register your first objective"
	return "Explore the training station"

func _choose_target() -> Area3D:
	var ray: CollisionObject3D = _player.interaction_ray_target()
	if ray is Area3D and ray.name in ["Sample", "Craft", "Beacon"]:
		if _player.global_position.distance_to(ray.global_position) < 4.9:
			return ray as Area3D
	var nearest: Area3D = null
	var distance: float = INF
	for key: String in ["sample", "craft", "beacon"]:
		var candidate: Area3D = _targets[key] as Area3D
		var dist: float = _player.global_position.distance_to(candidate.global_position)
		if dist < distance and dist < (5.0 if key == "craft" else 3.2):
			nearest = candidate
			distance = dist
	return nearest

func _interact() -> void:
	var selected: Area3D = _choose_target()
	if selected == null:
		_set_status("Move closer to a station, sample, or spacecraft.")
		return
	match selected.name:
		"Sample":
			if GameState.objective_index == 1:
				GameState.save_checkpoint(_player.position)
				MissionManager.record_event("interact_sample")
				selected.visible = false
				selected.monitoring = false
				selected.collision_layer = 0
				_sample_mesh.visible = false
				_sample_platform.visible = false
				_set_status("Sample secured! Your mission progress has been saved.")
			else:
				_set_status("Follow the objectives in order. Reach the beacon first.")
		"Craft":
			if GameState.training_complete:
				GameState.save_checkpoint(_player.position)
				GameState.start_launch_mission(GameState.flight_complete)
			elif GameState.objective_index == 2:
				GameState.save_checkpoint(_player.position)
				MissionManager.record_event("interact_spacecraft")
				_set_status("Spacecraft inspected — astronaut training complete!")
				_show_complete()
			else:
				_set_status("The rocket is ready after your training objectives.")
		"Beacon":
			_set_status("Beacon coordinates confirmed. Walk closer to activate it.")

func _set_status(message: String) -> void:
	_status.text = message
	_status_timeout = 6.0

func _progress_updated() -> void:
	_objective.text = "MISSION 01 / EARTH TRAINING\n%s" % MissionManager.training_objective()

func _build_world() -> void:
	var env_node: WorldEnvironment = WorldEnvironment.new()
	var env: Environment = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("557994")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("8b9da8")
	env.ambient_light_energy = 0.5
	env.tonemap_mode = Environment.TONE_MAPPER_FILMIC
	env_node.environment = env
	add_child(env_node)
	var sun: DirectionalLight3D = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-55, -28, 0)
	sun.light_energy = 1.15
	sun.shadow_enabled = false
	add_child(sun)
	_box("Terrain", Vector3(0, -0.45, 0), Vector3(100, 0.9, 100), Color("66787c"), true)
	_box("Launch apron", Vector3(0, 0.025, -12), Vector3(16, 0.05, 19), Color("384451"), true)
	_box("Training walkway", Vector3(3.3, 0.034, 6), Vector3(11.2, 0.06, 3), Color("2d4654"), false)
	_box("Training platform", Vector3(-6.0, 0.06, 2.0), Vector3(5, 0.10, 5), Color("2e5265"), false)
	_box("Mission control", Vector3(21, 2.0, -14), Vector3(12, 4.0, 10.0), Color("304b60"), true)
	_box("Control entrance", Vector3(15.0, 1.4, -14), Vector3(0.18, 2.8, 2.8), Color("58b5de"), false)
	_box("Barrier 1", Vector3(13, 0.75, 8), Vector3(0.5, 1.5, 12), Color("c7b9a1"), true)
	_box("Barrier 2", Vector3(-15, 0.75, -8), Vector3(0.5, 1.5, 12), Color("c7b9a1"), true)
	_make_beacon(Vector3(7, 0.0, 6))
	_make_sample(Vector3(-6, 0.0, 2))
	_make_spacecraft(Vector3(0, 0, -14))
	var rng: RandomNumberGenerator = RandomNumberGenerator.new()
	rng.seed = 40606
	for i in range(48):
		var point: Vector3 = Vector3(rng.randf_range(-40, 40), 0.12, rng.randf_range(-40, 40))
		if point.distance_to(Vector3(0, 0, 0)) < 24:
			continue
		_sphere("Rock", point, Vector3(rng.randf_range(0.35, 0.9), 0.24, rng.randf_range(0.35, 0.9)), Color("869699"))

func _box(object_name: String, place: Vector3, dimensions: Vector3, color: Color, solid: bool) -> MeshInstance3D:
	var instance: MeshInstance3D = MeshInstance3D.new()
	instance.name = object_name
	var mesh: BoxMesh = BoxMesh.new()
	mesh.size = dimensions
	instance.mesh = mesh
	instance.position = place
	instance.material_override = _mat(color)
	if solid:
		var body: StaticBody3D = StaticBody3D.new()
		body.position = place
		var collision: CollisionShape3D = CollisionShape3D.new()
		var shape: BoxShape3D = BoxShape3D.new()
		shape.size = dimensions
		collision.shape = shape
		body.add_child(collision)
		add_child(body)
	add_child(instance)
	return instance

func _sphere(object_name: String, place: Vector3, scale3: Vector3, color: Color) -> MeshInstance3D:
	var obj: MeshInstance3D = MeshInstance3D.new()
	obj.name = object_name
	var mesh: SphereMesh = SphereMesh.new()
	mesh.radial_segments = 12
	mesh.rings = 7
	obj.mesh = mesh
	obj.position = place
	obj.scale = scale3
	obj.material_override = _mat(color)
	add_child(obj)
	return obj

func _mat(color: Color) -> StandardMaterial3D:
	var m: StandardMaterial3D = StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = 0.81
	return m

func _target(name_str: String, position3: Vector3, radius: float) -> Area3D:
	var area: Area3D = Area3D.new()
	area.name = name_str
	area.position = position3
	area.collision_layer = 2
	area.collision_mask = 0
	var shape_node: CollisionShape3D = CollisionShape3D.new()
	var sphere: SphereShape3D = SphereShape3D.new()
	sphere.radius = radius
	shape_node.shape = sphere
	area.add_child(shape_node)
	add_child(area)
	_targets[name_str.to_lower()] = area
	return area

func _make_beacon(position3: Vector3) -> void:
	_box("Beacon pedestal", position3 + Vector3(0, 0.7, 0), Vector3(0.7, 1.4, 0.7), Color("b9c5d2"), false)
	_sphere("Beacon glow", position3 + Vector3(0, 1.7, 0), Vector3(0.55, 0.55, 0.55), Color("4eecf3"))
	_target("Beacon", position3 + Vector3(0, 0.8, 0), 1.0)
	_world_label("NAV BEACON", position3 + Vector3(0, 2.8, 0))

func _make_sample(position3: Vector3) -> void:
	_sample_platform = _box("Sample display", position3 + Vector3(0, 0.3, 0), Vector3(1.7, 0.6, 1.7), Color("386b80"), false)
	_sample_mesh = _sphere("Sample rock", position3 + Vector3(0, 0.85, 0), Vector3(0.52, 0.34, 0.4), Color("efa85b"))
	_target("Sample", position3 + Vector3(0, 1.0, 0), 1.1)
	_world_label("SAMPLE COLLECTION", position3 + Vector3(0, 2.2, 0))

func _make_spacecraft(position3: Vector3) -> void:
	var body: MeshInstance3D = MeshInstance3D.new()
	body.name = "Spacecraft rocket body"
	var cylinder: CylinderMesh = CylinderMesh.new()
	cylinder.top_radius = 1.3
	cylinder.bottom_radius = 1.3
	cylinder.height = 10.0
	cylinder.radial_segments = 14
	body.mesh = cylinder
	body.position = position3 + Vector3(0, 5.0, 0)
	body.material_override = _mat(Color("d5e6ed"))
	add_child(body)
	var rocket_collision: StaticBody3D = StaticBody3D.new()
	rocket_collision.position = position3 + Vector3(0, 5.0, 0)
	var rocket_shape: CollisionShape3D = CollisionShape3D.new()
	var physical: CylinderShape3D = CylinderShape3D.new()
	physical.radius = 1.3
	physical.height = 10.0
	rocket_shape.shape = physical
	rocket_collision.add_child(rocket_shape)
	add_child(rocket_collision)
	var nose: MeshInstance3D = MeshInstance3D.new()
	var cone: CylinderMesh = CylinderMesh.new()
	cone.top_radius = 0.0
	cone.bottom_radius = 1.3
	cone.height = 2.8
	nose.mesh = cone
	nose.position = position3 + Vector3(0, 11.3, 0)
	nose.material_override = _mat(Color("ec8d65"))
	add_child(nose)
	for i in range(4):
		var a: float = TAU * float(i) / 4.0
		var dx: float = cos(a)
		var dz: float = sin(a)
		_box("Rocket landing support", position3 + Vector3(dx * 1.9, 1.2, dz * 1.9), Vector3(0.6, 2.4, 0.65), Color("546675"), false)
		_box("Rocket base fin", position3 + Vector3(dx * 1.35, 1.4, dz * 1.35), Vector3(0.7, 2.8, 0.7), Color("b35b4d"), false)
	_target("Craft", position3 + Vector3(0, 1.5, 2.5), 1.5)
	_world_label("TRAINER MK I — BOARD AFTER TRAINING", position3 + Vector3(0, 13.2, 0))

func _world_label(text: String, pos: Vector3) -> void:
	var l: Label3D = Label3D.new()
	l.text = text
	l.font_size = 42
	l.pixel_size = 0.005
	l.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	l.modulate = Color("b8ecff")
	l.position = pos
	add_child(l)

func _build_hud() -> void:
	_hud_layer = CanvasLayer.new()
	add_child(_hud_layer)
	var root: Control = Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_hud_layer.add_child(root)
	var head: PanelContainer = UI.panel()
	head.position = Vector2(18, 14)
	head.custom_minimum_size = Vector2(520, 0)
	root.add_child(head)
	var labels: VBoxContainer = VBoxContainer.new()
	head.add_child(labels)
	_objective = UI.label("MISSION 01 · EARTH TRAINING", 19)
	labels.add_child(_objective)
	_power_label = UI.label("O₂ 100%", 16, Color("8bd9bb"))
	labels.add_child(_power_label)
	_crew_label = UI.label("", 14, UI.ACCENT)
	labels.add_child(_crew_label)
	_refresh_crew_label()
	var right: VBoxContainer = VBoxContainer.new()
	right.anchor_left = 1.0
	right.anchor_right = 1.0
	right.offset_left = -330
	right.offset_right = -18
	right.offset_top = 15
	root.add_child(right)
	var pause: Button = UI.button("PAUSE / SAVE")
	pause.custom_minimum_size = Vector2(220, 49)
	right.add_child(pause)
	pause.pressed.connect(_toggle_pause)
	var switch: Button = UI.button("CHOOSE ASTRONAUT")
	switch.custom_minimum_size = Vector2(220, 48)
	right.add_child(switch)
	switch.pressed.connect(_switch_crew)
	_performance = UI.label("", 14, UI.ACCENT)
	right.add_child(_performance)
	var bottom: VBoxContainer = VBoxContainer.new()
	bottom.anchor_left = 0.18
	bottom.anchor_right = 0.81
	bottom.anchor_top = 1.0
	bottom.anchor_bottom = 1.0
	bottom.offset_top = -104
	bottom.offset_bottom = -20
	bottom.alignment = BoxContainer.ALIGNMENT_END
	root.add_child(bottom)
	_status = UI.label("", 18, Color("8bd9bb"))
	bottom.add_child(_status)
	_hint = UI.label("Explore with the joystick or WASD", 15, UI.FG)
	bottom.add_child(_hint)
	var touch: Control = TOUCH_SCENE.instantiate() as Control
	root.add_child(touch)
	touch.movement_changed.connect(func(value: Vector2) -> void: _player.move_stick = value)
	touch.camera_dragged.connect(func(delta: Vector2) -> void: _player.look_delta(delta))
	touch.jump_pressed.connect(func() -> void: _player.request_jump())
	touch.interact_pressed.connect(func() -> void: _player.request_interact())
	touch.sprint_changed.connect(func(active: bool) -> void: _player.sprinting = active)
	touch.jetpack_changed.connect(func(active: bool) -> void: _player.jetpacking = active)

func _refresh_crew_label() -> void:
	_crew_label.text = "Explorer: %s  ·  Choose with button or C" % str(Crew.profile_for(GameState.selected_astronaut)["name"])

func _switch_crew() -> void:
	if _crew_overlay != null and is_instance_valid(_crew_overlay):
		_close_crew_picker()
		return
	_crew_overlay = CanvasLayer.new()
	_crew_overlay.layer = 22
	_crew_overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(_crew_overlay)
	var background: ColorRect = ColorRect.new()
	background.color = Color(0.015, 0.025, 0.04, 0.96)
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_crew_overlay.add_child(background)
	var margins: MarginContainer = MarginContainer.new()
	margins.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margins.add_theme_constant_override("margin_left", 42)
	margins.add_theme_constant_override("margin_right", 42)
	margins.add_theme_constant_override("margin_top", 25)
	margins.add_theme_constant_override("margin_bottom", 25)
	_crew_overlay.add_child(margins)
	var column: VBoxContainer = VBoxContainer.new()
	column.add_theme_constant_override("separation", 9)
	margins.add_child(column)
	column.add_child(UI.label("SELECT ASTRONAUT", 31))
	column.add_child(UI.label("Tap any name to switch instantly. Progress will remain saved.", 17, UI.MUTED))
	var scroll: ScrollContainer = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	column.add_child(scroll)
	var list: VBoxContainer = VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list.add_theme_constant_override("separation", 10)
	scroll.add_child(list)
	for role: String in Crew.GROUPS:
		list.add_child(UI.label(role.to_upper(), 20, UI.ACCENT))
		var grid: GridContainer = GridContainer.new()
		grid.columns = 4
		grid.add_theme_constant_override("h_separation", 10)
		grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		list.add_child(grid)
		for crew_id: String in Crew.GROUPS[role]:
			var entry: Dictionary = Crew.profile_for(crew_id)
			var button: Button = UI.button(str(entry["name"]))
			button.text = str(entry["name"]) + ("  ✓" if crew_id == GameState.selected_astronaut else "")
			button.custom_minimum_size = Vector2(240, 58)
			button.disabled = crew_id == GameState.selected_astronaut
			grid.add_child(button)
			button.pressed.connect(_select_crew.bind(crew_id))
	var close: Button = UI.button("BACK TO TRAINING", true)
	column.add_child(close)
	close.pressed.connect(_close_crew_picker)
	get_tree().paused = true

func _select_crew(crew_id: String) -> void:
	GameState.set_astronaut(crew_id)
	_player.refresh_suit()
	_refresh_crew_label()
	_close_crew_picker()
	_set_status("%s selected! Your choice is saved offline." % str(Crew.profile_for(crew_id)["name"]))

func _close_crew_picker() -> void:
	get_tree().paused = false
	if _crew_overlay != null and is_instance_valid(_crew_overlay):
		_crew_overlay.queue_free()
	_crew_overlay = null

func _unhandled_key_input(event: InputEvent) -> void:
	if event is InputEventKey:
		var key: InputEventKey = event as InputEventKey
		if key.pressed and not key.echo and key.keycode == KEY_C:
			_switch_crew()

func _toggle_pause() -> void:
	if _paused_overlay != null and is_instance_valid(_paused_overlay):
		_resume()
		return
	_save_position()
	_paused_overlay = CanvasLayer.new()
	_paused_overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	_paused_overlay.layer = 20
	add_child(_paused_overlay)
	var dark: ColorRect = ColorRect.new()
	dark.color = Color(0.01, 0.02, 0.05, 0.89)
	dark.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_paused_overlay.add_child(dark)
	var center: CenterContainer = CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_paused_overlay.add_child(center)
	var panel: PanelContainer = UI.panel()
	center.add_child(panel)
	var col: VBoxContainer = VBoxContainer.new()
	col.add_theme_constant_override("separation", 12)
	panel.add_child(col)
	col.add_child(UI.label("MISSION PAUSED", 32))
	col.add_child(UI.label("Checkpoint saved locally", 17, UI.MUTED))
	var resume: Button = UI.button("RESUME", true)
	col.add_child(resume)
	resume.pressed.connect(_resume)
	var retry: Button = UI.button("RESTART TRAINING")
	col.add_child(retry)
	retry.pressed.connect(func() -> void:
		get_tree().paused = false
		GameState.restart_training())
	var menu: Button = UI.button("SAVE & MAIN MENU")
	col.add_child(menu)
	menu.pressed.connect(_back_to_menu)
	get_tree().paused = true

func _resume() -> void:
	get_tree().paused = false
	if _paused_overlay != null and is_instance_valid(_paused_overlay):
		_paused_overlay.queue_free()
	_paused_overlay = null

func _save_position() -> void:
	GameState.save_checkpoint(_player.position)

func _back_to_menu() -> void:
	_save_position()
	get_tree().paused = false
	get_tree().change_scene_to_file(GameState.MENU)

func _show_complete() -> void:
	if _complete_shown:
		return
	_complete_shown = true
	_paused_overlay = CanvasLayer.new()
	_paused_overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	_paused_overlay.layer = 20
	add_child(_paused_overlay)
	var tint: ColorRect = ColorRect.new()
	tint.color = Color(0.01, 0.04, 0.09, 0.86)
	tint.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_paused_overlay.add_child(tint)
	var center: CenterContainer = CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_paused_overlay.add_child(center)
	var panel: PanelContainer = UI.panel()
	center.add_child(panel)
	var col: VBoxContainer = VBoxContainer.new()
	col.add_theme_constant_override("separation", 12)
	panel.add_child(col)
	col.add_child(UI.label("TRAINING COMPLETE!", 37, Color("8bd9bb")))
	col.add_child(UI.label("All 3 training objectives completed\nReward: +50 science points (first completion only)\nYour progress was saved on this device.", 19))
	var continue_button: Button = UI.button("CONTINUE EXPLORING")
	col.add_child(continue_button)
	continue_button.pressed.connect(_resume)
	var launch_button: Button = UI.button("BOARD ROCKET — PHASE 2", true)
	col.add_child(launch_button)
	launch_button.pressed.connect(func() -> void:
		get_tree().paused = false
		_save_position()
		GameState.start_launch_mission(GameState.flight_complete))
	var menu_button: Button = UI.button("MAIN MENU")
	col.add_child(menu_button)
	menu_button.pressed.connect(_back_to_menu)
	get_tree().paused = true

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		_toggle_pause()
