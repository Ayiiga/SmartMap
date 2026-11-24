extends CharacterBody3D
class_name AstronautController
## Third-person CharacterBody3D with gravity, smooth facing, jetpack, keyboard/touch input.
signal interact_requested
signal power_changed(value: float)
const Crew = preload("res://scripts/player/crew_catalog.gd")

@onready var _visual: Node3D = $Visual
@onready var _pivot: Node3D = $CameraPivot
@onready var _spring: SpringArm3D = $CameraPivot/SpringArm
@onready var _camera: Camera3D = $CameraPivot/SpringArm/Camera
@onready var _ray: RayCast3D = $CameraPivot/SpringArm/Camera/InteractionRay

var move_stick: Vector2 = Vector2.ZERO
var sprinting: bool = false
var jetpacking: bool = false
var driving_rover: bool = false
var power: float = 100.0
var planet_gravity: float = 9.81
var _wants_jump: bool = false
var _pitch: float = -0.20
const WALK_SPEED: float = 5.2
const RUN_SPEED: float = 8.0
const JUMP_SPEED: float = 5.5

func _ready() -> void:
	_spring.rotation.x = _pitch
	_build_suit()

func _input(event: InputEvent) -> void:
	if event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		look_delta(event.relative)
	if event.is_action_pressed("interact"):
		request_interact()
	if event.is_action_pressed("jump"):
		_wants_jump = true

func look_delta(delta: Vector2) -> void:
	var invert: float = -1.0 if bool(GameState.settings.get("camera_inverted", false)) else 1.0
	_pivot.rotation.y -= delta.x * 0.0045
	_pitch = clampf(_pitch - delta.y * 0.0040 * invert, -1.05, 0.48)
	_spring.rotation.x = _pitch

func request_jump() -> void:
	_wants_jump = true

func request_interact() -> void:
	interact_requested.emit()

func interaction_ray_target() -> CollisionObject3D:
	_ray.force_raycast_update()
	return _ray.get_collider() as CollisionObject3D

func _physics_process(delta: float) -> void:
	var keys: Vector2 = Input.get_vector("move_left", "move_right", "move_forward", "move_backward")
	var axes: Vector2 = move_stick if move_stick.length() > 0.08 else keys
	var basis: Basis = _camera.global_transform.basis
	var forward: Vector3 = -basis.z
	forward.y = 0.0
	forward = forward.normalized()
	var right: Vector3 = basis.x
	right.y = 0.0
	right = right.normalized()
	var direction: Vector3 = (right * axes.x - forward * axes.y).normalized()
	var is_sprint: bool = sprinting or Input.is_action_pressed("sprint")
	var target_speed: float = RUN_SPEED if is_sprint else WALK_SPEED
	if driving_rover:
		target_speed = 12.0 * minf(axes.length(), 1.0)
	var target_horizontal: Vector3 = direction * target_speed
	var acceleration: float = 14.0 if driving_rover and direction != Vector3.ZERO else 24.0 if driving_rover else 18.0
	velocity.x = move_toward(velocity.x, target_horizontal.x, acceleration * delta)
	velocity.z = move_toward(velocity.z, target_horizontal.z, acceleration * delta)
	if direction.length_squared() > 0.01:
		_visual.rotation.y = lerp_angle(_visual.rotation.y, atan2(-direction.x, -direction.z), minf(1.0, 9.0 * delta))
	if not is_on_floor():
		velocity.y -= planet_gravity * delta
	elif velocity.y < 0.0:
		velocity.y = -0.15
	if _wants_jump and is_on_floor() and not driving_rover:
		velocity.y = JUMP_SPEED * sqrt(planet_gravity / 9.81)
	_wants_jump = false
	if jetpacking and power > 0.5 and not driving_rover:
		velocity.y = minf(velocity.y + 15.0 * delta, 6.5)
		power = maxf(0.0, power - 15.0 * delta)
		power_changed.emit(power)
	else:
		power = minf(100.0, power + 7.0 * delta)
	move_and_slide()

func refresh_suit() -> void:
	for part: Node in _visual.get_children():
		part.free()
	_build_suit()

