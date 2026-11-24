extends RefCounted
## Versioned offline JSON save with checksum, temporary-write, and recoverable backup.
const FILE_PATH: String = "user://odyssey_save.json"
const TEMP_PATH: String = "user://odyssey_save.tmp"
const BACKUP_PATH: String = "user://odyssey_save.backup.json"
const VERSION: int = 1

static func available() -> bool:
	return not load_data().is_empty()

static func load_data() -> Dictionary:
	var main: Dictionary = _read_verified(FILE_PATH)
	if not main.is_empty():
		return main
	return _read_verified(BACKUP_PATH)

static func save_data(payload: Dictionary) -> bool:
	var serialized: String = JSON.stringify(payload)
	var wrapper: Dictionary = {
		"save_version": VERSION,
		"checksum": serialized.sha256_text(),
		"payload": payload
	}
	var file: FileAccess = FileAccess.open(TEMP_PATH, FileAccess.WRITE)
	if file == null:
		push_error("Save open failed: %d" % FileAccess.get_open_error())
		return false
	file.store_string(JSON.stringify(wrapper))
	file.flush()
	file.close()
	if not _read_verified(FILE_PATH).is_empty():
		var copy_result: Error = DirAccess.copy_absolute(FILE_PATH, BACKUP_PATH)
		if copy_result != OK:
			push_warning("Could not update previous checkpoint backup")
	var swap_result: Error = DirAccess.rename_absolute(TEMP_PATH, FILE_PATH)
	if swap_result != OK:
		push_error("Atomic save replacement failed: %d" % swap_result)
		return false
	return true

static func write_checkpoint(path: String, payload: Dictionary) -> bool:
	var temporary: String = path + ".tmp"
	var file: FileAccess = FileAccess.open(temporary, FileAccess.WRITE)
	if file == null:
		push_warning("Could not open mission checkpoint for writing.")
		return false
	file.store_string(JSON.stringify(payload))
	file.flush()
	var write_error: Error = file.get_error()
	file.close()
	if write_error != OK or DirAccess.rename_absolute(temporary, path) != OK:
		push_warning("Could not replace mission checkpoint.")
		return false
	return true

static func delete_all_saves() -> void:
	for path: String in [FILE_PATH, BACKUP_PATH, TEMP_PATH]:
		if FileAccess.file_exists(path):
			DirAccess.remove_absolute(path)

static func _read_verified(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {}
	var file: FileAccess = FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}
	var raw: String = file.get_as_text()
	file.close()
	var parsed: Variant = JSON.parse_string(raw)
	if not parsed is Dictionary:
		return {}
	var envelope: Dictionary = parsed
	if int(envelope.get("save_version", -1)) != VERSION:
		return {}
	var payload: Variant = envelope.get("payload")
	if not payload is Dictionary:
		return {}
	var computed: String = JSON.stringify(payload).sha256_text()
	if str(envelope.get("checksum", "")) != computed:
		return {}
	return payload
