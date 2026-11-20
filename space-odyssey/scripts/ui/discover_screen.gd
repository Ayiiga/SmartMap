extends Control
const UI = preload("res://scripts/ui/space_ui.gd")

func _ready() -> void:
	var col: VBoxContainer = UI.centered_page(self, "DISCOVER", "Encyclopedia · Stored offline in the project", 950)
	var scroll: ScrollContainer = ScrollContainer.new()
	scroll.custom_minimum_size.y = 355
	col.add_child(scroll)
	var facts: VBoxContainer = VBoxContainer.new()
	facts.add_theme_constant_override("separation", 14)
	scroll.add_child(facts)
	_card(facts, "EARTH  ·  Homeworld", "Mean radius: 6,371 km   •   Surface gravity: 9.81 m/s²\nAtmosphere and oceans support liquid-water ecosystems.")
	_card(facts, "MOON  ·  First expedition target", "Mean radius: 1,737 km   •   Surface gravity: 1.62 m/s²\nNo breathable atmosphere. Its cratered highlands preserve ancient impacts.")
	_card(facts, "MARS  ·  Later expedition", "Mean radius: 3,390 km   •   Surface gravity: 3.71 m/s²\nA cold, dusty world with the Solar System's largest volcano, Olympus Mons.")
	facts.add_child(UI.label("Space travel in the planned game uses simplified physics; facts above are approximate.", 16, UI.MUTED))
	var back: Button = UI.button("BACK TO MENU")
	col.add_child(back)
	back.pressed.connect(func() -> void: get_tree().change_scene_to_file(GameState.MENU))

func _card(parent: VBoxContainer, title: String, detail: String) -> void:
	var p: PanelContainer = UI.panel()
	parent.add_child(p)
	var c: VBoxContainer = VBoxContainer.new()
	p.add_child(c)
	c.add_child(UI.label(title, 22, UI.ACCENT))
	c.add_child(UI.label(detail, 17, UI.FG))
