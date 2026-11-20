extends Control
## All virtual awards are earned offline. No real-world cash prizes.
const UI = preload("res://scripts/ui/space_ui.gd")

func _ready() -> void:
	UI.backdrop(self)
	var margins: MarginContainer = MarginContainer.new()
	margins.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right", "top", "bottom"]:
		margins.add_theme_constant_override("margin_%s" % side, 26)
	add_child(margins)
	var root: VBoxContainer = VBoxContainer.new()
	root.add_theme_constant_override("separation", 14)
	margins.add_child(root)
	root.add_child(UI.label("ODYSSEY AWARDS  ·  YOUR SPACE JOURNEY", 35, Color("f5c768")))
	root.add_child(UI.label("Coins and prizes are game-only rewards. No real money or cash withdrawals.", 17, UI.MUTED))
	var balance: Label = UI.label("GAME COINS: %d     SCIENCE: %d" % [GameState.coins, GameState.science_points], 24, UI.ACCENT)
	root.add_child(balance)
	var scroll: ScrollContainer = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	root.add_child(scroll)
	var details: VBoxContainer = VBoxContainer.new()
	details.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	details.add_theme_constant_override("separation", 13)
	scroll.add_child(details)
	for planet: String in ["earth", "moon", "mars"]:
		var title: String = planet.to_upper()
		var status: String = "EARTH ORBIT COMPLETE" if GameState.flight_complete else "NOT REACHED"
		var grade: String = "MISSION AWARD"
		if planet != "earth":
			status = "LANDED" if bool(GameState.completed_planets.get(planet, false)) else "LOCKED / UNFINISHED"
			grade = str(GameState.landing_grades.get(planet, "—"))
		var box: PanelContainer = UI.panel()
		details.add_child(box)
		var row: HBoxContainer = UI.row()
		box.add_child(row)
		row.add_child(UI.label("%s   |   %s" % [title, status], 23, Color("f4c86a") if status in ["LANDED", "EARTH ORBIT COMPLETE"] else UI.MUTED))
		row.add_child(UI.label("BEST GRADE  %s" % grade, 22, UI.ACCENT))
		if planet != "earth":
			row.add_child(UI.label("ATTEMPTS %d" % int(GameState.landing_attempts.get(planet, 0)), 17, UI.MUTED))
	details.add_child(UI.label("TROPHIES AND BADGES", 27, Color("f4c86a")))
	if GameState.badges.is_empty():
		details.add_child(UI.label("Finish Earth orbit, the Moon landing or Mars landing to earn your first trophy.", 18, UI.MUTED))
	else:
		for badge: String in GameState.badges:
			details.add_child(UI.label("🏆  %s" % badge, 22, UI.ACCENT))
	details.add_child(UI.label("GRADES: S (stellar) · A+ · A · B · C. Grades depend on touchdown speed, drift, landing accuracy and remaining fuel.", 16, UI.MUTED))
	var buttons: HBoxContainer = UI.row()
	root.add_child(buttons)
	var workshop: Button = UI.button("UPGRADE ROCKET", true)
	buttons.add_child(workshop)
	workshop.pressed.connect(func() -> void: get_tree().change_scene_to_file("res://scenes/ui/workshop_screen.tscn"))
	var back: Button = UI.button("BACK TO MENU")
	buttons.add_child(back)
	back.pressed.connect(func() -> void: get_tree().change_scene_to_file(GameState.MENU))

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		get_tree().change_scene_to_file(GameState.MENU)
