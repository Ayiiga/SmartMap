extends Control
## Offline dual-axis flight joystick. Tracks one touch without stealing other buttons.
signal axis_changed(direction: Vector2)
const RADIUS: float = 59.0
var _finger: int = -1
var _axis: Vector2 = Vector2.ZERO

func _ready() -> void:
	name = "FlightStick"
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_process_input(true)

func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var touch: InputEventScreenTouch = event
		if touch.pressed and not touch.canceled and _finger == -1 and get_global_rect().has_point(touch.position):
			_finger = touch.index
			_update_axis(touch.position)
		elif (not touch.pressed or touch.canceled) and touch.index == _finger:
			reset_touch()
	elif event is InputEventScreenDrag:
		var drag: InputEventScreenDrag = event
		if drag.index == _finger:
			_update_axis(drag.position)

func reset_touch() -> void:
	_finger = -1
	_axis = Vector2.ZERO
	axis_changed.emit(_axis)
	queue_redraw()

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_APPLICATION_FOCUS_OUT:
		reset_touch()

func _update_axis(global_point: Vector2) -> void:
	var center: Vector2 = get_global_rect().get_center()
	_axis = ((global_point - center) / RADIUS).limit_length(1.0)
	if _axis.length_squared() < 0.012:
		_axis = Vector2.ZERO
	axis_changed.emit(_axis)
	queue_redraw()

func _draw() -> void:
	var center: Vector2 = size * 0.5
	draw_circle(center, RADIUS + 14.0, Color(0.035, 0.08, 0.18, 0.58))
	draw_arc(center, RADIUS, 0.0, TAU, 48, Color(0.35, 0.78, 1.0, 0.88), 3.0, true)
	draw_line(center + Vector2(-45, 0), center + Vector2(45, 0), Color(0.35, 0.78, 1.0, 0.22), 2.0)
	draw_line(center + Vector2(0, -45), center + Vector2(0, 45), Color(0.35, 0.78, 1.0, 0.22), 2.0)
	draw_circle(center + _axis * RADIUS * 0.78, 25.0, Color(0.39, 0.83, 1.0, 0.95))
