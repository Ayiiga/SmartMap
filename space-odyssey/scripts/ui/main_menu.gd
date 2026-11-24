extends Control
## Clean cinematic Android menu: one primary launch CTA and useful secondary destinations.
const UI = preload("res://scripts/ui/space_ui.gd")

func _ready() -> void:
	UI.backdrop(self)
	var margin: MarginContainer = MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	for edge: String in ["left", "right"]:
		margin.add_theme_constant_override("margin_%s" % edge, 36)
	for edge: String in ["top", "bottom"]:
		margin.add_theme_constant_override("margin_%s" % edge, 24)
	add_child(margin)
	var page: HBoxContainer = HBoxContainer.new()
	page.add_theme_constant_override("separation", 30)
	margin.add_child(page)
	var hero: VBoxContainer = VBoxContainer.new()
	hero.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hero.add_theme_constant_override("separation", 15)
	page.add_child(hero)
	var brand: HBoxContainer = HBoxContainer.new()
	brand.add_theme_constant_override("separation", 14)
	hero.add_child(brand)
	var icon: TextureRect = TextureRect.new()
	icon.texture = preload("res://assets/textures/gigaorbit-icon.webp")
	icon.custom_minimum_size = Vector2(80, 80)
	icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	brand.add_child(icon)
	var words: VBoxContainer = VBoxContainer.new()
	brand.add_child(words)
	words.add_child(UI.label("GigaOrbit", 50, UI.FG))
	words.add_child(UI.label("BEYOND EARTH · LAUNCH. EXPLORE. DISCOVER.", 17, Color("6ce1ff")))
	var blank: Control = Control.new()
	blank.size_flags_vertical = Control.SIZE_EXPAND_FILL
	hero.add_child(blank)
	hero.add_child(UI.label("YOUR NEXT ADVENTURE", 17, UI.ACCENT))
	hero.add_child(UI.label("From Earth to the Moon — then explore Mars.", 26, UI.FG))
	hero.add_child(UI.label("Launch a rocket, land safely, collect lunar samples and earn coins to upgrade your spacecraft.", 18, UI.MUTED))
	var actions: HBoxContainer = HBoxContainer.new()
	actions.add_theme_constant_override("separation", 14)
	hero.add_child(actions)
	var launch: Button = UI.button("▶  LAUNCH FROM EARTH", true)
	launch.custom_minimum_size = Vector2(255, 66)
	actions.add_child(launch)
	launch.pressed.connect(GameState.start_earth_launch)
	var resume: Button = UI.button("CONTINUE")
	resume.custom_minimum_size = Vector2(185, 66)
	resume.disabled = not GameState.can_continue()
	actions.add_child(resume)
	resume.pressed.connect(func() -> void: GameState.continue_game())
	hero.add_child(UI.label("🪙 %d COINS   ·   %d SCIENCE   ·   %d BADGES" % [GameState.coins, GameState.science_points, GameState.badges.size()], 20, Color("ffd477")))
	hero.add_child(UI.label("Offline progress · No cash prizes · No forced adverts", 14, UI.MUTED))
	var classic: Button = UI.button("CLASSIC ROCKET PILOT")
	classic.custom_minimum_size = Vector2(220, 54)
	hero.add_child(classic)
	classic.pressed.connect(func() -> void: GameState.new_rocket_game())
	var spacer: Control = Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	hero.add_child(spacer)
	var side: PanelContainer = UI.panel()
	side.custom_minimum_size = Vector2(305, 0)
	page.add_child(side)
	var nav: VBoxContainer = VBoxContainer.new()
	nav.add_theme_constant_override("separation", 12)
	side.add_child(nav)
	nav.add_child(UI.label("MISSION CONTROL", 22, Color("ffd477")))
	nav.add_child(UI.label("Crew ready: %s" % ("YES ✓" if GameState.crew_confirmed else "SELECT YOUR CREW"), 15, UI.MUTED))
	_add(nav, "ASSEMBLE 3 ASTRONAUTS", func() -> void: _open("crew_screen"))
	_add(nav, "MISSIONS & PLANETS", func() -> void: _open("missions_screen"))
	_add(nav, "FUEL & ROCKET SHOP", func() -> void: _open("workshop_screen"))
	_add(nav, "TROPHIES & AWARDS", func() -> void: _open("rewards_screen"))
	_add(nav, "SETTINGS", func() -> void: _open("settings_screen"))
	_add(nav, "EARTH TRAINING (OPTIONAL)", func() -> void: GameState.new_game())
	nav.add_child(UI.label("🌕 Moon after Earth orbit\n🔴 Mars after Moon + upgrades\n🪐 Europa, Titan and outer planets", 14, UI.MUTED))

func _add(parent: VBoxContainer, caption: String, callback: Callable) -> void:
	var button: Button = UI.button(caption)
	button.custom_minimum_size.y = 55.0
	parent.add_child(button)
	button.pressed.connect(callback)

func _open(name: String) -> void:
	get_tree().change_scene_to_file("res://scenes/ui/%s.tscn" % name)

func _notification(what: int) -> void:
	if what == NOTIFICATION_WM_GO_BACK_REQUEST:
		get_tree().quit()
