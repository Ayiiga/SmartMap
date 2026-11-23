extends Control
## Every setting takes effect immediately and persists to user://.
const UI = preload("res://scripts/ui/space_ui.gd")
var _quality: OptionButton
var _fps: OptionButton
var _master: HSlider
var _music_volume: HSlider
var _voice_volume: HSlider
var _camera_mode: OptionButton
var _camera_zoom: HSlider
var _sound_volume: HSlider
var _music_on: CheckBox
var _sound_on: CheckBox
var _voice_on: CheckBox
var _assist: CheckBox
var _invert: CheckBox
var _debug: CheckBox
var _feedback: Label
var _delete_confirm: bool = false
var _delete_button: Button
var _loading: bool = true

func _ready() -> void:
	UI.backdrop(self)
	var scroll: ScrollContainer = ScrollContainer.new()
	scroll.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	add_child(scroll)
	var margins: MarginContainer = MarginContainer.new()
	margins.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	for side: String in ["left", "right", "top", "bottom"]:
		margins.add_theme_constant_override("margin_%s" % side, 22)
	scroll.add_child(margins)
	# Fill the landscape viewport; CenterContainer previously allowed the
	# contents to be compressed into a narrow panel on Android.
	var panel: PanelContainer = UI.panel()
	panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	margins.add_child(panel)
	var col: VBoxContainer = VBoxContainer.new()
	col.add_theme_constant_override("separation", 10)
	panel.add_child(col)
	col.add_child(UI.label("GIGAORBIT · SETTINGS", 29))
	col.add_child(UI.label("ANDROID UI v3 · readable single-column controls", 14, UI.ACCENT))
	col.add_child(UI.label("Tap any option — changes apply immediately and save offline.", 15, UI.MUTED))
	var grid: VBoxContainer = VBoxContainer.new()
	grid.add_theme_constant_override("separation", 7)
	col.add_child(grid)
	_quality = _choice(grid, "GRAPHICS QUALITY", ["Low — smoothest", "Medium", "High"], clampi(int(GameState.settings.get("graphics", 0)), 0, 2))
	_fps = _choice(grid, "FRAME RATE", ["30 FPS · battery saver", "60 FPS · faster"], 1 if int(GameState.settings.get("target_fps", 30)) == 60 else 0)
	_master = _slider(grid, "MASTER VOLUME", "volume", 0.70)
	_music_on = _checkbox(grid, "AFRICAN-INSPIRED MUSIC", "music_enabled", true)
	_music_volume = _slider(grid, "MUSIC VOLUME", "music_volume", 0.35)
	_sound_on = _checkbox(grid, "ROCKET / ALERT SOUND", "sound_enabled", true)
	_sound_volume = _slider(grid, "SOUND EFFECTS VOLUME", "sound_volume", 0.65)
	_voice_on = _checkbox(grid, "SHIP SPEAKER / RADIO", "voice_enabled", true)
	_voice_volume = _slider(grid, "RADIO VOICE VOLUME", "voice_volume", 0.8)
	_camera_mode = _choice(grid, "CAMERA VIEW", ["Chase", "Cockpit", "External", "Wide"], maxi(0, ["chase", "cockpit", "external", "wide"].find(str(GameState.settings.get("camera_mode", "chase")))))
	_camera_zoom = _slider(grid, "CAMERA ZOOM", "camera_zoom", 1.0)
	_camera_zoom.min_value = 0.7
	_camera_zoom.max_value = 1.7
	_camera_zoom.step = 0.1
	_assist = _checkbox(grid, "BEGINNER GUIDED FLIGHT", "assisted_controls", true)
	_invert = _checkbox(grid, "INVERT CAMERA", "camera_inverted", false)
	_debug = _checkbox(grid, "PERFORMANCE STATS", "debug_overlay", false)
	_feedback = UI.label("Settings are stored locally on this device.", 15, Color("8bd9bb"))
	col.add_child(_feedback)
	var buttons: VBoxContainer = VBoxContainer.new()
	col.add_child(buttons)
	var test_sound: Button = UI.button("TEST ROCKET SOUND")
	buttons.add_child(test_sound)
	test_sound.pressed.connect(_test_sound)
	var test_radio: Button = UI.button("TEST SHIP SPEAKER")
	buttons.add_child(test_radio)
	test_radio.pressed.connect(_test_radio)
	var bottom: VBoxContainer = VBoxContainer.new()
	col.add_child(bottom)
	var save: Button = UI.button("SAVE SETTINGS", true)
	bottom.add_child(save)
	save.pressed.connect(_save)
	var defaults: Button = UI.button("RESET SETTINGS")
	bottom.add_child(defaults)
	defaults.pressed.connect(_restore_defaults)
	var back: Button = UI.button("BACK TO MENU")
	bottom.add_child(back)
	back.pressed.connect(_menu)
	_delete_button = UI.button("DELETE LOCAL PROGRESS (CONFIRM TWICE)")
	col.add_child(_delete_button)
	_delete_button.pressed.connect(_delete_save)
	_loading = false
	_connect_inputs()

func _setting_row(stack: VBoxContainer, title: String) -> VBoxContainer:
	# Stack every caption ABOVE its input. This cannot collapse captions into
	# one-character-wide vertical text at narrow Android display sizes.
	var row: VBoxContainer = VBoxContainer.new()
	row.add_theme_constant_override("separation", 2)
	row.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	stack.add_child(row)
	var caption: Label = UI.label(title, 16)
	caption.autowrap_mode = TextServer.AUTOWRAP_OFF
	caption.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(caption)
	return row

