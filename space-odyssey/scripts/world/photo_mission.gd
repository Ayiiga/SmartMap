extends Control
## GigaOrbit photograph-led 2.5D Earth-to-Moon mission.
## Real touch controls, simulated flight, checkpoints, EVA and GameState economy.
## Source photographs are bundled locally; camera motion comes from parallax and scale.
const UI = preload("res://scripts/ui/space_ui.gd")
const FLIGHT_STICK = preload("res://scripts/flight/flight_stick.gd")
const LAUNCH_PHOTO = preload("res://assets/textures/launch-rocket.webp")
const ORBIT_PHOTO = preload("res://assets/textures/earth-orbit.webp")
const LUNAR_PHOTO = preload("res://assets/textures/lunar-rover.webp")
const EVA_PHOTO = preload("res://assets/textures/astronaut-eva.webp")
const CHECKPOINT_PATH: String = "user://gigaorbit_photo_checkpoint_v1.json"
const STAGES: Array[String] = ["launch", "transfer", "landing", "explore", "complete"]
const SAMPLES: Array[float] = [22.0, 48.0, 76.0]
var _phase: String = "launch"
var _running: bool = false
var _paused: bool = false
var _braking: bool = false
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
var _timer: float = 0.0
var _last_saved: float = 0.0
var _notice_timer: float = 0.0
var _parallax: TextureRect
var _near_layer: TextureRect
var _photo_ship: TextureRect
var _marker: Label
var _hud: Label
var _objective: Label
var _notice: Label
var _action: Button
var _secondary: Button
var _brake_button: Button
var _pause_dialog: PanelContainer
var _panel_text: Label
var _pause_actions: VBoxContainer
var _control_root: Control

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_build_photo()
	_build_interface()
	_restore_checkpoint()
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
	_photo_ship = TextureRect.new()
	_photo_ship.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_photo_ship.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_photo_ship.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_photo_ship.texture = _make_rocket_crop()
	_photo_ship.visible = false
	add_child(_photo_ship)
	_marker = Label.new()
	_marker.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_marker.text = "◎  SAFE LANDING ZONE"
	_marker.add_theme_color_override("font_color", Color("f3cf72"))
	_marker.add_theme_font_size_override("font_size", 22)
	_marker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_child(_marker)
	_marker.visible = false
	resized.connect(_fit_photo)
	_fit_photo()

func _make_rocket_crop() -> AtlasTexture:
	# Cut a photographic center section from the supplied rocket-launch photo.
	# A feathered silhouette shader removes its rectangular photograph edge.
	var atlas: AtlasTexture = AtlasTexture.new()
	atlas.atlas = LAUNCH_PHOTO
	var w: float = float(LAUNCH_PHOTO.get_width())
	var h: float = float(LAUNCH_PHOTO.get_height())
	atlas.region = Rect2(w * 0.31, h * 0.035, w * 0.38, h * 0.50)
	var mask: ShaderMaterial = ShaderMaterial.new()
	mask.shader = preload("res://assets/shaders/rocket_photo_mask.gdshader")
	_photo_ship_placeholder(mask)
	return atlas

func _photo_ship_placeholder(mask: ShaderMaterial) -> void:
	# Material is applied to the cut-out TextureRect after construction.
	call_deferred("_apply_ship_mask", mask)

func _apply_ship_mask(mask: ShaderMaterial) -> void:
	if is_instance_valid(_photo_ship):
		_photo_ship.material = mask

func _fit_photo() -> void:
	if _parallax == null:
		return
	var view_size: Vector2 = get_viewport_rect().size
	_parallax.size = view_size * 1.18
	_near_layer.size = view_size * 1.24
	_photo_ship.size = Vector2(view_size.y * 0.34, view_size.y * 0.56)
	_move_photo()

func _move_photo() -> void:
	if _parallax == null:
		return
	var v: Vector2 = get_viewport_rect().size
	var drift: Vector2 = Vector2(-_steer.x * 14.0, -_steer.y * 7.0)
	var forward: float = sin(_timer * 0.23) * 5.0
	_parallax.position = -( _parallax.size - v ) * 0.5 + drift + Vector2(forward, 0)
	_near_layer.position = -(_near_layer.size - v) * 0.5 + drift * 2.2 + Vector2(-forward * 1.2, 0)
	_photo_ship.position = Vector2(v.x * 0.49, v.y * 0.40) - _photo_ship.size * 0.5 + Vector2(_steer.x * 28, 0)
	_marker.position = Vector2(v.x * 0.38, v.y * 0.66)
	_marker.size = Vector2(v.x * 0.24, 40)

