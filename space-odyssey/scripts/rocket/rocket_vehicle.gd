extends Node3D
class_name RocketVehicle
## Time-compressed local rocket flight. Units: metres, seconds, kilograms, newtons.
## Guidance builds an orbital checkpoint; it is not a true orbital integrator.

signal launched
signal stage_separated
signal orbit_reached
signal failed(reason: String)
const RocketMath = preload("res://scripts/rocket/rocket_math.gd")

enum Phase { READY, STAGE_ONE, SEPARATION, STAGE_TWO, ORBIT, FAILED }
const TIME_SCALE: float = 2.3
const EARTH_GRAVITY: float = 9.81
const SEA_LEVEL_DENSITY: float = 1.225
const DRAG_AREA: float = 0.55
const ORBIT_MIN_ALTITUDE_M: float = 12000.0
const ORBIT_MIN_SPEED_M_S: float = 460.0
const ORBIT_ALTITUDE_M: float = 120000.0
const ORBIT_VELOCITY_M_S: float = 7800.0

var phase: Phase = Phase.READY
var altitude_m: float = 0.0
var vertical_speed_m_s: float = 0.0
var horizontal_speed_m_s: float = 0.0
var throttle: float = 1.0
var pitch_deg: float = 0.0
var flight_seconds: float = 0.0
var fuel_one_kg: float = 0.0
var fuel_two_kg: float = 4500.0
var fuel_one_capacity_kg: float = 0.0
var fuel_two_capacity_kg: float = 4500.0
var stage_one_dry_kg: float = 0.0
var boosters: int = 0
var assisted: bool = true
var _rocket_visual: Node3D
var _lower_stage: Node3D
var _flame: MeshInstance3D

func _ready() -> void:
	configure(GameState.rocket_design)
	assisted = bool(GameState.settings.get("assisted_controls", true))
	_build_rocket()

func configure(design: Dictionary) -> void:
	var tanks: int = clampi(int(design.get("fuel_tanks", 1)), 1, 3)
	boosters = clampi(int(design.get("boosters", 0)), 0, 2)
	var sizing: Dictionary = RocketMath.estimate(tanks, boosters)
	fuel_one_capacity_kg = float(sizing["stage_one_fuel_kg"])
	stage_one_dry_kg = float(sizing["stage_one_dry_kg"])
	if phase == Phase.READY:
		fuel_one_kg = fuel_one_capacity_kg
		fuel_two_kg = fuel_two_capacity_kg

func current_mass_kg() -> float:
	var upper: float = RocketMath.UPPER_DRY_KG + fuel_two_kg
	if phase == Phase.READY or phase == Phase.STAGE_ONE or phase == Phase.SEPARATION:
		return upper + stage_one_dry_kg + fuel_one_kg
	return upper

func current_speed_m_s() -> float:
	return Vector2(vertical_speed_m_s, horizontal_speed_m_s).length()

func active_fuel_percent() -> int:
	if phase == Phase.READY or phase == Phase.STAGE_ONE or phase == Phase.SEPARATION:
		return roundi(100.0 * fuel_one_kg / maxf(1.0, fuel_one_capacity_kg))
	return roundi(100.0 * fuel_two_kg / maxf(1.0, fuel_two_capacity_kg))

func can_separate() -> bool:
	return phase == Phase.SEPARATION or (phase == Phase.STAGE_ONE and fuel_one_kg <= 0.12 * fuel_one_capacity_kg)

func can_insert_orbit() -> bool:
	return phase == Phase.STAGE_TWO and altitude_m >= ORBIT_MIN_ALTITUDE_M and current_speed_m_s() >= ORBIT_MIN_SPEED_M_S

func ignite() -> bool:
	if phase != Phase.READY:
		return false
	throttle = 1.0
	phase = Phase.STAGE_ONE
	launched.emit()
	return true

func set_throttle(value: float) -> void:
	if phase != Phase.STAGE_ONE and phase != Phase.STAGE_TWO:
		return
	throttle = clampf(value, 0.0, 1.0)

func adjust_pitch(change_deg: float) -> void:
	if phase == Phase.STAGE_ONE or phase == Phase.STAGE_TWO:
		pitch_deg = clampf(pitch_deg + change_deg, 0.0, 65.0)

func separate_stage() -> bool:
	if not can_separate():
		return false
	# The empty first-stage engine and boosters are discarded, reducing dry mass.
	phase = Phase.STAGE_TWO
	throttle = 0.72 if assisted else 0.85
	if is_instance_valid(_lower_stage):
		_lower_stage.visible = false
	stage_separated.emit()
	return true

