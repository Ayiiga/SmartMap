extends Node
## Single owner for local profile, unlocks and settings. No network calls.
signal progress_changed
signal settings_changed

const SaveStore = preload("res://scripts/core/save_store.gd")
const Crew = preload("res://scripts/player/crew_catalog.gd")
const MENU: String = "res://scenes/ui/main_menu.tscn"
const TRAINING: String = "res://scenes/world/training_world.tscn"
const FLIGHT: String = "res://scenes/world/launch_world.tscn"
const DEFAULT_SETTINGS: Dictionary = {
	"graphics": 0,
	"target_fps": 30,
	"volume": 0.70,
	"camera_inverted": false,
	"assisted_controls": true,
	"debug_overlay": false
}

var profile_name: String = "Explorer"
var selected_astronaut: String = "nambe"
var flight_step: int = 0
var flight_complete: bool = false
var flight_rewards_claimed: bool = false
var flight_checkpoint: Dictionary = {}
var current_mission: String = "training_001"
var objective_index: int = 0
var training_complete: bool = false
var science_points: int = 0
var checkpoint_position: Array = [0.0, 1.5, 10.0]
var mission_rewards_claimed: bool = false
var rocket_design: Dictionary = {"fuel_tanks": 1, "boosters": 0}
var settings: Dictionary = DEFAULT_SETTINGS.duplicate(true)
var active_session: bool = false
var has_started: bool = false

func _ready() -> void:
	load_local()
	apply_settings()

func new_game() -> void:
	current_mission = "training_001"
	flight_step = 0
	flight_complete = false
	flight_rewards_claimed = false
	flight_checkpoint = {}
	objective_index = 0
	training_complete = false
	science_points = 0
	checkpoint_position = [0.0, 1.5, 10.0]
	mission_rewards_claimed = false
	# Player workshop designs are deliberately preserved across a new training run.
	active_session = true
	has_started = true
	save_local()
	get_tree().change_scene_to_file(TRAINING)

## One-tap first flight. Training remains an optional learning mission.
func new_rocket_game() -> void:
	current_mission = "launch_001"
	flight_step = 0
	flight_complete = false
	flight_checkpoint = {}
	objective_index = 0
	training_complete = false
	checkpoint_position = [0.0, 1.5, 10.0]
	active_session = true
	has_started = true
	save_local()
	get_tree().change_scene_to_file(FLIGHT)

func restart_training() -> void:
	current_mission = "training_001"
	objective_index = 0
	training_complete = false
	checkpoint_position = [0.0, 1.5, 10.0]
	active_session = true
	has_started = true
	save_local()
	get_tree().change_scene_to_file(TRAINING)

func continue_game() -> bool:
	if not can_continue():
		return false
	load_local()
	active_session = true
	get_tree().change_scene_to_file(FLIGHT if current_mission == "launch_001" else TRAINING)
	return true

func can_continue() -> bool:
	return bool(SaveStore.load_data().get("has_started", false))

func save_local() -> bool:
	var payload: Dictionary = {
		"profile": profile_name,
		"selected_astronaut": selected_astronaut,
		"flight_step": flight_step,
		"flight_complete": flight_complete,
		"flight_rewards_claimed": flight_rewards_claimed,
		"flight_checkpoint": flight_checkpoint,
		"has_started": has_started,
		"mission": current_mission,
		"objective_index": objective_index,
		"training_complete": training_complete,
		"science_points": science_points,
		"checkpoint_position": checkpoint_position,
		"mission_rewards_claimed": mission_rewards_claimed,
		"rocket_design": rocket_design,
		"settings": settings
	}
	return SaveStore.save_data(payload)

func load_local() -> void:
	var data: Dictionary = SaveStore.load_data()
	if data.is_empty():
		return
	profile_name = str(data.get("profile", "Explorer"))
	selected_astronaut = Crew.normalize_id(str(data.get("selected_astronaut", "nambe")))
	flight_step = clampi(int(data.get("flight_step", 0)), 0, 3)
	flight_complete = bool(data.get("flight_complete", false))
	flight_rewards_claimed = bool(data.get("flight_rewards_claimed", false))
	var loaded_flight: Variant = data.get("flight_checkpoint", {})
	if loaded_flight is Dictionary:
		flight_checkpoint = loaded_flight
	has_started = bool(data.get("has_started", false))
	current_mission = str(data.get("mission", "training_001"))
	objective_index = clampi(int(data.get("objective_index", 0)), 0, 3)
	training_complete = bool(data.get("training_complete", false))
	science_points = maxi(0, int(data.get("science_points", 0)))
	var saved_position: Variant = data.get("checkpoint_position", [])
	if saved_position is Array and saved_position.size() == 3:
		checkpoint_position = saved_position
	mission_rewards_claimed = bool(data.get("mission_rewards_claimed", false))
	var saved_rocket: Variant = data.get("rocket_design", {})
	if saved_rocket is Dictionary:
		rocket_design = saved_rocket
	var saved_settings: Variant = data.get("settings", {})
	if saved_settings is Dictionary:
		settings.merge(saved_settings, true)

func set_astronaut(crew_id: String) -> void:
	if crew_id not in Crew.IDS:
		return
	selected_astronaut = crew_id
	save_local()
	progress_changed.emit()

func next_astronaut() -> void:
	var ids: Array[String] = Crew.IDS
	set_astronaut(ids[(ids.find(selected_astronaut) + 1) % ids.size()])

func start_launch_mission(reset_flight: bool = false) -> void:
	# Boarding and launching are available to all players; training is optional.
	current_mission = "launch_001"
	if reset_flight or flight_checkpoint.is_empty():
		flight_step = 0
		flight_complete = false
		flight_checkpoint = {}
	# Reward protection deliberately survives retries.
	has_started = true
	active_session = true
	save_local()
	get_tree().change_scene_to_file(FLIGHT)

func record_flight_step(new_step: int) -> void:
	if new_step != flight_step + 1 or flight_complete:
		return
	flight_step = new_step
	if flight_step == 3:
		flight_complete = true
		if not flight_rewards_claimed:
			science_points += 150
			flight_rewards_claimed = true
	save_local()
	progress_changed.emit()

func save_flight_checkpoint(snapshot: Dictionary) -> void:
	flight_checkpoint = snapshot.duplicate(true)
	save_local()

func mark_objective(target_index: int) -> void:
	if objective_index != target_index or training_complete:
		return
	objective_index += 1
	if objective_index >= 3:
		training_complete = true
		if not mission_rewards_claimed:
			science_points += 50
			mission_rewards_claimed = true
	save_local()
	progress_changed.emit()

func apply_settings() -> void:
	Engine.max_fps = int(settings.get("target_fps", 30))
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Master"), linear_to_db(clampf(float(settings.get("volume", 0.7)), 0.001, 1.0)))
	settings_changed.emit()

func save_settings() -> void:
	apply_settings()
	save_local()

func save_checkpoint(position: Vector3) -> void:
	checkpoint_position = [position.x, position.y, position.z]
	save_local()

func erase_progress() -> void:
	SaveStore.delete_all_saves()
	objective_index = 0
	training_complete = false
	flight_step = 0
	flight_complete = false
	flight_rewards_claimed = false
	flight_checkpoint = {}
	selected_astronaut = "nambe"
	science_points = 0
	active_session = false
	has_started = false
	progress_changed.emit()
