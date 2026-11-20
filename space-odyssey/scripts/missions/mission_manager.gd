extends Node
## Data-driven mission definitions and progression in Phase 1.
const TRAINING_PATH: String = "res://resources/missions/training.json"
const LAUNCH_PATH: String = "res://resources/missions/launch.json"
const COMET_PATH: String = "res://resources/missions/comet_001.json"
var missions: Dictionary = {}

func _ready() -> void:
	var file: FileAccess = FileAccess.open(TRAINING_PATH, FileAccess.READ)
	if file == null:
		push_error("Missing training mission config")
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	if parsed is Dictionary:
		missions[str(parsed.get("id", "training_001"))] = parsed
	var launch: FileAccess = FileAccess.open(LAUNCH_PATH, FileAccess.READ)
	if launch != null:
		var data: Variant = JSON.parse_string(launch.get_as_text())
		launch.close()
		if data is Dictionary:
			missions[str(data.get("id", "launch_001"))] = data
	var comet_file: FileAccess = FileAccess.open(COMET_PATH, FileAccess.READ)
	if comet_file != null:
		var comet_data: Variant = JSON.parse_string(comet_file.get_as_text())
		comet_file.close()
		if comet_data is Dictionary:
			missions[str(comet_data.get("id", "comet_001"))] = comet_data

func flight_objective() -> String:
	if GameState.flight_complete:
		return "Earth orbit reached — +150 science points"
	var mission: Dictionary = missions.get("launch_001", {})
	var objectives: Array = mission.get("objectives", [])
	if GameState.flight_step < objectives.size():
		return str(objectives[GameState.flight_step].get("text", "Prepare your rocket"))
	return "Prepare to orbit"

func training_objective() -> String:
	if GameState.training_complete:
		return "Training completed — +50 science points"
	var mission: Dictionary = missions.get("training_001", {})
	var objectives: Array = mission.get("objectives", [])
	if GameState.objective_index < objectives.size():
		return str(objectives[GameState.objective_index].get("text", "Explore the base"))
	return "Explore the training base"

func record_event(event_name: String) -> bool:
	var objective_ids: Array[String] = ["player_near_beacon", "interact_sample", "interact_spacecraft"]
	if GameState.training_complete:
		return false
	if GameState.objective_index >= objective_ids.size():
		return false
	if event_name != objective_ids[GameState.objective_index]:
		return false
	GameState.mark_objective(GameState.objective_index)
	return true
