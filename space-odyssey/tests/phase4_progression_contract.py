"""Source-level contract for the user-driven Moon/Mars upgrade. Engine runtime is checked separately."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
read = lambda p: (root / p).read_text()
state = read("scripts/core/game_state.gd")
crew = read("scripts/ui/crew_screen.gd")
flight = read("scripts/flight/odyssey_lander.gd")
landing = read("scripts/world/planet_landing.gd")
transfer = read("scripts/world/planet_transfer.gd")
workshop = read("scripts/ui/workshop_screen.gd")
menu = read("scripts/ui/main_menu.gd")
rewards = read("scripts/ui/rewards_screen.gd")
export = read("export_presets.cfg")
for scene in ["scenes/ui/rewards_screen.tscn", "scenes/world/planet_transfer.tscn", "scenes/world/planet_landing.tscn"]:
    assert (root / scene).exists(), scene
for word in ["crew_slots", "crew_confirmed", "coins", "landing_checkpoint", "completed_planets", "landing_grades", "badges", "upgrades"]:
    assert word in state
for method in ["assign_crew", "confirm_crew", "begin_transfer", "begin_landing", "buy_upgrade", "revive_lander", "award_landing"]:
    assert "func " + method + "(" in state, method
assert "Crew.GROUPS[role]" in crew and "CONFIRM 3 CREW" in crew
assert "func advance(" in flight and "func restore(" in flight and "func grade(" in flight
assert "gravity()" in flight and "vertical_velocity_m_s" in flight
for feature in ["STEER LEFT", "STEER RIGHT", "BRAKE / THRUST", "DEPLOY LEGS", "RESTART FROM BEGINNING", "REVIVE FROM CHECKPOINT"]:
    assert feature in landing, feature
assert 'GameState.award_landing(' in landing
assert 'GameState.begin_landing(_target)' in transfer
assert "GameState.buy_upgrade" in workshop
assert "FLY TO THE MOON" in menu and "FLY TO MARS" in menu
assert "GAME COINS" in rewards and "BEST GRADE" in rewards
assert 'permissions/internet=false' in export
print("PASS: three astronauts, piloted Moon/Mars lander, local saved checkpoint, virtual upgrades, grades and rewards")
