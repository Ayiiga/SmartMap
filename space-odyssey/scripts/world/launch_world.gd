extends Node3D
## Earth launch -> stage separation -> guided orbital insertion (Phase 2 vertical slice).
## All flight actions have real state transitions and save checkpoints.
const ROCKET_SCENE = preload("res://scenes/rocket/trainer_rocket.tscn")
const UI = preload("res://scripts/ui/space_ui.gd")
const FLIGHT_STICK = preload("res://scripts/flight/flight_stick.gd")
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
var _radio_overlay: CanvasLayer
var _radio_text: Label
var _pause_overlay: CanvasLayer
var _finish_overlay: CanvasLayer
var _status_timeout: float = 0.0
var _autosave_timer: float = 0.0
var _debris: Node3D
var _debris_velocity: float = 0.0
var _last_status: String = ""
var _auto_step_timer: float = 0.0
var _flight_axis: Vector2 = Vector2.ZERO

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
	GameAudio.radio_message.connect(_radio_received)
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
	light.light_energy = 1.48
	light.shadow_enabled = false
	add_child(light)
	_box("Launch concrete", Vector3(0, -0.45, 0), Vector3(90, 0.9, 90), Color("54616c"))
	_box("Rocket platform", Vector3(0, 0.06, 0), Vector3(15, 0.15, 15), Color("334556"))
	for x: float in [-9.42, -7.58]:
		for z: float in [-2.06, 0.06]:
			_box("Service tower support", Vector3(x, 12.2, z), Vector3(0.29, 24.4, 0.29), Color("8b9ca5"))
	for i: int in range(6):
		var level: float = 2.2 + float(i) * 3.8
		_box("Tower platform", Vector3(-8.5, level, -1.0), Vector3(2.49, 0.17, 2.64), Color("545f67"))
		for z: float in [-2.07, 0.07]:
			var brace := _box("Tower brace", Vector3(-8.5, level + 1.9, z), Vector3(0.13, 4.2, 0.14), Color("81919e"))
			brace.rotation.z = 0.45 if i % 2 == 0 else -0.45
	for x: float in [-6.9, 6.9]:
		_box("Pad stripe", Vector3(x, 0.145, 0), Vector3(0.17, 0.019, 14.2), Color("e0b767"))
	_box("Service arm", Vector3(-5.0, 10.15, -0.66), Vector3(5.8, 0.24, 0.63), Color("b49b75"))
	for i: int in range(36):
		var a: float = float(i) * 2.39996
		var n: float = 40.0 + float(i % 11) * 8.0
		_sphere("Distant star", Vector3(cos(a) * n, 95.0 + float(i % 7) * 10.0, sin(a) * n), 0.40, Color("c4e1ff"))
	_camera = Camera3D.new()
	_camera.current = true
	_camera.fov = 68.0
	_camera.position = Vector3(8, 8.2, 19.5)
	add_child(_camera)
	_camera.look_at(Vector3(0, 8, 0), Vector3.UP)

func _material(color: Color) -> Material:
	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.85
	return mat

