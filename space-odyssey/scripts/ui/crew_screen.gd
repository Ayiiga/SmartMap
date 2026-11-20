extends Control
## Accessible, scrollable 12-astronaut chooser organized into three mission roles.
const UI = preload("res://scripts/ui/space_ui.gd")
const Crew = preload("res://scripts/player/crew_catalog.gd")
var _feedback: Label
var _choices: Dictionary = {}

func _ready() -> void:
	UI.backdrop(self)
	var margin: MarginContainer = MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 35)
	margin.add_theme_constant_override("margin_right", 35)
	margin.add_theme_constant_override("margin_top", 16)
	margin.add_theme_constant_override("margin_bottom", 18)
	add_child(margin)
	var layout: VBoxContainer = VBoxContainer.new()
	layout.add_theme_constant_override("separation", 8)
	margin.add_child(layout)
	layout.add_child(UI.label("CHOOSE YOUR ASTRONAUT", 32))
	layout.add_child(UI.label("Pick a name from any of the three roles. Everyone is unlocked; your choice is saved offline.", 16, UI.MUTED))
	var scrolling: ScrollContainer = ScrollContainer.new()
	scrolling.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scrolling.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	layout.add_child(scrolling)
	var groups: VBoxContainer = VBoxContainer.new()
	groups.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	groups.add_theme_constant_override("separation", 10)
	scrolling.add_child(groups)
	for role: String in Crew.GROUPS:
		groups.add_child(UI.label(role.to_upper(), 19, UI.ACCENT))
		var grid: GridContainer = GridContainer.new()
		grid.columns = 4
		grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		grid.add_theme_constant_override("h_separation", 9)
		grid.add_theme_constant_override("v_separation", 8)
		groups.add_child(grid)
		for crew_id: String in Crew.GROUPS[role]:
			var profile: Dictionary = Crew.profile_for(crew_id)
			var card: PanelContainer = UI.panel()
			card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			grid.add_child(card)
			var stack: VBoxContainer = VBoxContainer.new()
			stack.add_theme_constant_override("separation", 5)
			card.add_child(stack)
			var suit_band: ColorRect = ColorRect.new()
			suit_band.color = Color(str(profile["suit"]))
			suit_band.custom_minimum_size = Vector2(150, 15)
			stack.add_child(suit_band)
			stack.add_child(UI.label(str(profile["name"]), 22))
			stack.add_child(UI.label(str(profile["tip"]), 13, UI.MUTED))
			var choose: Button = UI.button("SELECT", true)
			choose.custom_minimum_size.y = 48.0
			stack.add_child(choose)
			_choices[crew_id] = choose
			choose.pressed.connect(_choose.bind(crew_id))
	_feedback = UI.label("", 17, Color("8bd9bb"))
	layout.add_child(_feedback)
	var actions: HBoxContainer = UI.row()
	layout.add_child(actions)
	var play: Button = UI.button("PLAY ROCKET / CONTINUE", true)
	actions.add_child(play)
	play.pressed.connect(_play)
	var menu: Button = UI.button("BACK TO MENU")
	actions.add_child(menu)
	menu.pressed.connect(func() -> void: get_tree().change_scene_to_file(GameState.MENU))
	_refresh()

func _play() -> void:
	if GameState.can_continue():
		GameState.continue_game()
	else:
		GameState.new_rocket_game()

func _choose(crew_id: String) -> void:
	GameState.set_astronaut(crew_id)
	_refresh()

func _refresh() -> void:
	var chosen: Dictionary = Crew.profile_for(GameState.selected_astronaut)
	_feedback.text = "%s (%s) selected — saved on this device." % [str(chosen["name"]), str(chosen["role"])]
	for crew_id: String in _choices:
		var button: Button = _choices[crew_id] as Button
		button.text = "SELECTED" if crew_id == GameState.selected_astronaut else "SELECT"
		button.disabled = crew_id == GameState.selected_astronaut

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		get_tree().change_scene_to_file(GameState.MENU)
