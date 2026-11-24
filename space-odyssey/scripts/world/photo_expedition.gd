extends Control
## Offline 2.5D photographic expeditions: real movement, fuel, landing,
## scan alignment, repairs, saves, virtual rewards, and real NASA image layers.
## Jupiter / Saturn / Neptune are orbital flybys, NOT landable surfaces.
const Flight = preload("res://scripts/flight/photo_flight.gd")
const SaveStore = preload("res://scripts/core/save_store.gd")
const UI = preload("res://scripts/ui/space_ui.gd")
const STICK = preload("res://scripts/flight/flight_stick.gd")
const EVA_AVATAR = preload("res://assets/textures/eva-suit.webp")
const EVA_ROVER = preload("res://assets/textures/eva-rover.webp")
const LANDER_PHOTO = preload("res://assets/textures/lunar-lander.webp")
const ROCKET = preload("res://assets/textures/flight-rocket.webp")
const PLUME = preload("res://assets/textures/rocket-plume.webp")
const ORBITER = preload("res://assets/textures/orbital-craft.webp")
const PHOTO_PATHS: Dictionary = {
	"mars": "res://assets/textures/nasa-mars-jezero.jpg",
	"europa": "res://assets/textures/nasa-europa-galileo.jpg",
	"jupiter": "res://assets/textures/nasa-jupiter-juno.jpg",
	"saturn": "res://assets/textures/nasa-saturn-cassini.jpg",
	"titan": "res://assets/textures/nasa-titan-cassini.jpg",
	"neptune": "res://assets/textures/nasa-neptune-voyager.jpg",
}
const SURFACE_PATHS: Dictionary = {
	"mars": "res://assets/textures/nasa-mars-jezero.jpg",
	"europa": "res://assets/textures/europa-ice.webp",
	"titan": "res://assets/textures/titan-surface.webp",
}
const SCAN_MARKERS: Array[float] = [20.0, 51.0, 82.0]
const DESTINATIONS: Array[String] = ["mars", "europa", "jupiter", "saturn", "titan", "neptune"]
var _target: String = "mars"
var _phase: String = "launch"
var _running: bool = false
var _paused: bool = false
var _braking: bool = false
var _touch_buttons: Array[Button] = []
var _native_brake_finger: int = -1
var _pause_toggle: Button
var _flight_stick: Control
var _camera_save_timer: Timer
var _gear: bool = false
var _rover: bool = false
var _axis: Vector2 = Vector2.ZERO
var _fuel: float = 100.0
var _hull: float = 100.0
var _progress: float = 0.0
var _launch_altitude: float = 0.0
var _launch_speed: float = 0.0
var _ascent_stage: int = -1
var _touchdown_display: float = 0.0
var _altitude: float = 145.0
var _descent: float = 5.5
var _offset: float = 8.0
var _position: float = 0.0
var _timer: float = 0.0
var _checks: Array[bool] = [false, false, false]
var _flag_planted: bool = false
var _repaired: bool = false
var _focus: String = "scan"
var _scene_texture: Texture2D
var _photo: TextureRect
var _near: TextureRect
var _vehicle: TextureRect
var _parked_lander: TextureRect
var _plume: TextureRect
var _marker: Label
var _telemetry: Label
var _objective: Label
var _notice: Label
var _action: Button
var _secondary: Button
var _brake: Button
var _camera: Button
var _overlay: PanelContainer
var _menu_actions: VBoxContainer
var _menu_info: Label
var _hold_notice: float = 0.0
var _save_timer: float = 0.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_camera_save_timer = Timer.new()
	_camera_save_timer.one_shot = true
	_camera_save_timer.wait_time = 0.35
	add_child(_camera_save_timer)
	_camera_save_timer.timeout.connect(GameState.save_local)
	_target = str(GameState.destination_planet)
	if _target not in DESTINATIONS or not GameState.planet_unlocked(_target):
		_target = "mars" if GameState.planet_unlocked("mars") else "jupiter"
	if not GameState.planet_unlocked(_target):
		get_tree().call_deferred("change_scene_to_file", GameState.MENU)
		return
	GameState.destination_planet = _target
	GameState.current_mission = "photo_expedition_" + _target
	GameState.active_session = true
	GameState.has_started = true
	_make_photo()
	_make_hud()
	_restore()
	_update_backdrop()
	_apply_camera()
	_refresh()
	GameState.save_local()

