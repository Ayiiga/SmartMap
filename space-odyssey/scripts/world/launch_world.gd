extends Node3D
## Earth launch -> stage separation -> guided orbital insertion (Phase 2 vertical slice).
## All flight actions have real state transitions and save checkpoints.
const ROCKET_SCENE = preload("res://scenes/rocket/trainer_rocket.tscn")
const UI = preload("res://scripts/ui/space_ui.gd")
const Crew = preload("res://scripts/player/crew_catalog.gd")
var _rocket: RocketVehicle
var _camera: Camera3D
var _environment: Environment
var _status: Label
var _telemetry: Label
var _instruction: Label
var _details: Label
var _fps: Label
var _launch_button: Button
var _separate_button: Button
var _orbit_button: Button
var _assist_button: Button
var _pause_overlay: CanvasLayer
var _finish_overlay: CanvasLayer
var _status_timeout: float = 0.0
var _autosave_timer: float = 0.0
var _debris: Node3D
var _debris_velocity: float = 0.0
var _last_status: String = ""

func _ready() -> void:
	GameState.current_mission = "launch_001"
	_build_environment()
	_rocket = ROCKET_SCENE.instantiate() as RocketVehicle
	add_child(_rocket)
	_rocket.launched.connect(_on_launched)
	_rocket.stage_separated.connect(_on_separated)
	_rocket.orbit_reached.connect(_on_orbit)
	_rocket.failed.connect(_on_failed)
	if not GameState.flight_checkpoint.is_empty():
		_rocket.restore(GameState.flight_checkpoint)
	_build_hud()
	_update_ui()
	if _rocket.phase == RocketVehicle.Phase.ORBIT and GameState.flight_complete:
		_show_completion()
	else:
		_set_status("You're aboard! Tap 1 · LAUNCH. Watch the arrows for each next step.")

func _build_environment() -> void:
	var sky: WorldEnvironment = WorldEnvironment.new()
	_environment = Environment.new()
	_environment.background_mode = Environment.BG_COLOR
	_environment.background_color = Color("4a7399")
	_environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	_environment.ambient_light_color = Color("9aaebc")
	_environment.ambient_light_energy = 0.65
	sky.environment = _environment
	add_child(sky)
	var light: DirectionalLight3D = DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-43, -25, 0)
	light.light_energy = 1.25
	light.shadow_enabled = false
	add_child(light)
	_box("Launch concrete", Vector3(0, -0.45, 0), Vector3(90, 0.9, 90), Color("54616c"))
	_box("Rocket platform", Vector3(0, 0.06, 0), Vector3(15, 0.15, 15), Color("334556"))
	_box("Tower", Vector3(-8.5, 13, -1.0), Vector3(2.4, 26.0, 2.4), Color("8695a7"))
	for i: int in range(6):
		_box("Tower crossbar", Vector3(-6.8, 4.0 + float(i) * 3.8, -1.0), Vector3(3.4, 0.38, 0.65), Color("c2a881"))
	for i: int in range(36):
		var a: float = float(i) * 2.39996
		var n: float = 40.0 + float(i % 11) * 8.0
		_sphere("Distant star", Vector3(cos(a) * n, 95.0 + float(i % 7) * 10.0, sin(a) * n), 0.40, Color("c4e1ff"))
	_camera = Camera3D.new()
	_camera.current = true
	_camera.fov = 68.0
	_camera.position = Vector3(22, 14, 26)
	add_child(_camera)
	_camera.look_at(Vector3(0, 8, 0), Vector3.UP)

func _material(color: Color) -> Material:
	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.85
	return mat

func _box(name_str: String, pos: Vector3, size3: Vector3, color: Color) -> void:
	var item: MeshInstance3D = MeshInstance3D.new()
	item.name = name_str
	var mesh: BoxMesh = BoxMesh.new()
	mesh.size = size3
	item.mesh = mesh
	item.position = pos
	item.material_override = _material(color)
	add_child(item)

