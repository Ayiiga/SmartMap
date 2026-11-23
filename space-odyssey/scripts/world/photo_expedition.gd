extends Control
## Offline 2.5D photographic expeditions: real movement, fuel, landing,
## scan alignment, repairs, saves, virtual rewards, and real NASA image layers.
## Jupiter / Saturn / Neptune are orbital flybys, NOT landable surfaces.
const UI = preload("res://scripts/ui/space_ui.gd")
const STICK = preload("res://scripts/flight/flight_stick.gd")
const PHOTOS: Dictionary = {
	"mars": preload("res://assets/textures/nasa-mars-jezero.jpg"),
	"europa": preload("res://assets/textures/nasa-europa-galileo.jpg"),
	"jupiter": preload("res://assets/textures/nasa-jupiter-juno.jpg"),
	"saturn": preload("res://assets/textures/nasa-saturn-cassini.jpg"),
	"titan": preload("res://assets/textures/nasa-titan-cassini.png"),
	"neptune": preload("res://assets/textures/nasa-neptune-voyager.jpg"),
}
const SCAN_MARKERS: Array[float] = [20.0, 51.0, 82.0]
const DESTINATIONS: Array[String] = ["mars", "europa", "jupiter", "saturn", "titan", "neptune"]
var _target: String = "mars"
var _phase: String = "approach"
var _running: bool = false
var _paused: bool = false
var _braking: bool = false
var _gear: bool = false
var _rover: bool = false
var _axis: Vector2 = Vector2.ZERO
var _fuel: float = 100.0
var _hull: float = 100.0
var _progress: float = 0.0
var _altitude: float = 145.0
var _descent: float = 5.5
var _offset: float = 8.0
var _position: float = 0.0
var _timer: float = 0.0
var _checks: Array[bool] = [false, false, false]
var _flag_planted: bool = false
var _repaired: bool = false
var _focus: String = "scan"
var _photo: TextureRect
var _near: TextureRect
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
	_apply_camera()
	_refresh()
	GameState.save_local()

func _is_surface() -> bool:
	return _target == "mars"

func _checkpoint_path() -> String:
	return "user://gigaorbit_photo_%s_v1.json" % _target

func _make_photo() -> void:
	_photo = TextureRect.new()
	_photo.texture = PHOTOS[_target] as Texture2D
	_photo.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_photo.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_photo.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_photo)
	_near = TextureRect.new()
	_near.texture = PHOTOS[_target] as Texture2D
	_near.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_near.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_near.modulate = Color(1, 1, 1, 0.11)
	_near.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_near)
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
	_move_background()

func _move_background() -> void:
	if _photo == null or _near == null:
		return
	var v: Vector2 = get_viewport_rect().size
	var drift: Vector2 = Vector2(-_axis.x * 13 - sin(_timer * 0.45) * 7, -_axis.y * 6)
	_photo.position = (v - _photo.size) * 0.5 + drift
	_near.position = (v - _near.size) * 0.5 + drift * 2.3

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
	pause.pressed.connect(_toggle_pause)
	_camera = _top_button(hud, "CAMERA", 73)
	_camera.pressed.connect(_cycle_camera)
	var plus: Button = _top_button(hud, "ZOOM +", 130)
	plus.pressed.connect(func() -> void: _zoom(0.15))
	var minus: Button = _top_button(hud, "ZOOM -", 187)
	minus.pressed.connect(func() -> void: _zoom(-0.15))
	var stick: Control = STICK.new()
	stick.anchor_top = 1.0
	stick.anchor_bottom = 1.0
	stick.offset_left = 14
	stick.offset_right = 165
	stick.offset_top = -170
	stick.offset_bottom = -17
	hud.add_child(stick)
	stick.connect("axis_changed", func(v: Vector2) -> void: _axis = v)
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
	_brake.button_down.connect(func() -> void: _braking = true)
	_brake.button_up.connect(func() -> void: _braking = false)
	_secondary = UI.button("GEAR")
	_secondary.custom_minimum_size.x = 106
	row.add_child(_secondary)
	_secondary.pressed.connect(_secondary_action)
	_action = UI.button("START >", true)
	_action.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(_action)
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
	if _hold_notice > 0.0:
		_hold_notice -= delta
		if _hold_notice <= 0.0:
			_notice.text = ""
	if _phase in ["approach", "landing"] and not _running:
		return
	if _phase == "approach":
		_progress = minf(100.0, _progress + delta * (4.5 + absf(_axis.y) * 1.5))
		_fuel = maxf(0.0, _fuel - delta * 0.14)
		if _progress >= 100.0:
			_running = false
			_phase = "landing" if _is_surface() else "explore"
			_notify("Approach complete. Begin guided landing." if _is_surface() else "Orbital science instruments ready. Align to 3 scan targets.")
	elif _phase == "landing":
		_descent = clampf(_descent + (1.0 - (7.0 if _braking else 0.0)) * delta, 0.4, 14.0)
		_offset = clampf(_offset + _axis.x * 6.0 * delta, -40.0, 40.0)
		_altitude = maxf(0.0, _altitude - _descent * delta)
		_fuel = maxf(0.0, _fuel - delta * (0.21 if _braking else 0.10))
		if _altitude <= 0.0:
			_running = false
			if _gear and _descent <= 7.0 and absf(_offset) <= 10.0:
				_phase = "explore"
				GameState.award_landing("mars", "A" if _descent < 4.0 else "B", true)
				_notify("Safe Mars landing! Now explore, collect samples and return.")
			else:
				_hull = maxf(30.0, _hull - 18.0)
				_altitude = 145.0
				_descent = 5.5
				_offset = 8.0
				_gear = false
				_notify("Unsafe landing. Free retry; use a repair kit to restore hull.")
	elif _phase == "explore":
		var speed: float = 11.0 if _rover and _is_surface() else 5.4
		_position = clampf(_position + (_axis.x - _axis.y) * speed * delta, 0.0, 100.0)
	_refresh()
	_save_timer += delta
	if _save_timer >= 5.0:
		_save_timer = 0.0
		_save()