func _is_surface() -> bool:
	return SURFACE_PATHS.has(_target)

func _checkpoint_path() -> String:
	return "user://gigaorbit_photo_%s_v1.json" % _target

func _make_photo() -> void:
	# Stream only the selected body's photo, rather than preloading all six.
	_scene_texture = load(str(PHOTO_PATHS[_target])) as Texture2D
	if _scene_texture == null:
		_scene_texture = preload("res://assets/textures/earth-orbit.webp")
	_photo = TextureRect.new()
	_photo.texture = Flight.LAUNCHPAD
	_photo.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_photo.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_photo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_photo)
	_near = TextureRect.new()
	_near.texture = _scene_texture
	_near.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_near.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_near.modulate = Color(1, 1, 1, 0.11)
	_near.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_near)
	_plume = TextureRect.new()
	_plume.texture = PLUME
	_plume.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_plume.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_plume.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_plume)
	_parked_lander = TextureRect.new()
	_parked_lander.texture = LANDER_PHOTO
	_parked_lander.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_parked_lander.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_parked_lander.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_parked_lander)
	_vehicle = TextureRect.new()
	_vehicle.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_vehicle.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_vehicle.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_vehicle)
	_marker = UI.label("", 21, Color("ffe49e"))
	_marker.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_marker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_marker.add_theme_color_override("font_shadow_color", Color.BLACK)
	_marker.add_theme_constant_override("shadow_offset_y", 2)
	add_child(_marker)
	resized.connect(_apply_camera)

func _apply_camera() -> void:
	if _photo == null or _near == null:
		return
	var v: Vector2 = get_viewport_rect().size
	var mode: String = str(GameState.settings.get("camera_mode", "chase"))
	var zoom: float = clampf(float(GameState.settings.get("camera_zoom", 1.0)), 0.85, 1.7)
	var factor: float = 0.90 if mode == "wide" else (1.14 if mode == "cockpit" else 1.0)
	_photo.size = v * maxf(1.08, 1.26 * zoom * factor)
	_near.size = v * maxf(1.10, 1.34 * zoom * factor)
	_vehicle.size = Vector2(v.y * 0.44, v.y * (0.51 if _phase == "launch" else 0.34)) * zoom
	_plume.size = Vector2(v.y * 0.15, v.y * 0.34) * zoom
	_parked_lander.size = Vector2(v.y * 0.36, v.y * 0.32) * zoom
	_move_background()