func _sphere(name_str: String, pos: Vector3, radius: float, color: Color) -> void:
	var item: MeshInstance3D = MeshInstance3D.new()
	item.name = name_str
	var mesh: SphereMesh = SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2.0
	mesh.radial_segments = 8
	mesh.rings = 4
	item.mesh = mesh
	item.position = pos
	item.material_override = _material(color)
	add_child(item)

func _build_hud() -> void:
	var layer: CanvasLayer = CanvasLayer.new()
	add_child(layer)
	var root: Control = Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(root)
	var left: PanelContainer = UI.panel()
	left.position = Vector2(16, 14)
	left.custom_minimum_size = Vector2(330, 0)
	root.add_child(left)
	var info_col: VBoxContainer = VBoxContainer.new()
	left.add_child(info_col)
	info_col.add_child(UI.label("TRAINER MK I  ·  EARTH", 19, UI.ACCENT))
	_telemetry = UI.label("Altitude 0 m", 22)
	info_col.add_child(_telemetry)
	_details = UI.label("Stage 1", 16, Color("9de3c7"))
	info_col.add_child(_details)
	var center: PanelContainer = UI.panel()
	center.anchor_left = 0.32
	center.anchor_right = 0.77
	center.offset_top = 14
	root.add_child(center)
	var mission_col: VBoxContainer = VBoxContainer.new()
	center.add_child(mission_col)
	mission_col.add_child(UI.label("MISSION 02 · FIRST FLIGHT", 19, UI.ACCENT))
	_instruction = UI.label("Tap LAUNCH to begin", 18)
	mission_col.add_child(_instruction)
	var upper: VBoxContainer = VBoxContainer.new()
	upper.anchor_left = 1
	upper.anchor_right = 1
	upper.offset_left = -235
	upper.offset_right = -16
	upper.offset_top = 14
	root.add_child(upper)
	var pause: Button = _sized_button("PAUSE / SAVE", 210, 49)
	upper.add_child(pause)
	pause.pressed.connect(_toggle_pause)
	_fps = UI.label("", 13, UI.ACCENT)
	upper.add_child(_fps)
	var action_col: VBoxContainer = VBoxContainer.new()
	action_col.anchor_top = 1
	action_col.anchor_bottom = 1
	action_col.offset_left = 17
	action_col.offset_right = 285
	action_col.offset_top = -253
	action_col.offset_bottom = -14
	action_col.add_theme_constant_override("separation", 8)
	root.add_child(action_col)
	_launch_button = _sized_button("1  LAUNCH ROCKET", 250, 66, true)
	action_col.add_child(_launch_button)
	_launch_button.pressed.connect(_launch)
	_separate_button = _sized_button("2  SEPARATE STAGE", 250, 66, true)
	action_col.add_child(_separate_button)
	_separate_button.pressed.connect(_stage)
	_orbit_button = _sized_button("3  GUIDED ORBIT", 250, 66, true)
	action_col.add_child(_orbit_button)
	_orbit_button.pressed.connect(_orbit)
	var controls: VBoxContainer = VBoxContainer.new()
	controls.anchor_left = 1
	controls.anchor_right = 1
	controls.anchor_top = 1
	controls.anchor_bottom = 1
	controls.offset_left = -565
	controls.offset_right = -18
	controls.offset_top = -252
	controls.offset_bottom = -10
	controls.add_theme_constant_override("separation", 8)
	root.add_child(controls)
	controls.add_child(UI.label("FLIGHT CONTROLS", 16, UI.ACCENT))
	var row_one: HBoxContainer = UI.row()
	controls.add_child(row_one)
	var less: Button = _sized_button("THROTTLE −", 165, 55)
	row_one.add_child(less)
	less.pressed.connect(func() -> void: _change_throttle(-0.1))
	var more: Button = _sized_button("THROTTLE +", 165, 55)
	row_one.add_child(more)
	more.pressed.connect(func() -> void: _change_throttle(0.1))
	var row_two: HBoxContainer = UI.row()
	controls.add_child(row_two)
	var down: Button = _sized_button("TILT −", 165, 55)
	row_two.add_child(down)
	down.pressed.connect(func() -> void: _steer(-5.0))
	var up: Button = _sized_button("TILT +", 165, 55)
	row_two.add_child(up)
	up.pressed.connect(func() -> void: _steer(5.0))
	_assist_button = _sized_button("ASSIST: ON", 200, 50)
	controls.add_child(_assist_button)
	_assist_button.pressed.connect(_toggle_assist)
	var bottom: VBoxContainer = VBoxContainer.new()
	bottom.anchor_left = 0.27
	bottom.anchor_right = 0.55
	bottom.anchor_top = 1
	bottom.anchor_bottom = 1
	bottom.offset_top = -170
	bottom.offset_bottom = -25
	root.add_child(bottom)
	_status = UI.label("", 17, Color("9ce4c3"))
	bottom.add_child(_status)
	bottom.add_child(UI.label("L = Launch · X = Stage · O = Orbit · +/− = Throttle", 13, UI.MUTED))

