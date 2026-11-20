extends Node3D
## Long-distance travel is a guided time-compressed gameplay segment.
const UI = preload("res://scripts/ui/space_ui.gd")
const RocketArt = preload("res://scripts/rocket/rocket_art.gd")
var _ship: Node3D
var _progress: ProgressBar
var _main_button: Button
var _hint: Label
var _started: bool = false
var _timer: float = 0.0
var _target: String = "moon"
var _ready_to_land: bool = false

func _ready() -> void:
	_target = GameState.destination_planet if GameState.destination_planet in ["moon", "mars"] else "moon"
	_make_space()
	_make_hud()
	GameAudio.communicate("Crew confirmed. Guided transfer is ready for %s. Tap BEGIN TRANSFER to travel, then prepare your landing controls." % _target.capitalize())

func _make_space() -> void:
	var world: WorldEnvironment = WorldEnvironment.new()
	var sky: Environment = Environment.new()
	sky.background_mode = Environment.BG_COLOR
	sky.background_color = Color("040919")
	sky.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	sky.ambient_light_color = Color("7183bd")
	sky.ambient_light_energy = 0.68
	world.environment = sky
	add_child(world)
	var sun: DirectionalLight3D = DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-40, 35, 0)
	sun.light_energy = 1.5
	add_child(sun)
	var camera: Camera3D = Camera3D.new()
	camera.position = Vector3(0, 11, 48)
	camera.current = true
	add_child(camera)
	camera.look_at(Vector3(0, 0, -12), Vector3.UP)
	_sphere(Vector3(-29, 1, -32), 11.0, Color("2b779d"))
	_sphere(Vector3(33, 7, -51), 8.0 if _target == "moon" else 10.0, Color("a5aab2") if _target == "moon" else Color("bb6747"))
	var builder: Dictionary = RocketArt.build(self, 0)
	_ship = builder["root"] as Node3D
	(builder["lower_stage"] as Node3D).visible = false
	_ship.scale = Vector3.ONE * 0.43
	_ship.rotation_degrees.x = -90.0
	_ship.position = Vector3(-21, 1, 0)
	var rand: RandomNumberGenerator = RandomNumberGenerator.new()
	rand.seed = 948712
	for i: int in range(90):
		var star: MeshInstance3D = _sphere(Vector3(rand.randf_range(-75, 75), rand.randf_range(-30, 40), rand.randf_range(-65, -16)), 0.07, Color("d8eafa"))
		star.scale = Vector3.ONE * rand.randf_range(0.5, 1.7)

func _sphere(point: Vector3, radius: float, color: Color) -> MeshInstance3D:
	var item: MeshInstance3D = MeshInstance3D.new()
	var sphere: SphereMesh = SphereMesh.new()
	sphere.radius = radius
	sphere.height = radius * 2
	sphere.radial_segments = 24
	sphere.rings = 12
	item.mesh = sphere
	item.position = point
	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.7
	item.material_override = mat
	add_child(item)
	return item

func _make_hud() -> void:
	var layer: CanvasLayer = CanvasLayer.new()
	add_child(layer)
	var root: Control = Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(root)
	var upper: PanelContainer = UI.panel()
	upper.position = Vector2(30, 28)
	upper.custom_minimum_size = Vector2(490, 0)
	root.add_child(upper)
	var stack: VBoxContainer = VBoxContainer.new()
	upper.add_child(stack)
	stack.add_child(UI.label("GUIDED TRANSFER  ·  %s" % _target.to_upper(), 26, Color("f3c96b")))
	stack.add_child(UI.label("All 3 crew aboard  ·  No internet  ·  Simplified travel", 17, UI.MUTED))
	stack.add_child(UI.label("Cadet: %s · Pilot: %s · Scientist: %s" % [
		str(GameState.crew_slots.get("Flight Cadets", "nambe")).capitalize(),
		GameState.pilot_name(),
		str(GameState.crew_slots.get("Science Explorers", "zuuri")).capitalize()
	], 16, UI.ACCENT))
	var lower: PanelContainer = UI.panel()
	lower.anchor_left = 0.19
	lower.anchor_right = 0.81
	lower.anchor_top = 1.0
	lower.anchor_bottom = 1.0
	lower.offset_top = -188
	lower.offset_bottom = -15
	root.add_child(lower)
	var controls: VBoxContainer = VBoxContainer.new()
	controls.add_theme_constant_override("separation", 8)
	lower.add_child(controls)
	_hint = UI.label("Step 1: Start a guided trip. Step 2: Pilot the landing.", 20)
	controls.add_child(_hint)
	_progress = ProgressBar.new()
	_progress.custom_minimum_size.y = 26
	_progress.value = 0
	_progress.max_value = 100
	controls.add_child(_progress)
	var buttons: HBoxContainer = UI.row()
	controls.add_child(buttons)
	_main_button = UI.button("BEGIN GUIDED TRANSFER  ▶", true)
	buttons.add_child(_main_button)
	_main_button.pressed.connect(_action)
	var menu: Button = UI.button("SAVE / MENU")
	buttons.add_child(menu)
	menu.pressed.connect(_menu)

func _process(delta: float) -> void:
	if not _started or _ready_to_land:
		return
	_timer = minf(7.0, _timer + delta)
	_progress.value = _timer / 7.0 * 100.0
	_ship.position.x = lerpf(-21.0, 24.0, _timer / 7.0)
	_ship.rotate_y(delta * 0.10)
	if _timer >= 7.0:
		_ready_to_land = true
		_main_button.disabled = false
		_main_button.text = "PILOT %s LANDING  ▶" % _target.to_upper()
		_hint.text = "Transfer complete. You control the final descent and touchdown."
		GameAudio.effect("success")
		GameAudio.communicate("Transfer complete. Prepare for manual landing. Use the engine to reduce descent speed.")

func _action() -> void:
	if _ready_to_land:
		GameState.begin_landing(_target)
		return
	if _started:
		return
	_started = true
	_main_button.disabled = true
	_main_button.text = "IN TRANSIT..."
	_hint.text = "Travelling through a time-compressed guided transfer..."
	GameAudio.effect("launch")

func _menu() -> void:
	GameState.save_local()
	get_tree().change_scene_to_file(GameState.MENU)

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		_menu()
