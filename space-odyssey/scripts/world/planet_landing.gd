extends Node3D
## Offline player-piloted descent: independent Moon and Mars gravity, saved checkpoints.
const UI = preload("res://scripts/ui/space_ui.gd")
const RocketArt = preload("res://scripts/rocket/rocket_art.gd")
const Lander = preload("res://scripts/flight/odyssey_lander.gd")
const FLIGHT_STICK = preload("res://scripts/flight/flight_stick.gd")
var _sim: OdysseyLander
var _craft: Node3D
var _flame: MeshInstance3D
var _gear_nodes: Array[MeshInstance3D] = []
var _camera: Camera3D
var _world: String = "moon"
var _steering: float = 0.0
var _assisted: bool = true
var _manual_override: float = 0.0
var _checkpoint_timer: float = 0.0
var _hud: Label
var _mission: Label
var _help: Label
var _throttle: Label
var _legs_button: Button
var _fuel_button: Button
var _assist_button: Button
var _overlay: CanvasLayer
var _last_warning: String = ""
var _completed: bool = false

func _ready() -> void:
	_world = GameState.destination_planet if GameState.destination_planet in ["moon", "mars"] else "moon"
	_sim = Lander.new()
	_sim.configure(_world, int(GameState.upgrades.get("landing_gear", 1)), int(GameState.upgrades.get("engine", 1)), int(GameState.upgrades.get("fuel", 1)))
	_assisted = bool(GameState.settings.get("assisted_controls", true))
	if GameState.checkpoint_revive and str(GameState.landing_checkpoint.get("planet", "")) == _world:
		_sim.restore(GameState.landing_checkpoint)
	GameState.checkpoint_revive = false
	_make_world()
	_build_hud()
	_update_hud()
	GameAudio.communicate("Approaching %s. Pilot your lander using LEFT and RIGHT. Increase thrust to brake before touchdown. Deploy the landing legs." % _world.capitalize())

func _make_world() -> void:
	var environment: WorldEnvironment = WorldEnvironment.new()
	var env: Environment = Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("281a1a") if _world == "mars" else Color("020918")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("d8ac89") if _world == "mars" else Color("a7c1f1")
	env.ambient_light_energy = 0.75
	environment.environment = env
	add_child(environment)
	var sunlight: DirectionalLight3D = DirectionalLight3D.new()
	sunlight.rotation_degrees = Vector3(-42, -32, 0)
	sunlight.light_energy = 1.3
	add_child(sunlight)
	_make_terrain()
	var pad: MeshInstance3D = MeshInstance3D.new()
	var pad_mesh: CylinderMesh = CylinderMesh.new()
	pad_mesh.top_radius = 10.0
	pad_mesh.bottom_radius = 10.0
	pad_mesh.height = 0.12
	pad_mesh.radial_segments = 32
	pad.mesh = pad_mesh
	pad.position = Vector3(0, 0.24, 0)
	pad.material_override = _mat(Color("264b56"), true)
	add_child(pad)
	for ring: float in [8.5, 6.0]:
		for segment: int in range(36):
			var theta: float = float(segment) * TAU / 36.0
			_box(Vector3(cos(theta) * ring, 0.37, sin(theta) * ring), Vector3(0.90, 0.08, 0.15), Color("eacb64"), true)
	for i: int in range(26):
		var theta: float = float(i) * 2.39996
		var distance: float = 16.0 + float(i % 7) * 5.2
		_rock(Vector3(cos(theta) * distance, 0.7, sin(theta) * distance), 0.65 + float(i % 4) * 0.43)
	if _world == "moon":
		_ball(Vector3(-40, 32, -95), 13.0, Color("347fad"), false)
	else:
		_ball(Vector3(-50, 18, -90), 4.0, Color("e4b47f"), true)
	var parts: Dictionary = RocketArt.build(self, 0)
	_craft = parts["root"] as Node3D
	_flame = parts["flame"] as MeshInstance3D
	(parts["lower_stage"] as Node3D).visible = false
	_craft.scale = Vector3.ONE * 0.58
	_craft.position = Vector3(_sim.horizontal_m, 22.0, 0)
	for side: float in [-1.0, 1.0]:
		var leg: MeshInstance3D = _box(Vector3(side * 0.55, -2.0, 0), Vector3(0.2, 3.0, 0.3), Color("c9d3db"), false)
		leg.rotation.z = side * 0.25
		leg.reparent(_craft)
		leg.position = Vector3(side * 2.5, 3.5, 0)
		leg.visible = _sim.legs
		_gear_nodes.append(leg)
	var rand: RandomNumberGenerator = RandomNumberGenerator.new()
	rand.seed = 10021
	if _world == "moon":
		for i: int in range(85):
			_ball(Vector3(rand.randf_range(-100, 100), rand.randf_range(10, 90), rand.randf_range(-180, -70)), 0.1, Color("cee1ff"), true)
	_camera = Camera3D.new()
	_camera.fov = 70.0
	_camera.current = true
	add_child(_camera)
	_camera.position = Vector3(7, 13, 25)
	_camera.look_at(Vector3(0, 9, 0), Vector3.UP)

