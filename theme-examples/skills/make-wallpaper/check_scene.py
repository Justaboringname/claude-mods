#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check a wallpaper scene before putting it in ~/.claude/wallpapers, and write a preview page.

usage:
  python3 check_scene.py <folder>            a folder holding day.svg and/or night.svg
  python3 check_scene.py day.svg night.svg   or the files themselves

For each scene it prints the problems (things the Claude desktop app refuses or strips) and the
warnings (things that usually look wrong), and it writes preview.html beside the scenes: both
versions at the app's proportions with the sidebar, the conversation column and sample text
drawn over them, so the picture can be judged where text will sit.

This is a helper written from the rules in SKILL.md, not the app's own validator: a scene that
passes here can still be refused by a newer or older app. The app is the judge; look at the result.
Python 3.8 or later, standard library only. Exit code 1 where any scene has a problem.
"""
import html
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

LIMIT = 131072
SVG_NS = "http://www.w3.org/2000/svg"
XLINK_NS = "http://www.w3.org/1999/xlink"
ALLOWED = {
    "circle", "clipPath", "defs", "desc", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer",
    "feComposite", "feConvolveMatrix", "feDisplacementMap", "feDropShadow", "feFlood", "feFuncA", "feFuncB",
    "feFuncG", "feFuncR", "feGaussianBlur", "feMerge", "feMergeNode", "feMorphology", "feOffset",
    "feTurbulence", "filter", "g", "line", "linearGradient", "marker", "mask", "path", "pattern", "polygon",
    "polyline", "radialGradient", "rect", "stop", "style", "svg", "symbol", "text", "textPath", "title",
    "tspan", "use",
}
SMIL = {"animate", "animateMotion", "animateTransform", "set", "mpath"}
COSTLY = {"feTurbulence", "feDisplacementMap", "feConvolveMatrix", "feMorphology"}


def local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def check(path: Path):
    problems, warnings = [], []
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as error:
        return [f"cannot be read as UTF-8 text: {error}"], warnings

    if len(text) > LIMIT:
        problems.append(f"{len(text)} characters: the app's limit for one scene is {LIMIT}")
    elif len(text) > LIMIT * 0.92:
        warnings.append(f"{len(text)} characters: close to the limit of {LIMIT}")
    if "data:" in text.lower():
        problems.append("contains 'data:': embedded data (bitmaps, fonts) is refused")
    if "<!DOCTYPE" in text or "<!ENTITY" in text:
        problems.append("has a DOCTYPE or an ENTITY: leave them out")

    try:
        root = ET.fromstring(text)
    except ET.ParseError as error:
        problems.append(f"is not well-formed XML: {error}")
        return problems, warnings

    if root.tag != f"{{{SVG_NS}}}svg":
        problems.append(f'the root must be <svg xmlns="{SVG_NS}">')
    box = (root.get("viewBox") or "").replace(",", " ").split()
    if box != ["0", "0", "1600", "1000"]:
        problems.append('the root needs viewBox="0 0 1600 1000" (the layout in SKILL.md is measured on that sheet)')
    if "slice" not in (root.get("preserveAspectRatio") or ""):
        problems.append('the root needs preserveAspectRatio="xMidYMid slice", or the scene will not fill the window')

    css = []
    seen_costly = set()
    animated = 0
    for el in root.iter():
        if not isinstance(el.tag, str):
            continue
        name = local(el.tag)
        if name in SMIL:
            problems.append(f"<{name}>: SMIL animation is dropped by the app; move things with CSS @keyframes")
            continue
        if not el.tag.startswith(f"{{{SVG_NS}}}") or name not in ALLOWED:
            problems.append(f"<{name}> is not an element the app keeps (no <image>, <foreignObject>, <script>, <a>, ...)")
            continue
        if name in COSTLY:
            seen_costly.add(name)
        for key, value in el.attrib.items():
            attr = local(key)
            if attr.lower().startswith("on"):
                problems.append(f"<{name}> has an event attribute ({attr}): refused")
            if attr == "href" and not value.startswith("#"):
                problems.append(f'<{name}> href="{value[:60]}": only "#id" references are allowed')
            if "url(" in value and not re.search(r"url\(\s*['\"]?#", value):
                problems.append(f'<{name}> {attr} uses url() to something other than "#id"')
            if attr == "style" and "animation" in value:
                animated += 1
        if name == "style":
            if len(el):
                problems.append("<style> must hold text only")
            css.append(el.text or "")
        if name == "text":
            warnings.append("<text>: the app has only the viewer's own fonts; lettering rarely looks as drawn. Prefer shapes.")

    sheet = "\n".join(css)
    if len(css) > 1:
        warnings.append("more than one <style>: keep the CSS in one")
    if "\\" in sheet:
        problems.append("the CSS holds a backslash: refused")
    if re.search(r"\bpath\s*\(", sheet):
        problems.append("the CSS uses path(): refused (animate transform and opacity instead)")
    if re.search(r"\d(vw|vh|vmin|vmax)\b", sheet):
        problems.append("the CSS uses viewport units (vw, vh): refused")
    if re.search(r"@import|expression\s*\(|javascript:", sheet, re.I):
        problems.append("the CSS holds @import or script-like text: refused")
    for bad in re.findall(r"url\(\s*['\"]?([^)'\"]*)", sheet):
        if not bad.startswith("#"):
            problems.append(f'the CSS uses url({bad[:40]}): only url(#id) is allowed')
    for query in re.findall(r"@media\s*([^{]*)\{", sheet):
        if "prefers-reduced-motion" not in query:
            problems.append(f"@media {query.strip()[:50]}: the only media query a moving scene may hold is prefers-reduced-motion")
    moves = "@keyframes" in sheet or "animation" in sheet or animated
    if moves and not re.search(r"@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)", sheet):
        problems.append("the scene moves but has no '@media (prefers-reduced-motion: reduce){*{animation:none!important}}'")
    if moves and re.search(r"@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}", sheet):
        for body in re.findall(r"@keyframes[^{]*\{((?:[^{}]*\{[^{}]*\})*)", sheet):
            props = set(re.findall(r"([a-z-]+)\s*:", re.sub(r"[^{}]*\{", "{", body)))
            extra = props - {"transform", "opacity"}
            if extra:
                warnings.append(f"keyframes animate {', '.join(sorted(extra))}: transform and opacity are the cheap ones; "
                                "the app stops a scene's motion when a frame costs more than about 5.5 ms")
    if seen_costly:
        warnings.append(f"{', '.join(sorted(seen_costly))}: costly filters; over a large area they can stop the scene's motion")
    count = sum(1 for _ in root.iter())
    if count > 2500:
        warnings.append(f"{count} elements: a heavy scene; if it moves, the app may stop its motion")
    return problems, warnings


PAGE = """<!doctype html><meta charset="utf-8"><title>Wallpaper preview</title>
<style>
body{margin:0;background:#777;font:15px/1.5 -apple-system,system-ui,sans-serif;color:#111}
h2{margin:18px 24px 8px;font-size:15px;color:#fff}
p.note{margin:0 24px 12px;color:#eee;max-width:900px}
.win{position:relative;width:min(1600px,calc(100vw - 48px));aspect-ratio:1600/1000;margin:0 24px 28px;overflow:hidden;border-radius:10px;box-shadow:0 6px 30px #0006}
.win img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.side{position:absolute;left:0;top:0;bottom:0;width:17.5%;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.light .side{background:#ffffff8c}.dark .side{background:#1a1a1a8c}
.col{position:absolute;left:27%;width:48%;top:8%;bottom:4%;display:flex;flex-direction:column;gap:2.2%}
.reach{position:absolute;left:75%;width:10.7%;top:0;bottom:0;border-left:1px dashed #f0f6;border-right:1px dashed #f0f6}
.guides .col{outline:1px dashed #f0f9}
body:not(.g) .reach{display:none} body:not(.g) .col{outline:none}
.line{height:1.9%;border-radius:99px;opacity:.82}
.light .line{background:#1f1e1d}.dark .line{background:#f3f1ec}
.bubble{align-self:flex-end;width:30%;height:6%;border-radius:12px;margin-right:-22%}
.light .bubble{background:#ffffffd9;box-shadow:0 0 0 1px #0002}.dark .bubble{background:#2b2a27d9;box-shadow:0 0 0 1px #fff2}
.box{margin-top:auto;height:8%;border-radius:14px}
.light .box{background:#ffffffe6;box-shadow:0 0 0 1px #0002}.dark .box{background:#262522e6;box-shadow:0 0 0 1px #fff2}
button{margin:14px 24px 0;font:inherit;padding:4px 12px}
</style>
<body class="g"><button onclick="document.body.classList.toggle('g')">Guides on / off</button>
<p class="note">Grey bars stand for text. The left panel is the app's sidebar. With guides on: the dashed box is the conversation
column (keep it empty), the dashed strip to its right is where long lines and your own message bubbles reach (faint edges only).</p>
__VIEWS__
</body>"""

VIEW = """<h2>{title}</h2><div class="win guides {kind}"><img src="{src}" alt=""><div class="side"></div><div class="reach"></div>
<div class="col"><div class="bubble"></div><div class="line" style="width:92%"></div><div class="line" style="width:100%"></div>
<div class="line" style="width:128%"></div><div class="line" style="width:64%"></div><div class="line" style="width:96%"></div>
<div class="line" style="width:40%"></div><div class="box"></div></div></div>"""


def main() -> int:
    args = [Path(a) for a in sys.argv[1:]]
    if not args:
        print(__doc__)
        return 2
    files = []
    for arg in args:
        if arg.is_dir():
            files += [arg / n for n in ("day.svg", "night.svg") if (arg / n).is_file()]
        else:
            files.append(arg)
    if not files:
        print("no day.svg or night.svg found")
        return 2

    bad = False
    views = []
    for path in files:
        problems, warnings = check(path)
        size = path.stat().st_size if path.is_file() else 0
        print(f"{path}  ({size} bytes)")
        for line in problems:
            print(f"  PROBLEM  {line}")
        for line in warnings:
            print(f"  warning  {line}")
        if not problems and not warnings:
            print("  ok")
        bad = bad or bool(problems)
        kind = "dark" if "night" in path.stem.lower() or "dark" in path.stem.lower() else "light"
        views.append(VIEW.format(title=html.escape(f"{path.name}  ({kind} window)"), kind=kind, src=html.escape(path.name)))

    out = files[0].parent / "preview.html"
    out.write_text(PAGE.replace("__VIEWS__", "\n".join(views)), encoding="utf-8")
    print(f"preview: {out}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
