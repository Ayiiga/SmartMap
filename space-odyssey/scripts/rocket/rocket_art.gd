extends RefCounted
## Reusable self-contained 3D rocket art. No downloads, textures, or external models.
## Smooth metal shapes, cockpit windows, safety stripes and visible engine hardware.

static func build(parent: Node3D, booster_count: int = 2) -> Dictionary:
	var root: Node3D = Node3D.new()
	root.name = "RocketVisual"
	parent.add_child(root)
	var lower: Node3D = Node3D.new()
	lower.name = "LowerStage"
	root.add_child(lower)
	var hull: Material = _paint(Color("e4e9ee"), 0.36, 0.27)
	var dark: Material = _paint(Color("16232e"), 0.40, 0.23)
	var copper: Material = _paint(Color("ba7745"), 0.32, 0.42)
	var steel: Material = _paint(Color("8296a7"), 0.31, 0.43)
	var glass: Material = _paint(Color("163f52"), 0.16, 0.15)
	_cylinder(lower, Vector3(0, 4.45, 0), 1.24, 7.35, hull)
	_cylinder(lower, Vector3(0, 1.22, 0), 1.29, 0.9, dark)
	_cylinder(lower, Vector3(0, 1.9, 0), 1.27, 0.15, copper)
	_cylinder(lower, Vector3(0, 7.55, 0), 1.28, 0.80, dark)
	for j: int in range(5):
		_cylinder(lower, Vector3(0, 7.28 + float(j) * 0.13, 0), 1.30, 0.043, steel)
	for j: int in range(3):
		_cylinder(lower, Vector3(0, 2.75 + float(j) * 1.4, 0), 1.249, 0.06, steel)
	for i: int in range(4):
		var angle: float = TAU * float(i) / 4.0 + PI * 0.25
		var radial: Vector3 = Vector3(cos(angle), 0, sin(angle))
		_engine(lower, Vector3(radial.x * 0.57, 0.65, radial.z * 0.57), 0.40, steel, dark)
		var duct: MeshInstance3D = _box(lower, radial * 1.235 + Vector3(0, 4.45, 0), Vector3(0.13, 5.1, 0.19), steel)
		duct.rotation.y = -angle
	for i: int in range(clampi(booster_count, 0, 2)):
		var x: float = -1.88 if i == 0 else 1.88
		_cylinder(lower, Vector3(x, 3.8, 0), 0.50, 6.4, hull)
		_cylinder(lower, Vector3(x, 1.35, 0), 0.51, 0.45, dark)
		_engine(lower, Vector3(x, 0.66, 0), 0.32, steel, dark)
		_cylinder(lower, Vector3(x, 7.32, 0), 0.50, 0.8, copper, 0.11)
		_box(lower, Vector3(x * 0.75, 4.3, 0), Vector3(0.8, 0.23, 0.38), steel)
	_cylinder(root, Vector3(0, 9.8, 0), 1.075, 3.5, hull)
	_cylinder(root, Vector3(0, 8.38, 0), 1.09, 0.54, steel)
	_engine(root, Vector3(0, 7.96, 0), 0.54, steel, dark)
	_cylinder(root, Vector3(0, 11.5, 0), 1.10, 0.26, dark)
	_cylinder(root, Vector3(0, 12.55, 0), 1.10, 1.85, hull, 0.43)
	_cylinder(root, Vector3(0, 13.59, 0), 0.43, 0.26, steel, 0.34)
	for i: int in range(3):
		var visor_mount := Node3D.new()
		visor_mount.rotation.y = TAU * float(i) / 3.0
		root.add_child(visor_mount)
		_sphere(visor_mount, Vector3(0, 12.23, 0.88), Vector3(0.40, 0.24, 0.11), steel)
		_sphere(visor_mount, Vector3(0, 12.24, 0.95), Vector3(0.33, 0.17, 0.07), glass)
	var label := Label3D.new()
	label.text = "GIGAORBIT 01"
	label.font_size = 40
	label.pixel_size = 0.008
	label.modulate = Color("163047")
	label.position = Vector3(0, 5.6, 1.26)
	lower.add_child(label)
	var flame := _exhaust(root, -1.55, 0.59, 3.6, Color("ffad49"))
	flame.name = "EngineFlame"
	return {"root": root, "lower_stage": lower, "flame": flame}