func _build_suit() -> void:
	# Smooth, layered 3D suit meshes: reflective visor, life-support backpack,
	# rounded gloves and boots, visible oxygen tanks and mission patch.
	var palette: Dictionary = Crew.profile_for(GameState.selected_astronaut)
	var suit: StandardMaterial3D = _material(Color(str(palette["suit"])))
	var trim: StandardMaterial3D = _material(Color(str(palette["trim"])))
	var visor: StandardMaterial3D = _material(Color(str(palette["visor"])))
	var boots: StandardMaterial3D = _material(Color(str(palette["boots"])))
	var metal: StandardMaterial3D = _material(Color("bacbd5"))
	visor.metallic = 0.55
	visor.roughness = 0.12
	metal.metallic = 0.55
	metal.roughness = 0.30
	_mesh_sphere(_visual, Vector3(0, 0.61, 0), Vector3(0.37, 0.47, 0.29), suit)
	_mesh_cylinder(_visual, Vector3(0, 1.0, 0), 0.31, 0.20, trim)
	_mesh_sphere(_visual, Vector3(0, 1.25, 0), Vector3(0.35, 0.37, 0.34), suit)
	_mesh_sphere(_visual, Vector3(0, 1.23, -0.255), Vector3(0.28, 0.21, 0.17), metal)
	_mesh_sphere(_visual, Vector3(0, 1.24, -0.29), Vector3(0.25, 0.18, 0.16), visor)
	_mesh_sphere(_visual, Vector3(0.08, 1.33, -0.42), Vector3(0.09, 0.035, 0.025), trim)
	_mesh_box(_visual, Vector3(0, 0.64, 0.36), Vector3(0.51, 0.67, 0.25), trim)
	_mesh_box(_visual, Vector3(0, 0.64, 0.50), Vector3(0.40, 0.37, 0.07), metal)
	for side: float in [-1.0, 1.0]:
		_mesh_capsule(_visual, Vector3(side * 0.49, 0.63, 0), 0.13, 0.68, suit)
		_mesh_sphere(_visual, Vector3(side * 0.51, 0.24, -0.02), Vector3(0.145, 0.16, 0.15), trim)
		_mesh_capsule(_visual, Vector3(side * 0.18, -0.08, 0), 0.145, 0.66, suit)
		_mesh_sphere(_visual, Vector3(side * 0.18, -0.39, -0.10), Vector3(0.19, 0.15, 0.31), boots)
		_mesh_cylinder(_visual, Vector3(side * 0.16, 0.70, 0.56), 0.085, 0.48, metal)
	_mesh_box(_visual, Vector3(0, 0.61, -0.30), Vector3(0.20, 0.14, 0.065), trim)
	_mesh_sphere(_visual, Vector3(-0.15, 0.80, -0.27), Vector3(0.07, 0.07, 0.04), metal)

func _material(color: Color) -> StandardMaterial3D:
	var material: StandardMaterial3D = StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.74
	return material

func _mesh_sphere(parent: Node3D, offset: Vector3, scale3: Vector3, material: Material) -> void:
	var node: MeshInstance3D = MeshInstance3D.new()
	var mesh: SphereMesh = SphereMesh.new()
	mesh.radial_segments = 24
	mesh.rings = 12
	node.mesh = mesh
	node.material_override = material
	node.position = offset
	node.scale = scale3
	parent.add_child(node)

func _mesh_box(parent: Node3D, offset: Vector3, dimensions: Vector3, material: Material) -> void:
	var node: MeshInstance3D = MeshInstance3D.new()
	var mesh: BoxMesh = BoxMesh.new()
	mesh.size = dimensions
	node.mesh = mesh
	node.material_override = material
	node.position = offset
	parent.add_child(node)

func _mesh_capsule(parent: Node3D, offset: Vector3, radius: float, height: float, material: Material) -> void:
	var mesh: CapsuleMesh = CapsuleMesh.new()
	mesh.radius = radius
	mesh.height = height
	mesh.radial_segments = 18
	mesh.rings = 6
	var instance: MeshInstance3D = MeshInstance3D.new()
	instance.mesh = mesh
	instance.position = offset
	instance.material_override = material
	parent.add_child(instance)

func _mesh_cylinder(parent: Node3D, offset: Vector3, radius: float, height: float, material: Material) -> void:
	var mesh: CylinderMesh = CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = height
	mesh.radial_segments = 20
	var instance: MeshInstance3D = MeshInstance3D.new()
	instance.mesh = mesh
	instance.position = offset
	instance.material_override = material
	parent.add_child(instance)