func _make_terrain() -> void:
	var tool: SurfaceTool = SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	var base: Color = Color("a8acb7") if _world == "moon" else Color("b45f3a")
	for ix: int in range(40):
		for iz: int in range(40):
			var x: float = (float(ix) - 20.0) * 6.0
			var z: float = (float(iz) - 20.0) * 6.0
			var a: Vector3 = Vector3(x, _ground(x, z), z)
			var b: Vector3 = Vector3(x + 6.0, _ground(x + 6.0, z), z)
			var c: Vector3 = Vector3(x, _ground(x, z + 6.0), z + 6.0)
			var d: Vector3 = Vector3(x + 6.0, _ground(x + 6.0, z + 6.0), z + 6.0)
			for p: Vector3 in [a, c, b, b, c, d]:
				var brightness: float = 0.83 + 0.15 * sin(p.x * 0.31 + p.z * 0.18)
				tool.set_color(base * brightness)
				tool.add_vertex(p)
	tool.generate_normals()
	var mesh: ArrayMesh = tool.commit()
	var ground: MeshInstance3D = MeshInstance3D.new()
	ground.mesh = mesh
	var material: StandardMaterial3D = _mat(Color.WHITE, false)
	material.vertex_color_use_as_albedo = true
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	ground.material_override = material
	add_child(ground)

func _ground(x: float, z: float) -> float:
	if absf(x) < 12.0 and absf(z) < 12.0:
		return 0.0
	var hills: float = sin(x * 0.06) * cos(z * 0.07) * (3.5 if _world == "mars" else 2.1)
	var crater: float = 0.0
	for center: Vector2 in [Vector2(-45, -36), Vector2(52, 37), Vector2(75, -49)]:
		var d: float = Vector2(x, z).distance_to(center)
		crater -= 5.0 * exp(-pow((d / 16.0), 2.0))
		crater += 2.6 * exp(-pow(((d - 19.0) / 7.0), 2.0))
	return hills + crater

func _mat(color: Color, glow: bool) -> StandardMaterial3D:
	var m: StandardMaterial3D = StandardMaterial3D.new()
	m.albedo_color = color
	m.roughness = 0.85
	if glow:
		m.emission_enabled = true
		m.emission = color
		m.emission_energy_multiplier = 0.45
	return m

func _box(location: Vector3, size3: Vector3, color: Color, glow: bool) -> MeshInstance3D:
	var mesh: BoxMesh = BoxMesh.new()
	mesh.size = size3
	var object: MeshInstance3D = MeshInstance3D.new()
	object.mesh = mesh
	object.position = location
	object.material_override = _mat(color, glow)
	add_child(object)
	return object

func _ball(location: Vector3, radius: float, color: Color, glow: bool) -> MeshInstance3D:
	var mesh: SphereMesh = SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2
	mesh.radial_segments = 14
	mesh.rings = 7
	var item: MeshInstance3D = MeshInstance3D.new()
	item.mesh = mesh
	item.position = location
	item.material_override = _mat(color, glow)
	add_child(item)
	return item

func _rock(location: Vector3, radius: float) -> void:
	var color: Color = Color("77757b") if _world == "moon" else Color("703b30")
	var rock: MeshInstance3D = _ball(location, radius, color, false)
	rock.scale = Vector3(1.5, 0.50, 1.1)

