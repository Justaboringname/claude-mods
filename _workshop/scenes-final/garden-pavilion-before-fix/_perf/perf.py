"""Repeat the scene tool's cost probe on given SVG files, honouring the render lock. usage: perf.py <svg>... """
import base64, os, sys, time, re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scene-tools"))
TOOL = Path(__file__).resolve().parents[3] / "scene-tools" / "scene_tool.py"
src = TOOL.read_text()
PERF_JS = re.search(r'PERF_JS = r"""(.*?)"""', src, re.S).group(1)
LOCK = TOOL.parent / ".render-lock"
def acquire():
    start = time.time()
    while True:
        try:
            os.mkdir(LOCK); return
        except FileExistsError:
            try:
                if time.time() - LOCK.stat().st_mtime > 240: os.rmdir(LOCK); continue
            except OSError: pass
            if time.time() - start > 600: raise SystemExit("lock busy")
            time.sleep(1.5)
from playwright.sync_api import sync_playwright
acquire()
try:
    with sync_playwright() as p:
        b = p.webkit.launch()
        pg = b.new_page(viewport={"width": 2560, "height": 1440})
        pg.set_content("<!doctype html><body style='margin:0'></body>")
        for f in sys.argv[1:]:
            uri = "data:image/svg+xml;base64," + base64.b64encode(Path(f).read_bytes()).decode()
            vals = []
            for _ in range(3):
                pg.set_content("<!doctype html><body style='margin:0'></body>")
                vals.append(pg.evaluate(PERF_JS, uri)["msPerFrame"])
            print(Path(f).name, vals)
        b.close()
finally:
    try: os.rmdir(LOCK)
    except OSError: pass