func _sized_button(text: String, width: int, height: int, accent: bool = false) -> Button:
	var b: Button = UI.button(text, accent)
	b.custom_minimum_size = Vector2(width, height)
	b.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	return b

func _process(delta: float) -> void:
	_update_ui()
	var desired: Vector3 = _rocket.global_position + Vector3(22, 12, 27)
	_camera.global_position = _camera.global_position.lerp(desired, minf(1.0, delta * 3.0))
	_camera.look_at(_rocket.global_position + Vector3(0, 7, 0), Vector3.UP)
	var sky_factor: float = clampf(_rocket.altitude_m / 42000.0, 0.0, 1.0)
	_environment.background_color = Color("4a7399").lerp(Color("071020"), sky_factor)
	if _debris != null and is_instance_valid(_debris):
		_debris_velocity += 9.81 * delta
		_debris.position.y -= _debris_velocity * delta
		_debris.rotation.z += 0.45 * delta
		if _debris.position.y < -10.0:
			_debris.queue_free()
			_debris = null
	if _status_timeout > 0.0:
		_status_timeout -= delta
		if _status_timeout <= 0.0:
			_status.text = ""
	if _rocket.phase == RocketVehicle.Phase.STAGE_ONE or _rocket.phase == RocketVehicle.Phase.SEPARATION or _rocket.phase == RocketVehicle.Phase.STAGE_TWO:
		_autosave_timer += delta
		if _autosave_timer >= 8.0:
			_autosave_timer = 0.0
			_save_flight()
	if bool(GameState.settings.get("debug_overlay", false)):
		_fps.text = "FPS %d · draw %d" % [Engine.get_frames_per_second(), Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME)]
	else:
		_fps.text = ""

func _update_ui() -> void:
	if _telemetry == null:
		return
	var stage_text: String = "READY"
	match _rocket.phase:
		RocketVehicle.Phase.STAGE_ONE: stage_text = "STAGE 1 — ASCENT"
		RocketVehicle.Phase.SEPARATION: stage_text = "ENGINE OFF — SEPARATE"
		RocketVehicle.Phase.STAGE_TWO: stage_text = "STAGE 2 — ASCENT"
		RocketVehicle.Phase.ORBIT: stage_text = "ORBIT REACHED"
		RocketVehicle.Phase.FAILED: stage_text = "LAUNCH FAILED"
	_telemetry.text = "HEIGHT   %d m\nSPEED    %d m/s\nFUEL       %d%%" % [roundi(_rocket.altitude_m), roundi(_rocket.current_speed_m_s()), _rocket.active_fuel_percent()]
	_details.text = "%s\nThrottle %d%%  ·  Tilt %d°\nMass %.0f kg  ·  %s" % [stage_text, roundi(_rocket.throttle * 100.0), roundi(_rocket.pitch_deg), _rocket.current_mass_kg(), str(Crew.profile_for(GameState.selected_astronaut)["name"])]
	_instruction.text = MissionManager.flight_objective()
	_launch_button.disabled = _rocket.phase != RocketVehicle.Phase.READY
	_separate_button.disabled = not _rocket.can_separate() or GameState.flight_step < 1
	_orbit_button.disabled = not _rocket.can_insert_orbit() or GameState.flight_step < 2
	_assist_button.text = "FLIGHT ASSIST: ON" if _rocket.assisted else "FLIGHT ASSIST: OFF"
	if _rocket.phase == RocketVehicle.Phase.SEPARATION:
		_separate_button.text = "2  SEPARATE NOW!"
	else:
		_separate_button.text = "2  SEPARATE STAGE"
	if _rocket.can_insert_orbit():
		_orbit_button.text = "3  ORBIT READY!"
	else:
		_orbit_button.text = "3  GUIDED ORBIT"

