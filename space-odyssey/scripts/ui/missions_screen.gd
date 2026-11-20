extends Control
const UI = preload("res://scripts/ui/space_ui.gd")

func _ready() -> void:
	var col: VBoxContainer = UI.centered_page(self, "MISSION CONTROL", "Offline mission catalogue and local progression", 850)
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
	for entry: String in ["03  Lunar Transfer — Phase 3", "04  Moon Landing — Phase 3", "05  Lunar Samples — Phase 3", "06  Mars Expedition — Future"]:
		col.add_child(UI.label("LOCKED  ·  %s" % entry, 17, UI.MUTED))
	var back: Button = UI.button("BACK")
	col.add_child(back)
	back.pressed.connect(func() -> void: get_tree().change_scene_to_file(GameState.MENU))

func _start_training() -> void:
	if GameState.can_continue() and not GameState.training_complete:
		GameState.continue_game()
	else:
		GameState.restart_training()
