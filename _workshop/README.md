# Workshop

Drafts and tools behind the scenes in `../theme-examples/hooks/scenes/`.

- `scenes-final/`: the sources of the scenes that went into the plugin, and earlier states of them.
- `scenes-fusion-drafts/`: the three compositions tried for Pavilion and Stones (`fusion-a`, `-b`, `-c`; b was chosen) and two
  unfinished ways of drawing its Taihu stones (`rock-2` lean and furrowed, `rock-3` tonal; they were stopped part-way and are
  over the size limit). The chosen one is `scenes-final/garden-court/`.
- `scenes/`, `scenes-round2/`, `scenes-opt-round1/`, `scenes-opt-round2/`: drafts and palette trials. Each folder has a
  `scene.ts` that exports `daySvg()` and `nightSvg()`, and a `meta.json`.
- `garden-research/`: notes on how Taihu rocks and banana plants look in Suzhou gardens, with sources.
- `scene-tools-v2/`: `build_scene.sh <folder>` bundles a `scene.ts`, checks it and renders previews into `<folder>/out/`.
  It needs Python with Pillow and Playwright (WebKit), and Node for esbuild. Set `PYTHON` to choose the interpreter.
  `zoom_scene.py <folder> name=x,y,w,h ...` renders enlarged crops of a built scene (3x by default), for judging detail.
- `veil-test/`, `grain-test/`: two experiments (why a dark scene showed vertical stripes beside the chat column; paper grain
  with `feTurbulence`).

## The validator is not in this repository

`build_scene.sh` checks a scene with the Claude desktop app's own validator, so that a scene which passes here keeps its
motion in the app. That code belongs to the app and is not published here. The tool expects it as
`scene-tools-v2/app-validator.js`: the app's backdrop-scene chunk with its `import` and `export` statements removed and a
last line `var Dr=ue;` (the name of its validating function may differ between app versions). Without that file the tool
cannot check or render.

A scene must keep the chat column (x 432 to 1200 of a 1600 by 1000 sheet) clear, use CSS keyframes rather than SMIL, and
stop its motion under `@media (prefers-reduced-motion: reduce)`.
