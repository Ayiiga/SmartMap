extends RefCounted
## Reusable touch-friendly controls, local visual style; no plugins.
const STARS = preload("res://scripts/ui/starfield.gd")
const SURFACE: Color = Color("142740")
const ACCENT: Color = Color("52b8ff")
const FG: Color = Color("f5f8ff")
const MUTED: Color = Color("b7c9db")

static func backdrop(root: Control) -> void:
	var background: ColorRect = ColorRect.new()
	background.color = Color("071221")
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(background)
	var stars: Control = STARS.new()
	stars.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(stars)

static func label(text: String, font_size: int = 21, color: Color = FG) -> Label:
	var l: Label = Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", font_size)
	l.add_theme_color_override("font_color", color)
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	return l

static func button(text: String, accent: bool = false) -> Button:
	var b: Button = Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(235, 55)
	b.add_theme_font_size_override("font_size", 19)
	b.add_theme_color_override("font_color", FG)
	var normal: StyleBoxFlat = StyleBoxFlat.new()
	normal.bg_color = Color("955e1b") if accent else SURFACE
	normal.border_color = Color("f6c46b") if accent else Color("3c608d")
	normal.set_border_width_all(2 if accent else 1)
	normal.set_corner_radius_all(14)
	normal.content_margin_left = 18.0
	normal.content_margin_right = 18.0
	b.add_theme_stylebox_override("normal", normal)
	var hover: StyleBoxFlat = normal.duplicate()
	hover.bg_color = Color("b67c2a") if accent else Color("244663")
	b.add_theme_stylebox_override("hover", hover)
	var pressed: StyleBoxFlat = hover.duplicate()
	pressed.bg_color = Color("6f4818")
	b.add_theme_stylebox_override("pressed", pressed)
	var disabled: StyleBoxFlat = normal.duplicate()
	disabled.bg_color = Color("24303e")
	b.add_theme_stylebox_override("disabled", disabled)
	return b

static func panel() -> PanelContainer:
	var p: PanelContainer = PanelContainer.new()
	var style: StyleBoxFlat = StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.09, 0.19, 0.95)
	style.border_color = Color("4b719b")
	style.set_border_width_all(1)
	style.set_corner_radius_all(20)
	style.content_margin_left = 22.0
	style.content_margin_right = 22.0
	style.content_margin_top = 18.0
	style.content_margin_bottom = 18.0
	p.add_theme_stylebox_override("panel", style)
	return p

static func centered_page(root: Control, title: String, subtitle: String, max_width: float = 850.0) -> VBoxContainer:
	backdrop(root)
	var margin: MarginContainer = MarginContainer.new()
	margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	margin.add_theme_constant_override("margin_left", 35)
	margin.add_theme_constant_override("margin_right", 35)
	margin.add_theme_constant_override("margin_top", 25)
	margin.add_theme_constant_override("margin_bottom", 25)
	root.add_child(margin)
	var center: CenterContainer = CenterContainer.new()
	margin.add_child(center)
	var p: PanelContainer = panel()
	p.custom_minimum_size.x = minf(max_width, 960.0)
	center.add_child(p)
	var col: VBoxContainer = VBoxContainer.new()
	col.add_theme_constant_override("separation", 14)
	p.add_child(col)
	col.add_child(label(title, 36))
	col.add_child(label(subtitle, 17, MUTED))
	return col

static func row() -> HBoxContainer:
	var h: HBoxContainer = HBoxContainer.new()
	h.add_theme_constant_override("separation", 15)
	return h

static func separator() -> HSeparator:
	var s: HSeparator = HSeparator.new()
	s.custom_minimum_size.y = 4
	return s
