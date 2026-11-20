extends Control
## Rocket design plus coin-earned upgrades. All currency is virtual, saved offline.
const UI = preload("res://scripts/ui/space_ui.gd")
const RocketMath = preload("res://scripts/rocket/rocket_math.gd")
var _tanks: SpinBox
var _boosters: SpinBox
var _summary: Label
var _balance: Label
var _message: Label
var _upgrade_buttons: Dictionary = {}

func _ready() -> void:
	UI.backdrop(self)
	var margins: MarginContainer = MarginContainer.new()
	margins.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for side: String in ["left", "right", "top", "bottom"]:
		margins.add_theme_constant_override("margin_%s" % side, 20)
	add_child(margins)
	var page: VBoxContainer = VBoxContainer.new()
	page.add_theme_constant_override("separation", 10)
	margins.add_child(page)
	page.add_child(UI.label("ROCKET WORKSHOP  ·  BUILD FOR MARS", 34, Color("f2ca70")))
	_balance = UI.label("", 21, UI.ACCENT)
	page.add_child(_balance)
	var scroll: ScrollContainer = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	page.add_child(scroll)
	var content_col: VBoxContainer = VBoxContainer.new()
	content_col.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content_col.add_theme_constant_override("separation", 11)
	scroll.add_child(content_col)
	var design: PanelContainer = UI.panel()
	content_col.add_child(design)
	var design_col: VBoxContainer = VBoxContainer.new()
	design.add_child(design_col)
	design_col.add_child(UI.label("STAGE 1 · LAUNCH ROCKET DESIGN", 23, UI.ACCENT))
	var grid: GridContainer = GridContainer.new()
	grid.columns = 2
	design_col.add_child(grid)
	grid.add_child(UI.label("Fuel tanks 1–3", 18))
	_tanks = _spinner(1, 3, int(GameState.rocket_design.get("fuel_tanks", 1)))
	grid.add_child(_tanks)
	grid.add_child(UI.label("Solid boosters 0–2", 18))
	_boosters = _spinner(0, 2, int(GameState.rocket_design.get("boosters", 0)))
	grid.add_child(_boosters)
	_summary = UI.label("", 17, UI.MUTED)
	design_col.add_child(_summary)
	var save: Button = UI.button("SAVE ROCKET DESIGN", true)
	design_col.add_child(save)
	save.pressed.connect(_save)
	_tanks.value_changed.connect(func(_v: float) -> void: _recalculate())
	_boosters.value_changed.connect(func(_v: float) -> void: _recalculate())
	content_col.add_child(UI.label("STAGE 2 · UNLOCK DISTANT PLANETS", 24, Color("f5ca6a")))
	content_col.add_child(UI.label("Earn game coins from missions, then upgrade the engine and landing gear to unlock Mars.", 16, UI.MUTED))
	for item: String in ["engine", "fuel", "landing_gear"]:
		var upgrade_panel: PanelContainer = UI.panel()
		content_col.add_child(upgrade_panel)
		var row: HBoxContainer = UI.row()
		upgrade_panel.add_child(row)
		var title: Label = UI.label(item.replace("_", " ").to_upper(), 21, UI.ACCENT)
		title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(title)
		var button: Button = UI.button("UPGRADE")
		row.add_child(button)
		button.pressed.connect(_purchase.bind(item))
		_upgrade_buttons[item] = button
	_message = UI.label("First successful Moon landing gives 800 game coins. No real-money purchases.", 16, Color("a9f1d8"))
	content_col.add_child(_message)
	_recalculate()
	_refresh()
	var buttons: HBoxContainer = UI.row()
	page.add_child(buttons)
	var next: Button = UI.button("MISSION MAP", true)
	buttons.add_child(next)
	next.pressed.connect(func() -> void: get_tree().change_scene_to_file("res://scenes/ui/missions_screen.tscn"))
	var exit: Button = UI.button("BACK TO MENU")
	buttons.add_child(exit)
	exit.pressed.connect(func() -> void: get_tree().change_scene_to_file(GameState.MENU))

func _spinner(low: int, high: int, current: int) -> SpinBox:
	var spin: SpinBox = SpinBox.new()
	spin.min_value = low
	spin.max_value = high
	spin.step = 1.0
	spin.value = clampi(current, low, high)
	spin.custom_minimum_size = Vector2(225, 48)
	return spin

func _recalculate() -> void:
	var stats: Dictionary = RocketMath.estimate(int(_tanks.value), int(_boosters.value))
	_summary.text = "LAUNCH MASS %.0f kg   ·   IDEAL DELTA-V %.0f m/s" % [stats["wet_mass_kg"], stats["ideal_delta_v_m_s"]]

func _save() -> void:
	GameState.rocket_design = {"fuel_tanks": int(_tanks.value), "boosters": int(_boosters.value)}
	GameState.save_local()
	_message.text = "Launch design saved for your next rocket mission."

func _purchase(item: String) -> void:
	var cost: int = GameState.upgrade_price(item)
	if GameState.buy_upgrade(item):
		GameAudio.effect("success")
		_message.text = "%s upgraded! Spent %d earned coins." % [item.replace("_", " ").capitalize(), cost]
	else:
		_message.text = "Not enough earned game coins or maximum upgrade level reached."
	_refresh()

func _refresh() -> void:
	_balance.text = "GAME COINS: %d     |     MARS: %s" % [GameState.coins, "UNLOCKED" if GameState.planet_unlocked("mars") else "ENGINE + LANDING GEAR LEVEL 2 REQUIRED"]
	for item: String in _upgrade_buttons:
		var button: Button = _upgrade_buttons[item] as Button
		var level: int = int(GameState.upgrades.get(item, 1))
		button.text = "LEVEL %d  ✓" % level if level >= 3 else "LVL %d → %d   |   %d COINS" % [level, level + 1, GameState.upgrade_price(item)]
		button.disabled = not GameState.can_upgrade(item)

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		get_tree().change_scene_to_file(GameState.MENU)
