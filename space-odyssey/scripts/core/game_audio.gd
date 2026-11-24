extends Node
## Original, entirely offline African-inspired rhythm and spacecraft audio.
## No copyrighted samples, network calls or external audio dependencies.
signal radio_message(message: String)

const THEME_PATH: String = "res://assets/audio/afro_space_theme.ogg"
const RATE: int = 16000
const BPM: float = 104.0
var _music: AudioStreamPlayer
var _sfx: Array[AudioStreamPlayer] = []
var _sound_cache: Dictionary = {}
var _next_sfx: int = 0
var _last_radio: String = ""
var _speech_enabled: bool = false

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_music = AudioStreamPlayer.new()
	_music.name = "OriginalRhythmLoop"
	add_child(_music)
	var theme := load(THEME_PATH) as AudioStreamOggVorbis
	if theme != null:
		theme.loop = true
	_music.stream = theme
	if _music.stream == null:
		push_warning("Original African-inspired music is unavailable; game will continue without music.")
	for i: int in range(4):
		var player: AudioStreamPlayer = AudioStreamPlayer.new()
		player.name = "Effects%d" % i
		add_child(player)
		_sfx.append(player)
	for sound: String in ["launch", "stage", "warning", "impact", "dodge", "success", "scan", "radio"]:
		_sound_cache[sound] = _make_effect(sound)
	GameState.settings_changed.connect(sync_settings)
	sync_settings()

func sync_settings() -> void:
	if _music == null:
		return
	var prefs: Dictionary = GameState.settings
	_music.volume_db = linear_to_db(float(prefs.get("music_volume", 0.30)))
	if bool(prefs.get("music_enabled", true)) and _music.stream != null:
		if not _music.playing:
			_music.play()
	else:
		_music.stop()
	var effects_on: bool = bool(prefs.get("sound_enabled", true))
	for player: AudioStreamPlayer in _sfx:
		player.volume_db = linear_to_db(float(prefs.get("sound_volume", 0.65)))
		if not effects_on:
			player.stop()
	var speech_on: bool = bool(prefs.get("voice_enabled", true))
	if _speech_enabled and not speech_on:
		DisplayServer.tts_stop()
	_speech_enabled = speech_on

func effect(name: String) -> void:
	if not bool(GameState.settings.get("sound_enabled", true)) or _sfx.is_empty():
		return
	var player: AudioStreamPlayer = _sfx[_next_sfx % _sfx.size()]
	_next_sfx += 1
	player.stop()
	player.stream = _sound_cache.get(name, _sound_cache["radio"]) as AudioStreamWAV
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

func _make_effect(name: String) -> AudioStreamWAV:
	var duration: float = 0.76 if name == "launch" else (0.43 if name in ["impact", "success"] else 0.24)
	var samples: int = roundi(float(RATE) * duration)
	var pcm: PackedByteArray = PackedByteArray()
	pcm.resize(samples * 2)
	var random := RandomNumberGenerator.new()
	random.seed = 84017 + name.hash()
	var filtered_noise: float = 0.0
	var phase: float = 0.0
	for i: int in range(samples):
		var t: float = float(i) / float(RATE)
		var attack: float = minf(1.0, t * (10.0 if name == "launch" else 140.0))
		var fade: float = attack * pow(maxf(0.0, 1.0 - t / duration), 1.35)
		var tone: float = 660.0
		var noise_mix: float = 0.07
		match name:
			"launch":
				tone = 44.0 + t * 53.0
				noise_mix = 0.84
			"stage":
				tone = 230.0 - t * 290.0
				noise_mix = 0.44
			"warning": tone = 780.0 if fposmod(t, 0.12) < 0.06 else 535.0
			"impact":
				tone = 55.0 - t * 55.0
				noise_mix = 0.73
			"dodge": tone = 420.0 + t * 1150.0
			"success": tone = 523.25 if t < 0.10 else (659.25 if t < 0.20 else 783.99)
			"scan": tone = 570.0 + 65.0 * sin(TAU * 15.0 * t)
			"radio": tone = 970.0 if t < 0.08 else 715.0
		filtered_noise = lerpf(filtered_noise, random.randf_range(-1.0, 1.0), 0.15)
		phase += TAU * tone / float(RATE)
		var harmonic: float = sin(phase) * 0.72 + sin(phase * 2.0) * 0.12
		var signal_value: float = (harmonic * (1.0 - noise_mix * 0.6) + filtered_noise * noise_mix) * fade * 0.64
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

