extends RefCounted
## Shared flight and waypoint behavior for the photographic routes.
const LAUNCHPAD = preload("res://assets/textures/earth-launchpad.webp")
const CLOUDS = preload("res://assets/textures/earth-cloud-deck.webp")
const ORBIT = preload("res://assets/textures/earth-orbit.webp")
const DARK_SKY = Color(0.34, 0.45, 0.72)
const STAGES: Array[String] = ["LIFTOFF", "CLOUD DECK", "UPPER ATMOSPHERE", "EDGE OF SPACE"]

static func ascent_stage(altitude: float) -> int:
	if altitude < 4500.0:
		return 0
	if altitude < 25000.0:
		return 1
	return 2 if altitude < 85000.0 else 3

static func ascent_texture(stage: int) -> Texture2D:
	match stage:
		0: return LAUNCHPAD
		1, 2: return CLOUDS
		_: return ORBIT

static func landing_step(height: float, descent: float, offset: float, steering: float, brake: bool, assisted: bool, delta: float) -> Vector2:
	if not assisted:
		return Vector2(clampf(descent + (0.95 - (7.0 if brake else 0.0)) * delta, 0.5, 16.0),
			clampf(offset + steering * 11.0 * delta, -60.0, 60.0))
	var target_speed: float = lerpf(3.2, 11.0, clampf(height / 110.0, 0.0, 1.0))
	if brake:
		target_speed = maxf(2.0, target_speed * 0.48)
	var side: float = clampf(offset + steering * 13.0 * delta, -45.0, 45.0)
	if absf(steering) < 0.13:
		side = move_toward(side, 0.0, 6.5 * delta)
	return Vector2(move_toward(descent, target_speed, 6.5 * delta), side)

static func movement(axis: Vector2) -> float:
	return axis.x if absf(axis.x) >= absf(axis.y) else -axis.y

static func waypoint(points: Array[float], visited: Array[bool], position: float) -> int:
	var next: int = -1
	for i: int in range(points.size()):
		if not visited[i] and (next < 0 or absf(points[i] - position) < absf(points[next] - position)):
			next = i
	return next

static func marker_text(caption: String, goal: float, position: float, reach: float) -> String:
	var gap: float = goal - position
	if absf(gap) <= reach:
		return "◎  %s · IN REACH" % caption
	return "%s %s · %d m" % ["→" if gap > 0.0 else "←", caption, ceili(absf(gap))]

static func touch_target(buttons: Array[Button], point: Vector2) -> Button:
	for button: Button in buttons:
		if is_instance_valid(button) and button.is_visible_in_tree() and not button.disabled and button.get_global_rect().has_point(point):
			return button
	return null
