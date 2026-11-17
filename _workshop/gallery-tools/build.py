"""Build a single-file gallery of the twenty theme-examples scenes, then screenshot it."""
import base64
import html
import json
import sys
from pathlib import Path

src = Path(sys.argv[1])  # folder with themes.json and svg/
out_html = Path(sys.argv[2])
out_shot = Path(sys.argv[3]) if len(sys.argv) > 3 else None

ZH = {
    "honu-lagoon": ("海龟潟湖", "俯瞰的 ASCII 潟湖,一只瓷砖海龟游过沙岛"),
    "koi-mosaic": ("锦鲤马赛克", "俯瞰的瓷砖锦鲤池:两条锦鲤、睡莲叶、慢慢散开的涟漪"),
    "halftone-dawn": ("半调日出", "双色孔版印刷的日出,网点一圈圈向外呼吸"),
    "halftone-dusk": ("半调黄昏", "印在夜蓝纸上的同一幅日出,太阳是余烬色"),
    "plotter-tide": ("绘图仪潮汐", "暖色纸上,绘图笔自己画出一道道潮汐线"),
    "plotter-tide-night": ("绘图仪潮汐 · 夜", "蓝黑色夜纸上的浅色潮汐图"),
    "dither-dunes": ("抖动沙丘", "砂纸上的 1-bit 点阵沙丘,头顶一轮赤陶色太阳"),
    "dither-dunes-night": ("抖动沙丘 · 夜", "入夜后的同一片沙丘:棕褐底、浅色点、余烬太阳"),
    "paper-garden": ("纸花园", "暖白纸张边缘的剪纸叶子,一朵珊瑚色的花"),
    "paper-garden-kraft": ("纸花园 · 牛皮纸", "深色牛皮纸边缘的剪纸叶子,一朵珊瑚色的花"),
    "night-reef": ("夜礁", "入夜的潟湖:海龟和鳐鱼游动时会发光"),
    "snow-pines": ("雪松林", "黄昏的 ASCII 松林,雪从树间飘落"),
    "braille-stars": ("盲文星空", "用盲文点阵一点点画出来的缓慢夜空"),
    "teletext-clouds": ("方块云", "图文电视网格上用方块拼出的夜云,慢慢飘来"),
    "vector-range": ("矢量山脉", "黑底荧光线条山脉,一束琥珀色光反复描线"),
    "departure-board": ("发车牌", "琥珀色 LED 发车牌,一行行自己翻字"),
    "blueprint": ("蓝图", "一张蓝晒图纸,角落里彗星沿轨道绕行"),
    "deep-water": ("深水", "光线穿过深水落下,还有一只安静的海龟"),
    "aurora": ("极光", "暗色山脊上方摇曳的北极光"),
    "ember": ("余烬", "四角透出暖光,几粒火星缓缓升起"),
}

themes = json.loads((src / "themes.json").read_text())
cards = []
for t in themes:
    svg = (src / "svg" / f"{t['id']}.svg").read_bytes()
    uri = "data:image/svg+xml;base64," + base64.b64encode(svg).decode()
    zh_title, zh_blurb = ZH[t["id"]]
    g = t["glass"]
    dark = t["window"] == "dark"
    twin = f"<span class='twin'>另有{'浅' if dark else '深'}色版:{html.escape(t['twin'])}</span>" if t["twin"] else ""
    cards.append(f"""
<article class="card" data-window="{t['window']}">
  <div class="shot {'on-dark' if dark else 'on-light'}">
    <img src="{uri}" alt="{html.escape(t['title'])}">
    <div class="pane" style="--tint:{g.get('tint', '#ffffff')};--op:{g['opacity']};--blur:{g['blur']}px">
      <i style="width:72%"></i><i style="width:88%"></i><i style="width:54%"></i><i class="gap"></i><i style="width:80%"></i><i style="width:63%"></i>
    </div>
  </div>
  <div class="meta">
    <h2>{html.escape(zh_title)} <small>{html.escape(t['title'])}</small></h2>
    <p>{html.escape(zh_blurb)}</p>
    <div class="row"><span class="tag {t['window']}">{'深色窗口' if dark else '浅色窗口'}</span>{twin}</div>
    <code>/custom-theme {html.escape(t['id'])} session</code>
  </div>
</article>""")

