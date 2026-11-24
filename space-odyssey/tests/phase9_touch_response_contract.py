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

# Structural regression checks: native secondary touches, cancellation and camera IO.
for source in (mission, expedition):
    assert "touch.index == 0" in source
    assert "button.get_global_rect().has_point(touch.position)" in source
    assert "button.pressed.emit()" in source
    assert "touch.index == _native_brake_finger" in source
    assert "touch.canceled" in source
    assert "_reset_flight_input()" in source
    assert "_camera_save_timer.wait_time = 0.35" in source
    assert "_camera_save_timer.start()" in source
    assert "GameState.save_settings()" not in source
    assert "NOTIFICATION_APPLICATION_FOCUS_OUT" in source
stick = (base / "scripts/flight/flight_stick.gd").read_text()
assert "func reset_touch()" in stick and "touch.canceled" in stick
print("PASS: independent secondary touch route, reset hooks and deferred camera saves are wired")