static func build_orbiter(parent: Node3D) -> Node3D:
	var root := Node3D.new()
	root.name = "TransferOrbiter"
	parent.add_child(root)
	var hull := _paint(Color("dce4e9"), 0.35, 0.23)
	var steel := _paint(Color("728793"), 0.30, 0.40)
	var dark := _paint(Color("1b2430"), 0.54, 0.18)
	var glass := _paint(Color("16425c"), 0.17, 0.19)
	var cells := _paint(Color("30476e"), 0.38, 0.20)
	_cylinder(root, Vector3(0, -0.45, 0), 1.12, 3.2, hull)
	_cylinder(root, Vector3(0, 1.92, 0), 1.12, 1.55, hull, 0.43)
	_cylinder(root, Vector3(0, 1.19, 0), 1.15, 0.19, dark)
	_cylinder(root, Vector3(0, -1.8, 0), 1.14, 0.34, steel)
	_engine(root, Vector3(0, -2.16, 0), 0.63, steel, dark)
	_sphere(root, Vector3(0, 1.71, 0.91), Vector3(0.47, 0.26, 0.14), glass)
	for side: float in [-1.0, 1.0]:
		_box(root, Vector3(side * 1.78, -0.55, 0.0), Vector3(1.5, 0.13, 0.13), steel)
		_box(root, Vector3(side * 3.21, -0.55, 0.0), Vector3(2.3, 1.72, 0.12), dark)
		for column: int in range(3):
			for row: int in range(2):
				_box(root, Vector3(side * (2.48 + float(column) * 0.72), -0.96 + float(row) * 0.82, 0.073),
					Vector3(0.67, 0.73, 0.045), cells)
	return root

## Dedicated lunar/Martian lander, rather than reusing an ascent rocket with thin rods.
## Lightweight metallic PBR surfaces and retractable landing legs are fully offline.
static func build_lander(parent: Node3D) -> Dictionary:
	var root: Node3D = Node3D.new()
	root.name = "GigaOrbitLander"
	parent.add_child(root)
	var white: Material = _paint(Color("edf2f6"), 0.27, 0.55)
	var steel: Material = _paint(Color("8da2b5"), 0.28, 0.70)
	var foil: Material = _paint(Color("d4ad58"), 0.43, 0.31)
	var dark: Material = _paint(Color("142538"), 0.20, 0.58)
	var glass: Material = _paint(Color("153b64"), 0.08, 0.44)
	# Faceted gold descent stage, silver pressure cabin and rounded top hatch.
	_cylinder(root, Vector3(0, 1.25, 0), 1.60, 1.65, foil)
	_cylinder(root, Vector3(0, 2.40, 0), 1.08, 1.85, white)
	_cylinder(root, Vector3(0, 3.42, 0), 1.02, 0.25, steel)
	_sphere(root, Vector3(0, 3.58, 0), Vector3(1.0, 0.42, 1.0), white)
	_cylinder(root, Vector3(0, 0.40, 0), 0.72, 0.55, dark)
	for side: float in [-1.0, 1.0]:
		_cylinder(root, Vector3(side * 0.92, 1.18, 0), 0.24, 0.75, steel)
		_box(root, Vector3(side * 0.72, 2.6, -0.80), Vector3(0.40, 0.24, 0.06), dark)
	for y: float in [2.30, 2.83]:
		_sphere(root, Vector3(0, y, -1.02), Vector3(0.38, 0.30, 0.12), glass)
	# Low-cost scientific antennas, docking details and gold engine hardware.
	_cylinder(root, Vector3(0.40, 4.08, 0.15), 0.045, 1.0, steel)
	_sphere(root, Vector3(0.40, 4.55, 0.15), Vector3(0.14, 0.14, 0.14), steel)
	_box(root, Vector3(0, 0.85, -1.32), Vector3(1.0, 0.48, 0.15), foil)
	_engine(root, Vector3(0, 0.44, 0), 0.59, steel, dark)
	for side: float in [-1.0, 1.0]:
		for row: int in range(3):
			_box(root, Vector3(side * 0.84, 0.85 + float(row) * 0.30, 1.30), Vector3(0.72, 0.18, 0.25), foil)
	_box(root, Vector3(0, 1.95, 0.95), Vector3(0.51, 0.70, 0.18), steel)
	for rung: int in range(5):
		_box(root, Vector3(0, 0.2 + float(rung) * 0.33, 1.48), Vector3(0.43, 0.055, 0.09), steel)
	var legs: Array[Node3D] = []
	for sx: float in [-1.0, 1.0]:
		for sz: float in [-1.0, 1.0]:
			var gear: Node3D = Node3D.new()
			root.add_child(gear)
			var foot := Vector3(sx * 2.23, -0.20, sz * 2.23)
			_strut(gear, Vector3(sx * 0.93, 1.65, sz * 0.93), foot, 0.087, steel)
			_strut(gear, Vector3(sx * 0.86, 0.80, sz * 0.86), foot, 0.052, dark)
			_cylinder(gear, foot, 0.43, 0.16, foil, 0.34)
			legs.append(gear)
	var flame := _exhaust(root, -0.72, 0.39, 1.6, Color("72c9ff"))
	flame.name = "LanderThruster"
	flame.visible = false
	return {"root": root, "flame": flame, "gear_nodes": legs}

