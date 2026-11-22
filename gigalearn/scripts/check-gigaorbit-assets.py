"""Release contract for GigaOrbit user-provided artwork and playable source.
The page is client rendered: verify image references in game components, not only page.tsx.
These source checks do NOT substitute for touch/browser playtesting.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "public" / "gigaorbit"
PAGE = ROOT / "src" / "app" / "gigaorbit" / "page.tsx"
GAME = ROOT / "src" / "components" / "gigaorbit" / "game.tsx"
SCENE = ROOT / "src" / "components" / "gigaorbit" / "scene.tsx"
ENGINE = ROOT / "src" / "lib" / "gigaorbit" / "engine.ts"

ASSETS = {
    "gigaorbit-icon.webp", "launch-cockpit.webp", "mission-overview.webp",
    "mission-flow.webp", "earth-orbit.webp", "astronaut-eva.webp",
    "launch-rocket.webp", "lunar-rover.webp",
}

for file in (PAGE, GAME, SCENE, ENGINE):
    assert file.is_file(), f"Missing GigaOrbit source: {file.relative_to(ROOT)}"
sources = "\n".join(path.read_text(encoding="utf-8") for path in (PAGE, GAME, SCENE, ENGINE))
game = GAME.read_text(encoding="utf-8")
engine = ENGINE.read_text(encoding="utf-8")
scene = SCENE.read_text(encoding="utf-8")
page = PAGE.read_text(encoding="utf-8")

for name in sorted(ASSETS):
    asset = ASSET_DIR / name
    assert asset.is_file(), f"Missing uploaded image: {name}"
    body = asset.read_bytes()
    assert 10_000 < len(body) < 5_000_000, f"Invalid image size for {name}"
    assert body[:4] == b"RIFF" and body[8:12] == b"WEBP", f"Not a WebP binary: {name}"
    assert f"/gigaorbit/{name}" in sources, f"Image not wired into playable game: {name}"

for token in ("GigaOrbitGame", "from \"@/components/gigaorbit/game\""):
    assert token in page, token
for token in ('<Canvas', 'Rocket', 'Astronaut', 'Terrain', 'useFrame'):
    assert token in scene, f"Real-time 3D scene element missing: {token}"
for token in ('onPointerDown', 'onPointerMove', 'performInteract', 'performAction', 'continueSaved', 'syncPaused', 'localStorage', 'Scene mission='):
    assert token in game, f"Playable controller or save action missing: {token}"
for token in ('function advance(', 'function interact(', 'function award(', 'function restoreMission(', 'SAMPLE_POINTS'):
    assert token in engine, f"Mission gameplay logic missing: {token}"

redirect_block = (ROOT / "next.config.ts").read_text(encoding="utf-8").split("async redirects()", 1)[1].split("images:", 1)[0]
assert "gigaorbit" not in redirect_block, "Playable route is redirected away"
print("PASS: 8 real user-supplied WebP assets, playable 3D scene source, touch controls, save/progression and route wiring")
print("NOT VERIFIED: Android physical touchscreen, browser WebGL rendering, actual frame rates or Vercel live deployment")