func _build_hud() -> void:
	# Only essential real-time controls stay on screen.
	var layer: CanvasLayer = CanvasLayer.new()
	add_child(layer)
	var root: Control = Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(root)
	var telemetry: PanelContainer = UI.panel()
	telemetry.position = Vector2(16, 14)
	telemetry.custom_minimum_size = Vector2(225, 0)
	root.add_child(telemetry)
	var readings: VBoxContainer = VBoxContainer.new()
	telemetry.add_child(readings)
	readings.add_child(UI.label("%s DESCENT" % _world.to_upper(), 18, Color("f4cb70")))
	_hud = UI.label("", 18)
	readings.add_child(_hud)
	_throttle = UI.label("", 13, UI.ACCENT)
	readings.add_child(_throttle)
	_mission = UI.label("LAND IN THE GOLD CIRCLE  ·  GEAR + SLOW DESCENT", 17, Color("fbe194"))
	_mission.anchor_left = 0.31
	_mission.anchor_right = 0.80
	_mission.offset_top = 18
	_mission.offset_bottom = 50
	_mission.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(_mission)
	var pause: Button = UI.button("Ⅱ  PAUSE")
	pause.custom_minimum_size = Vector2(133, 49)
	pause.anchor_left = 1.0
	pause.anchor_right = 1.0
	pause.offset_left = -150
	pause.offset_right = -17
	pause.offset_top = 17
	pause.offset_bottom = 66
	root.add_child(pause)
	pause.pressed.connect(_pause)
	var stick: Control = FLIGHT_STICK.new()
	stick.anchor_top = 1.0
	stick.anchor_bottom = 1.0
	stick.offset_left = 16
	stick.offset_right = 177
	stick.offset_top = -187
	stick.offset_bottom = -26
	root.add_child(stick)
	stick.axis_changed.connect(func(direction: Vector2) -> void: _steering = direction.x)
	var actions: VBoxContainer = VBoxContainer.new()
	actions.anchor_left = 1.0
	actions.anchor_right = 1.0
	actions.anchor_top = 1.0
	actions.anchor_bottom = 1.0
	actions.offset_left = -345
	actions.offset_right = -17
	actions.offset_top = -164
	actions.offset_bottom = -17
	actions.add_theme_constant_override("separation", 8)
	root.add_child(actions)
	var top: HBoxContainer = UI.row()
	top.add_theme_constant_override("separation", 8)
	actions.add_child(top)
	var brake: Button = UI.button("▲ BRAKE", true)
	brake.custom_minimum_size = Vector2(158, 58)
	top.add_child(brake)
	brake.pressed.connect(_raise_throttle)
	var cut: Button = UI.button("▼ LESS")
	cut.custom_minimum_size = Vector2(158, 58)
	top.add_child(cut)
	cut.pressed.connect(_lower_throttle)
	var bottom: HBoxContainer = UI.row()
	bottom.add_theme_constant_override("separation", 8)
	actions.add_child(bottom)
	_legs_button = UI.button("GEAR", true)
	_legs_button.custom_minimum_size = Vector2(158, 58)
	bottom.add_child(_legs_button)
	_legs_button.pressed.connect(_deploy_legs)
	_fuel_button = UI.button("FUEL +35")
	_fuel_button.custom_minimum_size = Vector2(158, 58)
	bottom.add_child(_fuel_button)
	_fuel_button.pressed.connect(_refuel)
	_help = UI.label("", 15, Color("fbe194"))
	_help.anchor_left = 0.27
	_help.anchor_right = 0.75
	_help.anchor_top = 1.0
	_help.anchor_bottom = 1.0
	_help.offset_top = -63
	_help.offset_bottom = -24
	_help.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(_help)

func _physics_process(delta: float) -> void:
	if _completed:
		return
	if _manual_override > 0.0:
		_manual_override -= delta
	elif _assisted:
		var desired: float = -clampf(_sim.altitude_m / 28.0, 2.0, 6.0)
		var response: float = (desired - _sim.vertical_velocity_m_s) * 0.8
		_sim.throttle = clampf((_sim.gravity() + response) / _sim.acceleration(), 0.0, 1.0)
	var event: String = _sim.advance(delta * 1.6, _steering)
	if _flame != null:
		_flame.visible = _sim.throttle > 0.07 and _sim.fuel > 0.0
		_flame.scale.y = 0.4 + _sim.throttle * 1.1
	var visual_y: float = minf(25.0, 0.65 + _sim.altitude_m * 0.10)
	_craft.position = _craft.position.lerp(Vector3(_sim.horizontal_m, visual_y, 0.0), minf(1.0, delta * 8.0))
	_craft.rotation_degrees.z = lerpf(_craft.rotation_degrees.z, -_steering * 8.0, minf(1.0, delta * 7.0))
	_camera.position = _camera.position.lerp(Vector3(7.0 + _sim.horizontal_m * 0.74, visual_y + 7.0, 25.0), minf(1.0, delta * 3.0))
	_camera.look_at(Vector3(_sim.horizontal_m * 0.78, visual_y + 2.5, 0), Vector3.UP)
	_checkpoint_timer += delta
	if _checkpoint_timer > 6.0 and _sim.altitude_m > 65.0 and _sim.altitude_m < 260.0 and _sim.vertical_velocity_m_s > -10.0:
		_checkpoint_timer = 0.0
		GameState.save_landing_checkpoint(_sim.snapshot())
	_update_hud()
	if event == "landed":
		_finish(true)
	elif event == "crashed":
		_finish(false)

