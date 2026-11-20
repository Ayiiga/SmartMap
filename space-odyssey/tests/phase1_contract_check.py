"""Static resource/reference checks. Does NOT compile or execute Godot/GDScript.
Run: python3 tests/phase1_contract_check.py
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
errors = []
for scene in (ROOT / 'scenes').rglob('*.tscn'):
    text = scene.read_text()
    for item in re.findall(r'path="(res://[^\"]+)"', text):
        path = ROOT / item.removeprefix('res://')
        if not path.exists():
            errors.append(f'{scene.relative_to(ROOT)}: missing {item}')
for gd in (ROOT / 'scripts').rglob('*.gd'):
    text = gd.read_text()
    for item in re.findall(r'(?:preload|load)\("(res://[^\"]+)"\)', text):
        if not (ROOT / item.removeprefix('res://')).exists():
            errors.append(f'{gd.relative_to(ROOT)}: missing {item}')
for data in (ROOT / 'resources').rglob('*.json'):
    with open(data) as f:
        json.load(f)
mission = json.loads((ROOT / 'resources/missions/training.json').read_text())
assert len(mission['objectives']) == 3, 'Training must have 3 actual objectives'
assert all('success' in item and 'id' in item for item in mission['objectives'])
project = (ROOT / 'project.godot').read_text()
assert 'gl_compatibility' in project
assert 'window/handheld/orientation=0' in project
assert 'scenes/ui/main_menu.tscn' in project
assert all(name in project for name in ['GameState=', 'MissionManager='])
# The web stack must not be repackaged as a pretend Godot project.
assert not any(ROOT.rglob('package.json'))
assert not any(ROOT.rglob('index.html'))
assert not any(ROOT.rglob('*.ts'))
if errors:
    raise SystemExit('\n'.join(errors))
print('PASS: scene references, preload paths, resource JSON, mission requirements, offline project structure.')
print('NOT VERIFIED: GDScript compile, Godot scene import, playtest, Android build.')