func _move_background() -> void:
	if _photo == null or _near == null:
		return
	var v: Vector2 = get_viewport_rect().size
	var drift: Vector2 = Vector2(-_axis.x * 13 - sin(_timer * 0.45) * 7, -_axis.y * 6)
	if _phase == "explore":
		drift.x += (_photo.size.x - v.x) * 0.38 * (1.0 - _position / 50.0)
	_photo.position = (v - _photo.size) * 0.5 + drift
	var near_shift := Vector2(drift.x * 1.1, drift.y * 2.3)
	_near.position = (v - _near.size) * 0.5 + near_shift
	if _phase == "explore" and _is_surface() and _touchdown_display <= 0.0:
		var motion: float = sin(_timer * 13.0) * absf(Flight.movement(_axis)) * (1.0 if _rover else 3.0)
		_vehicle.position = Vector2(v.x * 0.52, v.y * 0.79 + motion) - Vector2(_vehicle.size.x * 0.5, _vehicle.size.y)
	else:
		var progress: float = 1.0 - clampf(_altitude / 145.0, 0.0, 1.0)
		var height: float = lerpf(0.30, 0.64, progress) if _phase == "landing" or _touchdown_display > 0.0 else lerpf(0.54, 0.29, _progress / 100.0)
		if _phase == "launch":
			height = lerpf(0.65, 0.26, pow(clampf(_launch_altitude / 120000.0, 0.0, 1.0), 0.4))
		var horizontal: float = _offset * 2.0 if _phase == "landing" or _touchdown_display > 0.0 else _axis.x * 28.0
		_vehicle.position = Vector2(v.x * 0.49 + horizontal, v.y * height) - _vehicle.size * 0.5
	_parked_lander.position = Vector2(v.x * (0.33 - _position * 0.012), v.y * 0.63) - _parked_lander.size * 0.5
	_plume.position = _vehicle.position + Vector2((_vehicle.size.x - _plume.size.x) * 0.5, _vehicle.size.y - 4.0)
	_plume.scale.y = 0.9 + sin(_timer * 36.0) * 0.08
	var aim: float = clampf((_goal() - _position) * v.x * 0.012, -v.x * 0.27, v.x * 0.27) if _phase == "explore" else 0.0
	_marker.position = Vector2(v.x * 0.5 + aim - 150.0, v.y * (0.67 if _phase == "landing" else 0.42))
	_marker.size = Vector2(300.0, 42)

func _update_backdrop() -> void:
	if _phase == "launch":
		_update_ascent()
		return
	var background: Texture2D = Flight.ORBIT if _phase == "approach" and _progress < 30.0 else _scene_texture
	if _is_surface() and _phase in ["landing", "explore", "complete"]:
		background = load(str(SURFACE_PATHS[_target])) as Texture2D
	if _photo.texture != background:
		_near.texture = _photo.texture
		_near.modulate.a = 0.65
		_photo.texture = background
	_photo.modulate = Color.WHITE

func _update_ascent() -> void:
	var stage: int = Flight.ascent_stage(_launch_altitude)
	if _ascent_stage == stage:
		return
	_near.texture = _photo.texture
	_near.modulate.a = 0.0 if _ascent_stage < 0 else 0.78
	_ascent_stage = stage
	_photo.texture = Flight.ascent_texture(stage)
	_photo.modulate = Flight.DARK_SKY if stage == 2 else Color.WHITE
	if stage > 0:
		_notify(Flight.STAGES[stage])
		GameAudio.effect("stage")

func _goal() -> float:
	var next: int = Flight.waypoint(SCAN_MARKERS, _checks, _position)
	if next >= 0:
		return SCAN_MARKERS[next]
	return 90.0 if _target == "mars" and not _flag_planted else 0.0

