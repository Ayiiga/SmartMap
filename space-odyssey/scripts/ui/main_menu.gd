extends Control
const UI = preload("res://scripts/ui/space_ui.gd")

func _ready() -> void:
	UI.backdrop(self)
	var margins: MarginContainer = MarginContainer.new()
	margins.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margins.add_theme_constant_override("margin_left", 45)
	margins.add_theme_constant_override("margin_right", 45)
	margins.add_theme_constant_override("margin_top", 30)
	margins.add_theme_constant_override("margin_bottom", 30)
	add_child(margins)
	var layout: HBoxContainer = UI.row()
	layout.alignment = BoxContainer.ALIGNMENT_CENTER
	margins.add_child(layout)
	var left: VBoxContainer = VBoxContainer.new()
	left.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	left.alignment = BoxContainer.ALIGNMENT_CENTER
	left.add_theme_constant_override("separation", 18)
	layout.add_child(left)
	left.add_child(UI.label("SPACE ODYSSEY", 52))
	left.add_child(UI.label("JOURNEY BEYOND EARTH", 22, UI.ACCENT))
	left.add_child(UI.label("An offline astronaut adventure\nEarth training • Rockets • The Moon • Beyond", 19, UI.MUTED))
	left.add_child(UI.label("PHASE 2  ·  TRAINING + ROCKET FLIGHT", 16, Color("8bd9bb")))
	var panel: PanelContainer = UI.panel()
	layout.add_child(panel)
	var buttons: VBoxContainer = VBoxContainer.new()
	buttons.add_theme_constant_override("separation", 9)
	panel.add_child(buttons)
	_add(buttons, "NEW GAME", true, func() -> void: GameState.new_game())
	var cont: Button = _add(buttons, "CONTINUE", false, func() -> void: GameState.continue_game())
	cont.disabled = not GameState.can_continue()
	if cont.disabled:
		cont.tooltip_text = "Start a new game first"
	_add(buttons, "CHOOSE ASTRONAUT", false, func() -> void: _open("crew_screen"))
	_add(buttons, "MISSIONS", false, func() -> void: _open("missions_screen"))
	_add(buttons, "ROCKET WORKSHOP", false, func() -> void: _open("workshop_screen"))
	_add(buttons, "DISCOVER", false, func() -> void: _open("discover_screen"))
	_add(buttons, "SETTINGS", false, func() -> void: _open("settings_screen"))
	_add(buttons, "EXIT", false, func() -> void: get_tree().quit())
	buttons.add_child(UI.label("No login · No ads · No network needed", 13, UI.MUTED))

func _add(parent: VBoxContainer, text: String, primary: bool, callback: Callable) -> Button:
	var b: Button = UI.button(text, primary)
	parent.add_child(b)
	b.pressed.connect(callback)
	return b

func _open(name: String) -> void:
	get_tree().change_scene_to_file("res://scenes/ui/%s.tscn" % name)

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		get_tree().quit()
