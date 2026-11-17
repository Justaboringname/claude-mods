"""Check and render one backdrop scene.

usage: scene_tool.py <scene_dir>

Reads <scene_dir>/day.svg and <scene_dir>/night.svg (and optional meta.json with
{"glassDay": {"blur", "tint", "opacity"}, "glassNight": {...}}).
Writes <scene_dir>/out/report.json and preview images, and prints a summary.

The validation is the Claude desktop app's own code for a moving scene (app-validator.js, cut
verbatim from the app's web bundle): a scene that fails it is drawn with its animation stripped.
Only one run at a time renders (a lock), so parallel callers queue instead of piling up browsers.
"""
import base64
import json
import os
import re
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOCK = HERE.parent / "scene-tools" / ".render-lock"
W, H = 1600, 1000
COLUMN = (432, 1200)

DIAG_JS = r"""
(svgText) => {
  const out = { valid: false, isMoving: false, readsSize: false, namesFilter: false, failures: [], elements: 0 };
  let doc;
  try { doc = new DOMParser().parseFromString(svgText, 'image/svg+xml'); } catch (e) { out.failures.push('does not parse: ' + e); return out; }
  const root = doc.documentElement;
  if (root.localName !== 'svg' || doc.querySelector('parsererror')) { out.failures.push('not a well-formed <svg> document: ' + (doc.querySelector('parsererror')?.textContent ?? '').slice(0, 200)); return out; }
  const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_ELEMENT);
  for (let el = walker.nextNode(); el !== null; el = walker.nextNode()) {
    out.elements += 1;
    if (ae(el)) continue;
    if (out.failures.length >= 10) continue;
    if (el.namespaceURI !== 'http://www.w3.org/2000/svg' || !M.has(el.localName)) { out.failures.push(`element <${el.localName}> is not allowed`); continue; }
    let said = false;
    for (const at of Array.from(el.attributes)) {
      if (!ie(at)) { out.failures.push(`<${el.localName}> attribute ${at.name}="${at.value.slice(0, 90)}" is refused`); said = true; }
    }
    if (el.localName === 'style') {
      const css = el.textContent ?? '';
      if (el.childElementCount !== 0) { out.failures.push('<style> has child elements'); said = true; }
      if (!U(css)) {
        const why = [];
        if (css.includes('\\')) why.push('a backslash');
        const fns = [...css.matchAll(te)].map(m => (m[1] ?? '').toLowerCase()).filter(f => f !== '' && f !== 'url' && !N.has(f));
        if (fns.length) why.push('functions not on the list: ' + [...new Set(fns)].join(', '));
        const ats = [...css.matchAll(z)].map(m => (m[1] ?? '').toLowerCase()).filter(a => !P.has(a));
        if (ats.length) why.push('at-rules not on the list: ' + [...new Set(ats)].join(', '));
        if (css.replaceAll(R, '').toLowerCase().includes('data:')) why.push('data:');
        out.failures.push('<style> text is refused: ' + (why.join('; ') || 'unknown cause (url() not #id, or prefers-color-scheme misuse)'));
        said = true;
      }
    }
    if (!said) out.failures.push(`<${el.localName}> is refused (unknown cause)`);
  }
  const verdict = ue(svgText);
  out.valid = verdict !== null;
  out.isMoving = verdict?.isMoving === true;
  out.readsSize = verdict?.readsSize === true;
  out.namesFilter = /filter|text-shadow/i.test(verdict?.markup ?? '');
  return out;
}
"""

PERF_JS = r"""
async (uri) => {
  const img = new Image();
  img.style.cssText = 'position:fixed;left:0;top:0;width:2560px;height:1440px';
  img.src = uri;
  document.body.appendChild(img);
  await img.decode();
  const c = document.createElement('canvas');
  c.width = 64; c.height = 40;
  const g = c.getContext('2d', { willReadFrequently: true });
  let n = 0, t = 0;
  const end = performance.now() + 2500;
  return await new Promise(res => {
    function f() {
      const a = performance.now();
      g.drawImage(img, 0, 0, 64, 40);
      g.getImageData(0, 0, 64, 40);
      t += performance.now() - a; n += 1;
      if (performance.now() < end) requestAnimationFrame(f); else res({ frames: n, msPerFrame: Math.round(1000 * t / n) / 1000 });
    }
    requestAnimationFrame(f);
  });
}
"""