func _make_hud() -> void:
	var hud: Control = Control.new()
	hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hud.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(hud)
	var panel: PanelContainer = UI.panel()
	panel.position = Vector2(12, 12)
	panel.custom_minimum_size = Vector2(210, 82)
	hud.add_child(panel)
	_telemetry = UI.label("", 16)
	panel.add_child(_telemetry)
	_objective = UI.label("", 16, UI.FG)
	_objective.anchor_left = 0.25
	_objective.anchor_right = 0.78
	_objective.offset_top = 15
	_objective.offset_bottom = 60
	_objective.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hud.add_child(_objective)
	_notice = UI.label("", 15, Color("ffdf83"))
	_notice.anchor_left = 0.25
	_notice.anchor_right = 0.78
	_notice.offset_top = 62
	_notice.offset_bottom = 104
	_notice.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hud.add_child(_notice)
	var pause: Button = _top_button(hud, "II PAUSE", 16)
	_touch_button(pause)
	_pause_toggle = pause
	pause.pressed.connect(_toggle_pause)
	_camera = _top_button(hud, "CAMERA", 73)
	_touch_button(_camera)
	_camera.pressed.connect(_cycle_camera)
	var plus: Button = _top_button(hud, "ZOOM +", 130)
	_touch_button(plus)
	plus.pressed.connect(func() -> void: _zoom(0.15))
	var minus: Button = _top_button(hud, "ZOOM -", 187)
	_touch_button(minus)
	minus.pressed.connect(func() -> void: _zoom(-0.15))
	var stick: Control = STICK.new()
	_flight_stick = stick
	stick.anchor_top = 1.0
	stick.anchor_bottom = 1.0
	stick.offset_left = 14
	stick.offset_right = 165
	stick.offset_top = -170
	stick.offset_bottom = -17
	hud.add_child(stick)
	stick.connect("axis_changed", func(v: Vector2) -> void: _axis = Vector2.ZERO if _paused else v)
	var row: HBoxContainer = HBoxContainer.new()
	row.anchor_left = 1.0
	row.anchor_right = 1.0
	row.anchor_top = 1.0
	row.anchor_bottom = 1.0
	row.offset_left = -490
	row.offset_right = -14
	row.offset_top = -73
	row.offset_bottom = -14
	row.add_theme_constant_override("separation", 8)
	hud.add_child(row)
	_brake = UI.button("BRAKE")
	_brake.custom_minimum_size.x = 108
	row.add_child(_brake)
	_touch_button(_brake)
	_brake.button_down.connect(func() -> void: _braking = true)
	_brake.button_up.connect(func() -> void: _braking = _native_brake_finger >= 0)
	_brake.mouse_exited.connect(func() -> void: _braking = _native_brake_finger >= 0)
	_secondary = UI.button("GEAR")
	_secondary.custom_minimum_size.x = 106
	row.add_child(_secondary)
	_touch_button(_secondary)
	_secondary.pressed.connect(_secondary_action)
	_action = UI.button("START >", true)
	_action.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(_action)
	_touch_button(_action)
	_action.pressed.connect(_main_action)
	_overlay = UI.panel()
	_overlay.anchor_left = 0.29
	_overlay.anchor_right = 0.71
	_overlay.anchor_top = 0.08
	_overlay.anchor_bottom = 0.92
	hud.add_child(_overlay)
	_overlay.visible = false
	var content: VBoxContainer = VBoxContainer.new()
	content.add_theme_constant_override("separation", 5)
	_overlay.add_child(content)
	_menu_info = UI.label("", 18)
	content.add_child(_menu_info)
	var scroll: ScrollContainer = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	content.add_child(scroll)
	_menu_actions = VBoxContainer.new()
	scroll.add_child(_menu_actions)

func _touch_button(button: Button) -> void:
	button.action_mode = BaseButton.ACTION_MODE_BUTTON_PRESS
	button.focus_mode = Control.FOCUS_NONE
	_touch_buttons.append(button)

func _input(event: InputEvent) -> void:
	if not is_instance_valid(_overlay):
		return
	if event is InputEventMouseButton and event.device == InputEvent.DEVICE_ID_EMULATION:
		# Native touch owns flight buttons. Keep emulation for the scrollable pause UI.
		var emulated_target: Button = Flight.touch_target(_touch_buttons, event.position)
		if emulated_target != null and (not _paused or emulated_target == _pause_toggle):
			get_viewport().set_input_as_handled()
		return
	if not event is InputEventScreenTouch:
		return
	var touch: InputEventScreenTouch = event
	if touch.index == _native_brake_finger and (not touch.pressed or touch.canceled):
		_native_brake_finger = -1
		_braking = false
		get_viewport().set_input_as_handled()
		return
	if not touch.pressed or touch.canceled:
		return
	var button: Button = Flight.touch_target(_touch_buttons, touch.position)
	if button == null or (_paused and button != _pause_toggle):
		return
	if button == _brake:
		if not _braking:
			_native_brake_finger = touch.index
			_braking = true
	else:
		button.pressed.emit()
	get_viewport().set_input_as_handled()

func _reset_flight_input() -> void:
	_native_brake_finger = -1
	_braking = false
	_axis = Vector2.ZERO
	if is_instance_valid(_flight_stick):
		_flight_stick.call("reset_touch")