func _launch() -> void:
	if not _rocket.ignite():
		_set_status("This rocket is already flying. Follow the next mission step.")

func _stage() -> void:
	if not _rocket.separate_stage():
		_set_status("Wait for Stage 1 to run low on fuel.")

func _drop_stage() -> void:
	_debris = Node3D.new()
	_debris.position = _rocket.position + Vector3(0, 5, 0)
	add_child(_debris)
	var mesh: CylinderMesh = CylinderMesh.new()
	mesh.height = 7.8
	mesh.top_radius = 1.3
	mesh.bottom_radius = 1.3
	var piece: MeshInstance3D = MeshInstance3D.new()
	piece.mesh = mesh
	piece.material_override = _material(Color("c7d7e2"))
	_debris.add_child(piece)
	_debris_velocity = 0.0

func _orbit() -> void:
	if not _rocket.insert_guided_orbit():
		_set_status("Climb higher and faster in Stage 2. Keep throttle near 70–100%.")

func _change_throttle(change: float) -> void:
	_rocket.set_throttle(_rocket.throttle + change)
	_set_status("Throttle: %d%%" % roundi(_rocket.throttle * 100))

func _steer(change: float) -> void:
	_rocket.adjust_pitch(change)
	_set_status("Tilt: %d° · flight assist may correct your angle." % roundi(_rocket.pitch_deg))

func _toggle_assist() -> void:
	_rocket.assisted = not _rocket.assisted
	GameState.settings["assisted_controls"] = _rocket.assisted
	GameState.save_local()
	_set_status("Flight assist %s" % ("ON — beginner guidance" if _rocket.assisted else "OFF — manual tilt"))

func _on_launched() -> void:
	if GameState.flight_step == 0:
		GameState.record_flight_step(1)
	_save_flight()
	_set_status("Liftoff! Keep throttle high until SEPARATE lights up.")

func _on_separated() -> void:
	if GameState.flight_step == 1:
		GameState.record_flight_step(2)
	_save_flight()
	_drop_stage()
	_set_status("Stage 1 released! Stage 2 engine engaged. Watch for ORBIT READY.")

func _on_orbit() -> void:
	if GameState.flight_step == 2:
		GameState.record_flight_step(3)
	_save_flight()
	_show_completion()

func _on_failed(reason: String) -> void:
	_save_flight()
	_set_status(reason)
	_show_failure(reason)

func _set_status(msg: String) -> void:
	_status.text = msg
	_status_timeout = 8.0

func _save_flight() -> void:
	GameState.save_flight_checkpoint(_rocket.snapshot())