def data_uri(svg: bytes) -> str:
    return "data:image/svg+xml;base64," + base64.b64encode(svg).decode()


def app_mock(uri: str, dark: bool, glass: dict) -> str:
    text = "#ece9e0" if dark else "#1f1e1d"
    muted = "#a39f94" if dark else "#6b675e"
    panel = "#1f1e1d" if dark else "#f0eee6"
    tint = glass.get("tint", panel)
    opacity = glass.get("opacity", 0.4)
    blur = glass.get("blur", 12)
    return f"""<!doctype html><meta charset="utf-8"><style>
*{{box-sizing:border-box}}html,body{{margin:0;height:100%}}
body{{font:15px/1.6 -apple-system,"PingFang SC",sans-serif;color:{text};background:#000;overflow:hidden}}
.bg{{position:fixed;inset:0;width:100%;height:100%;object-fit:cover}}
.glass{{background:color-mix(in srgb,{tint} {round(min(1, opacity + 0.45) * 100)}%,transparent);backdrop-filter:blur({blur}px);-webkit-backdrop-filter:blur({blur}px)}}
.side{{position:fixed;left:0;top:0;bottom:0;width:197px;padding:70px 18px;color:{muted};font-size:14px;line-height:2.3}}
.col{{position:fixed;left:445px;right:300px;top:70px}}
.col h3{{margin:22px 0 6px;font-size:15px}}.col p{{margin:0 0 12px}}.col .m{{color:{muted}}}
.col code{{font:13px ui-monospace,Menlo,monospace;background:color-mix(in srgb,{text} 9%,transparent);padding:1px 5px;border-radius:4px}}
.prompt{{position:fixed;left:425px;right:228px;bottom:40px;height:46px;border-radius:14px;border:1px solid color-mix(in srgb,{text} 22%,transparent);padding:11px 16px;color:{muted}}}
</style>
<img class="bg" src="{uri}">
<div class="side glass">新建<br>搜索<br>项目<br>Artifacts<br>定时任务<br><br>壁纸更换<br>数据集整理<br>模拟器优化<br>网站重构<br>数据验证</div>
<div class="col">
<p class="m">已运行 2 个命令,已读取 scene-preview.jpg ›</p>
<p>壁纸已经出来了,我截图确认过:中间这一栏是对话文字,<b>必须保持清晰可读</b>。The quick brown fox jumps over the lazy dog, 0123456789.</p>
<h3>为什么原本不能自动切换</h3>
<p>插件拿不到窗口当前是深是浅:mod 接口里没有这个信息。可以输入 <code>/custom-theme list</code> 查看全部主题,或者 <code>/custom-theme off session</code> 关掉。</p>
<h3>还没验证的</h3>
<p>深色那一半要等今天日落,系统真的切过去才能看到实际效果。Body text needs to stay comfortable to read for hours; the backdrop must never compete with it.</p>
<p class="m">theme-examples  This mod reloaded after a change to its files.</p>
</div>
<div class="prompt glass">按 ↵ 发送,按 ⌘↵ 加入队列稍后发送</div>"""


def acquire_lock() -> None:
    start = time.time()
    while True:
        try:
            os.mkdir(LOCK)
            return
        except FileExistsError:
            try:
                if time.time() - LOCK.stat().st_mtime > 240:
                    os.rmdir(LOCK)
                    continue
            except OSError:
                pass
            if time.time() - start > 600:
                raise SystemExit("render lock busy for 10 minutes; try again")
            time.sleep(1.5)


