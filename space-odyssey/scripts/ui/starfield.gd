extends Control
## Entirely local, cheap animated 2D starfield for menus; no asset requests.
var _stars: Array[Vector3] = []
var _time: float = 0.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var random: RandomNumberGenerator = RandomNumberGenerator.new()
	random.seed = 8052026
	for i in range(95):
		_stars.append(Vector3(random.randf(), random.randf(), random.randf_range(0.6, 2.0)))

func _process(delta: float) -> void:
	_time += delta
	queue_redraw()

func _draw() -> void:
	if size.x < 2.0 or size.y < 2.0:
		return
	draw_circle(Vector2(size.x * 0.26, size.y * 0.65), minf(size.x, size.y) * 0.31, Color(0.07, 0.21, 0.40, 0.19))
	draw_circle(Vector2(size.x * 0.24, size.y * 0.69), minf(size.x, size.y) * 0.23, Color(0.10, 0.29, 0.52, 0.46))
	draw_arc(Vector2(size.x * 0.24, size.y * 0.69), minf(size.x, size.y) * 0.239, 0.2, 6.1, 96, Color(0.36, 0.65, 0.90, 0.45), 2.0, true)
	for i in range(_stars.size()):
		var star: Vector3 = _stars[i]
		var opacity: float = clampf(0.38 + 0.24 * sin(_time * 1.4 + float(i) * 0.7), 0.12, 0.75)
		draw_circle(Vector2(star.x * size.x, star.y * size.y), star.z * 0.6, Color(0.80, 0.91, 1.0, opacity))
