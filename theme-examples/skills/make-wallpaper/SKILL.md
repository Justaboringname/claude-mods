---
name: make-wallpaper
description: Draw a wallpaper of the person's own for the Claude desktop app (the picture behind the chat) and put it where this plugin shows it. Use when someone asks for a custom wallpaper, backdrop, background or theme for Claude, "make me a ___ wallpaper", 做一张自己的壁纸 / 换对话背景 / 做个 ___ 主题.
---

# Make a wallpaper

You draw one SVG scene, in a version for light windows and a version for dark windows, check it, and save it to
`~/.claude/wallpapers/<name>/`. This plugin reads that folder: the person then types `/custom-theme <name>` and the
picture stands behind the chat, switching between the two versions with the system's appearance. No plugin has to be
written and nothing has to be reinstalled.

```
~/.claude/wallpapers/<name>/day.svg     light windows   (theme id: <name>)
~/.claude/wallpapers/<name>/night.svg   dark windows    (theme id: <name>-night)
~/.claude/wallpapers/<name>/meta.json   optional, see below
```

`<name>` is lower case letters, digits and single hyphens (`low-library`, `team-red`), 40 characters at most, and not
the name of a theme the plugin already has (`/custom-theme list` names them). Either file may stand alone; make both
unless the person only ever uses one appearance.

## 1. Find out what they want

If they have not said: the subject (a place, a team, a band, a season, a hobby), the mood, and anything that must be in
it. Offer two or three compositions in a sentence each and let them pick before drawing; a scene takes a while, and a
wrong subject is the costly mistake. A photograph cannot be used: the app draws vector scenes only, so you redraw the
subject, you do not embed it.

## 2. What the app accepts

A scene that breaks one of these is refused, or drawn with its motion stripped.

- One SVG document per version, at most **131072 characters**. Aim under 100000.
- Root exactly: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">`
- Elements: `svg g defs symbol use path rect circle ellipse line polyline polygon linearGradient radialGradient stop
  pattern clipPath mask marker filter` and the `fe*` filter primitives, `style title desc text tspan textPath`.
  No `<image>`, `<foreignObject>`, `<script>`, `<a>`. No `data:` anywhere. `href` and `url()` point at `#id` only.
- Motion is CSS only: one `<style>` with `@keyframes`. No SMIL (`<animate>`). No backslash, no `path()`, no `vw`/`vh` in
  the CSS. The only media query is the one every moving scene must have:
  `@media (prefers-reduced-motion: reduce){*{animation:none!important}}`
- Animate `transform` and `opacity` only, on few elements. The app stops a scene's motion when a frame costs more than
  about 5.5 ms: large blurred areas, `feTurbulence`, and hundreds of moving parts are what cost.
- The same picture every time: no randomness at view time. (Use a seeded scatter in the script that writes the file.)

## 3. Where the picture may go

The scene covers the whole window and is cropped to fill it, so the edges are lost first. On the 1600 by 1000 sheet:

| x | what is there | what you may draw |
| --- | --- | --- |
| 0 to 280 | under the app's sidebar on small screens | ground only; nothing that matters |
| 290 to 425 | free, left of the conversation | a second, smaller subject, low down (y 600 to 1000) |
| 432 to 1200 | the conversation's text | **nothing**: smooth ground, at most one very soft large glow |
| 1200 to 1370 | long lines, and the person's own message bubbles | faint, low-contrast edges only |
| 1300 to 1600 | free, right of the conversation | the main subject, full height |

The top 60 units sit under the title bar; keep them plain. A ground line or water line may run along the bottom, below
y 930. A sun, moon or glow high on the right ties the two sides together.

Text over the scene is near-black in light windows and near-white in dark windows. So the day ground is light (lightness
above about 85%) and the night ground is dark (under about 12%), and both are even: a banded or striped ground shows as
steps behind the text.

## 4. Drawing it well

- Draw a thing, not a gradient: a recognisable subject with structure, light and a few true particulars. Flat
  one-colour silhouettes look cheap at wallpaper size; the main subject should hold up enlarged three times.
- One scene, two palettes. Write a small script (any language) that builds the SVG from shared drawing functions and a
  palette, and writes `day.svg` and `night.svg`; keep the script in the wallpaper's folder so it can be refined later.
  Night adds its own lights (windows, lamps, a moon) and takes its colour from them, not from a coloured ground.
- A dark ground reads best as a warm or neutral near-black. A night scene must not go grey all over: keep the subject's
  own colours where light falls on it.
- Motion is slow and small, and never inside the conversation column: a few things drift, sway or twinkle.
- Look for accidental faces, figures and rude shapes before showing it.
- Rights and people: redraw, do not copy. No logos, crests or wordmarks of an organisation you have no right to use,
  no traced artwork, and no portrait of a real person unless the person asking is the one portrayed. A team, a band or a
  school can be evoked by its colours, its places and its objects.

## 5. Check and look

```
python3 "<this skill's folder>/check_scene.py" <folder with day.svg and night.svg>
```

It lists problems (fix every one) and warnings (judge each), and writes `preview.html` beside the scenes: both versions
with the sidebar, the conversation column and sample text drawn over them. Open the page and LOOK at it, with whatever
browser or screenshot tool this session has; if it has none, ask the person to open it and say what they see. Check that
the column is empty, that text would read over the ground in both versions, and that the left subject still reads with
the sidebar over the first 280 units. The checker is a helper written from the rules above, not the app's own
validator: the app has the last word.

Work in rounds: draw, check, look, list what is wrong, fix. Three or four rounds is normal.

## 6. Put it in place

Write the files into `~/.claude/wallpapers/<name>/`, with a `meta.json`:

```json
{
  "title": "Low Library",
  "blurb": "The dome and the steps on a clear morning.",
  "blurbNight": "The same steps under the winter lights.",
  "glassDay": { "tint": "#e8eef4" },
  "glassNight": { "tint": "#181613" }
}
```

`tint` is the scene's ground colour as `#rrggbb` (the app uses it for the panels around the chat). Everything in
`meta.json` is optional.

Then tell the person to type, in a session of the Claude desktop app:

- `/custom-theme <name>`: applies it. With both versions there, it follows the system's light or dark appearance.
- `/custom-theme <name> session`: this session only.
- `/custom-theme list`: every theme, theirs included. `/custom-theme default` goes back to the plugin's own wallpaper.

You cannot type these for them. After you redraw a wallpaper that is on show, they type `/custom-theme <name>` once
more and the window takes the new picture.

## If it does not show

- `/custom-theme list` does not name it: the folder's name breaks the rule above, a built-in theme has that name, or a
  file is over the limit or is not an SVG. Run the checker.
- It is named but the window stays plain: the window may not draw backdrops (an old version of the app, or a session
  watched from another machine, which shows no wallpaper), or the app refused the scene. Run the checker again and look
  for an element or a CSS function outside the lists above.
- The picture stands but nothing moves: a frame costs too much, or the reduced-motion rule is missing, or the system
  has Reduce Motion on.

## Sharing

A wallpaper is its folder: zip it and send it, and the other person unpacks it into their own `~/.claude/wallpapers/`.
