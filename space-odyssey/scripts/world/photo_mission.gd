extends Control
## GigaOrbit photograph-led 2.5D Earth-to-Moon mission.
## Real touch controls, simulated flight, checkpoints, EVA and GameState economy.
## Source photographs are bundled locally; camera motion comes from parallax and scale.
const Flight = preload("res://scripts/flight/photo_flight.gd")
const SaveStore = preload("res://scripts/core/save_store.gd")
const UI = preload("res://scripts/ui/space_ui.gd")
const FLIGHT_STICK = preload("res://scripts/flight/flight_stick.gd")
const LAUNCH_PHOTO = Flight.LAUNCHPAD
const ORBIT_PHOTO = preload("res://assets/textures/earth-orbit.webp")
const LUNAR_PHOTO = preload("res://assets/textures/moon-surface.webp")
const ROCKET_SPRITE = preload("res://assets/textures/flight-rocket.webp")
const ROCKET_PLUME = preload("res://assets/textures/rocket-plume.webp")
const MOON_DISC = preload("res://assets/textures/moon-disc.webp")
const ORBITER = preload("res://assets/textures/orbital-craft.webp")
const EVA_AVATAR = preload("res://assets/textures/eva-suit.webp")
const EVA_ROVER = preload("res://assets/textures/eva-rover.webp")
const EVA_ANTENNA = preload("res://assets/textures/eva-antenna.webp")
const LANDER_PHOTO = preload("res://assets/textures/lunar-lander.webp")
const CHECKPOINT_PATH: String = "user://gigaorbit_photo_checkpoint_v1.json"
const STAGES: Array[String] = ["launch", "transfer", "landing", "explore", "complete"]
const SAMPLES: Array[float] = [22.0, 48.0, 76.0]
const CAMERA_MODES: Array[String] = ["chase", "cockpit", "external", "wide"]
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
var _steer: Vector2 = Vector2.ZERO
var _throttle: float = 0.80
var _fuel: float = 100.0
var _hull: float = 100.0
var _altitude: float = 0.0
var _speed: float = 0.0
var _distance: float = 0.0
var _descent: float = 5.8
var _offset: float = 12.0
var _eva_x: float = 0.0
var _samples: Array[bool] = [false, false, false]
var _eva_mission: String = "samples"
var _flag_planted: bool = false
var _comm_repaired: bool = false
var _pause_page: String = "main"
var _timer: float = 0.0
var _last_saved: float = 0.0
var _ascent_stage: int = -1
var _touchdown_display: float = 0.0
var _notice_timer: float = 0.0
var _parallax: TextureRect
var _near_layer: TextureRect
var _photo_ship: TextureRect
var _plume: TextureRect
var _destination: TextureRect
var _avatar: TextureRect
var _antenna: TextureRect
var _lander: TextureRect
var _marker: Label
var _hud: Label
var _objective: Label
var _notice: Label
var _action: Button
var _secondary: Button
var _brake_button: Button
var _camera_button: Button
var _zoom_in_button: Button
var _zoom_out_button: Button
var _pause_dialog: PanelContainer
var _panel_text: Label
var _pause_actions: VBoxContainer
var _control_root: Control

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_camera_save_timer = Timer.new()
	_camera_save_timer.one_shot = true
	_camera_save_timer.wait_time = 0.35
	add_child(_camera_save_timer)
	_camera_save_timer.timeout.connect(GameState.save_local)
	_build_photo()
	_build_interface()
	if GameState.current_mission == "photo_fresh_launch":
		_save_checkpoint()
	else:
		_restore_checkpoint()
	# Explicitly selected Moon transfer uses 2.5D photography, never the
	# legacy transfer scene's blue/white mesh spheres.
	if GameState.current_mission == "photo_transfer_moon":
		_phase = "transfer"
		_running = false
		_distance = 0.0
		_fuel = 100.0
		_throttle = 0.80
		_altitude = 0.0
	# Returning to lunar EVA from Mission Control skips the completed flight,
	# but only after a genuinely successful Moon landing.
	if GameState.current_mission == "eva_moon" and bool(GameState.completed_planets.get("moon", false)):
		_phase = "explore"
		_running = false
		_eva_x = 0.0
	_refresh_photo()
	_refresh_interface()
	GameState.current_mission = "photo_earth_moon"
	GameState.active_session = true
	GameState.has_started = true
	GameState.save_local()

func _build_photo() -> void:
	_parallax = TextureRect.new()
	_parallax.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_parallax.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_parallax.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	add_child(_parallax)
	_near_layer = TextureRect.new()
	_near_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_near_layer.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_near_layer.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_near_layer.modulate = Color(1, 1, 1, 0.10)
	add_child(_near_layer)
	_destination = _foreground(MOON_DISC)
	_plume = _foreground(ROCKET_PLUME)
	_photo_ship = _foreground(ROCKET_SPRITE)
	_lander = _foreground(LANDER_PHOTO)
	_antenna = _foreground(EVA_ANTENNA)
	_avatar = _foreground(EVA_AVATAR)
	_marker = Label.new()
	_marker.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_marker.text = "◎  SAFE LANDING ZONE"
	_marker.add_theme_color_override("font_color", Color("f3cf72"))
	_marker.add_theme_font_size_override("font_size", 22)
	_marker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_marker.add_theme_color_override("font_shadow_color", Color.BLACK)
	_marker.add_theme_constant_override("shadow_offset_y", 2)
	add_child(_marker)
	_marker.visible = false
	resized.connect(_fit_photo)
	_fit_photo()