def main() -> None:
    scene = Path(sys.argv[1]).resolve()
    out = scene / "out"
    out.mkdir(exist_ok=True)
    meta = {}
    if (scene / "meta.json").exists():
        meta = json.loads((scene / "meta.json").read_text())
    validator = (HERE / "app-validator.js").read_text()
    report: dict = {"scene": scene.name, "ok": True, "problems": [], "warnings": []}

    from PIL import Image
    from playwright.sync_api import sync_playwright

    acquire_lock()
    try:
        with sync_playwright() as p:
            b = p.webkit.launch()
            for kind in ("day", "night"):
                path = scene / f"{kind}.svg"
                if not path.exists():
                    report["ok"] = False
                    report["problems"].append(f"{kind}.svg is missing")
                    continue
                svg = path.read_bytes()
                text = svg.decode("utf-8")
                uri = data_uri(svg)
                r: dict = {"chars": len(text)}
                report[kind] = r
                if len(text) > 131072:
                    report["problems"].append(f"{kind}: {len(text)} characters, over the 131072 limit")
                elif len(text) > 100000:
                    report["warnings"].append(f"{kind}: {len(text)} characters, close to the 131072 limit")
                head = text[: text.find(">") + 1]
                if 'viewBox="0 0 1600 1000"' not in head:
                    report["problems"].append(f'{kind}: the root needs viewBox="0 0 1600 1000"')
                if 'preserveAspectRatio="xMidYMid slice"' not in head:
                    report["problems"].append(f'{kind}: the root needs preserveAspectRatio="xMidYMid slice"')

                ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1, reduced_motion="reduce")
                pg = ctx.new_page()
                pg.set_content("<!doctype html><body></body>")
                pg.add_script_tag(content=validator)
                verdict = pg.evaluate(DIAG_JS, text)
                r.update(verdict)
                if not verdict["valid"]:
                    report["problems"].append(f"{kind}: the app's validator refuses it, so its animation would be stripped: " + " | ".join(verdict["failures"][:6]))
                elif not verdict["isMoving"]:
                    report["warnings"].append(f"{kind}: valid but has no animation (a still scene)")
                if verdict.get("isMoving") and not re.search(r"@media\s*\(\s*prefers-reduced-motion", text):
                    report["problems"].append(f"{kind}: it moves but has no @media (prefers-reduced-motion: reduce) rule that stops the motion")
                if re.search(r"<animate|<set[\s>]", text):
                    report["warnings"].append(f"{kind}: uses SMIL, which a reduced-motion rule cannot stop; prefer CSS keyframes")
                # still, composed picture (reduced motion)
                pg.set_content(f'<!doctype html><body style="margin:0;background:#888"><img src="{uri}" style="display:block;width:{W}px;height:{H}px"></body>')
                pg.wait_for_timeout(500)
                still_png = out / f"{kind}-still.png"
                pg.screenshot(path=str(still_png))
                ctx.close()

                im = Image.open(still_png).convert("RGB")
                # Banding: in a smooth area, two long flat runs side by side that differ by a level or two are a visible step.
                bpx = im.load()
                bw, bh = im.size

                def band_steps(coords):
                    runs = []
                    prev = None
                    count = 0
                    for c in coords:
                        v = bpx[c]
                        if v == prev:
                            count += 1
                        else:
                            if prev is not None:
                                runs.append((prev, count))
                            prev = v
                            count = 1
                    runs.append((prev, count))
                    return sum(1 for (c1, n1), (c2, n2) in zip(runs, runs[1:]) if n1 >= 24 and n2 >= 24 and max(abs(c1[i] - c2[i]) for i in range(3)) <= 2)

                steps = sum(band_steps([(x, y) for x in range(bw)]) for y in (60, 180, 300, 420, 540, 660, 780, 900, 960))
                steps += sum(band_steps([(x, y) for y in range(bh)]) for x in (240, 330, 430, 800, 1250, 1400, 1560))
                r["bandingSteps"] = steps
                if steps > 8:
                    report["problems"].append(f"{kind}: banding: {steps} visible steps along 16 sample lines (long flat runs one or two levels apart). A gradient that spans only a few levels over hundreds of pixels shows as stripes; give the ground a fine grain or more tonal range")
                im.save(out / f"{kind}-still.jpg", quality=85)
                small = im.resize((320, 200))
                px = list(small.getdata())
                mean = [round(sum(c[i] for c in px) / len(px)) for i in range(3)]
                r["meanRgb"] = mean
                paper = max(set(px), key=px.count)
                r["paperRgb"] = list(paper)
                col = im.crop((COLUMN[0], 0, COLUMN[1], H)).resize((384, 500))
                cpx = list(col.getdata())
                # Drawn detail, not smooth colour: a pixel counts when it differs visibly from its neighbours two to the right and two below.
                cw, ch = col.size
                inked = 0
                for yy in range(ch - 2):
                    row = yy * cw
                    for xx in range(cw - 2):
                        c = cpx[row + xx]
                        right = cpx[row + xx + 2]
                        below = cpx[row + 2 * cw + xx]
                        if max(max(abs(c[i] - right[i]), abs(c[i] - below[i])) for i in range(3)) > 9:
                            inked += 1
                r["columnInkPercent"] = round(100 * inked / len(cpx), 2)
                if r["columnInkPercent"] > 3:
                    report["warnings"].append(f"{kind}: {r['columnInkPercent']}% of the conversation column (x {COLUMN[0]}..{COLUMN[1]}) carries drawn detail; text sits there, keep it calm (a smooth sky does not count)")
                if kind == "night":
                    if mean[2] > mean[0] + 12:
                        report["warnings"].append(f"night: blue outweighs red (mean RGB {mean}); fine only if the sky you were given is the blue one")
                    if sum(mean) / 3 > 70:
                        report["warnings"].append(f"night: quite bright for a dark window (mean RGB {mean})")
                else:
                    if sum(mean) / 3 < 170:
                        report["warnings"].append(f"day: quite dark for a light window (mean RGB {mean})")
                os.remove(still_png)

                # moving frame + running animations
                ctx = b.new_context(viewport={"width": W, "height": H}, device_scale_factor=1)
                pg = ctx.new_page()
                pg.set_content(f'<!doctype html><body style="margin:0;background:#888"><div style="width:{W}px;height:{H}px">{text}</div></body>')
                pg.wait_for_timeout(4000)
                r["runningAnimations"] = pg.evaluate("document.getAnimations().length")
                pg.screenshot(path=str(out / f"{kind}-moving.jpg"), type="jpeg", quality=85, clip={"x": 0, "y": 0, "width": W, "height": H})
                if r["runningAnimations"] > 400:
                    report["warnings"].append(f"{kind}: {r['runningAnimations']} animations run at once; the app stops a scene that costs too much per frame")
                ctx.close()

                # the app's per-frame cost probe (a rough stand-in: WebKit here, Chromium in the app)
                ctx = b.new_context(viewport={"width": 2560, "height": 1440}, device_scale_factor=1)
                pg = ctx.new_page()
                pg.set_content("<!doctype html><body style='margin:0'></body>")
                r["perf"] = pg.evaluate(PERF_JS, uri)
                ctx.close()
                if r["perf"]["msPerFrame"] > 4.0:
                    report["warnings"].append(f"{kind}: {r['perf']['msPerFrame']} ms per frame in the cost probe; the app stops a scene's motion above about 5.5 ms")

                # mock of the app window
                glass = meta.get("glassNight" if kind == "night" else "glassDay", {})
                ctx = b.new_context(viewport={"width": 1600, "height": 900}, device_scale_factor=1, reduced_motion="reduce")
                pg = ctx.new_page()
                pg.set_content(app_mock(uri, kind == "night", glass))
                pg.wait_for_timeout(500)
                pg.screenshot(path=str(out / f"{kind}-app.jpg"), type="jpeg", quality=85)
                ctx.close()
            b.close()
    finally:
        try:
            os.rmdir(LOCK)
        except OSError:
            pass

    if report["problems"]:
        report["ok"] = False
    (out / "report.json").write_text(json.dumps(report, indent=1, ensure_ascii=False))
    print(json.dumps(report, indent=1, ensure_ascii=False))
    print("\nimages:", ", ".join(sorted(f.name for f in out.glob("*.jpg"))), "in", out)


if __name__ == "__main__":
    main()