func _flush_camera_settings() -> void:
	if is_instance_valid(_camera_save_timer) and not _camera_save_timer.is_stopped():
		_camera_save_timer.stop()
		GameState.save_local()

func _top_button(hud: Control, title: String, y: float) -> Button:
	var b: Button = UI.button(title)
	b.anchor_left = 1.0
	b.anchor_right = 1.0
	b.offset_left = -155
	b.offset_right = -12
	b.offset_top = y
	b.offset_bottom = y + 46
	b.custom_minimum_size = Vector2.ZERO
	b.add_theme_font_size_override("font_size", 14)
	hud.add_child(b)
	return b

func _process(delta: float) -> void:
	if _paused or _phase == "complete":
		return
	_timer += delta
	_move_background()
	_near.modulate.a = move_toward(_near.modulate.a, 0.0, delta * 1.8)
	if _touchdown_display > 0.0:
		_touchdown_display = maxf(0.0, _touchdown_display - delta)
		_refresh()
		return
	if _hold_notice > 0.0:
		_hold_notice -= delta
		if _hold_notice <= 0.0:
			_notice.text = ""
	if _phase in ["launch", "approach", "landing"] and not _running:
		return
	if _phase == "launch":
		_launch_speed = minf(1850.0, _launch_speed + delta * (81.0 - absf(_axis.x) * 12.0))
		_launch_altitude += _launch_speed * delta * 6.0
		_fuel = maxf(0.0, _fuel - delta * 0.28)
		_update_ascent()
		if _launch_altitude >= 120000.0:
			_phase = "approach"
			_notify("Earth orbit reached. Departing for %s." % _target.capitalize())
			_update_backdrop()
			_apply_camera()
			_save()
	elif _phase == "approach":
		_progress = minf(100.0, _progress + delta * (6.0 + absf(_axis.y) * 1.5))
		_fuel = maxf(0.0, _fuel - delta * 0.14)
		if _progress >= 100.0:
			_running = _is_surface()
			_gear = _running and bool(GameState.settings.get("assisted_controls", true))
			_phase = "landing" if _is_surface() else "explore"
			_notify("Approach complete. Descending." if _is_surface() else "Orbit established. Locate three scan targets.")
			_update_backdrop()
			_apply_camera()
			_save()
		elif _progress >= 30.0 and _photo.texture == Flight.ORBIT:
			_update_backdrop()
	elif _phase == "landing":
		var assisted: bool = bool(GameState.settings.get("assisted_controls", true))
		var result := Flight.landing_step(_altitude, _descent, _offset, _axis.x, _braking, assisted, delta)
		_descent = result.x
		_offset = result.y
		_altitude = maxf(0.0, _altitude - _descent * delta)
		_fuel = maxf(0.0, _fuel - delta * (0.21 if _braking else 0.10))
		if _altitude <= 0.0:
			_running = false
			if _gear and _descent <= 7.0 and absf(_offset) <= (18.0 if assisted else 10.0):
				_phase = "explore"
				_touchdown_display = 1.5
				GameAudio.effect("success")
				if _target == "mars":
					GameState.award_landing("mars", "A" if _descent < 4.0 else "B", true)
				_notify("Touchdown on %s. Collect samples and return." % _target.capitalize())
				_save()
			else:
				GameAudio.effect("impact")
				_hull = maxf(30.0, _hull - 18.0)
				_altitude = 145.0
				_descent = 5.5
				_offset = 8.0
				_gear = assisted
				_save()
				_notify("Unsafe landing. Free retry; use a repair kit to restore hull.")
	elif _phase == "explore":
		var speed: float = 21.0 if _rover and _is_surface() else 11.0
		_position = clampf(_position + Flight.movement(_axis) * speed * delta, 0.0, 100.0)
	if _running and _fuel <= 0.0:
		_running = false
		GameAudio.effect("warning")
		_notify("Out of propellant. Open Pause > Fuel and Repairs.")
		_save()
	_refresh()
	_save_timer += delta
	if _save_timer >= 5.0:
		_save_timer = 0.0
		_save()