func insert_guided_orbit() -> bool:
	if not can_insert_orbit():
		return false
	# Educational orbital transfer abstraction: actual elliptical trajectories are Phase 3 scope.
	phase = Phase.ORBIT
	altitude_m = ORBIT_ALTITUDE_M
	position.y = 155.0
	vertical_speed_m_s = 0.0
	horizontal_speed_m_s = ORBIT_VELOCITY_M_S
	throttle = 0.0
	orbit_reached.emit()
	return true

func _physics_process(delta: float) -> void:
	if phase != Phase.STAGE_ONE and phase != Phase.SEPARATION and phase != Phase.STAGE_TWO:
		return
	var dt: float = minf(delta, 0.04) * TIME_SCALE
	flight_seconds += dt
	if assisted and (phase == Phase.STAGE_ONE or phase == Phase.STAGE_TWO):
		var target: float = 5.0 if altitude_m < 2500.0 else (19.0 if phase == Phase.STAGE_ONE else 30.0)
		pitch_deg = move_toward(pitch_deg, target, 18.0 * dt)
	var thrust_n: float = 0.0
	if phase == Phase.STAGE_ONE and fuel_one_kg > 0.0:
		var mass_flow_one: float = minf(fuel_one_kg, (465.0 + 32.0 * float(boosters)) * throttle * dt)
		fuel_one_kg -= mass_flow_one
		thrust_n = mass_flow_one / maxf(dt, 0.00001) * RocketMath.STAGE_ONE_EXHAUST_V_M_S
		if fuel_one_kg <= 0.001:
			fuel_one_kg = 0.0
			phase = Phase.SEPARATION
			throttle = 0.0
	elif phase == Phase.STAGE_TWO and fuel_two_kg > 0.0:
		var mass_flow_two: float = minf(fuel_two_kg, 145.0 * throttle * dt)
		fuel_two_kg -= mass_flow_two
		thrust_n = mass_flow_two / maxf(dt, 0.00001) * RocketMath.STAGE_TWO_EXHAUST_V_M_S
		if fuel_two_kg <= 0.001:
			fuel_two_kg = 0.0
			throttle = 0.0
	var acceleration: float = thrust_n / maxf(current_mass_kg(), 500.0)
	var air_density: float = SEA_LEVEL_DENSITY * exp(-altitude_m / 8200.0)
	var drag_accel: float = 0.5 * air_density * current_speed_m_s() * current_speed_m_s() * DRAG_AREA / maxf(current_mass_kg(), 500.0)
	var vertical_drag: float = drag_accel * vertical_speed_m_s / maxf(current_speed_m_s(), 1.0)
	var horizontal_drag: float = drag_accel * horizontal_speed_m_s / maxf(current_speed_m_s(), 1.0)
	vertical_speed_m_s += (cos(deg_to_rad(pitch_deg)) * acceleration - EARTH_GRAVITY - vertical_drag) * dt
	horizontal_speed_m_s += (sin(deg_to_rad(pitch_deg)) * acceleration - horizontal_drag) * dt
	altitude_m += vertical_speed_m_s * dt
	if altitude_m <= 0.0 and flight_seconds > 0.5 and vertical_speed_m_s < -2.0:
		altitude_m = 0.0
		phase = Phase.FAILED
		throttle = 0.0
		failed.emit("Rocket returned to the ground. Retry with more power.")
	elif altitude_m > 240000.0 and phase != Phase.ORBIT:
		phase = Phase.FAILED
		throttle = 0.0
		failed.emit("Rocket missed the training orbital window. Try guided orbit sooner.")
	# Keep world coordinates small: altitude is never used directly for the rendered position.
	position.y = minf(altitude_m / 90.0, 155.0)
	if _flame != null:
		_flame.position.y = 7.0 if phase == Phase.STAGE_TWO else -1.55
	if _rocket_visual != null:
		_rocket_visual.rotation.z = deg_to_rad(-pitch_deg * 0.35)
	if _flame != null:
		_flame.visible = thrust_n > 1000.0
		_flame.scale.y = 0.7 + throttle * 0.8

func snapshot() -> Dictionary:
	return {
		"phase": int(phase), "altitude_m": altitude_m,
		"vertical_speed_m_s": vertical_speed_m_s,
		"horizontal_speed_m_s": horizontal_speed_m_s,
		"fuel_one_kg": fuel_one_kg, "fuel_two_kg": fuel_two_kg,
		"throttle": throttle, "pitch_deg": pitch_deg,
		"flight_seconds": flight_seconds,
		"design": GameState.rocket_design.duplicate(true)
	}