func _update_hud() -> void:
	_hud.text = "ALT  %d m  ·  SPEED  %.1f m/s\nFUEL  %d%%  ·  OFFSET  %.0f m" % [roundi(_sim.altitude_m), absf(_sim.vertical_velocity_m_s), _sim.fuel_percent(), absf(_sim.horizontal_m)]
	_throttle.text = "THRUST %d%%  ·  GEAR %s" % [roundi(_sim.throttle * 100.0), "ON" if _sim.legs else "OFF"]
	if not _sim.legs and _sim.altitude_m < 95:
		_help.text = "ACTION: DEPLOY LANDING LEGS!"
	elif _sim.vertical_velocity_m_s < -5.0 and _sim.altitude_m < 95:
		_help.text = "DANGER: TAP BRAKE TO SLOW DESCENT"
	elif absf(_sim.horizontal_m) > 9.0:
		_help.text = "STEER TOWARD THE GOLD LANDING CIRCLE"
	else:
		_help.text = "LAND BELOW %.1f m/s · NEAR CENTER" % _sim.safe_vertical_speed()
	if _sim.altitude_m < 65.0 and absf(_sim.vertical_velocity_m_s) > 6.5 and _last_warning != "fast":
		_last_warning = "fast"
		GameAudio.communicate("Warning. Landing speed is high. Apply engine thrust to brake.", true)
	if _sim.altitude_m < 35.0 and not _sim.legs and _last_warning != "legs":
		_last_warning = "legs"
		GameAudio.communicate("Deploy landing legs now.", true)
	_legs_button.text = "GEAR ✓" if _sim.legs else "GEAR"
	_fuel_button.text = "FUEL +35 (%d)" % int(GameState.supplies.get("fuel_cell", 0))
	_fuel_button.disabled = int(GameState.supplies.get("fuel_cell", 0)) <= 0 or _sim.fuel >= _sim.fuel_capacity - 0.05
	_legs_button.disabled = _sim.legs

func _tap_steering(side: float) -> void:
	_sim.horizontal_velocity_m_s = clampf(_sim.horizontal_velocity_m_s + side * 1.7, -12.0, 12.0)

func _hold_steering(side: float) -> void:
	_steering = side

func _release_steering() -> void:
	_steering = 0.0

func _raise_throttle() -> void:
	_sim.set_throttle(_sim.throttle + 0.15)
	_manual_override = 3.0
	GameAudio.effect("launch")

func _lower_throttle() -> void:
	_sim.set_throttle(_sim.throttle - 0.15)
	_manual_override = 3.0

func _refuel() -> void:
	if int(GameState.supplies.get("fuel_cell", 0)) <= 0 or _sim.fuel >= _sim.fuel_capacity - 0.05:
		return
	if _sim.refuel(35.0) and GameState.use_supply("fuel_cell"):
		_help.text = "FUEL CELL USED · CAPACITY RESTORED"
		GameAudio.effect("stage")
		_update_hud()

func _deploy_legs() -> void:
	if _sim.deploy_legs():
		for gear: MeshInstance3D in _gear_nodes:
			gear.visible = true
		GameAudio.effect("stage")
		GameAudio.communicate("Landing gear is deployed. Control your speed and center over the target.")

func _radio() -> void:
	GameAudio.communicate("Mission control. %s height %d metres, downward speed %.1f metres per second, fuel %d percent. %s" % [_world.capitalize(), roundi(_sim.altitude_m), absf(_sim.vertical_velocity_m_s), _sim.fuel_percent(), _help.text])

func _overlay_panel(title: String, text: String) -> VBoxContainer:
	_overlay = CanvasLayer.new()
	_overlay.layer = 35
	_overlay.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(_overlay)
	var veil: ColorRect = ColorRect.new()
	veil.color = Color(0.0, 0.01, 0.05, 0.92)
	veil.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_overlay.add_child(veil)
	var center: CenterContainer = CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_overlay.add_child(center)
	var panel: PanelContainer = UI.panel()
	panel.custom_minimum_size = Vector2(600, 0)
	center.add_child(panel)
	var actions: VBoxContainer = VBoxContainer.new()
	actions.add_theme_constant_override("separation", 10)
	panel.add_child(actions)
	actions.add_child(UI.label(title, 30, Color("f4cd74")))
	actions.add_child(UI.label(text, 19))
	return actions

func _button(parent: VBoxContainer, label: String, callback: Callable, primary: bool = false) -> void:
	var button: Button = UI.button(label, primary)
	parent.add_child(button)
	button.pressed.connect(callback)