func _foreground(texture: Texture2D) -> TextureRect:
	var layer := TextureRect.new()
	layer.texture = texture
	layer.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	layer.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.hide()
	add_child(layer)
	return layer

func _fit_photo() -> void:
	if _parallax == null:
		return
	var view_size: Vector2 = get_viewport_rect().size
	var zoom: float = clampf(float(GameState.settings.get("camera_zoom", 1.0)), 0.85, 1.7)
	var mode: String = str(GameState.settings.get("camera_mode", "chase"))
	if mode == "wide":
		zoom *= 0.90
	elif mode == "cockpit":
		zoom *= 1.12
	_parallax.size = view_size * maxf(1.08, 1.30 * zoom)
	_near_layer.size = view_size * maxf(1.10, 1.38 * zoom)
	_photo_ship.size = Vector2(view_size.y * 0.46, view_size.y * 0.52) * zoom
	_photo_ship.pivot_offset = _photo_ship.size * 0.5
	_plume.size = Vector2(view_size.y * 0.15, view_size.y * 0.37) * zoom
	_photo_ship.visible = _phase == "launch" or (_phase == "transfer" and mode != "cockpit")
	_lander.visible = _phase in ["landing", "explore"]
	_destination.visible = _phase == "transfer"
	_lander.size = Vector2(view_size.y * 0.42, view_size.y * 0.38) * zoom
	_avatar.size = Vector2(view_size.y * 0.44, view_size.y * 0.34) * zoom
	_antenna.size = Vector2(view_size.y * 0.30, view_size.y * 0.28) * zoom
	_plume.visible = _phase == "launch" and _running and _photo_ship.visible and not _paused
	_update_eva_art()
	_move_photo()

func _move_photo() -> void:
	if _parallax == null:
		return
	var v: Vector2 = get_viewport_rect().size
	var drift: Vector2 = Vector2(-_steer.x * 14.0, -_steer.y * 7.0)
	var forward: float = sin(_timer * 0.23) * 5.0
	# The user moves through the lunar scene, not merely a counter increasing
	# against a completely frozen photograph. Restrict pans to the source image.
	var travel_ratio: float = clampf(_eva_x / 100.0, 0.0, 1.0)
	var far_pan: float = (_parallax.size.x - v.x) * 0.43 * (1.0 - 2.0 * travel_ratio) if _phase == "explore" else 0.0
	var near_pan: float = (_near_layer.size.x - v.x) * 0.43 * (1.0 - 2.0 * travel_ratio) if _phase == "explore" else 0.0
	_parallax.position = -( _parallax.size - v ) * 0.5 + drift + Vector2(forward + far_pan, 0)
	_near_layer.position = -(_near_layer.size - v) * 0.5 + drift * 2.2 + Vector2(-forward * 1.2 + near_pan * 0.65, 0)
	var mode: String = str(GameState.settings.get("camera_mode", "chase"))
	var ship_x: float = 0.49 if mode != "external" else 0.68
	var ascent: float = pow(clampf(_altitude / 120000.0, 0.0, 1.0), 0.4)
	var ship_y: float = lerpf(0.65, 0.26, ascent) if _phase == "launch" else lerpf(0.58, 0.28, _distance / 100.0)
	_photo_ship.rotation = _steer.x * (0.06 if _phase == "launch" else 0.12)
	_photo_ship.position = Vector2(v.x * ship_x, v.y * ship_y) - _photo_ship.size * 0.5 + Vector2(_steer.x * 28, 0)
	var apparent_size: float = v.y * lerpf(0.08, 0.63, _distance / 100.0)
	_destination.size = Vector2(apparent_size, apparent_size)
	_destination.position = Vector2(v.x * 0.70, v.y * 0.43) - _destination.size * 0.5 - _steer * 28.0
	var engine_position: Vector2 = Vector2(0.0, _photo_ship.size.y * 0.49).rotated(_photo_ship.rotation)
	var engine_flicker: float = sin(_timer * 37.0) * 0.07
	_plume.position = _photo_ship.position + _photo_ship.pivot_offset + engine_position - Vector2(_plume.size.x * 0.5, 4.0)
	_plume.pivot_offset = Vector2(_plume.size.x * 0.5, 0.0)
	_plume.rotation = _photo_ship.rotation
	_plume.scale.y = 0.85 + _throttle * 0.18 + engine_flicker
	var descent_progress: float = 1.0 - clampf(_altitude / 160.0, 0.0, 1.0)
	var lander_x: float = ship_x if _phase == "landing" or _touchdown_display > 0.0 else 0.31 - _eva_x * 0.012
	var lander_y: float = lerpf(0.30, 0.63, descent_progress) if _phase == "landing" or _touchdown_display > 0.0 else 0.68
	_lander.position = Vector2(v.x * lander_x + _offset * 2.0, v.y * lander_y) - _lander.size * 0.5
	var motion: float = sin(_timer * 13.0) * absf(Flight.movement(_steer)) * (1.0 if _rover else 3.0)
	_avatar.position = Vector2(v.x * 0.52, v.y * 0.79 + motion) - Vector2(_avatar.size.x * 0.5, _avatar.size.y)
	var antenna_offset: float = (52.0 - _eva_x) * v.x * 0.018
	_antenna.position = Vector2(v.x * 0.53 + antenna_offset, v.y * 0.76) - Vector2(_antenna.size.x * 0.5, _antenna.size.y)
	var marker_x: float = v.x * 0.5
	var marker_y: float = v.y * 0.70
	if _phase == "explore":
		marker_x = v.x * 0.5 + clampf((_eva_goal() - _eva_x) * v.x * 0.012, -v.x * 0.28, v.x * 0.28)
		marker_y = v.y * 0.44
	_marker.position = Vector2(marker_x - 150.0, marker_y)
	_marker.size = Vector2(300.0, 40)