func _refresh_photo() -> void:
	match _phase:
		"launch":
			_parallax.texture = LAUNCH_PHOTO
			_near_layer.texture = LAUNCH_PHOTO
			_photo_ship.visible = false
			_marker.visible = false
		"transfer":
			_parallax.texture = ORBIT_PHOTO
			_near_layer.texture = EVA_PHOTO
			_photo_ship.visible = true
			_marker.visible = false
		"landing":
			_parallax.texture = LUNAR_PHOTO
			_near_layer.texture = LUNAR_PHOTO
			_photo_ship.visible = true
			_marker.visible = true
		"explore", "complete":
			_parallax.texture = LUNAR_PHOTO
			_near_layer.texture = EVA_PHOTO
			_photo_ship.visible = false
			_marker.visible = false
	_fit_photo()

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
	_control_root.add_child(pause)
	pause.pressed.connect(_toggle_pause)
	var stick: Control = FLIGHT_STICK.new()
	stick.anchor_top = 1.0
	stick.anchor_bottom = 1.0
	stick.offset_left = 18
	stick.offset_right = 171
	stick.offset_top = -169
	stick.offset_bottom = -16
	_control_root.add_child(stick)
	stick.connect("axis_changed", func(v: Vector2) -> void: _steer = v)
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
	_brake_button.button_down.connect(func() -> void: _braking = true)
	_brake_button.button_up.connect(func() -> void: _braking = false)
	_brake_button.mouse_exited.connect(func() -> void: _braking = false)
	_secondary = UI.button("THRUST +")
	_secondary.custom_minimum_size.x = 140
	controls.add_child(_secondary)
	_secondary.pressed.connect(_secondary_action)
	_action = UI.button("IGNITE ▶", true)
	_action.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	controls.add_child(_action)
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

func _physics_process(delta: float) -> void:
	if _paused or _phase == "complete":
		return
	_timer += delta
	_move_photo()
	if _notice_timer > 0.0:
		_notice_timer -= delta
		if _notice_timer <= 0.0:
			_notice.text = ""
	if not _running:
		return
	match _phase:
		"launch":
			var acceleration: float = _throttle * 92.0 + (13.0 if bool(GameState.settings.get("assisted_controls", true)) else 0.0) - 10.5
			_speed = clampf(_speed + acceleration * delta, 0.0, 1850.0)
			_altitude += _speed * delta * 4.0
			_fuel = maxf(0.0, _fuel - delta * (_throttle * 0.34 + 0.02))
			if _altitude >= 120000.0:
				_complete_orbit()
		"transfer":
			var direction_penalty: float = clampf(1.0 - absf(_steer.x) * 0.15, 0.6, 1.0)
			_distance = minf(100.0, _distance + delta * (4.5 + _throttle * 0.8) * direction_penalty)
			_fuel = maxf(0.0, _fuel - delta * (_throttle * 0.08 + 0.01))
			if _distance >= 100.0:
				_enter_landing()
		"landing":
			var braking: float = 7.2 if _braking else 0.0
			_descent = clampf(_descent + (1.4 - _throttle * 3.0 - braking) * delta, 0.2, 18.0)
			_offset = clampf(_offset + _steer.x * 7.4 * delta, -60.0, 60.0)
			_altitude = maxf(0.0, _altitude - _descent * delta)
			_fuel = maxf(0.0, _fuel - delta * (_throttle * 0.16 + (0.3 if _braking else 0.0)))
			if _altitude <= 0.0:
				if _gear and _descent <= 7.0 and absf(_offset) < 11.0:
					_finish_landing()
				else:
					_fail_landing()
		"explore":
			var move_speed: float = 11.0 if _rover else 4.5
			_eva_x = clampf(_eva_x + _steer.x * move_speed * delta, 0.0, 100.0)
			# Optional joystick vertical axis drives forwards for one-handed play.
			_eva_x = clampf(_eva_x - _steer.y * move_speed * delta, 0.0, 100.0)
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
	_running = false
	_fuel = maxf(20.0, _fuel)
	_notice_message("Orbit reached! +300 coins on first clear.")
	_refresh_photo()
	_save_checkpoint()

func _enter_landing() -> void:
	_phase = "landing"
	_running = false
	_altitude = 160.0
	_descent = 5.8
	_throttle = 0.43
	_offset = 12.0
	_notice_message("Moon approach: prepare the landing gear.")
	_refresh_photo()
	_save_checkpoint()

func _finish_landing() -> void:
	_running = false
	_phase = "explore"
	GameState.award_landing("moon", "A" if _descent < 4.0 else "B", true)
	_notice_message("Touchdown! First landing awards coins + science.")
	_refresh_photo()
	_save_checkpoint()

func _fail_landing() -> void:
	_running = false
	_hull = maxf(30.0, _hull - 25.0)
	_altitude = 160.0
	_descent = 5.8
	_offset = 12.0
	_gear = false
	_notice_message("Unsafe landing. Retry free; repairs use a repair kit.")
	_save_checkpoint()

func _main_action() -> void:
	if _paused:
		return
	match _phase:
		"launch", "transfer", "landing":
			_running = not _running
			_notice_message("Flight active." if _running else "Flight controls paused.")
		"explore":
			_collect_or_return()
		"complete":
			_to_menu()

func _secondary_action() -> void:
	if _paused:
		return
	match _phase:
		"launch", "transfer":
			_throttle = minf(1.0, _throttle + 0.10)
		"landing":
			_gear = true
			_notice_message("Landing gear deployed.")
		"explore":
			_rover = not _rover
			_notice_message("Rover drive engaged." if _rover else "Astronaut walking.")
		"complete":
			_to_menu()
	_refresh_interface()

