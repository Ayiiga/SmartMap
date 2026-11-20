extends Control
## Every setting takes effect immediately and persists to user://.
const UI = preload("res://scripts/ui/space_ui.gd")
var _quality: OptionButton
var _fps: OptionButton
var _master: HSlider
var _music_volume: HSlider
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
	var center: CenterContainer = CenterContainer.new()
	center.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	margins.add_child(center)
	var panel: PanelContainer = UI.panel()
	panel.custom_minimum_size = Vector2(795, 0)
	center.add_child(panel)
	var col: VBoxContainer = VBoxContainer.new()
	col.add_theme_constant_override("separation", 10)
	panel.add_child(col)
	col.add_child(UI.label("SETTINGS · SOUND AND CONTROLS", 30))
	col.add_child(UI.label("Tap any option — changes apply immediately and save offline.", 15, UI.MUTED))
	var grid: GridContainer = GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 22)
	grid.add_theme_constant_override("v_separation", 9)
	col.add_child(grid)
	_quality = _choice(grid, "GRAPHICS QUALITY", ["Low — smoothest", "Medium", "High"], clampi(int(GameState.settings.get("graphics", 0)), 0, 2))
	_fps = _choice(grid, "FRAME RATE", ["30 FPS · battery saver", "60 FPS · faster"], 1 if int(GameState.settings.get("target_fps", 30)) == 60 else 0)
	_master = _slider(grid, "MASTER VOLUME", "volume", 0.70)
	_music_on = _checkbox(grid, "AFRICAN-INSPIRED MUSIC", "music_enabled", true)
	_music_volume = _slider(grid, "MUSIC VOLUME", "music_volume", 0.35)
	_sound_on = _checkbox(grid, "ROCKET / ALERT SOUND", "sound_enabled", true)
	_sound_volume = _slider(grid, "SOUND EFFECTS VOLUME", "sound_volume", 0.65)
	_voice_on = _checkbox(grid, "SHIP SPEAKER / RADIO", "voice_enabled", true)
	_assist = _checkbox(grid, "BEGINNER GUIDED FLIGHT", "assisted_controls", true)
	_invert = _checkbox(grid, "INVERT CAMERA", "camera_inverted", false)
	_debug = _checkbox(grid, "PERFORMANCE STATS", "debug_overlay", false)
	_feedback = UI.label("Settings are stored locally on this device.", 15, Color("8bd9bb"))
	col.add_child(_feedback)
	var buttons: HBoxContainer = UI.row()
	col.add_child(buttons)
	var test_sound: Button = UI.button("TEST ROCKET SOUND")
	buttons.add_child(test_sound)
	test_sound.pressed.connect(_test_sound)
	var test_radio: Button = UI.button("TEST SHIP SPEAKER")
	buttons.add_child(test_radio)
	test_radio.pressed.connect(_test_radio)
	var bottom: HBoxContainer = UI.row()
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

func _choice(grid: GridContainer, title: String, options: Array[String], selected_index: int) -> OptionButton:
	grid.add_child(UI.label(title, 17))
	var choice: OptionButton = OptionButton.new()
	for label: String in options:
		choice.add_item(label)
	choice.select(selected_index)
	choice.custom_minimum_size = Vector2(280, 48)
	grid.add_child(choice)
	return choice

func _slider(grid: GridContainer, title: String, key: String, default_value: float) -> HSlider:
	grid.add_child(UI.label(title, 17))
	var slider: HSlider = HSlider.new()
	slider.custom_minimum_size = Vector2(280, 44)
	slider.min_value = 0.0
	slider.max_value = 1.0
	slider.step = 0.05
	slider.value = float(GameState.settings.get(key, default_value))
	grid.add_child(slider)
	return slider

func _checkbox(grid: GridContainer, title: String, key: String, default_value: bool) -> CheckBox:
	grid.add_child(UI.label(title, 17))
	var toggle: CheckBox = CheckBox.new()
	toggle.button_pressed = bool(GameState.settings.get(key, default_value))
	toggle.custom_minimum_size = Vector2(280, 44)
	grid.add_child(toggle)
	return toggle

func _connect_inputs() -> void:
	for selection: OptionButton in [_quality, _fps]:
		selection.item_selected.connect(func(_index: int) -> void: _save())
	for slider: HSlider in [_master, _music_volume, _sound_volume]:
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
	GameAudio.communicate("Mission Control to Odyssey. Radio check. Press left or right to dodge comets.")
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
