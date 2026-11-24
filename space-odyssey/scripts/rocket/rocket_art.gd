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
	var hull: Material = _paint(Color("e4edf1"), 0.24, 0.48)
	var dark: Material = _paint(Color("192f45"), 0.35, 0.50)
	var orange: Material = _paint(Color("e97746"), 0.45, 0.10)
	var steel: Material = _paint(Color("839aab"), 0.22, 0.68)
	var teal: Material = _paint(Color("7cced8"), 0.24, 0.42)
	var glass: Material = _paint(Color("102c52"), 0.13, 0.30)
	_cylinder(lower, Vector3(0, 4.5, 0), 1.24, 7.6, hull)
	_cylinder(lower, Vector3(0, 1.25, 0), 1.28, 0.65, dark)
	_cylinder(lower, Vector3(0, 3.0, 0), 1.255, 0.35, orange)
	_cylinder(lower, Vector3(0, 7.7, 0), 1.255, 0.25, dark)
	_cylinder(lower, Vector3(0, 0.5, 0), 0.84, 1.15, steel, 0.84)
	for i: int in range(4):
		var angle: float = TAU * float(i) / 4.0
		var a: Vector3 = Vector3(cos(angle), 0, sin(angle))
		var fin: MeshInstance3D = _box(lower, Vector3(a.x * 1.18, 1.4, a.z * 1.18), Vector3(0.32, 2.6, 1.75), orange)
		fin.rotation.y = -angle
		_cylinder(lower, Vector3(a.x * 1.38, 0.65, a.z * 1.38), 0.23, 0.85, steel)
	for i: int in range(clampi(booster_count, 0, 2)):
		var x: float = -2.1 if i == 0 else 2.1
		_cylinder(lower, Vector3(x, 3.8, 0), 0.55, 6.4, hull)
		_cylinder(lower, Vector3(x, 1.5, 0), 0.57, 0.42, orange)
		_cylinder(lower, Vector3(x, 0.7, 0), 0.35, 0.85, steel, 0.29)
		_cylinder(lower, Vector3(x, 7.5, 0), 0.55, 1.65, orange, 0.0)
		_box(lower, Vector3(x * 0.55, 3.3, 0), Vector3(1.1, 0.25, 0.35), dark)
	_cylinder(root, Vector3(0, 10.15, 0), 1.07, 4.25, hull)
	_cylinder(root, Vector3(0, 8.15, 0), 1.09, 0.35, orange)
	_cylinder(root, Vector3(0, 11.7, 0), 1.08, 0.35, dark)
	_cylinder(root, Vector3(0, 13.55, 0), 1.08, 2.55, orange, 0.02)
	for y: float in [9.3, 10.8]:
		_sphere(root, Vector3(0, y, -1.05), Vector3(0.43, 0.43, 0.14), steel)
		_sphere(root, Vector3(0, y, -1.14), Vector3(0.32, 0.32, 0.14), glass)
	_box(root, Vector3(0, 10.1, 1.05), Vector3(0.55, 0.9, 0.16), teal)
	var label: Label3D = Label3D.new()
	label.text = "GIGAORBIT 01"
	label.font_size = 44
	label.pixel_size = 0.007
	label.modulate = Color("153047")
	label.position = Vector3(0, 6.0, -1.29)
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	lower.add_child(label)
	var flame: MeshInstance3D = _cylinder(root, Vector3(0, -1.55, 0), 0.58, 3.6, _glow(Color("ffc05a")), 0.0)
	flame.name = "EngineFlame"
	flame.visible = false
	return {"root": root, "lower_stage": lower, "flame": flame}

## Dedicated lunar/Martian lander, rather than reusing an ascent rocket with thin rods.
## Lightweight metallic PBR surfaces and retractable landing legs are fully offline.
static func build_lander(parent: Node3D) -> Dictionary:
	var root: Node3D = Node3D.new()
	root.name = "GigaOrbitLander"
	parent.add_child(root)
	var white: Material = _paint(Color("edf2f6"), 0.27, 0.55)
	var steel: Material = _paint(Color("8da2b5"), 0.28, 0.70)
	var foil: Material = _paint(Color("d4ad58"), 0.43, 0.69)
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
	var legs: Array[Node3D] = []
	for sx: float in [-1.0, 1.0]:
		for sz: float in [-1.0, 1.0]:
			var gear: Node3D = Node3D.new()
			root.add_child(gear)
			var angle: float = -PI / 4.0 if sx > 0 else PI / 4.0
			var rod: MeshInstance3D = _cylinder(gear, Vector3(sx * 1.42, 0.60, sz * 1.42), 0.095, 2.6, steel)
			rod.rotation.z = angle
			_box(gear, Vector3(sx * 2.23, -0.25, sz * 2.23), Vector3(0.85, 0.15, 0.85), foil)
			legs.append(gear)
	var flame: MeshInstance3D = _cylinder(root, Vector3(0, -0.72, 0), 0.45, 1.6, _glow(Color("9deaff")), 0.0)
	flame.name = "LanderThruster"
	flame.visible = false
	return {"root": root, "flame": flame, "gear_nodes": legs}

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
