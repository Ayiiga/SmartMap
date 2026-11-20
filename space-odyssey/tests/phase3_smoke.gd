extends SceneTree
## Headless asset smoke check. This --script mode does not initialize project
## autoload singletons; the preceding Godot --editor import validates game scripts.
## Tests the actual offline imported music resource without loading UI dependencies.

func _initialize() -> void:
	call_deferred("_check")

func _check() -> void:
	var errors: Array[String] = []
	var soundtrack: AudioStream = load("res://assets/audio/afro_space_theme.wav") as AudioStream
	if soundtrack == null:
		errors.append("Original offline African-inspired music WAV not imported")
	elif soundtrack.get_length() < 8.0:
		errors.append("Original offline soundtrack truncated")
	var mission_file: FileAccess = FileAccess.open("res://resources/missions/comet_001.json", FileAccess.READ)
	if mission_file == null:
		errors.append("Comet mission configuration missing")
	else:
		var mission_data: Variant = JSON.parse_string(mission_file.get_as_text())
		mission_file.close()
		if not mission_data is Dictionary:
			errors.append("Invalid comet mission JSON")
		elif int(mission_data.get("success_conditions", {}).get("min_dodged", 0)) != 8:
			errors.append("Comet clear objective must require eight dodges")
	for message: String in errors:
		push_error(message)
	if not errors.is_empty():
		quit(1)
		return
	print("PASS: Bundled original WAV music, offline mission data, safe Godot resource loading")
	quit(0)
