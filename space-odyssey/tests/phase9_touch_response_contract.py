"""Regression checks for responsive Android touch controls and settings persistence."""
from pathlib import Path
base = Path(__file__).resolve().parents[1]
mission = (base / "scripts/world/photo_mission.gd").read_text()
expedition = (base / "scripts/world/photo_expedition.gd").read_text()
settings = (base / "scripts/ui/settings_screen.gd").read_text()
for name, source in [("Earth-Moon mission", mission), ("Planetary expeditions", expedition)]:
    assert "func _touch_button(button: Button)" in source, name
    assert "BaseButton.ACTION_MODE_BUTTON_PRESS" in source, name
    assert "Control.FOCUS_NONE" in source, name
    for action in ("_main_action", "_secondary_action", "_cycle_camera"):
        assert f".pressed.connect({action})" in source, (name, action)
assert 'func _secondary_action() -> void:\n\tif _paused:\n\t\treturn' in expedition
assert "func _flush_settings()" in settings
assert "_save_timer.wait_time = 0.35" in settings
assert "GameState.apply_settings()" in settings
assert "_save_timer.start()" in settings
assert "NOTIFICATION_APPLICATION_PAUSED" in settings
assert "GameState.save_settings()" in settings
assert "slider.value_changed.connect(func(_value: float) -> void: _save())" in settings
print("PASS: immediate flight touch buttons, pause guard, and batched settings saves")