func _refresh_photo() -> void:
	match _phase:
		"launch":
			_ascent_stage = -1
			_parallax.texture = LAUNCH_PHOTO
			_update_ascent()
			_photo_ship.texture = ROCKET_SPRITE
			_marker.visible = false
		"transfer":
			_parallax.texture = ORBIT_PHOTO
			_near_layer.texture = ORBIT_PHOTO
			_photo_ship.texture = ORBITER
			_marker.visible = false
		"landing":
			_parallax.texture = LUNAR_PHOTO
			_near_layer.texture = LUNAR_PHOTO
			_marker.visible = true
		"explore", "complete":
			_parallax.texture = LUNAR_PHOTO
			_near_layer.texture = LUNAR_PHOTO
			_photo_ship.visible = false
			_marker.visible = _phase == "explore" and _touchdown_display <= 0.0
	if _phase != "launch":
		_parallax.modulate = Color.WHITE
		_near_layer.modulate.a = 0.10
	_fit_photo()

func _update_ascent() -> void:
	var stage: int = Flight.ascent_stage(_altitude)
	if _ascent_stage == stage:
		return
	_near_layer.texture = _parallax.texture
	_near_layer.modulate = Color(1, 1, 1, 0.78 if _ascent_stage >= 0 else 0.0)
	_ascent_stage = stage
	_parallax.texture = Flight.ascent_texture(stage)
	_parallax.modulate = Flight.DARK_SKY if stage == 2 else Color.WHITE
	if stage > 0:
		_notice_message(Flight.STAGES[stage])
		GameAudio.effect("stage")

func _eva_goal() -> float:
	match _eva_mission:
		"repair": return 0.0 if _comm_repaired else 52.0
		"flag": return 0.0 if _flag_planted else 84.0
	var next: int = Flight.waypoint(SAMPLES, _samples, _eva_x)
	return SAMPLES[next] if next >= 0 else 0.0

func _eva_caption(goal: float) -> String:
	if goal == 0.0:
		return "LANDER"
	if _eva_mission == "repair":
		return "REPAIR ANTENNA"
	if _eva_mission == "flag":
		return "FLAG SITE"
	return "SAMPLE %d" % (SAMPLES.find(goal) + 1)

func _update_eva_art() -> void:
	_avatar.visible = _phase == "explore" and _touchdown_display <= 0.0
	_avatar.texture = EVA_ROVER if _rover else EVA_AVATAR
	_antenna.visible = _phase == "explore" and _eva_mission == "repair"
	_antenna.modulate = Color.WHITE if _comm_repaired else Color(0.8, 0.8, 0.8)