func _collect_or_return() -> void:
	var nearest: int = -1
	for i in range(3):
		if not _samples[i] and absf(_eva_x - SAMPLES[i]) < 9.0:
			nearest = i
			break
	if nearest >= 0:
		_samples[nearest] = true
		_notice_message("Lunar sample %d/3 secured!" % _count_samples())
	elif _count_samples() == 3 and _eva_x < 9.0:
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
	match _phase:
		"launch":
			_hud.text = "EARTH LAUNCH\nALT %d m · SPD %d m/s\nFUEL %d%%" % [int(_altitude), int(_speed), int(_fuel)]
			_objective.text = "Reach Earth orbit · joystick steers · press IGNITE"
			_action.text = "PAUSE ENGINE" if _running else "IGNITE / RESUME ▶"
			_secondary.text = "THRUST +"
		"transfer":
			_hud.text = "MOON TRANSFER\nPROGRESS %d%%\nFUEL %d%%" % [int(_distance), int(_fuel)]
			_objective.text = "Navigate toward the Moon · guided time-compressed flight"
			_action.text = "PAUSE" if _running else "BEGIN TRANSFER ▶"
			_secondary.text = "THRUST +"
		"landing":
			_hud.text = "MOON LANDING\nHEIGHT %d m · DESCENT %.1f m/s\nFUEL %d%% · OFFSET %d m" % [int(_altitude), _descent, int(_fuel), int(_offset)]
			_objective.text = "Steer toward center · hold BRAKE · deploy GEAR"
			_action.text = "PAUSE DESCENT" if _running else "START DESCENT ▶"
			_secondary.text = "GEAR ✓" if _gear else "DEPLOY GEAR"
		"explore":
			_hud.text = "LUNAR FIELD MISSION\nSAMPLES %d/3 · RANGE %d m\nCOINS %d" % [_count_samples(), int(_eva_x), GameState.coins]
			_objective.text = "Move to samples · collect all 3 · return to zero"
			_action.text = "COLLECT / RETURN"
			_secondary.text = "EXIT ROVER" if _rover else "ENTER ROVER"
		"complete":
			_hud.text = "MISSION COMPLETE ✓\nCOINS %d · SCIENCE %d" % [GameState.coins, GameState.science_points]
			_objective.text = "Earth → Moon → Samples · achievement recorded"
			_action.text = "MISSION CONTROL ▶"
			_secondary.text = "MAIN MENU"
	_brake_button.visible = _phase == "landing"
	_secondary.disabled = _phase == "landing" and _gear

func _notice_message(message: String) -> void:
	_notice.text = message
	_notice_timer = 5.0

func _toggle_pause() -> void:
	_paused = not _paused
	_pause_dialog.visible = _paused
	if _paused:
		_save_checkpoint()
		_update_pause_menu()

func _update_pause_menu() -> void:
	for node in _pause_actions.get_children():
		node.queue_free()
	_panel_text.text = "GIGAORBIT  ·  MISSION PAUSED\nCoins: %d    Fuel: %d%%   Hull: %d%%\nFuel Cells: %d    Repair Kits: %d" % [
		GameState.coins, int(_fuel), int(_hull), int(GameState.supplies.get("fuel_cell", 0)), int(GameState.supplies.get("repair_kit", 0))]
	_pause_button("RESUME FLIGHT", _toggle_pause)
	_pause_button("USE FUEL CELL · +35", _use_fuel)
	_pause_button("USE REPAIR KIT · +35", _use_repair)
	_pause_button("BUY FUEL CELL · 80 COINS", func() -> void: _buy("fuel_cell"))
	_pause_button("BUY REPAIR KIT · 100 COINS", func() -> void: _buy("repair_kit"))
	_pause_button("SAVE & MAIN MENU", _to_menu)

func _pause_button(label: String, callable: Callable) -> void:
	var b: Button = UI.button(label)
	b.custom_minimum_size.y = 43
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
	else:
		_notice_message("Buy a fuel cell in the workshop.")
	_update_pause_menu()

func _use_repair() -> void:
	if _hull >= 99.9:
		_notice_message("Hull does not need repairs.")
	elif GameState.use_supply("repair_kit"):
		_hull = minf(100.0, _hull + 35.0)
		_notice_message("Hull integrity restored.")
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
	}
	var file: FileAccess = FileAccess.open(CHECKPOINT_PATH, FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(payload))
		file.close()
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
	_gear = bool(restored.get("gear", false))
	_rover = bool(restored.get("rover", false))
	var read_samples: Array = restored.get("samples", [])
	if read_samples.size() == 3:
		for i in range(3):
			_samples[i] = bool(read_samples[i])

func _clear_checkpoint() -> void:
	if FileAccess.file_exists(CHECKPOINT_PATH):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(CHECKPOINT_PATH))

func _to_menu() -> void:
	_save_checkpoint()
	GameState.save_local()
	get_tree().change_scene_to_file(GameState.MENU)

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		if not _paused:
			_toggle_pause()
	if what == NOTIFICATION_APPLICATION_PAUSED:
		_save_checkpoint()
