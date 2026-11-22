extends Control
## Landscape mission hub: three-person crew, earned rewards and planet progression.
const UI = preload("res://scripts/ui/space_ui.gd")

func _ready() -> void:
	UI.backdrop(self)
	var margins: MarginContainer = MarginContainer.new()
	margins.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for edge: String in ["left", "right", "top", "bottom"]:
		margins.add_theme_constant_override("margin_%s" % edge, 26)
	add_child(margins)
	var layout: HBoxContainer = HBoxContainer.new()
	layout.add_theme_constant_override("separation", 24)
	margins.add_child(layout)
	var left: VBoxContainer = VBoxContainer.new()
	left.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	left.add_theme_constant_override("separation", 15)
	layout.add_child(left)
	left.add_child(UI.label("GigaOrbit", 52, Color("f5f8ff")))
	left.add_child(UI.label("BEYOND EARTH  ·  LAUNCH. EXPLORE. DISCOVER.", 18, Color("81cfff")))
	var summary: PanelContainer = UI.panel()
	left.add_child(summary)
	var details: VBoxContainer = VBoxContainer.new()
	details.add_theme_constant_override("separation", 9)
	summary.add_child(details)
	details.add_child(UI.label("YOUR 3-PERSON SPACE CREW", 21, Color("eac875")))
	for role: String in ["Flight Cadets", "Rocket Pilots", "Science Explorers"]:
		var name: String = str(GameState.crew_slots.get(role, "")).capitalize()
		details.add_child(UI.label("%s    %s" % [role.to_upper(), name], 18, UI.ACCENT))
	left.add_child(UI.label("GAME COINS  %d    ·    SCIENCE  %d" % [GameState.coins, GameState.science_points], 25, Color("f7c95c")))
	var roadmap: PanelContainer = UI.panel()
	left.add_child(roadmap)
	var path: VBoxContainer = VBoxContainer.new()
	path.add_theme_constant_override("separation", 10)
	roadmap.add_child(path)
	path.add_child(UI.label("EXPLORE THE SOLAR SYSTEM", 22, UI.ACCENT))
	path.add_child(UI.label("EARTH ✓" if GameState.flight_complete else "EARTH  ·  LAUNCH FIRST", 19, Color("a5ecce") if GameState.flight_complete else UI.MUTED))
	path.add_child(UI.label("MOON  ·  %s" % ("LANDED · Grade " + str(GameState.landing_grades.get("moon", "C")) if GameState.completed_planets.get("moon", false) else "UNLOCKED AFTER ORBIT" if GameState.flight_complete else "LOCKED"), 20, Color("f5d477")))
	path.add_child(UI.label("MARS  ·  %s" % ("LANDED · Grade " + str(GameState.landing_grades.get("mars", "C")) if GameState.completed_planets.get("mars", false) else "READY" if GameState.planet_unlocked("mars") else "UPGRADE ENGINE + LANDING GEAR"), 19, Color("d8a48b")))
	path.add_child(UI.label("JUPITER'S MOONS  ·  SATURN  ·  BEYOND  ·  PLANNED", 16, UI.MUTED))
	left.add_child(UI.label("Launch  →  Moon landing  →  Upgrade  →  Mars landing", 18, Color("9de7ed")))
	var panel: PanelContainer = UI.panel()
	panel.custom_minimum_size.x = 365
	layout.add_child(panel)
	var buttons_scroll: ScrollContainer = ScrollContainer.new()
	buttons_scroll.custom_minimum_size = Vector2(320, 590)
	buttons_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	panel.add_child(buttons_scroll)
	var buttons: VBoxContainer = VBoxContainer.new()
	buttons.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	buttons.add_theme_constant_override("separation", 8)
	buttons_scroll.add_child(buttons)
	_add(buttons, "1  ASSEMBLE 3 ASTRONAUTS", true, func() -> void: _open("crew_screen"))
	_add(buttons, "2  LAUNCH ROCKET", true, func() -> void: GameState.new_rocket_game())
	var moon: Button = _add(buttons, "3  FLY TO THE MOON", GameState.flight_complete, func() -> void: GameState.begin_transfer("moon"))
	moon.disabled = not GameState.flight_complete
	var mars: Button = _add(buttons, "4  FLY TO MARS", GameState.planet_unlocked("mars"), func() -> void: GameState.begin_transfer("mars"))
	mars.disabled = not GameState.planet_unlocked("mars")
	var eva: Button = _add(buttons, "MOON SURFACE · ASTRONAUT EVA", false, func() -> void: GameState.begin_moon_eva())
	eva.disabled = not bool(GameState.completed_planets.get("moon", false))
	_add(buttons, "ROCKET WORKSHOP / UPGRADES", false, func() -> void: _open("workshop_screen"))
	_add(buttons, "TROPHIES / GRADES / REWARDS", false, func() -> void: _open("rewards_screen"))
	var resume: Button = _add(buttons, "CONTINUE SAVED MISSION", false, func() -> void: GameState.continue_game())
	resume.disabled = not GameState.can_continue()
	_add(buttons, "MISSIONS / PLANET MAP", false, func() -> void: _open("missions_screen"))
	_add(buttons, "COMET DODGING", false, func() -> void: GameState.start_comet_mission()).disabled = not GameState.flight_complete
	_add(buttons, "EARTH TRAINING (OPTIONAL)", false, func() -> void: GameState.new_game())
	_add(buttons, "MUSIC / SOUND / SETTINGS", false, func() -> void: _open("settings_screen"))
	_add(buttons, "EXIT", false, func() -> void: get_tree().quit())
	buttons.add_child(UI.label("All rewards are virtual · No cash payouts · No internet", 13, UI.MUTED))

func _add(parent: VBoxContainer, caption: String, primary: bool, callback: Callable) -> Button:
	var action: Button = UI.button(caption, primary)
	parent.add_child(action)
	action.pressed.connect(callback)
	return action

func _open(scene_name: String) -> void:
	get_tree().change_scene_to_file("res://scenes/ui/%s.tscn" % scene_name)

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		get_tree().quit()