func _toggle_pause() -> void:
	if _pause_overlay != null and is_instance_valid(_pause_overlay):
		_resume()
		return
	_save_flight()
	_pause_overlay = _modal("FLIGHT PAUSED", "Your rocket position, stage and fuel have been saved locally.")
	var buttons: VBoxContainer = _pause_overlay.get_node("Center/Panel/Buttons") as VBoxContainer
	var resume: Button = UI.button("RESUME FLIGHT", true)
	buttons.add_child(resume)
	resume.pressed.connect(_resume)
	var retry: Button = UI.button("RETRY LAUNCH")
	buttons.add_child(retry)
	retry.pressed.connect(_retry)
	var quit: Button = UI.button("SAVE & MAIN MENU")
	buttons.add_child(quit)
	quit.pressed.connect(_menu)
	get_tree().paused = true

func _modal(title: String, subtitle: String) -> CanvasLayer:
	var layer: CanvasLayer = CanvasLayer.new()
	layer.layer = 30
	layer.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(layer)
	var dim: ColorRect = ColorRect.new()
	dim.color = Color(0.02, 0.04, 0.08, 0.91)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	dim.mouse_filter = Control.MOUSE_FILTER_STOP
	layer.add_child(dim)
	var center: CenterContainer = CenterContainer.new()
	center.name = "Center"
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layer.add_child(center)
	var panel: PanelContainer = UI.panel()
	panel.name = "Panel"
	center.add_child(panel)
	var col: VBoxContainer = VBoxContainer.new()
	col.name = "Buttons"
	col.add_theme_constant_override("separation", 13)
	panel.add_child(col)
	col.add_child(UI.label(title, 32, UI.ACCENT))
	col.add_child(UI.label(subtitle, 19))
	return layer

func _resume() -> void:
	get_tree().paused = false
	if _pause_overlay != null and is_instance_valid(_pause_overlay):
		_pause_overlay.queue_free()
	_pause_overlay = null

func _show_completion() -> void:
	if _finish_overlay != null and is_instance_valid(_finish_overlay):
		return
	_finish_overlay = _modal("YOU REACHED EARTH ORBIT!", "Mission 02 complete · 120 km guided orbit\n+150 science points on first completion\nNext: Moon transfer and lunar landing (Phase 3)")
	var actions: VBoxContainer = _finish_overlay.get_node("Center/Panel/Buttons") as VBoxContainer
	var back: Button = UI.button("SAVE & MAIN MENU", true)
	actions.add_child(back)
	back.pressed.connect(_menu)
	var replay: Button = UI.button("REPLAY ROCKET LAUNCH")
	actions.add_child(replay)
	replay.pressed.connect(_retry)
	get_tree().paused = true

func _show_failure(reason: String) -> void:
	if _finish_overlay != null and is_instance_valid(_finish_overlay):
		return
	_finish_overlay = _modal("ROCKET FLIGHT ENDED", reason + "\nYour previous rewards remain saved.")
	var actions: VBoxContainer = _finish_overlay.get_node("Center/Panel/Buttons") as VBoxContainer
	var retry: Button = UI.button("RETRY LAUNCH", true)
	actions.add_child(retry)
	retry.pressed.connect(_retry)
	var back: Button = UI.button("SAVE & MAIN MENU")
	actions.add_child(back)
	back.pressed.connect(_menu)
	get_tree().paused = true

func _retry() -> void:
	get_tree().paused = false
	GameState.start_launch_mission(true)

func _menu() -> void:
	_save_flight()
	get_tree().paused = false
	get_tree().change_scene_to_file(GameState.MENU)

func _unhandled_key_input(event: InputEvent) -> void:
	if not event is InputEventKey:
		return
	var key: InputEventKey = event as InputEventKey
	if not key.pressed or key.echo:
		return
	match key.keycode:
		KEY_L: _launch()
		KEY_X: _stage()
		KEY_O: _orbit()
		KEY_EQUAL, KEY_KP_ADD: _change_throttle(0.1)
		KEY_MINUS, KEY_KP_SUBTRACT: _change_throttle(-0.1)
		KEY_LEFT: _steer(-5.0)
		KEY_RIGHT: _steer(5.0)
		KEY_ESCAPE: _toggle_pause()

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		_toggle_pause()