func _main_action() -> void:
	if _paused or _touchdown_display > 0.0:
		return
	if _phase in ["launch", "approach", "landing"]:
		if _fuel < 0.1:
			_notify("Out of propellant. Open Pause > Fuel and Repairs.")
			return
		_running = not _running
		if _running:
			GameAudio.effect("launch")
	elif _phase == "explore":
		_interact()
	else:
		_to_menu()
	_refresh()

func _secondary_action() -> void:
	if _paused or _touchdown_display > 0.0:
		return
	if _phase == "landing":
		_gear = true
		GameAudio.effect("stage")
		_notify("Landing gear deployed.")
	elif _phase == "explore" and _is_surface():
		_rover = not _rover
		GameAudio.effect("stage")
		_notify("Rover mode." if _rover else "Astronaut walk mode.")
	elif _phase == "approach":
		_notify("Use joystick steering to maintain trajectory.")
	_refresh()

func _interact() -> void:
	var i: int = -1
	for index in range(3):
		if not _checks[index] and absf(_position - SCAN_MARKERS[index]) <= 9.0:
			i = index
			break
	if i >= 0:
		_checks[i] = true
		GameAudio.effect("scan")
		_notify("Scientific scan %d/3 captured and logged offline." % _count_checks())
	elif _target == "mars" and not _flag_planted and absf(_position - 90.0) <= 8.0:
		_flag_planted = true
		_notify("Ghana mission flag planted at the designated Mars marker.")
	elif _count_checks() == 3 and _position <= 9.0 and (_target != "mars" or _flag_planted):
		_complete()
	else:
		_notify("Follow the arrow to the active waypoint.")
	_save()

func _count_checks() -> int:
	var n: int = 0
	for item in _checks:
		if item:
			n += 1
	return n

func _complete() -> void:
	_phase = "complete"
	_running = false
	var key: String = "Photo Explorer: " + _target.capitalize()
	if key not in GameState.badges:
		GameState.badges.append(key)
		GameState.science_points += 160 if _is_surface() else 110
		GameState.coins += 220 if _is_surface() else 130
	GameState.completed_planets[_target] = true
	GameState.save_local()
	GameState.progress_changed.emit()
	GameAudio.effect("success")
	_notify("Expedition complete! Coins, science and badge saved.")
	var file_path: String = _checkpoint_path()
	if FileAccess.file_exists(file_path):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(file_path))

