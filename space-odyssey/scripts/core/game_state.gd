extends Node
## Single owner for local profile, unlocks and settings. No network calls.
signal progress_changed
signal settings_changed

const SaveStore = preload("res://scripts/core/save_store.gd")
const Crew = preload("res://scripts/player/crew_catalog.gd")
const MENU: String = "res://scenes/ui/main_menu.tscn"
const TRAINING: String = "res://scenes/world/training_world.tscn"
const FLIGHT: String = "res://scenes/world/launch_world.tscn"
const TRANSFER: String = "res://scenes/world/planet_transfer.tscn"
const LANDING: String = "res://scenes/world/planet_landing.tscn"
const COMETS: String = "res://scenes/world/comet_field.tscn"
const DEFAULT_SETTINGS: Dictionary = {
	"graphics": 0,
	"target_fps": 30,
	"volume": 0.70,
	"music_enabled": true,
	"music_volume": 0.35,
	"sound_enabled": true,
	"sound_volume": 0.65,
	"voice_enabled": true,
	"camera_inverted": false,
	"assisted_controls": true,
	"debug_overlay": false
}

## Three permanent crew roles and one pilot-controlled lander.
var crew_slots: Dictionary = {"Flight Cadets": "nambe", "Rocket Pilots": "ayiiga", "Science Explorers": "zuuri"}
var crew_confirmed: bool = false
var coins: int = 250
var completed_planets: Dictionary = {"moon": false, "mars": false}
var landing_grades: Dictionary = {}
var landing_attempts: Dictionary = {"moon": 0, "mars": 0}
var badges: Array[String] = []
var upgrades: Dictionary = {"engine": 1, "fuel": 1, "landing_gear": 1}
var destination_planet: String = "moon"
var landing_checkpoint: Dictionary = {}
var checkpoint_revive: bool = false
var comet_best: int = 0
var comet_completed: bool = false
var comet_clear_count: int = 0
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

func planet_unlocked(planet: String) -> bool:
	if planet == "moon":
		return flight_complete or flight_rewards_claimed
	if planet == "mars":
		return bool(completed_planets.get("moon", false)) and int(upgrades.get("engine", 1)) >= 2 and int(upgrades.get("landing_gear", 1)) >= 2
	return false

func can_upgrade(part: String) -> bool:
	return upgrades.has(part) and int(upgrades[part]) < 3 and coins >= upgrade_price(part)

func upgrade_price(part: String) -> int:
	var base: Dictionary = {"engine": 500, "fuel": 260, "landing_gear": 350}
	return int(base.get(part, 100000)) * int(upgrades.get(part, 1))

func buy_upgrade(part: String) -> bool:
	if not can_upgrade(part):
		return false
	coins -= upgrade_price(part)
	upgrades[part] = int(upgrades[part]) + 1
	save_local()
	progress_changed.emit()
	return true

func confirm_crew() -> bool:
	if not ready_crew():
		return false
	crew_confirmed = true
	save_local()
	return true

func assign_crew(role: String, crew_id: String) -> bool:
	if not Crew.GROUPS.has(role):
		return false
	if crew_id not in Crew.GROUPS[role]:
		return false
	crew_slots[role] = crew_id
	crew_confirmed = false
	if role == "Flight Cadets":
		selected_astronaut = crew_id
	for role: String in Crew.GROUPS:
		if crew_id in Crew.GROUPS[role]:
			crew_slots[role] = crew_id
	save_local()
	progress_changed.emit()
	return true

func ready_crew() -> bool:
	for role: String in Crew.GROUPS:
		if not crew_slots.has(role) or str(crew_slots[role]) not in Crew.GROUPS[role]:
			return false
	return true

func pilot_name() -> String:
	return str(Crew.profile_for(str(crew_slots.get("Rocket Pilots", "ayiiga")))["name"])

func begin_transfer(planet: String) -> bool:
	if not ready_crew() or not planet_unlocked(planet):
		return false
	destination_planet = planet
	current_mission = "transfer_" + planet
	checkpoint_revive = false
	active_session = true
	has_started = true
	save_local()
	get_tree().change_scene_to_file(TRANSFER)
	return true

