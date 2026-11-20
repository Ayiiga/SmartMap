extends Control
## Two independent touch indices: joystick and camera. HUD buttons use GUI events.
signal movement_changed(value: Vector2)
signal camera_dragged(delta: Vector2)
signal jump_pressed
signal interact_pressed
signal sprint_changed(active: bool)
signal jetpack_changed(active: bool)

var _movement: Vector2 = Vector2.ZERO
var _stick_finger: int = -1
var _camera_finger: int = -1
var _camera_previous: Vector2 = Vector2.ZERO
var _sprinting: bool = false
var _controls: Array[Button] = []
const STICK_RADIUS: float = 69.0

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var buttons: GridContainer = GridContainer.new()
	buttons.columns = 2
	buttons.anchor_left = 1.0
	buttons.anchor_right = 1.0
	buttons.anchor_top = 1.0
	buttons.anchor_bottom = 1.0
	buttons.offset_left = -264.0
	buttons.offset_right = -18.0
	buttons.offset_top = -145.0
	buttons.offset_bottom = -22.0
	buttons.add_theme_constant_override("h_separation", 10)
	buttons.add_theme_constant_override("v_separation", 9)
	add_child(buttons)
	var jump: Button = _add_button(buttons, "JUMP")
	jump.pressed.connect(func() -> void: jump_pressed.emit())
	var interact: Button = _add_button(buttons, "INTERACT")
	interact.pressed.connect(func() -> void: interact_pressed.emit())
	var sprint: Button = _add_button(buttons, "SPRINT")
	sprint.pressed.connect(func() -> void:
		_sprinting = not _sprinting
		sprint.text = "RUNNING" if _sprinting else "SPRINT"
		sprint_changed.emit(_sprinting))
	var jetpack: Button = _add_button(buttons, "JETPACK")
	jetpack.button_down.connect(func() -> void: jetpack_changed.emit(true))
	jetpack.button_up.connect(func() -> void: jetpack_changed.emit(false))

func _add_button(parent: GridContainer, text: String) -> Button:
	var b: Button = Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(112, 53)
	b.add_theme_font_size_override("font_size", 17)
	b.add_theme_color_override("font_color", Color("ffffff"))
	var style: StyleBoxFlat = StyleBoxFlat.new()
	style.bg_color = Color(0.07, 0.22, 0.36, 0.90)
	style.border_color = Color("57bdff")
	style.set_border_width_all(1)
	style.set_corner_radius_all(14)
	b.add_theme_stylebox_override("normal", style)
	b.add_theme_stylebox_override("hover", style)
	b.add_theme_stylebox_override("pressed", style)
	parent.add_child(b)
	_controls.append(b)
	return b

func _stick_center() -> Vector2:
	return Vector2(107.0, size.y - 104.0)

func _over_button(position: Vector2) -> bool:
	for b: Button in _controls:
		if b.get_global_rect().has_point(position):
			return true
	return false

func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var touch: InputEventScreenTouch = event
		if touch.pressed:
			if _stick_finger == -1 and touch.position.distance_to(_stick_center()) < 110.0:
				_stick_finger = touch.index
				_update_stick(touch.position)
			elif _camera_finger == -1 and touch.position.x > size.x * 0.37 and not _over_button(touch.position):
				_camera_finger = touch.index
				_camera_previous = touch.position
		else:
			if touch.index == _stick_finger:
				_stick_finger = -1
				_movement = Vector2.ZERO
				movement_changed.emit(_movement)
				queue_redraw()
			if touch.index == _camera_finger:
				_camera_finger = -1
	elif event is InputEventScreenDrag:
		var drag: InputEventScreenDrag = event
		if drag.index == _stick_finger:
			_update_stick(drag.position)
		elif drag.index == _camera_finger:
			camera_dragged.emit(drag.position - _camera_previous)
			_camera_previous = drag.position

func _update_stick(position: Vector2) -> void:
	_movement = ((position - _stick_center()) / STICK_RADIUS).limit_length(1.0)
	movement_changed.emit(_movement)
	queue_redraw()

func _draw() -> void:
	var center: Vector2 = _stick_center()
	draw_circle(center, STICK_RADIUS + 12.0, Color(0.07, 0.25, 0.40, 0.45))
	draw_arc(center, STICK_RADIUS, 0.0, TAU, 52, Color(0.32, 0.68, 0.91, 0.72), 3.0, true)
	draw_circle(center + _movement * STICK_RADIUS * 0.62, 26.0, Color(0.38, 0.75, 1.0, 0.83))