page = f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Claude 官方背景 · 二十套</title>
<style>
:root{{color-scheme:dark;--bg:#141413;--panel:#1f1e1d;--line:#34322f;--text:#f0eee6;--muted:#a8a59b;--accent:#d97757}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 -apple-system,"PingFang SC","Helvetica Neue",sans-serif}}
header{{padding:28px 16px 8px;max-width:1560px;margin:0 auto}}
h1{{font-size:24px;margin:0 0 6px;font-weight:650;letter-spacing:.01em}}
header p{{margin:0;color:var(--muted);max-width:60em}}
.bar{{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}}
button{{font:inherit;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:6px 14px;cursor:pointer}}
button[aria-pressed="true"]{{background:var(--accent);border-color:var(--accent);color:#1a1310}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;padding:16px;max-width:1560px;margin:0 auto}}
.card{{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}}
.card[hidden]{{display:none}}
.shot{{position:relative;aspect-ratio:16/10;overflow:hidden;background:#000}}
.shot img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}}
.pane{{position:absolute;top:10%;bottom:10%;left:24%;right:24%;border-radius:10px;padding:14px 16px;display:none;flex-direction:column;gap:9px;
  background:color-mix(in srgb,var(--tint) calc(var(--op)*100%),transparent);backdrop-filter:blur(var(--blur));-webkit-backdrop-filter:blur(var(--blur))}}
body.mock .pane{{display:flex}}
.pane i{{display:block;height:7px;border-radius:4px}}
.pane i.gap{{height:4px;background:none!important}}
.on-light .pane i{{background:rgba(30,28,24,.72)}}
.on-dark .pane i{{background:rgba(240,238,230,.78)}}
.meta{{padding:12px 14px 14px;display:flex;flex-direction:column;gap:6px}}
h2{{font-size:16px;margin:0;font-weight:620}}
h2 small{{color:var(--muted);font-weight:400;font-size:13px;margin-left:4px}}
.meta p{{margin:0;color:var(--muted);font-size:13.5px}}
.row{{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:12.5px}}
.tag{{border-radius:999px;padding:1px 9px;border:1px solid var(--line)}}
.tag.light{{background:#efe9dc;color:#2a2620;border-color:#efe9dc}}
.tag.dark{{background:#0f1622;color:#cfd8ea}}
.twin{{color:var(--muted)}}
code{{font:12.5px ui-monospace,"SF Mono",Menlo,monospace;color:#e8c9b8;background:#191817;border:1px solid var(--line);border-radius:7px;padding:5px 8px;overflow-wrap:anywhere}}
footer{{color:var(--muted);font-size:12.5px;padding:8px 16px 32px;max-width:1560px;margin:0 auto}}
</style></head>
<body>
<header>
  <h1>Claude 官方背景 · 二十套</h1>
  <p>来自 Anthropic 的示例插件 theme-examples(Apache-2.0)。画面都是实时动效;「浅色/深色窗口」指它是为哪种外观画的。</p>
  <div class="bar">
    <button data-f="all" aria-pressed="true">全部</button>
    <button data-f="light" aria-pressed="false">浅色窗口</button>
    <button data-f="dark" aria-pressed="false">深色窗口</button>
    <button id="mock" aria-pressed="false">模拟聊天面板</button>
  </div>
</header>
<main>{''.join(cards)}</main>
<footer>「模拟聊天面板」按各主题自带的毛玻璃参数画了一块示意面板,只是近似,实际效果以 app 里的预览为准。</footer>
<script>
const cards=[...document.querySelectorAll('.card')],fs=[...document.querySelectorAll('button[data-f]')];
fs.forEach(b=>b.onclick=()=>{{fs.forEach(x=>x.setAttribute('aria-pressed',x===b));cards.forEach(c=>c.hidden=b.dataset.f!=='all'&&c.dataset.window!==b.dataset.f)}});
const m=document.getElementById('mock');m.onclick=()=>{{const on=document.body.classList.toggle('mock');m.setAttribute('aria-pressed',on)}};
if(location.hash==='#mock')m.click();
</script>
</body></html>"""
out_html.write_text(page, encoding="utf-8")
print("html bytes", out_html.stat().st_size)

if out_shot is not None:
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        b = p.webkit.launch()
        for name, motion, frag, wait in (("still", "reduce", "", 800), ("mock", "reduce", "#mock", 800), ("moving", "no-preference", "", 3500)):
            ctx = b.new_context(viewport={"width": 1560, "height": 900}, device_scale_factor=1, reduced_motion=motion)
            pg = ctx.new_page()
            pg.goto(out_html.as_uri() + frag)
            pg.wait_for_timeout(wait)
            target = out_shot.with_name(f"{out_shot.stem}-{name}.jpg")
            pg.screenshot(path=str(target), full_page=True, type="jpeg", quality=82)
            print("shot", target, target.stat().st_size)
            ctx.close()
        b.close()
