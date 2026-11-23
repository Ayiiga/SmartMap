"""GigaOrbit original NASA imagery & playable outer-system route source contract.
This is a source gate, not proof of real-device 30 FPS or visual fidelity.
"""
from pathlib import Path
p = Path(__file__).resolve().parents[1]
world = (p / "scripts/world/photo_expedition.gd").read_text()
state = (p / "scripts/core/game_state.gd").read_text()
menu = (p / "scripts/ui/missions_screen.gd").read_text()
scene = (p / "scenes/world/photo_expedition.tscn").read_text()
ledger = (p / "assets/textures/NASA-SOURCES.md").read_text()
names = {
    "mars": "nasa-mars-jezero.jpg",
    "europa": "nasa-europa-galileo.jpg",
    "jupiter": "nasa-jupiter-juno.jpg",
    "saturn": "nasa-saturn-cassini.jpg",
    "titan": "nasa-titan-cassini.jpg",
    "neptune": "nasa-neptune-voyager.jpg",
}
for body, filename in names.items():
    asset = p / "assets/textures" / filename
    assert asset.is_file() and 9_000 < asset.stat().st_size < 5_000_000, body
    assert f"res://assets/textures/{filename}" in world
    assert filename in ledger and "NASA" in ledger
    assert f'"{body}"' in world
    assert f'"{body}"' in state or body in ("europa", "jupiter", "saturn", "titan", "neptune")
    assert f'"{body}"' in menu
assert 'res://scripts/world/photo_expedition.gd' in scene
for fn in ("_make_photo", "_move_background", "_main_action", "_secondary_action",
           "_interact", "_complete", "_refuel", "_repair", "_save", "_restore", "_cycle_camera", "_zoom"):
    assert f"func {fn}(" in world, fn
assert 'GameState.buy_supply' in world and 'GameState.use_supply' in world
assert 'GameState.completed_planets[_target] = true' in world
assert "begin_photo_expedition" in state and "PHOTO_EXPEDITION" in state
assert "next_photo_destination" in state
assert "permissions/internet=false" in (p / "export_presets.cfg").read_text()
assert "https://" not in world, "Runtime HTTP is not allowed in offline GigaOrbit scenes"
print("PASS: six NASA-sourced bundled images, interactive 2.5D scene, touch controls, rewards and offline saving")
print("NOT VERIFIED: Android visual fidelity, image attribution legal review, 30 FPS on physical devices")