func _main_action() -> void:
	if _paused:
		return
	if _phase in ["approach", "landing"]:
		if _fuel < 0.1:
			_notify("Out of propellant. Open Pause > Fuel and Repairs.")
			return
		_running = not _running
	elif _phase == "explore":
		_interact()
	else:
		_to_menu()
	_refresh()

func _secondary_action() -> void:
	if _phase == "landing":
		_gear = true
		_notify("Landing gear deployed.")
	elif _phase == "explore":
		_rover = not _rover
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
	elif _is_surface() and not _flag_planted and absf(_position - 90.0) <= 8.0:
		_flag_planted = true
		_notify("Ghana mission flag planted at the designated Mars marker.")
	elif _count_checks() == 3 and _position <= 9.0 and (not _is_surface() or _flag_planted):
		_complete()
	else:
		_notify("Steer to markers at 20, 51, 82 m; return to 0 m after tasks.")
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
	var title: String = _target.to_upper()
	var flight: String = "MARS SURFACE" if _is_surface() else "ORBITAL FLYBY"
	_telemetry.text = "%s · %s\nFUEL %d%%  HULL %d%%\nCOINS %d" % [title, flight, int(_fuel), int(_hull), GameState.coins]
	_camera.text = "CAM: %s" % str(GameState.settings.get("camera_mode", "chase")).to_upper()
	_brake.visible = _phase == "landing"
	_secondary.visible = _phase in ["landing", "explore"]
	if _phase == "approach":
		_objective.text = "APPROACH %d%% · Steer and maintain fuel" % int(_progress)
		_action.text = "PAUSE" if _running else "START TRANSFER"
	elif _phase == "landing":
		_objective.text = "LAND %d m · %.1f m/s · X %d m" % [int(_altitude), _descent, int(_offset)]
		_secondary.text = "GEAR ✓" if _gear else "GEAR"
		_action.text = "PAUSE" if _running else "DESCEND"
	elif _phase == "explore":
		_objective.text = "%s  •  %d m  •  SCIENCE %d/3" % [title, int(_position), _count_checks()]
		_secondary.text = "WALK" if _rover else "ROVER"
		_action.text = "SCAN / COLLECT"
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
	GameState.save_settings()
	_apply_camera()
	_refresh()

func _zoom(amount: float) -> void:
	if _paused:
		return
	GameState.settings["camera_zoom"] = clampf(float(GameState.settings.get("camera_zoom", 1.0)) + amount, 0.85, 1.7)
	GameState.save_settings()
	_apply_camera()

func _toggle_pause() -> void:
	_paused = not _paused
	_overlay.visible = _paused
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
	b.custom_minimum_size.y = 43
	_menu_actions.add_child(b)
	b.pressed.connect(callback)

func _buy(kind: String) -> void:
	_notify("Supplies purchased with virtual coins." if GameState.buy_supply(kind) else "Not enough coins or inventory full.")
	_update_menu()

func _refuel() -> void:
	if _fuel < 99.0 and GameState.use_supply("fuel_cell"):
		_fuel = minf(100.0, _fuel + 35.0)
		_notify("Fuel cell fitted: +35%.")
	else:
		_notify("No fuel cell in inventory or tank already full.")
	_update_menu()

func _repair() -> void:
	if _hull < 99.0 and GameState.use_supply("repair_kit"):
		_hull = minf(100.0, _hull + 35.0)
		_repaired = true
		_notify("Spacecraft repairs completed: +35% hull.")
	else:
		_notify("No repair kit in inventory or hull already full.")
	_update_menu()

func _save() -> void:
	if _phase == "complete":
		GameState.save_local()
		return
	var data: Dictionary = {
		"version": 1, "phase": _phase, "running": _running, "fuel": _fuel,
		"hull": _hull, "progress": _progress, "altitude": _altitude,
		"descent": _descent, "offset": _offset, "position": _position,
		"checks": _checks.duplicate(), "gear": _gear, "rover": _rover,
		"flag": _flag_planted, "repaired": _repaired,
	}
	var file: FileAccess = FileAccess.open(_checkpoint_path(), FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(data))
		file.close()
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
	if _phase not in ["approach", "landing", "explore"]:
		_phase = "approach"
	_running = false
	_fuel = clampf(float(data.get("fuel", 100.0)), 0.0, 100.0)
	_hull = clampf(float(data.get("hull", 100.0)), 30.0, 100.0)
	_progress = clampf(float(data.get("progress", 0.0)), 0.0, 100.0)
	_altitude = clampf(float(data.get("altitude", 145.0)), 0.0, 145.0)
	_descent = clampf(float(data.get("descent", 5.5)), 0.4, 14.0)
	_offset = clampf(float(data.get("offset", 8.0)), -40.0, 40.0)
	_position = clampf(float(data.get("position", 0.0)), 0.0, 100.0)
	_gear = bool(data.get("gear", false))
	_rover = bool(data.get("rover", false))
	_flag_planted = bool(data.get("flag", false))
	_repaired = bool(data.get("repaired", false))
	var checks: Array = data.get("checks", [])
	if checks.size() == 3:
		for i in range(3):
			_checks[i] = bool(checks[i])

func _to_menu() -> void:
	_save()
	get_tree().change_scene_to_file("res://scenes/ui/missions_screen.tscn")

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		if not _paused:
			_toggle_pause()
	if what == NOTIFICATION_APPLICATION_PAUSED:
		_save()
