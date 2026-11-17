"""Close-up renders of this scene's day.svg and night.svg, for looking at linework. Writes into out/zoom/.

usage: zoom.py [stock ...]   (default: day night)
It waits on the same lock as scene_tool.py, so it never runs a second browser beside a build.
"""
import base64
import os
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOCK = HERE.parent.parent / "scene-tools" / ".render-lock"
SCALE = 3
REGIONS = {
    "right-top": (1230, 170, 1600, 690),
    "right-low": (1230, 600, 1600, 960),
    "left": (170, 330, 450, 960),
}


def main() -> None:
    kinds = sys.argv[1:] or ["day", "night"]
    out = HERE / "out" / "zoom"
    out.mkdir(parents=True, exist_ok=True)
    from PIL import Image
    from playwright.sync_api import sync_playwright

    start = time.time()
    while True:
        try:
            os.mkdir(LOCK)
            break
        except FileExistsError:
            if time.time() - start > 600:
                raise SystemExit("render lock busy")
            time.sleep(1.5)
    try:
        with sync_playwright() as p:
            b = p.webkit.launch()
            for kind in kinds:
                svg = (HERE / f"{kind}.svg").read_bytes()
                uri = "data:image/svg+xml;base64," + base64.b64encode(svg).decode()
                ctx = b.new_context(viewport={"width": 1600, "height": 1000}, device_scale_factor=SCALE, reduced_motion="reduce")
                pg = ctx.new_page()
                pg.set_content(f'<!doctype html><body style="margin:0;background:#888"><img src="{uri}" style="display:block;width:1600px;height:1000px"></body>')
                pg.wait_for_timeout(600)
                png = out / f"{kind}-full.png"
                pg.screenshot(path=str(png))
                ctx.close()
                im = Image.open(png).convert("RGB")
                for name, (x0, y0, x1, y1) in REGIONS.items():
                    im.crop((x0 * SCALE, y0 * SCALE, x1 * SCALE, y1 * SCALE)).save(out / f"{kind}-{name}.jpg", quality=88)
                os.remove(png)
                # How long a fresh page takes to decode the sheet as an image: a rough stand-in for the cost of first showing it.
                ctx = b.new_context(viewport={"width": 2560, "height": 1440}, device_scale_factor=1)
                pg = ctx.new_page()
                pg.set_content("<!doctype html><body style='margin:0'></body>")
                ms = pg.evaluate(
                    """async (uri) => { const t = []; for (let i = 0; i < 5; i += 1) { const img = new Image(); img.style.cssText = 'position:fixed;left:0;top:0;width:2560px;height:1440px';
                    const a = performance.now(); img.src = uri + '#' + i; document.body.appendChild(img); await img.decode(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
                    t.push(performance.now() - a); img.remove(); } return t.map(v => Math.round(v * 10) / 10); }""",
                    uri,
                )
                print(kind, "chars", len(svg), "decode+2 frames ms", ms)
                ctx.close()
            b.close()
    finally:
        try:
            os.rmdir(LOCK)
        except OSError:
            pass


if __name__ == "__main__":
    main()