func _box(name_str: String, pos: Vector3, size3: Vector3, color: Color) -> MeshInstance3D:
	var item: MeshInstance3D = MeshInstance3D.new()
	item.name = name_str
	var mesh: BoxMesh = BoxMesh.new()
	mesh.size = size3
	item.mesh = mesh
	item.position = pos
	item.material_override = _material(color)
	add_child(item)
	return item

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
	# Flight HUD: only telemetry, the current task, steering and two throttle buttons.
	var panel: PanelContainer = UI.panel()
	panel.position = Vector2(14, 12)
	panel.custom_minimum_size = Vector2(226, 0)
	root.add_child(panel)
	var readings: VBoxContainer = VBoxContainer.new()
	panel.add_child(readings)
	readings.add_child(UI.label("EARTH LAUNCH", 18, UI.ACCENT))
	_telemetry = UI.label("ALT 0 m", 18)
	readings.add_child(_telemetry)
	_details = UI.label("READY", 14, Color("a8ead6"))
	readings.add_child(_details)
	_instruction = UI.label("TAP LAUNCH TO LIFT OFF", 17, Color("fbe194"))
	_instruction.anchor_left = 0.30
	_instruction.anchor_right = 0.78
	_instruction.offset_top = 16
	_instruction.offset_bottom = 48
	_instruction.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(_instruction)
	var pause: Button = _sized_button("Ⅱ  PAUSE", 130, 50)
	pause.anchor_left = 1.0
	pause.anchor_right = 1.0
	pause.offset_left = -147
	pause.offset_right = -17
	pause.offset_top = 15
	pause.offset_bottom = 65
	root.add_child(pause)
	pause.pressed.connect(_toggle_pause)
	_fps = UI.label("", 13, UI.ACCENT)
	_fps.anchor_left = 1.0
	_fps.anchor_right = 1.0
	_fps.offset_left = -205
	_fps.offset_top = 70
	root.add_child(_fps)
	var stick: Control = FLIGHT_STICK.new()
	stick.anchor_top = 1.0
	stick.anchor_bottom = 1.0
	stick.offset_left = 16
	stick.offset_right = 184
	stick.offset_top = -185
	stick.offset_bottom = -17
	root.add_child(stick)
	stick.connect("axis_changed", _stick_changed)
	var throttles: HBoxContainer = UI.row()
	throttles.anchor_top = 1.0
	throttles.anchor_bottom = 1.0
	throttles.offset_left = 204
	throttles.offset_right = 413
	throttles.offset_top = -89
	throttles.offset_bottom = -28
	throttles.add_theme_constant_override("separation", 8)
	root.add_child(throttles)
	var less: Button = _sized_button("− LESS", 98, 58)
	throttles.add_child(less)
	less.pressed.connect(func() -> void: _change_throttle(-0.1))
	var more: Button = _sized_button("+ MORE", 98, 58)
	throttles.add_child(more)
	more.pressed.connect(func() -> void: _change_throttle(0.1))
	_launch_button = _sized_button("LAUNCH  ▶", 290, 70, true)
	_launch_button.anchor_left = 1.0
	_launch_button.anchor_right = 1.0
	_launch_button.anchor_top = 1.0
	_launch_button.anchor_bottom = 1.0
	_launch_button.offset_left = -310
	_launch_button.offset_right = -20
	_launch_button.offset_top = -95
	_launch_button.offset_bottom = -25
	root.add_child(_launch_button)
	_launch_button.pressed.connect(_next_step)
	_status = UI.label("", 15, Color("a8ead6"))
	_status.anchor_left = 0.30
	_status.anchor_right = 0.78
	_status.offset_top = 51
	_status.offset_bottom = 96
	_status.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(_status)
func _sized_button(text: String, width: int, height: int, accent: bool = false) -> Button:
	var b: Button = UI.button(text, accent)
	b.custom_minimum_size = Vector2(width, height)
	b.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	return b

func _stick_changed(direction: Vector2) -> void:
	_flight_axis = direction

func _process(delta: float) -> void:
	_update_ui()
	if _rocket.phase == RocketVehicle.Phase.STAGE_ONE or _rocket.phase == RocketVehicle.Phase.STAGE_TWO:
		if absf(_flight_axis.x) > 0.10:
			_rocket.steer_yaw(_flight_axis.x * 32.0 * delta)
		if not _rocket.assisted and absf(_flight_axis.y) > 0.10:
			_rocket.adjust_pitch(-_flight_axis.y * 26.0 * delta)
	# Assisted mode prevents first-time users from becoming stranded between stages.
	if _rocket.assisted and (_rocket.phase == RocketVehicle.Phase.SEPARATION or _rocket.can_insert_orbit()):
		_auto_step_timer += delta
		if _auto_step_timer >= 5.0:
			_auto_step_timer = 0.0
			_next_step()
	else:
		_auto_step_timer = 0.0
	var desired: Vector3 = _rocket.global_position + Vector3(8.0 if _rocket.phase == RocketVehicle.Phase.READY else 6.2, 8.2, 19.5)
	_camera.global_position = _camera.global_position.lerp(desired, minf(1.0, delta * 3.4))
	_camera.look_at(_rocket.global_position + Vector3(0, 7, 0), Vector3.UP)
	var sky_factor: float = clampf(_rocket.altitude_m / 42000.0, 0.0, 1.0)
	_environment.background_color = Color("4a7399").lerp(Color("071020"), sky_factor)
	if _debris != null and is_instance_valid(_debris):
		_debris_velocity += 9.81 * delta
		_debris.position.y -= _debris_velocity * delta
		_debris.position.x -= 2.8 * delta
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
	if _telemetry == null or _rocket == null:
		return
	var stage_text: String = "READY"
	match _rocket.phase:
		RocketVehicle.Phase.STAGE_ONE: stage_text = "STAGE 1 ASCENT"
		RocketVehicle.Phase.SEPARATION: stage_text = "STAGE 1 EMPTY"
		RocketVehicle.Phase.STAGE_TWO: stage_text = "STAGE 2 ASCENT"
		RocketVehicle.Phase.ORBIT: stage_text = "ORBIT ACHIEVED"
		RocketVehicle.Phase.FAILED: stage_text = "FLIGHT ENDED"
	_telemetry.text = "ALT %d m  ·  SPEED %d m/s\nFUEL %d%%" % [roundi(_rocket.altitude_m), roundi(_rocket.current_speed_m_s()), _rocket.active_fuel_percent()]
	_details.text = "%s  ·  THRUST %d%%" % [stage_text, roundi(_rocket.throttle * 100.0)]
	_launch_button.disabled = false
	match _rocket.phase:
		RocketVehicle.Phase.READY:
			_launch_button.text = "1   LAUNCH ROCKET  ▶"
			_instruction.text = "01  ·  LAUNCH ROCKET"
		RocketVehicle.Phase.STAGE_ONE:
			if _rocket.can_separate():
				_launch_button.text = "2   SEPARATE STAGE  ▶"
				_instruction.text = "02  ·  SEPARATE STAGE"
			else:
				_launch_button.text = "ASCENDING..."
				_launch_button.disabled = true
				_instruction.text = "ASCENDING  ·  KEEP THRUST STEADY"
		RocketVehicle.Phase.SEPARATION:
			_launch_button.text = "2   SEPARATE STAGE  ▶"
			_instruction.text = "02  ·  SEPARATE STAGE"
		RocketVehicle.Phase.STAGE_TWO:
			if _rocket.can_insert_orbit():
				_launch_button.text = "3   ENTER EARTH ORBIT  ▶"
				_instruction.text = "03  ·  ENTER EARTH ORBIT"
			else:
				_launch_button.text = "CLIMBING..."
				_launch_button.disabled = true
				_instruction.text = "STAGE 2  ·  CLIMBING TO ORBIT"
		RocketVehicle.Phase.ORBIT:
			_launch_button.text = "MISSION COMPLETE ✓"
			_launch_button.disabled = true
			_instruction.text = "ORBIT ACHIEVED ✓"
		RocketVehicle.Phase.FAILED:
			_launch_button.text = "RETRY LAUNCH"
			_instruction.text = "Flight ended. Tap RETRY to start safely again."

