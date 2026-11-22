"""Release contract for the eight user-supplied GigaOrbit WebP assets.

This validates real binary uploads, not placeholder image links.
Runs in the existing Vercel Next.js CI; needs Python standard library only.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "public" / "gigaorbit"
PAGE = ROOT / "src" / "app" / "gigaorbit" / "page.tsx"

ASSETS = {
    "gigaorbit-icon.webp",
    "launch-cockpit.webp",
    "mission-overview.webp",
    "mission-flow.webp",
    "earth-orbit.webp",
    "astronaut-eva.webp",
    "launch-rocket.webp",
    "lunar-rover.webp",
}

assert PAGE.is_file(), "GigaOrbit page is missing"
page_text = PAGE.read_text(encoding="utf-8")
for name in sorted(ASSETS):
    asset = ASSET_DIR / name
    assert asset.is_file(), f"Missing uploaded image: {name}"
    body = asset.read_bytes()
    assert 10_000 < len(body) < 5_000_000, f"Invalid image size for {name}"
    assert body[:4] == b"RIFF" and body[8:12] == b"WEBP", f"Not an actual WebP binary: {name}"
    assert f"/gigaorbit/{name}" in page_text, f"Image not wired into page: {name}"

assert "gigaorbit" not in (ROOT / "next.config.ts").read_text(encoding="utf-8").split("async redirects()", 1)[1].split("images:", 1)[0], "GigaOrbit route is redirected"
assert "These are visual references, not photographs" in page_text
print("PASS: eight actual user-provided WebP images, wired page paths and no GigaOrbit redirect")
