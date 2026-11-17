# -*- coding: utf-8 -*-
"""Render enlarged crops of a built scene, for judging detail.

usage: zoom_scene.py <scene_dir> [--scale N] name=x,y,w,h [name=x,y,w,h ...]

Reads <scene_dir>/day.svg and night.svg (run build_scene.sh first) and writes
<scene_dir>/out/zoom-day-<name>.png and zoom-night-<name>.png. x,y,w,h are in sheet units
(the sheet is 1600 by 1000); the picture is N times that size in pixels (default 3, the size
the wallpaper has on a 5K display). Motion is frozen. One browser, one run at a time (the
same lock as build_scene.sh).
"""
import base64
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import scene_tool  # noqa: E402  (for the shared render lock)


def main() -> None:
    args = sys.argv[1:]
    scale = 3
    if "--scale" in args:
        i = args.index("--scale")
        scale = float(args[i + 1])
        del args[i : i + 2]
    if len(args) < 2:
        raise SystemExit(__doc__)
    scene = Path(args[0]).resolve()
    crops = []
    for spec in args[1:]:
        name, _, box = spec.partition("=")
        x, y, w, h = (float(v) for v in box.split(","))
        crops.append((name, x, y, w, h))
    out = scene / "out"
    out.mkdir(exist_ok=True)

    from playwright.sync_api import sync_playwright

    scene_tool.acquire_lock()
    try:
        with sync_playwright() as p:
            b = p.webkit.launch()
            ctx = b.new_context(viewport={"width": 1600, "height": 1000}, device_scale_factor=scale, reduced_motion="reduce")
            pg = ctx.new_page()
            for kind in ("day", "night"):
                svg = (scene / f"{kind}.svg").read_bytes()
                uri = "data:image/svg+xml;base64," + base64.b64encode(svg).decode()
                pg.set_content(
                    "<!doctype html><style>html,body{margin:0;background:#888}img{display:block;width:1600px;height:1000px}</style>"
                    f'<img src="{uri}">'
                )
                pg.wait_for_timeout(350)
                for name, x, y, w, h in crops:
                    path = out / f"zoom-{kind}-{name}.png"
                    pg.screenshot(path=str(path), clip={"x": x, "y": y, "width": w, "height": h})
                    print(path)
            b.close()
    finally:
        try:
            scene_tool.LOCK.rmdir()
        except OSError:
            pass


if __name__ == "__main__":
    main()