func _next_step() -> void:
	match _rocket.phase:
		RocketVehicle.Phase.READY:
			_launch()
		RocketVehicle.Phase.STAGE_ONE:
			if _rocket.can_separate():
				_stage()
			else:
				_set_status("Rocket is climbing. Keep guided flight ON; stage will be ready shortly.")
		RocketVehicle.Phase.SEPARATION:
			_stage()
		RocketVehicle.Phase.STAGE_TWO:
			if _rocket.can_insert_orbit():
				_orbit()
			else:
				_set_status("Keep going! Orbit unlocks when height and speed are sufficient.")
		RocketVehicle.Phase.FAILED:
			_retry()
func _launch() -> void:
	if not _rocket.ignite():
		_set_status("This rocket is already flying. Follow the next mission step.")

func _stage() -> void:
	if not _rocket.separate_stage():
		_set_status("Wait for Stage 1 to run low on fuel.")

func _drop_stage() -> void:
	if is_instance_valid(_debris):
		_debris.queue_free()
	_debris = _rocket.detach_stage_visual(self)
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
	_set_status("Mode: %s" % ("Explorer — assisted pitch, steer heading" if _rocket.assisted else "Pilot — control pitch and heading with left stick"))

func _on_launched() -> void:
	if GameState.flight_step == 0:
		GameState.record_flight_step(1)
	_save_flight()
	_set_status("Liftoff! Keep throttle high until SEPARATE lights up.")
	GameAudio.effect("launch")
	GameAudio.communicate("GigaOrbit mission control to pilot. Liftoff confirmed. Keep assisted flight on until stage separation.")

func _on_separated() -> void:
	if GameState.flight_step == 1:
		GameState.record_flight_step(2)
	_save_flight()
	_drop_stage()
	_set_status("Stage 1 released! Stage 2 engine engaged. Watch for ORBIT READY.")
	GameAudio.effect("stage")
	GameAudio.communicate("Stage separation successful. Second stage engaged. Continue to Earth orbit.")

func _on_orbit() -> void:
	if GameState.flight_step == 2:
		GameState.record_flight_step(3)
	_save_flight()
	GameAudio.effect("success")
	GameAudio.communicate("Congratulations. Earth orbit is achieved. You can now try the comet dodging mission.")
	_show_completion()

func _on_failed(reason: String) -> void:
	_save_flight()
	_set_status(reason)
	GameAudio.communicate("Mission warning. %s" % reason, true)
	_show_failure(reason)

