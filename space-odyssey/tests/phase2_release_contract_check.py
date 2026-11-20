"""Source-only release gate. Does not establish Godot/runtime/APK success.

Prevents known GDScript multiline-string parse errors from returning.
Checks that offline/identity settings and required test assets remain present.
"""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
scripts = list((root / "scripts").rglob("*.gd"))
assert scripts, "Missing GDScript scripts"

def scan_newlines_in_regular_strings(text: str, file: Path) -> None:
    quote = None
    escaped = False
    line = 1
    start = 0
    i = 0
    while i < len(text):
        ch = text[i]
        if not quote:
            if ch == '#':
                j = text.find('\n', i)
                if j < 0:
                    break
                i = j
                continue
            if ch in ('"', "'"):
                # A triple-quoted literal is intentionally multiline.
                if text[i:i+3] == ch * 3:
                    close = text.find(ch * 3, i + 3)
                    if close < 0:
                        raise AssertionError(f"Unclosed multiline string: {file.relative_to(root)}:{line}")
                    line += text[i:close+3].count('\n')
                    i = close + 3
                    continue
                quote = ch
                start = line
        else:
            if ch == '\\' and not escaped:
                escaped = True
            elif ch == quote and not escaped:
                quote = None
            else:
                escaped = False
        if ch == '\n':
            if quote:
                raise AssertionError(f"Unescaped newline in quoted string: {file.relative_to(root)}:{start}")
            line += 1
        i += 1
    if quote:
        raise AssertionError(f"Unclosed string: {file.relative_to(root)}:{start}")

for script in scripts:
    scan_newlines_in_regular_strings(script.read_text(encoding="utf-8"), script)

project = (root / 'project.godot').read_text()
preset = (root / 'export_presets.cfg').read_text()
assert 'SPACE ODYSSEY' in project
assert 'gl_compatibility' in project
assert 'window/handheld/orientation=0' in project
assert 'platform="Android"' in preset
assert 'package/unique_name="com.giga3enterprise.spaceodyssey"' in preset
assert 'permissions/internet=false' in preset
assert 'architectures/arm64-v8a=true' in preset
version_match = re.search(r'package/version_code=([0-9]+)', preset)
assert version_match and int(version_match.group(1)) >= 4, 'Android version code must not decrease'
for f in ('resources/missions/training.json', 'resources/missions/launch.json', 'resources/rockets/trainer.json'):
    assert (root / f).is_file()
    assert isinstance(json.loads((root / f).read_text()), dict)
print(f'PASS: {len(scripts)} GDScript sources scanned; no bare multiline quoted strings; Android offline export/mission package checks passed')
print('NOT VERIFIED: Godot engine parser, hardware execution, signed APK, GitHub deploy.')
