extends Node
## Original, entirely offline African-inspired rhythm and spacecraft audio.
## No copyrighted samples, network calls or external audio dependencies.
signal radio_message(message: String)

const THEME_PATH: String = "res://assets/audio/afro_space_theme.wav"
const RATE: int = 16000
const BPM: float = 104.0
var _music: AudioStreamPlayer
var _sfx: Array[AudioStreamPlayer] = []
var _sound_cache: Dictionary = {}
var _next_sfx: int = 0
var _last_radio: String = ""

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_music = AudioStreamPlayer.new()
	_music.name = "OriginalRhythmLoop"
	add_child(_music)
	_music.stream = load(THEME_PATH) as AudioStream
	if _music.stream == null:
		push_warning("Original African-inspired music is unavailable; game will continue without music.")
	_music.finished.connect(_music_finished)
	for i: int in range(4):
		var player: AudioStreamPlayer = AudioStreamPlayer.new()
		player.name = "Effects%d" % i
		add_child(player)
		_sfx.append(player)
	GameState.settings_changed.connect(sync_settings)
	sync_settings()

func sync_settings() -> void:
	if _music == null:
		return
	var prefs: Dictionary = GameState.settings
	_music.volume_db = linear_to_db(maxf(0.001, float(prefs.get("music_volume", 0.30))))
	if bool(prefs.get("music_enabled", true)) and _music.stream != null:
		if not _music.playing:
			_music.play()
	else:
		_music.stop()
	for player: AudioStreamPlayer in _sfx:
		player.volume_db = linear_to_db(maxf(0.001, float(prefs.get("sound_volume", 0.65))))

func effect(name: String) -> void:
	if not bool(GameState.settings.get("sound_enabled", true)) or _sfx.is_empty():
		return
	if not _sound_cache.has(name):
		_sound_cache[name] = _make_effect(name)
	var player: AudioStreamPlayer = _sfx[_next_sfx % _sfx.size()]
	_next_sfx += 1
	player.stop()
	player.stream = _sound_cache[name] as AudioStreamWAV
	player.play()

func communicate(message: String, urgent: bool = false) -> void:
	_last_radio = message
	radio_message.emit(message)
	effect("warning" if urgent else "radio")
	if not bool(GameState.settings.get("voice_enabled", true)):
		return
	var voices: PackedStringArray = DisplayServer.tts_get_voices_for_language("en")
	if not voices.is_empty():
		DisplayServer.tts_speak(message, voices[0], clampi(roundi(float(GameState.settings.get("voice_volume", 0.8)) * 100.0), 0, 100), 1.0, 1.05, 0, true)
	# No installed offline voice? Subtitles and synthetic radio chimes still work.

func repeat_radio() -> void:
	if _last_radio.is_empty():
		communicate("Mission Control standing by. Select SCAN or request a status report.")
	else:
		communicate(_last_radio)

func speech_supported() -> bool:
	return not DisplayServer.tts_get_voices_for_language("en").is_empty()

func _music_finished() -> void:
	# Loop even when a device imports the WAV as a non-looping stream.
	if bool(GameState.settings.get("music_enabled", true)) and not _music.playing:
		_music.play()

func _make_effect(name: String) -> AudioStreamWAV:
	var duration: float = 0.42 if name == "launch" else 0.22
	var samples: int = roundi(float(RATE) * duration)
	var pcm: PackedByteArray = PackedByteArray()
	pcm.resize(samples * 2)
	for i: int in range(samples):
		var t: float = float(i) / float(RATE)
		var fade: float = maxf(0.0, 1.0 - t / duration)
		var tone: float = 660.0
		match name:
			"launch": tone = 65.0 + t * 270.0
			"stage": tone = 280.0 + t * 620.0
			"warning": tone = 920.0 if fposmod(t, 0.13) < 0.065 else 540.0
			"impact": tone = 100.0 - t * 60.0
			"dodge": tone = 480.0 + t * 280.0
			"success": tone = 520.0 + t * 900.0
			"scan": tone = 440.0 + t * 400.0
			_: tone = 660.0
		var signal_value: float = (sin(TAU * tone * t) * 0.75 + sin(TAU * tone * 1.5 * t) * 0.16) * fade * 0.36
		var raw_sample: int = clampi(roundi(signal_value * 32767.0), -32768, 32767)
		pcm[i * 2] = raw_sample & 255
		pcm[i * 2 + 1] = (raw_sample >> 8) & 255
	return _stream(pcm, samples)

func _stream(raw: PackedByteArray, samples: int) -> AudioStreamWAV:
	var audio: AudioStreamWAV = AudioStreamWAV.new()
	audio.format = AudioStreamWAV.FORMAT_16_BITS
	audio.mix_rate = RATE
	audio.stereo = false
	audio.data = raw
	audio.loop_end = samples
	return audio