func _build_interface() -> void:
	_control_root = Control.new()
	_control_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_control_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_control_root)
	var metrics: PanelContainer = UI.panel()
	metrics.position = Vector2(14, 12)
	metrics.custom_minimum_size = Vector2(230, 95)
	_control_root.add_child(metrics)
	var stack: VBoxContainer = VBoxContainer.new()
	metrics.add_child(stack)
	_hud = UI.label("", 17)
	stack.add_child(_hud)
	_objective = UI.label("", 17, Color("e5efff"))
	_objective.anchor_left = 0.29
	_objective.anchor_right = 0.78
	_objective.offset_top = 15
	_objective.offset_bottom = 75
	_objective.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_control_root.add_child(_objective)
	_notice = UI.label("", 15, Color("ffe49e"))
	_notice.anchor_left = 0.33
	_notice.anchor_right = 0.73
	_notice.offset_top = 70
	_notice.offset_bottom = 105
	_notice.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_control_root.add_child(_notice)
	var pause: Button = UI.button("Ⅱ  PAUSE")
	pause.anchor_left = 1.0
	pause.anchor_right = 1.0
	pause.offset_left = -152
	pause.offset_right = -16
	pause.offset_top = 15
	pause.offset_bottom = 65
	pause.custom_minimum_size = Vector2.ZERO
	_control_root.add_child(pause)
	_touch_button(pause)
	_pause_toggle = pause
	pause.pressed.connect(_toggle_pause)
	# Compact camera/zoom controls are anchored to the right edge and never
	# overlap the bottom joystick or the principal flight action buttons.
	_camera_button = UI.button("CAM: CHASE")
	_camera_button.anchor_left = 1.0
	_camera_button.anchor_right = 1.0
	_camera_button.offset_left = -152
	_camera_button.offset_right = -16
	_camera_button.offset_top = 77
	_camera_button.offset_bottom = 121
	_camera_button.custom_minimum_size = Vector2.ZERO
	_camera_button.add_theme_font_size_override("font_size", 14)
	_control_root.add_child(_camera_button)
	_touch_button(_camera_button)
	_camera_button.pressed.connect(_cycle_camera)
	_zoom_in_button = UI.button("ZOOM +")
	_zoom_in_button.anchor_left = 1.0
	_zoom_in_button.anchor_right = 1.0
	_zoom_in_button.offset_left = -152
	_zoom_in_button.offset_right = -16
	_zoom_in_button.offset_top = 128
	_zoom_in_button.offset_bottom = 172
	_zoom_in_button.custom_minimum_size = Vector2.ZERO
	_control_root.add_child(_zoom_in_button)
	_touch_button(_zoom_in_button)
	_zoom_in_button.pressed.connect(func() -> void: _change_zoom(0.15))
	_zoom_out_button = UI.button("ZOOM -")
	_zoom_out_button.anchor_left = 1.0
	_zoom_out_button.anchor_right = 1.0
	_zoom_out_button.offset_left = -152
	_zoom_out_button.offset_right = -16
	_zoom_out_button.offset_top = 179
	_zoom_out_button.offset_bottom = 223
	_zoom_out_button.custom_minimum_size = Vector2.ZERO
	_control_root.add_child(_zoom_out_button)
	_touch_button(_zoom_out_button)
	_zoom_out_button.pressed.connect(func() -> void: _change_zoom(-0.15))
	var stick: Control = FLIGHT_STICK.new()
	_flight_stick = stick
	stick.anchor_top = 1.0
	stick.anchor_bottom = 1.0
	stick.offset_left = 18
	stick.offset_right = 171
	stick.offset_top = -169
	stick.offset_bottom = -16
	_control_root.add_child(stick)
	stick.connect("axis_changed", func(v: Vector2) -> void: _steer = Vector2.ZERO if _paused else v)
	var controls: HBoxContainer = HBoxContainer.new()
	controls.anchor_left = 1.0
	controls.anchor_right = 1.0
	controls.anchor_top = 1.0
	controls.anchor_bottom = 1.0
	controls.offset_left = -620
	controls.offset_right = -18
	controls.offset_top = -85
	controls.offset_bottom = -15
	controls.add_theme_constant_override("separation", 8)
	_control_root.add_child(controls)
	_brake_button = UI.button("BRAKE")
	_brake_button.custom_minimum_size.x = 112
	controls.add_child(_brake_button)
	_touch_button(_brake_button)
	_brake_button.button_down.connect(func() -> void: _braking = true)
	_brake_button.button_up.connect(func() -> void: _braking = _native_brake_finger >= 0)
	_brake_button.mouse_exited.connect(func() -> void: _braking = _native_brake_finger >= 0)
	_secondary = UI.button("THRUST +")
	_secondary.custom_minimum_size.x = 140
	controls.add_child(_secondary)
	_touch_button(_secondary)
	_secondary.pressed.connect(_secondary_action)
	_action = UI.button("IGNITE ▶", true)
	_action.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	controls.add_child(_action)
	_touch_button(_action)
	_action.pressed.connect(_main_action)
	_pause_dialog = UI.panel()
	_pause_dialog.anchor_left = 0.27
	_pause_dialog.anchor_right = 0.73
	_pause_dialog.anchor_top = 0.18
	_pause_dialog.anchor_bottom = 0.82
	_control_root.add_child(_pause_dialog)
	_pause_dialog.visible = false
	var pause_stack: VBoxContainer = VBoxContainer.new()
	pause_stack.add_theme_constant_override("separation", 10)
	_pause_dialog.add_child(pause_stack)
	_panel_text = UI.label("", 20)
	pause_stack.add_child(_panel_text)
	_pause_actions = VBoxContainer.new()
	_pause_actions.add_theme_constant_override("separation", 6)
	pause_stack.add_child(_pause_actions)

func _touch_button(button: Button) -> void:
	# Gameplay actions respond on touch-down instead of waiting for release.
	# Keep scrollable menu buttons on their standard release behavior.
	button.action_mode = BaseButton.ACTION_MODE_BUTTON_PRESS
	button.focus_mode = Control.FOCUS_NONE
	_touch_buttons.append(button)

func _input(event: InputEvent) -> void:
	if not is_instance_valid(_pause_dialog):
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
	if button == _brake_button:
		if not _braking:
			_native_brake_finger = touch.index
			_braking = true
	else:
		button.pressed.emit()
	get_viewport().set_input_as_handled()

func _reset_flight_input() -> void:
	_native_brake_finger = -1
	_braking = false
	_steer = Vector2.ZERO
	if is_instance_valid(_flight_stick):
		_flight_stick.call("reset_touch")