func restore(data: Dictionary) -> void:
	if data.is_empty():
		return
	var saved_design: Variant = data.get("design", GameState.rocket_design)
	if saved_design is Dictionary:
		configure(saved_design)
		# A workshop redesign must not change the shape of a paused mission in progress.
		if _rocket_visual != null:
			_rocket_visual.free()
			_build_rocket()
	var saved_phase: int = clampi(int(data.get("phase", 0)), Phase.READY, Phase.FAILED)
	match saved_phase:
		1: phase = Phase.STAGE_ONE
		2: phase = Phase.SEPARATION
		3: phase = Phase.STAGE_TWO
		4: phase = Phase.ORBIT
		5: phase = Phase.FAILED
		_: phase = Phase.READY
	altitude_m = maxf(0.0, float(data.get("altitude_m", 0.0)))
	vertical_speed_m_s = float(data.get("vertical_speed_m_s", 0.0))
	horizontal_speed_m_s = maxf(0.0, float(data.get("horizontal_speed_m_s", 0.0)))
	fuel_one_kg = clampf(float(data.get("fuel_one_kg", fuel_one_capacity_kg)), 0.0, fuel_one_capacity_kg)
	fuel_two_kg = clampf(float(data.get("fuel_two_kg", fuel_two_capacity_kg)), 0.0, fuel_two_capacity_kg)
	throttle = clampf(float(data.get("throttle", 1.0)), 0.0, 1.0)
	pitch_deg = clampf(float(data.get("pitch_deg", 0.0)), 0.0, 65.0)
	flight_seconds = maxf(0.0, float(data.get("flight_seconds", 0.0)))
	position.y = minf(altitude_m / 90.0, 155.0)
	if _lower_stage != null:
		_lower_stage.visible = phase != Phase.STAGE_TWO and phase != Phase.ORBIT

func _build_rocket() -> void:
	_rocket_visual = Node3D.new()
	add_child(_rocket_visual)
	_lower_stage = Node3D.new()
	_rocket_visual.add_child(_lower_stage)
	_mesh_cylinder(_lower_stage, Vector3(0, 4.0, 0), 1.32, 7.8, Color("dbe9f2"))
	_mesh_cylinder(_lower_stage, Vector3(0, 0.9, 0), 1.35, 1.4, Color("537da1"))
	for i: int in range(4):
		var angle: float = TAU * float(i) / 4.0
		_mesh_box(_lower_stage, Vector3(cos(angle) * 1.45, 1.75, sin(angle) * 1.45), Vector3(0.65, 2.7, 0.8), Color("ed9457"))
	for i: int in range(boosters):
		_mesh_cylinder(_lower_stage, Vector3(-2.0 + float(i) * 4.0, 4.0, 0), 0.63, 6.1, Color("b4d1e4"))
	_mesh_cylinder(_rocket_visual, Vector3(0, 10.2, 0), 1.08, 4.0, Color("8de0e2"))
	var cone: CylinderMesh = CylinderMesh.new()
	cone.bottom_radius = 1.1
	cone.top_radius = 0.04
	cone.height = 2.8
	cone.radial_segments = 12
	_mesh(_rocket_visual, cone, Vector3(0, 13.5, 0), Color("f18c65"))
	var flame_mesh: CylinderMesh = CylinderMesh.new()
	flame_mesh.top_radius = 0.55
	flame_mesh.bottom_radius = 0.02
	flame_mesh.height = 3.5
	_flame = _mesh(_rocket_visual, flame_mesh, Vector3(0, -1.55, 0), Color("ffd066"))
	_flame.visible = false

func _mesh_cylinder(parent: Node3D, offset: Vector3, radius: float, height: float, color: Color) -> void:
	var mesh: CylinderMesh = CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = height
	mesh.radial_segments = 14
	_mesh(parent, mesh, offset, color)

func _mesh_box(parent: Node3D, offset: Vector3, size3: Vector3, color: Color) -> void:
	var mesh: BoxMesh = BoxMesh.new()
	mesh.size = size3
	_mesh(parent, mesh, offset, color)

func _mesh(parent: Node3D, mesh: Mesh, offset: Vector3, color: Color) -> MeshInstance3D:
	var item: MeshInstance3D = MeshInstance3D.new()
	item.mesh = mesh
	item.position = offset
	var material: StandardMaterial3D = StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.72
	item.material_override = material
	parent.add_child(item)
	return item
