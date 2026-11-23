extends Control
const UI = preload("res://scripts/ui/space_ui.gd")

func _ready() -> void:
	var col: VBoxContainer = _scroll_page()
	col.add_child(UI.label("GIGAORBIT MISSION CONTROL", 30, UI.ACCENT))
	col.add_child(UI.label("Choose a mission, or let the game select your next unlocked adventure.", 16, UI.MUTED))
	var auto: Button = UI.button("AUTO CHOOSE PHOTO MISSION", true)
	col.add_child(auto)
	auto.pressed.connect(_start_auto_photo)
	var photo: Button = UI.button("EARTH TO MOON · PHOTOGRAPHIC 2.5D")
	col.add_child(photo)
	photo.pressed.connect(_start_photo)
	col.add_child(UI.separator())
	var mission: Dictionary = MissionManager.missions.get("training_001", {})
	col.add_child(UI.label("01  ·  %s" % str(mission.get("title", "Astronaut Training")), 25, UI.ACCENT))
	col.add_child(UI.label("Destination: Earth Training Base\nObjective: %s" % MissionManager.training_objective(), 17))
	col.add_child(UI.label("Status: COMPLETED" if GameState.training_complete else "Status: READY TO PLAY", 17, Color("8bd9bb")))
	var start: Button = UI.button("REPLAY TRAINING" if GameState.training_complete else "START TRAINING", true)
	col.add_child(start)
	start.pressed.connect(_start_training)
	col.add_child(UI.separator())
	col.add_child(UI.label("02  ·  TRAINER MK I  |  EARTH LAUNCH + GUIDED ORBIT", 24, UI.ACCENT))
	col.add_child(UI.label("Status: COMPLETE" if GameState.flight_complete else "READY TO LAUNCH — no training required", 17))
	var launch: Button = UI.button("REPLAY LAUNCH" if GameState.flight_complete else ("CONTINUE LAUNCH" if GameState.current_mission == "launch_001" and not GameState.flight_checkpoint.is_empty() else "START ROCKET MISSION"), true)
	col.add_child(launch)
	launch.pressed.connect(func() -> void: GameState.start_launch_mission(GameState.flight_complete))
	col.add_child(UI.separator())
	col.add_child(UI.label("03  ·  COMET CORRIDOR  |  SHIP RADIO + DODGE", 23, UI.ACCENT))
	col.add_child(UI.label("Status: %s · Best: %d safe dodges" % ["UNLOCKED" if GameState.flight_complete else "LOCKED — finish Earth orbit", GameState.comet_best], 17))
	var comets: Button = UI.button("PLAY COMET DODGE" if not GameState.comet_completed else "REPLAY COMET DODGE", true)
	comets.disabled = not GameState.flight_complete
	col.add_child(comets)
	comets.pressed.connect(func() -> void: GameState.start_comet_mission())
	col.add_child(UI.separator())
	col.add_child(UI.label("04  ·  MOON TRANSFER & PILOTED LANDING", 23, UI.ACCENT))
	var moon: Button = UI.button("FLY TO THE MOON", true)
	moon.disabled = not GameState.flight_complete
	col.add_child(moon)
	moon.pressed.connect(func() -> void: GameState.begin_transfer("moon"))
	col.add_child(UI.label("Best grade: %s" % str(GameState.landing_grades.get("moon", "Not landed yet")), 17, UI.MUTED))
	col.add_child(UI.separator())
	col.add_child(UI.label("05  ·  MARS EXPEDITION & LANDING", 23, UI.ACCENT))
	var mars: Button = UI.button("FLY TO MARS", true)
	mars.disabled = not GameState.planet_unlocked("mars")
	col.add_child(mars)
	mars.pressed.connect(func() -> void: GameState.begin_transfer("mars"))
	col.add_child(UI.label("Unlock: land on the Moon, then upgrade engine and landing gear to level 2.", 16, UI.MUTED))
	col.add_child(UI.separator())
	col.add_child(UI.label("06  ·  MOON EVA: SAMPLES, ANTENNA REPAIR, GHANA FLAG", 21, UI.ACCENT))
	var lunar: Button = UI.button("CHOOSE LUNAR FIELD TASKS")
	lunar.disabled = not bool(GameState.completed_planets.get("moon", false))
	col.add_child(lunar)
	lunar.pressed.connect(_start_photo_eva)
	col.add_child(UI.label("Unlock by landing safely on the Moon. Repair missions use virtual repair kits.", 16, UI.MUTED))
	col.add_child(UI.label("COMING LATER: Europa, Saturn, Jupiter's moons, asteroids and outer planets", 16, UI.MUTED))
	var back: Button = UI.button("BACK")
	col.add_child(back)
	back.pressed.connect(func() -> void: get_tree().change_scene_to_file(GameState.MENU))

func _scroll_page() -> VBoxContainer:
	# The old centered fixed-width page clipped mission buttons on short phones.
	UI.backdrop(self)
	var scroll: ScrollContainer = ScrollContainer.new()
	scroll.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	add_child(scroll)
	var margin: MarginContainer = MarginContainer.new()
	margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	for side: String in ["left", "right", "top", "bottom"]:
		margin.add_theme_constant_override("margin_%s" % side, 16)
	scroll.add_child(margin)
	var panel: PanelContainer = UI.panel()
	panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	margin.add_child(panel)
	var col: VBoxContainer = VBoxContainer.new()
	col.add_theme_constant_override("separation", 9)
	panel.add_child(col)
	return col

func _start_auto_photo() -> void:
	if bool(GameState.completed_planets.get("moon", false)):
		_start_photo_eva()
	else:
		_start_photo()

func _start_photo() -> void:
	GameState.current_mission = "photo_earth_moon"
	GameState.save_local()
	get_tree().change_scene_to_file(GameState.PHOTO_MISSION)

func _start_photo_eva() -> void:
	if not bool(GameState.completed_planets.get("moon", false)):
		return
	GameState.current_mission = "eva_moon"
	GameState.save_local()
	get_tree().change_scene_to_file(GameState.PHOTO_MISSION)

func _start_training() -> void:
	if GameState.can_continue() and not GameState.training_complete:
		GameState.continue_game()
	else:
		GameState.restart_training()