func _refresh() -> void:
	if _telemetry == null:
		return
	var walking: bool = _phase == "explore" and _is_surface() and _touchdown_display <= 0.0
	var cockpit: bool = str(GameState.settings.get("camera_mode", "chase")) == "cockpit"
	_vehicle.visible = _phase in ["launch", "landing"] or _touchdown_display > 0.0 or walking or (_phase != "complete" and not cockpit)
	if walking:
		_vehicle.texture = EVA_ROVER if _rover else EVA_AVATAR
	else:
		if _phase == "launch":
			_vehicle.texture = ROCKET
		else:
			_vehicle.texture = LANDER_PHOTO if _phase == "landing" or _touchdown_display > 0.0 else ORBITER
	_plume.visible = _phase == "launch" and _running and not _paused
	_parked_lander.visible = walking
	_marker.visible = _phase == "landing" or (_phase == "explore" and _touchdown_display <= 0.0)
	_action.disabled = _touchdown_display > 0.0
	var title: String = _target.to_upper()
	var flight: String = "EXPEDITION" if _is_surface() else "ORBITAL FLYBY"
	_telemetry.text = "%s · %s\nFUEL %d%%  HULL %d%%\nCOINS %d" % [title, flight, int(_fuel), int(_hull), GameState.coins]
	if bool(GameState.settings.get("debug_overlay", false)):
		_telemetry.text += "\nFPS %d / target %d" % [Engine.get_frames_per_second(), Engine.max_fps]
	_camera.text = "CAM: %s" % str(GameState.settings.get("camera_mode", "chase")).to_upper()
	_brake.visible = _phase == "landing"
	_secondary.visible = _phase == "landing" or walking
	_secondary.disabled = _phase == "landing" and _gear
	if _phase == "launch":
		_objective.text = "%s · ALT %d m" % [Flight.STAGES[clampi(_ascent_stage, 0, 3)], int(_launch_altitude)]
		_action.text = "PAUSE FLIGHT" if _running else ("IGNITE ▶" if _launch_altitude < 1.0 else "RESUME FLIGHT ▶")
	elif _phase == "approach":
		_objective.text = "IN TRANSIT TO %s · %d%%" % [title, int(_progress)]
		_action.text = "PAUSE FLIGHT" if _running else "RESUME TRANSFER"
	elif _phase == "landing":
		_objective.text = "LAND %d m · %.1f m/s · X %d m" % [int(_altitude), _descent, int(_offset)]
		_secondary.text = "GEAR ✓" if _gear else "GEAR"
		_action.text = "PAUSE DESCENT" if _running else "RESUME DESCENT"
		_marker.text = "◎  LANDING ZONE"
	elif _phase == "explore":
		var goal: float = _goal()
		var caption: String = "SAMPLE" if _is_surface() else "SCAN TARGET"
		if goal == 0.0:
			caption = "LANDER" if _is_surface() else "RETURN POINT"
		elif goal == 90.0:
			caption = "FLAG SITE"
		_marker.text = Flight.marker_text(caption, goal, _position, 8.0 if goal == 90.0 else 9.0)
		_objective.text = "TOUCHDOWN CONFIRMED" if _touchdown_display > 0.0 else "%s · SCIENCE %d/3" % [_marker.text, _count_checks()]
		_secondary.text = "WALK" if _rover else "ROVER"
		_action.text = "COMPLETE MISSION" if goal == 0.0 else ("PLANT FLAG" if goal == 90.0 else ("COLLECT SAMPLE" if _is_surface() else "SCAN TARGET"))
	elif _phase == "complete":
		_objective.text = "%s EXPEDITION COMPLETE · BADGE EARNED" % title
		_action.text = "MISSION MENU"

func _notify(message: String) -> void:
	_notice.text = message
	_hold_notice = 5.0

func _cycle_camera() -> void:
	if _paused:
		return
	var modes: Array[String] = ["chase", "cockpit", "external", "wide"]
	var idx: int = modes.find(str(GameState.settings.get("camera_mode", "chase")))
	GameState.settings["camera_mode"] = modes[(idx + 1) % modes.size()]
	_camera_save_timer.start()
	_apply_camera()
	_refresh()

func _zoom(amount: float) -> void:
	if _paused:
		return
	GameState.settings["camera_zoom"] = clampf(float(GameState.settings.get("camera_zoom", 1.0)) + amount, 0.85, 1.7)
	_camera_save_timer.start()
	_apply_camera()

func _toggle_pause() -> void:
	_paused = not _paused
	_reset_flight_input()
	_flush_camera_settings()
	_overlay.visible = _paused
	_refresh()
	if _paused:
		_save()
		_update_menu()

func _update_menu() -> void:
	for b in _menu_actions.get_children():
		_menu_actions.remove_child(b)
		b.queue_free()
	_menu_info.text = "%s · OFFLINE SAVE\nFuel %d%%  Hull %d%%\nCoins %d  Repair Kits %d" % [
		_target.capitalize(), int(_fuel), int(_hull), GameState.coins, int(GameState.supplies.get("repair_kit", 0))]
	_option("RESUME", _toggle_pause)
	_option("REFILL FUEL CELL (+35)", _refuel)
	_option("REPAIR HULL (+35)", _repair)
	_option("BUY FUEL CELL (80 COINS)", func() -> void: _buy("fuel_cell"))
	_option("BUY REPAIR KIT (100 COINS)", func() -> void: _buy("repair_kit"))
	_option("SAVE & MISSION MENU", _to_menu)