func _flush_camera_settings() -> void:
	if is_instance_valid(_camera_save_timer) and not _camera_save_timer.is_stopped():
		_camera_save_timer.stop()
		GameState.save_local()

func _cycle_camera() -> void:
	if _paused:
		return
	var current: String = str(GameState.settings.get("camera_mode", "chase"))
	var index: int = CAMERA_MODES.find(current)
	var next: String = CAMERA_MODES[(index + 1) % CAMERA_MODES.size()]
	GameState.settings["camera_mode"] = next
	_camera_save_timer.start()
	_refresh_photo()
	_refresh_interface()
	_notice_message("Camera: %s view (photographic 2.5D)" % next.capitalize())

func _change_zoom(amount: float) -> void:
	if _paused:
		return
	GameState.settings["camera_zoom"] = clampf(float(GameState.settings.get("camera_zoom", 1.0)) + amount, 0.85, 1.7)
	_camera_save_timer.start()
	_fit_photo()
	_refresh_interface()
	_notice_message("Zoom: %d%%" % roundi(float(GameState.settings["camera_zoom"]) * 100.0))

func _physics_process(delta: float) -> void:
	if _paused or _phase == "complete":
		return
	_timer += delta
	_move_photo()
	if _phase == "launch":
		_near_layer.modulate.a = move_toward(_near_layer.modulate.a, 0.0, delta * 1.8)
	if _touchdown_display > 0.0:
		_touchdown_display = maxf(0.0, _touchdown_display - delta)
		_refresh_interface()
		return
	if _notice_timer > 0.0:
		_notice_timer -= delta
		if _notice_timer <= 0.0:
			_notice.text = ""
	# EVA walking and rover controls remain active after touchdown, even while
	# rocket engines are off. The old guard unintentionally froze exploration.
	if not _running and _phase != "explore":
		return
	match _phase:
		"launch":
			var acceleration: float = _throttle * 92.0 + (13.0 if bool(GameState.settings.get("assisted_controls", true)) else 0.0) - 10.5
			_speed = clampf(_speed + acceleration * delta, 0.0, 1850.0)
			_altitude += _speed * delta * 6.0
			_update_ascent()
			_fuel = maxf(0.0, _fuel - delta * (_throttle * 0.34 + 0.02))
			if _altitude >= 120000.0:
				_complete_orbit()
		"transfer":
			var direction_penalty: float = clampf(1.0 - absf(_steer.x) * 0.18, 0.65, 1.0)
			_distance = minf(100.0, _distance + delta * (6.0 + _throttle * 1.6) * direction_penalty)
			_fuel = maxf(0.0, _fuel - delta * (_throttle * 0.08 + 0.01))
			if _distance >= 100.0:
				_enter_landing()
		"landing":
			var assisted: bool = bool(GameState.settings.get("assisted_controls", true))
			var result := Flight.landing_step(_altitude, _descent, _offset, _steer.x, _braking, assisted, delta)
			_descent = result.x
			_offset = result.y
			_altitude = maxf(0.0, _altitude - _descent * delta)
			_fuel = maxf(0.0, _fuel - delta * (_throttle * 0.16 + (0.3 if _braking else 0.0)))
			if _altitude <= 0.0:
				if _gear and _descent <= 7.0 and absf(_offset) <= (18.0 if assisted else 10.0):
					_finish_landing()
				else:
					_fail_landing()
		"explore":
			var move_speed: float = 21.0 if _rover else 11.0
			_eva_x = clampf(_eva_x + Flight.movement(_steer) * move_speed * delta, 0.0, 100.0)
	if _running and _fuel <= 0.0:
		_running = false
		GameAudio.effect("warning")
		_notice_message("Out of propellant. Open Pause > Supplies.")
		_save_checkpoint()
	_refresh_interface()
	_last_saved += delta
	if _last_saved >= 5.0:
		_last_saved = 0.0
		_save_checkpoint()

func _complete_orbit() -> void:
	if GameState.flight_step < 3:
		for step in range(GameState.flight_step + 1, 4):
			GameState.record_flight_step(step)
	_phase = "transfer"
	_running = true
	_fuel = maxf(20.0, _fuel)
	_notice_message("Earth orbit reached. Trans-lunar flight underway.")
	_refresh_photo()
	_save_checkpoint()

func _enter_landing() -> void:
	_phase = "landing"
	_running = true
	_gear = bool(GameState.settings.get("assisted_controls", true))
	_altitude = 160.0
	_descent = 5.8
	_throttle = 0.43
	_offset = 12.0
	_notice_message("Moon approach. Descent underway.")
	_refresh_photo()
	_save_checkpoint()

func _finish_landing() -> void:
	_running = false
	_phase = "explore"
	_touchdown_display = 1.5
	GameState.award_landing("moon", "A" if _descent < 4.0 else "B", true)
	GameAudio.effect("success")
	_notice_message("Touchdown! First landing awards coins + science.")
	_refresh_photo()
	_save_checkpoint()

