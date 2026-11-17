"""Build a single-file page of the designed backdrop styles (day + night, live), then screenshot it."""
import base64
import html
import json
import sys
from pathlib import Path

scenes = Path(sys.argv[1])
out_html = Path(sys.argv[2])
out_shot = Path(sys.argv[3])
ORDER = ["ink-mountains", "gear-drawing", "frc-field", "circuit-flow", "astrolabe", "metro-lines"]

rows = []
for sid in ORDER:
    d = scenes / sid
    meta = json.loads((d / "meta.json").read_text())
    shots = []
    for kind, label in (("day", "浅色"), ("night", "深色")):
        svg = (d / f"{kind}.svg").read_bytes()
        uri = "data:image/svg+xml;base64," + base64.b64encode(svg).decode()
        g = meta["glassNight" if kind == "night" else "glassDay"]
        shots.append(f"""
    <div class="shot on-{kind}">
      <img src="{uri}" alt="{html.escape(meta['titleZh'])} {label}">
      <div class="side" style="--tint:{g['tint']}"></div>
      <div class="pane">
        <i style="width:62%"></i><i style="width:92%"></i><i style="width:48%"></i><i class="gap"></i><i style="width:84%"></i><i style="width:71%"></i><i class="gap"></i><i style="width:78%"></i><i style="width:36%"></i>
      </div>
      <div class="box" style="--tint:{g['tint']}"></div>
      <span class="tag">{label}</span>
    </div>""")
    rows.append(f"""
<section class="style">
  <div class="head"><h2>{html.escape(meta['titleZh'])} <small>{html.escape(meta['title'])}</small></h2><p>{html.escape(meta['blurbZh'])}</p></div>
  <div class="pair">{''.join(shots)}</div>
</section>""")

page = f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>壁纸风格 · 六种</title>
<style>
:root{{color-scheme:dark;--bg:#121110;--line:#33302c;--text:#f0eee6;--muted:#a8a59b;--accent:#d97757}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--text);font:15px/1.6 -apple-system,"PingFang SC","Helvetica Neue",sans-serif}}
header{{padding:28px 16px 6px;max-width:1640px;margin:0 auto}}
h1{{font-size:24px;margin:0 0 6px;font-weight:650}}
header p{{margin:0;color:var(--muted);max-width:62em}}
.bar{{display:flex;gap:8px;margin-top:14px}}
button{{font:inherit;color:var(--text);background:#1c1b19;border:1px solid var(--line);border-radius:999px;padding:6px 14px;cursor:pointer}}
button[aria-pressed="true"]{{background:var(--accent);border-color:var(--accent);color:#1a1310}}
main{{max-width:1640px;margin:0 auto;padding:8px 16px 40px;display:flex;flex-direction:column;gap:30px}}
.head{{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 18px;margin-bottom:10px}}
h2{{font-size:19px;margin:0;font-weight:640}}
h2 small{{color:var(--muted);font-weight:400;font-size:13px;margin-left:6px}}
.head p{{margin:0;color:var(--muted);font-size:14px}}
.pair{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,520px),1fr));gap:14px}}
.shot{{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:12px;border:1px solid var(--line)}}
.shot img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}}
.side,.pane,.box{{display:none;position:absolute}}
body.mock .side,body.mock .pane,body.mock .box{{display:flex}}
.side{{left:0;top:0;bottom:0;width:12.3%;background:color-mix(in srgb,var(--tint) 82%,transparent)}}
.pane{{left:27.8%;right:19%;top:8%;flex-direction:column;gap:2.4cqh;container-type:size}}
.pane i{{display:block;height:7px;border-radius:4px}}
.pane i.gap{{height:8px;background:none!important}}
.on-day .pane i{{background:rgba(31,30,29,.78)}}
.on-night .pane i{{background:rgba(236,233,224,.82)}}
.pane{{gap:10px}}
.box{{left:26.6%;right:14.3%;bottom:4.5%;height:5.2%;border-radius:10px;background:color-mix(in srgb,var(--tint) 78%,transparent)}}
.on-day .box{{border:1px solid rgba(31,30,29,.2)}}
.on-night .box{{border:1px solid rgba(236,233,224,.2)}}
.tag{{position:absolute;right:10px;top:10px;font-size:12px;padding:1px 9px;border-radius:999px}}
.on-day .tag{{background:rgba(31,30,29,.08);color:#4a463f}}
.on-night .tag{{background:rgba(236,233,224,.1);color:#cfc9bb}}
</style></head>
<body class="mock">
<header>
  <h1>壁纸风格 · 六种</h1>
  <p>每种都是整套重新设计的画面,不是换色。左边浅色版、右边暖色深色版,画面是实时动效。中间留白给对话文字。</p>
  <div class="bar"><button id="mock" aria-pressed="true">模拟侧栏和对话</button></div>
</header>
<main>{''.join(rows)}</main>
<script>
const m=document.getElementById('mock');m.onclick=()=>{{const on=document.body.classList.toggle('mock');m.setAttribute('aria-pressed',on)}};
</script>
</body></html>"""
out_html.write_text(page, encoding="utf-8")
print("html bytes", out_html.stat().st_size)

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.webkit.launch()
    ctx = b.new_context(viewport={"width": 1640, "height": 900}, device_scale_factor=1)
    pg = ctx.new_page()
    pg.goto(out_html.as_uri())
    pg.wait_for_timeout(5000)
    pg.screenshot(path=str(out_shot), full_page=True, type="jpeg", quality=84)
    print("shot", out_shot, out_shot.stat().st_size)
    ctx.close()
    b.close()