func _finish(success: bool) -> void:
	_completed = true
	var actions: VBoxContainer
	if success:
		var rank: String = _sim.grade()
		var first_clear: bool = not bool(GameState.completed_planets.get(_world, false))
		var earned_coins: int = (800 if _world == "moon" else 1400) if first_clear else 50
		GameState.award_landing(_world, rank, true)
		GameAudio.effect("success")
		GameAudio.communicate("Congratulations. Your %s landing succeeded. You received grade %s." % [_world, rank])
		actions = _overlay_panel("%s LANDED!  ·  GRADE %s" % [_world.to_upper(), rank],
			"Landing speed %.1f m/s  ·  Fuel %d%%\nYou earned %d virtual game coins for your %s landing.\nNew badge: %s" % [
				absf(_sim.vertical_velocity_m_s), _sim.fuel_percent(),
				earned_coins, _world,
				"Lunar Explorer" if _world == "moon" else "Mars Pathfinder"])
		if _world == "moon":
			_button(actions, "EXIT LANDER · EXPLORE THE MOON", _moon_eva, true)
			_button(actions, "UPGRADE ROCKET FOR MARS", _workshop, false)
			if GameState.planet_unlocked("mars"):
				_button(actions, "CONTINUE TO MARS  ▶", func() -> void: _transfer("mars"), true)
		else:
			_button(actions, "VIEW YOUR AWARDS AND GRADES", _rewards, true)
		_button(actions, "REPLAY LANDING", _restart)
	else:
		GameAudio.effect("impact")
		actions = _overlay_panel("%s LANDER CRASHED" % _world.to_upper(),
			"Descent %.1f m/s · Distance from target %.1f m\nRestart the mission for free or use 150 earned game coins to recover at a safe checkpoint.\nBalance: %d game coins" % [
				absf(_sim.vertical_velocity_m_s), absf(_sim.horizontal_m), GameState.coins])
		_button(actions, "RESTART FROM BEGINNING — FREE", _restart, true)
		if GameState.can_repair_checkpoint(_world):
			_button(actions, "REPAIR WITH 1 KIT · CHECKPOINT", _repair_recover)
		if GameState.can_revive(_world):
			_button(actions, "REVIVE FROM CHECKPOINT — 150 COINS", _revive)
		else:
			actions.add_child(UI.label("Checkpoint recovery unavailable or insufficient coins.", 16, UI.MUTED))
	_button(actions, "SAVE & MAIN MENU", _menu)
	get_tree().paused = true

func _restart() -> void:
	get_tree().paused = false
	GameState.begin_landing(_world)

func _repair_recover() -> void:
	if GameState.repair_lander_checkpoint(_world):
		get_tree().paused = false

func _revive() -> void:
	get_tree().paused = false
	if not GameState.revive_lander(_world):
		get_tree().paused = true

func _transfer(planet: String) -> void:
	get_tree().paused = false
	GameState.begin_transfer(planet)

func _moon_eva() -> void:
	get_tree().paused = false
	GameState.begin_moon_eva()

func _workshop() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/ui/workshop_screen.tscn")

func _rewards() -> void:
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/ui/rewards_screen.tscn")

func _pause() -> void:
	if _overlay != null:
		return
	var actions: VBoxContainer = _overlay_panel("LANDING PAUSED", "Crew, planet and checkpoint are stored locally.")
	_button(actions, "RESUME PILOTING", _resume, true)
	_button(actions, "RESTART LANDING", _restart)
	_button(actions, "MISSION RADIO", _radio)
	_button(actions, "SAVE & MAIN MENU", _menu)
	GameState.save_local()
	get_tree().paused = true

func _resume() -> void:
	get_tree().paused = false
	if _overlay != null:
		_overlay.queue_free()
		_overlay = null

func _menu() -> void:
	GameState.save_local()
	get_tree().paused = false
	get_tree().change_scene_to_file(GameState.MENU)

func _unhandled_key_input(event: InputEvent) -> void:
	if not event is InputEventKey:
		return
	var key: InputEventKey = event as InputEventKey
	if not key.pressed or key.echo:
		return
	match key.keycode:
		KEY_A, KEY_LEFT: _tap_steering(-1.0)
		KEY_D, KEY_RIGHT: _tap_steering(1.0)
		KEY_W, KEY_UP: _raise_throttle()
		KEY_S, KEY_DOWN: _lower_throttle()
		KEY_L: _deploy_legs()
		KEY_R: _radio()
		KEY_ESCAPE: _pause()

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		_pause()