func _option(title: String, callback: Callable) -> void:
	var b: Button = UI.button(title)
	b.focus_mode = Control.FOCUS_NONE
	b.custom_minimum_size.y = 48
	_menu_actions.add_child(b)
	b.pressed.connect(callback)

func _buy(kind: String) -> void:
	_notify("Supplies purchased with virtual coins." if GameState.buy_supply(kind) else "Not enough coins or inventory full.")
	_update_menu()

func _refuel() -> void:
	if _fuel < 99.0 and GameState.use_supply("fuel_cell"):
		_fuel = minf(100.0, _fuel + 35.0)
		_notify("Fuel cell fitted: +35%.")
		_save()
	else:
		_notify("No fuel cell in inventory or tank already full.")
	_update_menu()

func _repair() -> void:
	if _hull < 99.0 and GameState.use_supply("repair_kit"):
		_hull = minf(100.0, _hull + 35.0)
		_repaired = true
		_notify("Spacecraft repairs completed: +35% hull.")
		_save()
	else:
		_notify("No repair kit in inventory or hull already full.")
	_update_menu()

func _save() -> void:
	if _phase == "complete":
		GameState.save_local()
		return
	var data: Dictionary = {
		"version": 1, "phase": _phase, "running": _running, "fuel": _fuel,
		"launch_altitude": _launch_altitude, "launch_speed": _launch_speed,
		"hull": _hull, "progress": _progress, "altitude": _altitude,
		"descent": _descent, "offset": _offset, "position": _position,
		"checks": _checks.duplicate(), "gear": _gear, "rover": _rover,
		"flag": _flag_planted, "repaired": _repaired,
	}
	SaveStore.write_checkpoint(_checkpoint_path(), data)
	GameState.save_local()

func _restore() -> void:
	if not FileAccess.file_exists(_checkpoint_path()):
		return
	var file: FileAccess = FileAccess.open(_checkpoint_path(), FileAccess.READ)
	if file == null:
		return
	var data: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	if not data is Dictionary or int(data.get("version", 0)) != 1:
		return
	_phase = str(data.get("phase", "approach"))
	if _phase not in ["launch", "approach", "landing", "explore"]:
		_phase = "launch"
	_launch_altitude = clampf(float(data.get("launch_altitude", 0.0)), 0.0, 120000.0)
	_launch_speed = clampf(float(data.get("launch_speed", 0.0)), 0.0, 1850.0)
	_running = false
	_fuel = clampf(float(data.get("fuel", 100.0)), 0.0, 100.0)
	_hull = clampf(float(data.get("hull", 100.0)), 30.0, 100.0)
	_progress = clampf(float(data.get("progress", 0.0)), 0.0, 100.0)
	_altitude = clampf(float(data.get("altitude", 145.0)), 0.0, 145.0)
	_descent = clampf(float(data.get("descent", 5.5)), 0.4, 14.0)
	_offset = clampf(float(data.get("offset", 8.0)), -40.0, 40.0)
	_position = clampf(float(data.get("position", 0.0)), 0.0, 100.0)
	_gear = bool(data.get("gear", false)) or (_phase == "landing" and bool(GameState.settings.get("assisted_controls", true)))
	_rover = bool(data.get("rover", false))
	_flag_planted = bool(data.get("flag", false))
	_repaired = bool(data.get("repaired", false))
	var checks: Variant = data.get("checks", [])
	if checks is Array and checks.size() == 3:
		for i in range(3):
			_checks[i] = bool(checks[i])

func _to_menu() -> void:
	_flush_camera_settings()
	_save()
	get_tree().change_scene_to_file("res://scenes/ui/missions_screen.tscn")

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		if not _paused:
			_toggle_pause()
	if what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_APPLICATION_FOCUS_OUT:
		_reset_flight_input()
		_flush_camera_settings()
		if is_instance_valid(_flight_stick):
			_save()
