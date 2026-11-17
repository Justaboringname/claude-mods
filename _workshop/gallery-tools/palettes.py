"""Build a single-file page comparing night palettes of Plotter Tide, then screenshot it."""
import base64
import html
import json
import sys
from pathlib import Path

src = Path(sys.argv[1])
out_html = Path(sys.argv[2])
out_shot = Path(sys.argv[3])

# id -> (中文名, 一句话, [paper, land, ink, rust])
INFO = {
    "plotter-tide-graphite": ("石墨", "暖灰石墨底、浅灰墨线。和 Claude 自己的深色界面最接近,存在感最低", ["#1b1a18", "#26231f", "#b9b2a4", "#d97757"]),
    "plotter-tide-kraft": ("牛皮纸", "深棕牛皮纸底、沙色墨线。暖,像台灯下的纸", ["#231c15", "#30261b", "#d6c4a2", "#e0895a"]),
    "plotter-tide-ember": ("余烬", "偏红的深棕底、玫瑰沙色墨线。六套里最暖", ["#1f1513", "#2d1c18", "#dcbcaa", "#ec8f66"]),
    "plotter-tide-amber": ("琥珀", "近黑底、琥珀色墨线。像一盏小夜灯", ["#14100b", "#20170d", "#d9a55f", "#c85a30"]),
    "plotter-tide-moss": ("苔绿", "深橄榄绿底、灰绿墨线。不走暖棕路线的一套", ["#161a14", "#1f271c", "#b7c2a0", "#dd8f5c"]),
    "plotter-tide-ink": ("墨黑", "近黑底、暗暖灰墨线。六套里最暗、最不抢眼", ["#0f0e0d", "#1a1816", "#9c958a", "#b9693f"]),
    "plotter-tide-night": ("官方蓝黑(对照)", "官方自带的深色版,底色偏蓝,就是你嫌的那套", ["#141a27", "#1c2333", "#aab6d0", "#e98a5e"]),
    "plotter-tide": ("浅色版(白天)", "白天用的暖色纸版本,不变", ["#f3eee3", "#e8d6bd", "#1f2a48", "#c4552d"]),
}


def blue_share(hex_color: str) -> int:
    r, g, b = (int(hex_color[i : i + 2], 16) for i in (1, 3, 5))
    return round(100 * b / (r + g + b))


themes = {t["id"]: t for t in json.loads((src / "themes.json").read_text())}
cards = []
for tid, (name, blurb, sw) in INFO.items():
    t = themes[tid]
    svg = (src / "svg" / f"{tid}.svg").read_bytes()
    uri = "data:image/svg+xml;base64," + base64.b64encode(svg).decode()
    g = t["glass"]
    dark = t["window"] == "dark"
    ref = tid in ("plotter-tide-night", "plotter-tide")
    swatches = "".join(f"<span class='sw' style='background:{c}' title='{c}'></span>" for c in sw)
    share = blue_share(sw[0])
    pick = "" if ref else f"<code>{html.escape(tid)}</code>"
    cards.append(f"""
<article class="card{' ref' if ref else ''}">
  <div class="shot {'on-dark' if dark else 'on-light'}">
    <img src="{uri}" alt="{html.escape(name)}">
    <div class="pane" style="--tint:{g.get('tint', '#ffffff')};--op:{g['opacity']};--blur:{g['blur']}px">
      <i style="width:72%"></i><i style="width:88%"></i><i style="width:54%"></i><i class="gap"></i><i style="width:80%"></i><i style="width:63%"></i><i class="gap"></i><i style="width:76%"></i><i style="width:41%"></i>
    </div>
  </div>
  <div class="meta">
    <h2>{html.escape(name)}</h2>
    <p>{html.escape(blurb)}</p>
    <div class="row">{swatches}<span class="blue">底色里蓝色占 {share}%</span></div>
    {pick}
  </div>
</article>""")

page = f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>绘图仪潮汐 · 深色配色</title>
<style>
:root{{color-scheme:dark;--bg:#121110;--panel:#1c1b19;--line:#33302c;--text:#f0eee6;--muted:#a8a59b;--accent:#d97757}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 -apple-system,"PingFang SC","Helvetica Neue",sans-serif}}
header{{padding:28px 16px 4px;max-width:1500px;margin:0 auto}}
h1{{font-size:24px;margin:0 0 6px;font-weight:650}}
header p{{margin:0;color:var(--muted);max-width:60em}}
.bar{{display:flex;gap:8px;margin-top:14px}}
button{{font:inherit;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:6px 14px;cursor:pointer}}
button[aria-pressed="true"]{{background:var(--accent);border-color:var(--accent);color:#1a1310}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:16px;padding:16px;max-width:1500px;margin:0 auto}}
.card{{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}}
.card.ref{{border-style:dashed}}
.shot{{position:relative;aspect-ratio:16/10;overflow:hidden}}
.shot img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}}
.pane{{position:absolute;top:0;bottom:0;left:27%;right:25%;padding:26px 18px;display:none;flex-direction:column;gap:10px;
  background:color-mix(in srgb,var(--tint) calc(var(--op)*100%),transparent);backdrop-filter:blur(var(--blur));-webkit-backdrop-filter:blur(var(--blur))}}
body.mock .pane{{display:flex}}
.pane i{{display:block;height:7px;border-radius:4px}}
.pane i.gap{{height:6px;background:none!important}}
.on-light .pane i{{background:rgba(30,28,24,.72)}}
.on-dark .pane i{{background:rgba(236,232,222,.8)}}
.meta{{padding:12px 14px 14px;display:flex;flex-direction:column;gap:7px}}
h2{{font-size:17px;margin:0;font-weight:620}}
.meta p{{margin:0;color:var(--muted);font-size:13.5px}}
.row{{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted)}}
.sw{{width:22px;height:22px;border-radius:6px;border:1px solid #ffffff22}}
.blue{{margin-left:8px}}
code{{font:12.5px ui-monospace,"SF Mono",Menlo,monospace;color:#e8c9b8;background:#161514;border:1px solid var(--line);border-radius:7px;padding:5px 8px;align-self:flex-start}}
footer{{color:var(--muted);font-size:12.5px;padding:4px 16px 32px;max-width:1500px;margin:0 auto}}
</style></head>
<body class="mock">
<header>
  <h1>绘图仪潮汐 · 六套不含蓝光的深色配色</h1>
  <p>图案和动效与你选的浅色版完全一样,只换纸和墨的颜色。六套的底色里蓝色都是最弱的一路;最后两张是对照。</p>
  <div class="bar"><button id="mock" aria-pressed="true">模拟聊天面板</button></div>
</header>
<main>{''.join(cards)}</main>
<footer>「底色里蓝色占比」= 底色 RGB 中蓝色分量的比例,33% 是不偏色的灰,越低越暖。面板是按主题的毛玻璃参数画的示意,实际以 app 里为准。</footer>
<script>
const m=document.getElementById('mock');m.onclick=()=>{{const on=document.body.classList.toggle('mock');m.setAttribute('aria-pressed',on)}};
</script>
</body></html>"""
out_html.write_text(page, encoding="utf-8")
print("html bytes", out_html.stat().st_size)

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.webkit.launch()
    ctx = b.new_context(viewport={"width": 1500, "height": 900}, device_scale_factor=1, reduced_motion="reduce")
    pg = ctx.new_page()
    pg.goto(out_html.as_uri())
    pg.wait_for_timeout(900)
    pg.screenshot(path=str(out_shot), full_page=True, type="jpeg", quality=84)
    print("shot", out_shot, out_shot.stat().st_size)
    ctx.close()
    b.close()