func _choice(grid: VBoxContainer, title: String, options: Array[String], selected_index: int) -> OptionButton:
	var row: VBoxContainer = _setting_row(grid, title)
	var choice: OptionButton = OptionButton.new()
	for label: String in options:
		choice.add_item(label)
	choice.select(selected_index)
	choice.custom_minimum_size = Vector2(0, 48)
	choice.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(choice)
	return choice

func _slider(grid: VBoxContainer, title: String, key: String, default_value: float) -> HSlider:
	var row: VBoxContainer = _setting_row(grid, title)
	var slider: HSlider = HSlider.new()
	slider.custom_minimum_size = Vector2(0, 44)
	slider.min_value = 0.0
	slider.max_value = 1.0
	slider.step = 0.05
	slider.value = float(GameState.settings.get(key, default_value))
	slider.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(slider)
	return slider

func _checkbox(grid: VBoxContainer, title: String, key: String, default_value: bool) -> CheckBox:
	var row: VBoxContainer = _setting_row(grid, title)
	var toggle: CheckBox = CheckBox.new()
	toggle.button_pressed = bool(GameState.settings.get(key, default_value))
	toggle.custom_minimum_size = Vector2(0, 44)
	toggle.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(toggle)
	return toggle

func _connect_inputs() -> void:
	for selection: OptionButton in [_quality, _fps, _camera_mode]:
		selection.item_selected.connect(func(_index: int) -> void: _save())
	for slider: HSlider in [_master, _music_volume, _sound_volume, _voice_volume, _camera_zoom]:
		slider.value_changed.connect(func(_value: float) -> void: _save())
	for toggle: CheckBox in [_music_on, _sound_on, _voice_on, _assist, _invert, _debug]:
		toggle.toggled.connect(func(_value: bool) -> void: _save())

func _save() -> void:
	if _loading:
		return
	GameState.settings["graphics"] = _quality.selected
	GameState.settings["target_fps"] = 60 if _fps.selected == 1 else 30
	GameState.settings["volume"] = _master.value
	GameState.settings["music_enabled"] = _music_on.button_pressed
	GameState.settings["music_volume"] = _music_volume.value
	GameState.settings["sound_enabled"] = _sound_on.button_pressed
	GameState.settings["sound_volume"] = _sound_volume.value
	GameState.settings["voice_enabled"] = _voice_on.button_pressed
	GameState.settings["voice_volume"] = _voice_volume.value
	GameState.settings["camera_mode"] = ["chase", "cockpit", "external", "wide"][_camera_mode.selected]
	GameState.settings["camera_zoom"] = _camera_zoom.value
	GameState.settings["assisted_controls"] = _assist.button_pressed
	GameState.settings["camera_inverted"] = _invert.button_pressed
	GameState.settings["debug_overlay"] = _debug.button_pressed
	GameState.save_settings()
	_feedback.text = "✓ Changes applied and saved offline."

func _restore_defaults() -> void:
	_loading = true
	var defaults: Dictionary = GameState.DEFAULT_SETTINGS
	_quality.select(int(defaults["graphics"]))
	_fps.select(0)
	_master.value = float(defaults["volume"])
	_music_on.button_pressed = bool(defaults["music_enabled"])
	_music_volume.value = float(defaults["music_volume"])
	_sound_on.button_pressed = bool(defaults["sound_enabled"])
	_sound_volume.value = float(defaults["sound_volume"])
	_voice_on.button_pressed = bool(defaults["voice_enabled"])
	_voice_volume.value = float(defaults["voice_volume"])
	_camera_mode.select(0)
	_camera_zoom.value = float(defaults["camera_zoom"])
	_assist.button_pressed = bool(defaults["assisted_controls"])
	_invert.button_pressed = bool(defaults["camera_inverted"])
	_debug.button_pressed = bool(defaults["debug_overlay"])
	_loading = false
	_save()
	_feedback.text = "Default settings restored and saved."

func _test_sound() -> void:
	GameAudio.effect("launch")
	_feedback.text = "Rocket test played." if _sound_on.button_pressed else "Turn on ROCKET / ALERT SOUND to hear the test."

func _test_radio() -> void:
	GameAudio.communicate("GigaOrbit Mission Control. Radio check. Press left or right to dodge comets.")
	if _voice_on.button_pressed and GameAudio.speech_supported():
		_feedback.text = "Voice test sent to your phone's installed speech engine."
	else:
		_feedback.text = "Radio message and beeps work offline. Spoken voice requires an installed English TTS voice."

func _menu() -> void:
	_save()
	get_tree().change_scene_to_file(GameState.MENU)

func _delete_save() -> void:
	if not _delete_confirm:
		_delete_confirm = true
		_delete_button.text = "TAP AGAIN TO CONFIRM DELETE"
		_feedback.text = "This permanently deletes saved missions, scores and crew selection."
		return
	GameState.erase_progress()
	_delete_confirm = false
	_delete_button.text = "DELETE LOCAL PROGRESS (CONFIRM TWICE)"
	_feedback.text = "Progress deleted. Your current sound settings remain active."

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		_menu()
