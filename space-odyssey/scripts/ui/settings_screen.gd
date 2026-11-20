extends Control
const UI = preload("res://scripts/ui/space_ui.gd")
var _quality: OptionButton
var _fps: OptionButton
var _volume: HSlider
var _assist: CheckBox
var _invert: CheckBox
var _debug: CheckBox
var _feedback: Label
var _delete_confirm: bool = false
var _delete_button: Button

func _ready() -> void:
	var col: VBoxContainer = UI.centered_page(self, "SETTINGS", "Saved locally on your device · No cloud account", 700)
	var grid: GridContainer = GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 25)
	grid.add_theme_constant_override("v_separation", 14)
	col.add_child(grid)
	grid.add_child(UI.label("Graphics quality", 19))
	_quality = OptionButton.new()
	for name: String in ["Low — smoother", "Medium", "High"]:
		_quality.add_item(name)
	_quality.select(clampi(int(GameState.settings.get("graphics", 0)), 0, 2))
	_quality.custom_minimum_size = Vector2(260, 48)
	grid.add_child(_quality)
	grid.add_child(UI.label("Frame-rate target", 19))
	_fps = OptionButton.new()
	_fps.add_item("30 FPS", 30)
	_fps.add_item("60 FPS", 60)
	_fps.select(1 if int(GameState.settings.get("target_fps", 30)) == 60 else 0)
	grid.add_child(_fps)
	grid.add_child(UI.label("Volume", 19))
	_volume = HSlider.new()
	_volume.custom_minimum_size = Vector2(260, 45)
	_volume.min_value = 0.0
	_volume.max_value = 1.0
	_volume.step = 0.05
	_volume.value = float(GameState.settings.get("volume", 0.7))
	grid.add_child(_volume)
	_assist = _checkbox(grid, "Assisted controls", "assisted_controls")
	_invert = _checkbox(grid, "Invert camera", "camera_inverted")
	_debug = _checkbox(grid, "Performance overlay", "debug_overlay")
	_feedback = UI.label("", 16, Color("8bd9bb"))
	col.add_child(_feedback)
	var row: HBoxContainer = UI.row()
	col.add_child(row)
	var apply: Button = UI.button("SAVE SETTINGS", true)
	row.add_child(apply)
	apply.pressed.connect(_save)
	var back: Button = UI.button("BACK TO MENU")
	row.add_child(back)
	back.pressed.connect(func() -> void: get_tree().change_scene_to_file(GameState.MENU))
	_delete_button = UI.button("DELETE LOCAL SAVE")
	col.add_child(_delete_button)
	_delete_button.pressed.connect(_delete_save)

func _checkbox(grid: GridContainer, text: String, key: String) -> CheckBox:
	grid.add_child(UI.label(text, 19))
	var box: CheckBox = CheckBox.new()
	box.button_pressed = bool(GameState.settings.get(key, false))
	box.custom_minimum_size.y = 47
	grid.add_child(box)
	return box

func _save() -> void:
	GameState.settings["graphics"] = _quality.selected
	GameState.settings["target_fps"] = 60 if _fps.selected == 1 else 30
	GameState.settings["volume"] = _volume.value
	GameState.settings["assisted_controls"] = _assist.button_pressed
	GameState.settings["camera_inverted"] = _invert.button_pressed
	GameState.settings["debug_overlay"] = _debug.button_pressed
	GameState.save_settings()
	_feedback.text = "Settings saved on this device."

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		get_tree().change_scene_to_file(GameState.MENU)

func _delete_save() -> void:
	if not _delete_confirm:
		_delete_confirm = true
		_delete_button.text = "CONFIRM: DELETE SAVE"
		_feedback.text = "Tap again to permanently remove your local checkpoints."
		return
	GameState.erase_progress()
	_delete_confirm = false
	_delete_button.text = "DELETE LOCAL SAVE"
	_feedback.text = "Local save removed. Settings remain until the app closes."