func begin_landing(planet: String, using_checkpoint: bool = false) -> bool:
	if not planet_unlocked(planet) or not ready_crew():
		return false
	destination_planet = planet
	current_mission = "landing_" + planet
	checkpoint_revive = using_checkpoint
	if not using_checkpoint:
		landing_checkpoint = {}
	landing_attempts[planet] = int(landing_attempts.get(planet, 0)) + 1
	active_session = true
	has_started = true
	save_local()
	get_tree().change_scene_to_file(LANDING)
	return true

func save_landing_checkpoint(snapshot: Dictionary) -> void:
	if snapshot.is_empty():
		return
	var updated: Dictionary = snapshot.duplicate(true)
	updated["planet"] = destination_planet
	landing_checkpoint = updated
	save_local()

func can_revive(planet: String) -> bool:
	return coins >= 150 and str(landing_checkpoint.get("planet", "")) == planet and not landing_checkpoint.is_empty()

func revive_lander(planet: String) -> bool:
	if not can_revive(planet) or not planet_unlocked(planet):
		return false
	coins -= 150
	return begin_landing(planet, true)

func award_landing(planet: String, grade: String, soft_landing: bool) -> void:
	if not soft_landing or planet not in ["moon", "mars"]:
		return
	var score: Dictionary = {"S": 5, "A+": 4, "A": 3, "B": 2, "C": 1}
	var prior: String = str(landing_grades.get(planet, ""))
	if score.get(grade, 0) > score.get(prior, 0):
		landing_grades[planet] = grade
	if not bool(completed_planets.get(planet, false)):
		completed_planets[planet] = true
		var mission: Dictionary = MissionManager.missions.get("landing_" + planet, {})
		var rewards: Dictionary = mission.get("first_clear_reward", {})
		coins += int(rewards.get("coins", 800 if planet == "moon" else 1400))
		science_points += int(rewards.get("science_points", 350 if planet == "moon" else 600))
		var title: String = str(rewards.get("badge", "Lunar Explorer" if planet == "moon" else "Mars Pathfinder"))
		if title not in badges:
			badges.append(title)
	else:
		coins += 50
	save_local()
	progress_changed.emit()

func new_game() -> void:
	# Optional training replay must not erase previously earned grades, coins or unlocks.
	current_mission = "training_001"
	objective_index = 0
	training_complete = false
	checkpoint_position = [0.0, 1.5, 10.0]
	# Player workshop designs are deliberately preserved across a new training run.
	active_session = true
	has_started = true
	save_local()
	get_tree().change_scene_to_file(TRAINING)

## One-tap first flight. Training remains an optional learning mission.
func new_rocket_game() -> void:
	if not crew_confirmed:
		get_tree().change_scene_to_file("res://scenes/ui/crew_screen.tscn")
		return
	current_mission = "launch_001"
	flight_step = 0
	# A replay does not take away an already earned orbit or completed planet.
	flight_complete = flight_complete or flight_rewards_claimed
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
	var destination: String = TRAINING
	if current_mission == "launch_001":
		destination = FLIGHT
	elif current_mission == "comet_001" and flight_complete:
		destination = COMETS
	elif current_mission.begins_with("landing_") and planet_unlocked(destination_planet):
		if str(landing_checkpoint.get("planet", "")) == destination_planet:
			checkpoint_revive = true
		destination = LANDING
	elif current_mission.begins_with("transfer_") and planet_unlocked(destination_planet):
		destination = TRANSFER
	get_tree().change_scene_to_file(destination)
	return true

func can_continue() -> bool:
	return bool(SaveStore.load_data().get("has_started", false))