func _fail_landing() -> void:
	_running = false
	_hull = maxf(30.0, _hull - 25.0)
	GameAudio.effect("impact")
	_altitude = 160.0
	_descent = 5.8
	_offset = 12.0
	_gear = bool(GameState.settings.get("assisted_controls", true))
	_notice_message("Unsafe landing. Retry free; repairs use a repair kit.")
	_save_checkpoint()

func _main_action() -> void:
	if _paused or _touchdown_display > 0.0:
		return
	match _phase:
		"launch", "transfer", "landing":
			if not _running and _fuel <= 0.0:
				_notice_message("Out of propellant. Open Pause > Supplies.")
				return
			_running = not _running
			if _running:
				GameAudio.effect("launch")
			_notice_message("Flight active." if _running else "Flight controls paused.")
		"explore":
			_perform_eva_action()
		"complete":
			_to_menu()
	_refresh_interface()

func _secondary_action() -> void:
	if _paused or _touchdown_display > 0.0:
		return
	match _phase:
		"launch", "transfer":
			_throttle = minf(1.0, _throttle + 0.10)
		"landing":
			_gear = true
			GameAudio.effect("stage")
			_notice_message("Landing gear deployed.")
		"explore":
			_rover = not _rover
			GameAudio.effect("stage")
			_notice_message("Rover drive engaged." if _rover else "Astronaut walking.")
		"complete":
			_to_menu()
	_refresh_interface()

func _perform_eva_action() -> void:
	# Players can select a specific task or let Mission Control suggest one.
	# Every action has a location and must be completed before returning.
	if _eva_mission == "repair":
		if not _comm_repaired and absf(_eva_x - 52.0) <= 11.0:
			if GameState.use_supply("repair_kit"):
				_comm_repaired = true
				_update_eva_art()
				GameAudio.effect("scan")
				_notice_message("Communications antenna repaired! Return to the lander.")
			else:
				_notice_message("Repair kit needed. Pause > Supplies to buy with game coins.")
		elif _comm_repaired and _eva_x <= 9.0:
			_reward_field_task("Lunar Repair Specialist", 150, 90)
		else:
			_notice_message("Drive or walk to the antenna at 52 m, then return to 0 m.")
	elif _eva_mission == "flag":
		if not _flag_planted and absf(_eva_x - 84.0) <= 11.0:
			_flag_planted = true
			GameAudio.effect("success")
			_notice_message("Ghana flag raised! Return safely to the lander.")
		elif _flag_planted and _eva_x <= 9.0:
			_reward_field_task("Lunar Flag Explorer", 125, 75)
		else:
			_notice_message("Travel to the flag marker at 84 m, then return to 0 m.")
	else:
		_collect_or_return()
	_refresh_interface()
	_save_checkpoint()

func _reward_field_task(badge: String, coin_reward: int, science_reward: int) -> void:
	if badge not in GameState.badges:
		GameState.badges.append(badge)
		GameState.coins += coin_reward
		GameState.science_points += science_reward
		GameState.save_local()
		GameState.progress_changed.emit()
	_phase = "complete"
	_running = false
	GameAudio.effect("success")
	_notice_message("Mission successful: badge, coins and science recorded.")
	_clear_checkpoint()

func _open_pause_page(page: String) -> void:
	_pause_page = page
	_update_pause_menu()

func _auto_eva_mission() -> void:
	if _count_samples() < 3:
		_select_eva_mission("samples")
	elif not _flag_planted:
		_select_eva_mission("flag")
	else:
		_select_eva_mission("repair")

func _select_eva_mission(kind: String) -> void:
	if kind not in ["samples", "repair", "flag"]:
		return
	_eva_mission = kind
	_pause_page = "main"
	if _paused:
		_toggle_pause()
	_notice_message("Selected %s mission. Use the joystick and action button." % kind)
	_refresh_interface()
	_save_checkpoint()

func _collect_or_return() -> void:
	var nearest: int = -1
	for i in range(3):
		if not _samples[i] and absf(_eva_x - SAMPLES[i]) <= 9.0:
			nearest = i
			break
	if nearest >= 0:
		_samples[nearest] = true
		GameAudio.effect("scan")
		_notice_message("Lunar sample %d/3 secured!" % _count_samples())
	elif _count_samples() == 3 and _eva_x <= 9.0:
		if not GameState.moon_eva_sample_collected:
			GameState.collect_moon_sample()
		if GameState.complete_moon_eva():
			_phase = "complete"
			_notice_message("Mission completed. Science and coins awarded.")
			_clear_checkpoint()
	else:
		_notice_message("Follow the sample markers and return to the lander.")
	_refresh_interface()
	_save_checkpoint()

func _count_samples() -> int:
	var count: int = 0
	for has_sample in _samples:
		if has_sample:
			count += 1
	return count