func _set_status(msg: String) -> void:
	_status.text = msg
	_status_timeout = 8.0

func _save_flight() -> void:
	GameState.save_flight_checkpoint(_rocket.snapshot())

func _radio_received(message: String) -> void:
	if _radio_text != null and is_instance_valid(_radio_text):
		_radio_text.text = message
	if _status != null:
		_set_status("MISSION CONTROL: " + message)

func _open_radio() -> void:
	if _radio_overlay != null and is_instance_valid(_radio_overlay):
		return
	_radio_overlay = _modal("SHIP RADIO · MISSION CONTROL", "Touch to communicate. Subtitles and offline beeps always work.")
	var buttons: VBoxContainer = _radio_overlay.get_node("Center/Panel/Buttons") as VBoxContainer
	_radio_text = UI.label("What would you like to ask the spacecraft?", 19, UI.ACCENT)
	buttons.add_child(_radio_text)
	var check: Button = UI.button("REQUEST ROCKET STATUS")
	buttons.add_child(check)
	check.pressed.connect(_radio_status)
	var help: Button = UI.button("WHAT SHOULD I DO NEXT?")
	buttons.add_child(help)
	help.pressed.connect(_radio_guidance)
	var again: Button = UI.button("REPEAT RADIO MESSAGE")
	buttons.add_child(again)
	again.pressed.connect(func() -> void: GameAudio.repeat_radio())
	var close: Button = UI.button("CLOSE RADIO · RESUME", true)
	buttons.add_child(close)
	close.pressed.connect(_close_radio)
	get_tree().paused = true
	_radio_guidance()

func _radio_status() -> void:
	GameAudio.communicate("Rocket status. Altitude %d metres. Speed %d metres per second. Fuel remaining %d percent. Guided controls %s." % [roundi(_rocket.altitude_m), roundi(_rocket.current_speed_m_s()), _rocket.active_fuel_percent(), "on" if _rocket.assisted else "off"])

func _radio_guidance() -> void:
	var hint: String = "Tap LAUNCH to ignite the rocket."
	match _rocket.phase:
		RocketVehicle.Phase.STAGE_ONE, RocketVehicle.Phase.SEPARATION:
			hint = "Continue ascending. When stage one fuel is low, tap SEPARATE STAGE."
		RocketVehicle.Phase.STAGE_TWO:
			hint = "Keep thrust steady. When the orbit button unlocks, tap ENTER ORBIT."
		RocketVehicle.Phase.ORBIT:
			hint = "Earth orbit complete. Tap FLY TO MOON to pilot your landing."
		RocketVehicle.Phase.FAILED:
			hint = "Tap RETRY for another safe launch."
	GameAudio.communicate(hint)

func _close_radio() -> void:
	get_tree().paused = false
	if _radio_overlay != null and is_instance_valid(_radio_overlay):
		_radio_overlay.queue_free()
	_radio_overlay = null
	_radio_text = null

func _settings() -> void:
	_save_flight()
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/ui/settings_screen.tscn")

func _moon_transfer() -> void:
	_save_flight()
	get_tree().paused = false
	GameState.begin_transfer("moon")

func _comet_mission() -> void:
	_save_flight()
	get_tree().paused = false
	GameState.start_comet_mission()

func _radio_from_pause() -> void:
	_resume()
	_open_radio()

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
	var mode: Button = UI.button("MODE: EXPLORER / PILOT")
	buttons.add_child(mode)
	mode.pressed.connect(_toggle_assist)
	var radio: Button = UI.button("MISSION RADIO")
	buttons.add_child(radio)
	radio.pressed.connect(_radio_from_pause)
	var settings_button: Button = UI.button("SETTINGS · MUSIC / RADIO")
	buttons.add_child(settings_button)
	settings_button.pressed.connect(_settings)
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
	_finish_overlay = _modal("YOU REACHED EARTH ORBIT!", "Mission 02 complete · 120 km guided orbit\n+150 science points on first completion\nNext: Guided transfer and player-controlled Moon landing")
	var actions: VBoxContainer = _finish_overlay.get_node("Center/Panel/Buttons") as VBoxContainer
	var moon: Button = UI.button("FLY TO MOON  ·  PILOT THE LANDING", true)
	actions.add_child(moon)
	moon.pressed.connect(_moon_transfer)
	var dodge: Button = UI.button("OPTIONAL: DODGE COMETS")
	actions.add_child(dodge)
	dodge.pressed.connect(_comet_mission)
	var back: Button = UI.button("SAVE & MAIN MENU")
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
		KEY_R: _open_radio()
		KEY_ESCAPE: _toggle_pause()

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		_toggle_pause()
