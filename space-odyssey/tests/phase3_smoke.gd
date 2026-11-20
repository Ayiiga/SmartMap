extends SceneTree
## Headless resource and DSP smoke tests. Device touch/audio quality is separate QA.
const AUDIO = preload("res://scripts/core/game_audio.gd")
const COMET_SCENE = preload("res://scenes/world/comet_field.tscn")

func _initialize() -> void:
	call_deferred("_check")

func _check() -> void:
	var errors: Array[String] = []
	var sample_manager: Node = AUDIO.new()
	var rhythm: AudioStream = load("res://assets/audio/afro_space_theme.wav")
	if rhythm == null or rhythm.get_length() < 8.0:
		errors.append("Bundled original rhythmic WAV missing or too short")
	for effect_name: String in ["launch", "stage", "warning", "impact", "dodge", "success", "scan", "radio"]:
		var effect: AudioStreamWAV = sample_manager._make_effect(effect_name)
		if effect.data.is_empty() or effect.mix_rate != 16000:
			errors.append("Offline effect missing: " + effect_name)
	var scene: PackedScene = COMET_SCENE
	if scene == null:
		errors.append("Comet field scene missing")
	else:
		var encounter: Node = scene.instantiate()
		if not encounter is Node3D:
			errors.append("Comet mission is not a 3D scene")
		elif str(encounter.call("_lane_name", 0)) != "LEFT" or str(encounter.call("_lane_name", 2)) != "RIGHT":
			errors.append("Lane navigation label mismatch")
		encounter.free()
	sample_manager.free()
	for issue: String in errors:
		push_error(issue)
	if not errors.is_empty():
		quit(1)
		return
	print("PASS: Bundled original WAV music, 8 game effects, comet 3D scene and three-lane navigation")
	quit(0)