func save_local() -> bool:
	var payload: Dictionary = {
		"profile": profile_name,
		"crew_slots": crew_slots,
		"crew_confirmed": crew_confirmed,
		"coins": coins,
		"completed_planets": completed_planets,
		"landing_grades": landing_grades,
		"landing_attempts": landing_attempts,
		"badges": badges,
		"upgrades": upgrades,
		"destination_planet": destination_planet,
		"landing_checkpoint": landing_checkpoint,
		"comet_best": comet_best,
		"comet_completed": comet_completed,
		"comet_clear_count": comet_clear_count,
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
	var saved_crew: Variant = data.get("crew_slots", {})
	if saved_crew is Dictionary:
		for role: String in Crew.GROUPS:
			var member_id: String = str(saved_crew.get(role, crew_slots[role]))
			if member_id in Crew.GROUPS[role]:
				crew_slots[role] = member_id
	crew_confirmed = bool(data.get("crew_confirmed", false))
	coins = maxi(0, int(data.get("coins", 250)))
	var saved_completions: Variant = data.get("completed_planets", {})
	if saved_completions is Dictionary:
		for planet: String in ["moon", "mars"]:
			completed_planets[planet] = bool(saved_completions.get(planet, false))
	var grades_data: Variant = data.get("landing_grades", {})
	if grades_data is Dictionary:
		landing_grades = grades_data
	var attempts_data: Variant = data.get("landing_attempts", {})
	if attempts_data is Dictionary:
		landing_attempts = attempts_data
	var badges_data: Variant = data.get("badges", [])
	if badges_data is Array:
		badges.clear()
		for item: Variant in badges_data:
			badges.append(str(item))
	var saved_upgrades: Variant = data.get("upgrades", {})
	if saved_upgrades is Dictionary:
		for item: String in upgrades:
			upgrades[item] = clampi(int(saved_upgrades.get(item, 1)), 1, 3)
	destination_planet = str(data.get("destination_planet", "moon"))
	var recovered_landing: Variant = data.get("landing_checkpoint", {})
	if recovered_landing is Dictionary:
		landing_checkpoint = recovered_landing
	comet_best = maxi(0, int(data.get("comet_best", 0)))
	comet_completed = bool(data.get("comet_completed", false))
	comet_clear_count = maxi(0, int(data.get("comet_clear_count", 0)))
	selected_astronaut = Crew.normalize_id(str(data.get("selected_astronaut", "nambe")))
	# Legacy single-astronaut profiles become the cadet role automatically.
	if not data.has("crew_slots"):
		crew_slots["Flight Cadets"] = selected_astronaut if selected_astronaut in Crew.GROUPS["Flight Cadets"] else "nambe"
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
		flight_complete = flight_complete or flight_rewards_claimed
		flight_checkpoint = {}
	# Reward protection deliberately survives retries.
	has_started = true
	active_session = true
	save_local()
	get_tree().change_scene_to_file(FLIGHT)

func record_flight_step(new_step: int) -> void:
	if new_step != flight_step + 1:
		return
	flight_step = new_step
	if flight_step == 3:
		flight_complete = true
		if not flight_rewards_claimed:
			science_points += 150
			coins += 300
			if "Earth Orbiter" not in badges:
				badges.append("Earth Orbiter")
			flight_rewards_claimed = true
	save_local()
	progress_changed.emit()

func start_comet_mission() -> void:
	if not flight_complete:
		return
	current_mission = "comet_001"
	active_session = true
	has_started = true
	save_local()
	get_tree().change_scene_to_file(COMETS)

func record_comet_result(dodged: int, cleared: bool) -> void:
	comet_best = maxi(comet_best, maxi(0, dodged))
	if cleared:
		comet_clear_count += 1
		if not comet_completed:
			comet_completed = true
			science_points += 80
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
	AudioServer.set_bus_volume_db(AudioServer.get_bus_index("Master"), linear_to_db(maxf(0.001, float(settings.get("volume", 0.7)))))
	var quality: int = clampi(int(settings.get("graphics", 0)), 0, 2)
	get_tree().root.scaling_3d_scale = [0.70, 0.85, 1.0][quality]
	get_tree().root.msaa_3d = Viewport.MSAA_2X if quality == 2 else Viewport.MSAA_DISABLED
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
	crew_slots = {"Flight Cadets": "nambe", "Rocket Pilots": "ayiiga", "Science Explorers": "zuuri"}
	crew_confirmed = false
	coins = 250
	completed_planets = {"moon": false, "mars": false}
	landing_grades = {}
	landing_attempts = {"moon": 0, "mars": 0}
	badges = []
	upgrades = {"engine": 1, "fuel": 1, "landing_gear": 1}
	destination_planet = "moon"
	landing_checkpoint = {}
	checkpoint_revive = false
	science_points = 0
	comet_best = 0
	comet_completed = false
	comet_clear_count = 0
	active_session = false
	has_started = false
	progress_changed.emit()
