extends Control
## Offline hand-drawn space backdrop: bright planets, orbit arcs, nebulae, star twinkles.
## Canvas draw operations only; no downloaded images, shaders or extra dependencies.
var _stars: Array[Vector3] = []
var _time: float = 0.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var random: RandomNumberGenerator = RandomNumberGenerator.new()
	random.seed = 8052026
	for i: int in range(130):
		_stars.append(Vector3(random.randf(), random.randf(), random.randf_range(0.5, 2.1)))

func _process(delta: float) -> void:
	_time += delta
	queue_redraw()

func _draw() -> void:
	if size.x < 2.0 or size.y < 2.0:
		return
	var w: float = size.x
	var h: float = size.y
	# Nebula layers provide depth without heavy real-time effects.
	for i: int in range(12, 0, -1):
		var alpha: float = (1.0 - float(i) / 13.0) * 0.013
		draw_circle(Vector2(w * 0.60, h * 0.27), h * (0.22 + float(i) * 0.038), Color(0.19, 0.10, 0.48, alpha))
		draw_circle(Vector2(w * 0.11, h * 0.76), h * (0.15 + float(i) * 0.031), Color(0.02, 0.25, 0.49, alpha * 0.7))
	# Soft-lit Earth rising over the left edge.
	var center: Vector2 = Vector2(w * 0.38, h * 1.02)
	var radius: float = minf(w, h) * 0.37
	for j: int in range(18, 0, -1):
		draw_circle(center, radius + float(j) * 2.7, Color(0.08, 0.40, 0.86, 0.008))
	draw_circle(center, radius, Color("15385c"))
	draw_circle(center + Vector2(-radius * 0.12, -radius * 0.17), radius * 0.80, Color(0.10, 0.41, 0.62, 0.71))
	for land: Vector3 in [Vector3(-0.29, -0.28, 0.19), Vector3(0.16, -0.46, 0.13), Vector3(0.38, -0.10, 0.17)]:
		draw_circle(center + Vector2(land.x * radius, land.y * radius), land.z * radius, Color(0.17, 0.57, 0.42, 0.25))
	draw_arc(center, radius * 1.02, PI * 0.90, PI * 1.97, 70, Color(0.32, 0.77, 1.0, 0.78), 3.0, true)
	# Bright nearby Mars, visible but unobtrusive behind the menu.
	var mars: Vector2 = Vector2(w * 0.83, h * 0.11)
	for ring: int in range(7, 0, -1):
		draw_circle(mars, h * 0.095 + float(ring) * 3.0, Color(0.85, 0.32, 0.12, 0.007))
	draw_circle(mars, h * 0.095, Color(0.69, 0.32, 0.16, 0.25))
	draw_arc(mars, h * 0.096, 2.3, 5.5, 70, Color(0.94, 0.53, 0.28, 0.45), 2.0, true)
	# Orbital path, accented by twinkling points.
	draw_arc(center, radius * 1.9, 3.8, 5.5, 80, Color(0.17, 0.72, 0.98, 0.32), 1.5, true)
	for i: int in range(_stars.size()):
		var star: Vector3 = _stars[i]
		var alpha: float = clampf(0.35 + 0.35 * sin(_time * 1.1 + float(i) * 0.6), 0.12, 0.90)
		var pos: Vector2 = Vector2(star.x * w, star.y * h)
		draw_circle(pos, star.z * 0.70, Color(0.81, 0.92, 1.0, alpha))
		if i % 27 == 0:
			draw_line(pos + Vector2(-5, 0), pos + Vector2(5, 0), Color(0.60, 0.88, 1.0, alpha * 0.55), 1)
			draw_line(pos + Vector2(0, -5), pos + Vector2(0, 5), Color(0.60, 0.88, 1.0, alpha * 0.55), 1)