func _refresh_interface() -> void:
	if _hud == null:
		return
	_plume.visible = _phase == "launch" and _running and _photo_ship.visible and not _paused
	_update_eva_art()
	_marker.visible = _phase == "landing" or (_phase == "explore" and _touchdown_display <= 0.0)
	match _phase:
		"launch":
			_hud.text = "EARTH LAUNCH\nALT %d m · SPD %d m/s\nFUEL %d%%" % [int(_altitude), int(_speed), int(_fuel)]
			_objective.text = "%s · %s" % [Flight.STAGES[clampi(_ascent_stage, 0, 3)], "Steer the rocket" if _running else "Ignite to launch"]
			_action.text = "PAUSE FLIGHT" if _running else ("IGNITE ▶" if _altitude < 1.0 else "RESUME FLIGHT ▶")
			_secondary.text = "THRUST +"
		"transfer":
			_hud.text = "MOON TRANSFER\nPROGRESS %d%%\nFUEL %d%%" % [int(_distance), int(_fuel)]
			_objective.text = "EARTH ORBIT → MOON TRANSFER" if _distance < 25.0 else "COAST TO THE MOON"
			_action.text = "PAUSE FLIGHT" if _running else "RESUME TRANSFER ▶"
			_secondary.text = "THRUST +"
		"landing":
			_hud.text = "MOON LANDING\nHEIGHT %d m · DESCENT %.1f m/s\nFUEL %d%% · OFFSET %d m" % [int(_altitude), _descent, int(_fuel), int(_offset)]
			_objective.text = "GUIDED DESCENT · Release stick to center" if bool(GameState.settings.get("assisted_controls", true)) else "MANUAL DESCENT · Steer, brake and deploy gear"
			_marker.text = "◎  LANDING ZONE"
			_action.text = "PAUSE DESCENT" if _running else "RESUME DESCENT ▶"
			_secondary.text = "GEAR ✓" if _gear else "DEPLOY GEAR"
		"explore":
			# Short lines fit the small status panel; none can wrap into vertical text.
			_hud.text = "MOON EVA: %s\nRANGE: %d m\nSAMPLES: %d/3\nFUEL: %d%%\nCOINS: %d" % [_eva_mission.to_upper(), int(_eva_x), _count_samples(), int(_fuel), GameState.coins]
			var goal: float = _eva_goal()
			var caption: String = _eva_caption(goal)
			var reach: float = 9.0 if _eva_mission == "samples" or goal == 0.0 else 11.0
			_marker.text = Flight.marker_text(caption, goal, _eva_x, reach)
			_objective.text = "TOUCHDOWN CONFIRMED" if _touchdown_display > 0.0 else _marker.text
			if goal == 0.0:
				_action.text = "RETURN TO LANDER"
			else:
				match _eva_mission:
					"repair": _action.text = "REPAIR ANTENNA"
					"flag": _action.text = "PLANT FLAG"
					_: _action.text = "COLLECT SAMPLE"
			_secondary.text = "EXIT ROVER" if _rover else "ENTER ROVER"
		"complete":
			_hud.text = "MISSION COMPLETE ✓\nCOINS %d · SCIENCE %d" % [GameState.coins, GameState.science_points]
			_objective.text = "Earth → Moon → Samples · achievement recorded"
			_action.text = "MISSION CONTROL ▶"
			_secondary.text = "MAIN MENU"
	_camera_button.text = "CAM: %s" % str(GameState.settings.get("camera_mode", "chase")).to_upper()
	_zoom_in_button.disabled = float(GameState.settings.get("camera_zoom", 1.0)) >= 1.69
	_zoom_out_button.disabled = float(GameState.settings.get("camera_zoom", 1.0)) <= 0.86
	_action.disabled = _touchdown_display > 0.0
	_brake_button.visible = _phase == "landing"
	_secondary.disabled = _touchdown_display > 0.0 or (_phase == "landing" and _gear)

func _notice_message(message: String) -> void:
	_notice.text = message
	_notice_timer = 5.0

func _toggle_pause() -> void:
	_paused = not _paused
	_reset_flight_input()
	_flush_camera_settings()
	_pause_dialog.visible = _paused
	_refresh_interface()
	if _paused:
		_pause_page = "main"
	if _paused:
		_save_checkpoint()
		_update_pause_menu()

func _update_pause_menu() -> void:
	for node in _pause_actions.get_children():
		_pause_actions.remove_child(node)
		node.queue_free()
	_panel_text.text = "GIGAORBIT · PAUSED\nCoins %d  Fuel %d%%  Hull %d%%\nFuel cells %d  Repair kits %d" % [
		GameState.coins, int(_fuel), int(_hull), int(GameState.supplies.get("fuel_cell", 0)), int(GameState.supplies.get("repair_kit", 0))]
	if _pause_page == "shop":
		_pause_button("USE FUEL CELL (+35)", _use_fuel)
		_pause_button("USE REPAIR KIT (+35)", _use_repair)
		_pause_button("BUY FUEL CELL (80 COINS)", func() -> void: _buy("fuel_cell"))
		_pause_button("BUY REPAIR KIT (100 COINS)", func() -> void: _buy("repair_kit"))
		_pause_button("BACK", func() -> void: _open_pause_page("main"))
	elif _pause_page == "missions" and _phase == "explore":
		_pause_button("AUTO CHOOSE NEXT TASK", _auto_eva_mission)
		_pause_button("COLLECT 3 LUNAR SAMPLES", func() -> void: _select_eva_mission("samples"))
		_pause_button("REPAIR COMMUNICATIONS", func() -> void: _select_eva_mission("repair"))
		_pause_button("RAISE GHANA FLAG", func() -> void: _select_eva_mission("flag"))
		_pause_button("BACK", func() -> void: _open_pause_page("main"))
	else:
		_pause_button("RESUME", _toggle_pause)
		if _phase == "explore":
			_pause_button("CHOOSE / AUTO EVA TASK", func() -> void: _open_pause_page("missions"))
		_pause_button("FUEL / REPAIR SUPPLIES", func() -> void: _open_pause_page("shop"))
		_pause_button("SAVE & MAIN MENU", _to_menu)

