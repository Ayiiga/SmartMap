extends Control
## Flight director cue for the time-compressed translunar transfer.

var _error: Vector2 = Vector2.ZERO
var _aligned: bool = false

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE

func update_course(error: Vector2, aligned: bool) -> void:
	_error = error
	_aligned = aligned
	queue_redraw()

func _draw() -> void:
	var center: Vector2 = size * 0.5
	var track := Color("a8d7ee")
	var aim := Color("a3f6cf") if _aligned else Color("ffd584")
	draw_circle(center, 33.0, Color(0.025, 0.065, 0.12, 0.57))
	draw_arc(center, 31.0, 0, TAU, 40, track, 1.4, true)
	draw_arc(center, 11.0, 0, TAU, 24, track, 1.2, true)
	for direction: Vector2 in [Vector2.UP, Vector2.DOWN, Vector2.LEFT, Vector2.RIGHT]:
		draw_line(center + direction * 19.0, center + direction * 42.0, track, 1.8, true)
	var ship: Vector2 = center + _error.limit_length() * 28.0
	draw_line(ship + Vector2(-11, 0), ship + Vector2(11, 0), aim, 2.0, true)
	draw_circle(ship, 3.8, aim)
