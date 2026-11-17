"""Close-up renders of day.svg / night.svg regions (WebKit, reduced motion), honouring the scene tool's render lock.
usage: zoom.py <scene_dir> [extra svg names...]"""
import base64, os, sys, time
from pathlib import Path
HERE = Path(sys.argv[1]).resolve()
LOCK = HERE.parent.parent / "scene-tools" / ".render-lock"
REGIONS = {
    "pav": (1220, 540, 380, 400),
    "rock": (200, 660, 240, 290),
    "willow": (1300, 0, 300, 450),
}
def acquire():
    start = time.time()
    while True:
        try:
            os.mkdir(LOCK); return
        except FileExistsError:
            try:
                if time.time() - LOCK.stat().st_mtime > 240:
                    os.rmdir(LOCK); continue
            except OSError:
                pass
            if time.time() - start > 600: raise SystemExit("lock busy")
            time.sleep(1.5)
from playwright.sync_api import sync_playwright
names = sys.argv[2:] or ["day", "night"]
acquire()
try:
    with sync_playwright() as p:
        b = p.webkit.launch()
        ctx = b.new_context(viewport={"width": 1600, "height": 1000}, device_scale_factor=3, reduced_motion="reduce")
        pg = ctx.new_page()
        for kind in names:
            svg = (HERE / f"{kind}.svg").read_bytes()
            uri = "data:image/svg+xml;base64," + base64.b64encode(svg).decode()
            pg.set_content(f'<!doctype html><body style="margin:0;background:#888"><img src="{uri}" style="display:block;width:1600px;height:1000px"></body>')
            pg.wait_for_timeout(400)
            for name, (x, y, w, h) in REGIONS.items():
                pg.screenshot(path=str(HERE / "out" / f"zoom-{kind}-{name}.jpg"), type="jpeg", quality=88, clip={"x": x, "y": y, "width": w, "height": h})
        ctx.close(); b.close()
finally:
    try: os.rmdir(LOCK)
    except OSError: pass
print("ok")
