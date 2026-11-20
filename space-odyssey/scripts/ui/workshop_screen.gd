extends Control
const UI = preload("res://scripts/ui/space_ui.gd")
const RocketMath = preload("res://scripts/rocket/rocket_math.gd")
var _tanks: SpinBox
var _boosters: SpinBox
var _summary: Label
var _message: Label

func _ready() -> void:
	var col: VBoxContainer = UI.centered_page(self, "ROCKET WORKSHOP", "Phase 2: your saved fuel tank and booster choice affects the launch", 830)
	col.add_child(UI.label("TRAINER MK I", 27, UI.ACCENT))
	col.add_child(UI.label("Two-stage Trainer MK I · fuel and mass numbers match the flight engine", 17, UI.MUTED))
	var grid: GridContainer = GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 25)
	col.add_child(grid)
	grid.add_child(UI.label("Fuel tanks (1–3)", 18))
	_tanks = _spinner(1, 3, int(GameState.rocket_design.get("fuel_tanks", 1)))
	grid.add_child(_tanks)
	grid.add_child(UI.label("Solid boosters (0–2)", 18))
	_boosters = _spinner(0, 2, int(GameState.rocket_design.get("boosters", 0)))
	grid.add_child(_boosters)
	_summary = UI.label("", 19)
	col.add_child(_summary)
	_message = UI.label("", 15, Color("8bd9bb"))
	col.add_child(_message)
	_tanks.value_changed.connect(func(_v: float) -> void: _recalculate())
	_boosters.value_changed.connect(func(_v: float) -> void: _recalculate())
	_recalculate()
	var actions: HBoxContainer = UI.row()
	col.add_child(actions)
	var save: Button = UI.button("SAVE DESIGN", true)
	actions.add_child(save)
	save.pressed.connect(_save)
	var back: Button = UI.button("BACK")
	actions.add_child(back)
	back.pressed.connect(func() -> void: get_tree().change_scene_to_file(GameState.MENU))

func _spinner(min_val: int, max_val: int, current: int) -> SpinBox:
	var s: SpinBox = SpinBox.new()
	s.min_value = float(min_val)
	s.max_value = float(max_val)
	s.step = 1.0
	s.value = float(clampi(current, min_val, max_val))
	s.custom_minimum_size = Vector2(210, 50)
	return s

func _recalculate() -> void:
	var d: Dictionary = RocketMath.estimate(int(_tanks.value), int(_boosters.value))
	_summary.text = "Dry mass  %.0f kg    |    Fuel  %.0f kg\nLaunch mass  %.0f kg    |    Ideal Δv ≈ %.0f m/s" % [d["dry_mass_kg"], d["fuel_kg"], d["wet_mass_kg"], d["ideal_delta_v_m_s"]]
	_message.text = "Two-stage ideal delta-v, before gravity and drag losses. Rocket boosters are simplified."

func _save() -> void:
	GameState.rocket_design = {"fuel_tanks": int(_tanks.value), "boosters": int(_boosters.value)}
	GameState.save_local()
	_message.text = "Design saved! New launches will use these fuel tanks and boosters."
