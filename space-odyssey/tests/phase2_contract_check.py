"""Standalone static/source contract and independent rocket-math sanity test.
NOT a substitute for Godot compilation, Android export or an actual gameplay run.
Run: python3 tests/phase2_contract_check.py
"""
from pathlib import Path
from math import exp, sin, cos, radians, hypot
import json
import re

R = Path(__file__).resolve().parents[1]
errors = []
for src in list((R/'scenes').rglob('*.tscn')) + list((R/'scripts').rglob('*.gd')):
    code = src.read_text()
    for ref in re.findall(r'(?:path|preload|load)\s*\(?\s*["\'](res://[^"\']+)["\']', code):
        if not (R/ref[6:]).exists():
            errors.append(f'Missing {ref} referenced from {src.relative_to(R)}')
for f in (R/'resources').rglob('*.json'):
    json.loads(f.read_text())
launch = json.loads((R/'resources/missions/launch.json').read_text())
assert launch['id'] == 'launch_001'
assert len(launch['objectives']) == 3
assert [v['success'] for v in launch['objectives']] == ['rocket_ignited','stage_1_separated','guided_orbit_inserted']
crew_code = (R/'scripts/player/crew_catalog.gd').read_text()
for crew_id in ('nambe','ndaani','mambooda','abiola','ayiiga','atia','mpoko','yambilla','zuuri','wendkuoni','delwende','regina'):
    assert f'"{crew_id}"' in crew_code
core = (R/'scripts/core/game_state.gd').read_text()
assert 'selected_astronaut' in core and 'flight_checkpoint' in core
assert 'Crew.normalize_id' in core
assert all(f'"{legacy}": "{new}"' in crew_code for legacy,new in [('nova','nambe'),('kofi','ayiiga'),('zuri','zuuri')])
assert 'flight_rewards_claimed' in core
menu = (R/'scripts/ui/main_menu.gd').read_text()
assert 'ASSEMBLE 3 ASTRONAUTS' in menu and 'PLAY PHOTO MISSION' in menu and 'CLASSIC ROCKET PILOT' in menu
launch_world = (R/'scripts/world/launch_world.gd').read_text()
for function in ('_launch','_stage','_orbit','_retry','_toggle_pause'):
    assert f'func {function}(' in launch_world
assert 'Center/Panel/Buttons' in launch_world
vehicle = (R/'scripts/rocket/rocket_vehicle.gd').read_text()
for name in ('current_mass_kg','ignite','separate_stage','can_insert_orbit','snapshot','restore'):
    assert f'func {name}(' in vehicle
assert 'position.y = minf(altitude_m / 90.0, 155.0)' in vehicle
assert 'gl_compatibility' in (R/'project.godot').read_text()
assert 'permissions/internet=false' in (R/'export_presets.cfg').read_text()
assert not list(R.rglob('package.json')) and not list(R.rglob('index.html'))
# Independent numerical sanity check of the default beginner profile, mirroring only the
# public model constants. This verifies feasible tuning, NOT engine behavior.
phase=1
alt=0.0
vup=0.0
vh=0.0
fuel1=12000.0
fuel2=4500.0
pitch=0.0
dt=2.3/60.0
ready=False
for i in range(3000):
    if phase==1:
        pitch=min(5.0 if alt<2500 else 19.0, pitch+18*dt)
        massflow=min(fuel1,465*dt)
        fuel1-=massflow
        thrust=massflow/dt*1360
        if fuel1<=1e-3: phase=2
    elif phase==2:
        phase=3
        continue
    else:
        pitch=min(30.0,pitch+18*dt)
        massflow=min(fuel2,145*.72*dt)
        fuel2-=massflow
        thrust=massflow/dt*1800
    mass=2800+fuel2+(4340+fuel1 if phase!=3 else 0)
    speed=max(1.0,hypot(vup,vh))
    drag=.5*1.225*exp(-alt/8200)*speed*speed*.55/mass
    vup+=(cos(radians(pitch))*thrust/mass-9.81-drag*vup/speed)*dt
    vh+=(sin(radians(pitch))*thrust/mass-drag*vh/speed)*dt
    alt+=vup*dt
    if phase==3 and alt>=12000 and hypot(vup,vh)>=460:
        ready=True
        break
assert ready, 'Default rocket cannot reach guided-orbit prerequisite'
assert fuel2>0, 'No second-stage fuel remains at insertion window'
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: resource paths, 12 crew across 3 roles, mission definitions, buttons, offline setup, and orbit-math sanity (ready at {alt:.0f} m).')
print('NOT VERIFIED: Godot parser, GDScript compilation, actual UI, Android APK/AAB, physical device FPS.')