static func build_rover(parent: Node3D) -> Dictionary:
	var rover := Node3D.new()
	rover.name = "LunarSampleRover"
	parent.add_child(rover)
	var chassis := _paint(Color("d5d8d2"), 0.44, 0.31)
	var steel := _paint(Color("a0a6a8"), 0.35, 0.30)
	var rubber := _paint(Color("2a3034"), 0.90, 0.05)
	var foil := _paint(Color("c69a52"), 0.49, 0.26)
	_box(rover, Vector3(0, 0.64, 0), Vector3(1.46, 0.32, 2.60), chassis)
	_box(rover, Vector3(0, 0.88, 0.63), Vector3(1.13, 0.41, 0.71), foil)
	_box(rover, Vector3(0, 1.02, -0.73), Vector3(1.04, 0.32, 0.46), steel)
	_box(rover, Vector3(0, 1.06, -0.23), Vector3(0.50, 0.43, 0.48), chassis)
	_sphere(rover, Vector3(0, 1.55, -0.28), Vector3(0.24, 0.27, 0.24), chassis)
	_sphere(rover, Vector3(0, 1.54, -0.47), Vector3(0.17, 0.15, 0.08), foil)
	_cylinder(rover, Vector3(0.52, 1.32, 0.84), 0.027, 0.82, steel)
	var wheels: Array[Node3D] = []
	for side: float in [-1.0, 1.0]:
		for z: float in [-0.92, 0.0, 0.92]:
			var hub := Vector3(side * 0.91, 0.37, z)
			_strut(rover, Vector3(side * 0.56, 0.72, z - 0.19), hub, 0.058, steel)
			var wheel := Node3D.new()
			wheel.position = hub
			rover.add_child(wheel)
			_cylinder(wheel, Vector3.ZERO, 0.36, 0.25, rubber).rotation.z = PI * 0.5
			_cylinder(wheel, Vector3(side * 0.128, 0, 0), 0.21, 0.036, steel).rotation.z = PI * 0.5
			for spoke: int in range(4):
				var bar := _box(wheel, Vector3(side * 0.151, 0, 0), Vector3(0.038, 0.057, 0.45), rubber)
				bar.rotation.x = PI * float(spoke) * 0.25
			wheels.append(wheel)
	return {"body": rover, "wheels": wheels}

static func _engine(parent: Node3D, point: Vector3, radius: float, steel: Material, dark: Material) -> void:
	_cylinder(parent, point, radius, radius * 1.42, steel, radius * 0.50)
	_cylinder(parent, point + Vector3(0, -radius * 0.72, 0), radius, radius * 0.14, dark)
	_cylinder(parent, point + Vector3(0, radius * 0.25, 0), radius * 0.73, radius * 0.19, dark)

static func _strut(parent: Node3D, a: Vector3, b: Vector3, radius: float, mat: Material) -> void:
	var leg := _cylinder(parent, (a + b) * 0.5, radius, a.distance_to(b), mat)
	leg.quaternion = Quaternion(Vector3.UP, (a - b).normalized())

static func _exhaust(parent: Node3D, y: float, radius: float, length: float, color: Color) -> MeshInstance3D:
	var outer: StandardMaterial3D = _glow(color)
	outer.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	outer.albedo_color.a = 0.46
	var plume := _cylinder(parent, Vector3(0, y, 0), 0.0, length, outer, radius)
	_cylinder(plume, Vector3(0, length * 0.14, 0), 0.0, length * 0.70, _glow(Color("fff1d1")), radius * 0.66)
	plume.visible = false
	return plume

static func _paint(color: Color, roughness: float, metallic: float) -> StandardMaterial3D:
	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = roughness
	mat.metallic = metallic
	return mat

static func _glow(color: Color) -> StandardMaterial3D:
	var mat: StandardMaterial3D = _paint(color, 0.8, 0.0)
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	return mat

static func _cylinder(parent: Node3D, pos: Vector3, radius: float, height: float, mat: Material, top_radius: float = -1.0) -> MeshInstance3D:
	var mesh: CylinderMesh = CylinderMesh.new()
	mesh.height = height
	mesh.top_radius = radius if top_radius < 0.0 else top_radius
	mesh.bottom_radius = radius
	mesh.radial_segments = 36
	mesh.rings = 2
	return _mesh(parent, mesh, pos, mat)

static func _sphere(parent: Node3D, pos: Vector3, scale3: Vector3, mat: Material) -> MeshInstance3D:
	var mesh: SphereMesh = SphereMesh.new()
	mesh.radial_segments = 24
	mesh.rings = 12
	var instance: MeshInstance3D = _mesh(parent, mesh, pos, mat)
	instance.scale = scale3
	return instance

static func _box(parent: Node3D, pos: Vector3, dimensions: Vector3, mat: Material) -> MeshInstance3D:
	var mesh: BoxMesh = BoxMesh.new()
	mesh.size = dimensions
	return _mesh(parent, mesh, pos, mat)

static func _mesh(parent: Node3D, mesh: Mesh, pos: Vector3, mat: Material) -> MeshInstance3D:
	var obj: MeshInstance3D = MeshInstance3D.new()
	obj.mesh = mesh
	obj.position = pos
	obj.material_override = mat
	parent.add_child(obj)
	return obj
