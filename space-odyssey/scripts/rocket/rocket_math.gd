extends RefCounted
## The same two-stage sizing model used in Phase 2 flight.
## Ideal delta-v ignores gravity, aerodynamic drag and steering losses.
const G0: float = 9.80665
const STAGE_ONE_EXHAUST_V_M_S: float = 1360.0
const STAGE_TWO_EXHAUST_V_M_S: float = 1800.0
const UPPER_DRY_KG: float = 2800.0
const UPPER_FUEL_KG: float = 4500.0

static func estimate(tanks: int, boosters: int) -> Dictionary:
	var t: int = clampi(tanks, 1, 3)
	var b: int = clampi(boosters, 0, 2)
	var stage_one_dry: float = 3800.0 + 540.0 * float(t) + 550.0 * float(b)
	var stage_one_fuel: float = 12000.0 + 4200.0 * float(t - 1)
	var total_dry: float = stage_one_dry + UPPER_DRY_KG
	var total_fuel: float = stage_one_fuel + UPPER_FUEL_KG
	var total_wet: float = total_dry + total_fuel
	var after_first_burn: float = total_wet - stage_one_fuel
	var dv_one: float = STAGE_ONE_EXHAUST_V_M_S * log(total_wet / after_first_burn)
	var dv_two: float = STAGE_TWO_EXHAUST_V_M_S * log((UPPER_DRY_KG + UPPER_FUEL_KG) / UPPER_DRY_KG)
	return {
		"dry_mass_kg": total_dry, "fuel_kg": total_fuel,
		"wet_mass_kg": total_wet, "ideal_delta_v_m_s": dv_one + dv_two,
		"stage_one_dry_kg": stage_one_dry, "stage_one_fuel_kg": stage_one_fuel,
		"stage_two_dry_kg": UPPER_DRY_KG, "stage_two_fuel_kg": UPPER_FUEL_KG,
		"stage_one_ideal_dv_m_s": dv_one, "stage_two_ideal_dv_m_s": dv_two
	}
