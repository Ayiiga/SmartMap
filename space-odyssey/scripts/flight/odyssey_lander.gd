extends RefCounted
class_name OdysseyLander
## Simplified local 2D descent physics, measured in metres, seconds and kg-equivalent fuel.
## Not an orbital integrator: long-distance transfers use a separate guided mission screen.

const INITIAL_FUEL: float = 75.0
const MAX_SPEED_SIDE: float = 13.0
var planet: String = "moon"
var altitude_m: float = 280.0
var vertical_velocity_m_s: float = -11.0
var horizontal_m: float = 4.0
var horizontal_velocity_m_s: float = 0.0
var fuel: float = INITIAL_FUEL
var fuel_capacity: float = INITIAL_FUEL
var throttle: float = 0.0
var landed: bool = false
var crashed: bool = false
var legs: bool = false
var elapsed: float = 0.0
var gear_level: int = 1
var engine_level: int = 1

func configure(world: String, gear: int, engine: int, tanks: int) -> void:
	planet = world if world in ["moon", "mars"] else "moon"
	gear_level = clampi(gear, 1, 3)
	engine_level = clampi(engine, 1, 3)
	fuel_capacity = INITIAL_FUEL + float(clampi(tanks, 1, 3) - 1) * 28.0
	fuel = fuel_capacity
	altitude_m = 320.0 if planet == "mars" else 280.0
	vertical_velocity_m_s = -14.0 if planet == "mars" else -11.0
	horizontal_m = -12.0 if planet == "mars" else 10.0
	horizontal_velocity_m_s = 0.0
	throttle = 0.2
	landed = false
	crashed = false
	legs = false
	elapsed = 0.0

func gravity() -> float:
	return 3.71 if planet == "mars" else 1.62

func acceleration() -> float:
	return (13.2 if planet == "mars" else 9.0) * (1.0 + float(engine_level - 1) * 0.13)

func fuel_percent() -> int:
	return roundi(100.0 * fuel / maxf(1.0, fuel_capacity))

func safe_vertical_speed() -> float:
	return 5.2 + float(gear_level - 1) * 0.65

func set_throttle(value: float) -> void:
	throttle = clampf(value, 0.0, 1.0)

func deploy_legs() -> bool:
	if landed or crashed:
		return false
	legs = true
	return true

func advance(delta: float, steer: float) -> String:
	if landed or crashed:
		return "landed" if landed else "crashed"
	var dt: float = clampf(delta, 0.0, 0.06)
	if dt == 0.0:
		return "descending"
	elapsed += dt
	var real_throttle: float = throttle if fuel > 0.0 else 0.0
	var consumption: float = real_throttle * (0.98 + 0.12 * float(engine_level)) * dt
	fuel = maxf(0.0, fuel - consumption)
	vertical_velocity_m_s += (real_throttle * acceleration() - gravity()) * dt
	vertical_velocity_m_s = clampf(vertical_velocity_m_s, -43.0, 21.0)
	altitude_m += vertical_velocity_m_s * dt
	var axis: float = clampf(steer, -1.0, 1.0)
	horizontal_velocity_m_s += axis * 8.5 * dt
	horizontal_velocity_m_s -= horizontal_velocity_m_s * minf(1.0, dt * 0.6)
	horizontal_velocity_m_s = clampf(horizontal_velocity_m_s, -MAX_SPEED_SIDE, MAX_SPEED_SIDE)
	horizontal_m += horizontal_velocity_m_s * dt
	if altitude_m > 0.0:
		return "descending"
	altitude_m = 0.0
	var inside_zone: bool = absf(horizontal_m) <= 10.0
	var stable: bool = absf(horizontal_velocity_m_s) <= 5.0 and absf(vertical_velocity_m_s) <= safe_vertical_speed()
	if inside_zone and stable and legs:
		landed = true
		return "landed"
	crashed = true
	return "crashed"

func grade() -> String:
	if not landed:
		return ""
	var descent: float = absf(vertical_velocity_m_s)
	var drift: float = absf(horizontal_velocity_m_s)
	if descent <= 1.7 and drift < 1.2 and absf(horizontal_m) < 2.5 and fuel_percent() > 35:
		return "S"
	if descent <= 2.5 and drift < 2.5 and absf(horizontal_m) < 5.0:
		return "A+"
	if descent <= 3.4 and drift < 3.5:
		return "A"
	if descent <= 4.2:
		return "B"
	return "C"

func snapshot() -> Dictionary:
	return {
		"planet": planet, "altitude": altitude_m,
		"speed_y": vertical_velocity_m_s,
		"x": horizontal_m, "speed_x": horizontal_velocity_m_s,
		"fuel": fuel, "fuel_capacity": fuel_capacity, "throttle": throttle,
		"legs": legs, "elapsed": elapsed, "gear": gear_level, "engine": engine_level
	}

func restore(data: Dictionary) -> bool:
	if str(data.get("planet", "")) != planet:
		return false
	altitude_m = clampf(float(data.get("altitude", altitude_m)), 40.0, 800.0)
	vertical_velocity_m_s = clampf(float(data.get("speed_y", -8.0)), -20.0, 7.0)
	horizontal_m = clampf(float(data.get("x", horizontal_m)), -42.0, 42.0)
	horizontal_velocity_m_s = clampf(float(data.get("speed_x", 0.0)), -8.0, 8.0)
	fuel = clampf(float(data.get("fuel", fuel)), 0.0, fuel_capacity)
	throttle = clampf(float(data.get("throttle", 0.5)), 0.0, 1.0)
	legs = bool(data.get("legs", false))
	elapsed = maxf(0.0, float(data.get("elapsed", 0.0)))
	crashed = false
	landed = false
	return true