func _pause_button(label: String, callable: Callable) -> void:
	var b: Button = UI.button(label)
	b.focus_mode = Control.FOCUS_NONE
	b.custom_minimum_size.y = 48
	_pause_actions.add_child(b)
	b.pressed.connect(callable)

func _buy(id: String) -> void:
	if GameState.buy_supply(id):
		_notice_message("Purchased %s with virtual game coins." % id.replace("_", " "))
	else:
		_notice_message("Not enough coins or inventory is full.")
	_update_pause_menu()

func _use_fuel() -> void:
	if _fuel >= 99.9:
		_notice_message("Fuel tank is already full.")
	elif GameState.use_supply("fuel_cell"):
		_fuel = minf(100.0, _fuel + 35.0)
		_notice_message("Fuel refilled by 35%.")
		_save_checkpoint()
	else:
		_notice_message("Buy a fuel cell in the workshop.")
	_update_pause_menu()

func _use_repair() -> void:
	if _hull >= 99.9:
		_notice_message("Hull does not need repairs.")
	elif GameState.use_supply("repair_kit"):
		_hull = minf(100.0, _hull + 35.0)
		_notice_message("Hull integrity restored.")
		_save_checkpoint()
	else:
		_notice_message("Buy a repair kit.")
	_update_pause_menu()

func _save_checkpoint() -> void:
	if _phase == "complete":
		return
	var payload: Dictionary = {
		"version": 1, "phase": _phase, "running": _running, "fuel": _fuel,
		"hull": _hull, "throttle": _throttle, "altitude": _altitude,
		"speed": _speed, "distance": _distance, "descent": _descent,
		"offset": _offset, "eva_x": _eva_x, "samples": _samples.duplicate(),
		"gear": _gear, "rover": _rover,
		"eva_mission": _eva_mission, "flag_planted": _flag_planted, "comm_repaired": _comm_repaired,
	}
	SaveStore.write_checkpoint(CHECKPOINT_PATH, payload)
	GameState.save_local()

func _restore_checkpoint() -> void:
	if not FileAccess.file_exists(CHECKPOINT_PATH):
		return
	var file: FileAccess = FileAccess.open(CHECKPOINT_PATH, FileAccess.READ)
	if file == null:
		return
	var raw: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	if not raw is Dictionary or int(raw.get("version", 0)) != 1:
		return
	var restored: Dictionary = raw
	var stage: String = str(restored.get("phase", "launch"))
	if stage not in STAGES or stage == "complete":
		return
	_phase = stage
	_running = false
	_fuel = clampf(float(restored.get("fuel", 100.0)), 0.0, 100.0)
	_hull = clampf(float(restored.get("hull", 100.0)), 30.0, 100.0)
	_throttle = clampf(float(restored.get("throttle", 0.8)), 0.0, 1.0)
	_altitude = maxf(0.0, float(restored.get("altitude", 0.0)))
	_speed = clampf(float(restored.get("speed", 0.0)), 0.0, 1850.0)
	_distance = clampf(float(restored.get("distance", 0.0)), 0.0, 100.0)
	_descent = clampf(float(restored.get("descent", 5.8)), 0.2, 18.0)
	_offset = clampf(float(restored.get("offset", 12.0)), -60.0, 60.0)
	_eva_x = clampf(float(restored.get("eva_x", 0.0)), 0.0, 100.0)
	_gear = bool(restored.get("gear", false)) or (_phase == "landing" and bool(GameState.settings.get("assisted_controls", true)))
	_rover = bool(restored.get("rover", false))
	_eva_mission = str(restored.get("eva_mission", "samples"))
	if _eva_mission not in ["samples", "repair", "flag"]:
		_eva_mission = "samples"
	_flag_planted = bool(restored.get("flag_planted", false))
	_comm_repaired = bool(restored.get("comm_repaired", false))
	var read_samples: Variant = restored.get("samples", [])
	if read_samples is Array and read_samples.size() == 3:
		for i in range(3):
			_samples[i] = bool(read_samples[i])

func _clear_checkpoint() -> void:
	if FileAccess.file_exists(CHECKPOINT_PATH):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(CHECKPOINT_PATH))

func _to_menu() -> void:
	_flush_camera_settings()
	_save_checkpoint()
	GameState.save_local()
	get_tree().change_scene_to_file(GameState.MENU)

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		if not _paused:
			_toggle_pause()
	if what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_APPLICATION_FOCUS_OUT:
		_reset_flight_input()
		_flush_camera_settings()
		if is_instance_valid(_flight_stick):
			_save_checkpoint()
