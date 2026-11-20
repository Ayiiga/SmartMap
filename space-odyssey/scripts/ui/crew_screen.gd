extends Control
## Three crew members are required: cadet, pilot and scientist. Each role has four options.
const UI = preload("res://scripts/ui/space_ui.gd")
const Crew = preload("res://scripts/player/crew_catalog.gd")
var _cards: Dictionary = {}
var _summary: Label
var _confirm: Button

func _ready() -> void:
	UI.backdrop(self)
	var margins: MarginContainer = MarginContainer.new()
	margins.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right", "top", "bottom"]:
		margins.add_theme_constant_override("margin_%s" % side, 20)
	add_child(margins)
	var layout: VBoxContainer = VBoxContainer.new()
	layout.add_theme_constant_override("separation", 9)
	margins.add_child(layout)
	layout.add_child(UI.label("ASSEMBLE YOUR SPACE CREW  ·  3 OF 3", 34, Color("efcf77")))
	layout.add_child(UI.label("Choose one cadet, one rocket pilot and one science explorer. All astronauts are free to select.", 17, UI.MUTED))
	var scroll: ScrollContainer = ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	layout.add_child(scroll)
	var columns: HBoxContainer = HBoxContainer.new()
	columns.add_theme_constant_override("separation", 16)
	columns.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(columns)
	for role: String in ["Flight Cadets", "Rocket Pilots", "Science Explorers"]:
		var panel: PanelContainer = UI.panel()
		panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		columns.add_child(panel)
		var stack: VBoxContainer = VBoxContainer.new()
		stack.add_theme_constant_override("separation", 8)
		panel.add_child(stack)
		stack.add_child(UI.label(role.to_upper(), 21, UI.ACCENT))
		stack.add_child(UI.label(_role_guide(role), 15, UI.MUTED))
		for crew_id: String in Crew.GROUPS[role]:
			var profile: Dictionary = Crew.profile_for(crew_id)
			var row: HBoxContainer = HBoxContainer.new()
			row.add_theme_constant_override("separation", 8)
			stack.add_child(row)
			var swatch: ColorRect = ColorRect.new()
			swatch.color = Color(str(profile["suit"]))
			swatch.custom_minimum_size = Vector2(20, 42)
			row.add_child(swatch)
			var button: Button = UI.button(str(profile["name"]))
			button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			button.custom_minimum_size = Vector2(205, 53)
			row.add_child(button)
			button.pressed.connect(_select.bind(role, crew_id))
			_cards[role + ":" + crew_id] = button
	_summary = UI.label("", 17, Color("d8eefd"))
	layout.add_child(_summary)
	var actions: HBoxContainer = UI.row()
	layout.add_child(actions)
	_confirm = UI.button("CONFIRM 3 CREW & START ROCKET", true)
	_confirm.custom_minimum_size = Vector2(375, 67)
	actions.add_child(_confirm)
	_confirm.pressed.connect(_start)
	var menu: Button = UI.button("BACK TO MENU")
	actions.add_child(menu)
	menu.pressed.connect(func() -> void: get_tree().change_scene_to_file(GameState.MENU))
	_refresh()

func _role_guide(role: String) -> String:
	match role:
		"Flight Cadets":
			return "Learns exploration and field safety"
		"Rocket Pilots":
			return "Pilots launches and landing craft"
		_:
			return "Collects science and rewards"

func _select(role: String, crew_id: String) -> void:
	GameState.assign_crew(role, crew_id)
	_refresh()

func _refresh() -> void:
	var names: Array[String] = []
	for role: String in ["Flight Cadets", "Rocket Pilots", "Science Explorers"]:
		var chosen: String = str(GameState.crew_slots.get(role, ""))
		names.append(str(Crew.profile_for(chosen)["name"]))
		for crew_id: String in Crew.GROUPS[role]:
			var button: Button = _cards.get(role + ":" + crew_id) as Button
			if button != null:
				button.text = ("SELECTED  ✓  " if chosen == crew_id else "CHOOSE  ") + str(Crew.profile_for(crew_id)["name"])
				button.disabled = chosen == crew_id
	_summary.text = "YOUR CREW: %s  |  %s  |  %s" % [names[0], names[1], names[2]]
	_confirm.disabled = not GameState.ready_crew()

func _start() -> void:
	if not GameState.confirm_crew():
		_summary.text = "Choose one member for each of the three crew roles."
		return
	GameState.new_rocket_game()

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		get_tree().change_scene_to_file(GameState.MENU)
