// 亭台山石 (Pavilion and Stones): one Suzhou garden sheet that brings three motifs together instead of a row of like walls.
// Right, near and large, the hero: a six-sided garden pavilion with the flying eave corners of Jiangnan, a 黛 tile tent roof
// whose gourd finial reaches about a third of the way down the sheet, slender columns, a hanging fretwork frieze and a
// "beauty's rest" bench, on a dressed-stone plinth; a rockery of lake stones piled in courses at its foot (one main mass high at
// the right, lower tips in front, flat slabs lipping over a dark hollow at the water, a low cave mouth), and the pond below
// with a few level strokes and slow ripple rings. A willow bough comes in at the top right corner and its strands hang.
// Above, between the willow and the roof: the small sun by day, the moon by night.
// Left, lower and further off, quieter: a whitewashed wall under its tiled coping with a plain round gate in it, trimmed
// with grey brick; through it the far courtyard and a few bamboo culms whose crowns rise over the coping; in front of the
// wall, right of the gate, a free-standing Taihu peak (上大下小, its head hooking over toward the gate, a large opening
// under the hook at its edge and smaller holes low on the body), with a low companion stone, seated in a planted bed; a
// banana clump (芭蕉) leaning on the stone (蕉石), one leaf arching across the edge of the gate.
// The middle of the sheet (x 432..1200), where the conversation runs, is bare ground.
// daySvg: 晴日写真 (a soft blue-grey air warming to a pale haze round the sun; opaque white plaster with cool shade under
// 黛 tiles; plants in muted real greens; stone in cool grey). nightSvg: the moon-glow night (a warm black ground, one small
// pale yellow glow round the moon, moon-white plaster, tiles near black, lines in a pale warm tone; the pavilion lit amber
// from within and the courtyard beyond the gate softly lit).
// Motion: the willow strands and the bamboo crowns sway, the ripple rings widen and fade, the strokes on the water shimmer,
// a bank of mist drifts slowly over the pond; all in CSS keyframes, all stopped under prefers-reduced-motion.
// Pure string building, no imports, the same string on every call.

const WIDTH = 1600
const HEIGHT = 1000

/** One soft glow of colour in the sky: whole at its centre, gone at its radius. */
interface Glow {
  x: number
  y: number
  r: number
  colour: string
  alpha: number
}

/** The ground everything stands against: a vertical run of colours with glows laid over it. */
interface Sky {
  /** Offsets 0..1 down the sheet, with their colours. */
  base: Array<[number, string]>
  glows: Glow[]
}

/** The colours of the pavilion, its rockery, the willow and the water. */
interface Paint {
  /** Opaque limewash: the sill walls under the benches. */
  plaster: string
  /** The plinth and the steps: dressed stone, as white as the plaster where it faces the light. */
  plinth: string
  /** The cool shade laid on whatever turns from the light (a plinth's side, the underside of the roof), and its strength. */
  cool: string
  coolAlpha: number
  /** The roof: tile colour, the light it takes on the face turned most to the sky (a share of `lime`), the pale crown of each
   * row of cover tiles and the dark channel beside it. */
  tile: string
  tileLight: number
  lime: string
  rib: number
  groove: string
  grooveAlpha: number
  /** The underside of the eaves, and how much of it shows. */
  soffit: string
  soffitAlpha: number
  /** Lacquered wood: columns, lintels, fretwork, bench; the far columns seen inside the pavilion. */
  wood: string
  woodFar: string
  woodFarAlpha: number
  /** The bench's rail along the slat heads (by night it catches the light). */
  rail: string
  /** Lake stone: its body, the light on the side turned to the light, the cool wash on its forms, the dark of its hollows, its line. */
  stone: string
  stoneLit: string
  stoneLitAlpha: number
  stoneWash: string
  stoneWashAlpha: number
  hollow: string
  hollowAlpha: number
  stoneLine: string
  /** The willow's wood and its near and far strands. */
  bough: string
  boughAlpha: number
  willowNear: string
  willowFar: string
  willowAlpha: number
  /** Grass in the clefts of the rockery. */
  grass: string
  /** Water: a breath bluer than the air (its colour and cover), and the strokes and rings on it. */
  water: string
  waterAlpha: number
  ripple: string
  /** By night, the pavilion is lit from within: the light from its middle (0) out to the reach of its glow (1); the warm light it
   * throws on what is next to it; and its broken reflection on the water. */
  lamp?: {
    stops: ReadonlyArray<readonly [number, string, number]>
    spill: string
    spillStops: ReadonlyArray<readonly [number, number]>
    reflect: string
  }
}

/** The colours of the wall with the gate. */
interface WallPaint {
  plaster: string
  /** The tiles of the coping: slope, ridge, eave lips. */
  tile: string
  /** The light caught by the tiles set on edge along the ridge and the laps of the cover rows. */
  glint: string
  glintAlpha: number
  /** How dark the old rain streaks under the eave are, in the shade colour; how strongly the cover rows' edges are drawn; the light on the cover rows. */
  stain: number
  rib: number
  coverLight: number
  /** The polished grey brick round the gate. */
  brick: string
  brickAlpha: number
  /** The shade on plaster (under the eave, the streaks, the plinth, under the wall's foot), how much deeper it lies under the eave, the plinth's cover. */
  shade: string
  eaveShade: number
  plinth: number
  /** The line down the wall's free end; mondo grass. */
  edgeInk: string
  tuft: string
  /** The pale haze over the far ground beyond the gate by day, as a cover of the plaster colour. */
  haze: number
  /** The planted bed in front of the wall: its ground and how much of it. */
  bed: string
  bedAlpha: number
}

/** The banana's own paints (as Moon Gate has them). */
interface BananaPaint {
  blade: string
  back: string
  shade: string
  shadeAlpha: number
  rib: string
  ribAlpha: number
  line: string
  lineAlpha: number
  stem: string
  blotch: string
  shred: string
  heart: string
  dead: string
  deadLine: string
}

interface Stock {
  sky: Sky
  dark: boolean
  ink: string
  disc: string
  seal: string
  /** The colour of real shadow (a cave mouth, the hollow under a stone's lip) and how much of it those take. */
  shade: string
  shadeAlpha: number
  wash: number
  line: number
  /** The glow round the disc: its strength, colour and radius; the disc's own cover. */
  halo: number
  haloColour: string
  haloR: number
  discAlpha: number
  paint: Paint
  walls: WallPaint
  banana: BananaPaint
  /** The left peak: its body and the light on it (it stands against the white wall, so it is a little darker than the rockery). */
  peakStone: string
  peakLit: number
  /** The lake stones' own paints. */
  rock: RockPaint
  /** The bamboo beyond the gate: its own greens, or one ramp down the sheet (by night). `bambooInk` takes the place of `line`. */
  bamboo?: { leaf: string; cane: string }
  bambooRamp?: { from: number; to: number; stops: ReadonlyArray<readonly [number, string]> }
  bambooInk?: number
  /** The courtyard beyond the gate, softly lit by night: the light that fills the opening; its spill on the plaster and the brick round the
   * gate; the underside of the arch; the pool on the ground in front; the line of things seen against it. */
  gate?: {
    stops: ReadonlyArray<readonly [number, string]>
    spill: string
    spillStops: ReadonlyArray<readonly [number, number]>
    soffit: number
    pool: number
    line: string
  }
}

const STOCKS: { day: Stock; night: Stock } = {
  /** 晴日写真: the sky of the chosen day (model dayNatural), its haze moved onto this sheet's sun; white plaster, 黛 tiles, cool shade;
   * willow, bamboo and banana in muted real greens; lake stone in cool grey; the pavilion's wood a dark neutral (no brown). */
  day: {
    sky: {
      base: [[0, '#cfdae6'], [0.5, '#d3dce7'], [1, '#d8dee8']],
      glows: [
        { x: 1440, y: 196, r: 400, colour: '#ffefd4', alpha: 0.62 },
        { x: -120, y: 40, r: 720, colour: '#c1d0e1', alpha: 0.15 },
        { x: 1480, y: 1060, r: 600, colour: '#e4dfe2', alpha: 0.45 },
      ],
    },
    dark: false, ink: '#262b33', disc: '#eb976a', seal: '#b8432e', shade: '#262b33', shadeAlpha: 1, wash: 1, line: 1.1,
    halo: 0.3, haloColour: '#f5c39a', haloR: 96, discAlpha: 0.94,
    paint: {
      plaster: '#fefefe', plinth: '#fdfdfd', cool: '#3c4a5c', coolAlpha: 0.3,
      tile: '#262b33', tileLight: 0.02, lime: '#ffffff', rib: 0.2, groove: '#14171d', grooveAlpha: 0.55,
      soffit: '#34363c', soffitAlpha: 0.78,
      wood: '#38383d', woodFar: '#38383d', woodFarAlpha: 0.6, rail: '#38383d',
      stone: '#dfe3e8', stoneLit: '#ffffff', stoneLitAlpha: 0.8, stoneWash: '#3c4a5c', stoneWashAlpha: 1, hollow: '#232a35', hollowAlpha: 1, stoneLine: '#262b33',
      bough: '#4d4c4c', boughAlpha: 0.9, willowNear: '#4f7358', willowFar: '#7c9a84', willowAlpha: 1, grass: '#4f7358',
      water: '#b4c6dc', waterAlpha: 0.42, ripple: '#55667c',
    },
    walls: {
      plaster: '#fefefe', tile: '#262b33', glint: '#fefefe', glintAlpha: 0.2, stain: 0.045, rib: 0.15, coverLight: 0.02,
      brick: '#3c4a5c', brickAlpha: 0.3, shade: '#3c4a5c', eaveShade: 2.6, plinth: 0.07, edgeInk: '#262b33', tuft: '#4a6650', haze: 0.6,
      bed: '#a9b8c4', bedAlpha: 0.3,
    },
    banana: {
      blade: '#86a083', back: '#a9b9a3', shade: '#5d7a5e', shadeAlpha: 0.3, rib: '#dfe5d2', ribAlpha: 0.85,
      line: '#3b4a3e', lineAlpha: 0.72, stem: '#94a888', blotch: '#6e6a5c', shred: '#8d8a7c', heart: '#b9c9aa', dead: '#9f9c86', deadLine: '#55554a',
    },
    peakStone: '#d5dae1', peakLit: 0.5,
    rock: {
      body: '#adb2b8', lit: '#f6f7f8', shade: '#33363b', deep: '#1d1f23', lip: '#ffffff', rim: '#ffffff', line: '#2a2d32', moss: '#2c302d',
      litA: 0.62, shadeA: 0.42, rimA: 0.5, lineA: 0.55, wallA: 0.78, floorA: 0.6, lipA: 0.85, pitA: 0.55, pitLitA: 0.7, creaseA: 0.5,
      foldShadeA: 0.22, foldLitA: 0.6, glowA: 0,
    },
    bamboo: { leaf: '#4f7358', cane: '#3f5a48' },
  },
  /** The moon-glow night (model nightMoonGlow): a warm black ground, one small pale yellow glow round the moon, moon-white plaster,
   * tiles near black, pale warm lines; the pavilion lit amber from within, its light on the floor, the eaves' undersides, the rails,
   * the sill walls, the rockery's near side and broken on the water; the courtyard beyond the gate softly lit. Nothing purple. */
  night: {
    sky: { base: [[0, '#1b1915'], [1, '#141210']], glows: [{ x: 1440, y: 196, r: 236, colour: '#eadf9f', alpha: 0.3 }] },
    dark: true, ink: '#ece7d8', disc: '#f8f1cf', seal: '#a64a3c', shade: '#0e0c0a', shadeAlpha: 0.9, wash: 0.5, line: 0.8,
    halo: 0.3, haloColour: '#efe2a8', haloR: 104, discAlpha: 1,
    paint: {
      plaster: '#d8d4c8', plinth: '#aaa598', cool: '#0e0c0a', coolAlpha: 0.5,
      tile: '#0c0a09', tileLight: 0, lime: '#ece7d8', rib: 0.1, groove: '#050403', grooveAlpha: 0.5,
      soffit: '#0c0a09', soffitAlpha: 0.9,
      wood: '#1c1915', woodFar: '#c8925e', woodFarAlpha: 0.55, rail: '#f6d7a0',
      stone: '#3a3731', stoneLit: '#d8d4c8', stoneLitAlpha: 0.26, stoneWash: '#0e0c0a', stoneWashAlpha: 0.7, hollow: '#0a0908', hollowAlpha: 0.9, stoneLine: '#ece7d8',
      bough: '#a39d88', boughAlpha: 0.7, willowNear: '#9c977f', willowFar: '#6b675a', willowAlpha: 0.8, grass: '#c9c3b0',
      water: '#141210', waterAlpha: 0, ripple: '#c9c3b0',
      lamp: {
        stops: [[0, '#fae2b0', 1], [0.3, '#f2c27a', 0.86], [0.62, '#de9c58', 0.38], [1, '#c4844e', 0]],
        spill: '#eea87e',
        spillStops: [[0, 0.85], [0.42, 0.6], [0.7, 0.24], [1, 0]],
        reflect: '#f2c27a',
      },
    },
    walls: {
      plaster: '#d8d4c8', tile: '#0c0a09', glint: '#ece7d8', glintAlpha: 0.24, stain: 0.1, rib: 0.34, coverLight: 0.03,
      brick: '#2a241c', brickAlpha: 0.62, shade: '#0e0c0a', eaveShade: 2.4, plinth: 0.16, edgeInk: '#0c0a09', tuft: '#c9c3b0', haze: 0,
      bed: '#0e0c0a', bedAlpha: 0.35,
    },
    banana: {
      blade: '#3b3a31', back: '#33312a', shade: '#14120e', shadeAlpha: 0.4, rib: '#8a8571', ribAlpha: 0.7,
      line: '#e2d9c0', lineAlpha: 0.42, stem: '#3d3b32', blotch: '#14120e', shred: '#7a7564', heart: '#56534a', dead: '#5a5548', deadLine: '#cfc6a6',
    },
    peakStone: '#5a564d', peakLit: 0.4,
    rock: {
      body: '#4b4740', lit: '#cbc4b2', shade: '#0b0a08', deep: '#060505', lip: '#e8e1cd', rim: '#ece5d2', line: '#0b0a08', moss: '#0b0a08', glow: '#eea87e',
      litA: 0.5, shadeA: 0.55, rimA: 0.7, lineA: 0.6, wallA: 0.85, floorA: 0.7, lipA: 0.7, pitA: 0.6, pitLitA: 0.45, creaseA: 0.6,
      foldShadeA: 0.3, foldLitA: 0.45, glowA: 0.5,
    },
    bambooRamp: { from: 470, to: 660, stops: [[0, '#85806c'], [0.6, '#b3ad94'], [1, '#1d1813']] }, bambooInk: 1.1,
    gate: {
      stops: [[0, '#fae2b0'], [0.35, '#f2c27a'], [0.75, '#de9c58'], [1, '#c4844e']],
      spill: '#eea87e',
      spillStops: [[0, 0.7], [0.55, 0.42], [0.8, 0.14], [1, 0]],
      soffit: 0.45,
      pool: 0.34,
      line: '#f0bc86',
    },
  },
}

interface Point {
  x: number
  y: number
}

interface Built {
  defs: string
  markup: string
}

/** A repeatable number in 0..1 from two integers, so every build draws the same sheet. */
function hashUnit(index: number, salt: number): number {
  let value = (Math.imul(index, 374761393) + Math.imul(salt, 668265263)) | 0
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  value ^= value >>> 16
  return (value >>> 0) / 4294967296
}

/** Smooth noise in 0..1 along a line: hashed values at whole numbers, eased between. */
function noise(at: number, salt: number): number {
  const cell = Math.floor(at)
  const part = at - cell
  const ease = part * part * (3 - 2 * part)
  return hashUnit(cell, salt) * (1 - ease) + hashUnit(cell + 1, salt) * ease
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function channels(hex: string): number[] {
  return [1, 3, 5].map(at => parseInt(hex.slice(at, at + 2), 16))
}

/** How light a colour looks, 0..255. */
function luma(hex: string): number {
  const [r = 0, g = 0, b = 0] = channels(hex)
  return 0.3 * r + 0.59 * g + 0.11 * b
}

/** How a glow falls off: its share of full strength at each share of its radius. The gradient's stops and `skyAt` both read it. */
const FALLOFF: Array<[number, number]> = [[0, 1], [0.35, 0.72], [0.7, 0.24], [1, 0]]

function falloffAt(share: number): number {
  for (let index = 1; index < FALLOFF.length; index += 1) {
    const from = FALLOFF[index - 1]
    const to = FALLOFF[index]
    if (from && to && share <= to[0]) return from[1] + ((to[1] - from[1]) * (share - from[0])) / (to[0] - from[0])
  }
  return 0
}

/** The sky's own gradients: one down the sheet, one per glow, all in the sheet's units so that any shape painted with them matches the sky behind it. */
function skyDefs(sky: Sky): string {
  const base =
    `<linearGradient id="sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HEIGHT}">` +
    sky.base.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('') +
    '</linearGradient>'
  const glows = sky.glows
    .map(
      (glow, index) =>
        `<radialGradient id="glow${index}" gradientUnits="userSpaceOnUse" cx="${glow.x}" cy="${glow.y}" r="${glow.r}">` +
        FALLOFF.map(([offset, share]) => `<stop offset="${offset}" stop-color="${glow.colour}" stop-opacity="${round(glow.alpha * share * 100) / 100}"/>`).join('') +
        '</radialGradient>',
    )
    .join('')
  return base + glows
}

/** A path painted with the sky, layer by layer: an opaque piece of sky in the path's shape. A ridge stands on one, so it hides what is behind it and still fades into the same sky. */
function skyPainted(d: string, sky: Sky): string {
  return `<path d="${d}" style="fill:url(#sky)"/>` + sky.glows.map((_, index) => `<path d="${d}" style="fill:url(#glow${index})"/>`).join('')
}

/** The same for a long shape kept once in the defs: each layer of sky is a reference to it, so the shape is written once. */
function skyPaintedShape(id: string, sky: Sky): string {
  return `<use href="#${id}" fill="url(#sky)"/>` + sky.glows.map((_, index) => `<use href="#${id}" fill="url(#glow${index})"/>`).join('')
}

/** The sky's colour at a point, worked out as the gradients paint it. */
function skyAt(sky: Sky, x: number, y: number): string {
  const share = Math.min(1, Math.max(0, y / HEIGHT))
  let colour = channels(sky.base[0]?.[1] ?? '#000000')
  for (let index = 1; index < sky.base.length; index += 1) {
    const from = sky.base[index - 1]
    const to = sky.base[index]
    if (!from || !to) continue
    if (share >= from[0] && share <= to[0]) {
      const part = (share - from[0]) / (to[0] - from[0])
      const a = channels(from[1])
      const b = channels(to[1])
      colour = a.map((value, at) => value + ((b[at] ?? 0) - value) * part)
    }
  }
  for (const glow of sky.glows) {
    const distance = Math.hypot(x - glow.x, y - glow.y) / glow.r
    if (distance >= 1) continue
    const alpha = glow.alpha * falloffAt(distance)
    const over = channels(glow.colour)
    colour = colour.map((value, at) => value + ((over[at] ?? 0) - value) * alpha)
  }
  return '#' + colour.map(value => Math.round(value).toString(16).padStart(2, '0')).join('')
}

// ---------------------------------------------------------------------------------------------------------------------
// Small tools of the pen.

function pt(x: number, y: number): Point {
  return { x, y }
}

function at(point: Point): string {
  return `${round(point.x)} ${round(point.y)}`
}

function polyline(points: Point[], closed = false): string {
  return 'M' + points.map(at).join('L') + (closed ? 'Z' : '')
}

/** An opacity in 0..1 with two decimals. */
function share(value: number): number {
  return Math.round(Math.max(0, Math.min(1, value)) * 100) / 100
}

/** A smooth open path through the midpoints of the points. */
function smoothPath(points: Point[]): string {
  const first = points[0]
  const second = points[1]
  const third = points[2]
  const last = points[points.length - 1]
  if (!first || !second || !last) return ''
  if (points.length < 4 || !third) return 'M' + points.map(point => `${round(point.x)} ${round(point.y)}`).join('L')
  let path = `M${round(first.x)} ${round(first.y)}Q${round(second.x)} ${round(second.y)} ${round((second.x + third.x) / 2)} ${round((second.y + third.y) / 2)}`
  for (let index = 2; index < points.length - 1; index += 1) {
    const here = points[index]
    const next = points[index + 1]
    if (here && next) path += `T${round((here.x + next.x) / 2)} ${round((here.y + next.y) / 2)}`
  }
  return `${path}T${round(last.x)} ${round(last.y)}`
}

/** The same for a closed ring. */
function smoothRing(points: Point[]): string {
  const count = points.length
  let path = ''
  for (let index = 0; index < count; index += 1) {
    const before = points[(index + count - 1) % count]
    const here = points[index]
    const next = points[(index + 1) % count]
    if (!before || !here || !next) continue
    const middle = `${round((here.x + next.x) / 2)} ${round((here.y + next.y) / 2)}`
    if (index === 0) path = `M${round((before.x + here.x) / 2)} ${round((before.y + here.y) / 2)}Q${at(here)} ${middle}`
    else path += `T${middle}`
  }
  return path + 'Z'
}

/** A run of points through the given ones, rounded as a brush rounds a corner (Catmull-Rom). */
function spline(points: Point[], per: number): Point[] {
  const out: Point[] = []
  const last = points.length - 1
  for (let index = 0; index < last; index += 1) {
    const a = points[Math.max(0, index - 1)]
    const b = points[index]
    const c = points[index + 1]
    const d = points[Math.min(last, index + 2)]
    if (!a || !b || !c || !d) continue
    for (let step = 0; step < per; step += 1) {
      const t = step / per
      const t2 = t * t
      const t3 = t2 * t
      out.push(
        pt(
          0.5 * (2 * b.x + (c.x - a.x) * t + (2 * a.x - 5 * b.x + 4 * c.x - d.x) * t2 + (3 * b.x - a.x - 3 * c.x + d.x) * t3),
          0.5 * (2 * b.y + (c.y - a.y) * t + (2 * a.y - 5 * b.y + 4 * c.y - d.y) * t2 + (3 * b.y - a.y - 3 * c.y + d.y) * t3),
        ),
      )
    }
  }
  const end = points[last]
  if (end) out.push(end)
  return out
}

/** A stroke that swells and thins: the outline of a line whose width follows `widthAt` (0 at its start, 1 at its end). */
function taper(points: Point[], widthAt: (along: number) => number): string {
  const left: Point[] = []
  const right: Point[] = []
  const last = points.length - 1
  for (let index = 0; index <= last; index += 1) {
    const before = points[Math.max(0, index - 1)]
    const here = points[index]
    const after = points[Math.min(last, index + 1)]
    if (!before || !here || !after) continue
    const dx = after.x - before.x
    const dy = after.y - before.y
    const length = Math.hypot(dx, dy) || 1
    const half = widthAt(index / last) / 2
    left.push(pt(here.x - (dy / length) * half, here.y + (dx / length) * half))
    right.unshift(pt(here.x + (dy / length) * half, here.y - (dx / length) * half))
  }
  return polyline(left.concat(right), true)
}

/** A closed ring of points written with relative moves, which are shorter than absolute ones: the outline of a brush band.
 * Every point is rounded first and each move is the difference of two rounded points, so the pen never drifts. */
function relRing(points: Point[]): string {
  let d = ''
  let px = 0
  let py = 0
  points.forEach((point, index) => {
    const x = round(point.x)
    const y = round(point.y)
    if (index === 0) d += `M${x} ${y}`
    else {
      const dx = round(x - px)
      const dy = round(y - py)
      d += `l${dx}${dy < 0 ? '' : ' '}${dy}`
    }
    px = x
    py = y
  })
  return d + 'Z'
}

/** A brush band along a run of points, as wide at each as `widths` says: what a pressed and lifted brush leaves. */
function ribbon(points: Point[], widths: number[]): string {
  const left: Point[] = []
  const right: Point[] = []
  const last = points.length - 1
  points.forEach((here, index) => {
    const before = points[Math.max(0, index - 1)] ?? here
    const after = points[Math.min(last, index + 1)] ?? here
    const dx = after.x - before.x
    const dy = after.y - before.y
    const length = Math.hypot(dx, dy) || 1
    const half = (widths[index] ?? 0) / 2
    left.push(pt(here.x - (dy / length) * half, here.y + (dx / length) * half))
    right.unshift(pt(here.x + (dy / length) * half, here.y - (dx / length) * half))
  })
  return relRing(left.concat(right))
}

/** A wash: a shape filled with thinned ink. */
function washed(d: string, stock: Stock, strength: number, extra = ''): string {
  return `<path d="${d}" fill="${stock.ink}" fill-opacity="${share(strength * stock.wash)}"${extra}/>`
}

/** A shape filled with ink at pen strength: columns, ridges, the finial. */
function inked(d: string, stock: Stock, strength: number): string {
  return `<path d="${d}" fill="${stock.ink}" fill-opacity="${share(strength * stock.line)}"/>`
}

/** A pen line. */
function drawn(d: string, stock: Stock, width: number, strength: number, extra = ''): string {
  return `<path d="${d}" stroke="${stock.ink}" stroke-width="${width}" stroke-opacity="${share(strength * stock.line)}"${extra}/>`
}

/** The colour a wash of `over` at strength `alpha` makes on `under`: one flat fill then does for a small shape what a piece of sky and a wash would. */
function mixed(under: string, over: string, alpha: number): string {
  const a = channels(under)
  const b = channels(over)
  return '#' + a.map((value, at) => Math.round(value + ((b[at] ?? 0) - value) * alpha).toString(16).padStart(2, '0')).join('')
}

/** A shape filled with one flat colour (the sky's own colour there): it hides what is behind a small thing. */
function blank(d: string, colour: string): string {
  return `<path d="${d}" fill="${colour}"/>`
}

/** A shape in a paint of its own (a colour or a gradient), at a cover; nothing when the shape is empty. */
function fillWith(d: string, paint: string, cover: number, extra = ''): string {
  if (!d) return ''
  return `<path d="${d}" fill="${paint}"${cover < 1 ? ` fill-opacity="${share(cover)}"` : ''}${extra}/>`
}

/** A line in a paint of its own. */
function strokeWith(d: string, paint: string, width: number, cover: number, extra = ''): string {
  if (!d) return ''
  return `<path d="${d}" stroke="${paint}" stroke-width="${width}"${cover < 1 ? ` stroke-opacity="${share(cover)}"` : ''}${extra}/>`
}

/** Numbers written as tightly as a path allows: one decimal, no leading zero, no space before a minus sign. */
function pack(values: number[]): string {
  let out = ''
  for (const value of values) {
    let text = String(round(value))
    if (text.startsWith('0.')) text = text.slice(1)
    else if (text.startsWith('-0.')) text = '-' + text.slice(2)
    out += (out && !text.startsWith('-') ? ' ' : '') + text
  }
  return out
}

function midway(first: Point, second: Point): string {
  return `${round((first.x + second.x) / 2)} ${round((first.y + second.y) / 2)}`
}

/** A closed polygon through points, then back along a second row of points, written in relative steps to keep it short. */
function band(outer: Point[], inner: Point[]): string {
  if (outer.length < 2) return ''
  const points = outer.concat(inner.slice().reverse()).map(point => ({ x: round(point.x), y: round(point.y) }))
  const first = points[0]
  if (!first) return ''
  const steps: number[] = []
  for (let index = 1; index < points.length; index += 1) {
    const here = points[index]
    const before = points[index - 1]
    if (here && before) steps.push(here.x - before.x, here.y - before.y)
  }
  return `M${pack([first.x, first.y])}l${pack(steps)}z`
}

/** An opacity in 0..1 with two decimals (Moon Gate's name for `share`). */
function alpha(value: number): number {
  return share(value)
}

// ---------------------------------------------------------------------------------------------------------------------
// Lake stones (太湖石), modelled by light and shade as a careful painter or a photograph sees them, not by outline.
// Each stone is one opaque body: its outline, with the far openings of the holes that go right through cut out of it, so the wall
// or the sky shows in them. Everything on it is clipped to that body:
//   the body's middle tone and one broad fall of light across it, from the side turned to the sun or moon to the side turned away;
//   its swellings, each lit toward the light and shaded away from it; soft shade in its hollows, under its overhangs and where it
//   sinks into the ground;
//   the worked surface (皱): ridges and ledges as lenses lit on the side toward the light and shaded on the other, grooves the
//   other way about; and round every hole the hollow it sits in and the worn rims the water swirled round it (弹涡), each a pair of
//   crescents that taper to nothing, shaded on the slope that faces away from the light and lit on the slope that faces it;
//   the holes (透, 漏), many and of very unequal size: the stone's thickness shows in every one (inside the near rim, the far wall
//   of the passage as a darker crescent under the lip on the side toward the light; a blind hollow darkest at its back), a lip of
//   light on its rim toward the light, a soft shade spilling below it;
//   bullet pits (弹子窝) in clusters, each a dark cup with a fleck of light on its rim; a few ink moss dots in the notches.
// Over the body, a thin dark line only on the side turned from the light, a rim of light on the side turned to it, and by night
// the warm light of the lantern or the gate on the side that faces it.

/** The paints of the lake stones on one sheet. All neutral (by day a cool grey, by night a moonlit warm grey): no hue of their own. */
interface RockPaint {
  body: string
  lit: string
  shade: string
  deep: string
  lip: string
  rim: string
  line: string
  moss: string
  /** The warm light of the lantern and of the lit gate, by night. */
  glow?: string
  litA: number
  shadeA: number
  rimA: number
  lineA: number
  wallA: number
  floorA: number
  lipA: number
  pitA: number
  pitLitA: number
  glowA: number
}

/** Even tenths of a unit (or a coarser even step of tenths, for something soft): the midpoint of two such knots is a whole tenth,
 * so a smooth chain written with `t` never drifts. */
function even(value: number, step = 2): number {
  return Math.round((value * 10) / step) * step
}

/** Whole tenths, written as tightly as a path allows. */
function tenths(values: number[]): string {
  let out = ''
  for (const value of values) {
    const v = Math.round(value)
    const a = Math.abs(v)
    const whole = Math.floor(a / 10)
    const part = a % 10
    let text = part ? (whole ? `${whole}.${part}` : `.${part}`) : `${whole}`
    if (v < 0) text = '-' + text
    out += (out && !text.startsWith('-') ? ' ' : '') + text
  }
  return out
}

type Tenth = [number, number]

function midT(a: Tenth, b: Tenth): Tenth {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
}

/** A smooth chain through the midpoints of the knots, each knot pulling the line as a control point, in relative moves.
 * Closed: a ring. Open: from the first knot to the last. A knot given twice makes a sharp turn on it. */
function chain(points: Point[], closed: boolean, step = 2): string {
  const p: Tenth[] = points.map(point => [even(point.x, step), even(point.y, step)])
  const n = p.length
  const first = p[0]
  if (!first || n < 2) return ''
  const at = (index: number): Tenth => p[((index % n) + n) % n] ?? first
  if (!closed) {
    const second = at(1)
    if (n === 2) return `M${tenths(first)}l${tenths([second[0] - first[0], second[1] - first[1]])}`
    let cur = midT(second, at(2))
    let d = `M${tenths(first)}q${tenths([second[0] - first[0], second[1] - first[1], cur[0] - first[0], cur[1] - first[1]])}`
    for (let index = 2; index < n; index += 1) {
      const next = index === n - 1 ? at(index) : midT(at(index), at(index + 1))
      d += `t${tenths([next[0] - cur[0], next[1] - cur[1]])}`
      cur = next
    }
    return d
  }
  const start = midT(at(n - 1), first)
  let cur = midT(first, at(1))
  let d = `M${tenths(start)}q${tenths([first[0] - start[0], first[1] - start[1], cur[0] - start[0], cur[1] - start[1]])}`
  for (let index = 1; index < n; index += 1) {
    const next = midT(at(index), at(index + 1))
    d += `t${tenths([next[0] - cur[0], next[1] - cur[1]])}`
    cur = next
  }
  return d + 'z'
}

/** Runs of a closed chain's arcs (arc i runs from the midpoint before knot i to the one after it), each run written as an open chain. */
function arcRuns(points: Point[], runs: number[][]): string {
  const p: Tenth[] = points.map(point => [even(point.x), even(point.y)])
  const n = p.length
  const at = (index: number): Tenth => p[((index % n) + n) % n] ?? [0, 0]
  let d = ''
  for (const run of runs) {
    const head = run[0]
    if (head === undefined) continue
    const start = midT(at(head - 1), at(head))
    const control = at(head)
    let cur = midT(control, at(head + 1))
    d += `M${tenths(start)}q${tenths([control[0] - start[0], control[1] - start[1], cur[0] - start[0], cur[1] - start[1]])}`
    for (let k = 1; k < run.length; k += 1) {
      const index = run[k] ?? 0
      const next = midT(at(index), at(index + 1))
      d += `t${tenths([next[0] - cur[0], next[1] - cur[1]])}`
      cur = next
    }
  }
  return d
}

/** A small seeded generator (mulberry32): the same numbers on every build. */
function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function inside(poly: Point[], x: number, y: number): boolean {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const a = poly[i]
    const b = poly[j]
    if (!a || !b) continue
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hit = !hit
  }
  return hit
}

function pairPoints(values: number[]): Point[] {
  const out: Point[] = []
  for (let index = 0; index + 1 < values.length; index += 2) out.push(pt(values[index] ?? 0, values[index + 1] ?? 0))
  return out
}

/** One lake stone, in the units of the group it is drawn in (`unit` of those make one unit of the sheet: for line widths, pits, rims).
 * edge: the outline's knots, x, y, and 1 where it turns sharply into a notch.
 * holes: x, y, rx, ry, turn (degrees), 1 if it goes right through; and optionally a second opening it has run into (its centre
 *   from the first, and its radius): a double hole.
 * lobes: swellings, x, y, rx, ry, turn, strength. darks / lights: soft shade (an overhang's, the ground's) or light, the same.
 * ridges / grooves: runs of points (x, y, ...); a ridge's width may be given after a 0 at the end of its run (..., 0, width).
 * pits: clusters of bullet pits: x, y, radius, how many; `scatter` more over the whole stone.
 * moss: x, y pairs. cave: a ring, dark. under: the dark hollow under a slab's lip, a ring; lip: that lip, a run, lit. */
interface Taihu {
  edge: number[]
  holes: number[][]
  lobes?: number[][]
  darks?: number[][]
  lights?: number[][]
  ridges?: number[][]
  grooves?: number[][]
  pits?: number[][]
  scatter?: number
  moss?: number[]
  cave?: number[]
  under?: number[]
  lip?: number[]
  /** A flat slab: no diagonal fall of light across it, its lit top and dark undercut say its form. */
  flat?: boolean
}

interface Lighting {
  /** Toward the sun or moon. */
  light: Point
  /** A near warm light (the lantern, the lit gate) by night: where it is, how far it reaches. */
  lamp?: { at: Point; reach: number }
}

/** The paints shared by every lake stone on the sheet: the fall of light across a body; a ridge's fall from lit to shaded across it
 * (and, turned about, a groove's or a hollow's); the wall of a hole; a soft light, a soft shade, a soft warm light. */
function rockDefs(rock: RockPaint): string {
  const glow = rock.glow ?? rock.lit
  return (
    `<linearGradient id="tg" x1="1" y1="0" x2=".1" y2="1"><stop offset="0" stop-color="${rock.lit}" stop-opacity="${rock.litA}"/><stop offset=".42" stop-color="${rock.lit}" stop-opacity="0"/>` +
    `<stop offset=".58" stop-color="${rock.shade}" stop-opacity="0"/><stop offset="1" stop-color="${rock.shade}" stop-opacity="${rock.shadeA}"/></linearGradient>` +
    `<linearGradient id="tr" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rock.lit}" stop-opacity=".85"/><stop offset=".45" stop-color="${rock.lit}" stop-opacity="0"/><stop offset=".55" stop-color="${rock.shade}" stop-opacity="0"/><stop offset="1" stop-color="${rock.shade}" stop-opacity=".8"/></linearGradient>` +
    `<linearGradient id="tq" href="#tr" x1="0" y1="1" x2="1" y2="0"/>` +
    `<linearGradient id="th" x1=".85" y1=".05" x2=".2" y2=".95"><stop offset="0" stop-color="${rock.deep}" stop-opacity="${share(rock.wallA * 1.1)}"/><stop offset=".5" stop-color="${rock.deep}" stop-opacity="${share(rock.wallA * 0.9)}"/><stop offset="1" stop-color="${rock.shade}" stop-opacity="${share(rock.wallA * 0.55)}"/></linearGradient>` +
    `<radialGradient id="tl"><stop offset="0" stop-color="${rock.lit}"/><stop offset=".45" stop-color="${rock.lit}" stop-opacity=".55"/><stop offset="1" stop-color="${rock.lit}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="td"><stop offset="0" stop-color="${rock.shade}"/><stop offset=".45" stop-color="${rock.shade}" stop-opacity=".55"/><stop offset="1" stop-color="${rock.shade}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="tw"><stop offset="0" stop-color="${glow}"/><stop offset=".5" stop-color="${glow}" stop-opacity=".45"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>`
  )
}

/** A soft ellipse and how strong it is: whole numbers are enough for something this soft. */
type Soft = [string, number]

function softAt(x: number, y: number, rx: number, ry: number, turn: number, cover: number): Soft {
  const spin = Math.abs(turn) > 4 ? ` transform="rotate(${Math.round(turn)} ${Math.round(x)} ${Math.round(y)})"` : ''
  return [`<ellipse cx="${Math.round(x)}" cy="${Math.round(y)}" rx="${Math.max(1, Math.round(rx))}" ry="${Math.max(1, Math.round(ry))}"${spin}/>`, cover]
}

/** Shapes that share one paint, in one group. */
function painted(paint: string, items: string[], extra = ''): string {
  return items.length ? `<g fill="url(#${paint})"${extra}>${items.join('')}</g>` : ''
}

/** Soft shapes in one paint, sorted into a few strengths, a group for each. */
function softly(paint: string, items: Soft[]): string {
  const steps = new Map<number, string[]>()
  for (const [shape, cover] of items) {
    const step = Math.max(1, Math.min(9, Math.round(cover * 10)))
    steps.set(step, (steps.get(step) ?? []).concat(shape))
  }
  return Array.from(steps.keys())
    .sort((a, b) => a - b)
    .map(step => painted(paint, steps.get(step) ?? [], ` fill-opacity=".${step}"`))
    .join('')
}

function taihu(id: string, stone: Taihu, rock: RockPaint, lighting: Lighting, unit = 1, seed = 1): Built {
  const L = lighting.light
  const rand = seeded(seed * 7919 + 13)
  // The outline: knots, a sharp one given twice.
  const knots: Point[] = []
  const poly: Point[] = []
  for (let index = 0; index + 2 < stone.edge.length; index += 3) {
    const point = pt(stone.edge[index] ?? 0, stone.edge[index + 1] ?? 0)
    knots.push(point)
    poly.push(point)
    if (stone.edge[index + 2]) knots.push(point)
  }
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let area = 0
  poly.forEach((a, index) => {
    const b = poly[(index + 1) % poly.length] ?? a
    area += a.x * b.y - b.x * a.y
    minX = Math.min(minX, a.x)
    maxX = Math.max(maxX, a.x)
    minY = Math.min(minY, a.y)
    maxY = Math.max(maxY, a.y)
  })
  const turn = area > 0 ? 1 : -1
  const outline = chain(knots, true)

  // The holes.
  let cuts = ''
  let cups = ''
  let floors = ''
  let lips = ''
  let lipsFine = ''
  let deepLips = ''
  const shades: Soft[] = []
  const lights: Soft[] = []
  const walls: string[] = []
  const bowlsNear: string[] = []
  const bowlsFar: string[] = []
  const holeZones: Array<[number, number, number]> = []
  stone.holes.forEach((hole, order) => {
    const [x = 0, y = 0, rx = 1, ry = 1, angle = 0, through = 0] = hole
    const mdx = hole[6]
    const mdy = hole[7]
    const mr = hole[8]
    const salt = order * 2.3 + seed
    const a = (angle * Math.PI) / 180
    const c = Math.cos(a)
    const s = Math.sin(a)
    const size = Math.min(rx, ry) / unit
    const count = size < 1.6 ? 6 : Math.max(8, Math.min(15, Math.round((rx + ry + (mr ?? 0)) / unit) + 2))
    const dirs: Point[] = []
    const reach: number[] = []
    for (let index = 0; index < count; index += 1) {
      const theta = (Math.PI * 2 * index) / count
      const dx = Math.cos(theta)
      const dy = Math.sin(theta)
      const ex = dx * c + dy * s
      const ey = -dx * s + dy * c
      let r = 1 / Math.sqrt((ex / rx) ** 2 + (ey / ry) ** 2)
      if (mdx !== undefined && mdy !== undefined && mr) {
        const along = dx * mdx + dy * mdy
        const disc = along * along - (mdx * mdx + mdy * mdy) + mr * mr
        if (disc >= 0) r = Math.max(r, along + Math.sqrt(disc))
      }
      r *= 1 + 0.09 * Math.sin(3 * theta + salt) + 0.06 * Math.sin(5 * theta + 1.7 * salt) + 0.05 * Math.sin(2 * theta + 0.6 * salt)
      dirs.push(pt(dx, dy))
      reach.push(r)
    }
    const ring = (k: number, sx: number, sy: number, push = 0): Point[] =>
      dirs.map((d, index) => pt(x + sx + d.x * ((reach[index] ?? 1) * k + push), y + sy + d.y * ((reach[index] ?? 1) * k + push)))
    holeZones.push([x + (mdx ?? 0) / 2, y + (mdy ?? 0) / 2, Math.max(rx, ry) + (mr ?? 0) / 2])
    // The hollow the hole sits in, and round it one or two worn rims as the water swirled them (弹涡): each the same rim twice, moved
    // a little toward the light and away from it and filled even-odd, so that two crescents that taper to nothing are left, the one
    // toward the light shaded (that slope runs down into the hollow away from the light), the other lit.
    if (size >= 2.4) {
      const big = Math.max(rx, ry) + (mr ?? 0) * 0.5
      const bowls = size >= 4.2 ? 2 : 1
      const few = Math.max(6, Math.round(count * 0.5))
      for (let bowl = 0; bowl < bowls; bowl += 1) {
        const f = (bowl ? 2.1 : 1.45) + 0.3 * rand()
        const swing = (rand() - 0.5) * 1.1
        const dx = L.x * Math.cos(swing) - L.y * Math.sin(swing)
        const dy = L.x * Math.sin(swing) + L.y * Math.cos(swing)
        const depth = (0.2 + 0.08 * bowl) * big + 0.3 * unit
        const rim = (sign: number): Point[] => {
          const out: Point[] = []
          for (let step = 0; step < few; step += 1) {
            const index = Math.floor((step * count) / few)
            const d = dirs[index] ?? pt(1, 0)
            const r = (reach[index] ?? 1) * f * (1 + 0.1 * Math.sin(step * 1.7 + salt + bowl)) + 0.5 * unit
            out.push(pt(x - L.x * big * 0.15 + d.x * r + sign * dx * depth, y - L.y * big * 0.15 + d.y * r + sign * dy * depth))
          }
          return out
        }
        ;(bowl ? bowlsFar : bowlsNear).push(`<path d="${chain(rim(1), true, 4)}${chain(rim(-1), true, 4)}"/>`)
      }
    }
    const near = ring(1, 0, 0)
    if (size < 1.6) {
      // A small hole: its cup only, a lit fleck on its rim.
      cups += chain(near, true)
      if (through) cuts += chain(ring(0.55, -L.x * 0.3 * Math.min(rx, ry), -L.y * 0.3 * Math.min(rx, ry)), true)
    } else {
      // The passage's wall, darkest under the lip toward the light and lighter where it turns up to the light; the far opening moved
      // away from the light inside it, so the wall shows as a crescent on the side toward the light.
      const k = through ? 0.66 : 0.58
      const shift = (1 - k) * Math.min(rx, ry) * 0.85
      const far = chain(ring(k, -L.x * shift, -L.y * shift), true)
      walls.push(`<path d="${chain(near, true)}"/>`)
      if (through) cuts += far
      else floors += far
      // Shade spilling below the hole; below a large one, rain has stained the stone in a long streak.
      if (size >= 2.4) shades.push(softAt(x - L.x * rx * 0.3, y + ry * (size >= 3 ? 1.6 : 0.8), rx * 1.3, ry * (size >= 3 ? 2.6 : 1.5), 0, 0.3))
    }
    // The lip toward the light, a little outside the near rim; just inside it the darkest shade.
    const runs: number[][] = []
    let current: number[] = []
    const facing = dirs.map(d => d.x * L.x + d.y * L.y)
    const startAt = Math.max(0, facing.findIndex(f => f <= 0.25))
    for (let step = 0; step < count; step += 1) {
      const index = (startAt + step) % count
      if ((facing[index] ?? 0) > 0.25) current.push(index)
      else if (current.length) {
        runs.push(current)
        current = []
      }
    }
    if (current.length) runs.push(current)
    const lipRing = ring(1, 0, 0, 0.3 * unit + 0.06 * Math.min(rx, ry))
    const deepRing = ring(0.84, 0, 0)
    for (const run of runs) {
      if (run.length < 2) continue
      const outer = run.map(index => lipRing[index] ?? pt(x, y))
      if (size >= 3) lips += chain(outer, false)
      else lipsFine += chain(outer, false)
      if (size >= 2.4) deepLips += chain(run.map(index => deepRing[index] ?? pt(x, y)), false)
    }
  })

  // Bullet pits: in clusters, and a few over the whole stone; never in a hole or on another pit.
  const pitSpots: Array<[number, number, number]> = []
  const tryPit = (px: number, py: number, big: number): void => {
    if (!inside(poly, px, py)) return
    for (const [hx, hy, hr] of holeZones) if (Math.hypot(px - hx, py - hy) < hr + 1.4 * unit) return
    for (const [qx, qy] of pitSpots) if (Math.hypot(px - qx, py - qy) < 1.5 * unit) return
    pitSpots.push([px, py, big])
  }
  for (const cluster of stone.pits ?? []) {
    const [cx = 0, cy = 0, radius = 4, many = 6] = cluster
    for (let index = 0; index < many * 2 && index < 60; index += 1) {
      const r = radius * Math.sqrt(rand())
      const theta = rand() * Math.PI * 2
      tryPit(cx + Math.cos(theta) * r, cy + Math.sin(theta) * r, rand() < 0.4 ? 1 : 0)
    }
  }
  for (let index = 0; index < (stone.scatter ?? 0) * 3; index += 1) tryPit(minX + rand() * (maxX - minX), minY + rand() * (maxY - minY), rand() < 0.2 ? 1 : 0)
  let pitsBig = ''
  let pitsSmall = ''
  for (const [px, py, big] of pitSpots) {
    const length = (0.2 + rand() * (big ? 0.9 : 0.5)) * unit
    const theta = rand() * Math.PI
    const piece = `M${round(px)} ${round(py)}l${round(Math.cos(theta) * length)} ${round(Math.sin(theta) * length)}`
    if (big) pitsBig += piece
    else pitsSmall += piece
  }

  // The outline: dark on the side turned from the light, a rim of light on the side turned to it, the lamp's on the side facing it.
  const darkRuns: number[][] = []
  const rimRuns: number[][] = []
  const lampRuns: number[][] = []
  const kinds: number[] = []
  const lampOn: boolean[] = []
  const n = knots.length
  for (let index = 0; index < n; index += 1) {
    const before = knots[(index + n - 1) % n] ?? pt(0, 0)
    const after = knots[(index + 1) % n] ?? pt(0, 0)
    const tx = after.x - before.x
    const ty = after.y - before.y
    const length = Math.hypot(tx, ty) || 1
    const nx = (ty * turn) / length
    const ny = (-tx * turn) / length
    const f = nx * L.x + ny * L.y
    const low = (knots[index]?.y ?? 0) > maxY - (maxY - minY) * 0.12
    kinds.push(f < -0.55 || (low && f < 0.3) ? 2 : f < -0.08 ? 1 : f > 0.22 ? 3 : 0)
    const lamp = lighting.lamp
    if (lamp) {
      const here = knots[index] ?? pt(0, 0)
      const lx = lamp.at.x - here.x
      const ly = lamp.at.y - here.y
      const distance = Math.hypot(lx, ly) || 1
      lampOn.push(distance < lamp.reach && (nx * lx + ny * ly) / distance > 0.25)
    } else lampOn.push(false)
  }
  const collect = (test: (index: number) => boolean, into: number[][], breakEvery = 0): void => {
    let start = 0
    while (start < n && test(start)) start += 1
    if (start >= n) {
      into.push(Array.from({ length: n }, (_, index) => index))
      return
    }
    let run: number[] = []
    for (let step = 1; step <= n; step += 1) {
      const index = (start + step) % n
      // Now and then the brush lifts on the shaded side too: the line is broken, not a wire.
      const lifted = breakEvery > 0 && hashUnit(index, seed + 5) < breakEvery
      if (test(index) && !lifted) run.push(index)
      else if (run.length) {
        into.push(run)
        run = []
      }
    }
    if (run.length) into.push(run)
  }
  collect(index => kinds[index] === 1 || kinds[index] === 2, darkRuns, 0.12)
  collect(index => kinds[index] === 3, rimRuns, 0.18)
  collect(index => !!lampOn[index], lampRuns)

  // A ridge or a groove: a lens along its line, swelling from nothing at its ends, filled with the fall from light to shade across it.
  const lens = (line: number[], width: number): string => {
    let values = line
    let w = width
    if (line.length % 2 === 1 || (line.length > 2 && line[line.length - 2] === 0)) {
      w = line[line.length - 1] ?? width
      values = line.slice(0, -2)
    }
    const points = pairPoints(values)
    const last = points.length - 1
    if (last < 1) return ''
    const sideA: Point[] = []
    const sideB: Point[] = []
    points.forEach((here, index) => {
      const before = points[Math.max(0, index - 1)] ?? here
      const after = points[Math.min(last, index + 1)] ?? here
      const tx = after.x - before.x
      const ty = after.y - before.y
      const length = Math.hypot(tx, ty) || 1
      const half = (w * unit * Math.pow(Math.sin((Math.PI * index) / last), 0.7)) / 2
      sideA.push(pt(here.x - (ty / length) * half, here.y + (tx / length) * half))
      sideB.unshift(pt(here.x + (ty / length) * half, here.y - (tx / length) * half))
    })
    const tip = sideB[sideB.length - 1]
    const ring = [sideA[0], ...sideA, ...sideB.slice(0, -1), tip, tip].filter((point): point is Point => !!point)
    return `<path d="${chain(ring, true)}"/>`
  }

  const defs =
    `<path id="${id}" fill-rule="evenodd" d="${outline}${cuts}"/>` +
    `<clipPath id="${id}c"><use href="#${id}" clip-rule="evenodd"/></clipPath>` +
    (pitsBig ? `<path id="${id}p" d="${pitsBig}"/>` : '') +
    (pitsSmall ? `<path id="${id}q" d="${pitsSmall}"/>` : '')

  for (const [x = 0, y = 0, rx = 1, ry = 1, angle = 0, strength = 0.5] of stone.lobes ?? []) {
    const reach = Math.max(rx, ry)
    shades.unshift(softAt(x - L.x * reach * 0.5, y - L.y * reach * 0.5, rx * 1.05, ry * 1.05, angle, strength * 0.7))
    lights.push(softAt(x + L.x * reach * 0.3, y + L.y * reach * 0.3, rx * 0.8, ry * 0.8, angle, strength))
  }
  for (const [x = 0, y = 0, rx = 1, ry = 1, angle = 0, strength = 0.5] of stone.darks ?? []) shades.push(softAt(x, y, rx, ry, angle, strength))
  for (const [x = 0, y = 0, rx = 1, ry = 1, angle = 0, strength = 0.5] of stone.lights ?? []) lights.push(softAt(x, y, rx, ry, angle, strength))
  // The warm light of the lamp on whatever part of the stone faces it.
  const warm: Soft[] = []
  if (lighting.lamp && rock.glow) {
    const lamp = lighting.lamp
    const cx = Math.max(minX, Math.min(maxX, lamp.at.x))
    const cy = Math.max(minY, Math.min(maxY, lamp.at.y))
    const distance = Math.hypot(cx - lamp.at.x, cy - lamp.at.y)
    if (distance < lamp.reach && maxY - minY > 20) warm.push(softAt(cx, cy, (maxX - minX) * 0.7, (maxY - minY) * 0.7, 0, rock.glowA * (1 - distance / lamp.reach)))
  }
  const w = (value: number): string => String(round(value * unit * 100) / 100)
  const stroke = (d: string, paint: string, width: number, cover: number): string =>
    d ? `<path d="${d}" stroke="${paint}" stroke-width="${w(width)}" stroke-opacity="${share(cover)}"/>` : ''
  const fill = (d: string, paint: string, cover: number): string => (d ? `<path d="${d}" fill="${paint}" fill-opacity="${share(cover)}"/>` : '')
  const cave = stone.cave ? chain(pairPoints(stone.cave), true) : ''
  const under = stone.under ? chain(pairPoints(stone.under), true) : ''
  const lip = stone.lip ? chain(pairPoints(stone.lip), false) : ''
  let moss = ''
  pairPoints(stone.moss ?? []).forEach((dot, index) => {
    moss += `M${round(dot.x)} ${round(dot.y)}l${round((0.4 + 0.8 * hashUnit(index, seed)) * unit)} ${round((hashUnit(index, seed + 1) - 0.5) * unit)}`
    if (hashUnit(index, seed + 2) > 0.3) moss += `M${round(dot.x + (2.2 + hashUnit(index, seed + 3)) * unit)} ${round(dot.y + (hashUnit(index, seed + 4) - 0.3) * 1.6 * unit)}h.1`
  })
  const ux = L.x * unit
  const uy = L.y * unit

  const markup =
    `<use href="#${id}" fill="${rock.body}"/>` +
    `<g clip-path="url(#${id}c)" fill-rule="evenodd">` +
    (stone.flat ? '' : `<use href="#${id}" fill="url(#tg)"/>`) +
    softly('td', shades) +
    softly('tl', lights) +
    softly('tw', warm) +
    painted('tq', bowlsNear, ' fill-opacity=".62"') +
    painted('tq', bowlsFar, ' fill-opacity=".42"') +
    painted('tr', (stone.ridges ?? []).map(line => lens(line, 2.2)), ' fill-opacity=".7"') +
    painted('tq', (stone.grooves ?? []).map(line => lens(line, 1.6)), ' fill-opacity=".55"') +
    painted('th', walls) +
    fill(cups + cave + under, rock.deep, rock.wallA * 0.85) +
    fill(floors, rock.deep, rock.floorA) +
    stroke(deepLips, rock.deep, 1.4, rock.wallA * 0.7) +
    stroke(lips + lip, rock.lip, 1.1, rock.lipA * 0.55) +
    stroke(lipsFine, rock.lip, 0.7, rock.lipA * 0.45) +
    (pitsBig ? `<use href="#${id}p" x="${round(ux * 0.55)}" y="${round(uy * 0.55)}" stroke="${rock.lip}" stroke-width="${w(1.5)}" stroke-opacity="${share(rock.pitLitA)}"/><use href="#${id}p" stroke="${rock.deep}" stroke-width="${w(1.5)}" stroke-opacity="${share(rock.pitA)}"/>` : '') +
    (pitsSmall ? `<use href="#${id}q" x="${round(ux * 0.4)}" y="${round(uy * 0.4)}" stroke="${rock.lip}" stroke-width="${w(1)}" stroke-opacity="${share(rock.pitLitA * 0.85)}"/><use href="#${id}q" stroke="${rock.deep}" stroke-width="${w(1)}" stroke-opacity="${share(rock.pitA * 0.85)}"/>` : '') +
    stroke(moss, rock.moss, 1.9, 0.8) +
    '</g>' +
    stroke(arcRuns(knots, darkRuns), rock.line, 0.8, rock.lineA) +
    stroke(arcRuns(knots, rimRuns), rock.rim, 0.9, rock.rimA) +
    (rock.glow && lampRuns.length ? stroke(arcRuns(knots, lampRuns), rock.glow, 1.1, 0.8) : '')
  return { defs, markup }
}

// The free-standing peak in the left band (立峰), after the Lingering Garden's 冠云峰 and 晚翠峰: tall and big above, small below
// (上大下小), its head about two and a half times the width of its waist and curling over to the left, toward the gate, past the
// foot; a ragged crown of four unequal swellings with deep notches between, the right one hanging out over a hole at the edge;
// a pocket bitten into the left face of the head; under the curl a deep bay with two hanging knobs; bites in the right side down
// the neck and the body; a short arm low on the left. Twenty-odd holes of very unequal size: the largest through the crown (the
// sky shows in it, a second opening run into it), another double one through the curl, a slot down the neck (漏) and smaller ones
// through the body where the white wall shows; deep blind hollows between. Seated in the planted bed, small stones at its foot.
// In the sheet's units.
const PEAK: Taihu = {
  edge: [
    356, 874, 0, 353, 864, 0, 349, 853, 0, 351, 844, 0, 346, 835, 0, 338, 830, 0, 331, 823, 0, 327, 813, 0, 329, 804, 0, 335, 798, 0, 343, 797, 0,
    348, 800, 1, 351, 790, 0, 355, 779, 0, 358, 768, 0, 357, 757, 0, 352, 750, 0, 355, 742, 1, 350, 736, 0, 343, 737, 0, 337, 733, 1, 331, 727, 0,
    325, 725, 0, 319, 728, 0, 314, 725, 0, 311, 717, 1, 305, 714, 0, 300, 709, 0, 297, 701, 0, 302, 692, 1, 296, 685, 0, 291, 676, 0, 293, 667, 0,
    299, 661, 1, 307, 656, 0, 309, 648, 0, 304, 642, 1, 296, 639, 0, 294, 630, 0, 298, 620, 0, 303, 611, 0, 309, 603, 0, 316, 600, 0, 322, 603, 0,
    325, 611, 1, 330, 602, 0, 336, 596, 0, 344, 594, 0, 351, 597, 0, 354, 604, 0, 356, 614, 1, 361, 608, 0, 367, 605, 0, 374, 607, 0, 377, 613, 0,
    379, 621, 1, 384, 617, 0, 391, 617, 0, 398, 620, 0, 404, 626, 0, 407, 634, 0, 404, 642, 0, 397, 645, 1, 392, 651, 0, 393, 659, 0, 399, 664, 0,
    402, 671, 0, 396, 678, 0, 387, 682, 1, 384, 690, 0, 389, 697, 0, 396, 702, 0, 394, 710, 0, 388, 714, 1, 389, 722, 0, 395, 730, 0, 396, 740, 0,
    389, 746, 1, 394, 755, 0, 401, 764, 0, 405, 777, 0, 402, 787, 0, 391, 792, 1, 393, 800, 0, 404, 809, 0, 409, 820, 0, 410, 832, 0, 402, 842, 1,
    406, 851, 0, 410, 862, 0, 412, 874, 0,
  ],
  holes: [
    [341, 626, 9, 6.5, -12, 1, 9, 4, 4.4],
    [378, 650, 6, 8.5, 12, 0],
    [397, 632, 3.2, 4, 15, 1],
    [316, 694, 7, 5, -25, 1, -6, -6, 3.4],
    [332, 667, 5, 3.8, -20, 0, 7, 5, 3],
    [369, 682, 3.2, 4.2, 0, 1],
    [383, 702, 3, 4, 10, 0],
    [374, 724, 2.2, 6.5, 4, 1],
    [340, 716, 4.4, 3, -15, 0],
    [367, 616, 2, 1.6, -10, 0],
    [382, 758, 2.4, 3.6, 8, 1],
    [363, 766, 3.2, 5.4, -8, 0, 3, 7, 3],
    [392, 766, 1.2, 1.6, 0, 0],
    [388, 772, 1, 1.3, 0, 0],
    [361, 746, 1.6, 2.4, 0, 1],
    [394, 820, 3.6, 5.6, 10, 1],
    [380, 802, 4.4, 3.4, -12, 0],
    [373, 838, 4.4, 3.4, 8, 0],
    [402, 850, 1.9, 2.8, 0, 1],
    [386, 861, 3.4, 2.4, 0, 0],
    [336, 812, 3.2, 2.2, -10, 0],
    [398, 834, 1.4, 2, 0, 0],
    [326, 648, 2, 1.5, 20, 0],
    [352, 700, 1.4, 1.1, 0, 0],
    [356, 705, 1.1, 1.4, 0, 0],
    [349, 706, 1, 1.2, 0, 0],
    [386, 742, 1.2, 1.5, 0, 0],
  ],
  ridges: [
    [397, 645, 390, 652, 380, 662, 370, 668, 362, 682, 0, 3],
    [311, 717, 322, 712, 332, 708, 340, 704, 0, 2.6],
    [348, 800, 358, 802, 368, 798, 378, 792, 0, 2.6],
    [325, 611, 328, 622, 332, 632],
    [356, 614, 354, 624, 351, 634],
    [379, 621, 376, 630, 371, 638],
    [387, 682, 382, 690, 378, 696],
    [388, 714, 382, 718, 380, 730, 384, 742],
    [389, 746, 380, 750, 372, 756, 370, 766],
    [391, 792, 384, 797, 378, 812, 380, 826],
    [402, 842, 394, 846, 388, 852],
    [304, 642, 316, 640, 326, 644],
    [299, 660, 310, 664, 318, 672],
  ],
  grooves: [
    [365, 736, 363, 758, 363, 780, 366, 796],
    [388, 722, 389, 742],
    [383, 830, 382, 848, 384, 866],
    [396, 850, 398, 866],
    [323, 676, 321, 686],
  ],
  lobes: [
    [312, 612, 9, 8, -20, 0.55], [342, 604, 12, 8, -5, 0.6], [367, 612, 8, 6, 0, 0.45], [395, 630, 9, 10, 20, 0.55],
    [300, 670, 6, 12, 0, 0.45], [306, 702, 7, 6, -30, 0.4], [360, 642, 10, 8, 0, 0.35], [384, 672, 7, 8, 0, 0.4],
    [393, 724, 5, 10, 0, 0.45], [362, 712, 7, 8, 0, 0.35], [365, 760, 8, 14, 0, 0.35], [398, 768, 6, 12, 0, 0.45],
    [400, 812, 8, 12, 0, 0.45], [376, 822, 8, 10, 0, 0.35], [403, 852, 6, 10, 0, 0.4], [340, 806, 9, 6, -10, 0.35],
  ],
  darks: [
    [322, 731, 18, 6, -8, 0.6],
    [352, 748, 6, 12, 0, 0.45],
    [295, 666, 4, 22, 0, 0.35],
    [306, 651, 6, 8, 0, 0.5],
    [338, 828, 9, 5, 0, 0.5],
    [382, 871, 32, 6, 0, 0.55],
    [398, 648, 6, 4, 0, 0.45],
    [392, 684, 5, 4, 0, 0.45],
    [390, 746, 4, 4, 0, 0.45],
    [393, 794, 5, 4, 0, 0.45],
    [352, 845, 6, 14, 0, 0.3],
  ],
  pits: [[324, 640, 5, 6], [350, 688, 5, 6], [374, 790, 5, 6], [388, 840, 5, 6], [356, 616, 4, 5], [398, 712, 4, 4]],
  scatter: 6,
  moss: [325, 612, 356, 615, 379, 622, 397, 646, 348, 801, 391, 793, 402, 843, 362, 872, 398, 871],
}

/** Small stones at the peak's foot, in the bed: one to its left behind the banana, one to its right, one low in front. */
const FOOT_STONES: Taihu[] = [
  {
    edge: [334, 878, 0, 332, 869, 0, 336, 861, 0, 343, 856, 0, 351, 854, 1, 356, 859, 0, 359, 867, 0, 358, 878, 0],
    holes: [[345, 868, 2.2, 1.6, 0, 0]],
    lobes: [[346, 864, 9, 6, 0, 0.5]],
    darks: [[346, 877, 14, 3, 0, 0.5]],
  },
  {
    edge: [401, 880, 0, 400, 871, 0, 404, 864, 0, 411, 860, 0, 417, 861, 1, 422, 857, 0, 427, 862, 0, 428, 871, 0, 427, 880, 0],
    holes: [[412, 870, 2.4, 1.8, -10, 0], [421, 866, 1.1, 1.4, 0, 1]],
    lobes: [[414, 866, 10, 6, 0, 0.5], [424, 864, 4, 5, 0, 0.4]],
    darks: [[414, 879, 14, 3, 0, 0.5]],
    moss: [417, 862],
  },
  {
    edge: [367, 882, 0, 368, 875, 0, 373, 870, 0, 379, 869, 1, 385, 873, 0, 387, 882, 0],
    holes: [[378, 876, 1.3, 1, 0, 0]],
    lobes: [[377, 874, 7, 4, 0, 0.5]],
  },
]

/** Where the light comes from for the peak: the sun or moon, high at the right. */
const PEAK_LIGHT = pt(0.8, -0.6)

function leftPeak(stock: Stock): Built {
  const rock = stock.rock
  // By night the lit gate is a warm light on the side of the peak that faces it.
  const lamp = stock.gate ? { at: pt(GATE.x, WALL.ground - GATE.drop), reach: 150 } : undefined
  const peak = taihu('lp', PEAK, rock, { light: PEAK_LIGHT, lamp }, 1, 3)
  const foot = FOOT_STONES.map((stone, index) => taihu(`lf${index}`, stone, rock, { light: PEAK_LIGHT, lamp }, 1, 11 + index))
  // The shade on the bed under the peak and its stones; then the grass in front of them.
  const ground = `<ellipse cx="382" cy="877" rx="48" ry="6" fill="url(#td)" fill-opacity="${share(stock.dark ? 0.6 : 0.4)}"/>`
  const grass = `<path d="${mondo(392, 881, 8, 81)}${mondo(364, 882, 7, 82)}${mondo(420, 882, 6, 83)}" stroke="${stock.walls.tuft}" stroke-width="0.85" stroke-opacity="${share(0.72 * stock.line)}"/>`
  return {
    defs: rockDefs(rock) + peak.defs + foot.map(part => part.defs).join(''),
    markup: ground + peak.markup + foot.map(part => part.markup).join('') + grass,
  }
}

// The rockery under the pavilion (池山), in the pavilion's own units: lake stones piled in rough level courses, not set in a row.
// Behind: the main mass, high at the right with a lower tip at its left and a notch between, its courses marked by worn joints, holes
// through its upper part where the sky shows, blind hollows, and a low dark cave the water has eaten in at its foot; and, at the far
// left behind the steps, a low tip. In front: two lumps at the foot of the plinth (the lower at the left, the cleft between them
// where the grass grows), then flat slabs at the water, each with a lit lip over a dark undercut. Holes are smaller here for the
// size of the mass than in the peak.
const ROCKERY_BACK: Taihu[] = [
  // The lower course of the main mass, down to the water: its own lower tip at the left, a low cave the water has eaten in at its foot.
  {
    edge: [
      1510, 858, 0, 1507, 845, 0, 1510, 831, 0, 1508, 817, 0, 1512, 803, 0, 1516, 790, 0, 1519, 778, 0, 1521, 769, 0, 1525, 760, 0, 1530, 754, 0,
      1534, 757, 1, 1538, 754, 0, 1541, 759, 0, 1543, 767, 1, 1548, 771, 0, 1554, 772, 0, 1562, 776, 0, 1575, 778, 0, 1590, 776, 0, 1604, 779, 0,
      1619, 782, 0, 1619, 858, 0,
    ],
    holes: [
      [1535, 773, 2.4, 1.9, -10, 0], [1525, 792, 1.4, 2, 0, 1], [1561, 800, 3.8, 2.8, -6, 0], [1548, 818, 2.8, 2.1, 0, 0], [1574, 826, 2, 2.6, 0, 0],
      [1591, 806, 3, 2.4, 8, 0], [1531, 806, 1.5, 1.1, 0, 0], [1586, 790, 1.1, 1.4, 0, 0], [1590, 795, 0.9, 1.1, 0, 0], [1519, 822, 1.2, 1.5, 0, 0],
    ],
    cave: [1544, 859, 1546, 853, 1552, 850, 1556, 846, 1561, 847, 1566, 844, 1572, 846, 1576, 851, 1581, 853, 1585, 859],
    ridges: [[1513, 812, 1528, 808, 1545, 811, 1562, 806, 1580, 809, 1600, 805, 0, 2.4], [1524, 836, 1540, 831, 1556, 834, 1574, 838, 0, 2], [1543, 767, 1546, 776, 1550, 784]],
    grooves: [[1532, 838, 1531, 852], [1600, 816, 1601, 834]],
    lobes: [[1530, 766, 7, 7, 0, 0.45], [1545, 798, 12, 8, 0, 0.4], [1594, 824, 10, 10, 0, 0.4], [1528, 826, 9, 9, 0, 0.35]],
    darks: [[1578, 784, 30, 5, 0, 0.55], [1562, 854, 44, 6, 0, 0.6]],
    pits: [[1540, 784, 4, 4], [1586, 838, 5, 5]],
    moss: [1543, 768, 1534, 757],
  },
  // Its upper stone, the main high point: big above and small below, overhanging its seat, its crown broken by notches; holes through
  // its top where the sky shows, one close under the crown's edge.
  {
    edge: [
      1552, 790, 0, 1549, 781, 0, 1546, 771, 0, 1548, 761, 1, 1543, 753, 0, 1546, 743, 0, 1552, 735, 0, 1558, 730, 1, 1561, 724, 0, 1568, 720, 0,
      1575, 721, 0, 1579, 727, 1, 1584, 724, 0, 1590, 726, 0, 1593, 732, 1, 1599, 732, 0, 1605, 739, 0, 1609, 749, 0, 1607, 760, 1, 1612, 772, 0,
      1610, 786, 0, 1600, 790, 0, 1585, 791, 0, 1568, 792, 0,
    ],
    holes: [
      [1567, 738, 4.4, 3, -15, 1, 4, -2, 2], [1554, 761, 2, 3, 8, 1], [1585, 758, 3.4, 4.2, 10, 0], [1597, 744, 1.4, 1.1, 0, 0], [1599, 772, 1.2, 1.5, 0, 0],
      [1572, 779, 2.6, 1.8, 0, 0], [1590, 781, 1, 1.3, 0, 1], [1584, 731, 1.6, 1.2, -10, 1],
    ],
    ridges: [[1579, 727, 1578, 738, 1574, 748], [1548, 761, 1556, 768, 1566, 770], [1607, 760, 1600, 766, 1592, 770], [1558, 730, 1562, 738]],
    lobes: [[1566, 734, 11, 8, 0, 0.5], [1592, 758, 9, 9, 0, 0.4], [1562, 776, 9, 7, 0, 0.4]],
    darks: [[1552, 786, 6, 4, 0, 0.45]],
    pits: [[1556, 748, 4, 5], [1598, 756, 4, 4]],
    moss: [1579, 728, 1548, 762, 1593, 733],
  },
  // At the far left, behind and under the steps: a low mass whose tip rises at the left and leans out, holed.
  {
    edge: [
      1369, 856, 0, 1367, 846, 0, 1366, 835, 0, 1368, 824, 0, 1372, 816, 0, 1377, 812, 1, 1382, 815, 0, 1388, 815, 0, 1393, 819, 1, 1400, 820, 0,
      1412, 823, 0, 1424, 824, 0, 1433, 828, 0, 1437, 840, 0, 1438, 856, 0,
    ],
    holes: [[1376, 828, 2.2, 1.6, 0, 0], [1385, 822, 1, 1.3, 0, 1], [1372, 840, 1, 0.8, 0, 0], [1396, 832, 1.8, 1.3, 0, 0], [1418, 834, 1.4, 1, 0, 1]],
    lobes: [[1380, 823, 7, 6, 0, 0.5], [1410, 836, 14, 6, 0, 0.35]],
    darks: [[1400, 853, 34, 4, 0, 0.55]],
    moss: [1377, 813],
  },
]

const ROCKERY_FRONT: Taihu[] = [
  // The lower lump at the plinth's foot, left of the cleft where the grass grows: a notch in its top, its left end overhanging.
  {
    edge: [
      1429, 853, 0, 1428, 843, 0, 1425, 838, 1, 1428, 833, 0, 1435, 831, 0, 1440, 829, 1, 1444, 825, 0, 1451, 822, 0, 1457, 823, 0, 1460, 828, 1,
      1465, 824, 0, 1471, 824, 0, 1476, 829, 0, 1479, 836, 0, 1478, 853, 0,
    ],
    holes: [[1441, 839, 2.4, 1.8, -10, 0], [1455, 832, 1.4, 1.8, 0, 1], [1468, 840, 2.2, 1.6, 0, 0], [1448, 844, 1, 1.2, 0, 0], [1472, 831, 0.9, 1.1, 0, 0], [1432, 836, 1, 0.8, 0, 0]],
    ridges: [[1460, 828, 1462, 836, 1460, 843], [1440, 829, 1444, 836, 1442, 842]],
    lobes: [[1450, 832, 10, 6, 0, 0.5], [1470, 833, 6, 6, 0, 0.4]],
    darks: [[1430, 844, 5, 6, 0, 0.5]],
    pits: [[1436, 836, 3, 4]],
    moss: [1460, 829, 1440, 830],
  },
  // The higher lump right of the cleft, under the plinth's right-hand column: its top broken by notches, a bay bitten into its right side.
  {
    edge: [
      1477, 853, 0, 1476, 839, 0, 1479, 831, 0, 1482, 822, 0, 1485, 814, 0, 1491, 809, 0, 1497, 812, 1, 1500, 805, 0, 1506, 801, 0, 1512, 802, 0,
      1515, 806, 1, 1520, 806, 0, 1524, 812, 0, 1521, 818, 0, 1515, 821, 1, 1520, 826, 0, 1524, 832, 0, 1526, 841, 0, 1526, 853, 0,
    ],
    holes: [
      [1500, 818, 3, 2.2, -10, 1], [1510, 811, 1.8, 2.4, 0, 0], [1489, 826, 2.2, 2.8, 10, 0], [1508, 833, 2.6, 1.8, 0, 0], [1519, 838, 1.2, 1.6, 0, 1],
      [1495, 838, 1, 1.3, 0, 0], [1484, 841, 1.1, 0.9, 0, 0],
    ],
    ridges: [[1497, 812, 1498, 819, 1494, 826], [1515, 821, 1510, 826, 1504, 827], [1515, 806, 1512, 812]],
    lobes: [[1506, 812, 9, 7, 0, 0.5], [1490, 822, 6, 8, 0, 0.4], [1514, 835, 8, 7, 0, 0.4]],
    darks: [[1517, 823, 5, 4, 0, 0.55]],
    pits: [[1514, 826, 3, 4], [1492, 843, 3, 3]],
    moss: [1497, 813, 1515, 822],
  },
  // The flat stone the steps come down onto: thin, a lit top, a chipped front edge, eaten into here and there, a dark undercut.
  {
    edge: [1371, 854, 0, 1370, 849, 1, 1374, 844, 0, 1381, 841, 0, 1388, 840, 1, 1394, 838, 0, 1405, 837, 0, 1416, 838, 1, 1422, 838, 0, 1430, 840, 0, 1435, 844, 1, 1433, 849, 0, 1436, 854, 0],
    holes: [[1395, 847, 1.4, 1, 0, 0], [1419, 847, 1.1, 0.8, 0, 0], [1381, 846, 0.9, 0.7, 0, 0], [1407, 848, 0.8, 0.6, 0, 0]],
    lip: [1373, 845, 1386, 842.5, 1400, 843, 1414, 842, 1433, 845],
    under: [1370, 851, 1380, 850, 1388, 851, 1398, 849.5, 1408, 851, 1418, 850, 1428, 851, 1437, 850, 1437, 855, 1370, 855],
    lights: [[1403, 840, 27, 2.5, 0, 0.6]],
    grooves: [[1386, 844, 1385, 849], [1412, 844, 1413, 849], [1426, 844, 1427, 849]],
    flat: true,
  },
  // The long flat stone along the water in front of the two lumps.
  {
    edge: [1438, 856, 0, 1437, 851, 0, 1440, 847, 1, 1448, 844, 0, 1460, 843, 1, 1466, 841, 0, 1480, 842, 0, 1494, 841, 1, 1500, 840, 0, 1514, 840, 0, 1524, 839, 1, 1533, 841, 0, 1539, 845, 1, 1541, 850, 0, 1542, 856, 0],
    holes: [[1462, 851, 1.5, 1, 0, 0], [1500, 850, 1.2, 0.9, 0, 0], [1525, 850, 1.7, 1.1, 0, 0], [1482, 849, 0.9, 0.7, 0, 0], [1449, 850, 0.9, 0.7, 0, 0]],
    lip: [1440, 848, 1456, 846, 1472, 846.5, 1488, 845, 1504, 845.5, 1520, 844, 1539, 846],
    under: [1437, 853, 1450, 852, 1462, 853, 1476, 852, 1490, 853, 1504, 851.5, 1514, 852.5, 1530, 851.5, 1543, 852.5, 1543, 857, 1436, 857],
    lights: [[1490, 843, 44, 2.5, 0, 0.6]],
    grooves: [[1468, 848, 1467, 852], [1494, 848, 1495, 852], [1514, 847, 1513, 851], [1534, 848, 1535, 852]],
    moss: [1466, 842],
    flat: true,
  },
]

/** Where the pavilion's light comes from, by night; and the light of the sun or moon on the rockery, high and a little to the right. */
const PAVILION_LIGHT = pt(1462, 727)
const ROCKERY_LIGHT = pt(0.5, -0.87)

function rockery(stock: Stock, stones: Taihu[], prefix: string): Built {
  const lamp = stock.paint.lamp ? { at: PAVILION_LIGHT, reach: 150 } : undefined
  const built = stones.map((stone, index) => taihu(`${prefix}${index}`, stone, stock.rock, { light: ROCKERY_LIGHT, lamp }, 1 / NEAR.k, 31 + index * 7))
  return { defs: built.map(part => part.defs).join(''), markup: built.map(part => part.markup).join('') }
}

/** A tuft of garden grass in a cleft of the stones: a fan of thin bending blades. */
function tuft(stock: Stock, x: number, y: number, size: number, seed: number): string {
  let d = ''
  for (let blade = 0; blade < 7; blade += 1) {
    const angle = ((-158 + blade * 23 + (hashUnit(blade, seed) - 0.5) * 12) * Math.PI) / 180
    const reach = size * (0.7 + 0.5 * hashUnit(blade, seed + 1))
    const tipX = x + Math.cos(angle) * reach * 1.25
    const tipY = y + Math.sin(angle) * reach * 0.75 + reach * 0.12
    d += `M${round(x + (blade - 3) * 0.7)} ${round(y)}Q${round(x + Math.cos(angle) * reach * 0.5)} ${round(y + Math.sin(angle) * reach * 1.05)} ${round(tipX)} ${round(tipY)}`
  }
  return strokeWith(d, stock.paint.grass, 0.8, 0.8)
}

// ---------------------------------------------------------------------------------------------------------------------
// The pavilion, built as a small model and drawn in elevation from a little above (the raised eye of a ruled-line painting).

function pavilion(stock: Stock, cx: number, cy: number, size: number): Built {
  const SIDES = 6
  const step = (Math.PI * 2) / SIDES
  const half = step / 2
  const yaw = (-8 * Math.PI) / 180
  const pitch = (9 * Math.PI) / 180
  const cosP = Math.cos(pitch)
  const sinP = Math.sin(pitch)
  // All lengths in the model's own units; `size` scales them to the sheet. Heights are measured from the eave line.
  const EAVE = 100 // the eave corners' distance from the axis
  const FLARE = 0.07 // how far the corners push out beyond the straight eave
  const RISE = 86 // apex above the eave line
  const LIFT = 33 // corner above the eave line
  const LIFT_POWER = 4
  // The eave runs nearly level along the middle of a face and only rises in its outer third, sweeping up into the corner.
  const SAG_POWER = 4.6
  const HOLLOW = 1.55 // the roof's concave fall
  const TIP = 1.09 // the corner rib runs on past the roof into its upturned point
  const COLUMN = 62
  const PLINTH = 74
  const LINTEL = -4
  const FLOOR = -104
  const GROUND = -132
  const SEAT = FLOOR + 15
  const RAIL = SEAT + 13.5
  const LEAN = 7.5
  const ENTRY = 2 // the face that is left open, toward the bridge
  const apothem = EAVE * Math.cos(half)
  const sideHalf = EAVE * Math.sin(half)
  const columnApothem = COLUMN * Math.cos(half)
  const columnSideHalf = COLUMN * Math.sin(half)
  const plinthApothem = PLINTH * Math.cos(half)
  const tanHalf = Math.tan(half)

  const proj = (x: number, y: number, z: number): Point => pt(cx + size * x, cy - size * (y * cosP - z * sinP))
  const cornerAngle = (k: number): number => yaw + k * step
  const normalAngle = (k: number): number => cornerAngle(k) + half
  const polar = (angle: number, radius: number, y: number): Point => proj(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
  /** A point on face k: `a` along the face (toward corner k + 1), `b` out from the axis, at height y. */
  const onFace = (k: number, a: number, b: number, y: number): Point => {
    const n = normalAngle(k)
    return proj(Math.cos(n) * b - Math.sin(n) * a, y, Math.sin(n) * b + Math.cos(n) * a)
  }
  const isFront = (k: number): boolean => Math.sin(normalAngle(k)) > 0
  const hasBench = (k: number): boolean => ((k % SIDES) + SIDES) % SIDES !== ENTRY
  /** How much a face is turned from the light, 0..1: the light comes from the right, where the disc hangs. */
  const shade = (k: number): number => (1 - Math.cos(normalAngle(k) - (35 * Math.PI) / 180)) / 2

  /** The roof's surface over face k. `drop` lowers the point: the eave's own thickness. */
  const roofAt = (k: number, a: number, b: number, drop = 0): Point => {
    const v = b / apothem
    const reach = b * tanHalf
    const u = reach > 0.001 ? Math.max(-1, Math.min(1, a / reach)) : 0
    const side = Math.abs(u)
    const flare = 1 + FLARE * Math.pow(side, 3) * Math.pow(v, 3)
    const y = RISE * Math.pow(Math.max(0, 1 - v), HOLLOW) + LIFT * Math.pow(side, SAG_POWER) * Math.pow(v, LIFT_POWER) - drop
    const n = normalAngle(k)
    return proj((Math.cos(n) * b - Math.sin(n) * a) * flare, y, (Math.sin(n) * b + Math.cos(n) * a) * flare)
  }
  /** The corner rib at corner k: down from the apex, hollow, then sweeping up into the flying corner. */
  const hipAt = (k: number, v: number): Point =>
    polar(cornerAngle(k), EAVE * v * (1 + FLARE * Math.pow(v, 3)), RISE * Math.pow(Math.max(0, 1 - v), HOLLOW) + LIFT * Math.pow(v, LIFT_POWER))

  const eaveOf = (k: number, drop = 0): Point[] => {
    const points: Point[] = []
    for (let index = 0; index <= 14; index += 1) points.push(roofAt(k, (-1 + index / 7) * sideHalf, apothem, drop))
    return points
  }
  const faceOf = (k: number): string => {
    const points: Point[] = []
    for (let index = 0; index <= 9; index += 1) points.push(hipAt(k, index / 9))
    points.push(...eaveOf(k).slice(1, 14))
    for (let index = 9; index >= 0; index -= 1) points.push(hipAt(k + 1, index / 9))
    return polyline(points, true)
  }
  /** The tile rows of face k: they run down the fall of the roof, and the corner ribs cut them off. `shift` moves every row
   * along the face by that share of the spacing: the dark channel beside each pale crown. */
  const tileRows = (k: number, shift = 0): string => {
    const seen = Math.max(0.2, Math.abs(Math.sin(normalAngle(k))))
    const spacing = Math.max(5.6, 3.1 / seen / size)
    const count = Math.floor((sideHalf * 2) / spacing)
    let d = ''
    for (let row = 0; row < count; row += 1) {
      const a = (row + 0.5 + shift - count / 2) * spacing
      const from = Math.abs(a) / tanHalf + 6
      const to = apothem * 0.955
      if (to - from < 9) continue
      const points: Point[] = []
      for (let part = 0; part <= 4; part += 1) points.push(roofAt(k, a, from + ((to - from) * part) / 4))
      d += smoothPath(points)
    }
    return d
  }
  const hipRidge = (k: number): string => {
    const points: Point[] = []
    for (let index = 0; index <= 18; index += 1) points.push(hipAt(k, 0.05 + (TIP - 0.05) * Math.pow(index / 18, 0.8)))
    return taper(points, along => {
      const v = 0.05 + (TIP - 0.05) * Math.pow(along, 0.8)
      // Even along the roof; past the eave it thins into the upswept horn, but keeps a blade's width to its tip.
      return size * (v < 0.86 ? 3 - 0.5 * v : 1.15 + (1.42 * (TIP - v)) / (TIP - 0.86))
    })
  }

  const faces = [0, 1, 2, 3, 4, 5]
  const frontFaces = faces.filter(k => isFront(k))
  const backFaces = faces.filter(k => !isFront(k))
  let defs = ''
  let out = ''
  const p = stock.paint
  const lamp = p?.lamp
  // The middle of the light, by night: on the axis, a little under the lintel.
  const lampAt = proj(0, -32, 0)

  if (p && lamp) {
    // The glow inside the pavilion, whole in its middle and gone a little beyond the columns: what the eye takes for the light
    // itself, seen through the open sides. Then the same light as it falls on things next to it (`ps`), for the floor, the sill
    // walls and the undersides of the eaves.
    defs +=
      `<radialGradient id="pg" gradientUnits="userSpaceOnUse" cx="${round(lampAt.x)}" cy="${round(lampAt.y)}" r="${round(78 * size)}" gradientTransform="translate(0 ${round(lampAt.y * 0.24)}) scale(1 0.76)">` +
      lamp.stops.map(([offset, colour, cover]) => `<stop offset="${offset}" stop-color="${colour}" stop-opacity="${cover}"/>`).join('') +
      '</radialGradient>' +
      `<radialGradient id="ps" gradientUnits="userSpaceOnUse" cx="${round(lampAt.x)}" cy="${round(lampAt.y)}" r="${round(118 * size)}">` +
      lamp.spillStops.map(([offset, cover]) => `<stop offset="${offset}" stop-color="${lamp.spill}" stop-opacity="${cover}"/>`).join('') +
      '</radialGradient>'
    // Laid only over the room itself, between the outer columns from the lintel to the floor (as the model fills the shape of
    // its opening), so none of it lies on the air beside the pavilion; the columns stand on its edges.
    const room = [3, 4, 5, 0].map(k => polar(cornerAngle(k), COLUMN, LINTEL)).concat([0, 1, 2, 3].map(k => polar(cornerAngle(k), COLUMN, FLOOR)))
    out += fillWith(polyline(room, true), 'url(#pg)', 1, ' class="flk"')
  }

  // The floor, and the far benches seen through the pavilion.
  const floor = polyline(faces.map(k => polar(cornerAngle(k), PLINTH, FLOOR)), true)
  out += p ? fillWith(floor, mixed(p.plinth, p.cool, 0.16), 1) + (lamp ? fillWith(floor, 'url(#ps)', 1) : '') : washed(floor, stock, 0.09)
  const railEnd = (k: number, end: number): Point => onFace(k, end * (columnSideHalf + (hasBench(k + end) ? LEAN * tanHalf : 0)), columnApothem + LEAN, RAIL)
  let far = ''
  for (const k of backFaces) {
    if (!hasBench(k)) continue
    far += polyline([onFace(k, -columnSideHalf, columnApothem, RAIL), onFace(k, columnSideHalf, columnApothem, RAIL)]) + polyline([onFace(k, -columnSideHalf, columnApothem, SEAT), onFace(k, columnSideHalf, columnApothem, SEAT)])
  }
  out += p ? strokeWith(far, lamp ? p.rail : p.wood, 0.9, lamp ? 0.62 : 0.5) : drawn(far, stock, 0.9, 0.3)

  const column = (k: number): string => {
    const angle = cornerAngle(k)
    const isFar = Math.sin(angle) < -0.3
    const foot = polar(angle, COLUMN, FLOOR)
    const head = polar(angle, COLUMN, LINTEL)
    const halfWidth = size * (isFar ? 1.8 : 2.4)
    const shaft = `M${round(foot.x - halfWidth)} ${round(foot.y)}L${round(head.x - halfWidth)} ${round(head.y)}L${round(head.x + halfWidth)} ${round(head.y)}L${round(foot.x + halfWidth)} ${round(foot.y)}Z`
    const base = `M${round(foot.x - halfWidth - 1.6)} ${round(foot.y + 1)}h${round(halfWidth * 2 + 3.2)}v${round(-3.2 * size)}h${round(-halfWidth * 2 - 3.2)}Z`
    if (!p) return inked(shaft, stock, isFar ? 0.42 : 0.84) + inked(base, stock, isFar ? 0.36 : 0.7)
    // Far columns are seen from inside: by night their faces toward us are the ones the light falls on.
    return fillWith(shaft, isFar ? p.woodFar : p.wood, isFar ? p.woodFarAlpha : 0.96) + fillWith(base, isFar ? p.woodFar : mixed(p.plinth, p.cool, 0.4), isFar ? p.woodFarAlpha * 0.8 : 1)
  }
  const byDepth = faces.slice().sort((a, b) => Math.sin(cornerAngle(a)) - Math.sin(cornerAngle(b)))
  for (const k of byDepth) if (Math.sin(cornerAngle(k)) < -0.3) out += column(k)

  // The low whitewashed sill wall under the bench, on the two faces that look over the water.
  const benchFaces = frontFaces.filter(k => hasBench(k))
  let panels = ''
  for (const k of benchFaces) {
    panels += polyline([onFace(k, -columnSideHalf, columnApothem, FLOOR), onFace(k, columnSideHalf, columnApothem, FLOOR), onFace(k, columnSideHalf, columnApothem, SEAT), onFace(k, -columnSideHalf, columnApothem, SEAT)], true)
  }
  out += p
    ? fillWith(panels, p.plaster, 1) + (lamp ? fillWith(panels, 'url(#ps)', 1) : '') + strokeWith(panels, lamp ? stock.ink : p.wood, 0.8, lamp ? 0.4 : 0.55)
    : skyPainted(panels, stock.sky) + `<path d="${panels}" fill="${stock.wall}" fill-opacity="${stock.wallAlpha}"/>` + drawn(panels, stock, 0.8, 0.5)
  for (const k of byDepth) if (Math.sin(cornerAngle(k)) >= -0.3) out += column(k)

  // The stone plinth: three faces toward us, the darker the more they turn from the light. Its foot goes down among the rocks.
  let plinthLines = ''
  let masonry = ''
  for (const k of frontFaces) {
    const a = polar(cornerAngle(k), PLINTH, FLOOR)
    const b = polar(cornerAngle(k + 1), PLINTH, FLOOR)
    const c = polar(cornerAngle(k + 1), PLINTH, GROUND)
    const d = polar(cornerAngle(k), PLINTH, GROUND)
    // The face turned to the sun is as white as the plaster; the others take the cool shade as they turn away.
    out += p ? fillWith(polyline([a, b, c, d], true), shade(k) > 0.3 ? mixed(p.plinth, p.cool, Math.min(1, p.coolAlpha * 1.2 * shade(k))) : p.plinth, 1) : washed(polyline([a, b, c, d], true), stock, 0.1 + 0.16 * shade(k))
    plinthLines += polyline([d, a, b, c]) + polyline([polar(cornerAngle(k), PLINTH, FLOOR - 4.5), polar(cornerAngle(k + 1), PLINTH, FLOOR - 4.5)])
    const course = FLOOR - 15
    const side = PLINTH * Math.sin(half)
    masonry += polyline([onFace(k, -side, plinthApothem, course), onFace(k, side, plinthApothem, course)])
    for (const at of [0.22 + 0.12 * hashUnit(k, 91), 0.62 + 0.12 * hashUnit(k, 93)]) masonry += polyline([onFace(k, side * (2 * at - 1), plinthApothem, FLOOR - 4.5), onFace(k, side * (2 * at - 1), plinthApothem, course)])
    const low = side * (0.7 * hashUnit(k, 95) - 0.35)
    masonry += polyline([onFace(k, low, plinthApothem, course), onFace(k, low, plinthApothem, GROUND)])
  }
  out += p ? strokeWith(plinthLines, stock.ink, 0.9, 0.62 * stock.line) + strokeWith(masonry, p.lamp ? stock.ink : p.cool, 0.6, p.lamp ? 0.22 : 0.42) : drawn(plinthLines, stock, 0.9, 0.68) + drawn(masonry, stock, 0.6, 0.34)
  // Three stone steps down from the open face to the slab the bridge lands on, as wide as the opening: the risers washed,
  // each nosing drawn as a firm line, and the stepped cheek on the near side.
  {
    const q = plinthApothem
    const half = 21
    const levels = [FLOOR, FLOOR - 9.3, FLOOR - 18.6, GROUND]
    let risers = ''
    let nosings = ''
    const profile: Point[] = []
    for (let index = 1; index <= 2; index += 1) {
      const b = q + 10 * index
      const from = levels[index] ?? 0
      const to = levels[index + 1] ?? 0
      risers += polyline([onFace(ENTRY, -half, b, from), onFace(ENTRY, half, b, from), onFace(ENTRY, half, b, to), onFace(ENTRY, -half, b, to)], true)
      nosings += polyline([onFace(ENTRY, -half, b, from), onFace(ENTRY, half, b, from)]) + polyline([onFace(ENTRY, half, b - 10, from), onFace(ENTRY, half, b, from), onFace(ENTRY, half, b, to)])
      profile.push(onFace(ENTRY, -half, b - 10, from), onFace(ENTRY, -half, b, from))
    }
    profile.push(onFace(ENTRY, -half, q + 20, GROUND), onFace(ENTRY, -half, q, GROUND))
    nosings += polyline([onFace(ENTRY, -half, q, levels[1] ?? 0), onFace(ENTRY, half, q, levels[1] ?? 0)])
    const cheek = polyline(profile, true)
    const centre = onFace(ENTRY, 0, q + 14, levels[2] ?? 0)
    out += p
      ? fillWith(risers, mixed(p.plinth, p.cool, p.coolAlpha * 0.5), 1) + fillWith(cheek, mixed(p.plinth, p.cool, p.coolAlpha * 0.9), 1) + strokeWith(cheek, stock.ink, 0.7, 0.45 * stock.line) + strokeWith(nosings, stock.ink, 1.1, 0.58 * stock.line)
      : blank(risers + cheek, skyAt(stock.sky, centre.x, centre.y)) + washed(risers, stock, 0.08) + washed(cheek, stock, 0.26) + drawn(cheek, stock, 0.7, 0.5) + drawn(nosings, stock, 1.1, 0.62)
  }

  // The bench: its seat, the goose-neck slats of the back leaning out over the water, the rail along their heads.
  let slats = ''
  let rails = ''
  let seats = ''
  for (const k of benchFaces) {
    const inner = columnSideHalf - 3.4
    for (let index = 0; index <= 11; index += 1) {
      const a = -inner + (inner * 2 * index) / 11
      slats += `M${at(onFace(k, a, columnApothem + 1.5, SEAT))}Q${at(onFace(k, a, columnApothem + 10, SEAT + 5))} ${at(onFace(k, a, columnApothem + LEAN, RAIL))}`
    }
    rails += polyline([railEnd(k, -1), railEnd(k, 1)])
    for (const end of [-1, 1]) {
      if (hasBench(k + end)) continue
      rails += `M${at(onFace(k, end * columnSideHalf, columnApothem + 1.5, SEAT))}Q${at(onFace(k, end * columnSideHalf, columnApothem + 10, SEAT + 5))} ${at(railEnd(k, end))}`
    }
    seats += polyline([onFace(k, -columnSideHalf, columnApothem + 1.5, SEAT), onFace(k, columnSideHalf, columnApothem + 1.5, SEAT)])
  }
  // By night the slats stand dark against the light inside and their rail catches it.
  out += p
    ? strokeWith(seats, lamp ? p.rail : p.wood, round(2.2 * size), lamp ? 0.6 : 0.9) + strokeWith(slats, p.wood, 0.8, 0.86) + strokeWith(rails, p.rail, 1.5, lamp ? 0.82 : 0.95)
    : drawn(seats, stock, round(2.2 * size), 0.74) + drawn(slats, stock, 0.8, 0.68) + drawn(rails, stock, 1.5, 0.88)

  // The lintel from column to column, and the fretwork that hangs under it.
  let fret = ''
  let beams = ''
  for (const k of frontFaces) {
    const span = columnSideHalf * 2 - 5.2
    const a0 = -span / 2
    const top = LINTEL - 5
    const depth = 11
    const drop = 6.5
    const foot = 8
    const on = (a: number, y: number): Point => onFace(k, a, columnApothem, y)
    beams += polyline([on(-columnSideHalf, top), on(columnSideHalf, top), on(columnSideHalf, LINTEL + 4), on(-columnSideHalf, LINTEL + 4)], true)
    fret += polyline([on(a0, top), on(a0 + span, top)])
    fret += polyline([on(a0, top - depth - drop), on(a0 + foot, top - depth - drop), on(a0 + foot, top - depth), on(a0 + span - foot, top - depth), on(a0 + span - foot, top - depth - drop), on(a0 + span, top - depth - drop)])
    const cells = 8
    const cell = span / cells
    for (let index = 1; index < cells; index += 1) {
      const a = a0 + index * cell
      const hangs = index % 2 === 1
      const y0 = hangs ? top : top - depth
      const y1 = hangs ? top - depth * 0.62 : top - depth * 0.38
      fret += polyline([on(a, y0), on(a, y1), on(a + cell * 0.5 * (hangs ? 1 : -1), y1)])
    }
  }
  out += p ? fillWith(beams, p.wood, 0.92) + strokeWith(fret, p.wood, 0.8, 0.9) : washed(beams, stock, 0.36) + drawn(fret, stock, 0.75, 0.72)

  // Under the roof: shade by day; by night the light, brightest up under the roof.
  {
    const left = polar(cornerAngle(3), COLUMN, 0).x
    const right = polar(cornerAngle(0), COLUMN, 0).x
    const top = cy - 2 * size
    const bottom = cy + 40 * size
    const tone = p ? (lamp ? lamp.spill : p.cool) : stock.ink
    const strength = p ? (lamp ? 0.62 : p.coolAlpha) : 0.3 * stock.wash
    defs +=
      `<linearGradient id="pu" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(bottom)}">` +
      `<stop offset="0" stop-color="${tone}" stop-opacity="${share(strength)}"/><stop offset="0.5" stop-color="${tone}" stop-opacity="${share(strength * 0.4)}"/>` +
      `<stop offset="1" stop-color="${tone}" stop-opacity="0"/></linearGradient>`
    out += `<path d="M${round(left)} ${round(top)}H${round(right)}V${round(bottom)}H${round(left)}Z" fill="url(#pu)"/>`
  }
  // The underside of the eaves, where a lifted corner lets the eye in under the roof: dark wood in shade by day, lit from
  // below by night.
  let soffits = ''
  for (const k of frontFaces) soffits += polyline(eaveOf(k, 2).concat([polar(cornerAngle(k + 1), COLUMN, LINTEL + 2), polar(cornerAngle(k), COLUMN, LINTEL + 2)]), true)
  out += p ? fillWith(soffits, p.soffit, p.soffitAlpha) + (lamp ? fillWith(soffits, 'url(#ps)', 1) : '') : washed(soffits, stock, 0.5)

  // The roof. The far faces first: only their flying corners show above the near ones.
  const backRoof = backFaces.map(k => faceOf(k)).join('')
  out += p
    ? fillWith(backRoof, p.tile, 0.96) + strokeWith(backFaces.map(k => polyline(eaveOf(k))).join(''), lamp ? lamp.spill : p.tile, 0.8, lamp ? 0.4 : 0.9)
    : washed(backRoof, stock, 0.26) + drawn(backFaces.map(k => polyline(eaveOf(k))).join(''), stock, 0.8, 0.5)
  // By night the hips are as dark as the model's coping, and only a fine warm line along each crest catches the light.
  let crests = ''
  const ridgePaint = (strength: number, d: string, k: number): string => {
    if (lamp) {
      const line: Point[] = []
      for (let index = 0; index <= 12; index += 1) line.push(hipAt(k, 0.06 + (TIP - 0.1) * Math.pow(index / 12, 0.8)))
      crests += smoothPath(line)
    }
    return p ? fillWith(d, p.tile, 1) : inked(d, stock, strength)
  }
  for (const k of faces) if (!isFront(k) && !isFront(k - 1)) out += ridgePaint(0.74, hipRidge(k), k)
  if (p) {
    // Opaque tile: each face a little lighter the more it turns to the sky; the pale crown of every row of cover tiles and the
    // dark channel beside it; the lowest course; the fascia; the drip tiles under the eave (by night their ends catch the light);
    // the eave's edge.
    for (const k of frontFaces) {
      const course: Point[] = []
      for (let index = 0; index <= 12; index += 1) course.push(roofAt(k, (-1 + index / 6) * sideHalf * 0.93, apothem * 0.93))
      out +=
        fillWith(faceOf(k), mixed(p.tile, p.lime, p.tileLight * Math.pow(1 - shade(k), 2)), 1) +
        strokeWith(tileRows(k, 0.42), p.groove, 0.8, p.grooveAlpha) +
        strokeWith(tileRows(k), p.lime, 0.7, p.rib) +
        strokeWith(smoothPath(course), p.lime, 0.7, p.rib * 0.8) +
        fillWith(polyline(eaveOf(k).concat(eaveOf(k, 3.6).reverse()), true), p.tile, 1) +
        strokeWith(polyline(eaveOf(k, 2)), p.tile, round(2.6 * size), 0.85, ' stroke-linecap="butt" stroke-dasharray="1.5 1.9"') +
        strokeWith(polyline(eaveOf(k)), lamp ? lamp.spill : p.tile, 0.9, lamp ? 0.55 : 1)
    }
  } else {
    defs += frontFaces.map(k => `<path id="f${k}" d="${faceOf(k)}"/>`).join('') + `<g id="rf">${frontFaces.map(k => `<use href="#f${k}"/>`).join('')}</g>`
    {
      const top = proj(0, RISE, 0).y
      defs +=
        `<linearGradient id="rg" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(cy + 12 * size)}">` +
        `<stop offset="0.15" stop-color="${stock.ink}" stop-opacity="0"/><stop offset="1" stop-color="${stock.ink}" stop-opacity="${share(0.2 * stock.wash)}"/></linearGradient>`
    }
    out += skyPaintedShape('rf', stock.sky) + '<use href="#rf" fill="url(#rg)"/>'
    for (const k of frontFaces) {
      const course: Point[] = []
      for (let index = 0; index <= 12; index += 1) course.push(roofAt(k, (-1 + index / 6) * sideHalf * 0.93, apothem * 0.93))
      out +=
        `<use href="#f${k}" fill="${stock.ink}" fill-opacity="${share((0.15 + 0.22 * shade(k)) * stock.wash)}"/>` +
        drawn(tileRows(k), stock, 0.6, 0.46) +
        drawn(smoothPath(course), stock, 0.7, 0.4) +
        washed(polyline(eaveOf(k).concat(eaveOf(k, 3.6).reverse()), true), stock, 0.4) +
        // The drip tiles: a row of small ends under the eave's edge.
        drawn(polyline(eaveOf(k, 2)), stock, round(2.6 * size), 0.62, ' stroke-linecap="butt" stroke-dasharray="1.5 1.9"') +
        drawn(polyline(eaveOf(k)), stock, 0.9, 0.72)
    }
  }
  for (const k of faces) if (isFront(k) || isFront(k - 1)) out += ridgePaint(0.86, hipRidge(k), k)
  out += strokeWith(crests, stock.ink, 0.6, 0.5)

  // The finial: a collar and a gourd with a point.
  {
    const apex = proj(0, RISE, 0)
    const profile: Array<[number, number]> = [[7.5, -4], [6.4, 2], [4.2, 5], [3.5, 7.2], [6.2, 11], [6.8, 15], [5.2, 19.5], [2.6, 21.6], [4.1, 24.6], [4.2, 27.6], [2.4, 30.6], [0.9, 33], [0.5, 40], [0, 44]]
    const right = profile.map(([r, h]) => pt(apex.x + r * size, apex.y - h * size))
    const left = profile.slice(0, -1).reverse().map(([r, h]) => pt(apex.x - r * size, apex.y - h * size))
    out += p
      ? fillWith(polyline(right.concat(left), true), p.tile, 1, lamp ? ` stroke="${stock.ink}" stroke-width="0.6" stroke-opacity="0.45"` : '')
      : inked(polyline(right.concat(left), true), stock, 0.88)
  }
  return { defs, markup: out }
}

// ---------------------------------------------------------------------------------------------------------------------
// The willow: two boughs come in at the top right corner, and their strands hang, each one swaying from where it leaves the bough.
// Each strand (its thread and its leaves) is one filled path that sways as a whole.

function willow(stock: Stock): { boughs: string; farStrands: string; nearStrands: string } {
  const boughA = spline([pt(1648, 66), pt(1606, 60), pt(1564, 68), pt(1528, 84), pt(1500, 106), pt(1484, 132)], 8)
  const boughB = spline([pt(1648, 10), pt(1612, 24), pt(1580, 32), pt(1554, 46), pt(1538, 62)], 8)
  const p = stock.paint
  const boughs =
    fillWith(taper(boughA, along => 5.6 - 4.4 * Math.pow(along, 0.8)), p.bough, p.boughAlpha) + fillWith(taper(boughB, along => 3.6 - 2.8 * along), p.bough, p.boughAlpha * 0.82)
  const pick = (bough: Point[], along: number): Point => bough[Math.round(along * (bough.length - 1))] ?? pt(0, 0)
  interface Strand {
    start: Point
    length: number
    near: boolean
  }
  const strands: Strand[] = []
  const onA: Array<[number, number]> = [[0.12, 206], [0.3, 286], [0.46, 214], [0.62, 266], [0.78, 196], [0.92, 236], [1, 150]]
  onA.forEach(([along, length], index) => strands.push({ start: pick(boughA, along), length, near: index % 2 === 1 }))
  const onB: Array<[number, number]> = [[0.36, 160], [0.68, 232], [1, 196]]
  onB.forEach(([along, length], index) => strands.push({ start: pick(boughB, along), length, near: index % 2 === 0 }))
  let farStrands = ''
  let nearStrands = ''
  strands.forEach((strand, index) => {
    const seed = 300 + index * 7
    const lean = -0.02 - 0.07 * hashUnit(seed, 1)
    const wave = 3 + 5 * hashUnit(seed, 3)
    const phase = hashUnit(seed, 5) * 6.28
    const reachOut = 8 + 12 * hashUnit(seed, 17)
    const along = (s: number): Point =>
      pt(
        strand.start.x - reachOut * (1 - Math.pow(1 - s, 6)) + strand.length * lean * Math.pow(s, 1.4) + wave * Math.sin(s * 3.6 + phase) * s,
        strand.start.y + strand.length * Math.pow(s, 1.16),
      )
    const stem: Point[] = []
    for (let part = 0; part <= 10; part += 1) stem.push(along(Math.pow(part / 10, 1.3)))
    // The thread itself: a hair-thin band, so that thread and leaves are one shape.
    const thread = ribbon(stem, stem.map((_, at) => 0.95 - 0.5 * (at / 10)))
    let leaves = ''
    let s = 20 / strand.length
    let count = 0
    let pen = pt(0, 0)
    while (s < 0.985) {
      const here = along(s)
      const next = along(Math.min(1, s + 0.02))
      const heading = Math.atan2(next.y - here.y, next.x - here.x)
      const side = hashUnit(count, seed + 19) > 0.5 ? 1 : -1
      const angle = heading + side * (0.12 + 0.15 * hashUnit(count, seed + 7))
      const reach = (7.5 + 5 * hashUnit(count, seed + 9)) * (1 - 0.3 * s)
      const dx = round(Math.cos(angle) * reach)
      const dy = round(Math.sin(angle) * reach)
      const half = reach * 0.15
      const nx = -Math.sin(angle) * half
      const ny = Math.cos(angle) * half
      const wx = round(0.4 * dx + nx)
      const wy = round(0.4 * dy + ny)
      const vx = round(0.4 * dx - nx)
      const vy = round(0.4 * dy - ny)
      leaves += count === 0 ? `M${at(here)}` : `m${round(here.x - pen.x)} ${round(here.y - pen.y)}`
      leaves += `l${wx} ${wy}l${round(dx - wx)} ${round(dy - wy)}l${round(vx - dx)} ${round(vy - dy)}z`
      pen = count === 0 ? pt(round(here.x), round(here.y)) : pt(pen.x + round(here.x - pen.x), pen.y + round(here.y - pen.y))
      s += (5.5 + 9 * hashUnit(count, seed + 11)) / strand.length
      count += 1
    }
    const swing = round(0.7 + 0.8 * hashUnit(seed, 13))
    // One breeze crosses the tree from the right, so the strands answer one after another.
    const delay = round(((1648 - strand.start.x) / 170) * 5 + hashUnit(seed, 15) * 1.6)
    const green = strand.near ? p.willowNear : p.willowFar
    const cover = (strand.near ? 1 : 0.8) * p.willowAlpha
    const markup =
      `<path class="sway" style="transform-origin:${round(strand.start.x)}px ${round(strand.start.y)}px;--a:${swing}deg;animation-delay:-${delay}s" ` +
      `d="${thread}${leaves}" fill="${green}" fill-opacity="${share(cover)}"/>`
    if (strand.near) nearStrands += markup
    else farStrands += markup
  })
  return { boughs, farStrands, nearStrands }
}


// ---------------------------------------------------------------------------------------------------------------
// The wall with the round gate (from Moon Gate). Seen square on: plaster, its coping of dark tiles, the gate cut through it
// and trimmed with grey brick. Its plaster is opaque and whole; its free end on the right stands behind the peak.

interface Wall {
  from: number
  to: number
  /** The level of the eave (the lower edge of the tiles) and of the ground the wall stands on. */
  eave: number
  ground: number
  scale: number
}

const WALL: Wall = { from: -6, to: 410, eave: 668, ground: 846, scale: 0.8 }

/** The gate: a full circle whose foot is cut by the sill. `drop` is how far its centre stands above the ground. */
const GATE = { x: 250, drop: 46, r: 62, trim: 10 }

/** The coping's parts, in the sheet's units at scale 1: the ridge, the tiled slope under it, and the spacing of the rows of cover tiles. */
const COPING = { ridge: 11, slope: 21, pitch: 19 }

function copingTop(wall: Wall): number {
  return wall.eave - (COPING.ridge + COPING.slope) * wall.scale
}

/** The coping, top to bottom, as a Suzhou wall has it (Moon Gate's, unchanged in its parts): a ridge of small tiles stood on edge
 * under a fine capping line, its free end turning up in a short hook (起翘); the tiled slope with its cover rows; along the eave the
 * pointed drip tiles and the round lips; the shadow the eave throws and the two fine lines of a brick cornice. */
function coping(wall: Wall, stock: Stock): string {
  const w = stock.walls
  const s = wall.scale
  const pitch = COPING.pitch * s
  const eaveY = wall.eave
  const foot = eaveY - COPING.slope * s
  const top = copingTop(wall)
  const channel = 0.42 * pitch
  const over = Math.round(COPING.slope * s * 0.22)
  const left = wall.from
  const right = wall.to + over
  const across = (y: number, from: number): string => `M${round(from)} ${round(y)}L${round(right)} ${round(y)}`
  const band = (upper: number, lower: number): string => `M${round(left)} ${round(upper)}L${round(right)} ${round(upper)}L${round(right)} ${round(lower)}L${round(left)} ${round(lower)}Z`
  const onPlaster = (upper: number, lower: number): string => `M${wall.from} ${round(upper)}L${wall.to} ${round(upper)}L${wall.to} ${round(lower)}L${wall.from} ${round(lower)}Z`
  const plasterAcross = (y: number): string => `M${wall.from} ${round(y)}L${wall.to} ${round(y)}`
  const ink = stock.ink
  const line = (value: number): number => alpha(value * stock.line)
  const ridgeFoot = foot - 1.4 * s
  const ridgeHigh = ridgeFoot - top
  const tipLength = 27 * s
  const tipUp = 9 * s
  const tipOut = 3.2 * s
  const end = right
  const tip = { x: end + tipOut, y: top - tipUp }
  const ridgeShape = `M${round(left)} ${round(top)}H${round(end - tipLength)}Q${round(end - tipLength * 0.22)} ${round(top)} ${round(tip.x)} ${round(tip.y)}Q${round(end - tipOut * 0.4)} ${round(ridgeFoot - ridgeHigh * 0.5)} ${round(end - 2)} ${round(ridgeFoot)}H${round(left)}Z`
  const hookLine = `M${round(tip.x)} ${round(tip.y)}Q${round(end - tipLength * 0.22)} ${round(top + 0.5 * s)} ${round(end - tipLength)} ${round(top + 0.5 * s)}H${round(left)}`
  // The shadow the coping throws on the plaster: a few thin bands, each fainter than the one above, laid as one path of stepped cover.
  let shadow = ''
  ;[0.09, 0.065, 0.04, 0.02].forEach((value, index) => {
    shadow += `<path d="${onPlaster(eaveY + index * 7 * s, eaveY + (index + 1) * 7 * s)}" fill="${w.shade}" fill-opacity="${alpha(value * w.eaveShade)}"/>`
  })
  const covers = `<path d="${across((foot + eaveY) / 2, left + channel)}" stroke="${w.glint}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${alpha(w.coverLight)}" stroke-linecap="butt" stroke-dasharray="${round(pitch - channel)} ${round(channel)}"/>`
  const tickY = round(top + 6.4 * s)
  let lips = ''
  for (let x = left + channel / 2; x < right - pitch * 0.5; x += pitch) {
    const half = 0.3 * pitch
    const hang = 0.5 * pitch
    lips += `M${pack([x - half, eaveY - 0.6 * s])}q${pack([0.62 * half, 0.36 * hang, half, hang, 0.38 * half, -0.64 * hang, half, -hang])}z`
    const cover = x + pitch / 2
    const lip = 0.21 * pitch
    lips += `M${pack([cover - lip, eaveY - 0.6 * s])}q${pack([0, 1.3 * lip, lip, 1.3 * lip, lip, 0, lip, -1.3 * lip])}z`
  }
  return (
    shadow +
    `<path d="${band(foot, eaveY)}" fill="${w.tile}"/>` +
    covers +
    `<path d="${across((foot + eaveY) / 2, left - 0.4)}" stroke="${w.glint}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${line(w.rib)}" stroke-linecap="butt" stroke-dasharray="0.8 ${round(channel - 0.8)} 0.8 ${round(pitch - channel - 0.8)}"/>` +
    `<path d="${across(foot + 7.5 * s, left + channel + 1.2)}${across(foot + 14.5 * s, left + channel + 1.2)}" stroke="${w.glint}" stroke-width="0.9" stroke-opacity="${alpha(w.glintAlpha * 0.4)}" stroke-linecap="butt" stroke-dasharray="${round(pitch - channel - 2.4)} ${round(channel + 2.4)}"/>` +
    `<path d="M${round(end)} ${round(foot)}V${round(eaveY)}" stroke="${ink}" stroke-width="1.1" stroke-opacity="${line(0.8)}"/>` +
    `<path d="${ridgeShape}" fill="${w.tile}"/>` +
    `<path d="M${round(left + 1)} ${tickY}H${round(right - 4)}" transform="matrix(1 0 .46 1 ${round(-0.46 * tickY)} 0)" stroke="${w.glint}" stroke-width="${round(5.6 * s)}" stroke-opacity="${w.glintAlpha}" stroke-linecap="butt" stroke-dasharray=".9 ${round(4.4 * s - 0.9)}"/>` +
    `<path d="${hookLine}" stroke="${ink}" stroke-width="${round(3.4 * s)}" stroke-opacity="${line(0.82)}" stroke-linecap="round"/>` +
    `<path d="${across(foot - 0.6 * s, left)}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.6)}"/>` +
    `<path d="${lips}" fill="${w.tile}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${line(0.55)}"/>` +
    `<path d="${plasterAcross(eaveY + 13 * s)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="${line(0.42)}"/>` +
    `<path d="${plasterAcross(eaveY + 17 * s)}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${line(0.26)}"/>`
  )
}

/** A tuft of mondo grass (沿阶草): five blades out of one root, mostly upright, the clump leaning a little to one side. */
function mondo(x: number, y: number, size: number, salt: number): string {
  let d = ''
  const blades = 5
  const skew = (hashUnit(0, salt + 2) - 0.5) * 0.6
  for (let blade = 0; blade < blades; blade += 1) {
    const lean = ((blade / (blades - 1)) * 2 - 1) * 0.8 + skew
    const height = size * (0.66 + 0.34 * (1 - Math.abs(lean))) * (0.72 + 0.5 * hashUnit(blade, salt))
    const reach = lean * size * (0.42 + 0.3 * hashUnit(blade, salt + 1))
    d += `M${round(x + lean * 1.2)} ${round(y)}q${round(reach * 0.25)} ${round(-height)} ${round(reach)} ${round(-height * 0.84)}`
  }
  return d
}

/** The round opening as one closed shape, cut by the sill, wound against the wall so that it is a hole under either fill rule. */
function gateHole(): string {
  const inner = Math.sqrt(GATE.r * GATE.r - GATE.drop * GATE.drop)
  return `M${round(GATE.x + inner)} ${WALL.ground}A${GATE.r} ${GATE.r} 0 1 0 ${round(GATE.x - inner)} ${WALL.ground}Z`
}

/** The gate's light and its spill, by night (one gradient each); the far haze by day. */
function gateDefs(stock: Stock): string {
  const g = stock.gate
  const centreY = WALL.ground - GATE.drop
  if (!g)
    return `<radialGradient id="gh"><stop offset="0" stop-color="${stock.walls.plaster}" stop-opacity="${alpha(stock.walls.haze * 0.8)}"/><stop offset="0.6" stop-color="${stock.walls.plaster}" stop-opacity="${alpha(stock.walls.haze * 0.36)}"/><stop offset="1" stop-color="${stock.walls.plaster}" stop-opacity="0"/></radialGradient>`
  return (
    `<radialGradient id="gl" gradientUnits="userSpaceOnUse" cx="${GATE.x - 8}" cy="${WALL.ground - 22}" r="${round(GATE.r * 1.7)}">` +
    g.stops.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('') +
    '</radialGradient>' +
    `<radialGradient id="gs" gradientUnits="userSpaceOnUse" cx="${GATE.x}" cy="${centreY - 4}" r="${round(GATE.r * 2.3)}">` +
    g.spillStops.map(([offset, part]) => `<stop offset="${offset}" stop-color="${g.spill}" stop-opacity="${alpha(part)}"/>`).join('') +
    '</radialGradient>' +
    `<radialGradient id="gp"><stop offset="0" stop-color="${g.spill}" stop-opacity="${alpha(g.pool)}"/><stop offset="0.5" stop-color="${g.spill}" stop-opacity="${alpha(g.pool * 0.42)}"/>` +
    `<stop offset="1" stop-color="${g.spill}" stop-opacity="0"/></radialGradient>`
  )
}

/** Beyond the gate, drawn before the wall: the light (by night) or the haze over the far ground (by day), and the far sill. */
function beyondGate(stock: Stock): string {
  const g = stock.gate
  return (
    (g ? `<path d="${gateHole()}" fill="url(#gl)"/>` : `<ellipse cx="${GATE.x}" cy="${WALL.ground - 20}" rx="${GATE.r}" ry="24" fill="url(#gh)"/>`) +
    `<path d="M${GATE.x - 70} ${WALL.ground - 6}L${GATE.x + 70} ${WALL.ground - 6}" stroke="${g ? g.line : stock.ink}" stroke-width="0.8" stroke-opacity="${alpha(0.5 * stock.line)}"/>`
  )
}

/** The wall with the gate: plaster (the opening cut out of it), rain streaks, the plinth, the coping, the brick trim, the ground. */
function gateWall(stock: Stock): Built {
  const wall = WALL
  const w = stock.walls
  const s = wall.scale
  const ground = wall.ground
  const line = (value: number): number => alpha(value * stock.line)
  const rim = GATE.r + GATE.trim
  const inner = Math.sqrt(GATE.r * GATE.r - GATE.drop * GATE.drop)
  const arc = (radius: number): string => {
    const half = Math.sqrt(radius * radius - GATE.drop * GATE.drop)
    return `M${round(GATE.x - half)} ${ground}A${radius} ${radius} 0 1 1 ${round(GATE.x + half)} ${ground}`
  }
  const hole = gateHole()
  const frame = `M${wall.from} ${round(wall.eave - 3)}L${wall.to} ${round(wall.eave - 3)}L${wall.to} ${ground}L${wall.from} ${ground}Z${hole}`
  // Old rain streaks under the eave: soft smudges, darkest under it, dying away down the wall.
  let streaks = ''
  ;([[64, 20, 60], [138, 14, 40], [348, 24, 70], [392, 12, 36]] as Array<[number, number, number]>).forEach(([x, breadth, length]) => {
    streaks += `<rect x="${round(x - breadth / 2)}" y="${wall.eave + 2}" width="${breadth}" height="${length * 2}" fill="url(#stw)"/>`
  })
  // The plinth (勒脚) along the foot, stopped at the gate's trim.
  const plinthTop = ground - 30 * s
  const plinthReach = Math.sqrt(rim * rim - (plinthTop - (ground - GATE.drop)) ** 2)
  const footReach = Math.sqrt(rim * rim - GATE.drop * GATE.drop)
  const plinthCut =
    `M${round(GATE.x - plinthReach)} ${round(plinthTop)}A${rim} ${rim} 0 0 0 ${round(GATE.x - footReach)} ${ground}` +
    `L${round(GATE.x + footReach)} ${ground}A${rim} ${rim} 0 0 0 ${round(GATE.x + plinthReach)} ${round(plinthTop)}Z`
  const plinth =
    `<path fill-rule="evenodd" d="M${wall.from} ${round(plinthTop)}L${wall.to} ${round(plinthTop)}L${wall.to} ${ground}L${wall.from} ${ground}Z${plinthCut}" fill="${w.shade}" fill-opacity="${alpha(w.plinth)}"/>` +
    `<path d="M${wall.from} ${round(plinthTop)}L${round(GATE.x - plinthReach)} ${round(plinthTop)}M${round(GATE.x + plinthReach)} ${round(plinthTop)}L${wall.to} ${round(plinthTop)}" stroke="${stock.ink}" stroke-width="0.7" stroke-opacity="${line(0.3)}"/>`
  const centreY = ground - GATE.drop
  const soffit = 4
  const meet = Math.sqrt(GATE.r * GATE.r - (soffit / 2) * (soffit / 2))
  const farEdge = `A${GATE.r} ${GATE.r} 0 0 0 ${round(GATE.x - meet)} ${round(centreY + soffit / 2)}`
  const g = stock.gate
  const soffitPaint = g ? `fill="${g.stops[1]?.[1] ?? stock.ink}" fill-opacity="${g.soffit}"` : `fill="${w.shade}" fill-opacity="0.3"`
  const brickBand = `${arc(rim)}L${round(GATE.x + inner)} ${ground}A${GATE.r} ${GATE.r} 0 1 0 ${round(GATE.x - inner)} ${ground}Z`
  const jointRadius = GATE.r + GATE.trim / 2 + 1.4
  const markup =
    `<path fill-rule="evenodd" d="${frame}" fill="${w.plaster}"/>` +
    streaks +
    plinth +
    `<path d="M${wall.to - 0.5} ${wall.eave}V${ground}" stroke="${w.edgeInk}" stroke-width="1" stroke-opacity="${line(0.8)}"/>` +
    coping(wall, stock) +
    `<path d="${brickBand}" fill="${w.brick}" fill-opacity="${w.brickAlpha}"/>` +
    // By night the light beyond the gate warms the brick and the plaster round it.
    (g ? `<path fill-rule="evenodd" d="M${round(GATE.x - 150)} ${round(wall.eave)}L${round(GATE.x + 150)} ${round(wall.eave)}L${round(GATE.x + 150)} ${ground}L${round(GATE.x - 150)} ${ground}Z${hole}" fill="url(#gs)"/>` : '') +
    `<path d="M${round(GATE.x - meet)} ${round(centreY + soffit / 2)}A${GATE.r} ${GATE.r} 0 1 1 ${round(GATE.x + meet)} ${round(centreY + soffit / 2)}${farEdge}Z" ${soffitPaint}/>` +
    `<path d="${arc(jointRadius)}" stroke="${stock.ink}" stroke-width="${round(GATE.trim - 4)}" stroke-opacity="${line(0.34)}" stroke-linecap="butt" stroke-dasharray="0.7 ${round((jointRadius * Math.PI * 2) / 36 - 0.7)}" stroke-dashoffset="-6"/>` +
    `<path d="${arc(GATE.r + 3)}" stroke="${stock.ink}" stroke-width="0.7" stroke-opacity="${line(0.5)}"/>` +
    `<path d="${arc(rim)}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${line(0.72)}"/>` +
    `<path d="${arc(GATE.r)}" stroke="${stock.ink}" stroke-width="1.4" stroke-opacity="${line(0.92)}"/>` +
    // The ground: a wash under the foot, the line of the foot, a few dry strokes.
    `<path d="M${wall.from} ${ground}L${wall.to} ${ground}L${wall.to} ${ground + 7}L${wall.from} ${ground + 7}Z" fill="${w.shade}" fill-opacity="0.07"/>` +
    `<path d="M${wall.from} ${ground}L${wall.to} ${ground}" stroke="${stock.ink}" stroke-width="1.1" stroke-opacity="${line(0.75)}"/>` +
    `<path d="M150 ${ground + 12}L210 ${ground + 12}M232 ${ground + 17}L300 ${ground + 17}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${line(0.22)}"/>`
  const defs =
    `<radialGradient id="stw" cx="0.5" cy="0" r="0.5"><stop offset="0" stop-color="${w.shade}" stop-opacity="${alpha(w.stain)}"/><stop offset="0.45" stop-color="${w.shade}" stop-opacity="${alpha(w.stain * 0.55)}"/>` +
    `<stop offset="1" stop-color="${w.shade}" stop-opacity="0"/></radialGradient>`
  return { defs, markup }
}

/** The planted bed in front of the wall that the peak and the banana stand in: a low mound, its top line, grass, moss dots. */
function plantedBed(stock: Stock): string {
  const w = stock.walls
  const d = 'M206 880Q226 866 262 862Q300 858 336 857Q376 856 410 860Q424 862 428 870Q430 880 424 886Q330 892 214 888Z'
  const line = (value: number): number => alpha(value * stock.line)
  return (
    `<path d="${d}" fill="${w.bed}" fill-opacity="${w.bedAlpha}"/>` +
    `<path d="M210 879Q228 866 262 862Q300 858 336 857Q376 856 410 860Q424 862 428 870" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${line(0.5)}"/>` +
    `<path d="${mondo(300, 860, 9, 71)}${mondo(368, 866, 10, 72)}${mondo(412, 868, 8, 73)}${mondo(232, 874, 8, 74)}" stroke="${w.tuft}" stroke-width="0.85" stroke-opacity="${line(0.72)}"/>`
  )
}

// ---------------------------------------------------------------------------------------------------------------
// The bamboo

/** One bamboo leaf from its stalk end: a long slim blade, broadest a third of the way along, drawn out to a fine tip that droops a little. */
function leaf(x: number, y: number, angle: number, length: number, half: number): string {
  const alongX = Math.cos(angle)
  const alongY = Math.sin(angle)
  const outX = -alongY * half
  const outY = alongX * half
  const droop = length * 0.1
  const tipX = alongX * length
  const tipY = alongY * length + droop
  const nearX = alongX * length * 0.2
  const nearY = alongY * length * 0.2
  const farX = alongX * length * 0.62
  const farY = alongY * length * 0.62 + droop * 0.35
  return (
    `M${pack([x, y])}c${pack([nearX + outX * 1.5, nearY + outY * 1.5, farX + outX * 1.15, farY + outY * 1.15, tipX, tipY])}` +
    `c${pack([farX - outX * 1.15 - tipX, farY - outY * 1.15 - tipY, nearX - outX * 1.5 - tipX, nearY - outY * 1.5 - tipY, -tipX, -tipY])}z`
  )
}

/** A group of leaves hanging from one point, `toward` in degrees (0 is right, 90 is down). The middle leaf is the longest: three of them make the 个 of the bamboo painters. */
function spray(from: Point, toward: number, count: number, length: number, salt: number): string {
  let d = ''
  for (let index = 0; index < count; index += 1) {
    const off = index - (count - 1) / 2
    const angle = ((toward + off * 21 + (hashUnit(index, salt) - 0.5) * 11) * Math.PI) / 180
    const reach = length * (1 - 0.2 * Math.abs(off)) * (0.86 + 0.28 * hashUnit(index, salt + 1))
    // A slim blade, some eight or nine times as long as it is broad.
    d += leaf(from.x, from.y, angle, reach, 0.85 + reach * 0.02)
  }
  return d
}

/** One culm. `lean` is how far its tip stands to the side of its root and `bend` a slow bow on the way up.
 * A tall culm's crown turns about a point at the level `pivot`, hidden behind the wall; with 0 the whole culm turns about its root.
 * Every node above the level `crown` carries a twig, and so do the nodes listed in `low`, each with its side. */
interface Culm {
  x: number
  y: number
  height: number
  lean: number
  bend: number
  girth: number
  joint: number
  reach: number
  blade: number
  tone: number
  salt: number
  pivot: number
  crown: number
  low: Array<[number, number]>
  /** The share of the crown's nodes left bare, so that sky shows between its sprays. */
  sparse: number
}

// Three culms beyond the gate, in the far courtyard: their feet seen through the opening, their crowns rising over the coping and
// parting as they climb; the tallest leans out toward the open sky on the left, the others step down to the right. Each crown turns
// about a point hidden behind the wall.
const CULMS: Culm[] = [
  { x: 214, y: 838, height: 318, lean: -46, bend: 7, girth: 1.4, joint: 0.78, reach: 25, blade: 21, tone: 0.62, salt: 11, pivot: 690, crown: 650, low: [], sparse: 0.3 },
  { x: 290, y: 839, height: 288, lean: 34, bend: -6, girth: 1.4, joint: 0.78, reach: 24, blade: 20.5, tone: 0.72, salt: 37, pivot: 690, crown: 655, low: [], sparse: 0.35 },
  { x: 250, y: 840, height: 372, lean: -18, bend: -7, girth: 1.7, joint: 0.8, reach: 27, blade: 23, tone: 0.94, salt: 23, pivot: 690, crown: 640, low: [], sparse: 0.3 },
]

/** A point on the culm's axis. The tip bows over: it leans faster and climbs slower as it goes. */
function culmPoint(culm: Culm, share: number): Point {
  return {
    x: culm.x + culm.lean * Math.pow(share, 2.4) + culm.bend * Math.sin(Math.PI * share),
    y: culm.y - culm.height * (share - 0.05 * Math.pow(share, 4)),
  }
}

/** The unit normal of the culm's axis, pointing to its right. */
function culmNormal(culm: Culm, share: number): Point {
  const below = culmPoint(culm, Math.max(0, share - 0.01))
  const above = culmPoint(culm, Math.min(1, share + 0.01))
  const length = Math.hypot(above.x - below.x, above.y - below.y) || 1
  return { x: -(above.y - below.y) / length, y: (above.x - below.x) / length }
}

/** Where the culm's nodes sit, as shares of its height: short internodes at the root, long ones in the middle, shorter again toward the tip. */
function culmNodes(culm: Culm): number[] {
  const nodes = [0]
  let share = 0
  for (let index = 0; index < 60; index += 1) {
    const length = (12 + 20 * Math.min(1, index / 2.5)) * (1 - 0.5 * share * share) * (0.92 + 0.16 * hashUnit(index, culm.salt)) * culm.joint
    share += length / culm.height
    if (share > 0.975) break
    nodes.push(share)
  }
  nodes.push(1)
  return nodes
}

/** One internode: a slim waisted shape between two nodes, a hair's gap left at each. */
function internode(culm: Culm, from: number, to: number): string {
  const gap = 0.8 / culm.height
  const edge = (share: number, swell: number): [Point, Point] => {
    const point = culmPoint(culm, share)
    const normal = culmNormal(culm, share)
    const half = (culm.girth * (1 - 0.72 * share) + 0.4) * swell
    return [{ x: point.x - normal.x * half, y: point.y - normal.y * half }, { x: point.x + normal.x * half, y: point.y + normal.y * half }]
  }
  const [fromLeft, fromRight] = edge(from + gap, 1.2)
  const [waistLeft, waistRight] = edge((from + to) / 2, 0.72)
  const [toLeft, toRight] = edge(to - gap, 1.2)
  const from0 = { x: round(fromLeft.x), y: round(fromLeft.y) }
  const to0 = { x: round(toRight.x), y: round(toRight.y) }
  return (
    `M${pack([from0.x, from0.y])}q${pack([waistLeft.x - from0.x, waistLeft.y - from0.y, toLeft.x - from0.x, toLeft.y - from0.y])}` +
    `L${pack([to0.x, to0.y])}q${pack([waistRight.x - to0.x, waistRight.y - to0.y, fromRight.x - to0.x, fromRight.y - to0.y])}z`
  )
}

/** A twig from a node: it rises outward and bows over, a sliver that tapers to nothing, with a group of three leaves at its end and, on some, a pair on the way.
 * `high` is how far up the crown it grows (0..1): low groups hang down, high ones reach out level, as fresh leaves near the top of a culm do.
 * Twig and leaves are one filled path, so they sway as one. */
function twig(node: Point, side: number, length: number, blade: number, salt: number, high: number): string {
  const lift = ((40 + 16 * hashUnit(1, salt)) * Math.PI) / 180
  const end = { x: node.x + side * length * Math.cos(lift), y: node.y - length * Math.sin(lift) * 0.76 }
  const bend = { x: node.x + side * length * 0.36, y: node.y - length * 0.7 }
  const part = 0.58
  const rest = 1 - part
  const halfway = { x: rest * rest * node.x + 2 * rest * part * bend.x + part * part * end.x, y: rest * rest * node.y + 2 * rest * part * bend.y + part * part * end.y }
  let d = `M${at(node)}Q${at(bend)} ${at(end)}Q${round(bend.x + side * 0.9)} ${round(bend.y + 1)} ${round(node.x)} ${round(node.y + 1.3)}Z`
  const outward = (low: number, top: number): number => {
    const toward = low + (top - low) * high + (hashUnit(6, salt) - 0.5) * 16
    return side > 0 ? toward : 180 - toward
  }
  d += spray(end, outward(64, 10), hashUnit(2, salt) > 0.68 ? 4 : 3, blade, salt + 3)
  if (hashUnit(5, salt) > 0.4) d += spray(halfway, outward(86, 46), hashUnit(4, salt) > 0.7 ? 3 : 2, blade * 0.84, salt + 9)
  return d
}

/** The bamboo's paints on a stock: its own greens, or one ramp down the sheet, or the ink. */
function bambooPaint(stock: Stock): { leaf: string; cane: string; ink: number } {
  if (stock.bambooRamp) return { leaf: 'url(#bam)', cane: 'url(#bam)', ink: stock.bambooInk ?? stock.line }
  return { leaf: stock.bamboo?.leaf ?? stock.ink, cane: stock.bamboo?.cane ?? stock.ink, ink: stock.bambooInk ?? stock.line }
}

/** The culms beyond the gate: each a column of internodes; its crown (the culm above the pivot, its twigs and leaves as one path) sways
 * about a point behind the wall. */
function bamboo(stock: Stock): string {
  let markup = ''
  const paint = bambooPaint(stock)
  CULMS.forEach((culm, order) => {
    const nodes = culmNodes(culm)
    let lower = ''
    let upper = ''
    let twigs = ''
    const isUpper = (share: number): boolean => culmPoint(culm, share).y < culm.pivot
    for (let index = 1; index < nodes.length; index += 1) {
      const from = nodes[index - 1] ?? 0
      const to = nodes[index] ?? 1
      if (isUpper((from + to) / 2)) upper += internode(culm, from, to)
      else lower += internode(culm, from, to)
    }
    const tip = culmPoint(culm, 1)
    const crownTop = culmPoint(culm, 0).y - culm.height * 0.95
    for (let index = 1; index < nodes.length - 1; index += 1) {
      const share = nodes[index] ?? 0
      const node = culmPoint(culm, share)
      if (node.y > culm.crown) continue
      if (hashUnit(index, culm.salt + 77) < culm.sparse) continue
      const side = (index + culm.salt) % 2 === 0 ? 1 : -1
      const high = Math.min(1, Math.max(0, (culm.crown - node.y) / (culm.crown - crownTop)))
      const length = culm.reach * (1 - 0.45 * high) * (0.86 + 0.28 * hashUnit(index, culm.salt + 5))
      twigs += twig(node, side, length, culm.blade * (1 - 0.18 * high), culm.salt * 31 + index, high)
    }
    twigs += spray(tip, culm.lean < 0 ? 158 : 22, 3, culm.blade * 0.78, culm.salt * 13) + leaf(tip.x, tip.y, ((culm.lean < 0 ? -112 : -68) * Math.PI) / 180, culm.blade * 0.5, 1.6)
    const tone = culm.tone * paint.ink
    const stem = (d: string): string => (d ? `<path d="${d}" fill="${paint.cane}" fill-opacity="${alpha(tone * 0.7)}"/>` : '')
    const origin = { x: culmPoint(culm, (culm.y - culm.pivot) / culm.height).x, y: culm.pivot }
    const seconds = round(8 + 5 * hashUnit(order, 97))
    markup +=
      stem(lower) +
      `<g class="cr" style="--a:0.8deg;transform-origin:${round(origin.x)}px ${round(origin.y)}px;animation-duration:${seconds}s;animation-delay:-${round(hashUnit(order, 99) * 12)}s">${stem(upper)}` +
      `<path d="${twigs}" fill="${paint.leaf}" fill-opacity="${alpha(tone * 0.92)}"/></g>`
  })
  return markup
}

// ---------------------------------------------------------------------------------------------------------------
// The banana plant

/** A pseudostem (假茎): not wood but leaf sheaths rolled tight, a stout green column a little swollen at the foot. */
interface Pseudostem {
  foot: Point
  top: Point
  /** Half its breadth at the foot and at the top. */
  base: number
  crown: number
  tone: number
  salt: number
}

// A clump of three from one root, standing in front of the low wall: the main stem; an older one behind it to the left, lower and paler; and a young
// sucker to the right. The stems are short and stout, and the leaves hang low enough round them that the clump reads as one vase of leaves from the ground up.
const STEMS: Pseudostem[] = [
  { foot: { x: 307, y: 833 }, top: { x: 304, y: 788 }, base: 5.6, crown: 3.9, tone: 0.62, salt: 3 },
  { foot: { x: 334, y: 833 }, top: { x: 331, y: 759 }, base: 7.6, crown: 5.2, tone: 1, salt: 7 },
  { foot: { x: 386, y: 833 }, top: { x: 387, y: 813 }, base: 3.4, crown: 2.6, tone: 0.82, salt: 11 },
]

/** One banana leaf: its midrib a curve from the stalk's root on the stem (`from`) to the tip (`to`); half its breadth; how much of each half shows
 * (`plus` is the half to the right of the way the leaf runs): a leaf seen at a slant shows one half narrow. `stalk` is the share of its length that is
 * petiole. Tears are [side, place along the blade 0..1, depth as a share of the half]. */
interface BananaLeaf {
  from: Point
  c1: Point
  c2: Point
  to: Point
  half: number
  plus: number
  minus: number
  stalk: number
  tears: Array<[number, number, number]>
  veins: number
  tone: number
  /** The paler underside is turned up. */
  pale?: boolean
  salt: number
}

const LEAVES: BananaLeaf[] = [
  // the older stem behind: a leaf arching out to the left and a younger one standing up
  { from: { x: 303, y: 790 }, c1: { x: 295, y: 758 }, c2: { x: 270, y: 730 }, to: { x: 242, y: 744 }, half: 13, plus: 0.5, minus: 1, stalk: 0.1, tears: [], veins: 5, tone: 0.6, salt: 21 },
  { from: { x: 305, y: 788 }, c1: { x: 306, y: 764 }, c2: { x: 305, y: 738 }, to: { x: 297, y: 714 }, half: 10, plus: 0.5, minus: 1, stalk: 0.1, tears: [], veins: 4, tone: 0.58, salt: 23 },
  // the main stem: its oldest leaf, low on the left, hanging, torn twice along its veins
  { from: { x: 327, y: 769 }, c1: { x: 306, y: 758 }, c2: { x: 284, y: 768 }, to: { x: 276, y: 812 }, half: 14, plus: 0.5, minus: 1, stalk: 0.1, tears: [[-1, 0.42, 0.75], [-1, 0.68, 0.55]], veins: 5, tone: 0.9, salt: 31 },
  // a big leaf arching over to the left
  { from: { x: 327.6, y: 765 }, c1: { x: 316, y: 722 }, c2: { x: 270, y: 676 }, to: { x: 228, y: 704 }, half: 18, plus: 0.6, minus: 1, stalk: 0.09, tears: [], veins: 6, tone: 1, salt: 33 },
]

// Leaves drawn after the rolled heart: the young one standing nearly upright, the one arching right over the coping, and one coming toward us, its underside up.
const FRONT_LEAVES: BananaLeaf[] = [
  { from: { x: 331, y: 760 }, c1: { x: 332, y: 728 }, c2: { x: 339, y: 690 }, to: { x: 348, y: 658 }, half: 13, plus: 1, minus: 0.72, stalk: 0.08, tears: [], veins: 4, tone: 0.95, salt: 35 },
  { from: { x: 334.6, y: 766 }, c1: { x: 352, y: 722 }, c2: { x: 388, y: 700 }, to: { x: 406, y: 738 }, half: 15, plus: 1, minus: 0.55, stalk: 0.09, tears: [], veins: 6, tone: 0.98, salt: 37 },
  { from: { x: 336, y: 771 }, c1: { x: 355, y: 762 }, c2: { x: 379, y: 764 }, to: { x: 392, y: 794 }, half: 13, plus: 1, minus: 0.7, stalk: 0.12, tears: [[1, 0.55, 0.6]], veins: 4, tone: 0.9, pale: true, salt: 39 },
]

// The sucker's two small leaves.
const SUCKER_LEAVES: BananaLeaf[] = [
  { from: { x: 387, y: 814 }, c1: { x: 388, y: 802 }, c2: { x: 393, y: 791 }, to: { x: 401, y: 782 }, half: 5.5, plus: 1, minus: 0.6, stalk: 0.12, tears: [], veins: 3, tone: 0.8, salt: 41 },
  { from: { x: 386, y: 815 }, c1: { x: 382, y: 806 }, c2: { x: 376, y: 800 }, to: { x: 368, y: 798 }, half: 5, plus: 0.6, minus: 1, stalk: 0.12, tears: [], veins: 3, tone: 0.76, salt: 43 },
]

function cubicAt(leaf: BananaLeaf, t: number): Point {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return { x: a * leaf.from.x + b * leaf.c1.x + c * leaf.c2.x + d * leaf.to.x, y: a * leaf.from.y + b * leaf.c1.y + c * leaf.c2.y + d * leaf.to.y }
}

/** A banana leaf (芭蕉叶): a short stout stalk running straight on into the midrib; one broad oblong blade about three times as long as it is wide, its sides
 * nearly parallel, its base rounded and a little lopsided, its tip blunt and round, never a point; a few fine veins leaving the midrib at a slant toward
 * the tip and stopping short of the edge (葉如斜界紙); on an old leaf a slit or two torn in from the edge along the veins, never across the midrib, the
 * strip beyond it dropped a little out of line. It is first painted in a solid pale ground, so it hides what is behind it. */
function bananaLeaf(leaf: BananaLeaf, id: string, stock: Stock): Built {
  const table: Array<{ length: number; point: Point }> = []
  let length = 0
  let last = cubicAt(leaf, 0)
  for (let step = 0; step <= 48; step += 1) {
    const point = cubicAt(leaf, step / 48)
    length += Math.hypot(point.x - last.x, point.y - last.y)
    table.push({ length, point })
    last = point
  }
  const total = length
  const frame = (share: number): { p: Point; n: Point } => {
    const target = Math.min(1, Math.max(0, share)) * total
    let index = 1
    while (index < table.length - 1 && (table[index]?.length ?? 0) < target) index += 1
    const low = table[index - 1] ?? table[0]
    const high = table[index] ?? low
    if (!low || !high) return { p: leaf.from, n: { x: 1, y: 0 } }
    const part = (target - low.length) / (high.length - low.length || 1)
    const dx = high.point.x - low.point.x
    const dy = high.point.y - low.point.y
    const size = Math.hypot(dx, dy) || 1
    return { p: { x: low.point.x + dx * part, y: low.point.y + dy * part }, n: { x: -dy / size, y: dx / size } }
  }
  const bladeLength = total * (1 - leaf.stalk)
  const shareOf = (along: number): number => leaf.stalk + along * (1 - leaf.stalk)
  const show = (side: number): number => (side > 0 ? leaf.plus : leaf.minus)
  const stalkHalf = 1.15
  /** Half the blade's breadth at a place along it, on one side: the base rounded and lopsided (one side starts a little higher on the stalk), the sides nearly parallel, the tip blunt. */
  const breadth = (along: number, side: number): number => {
    const start = side > 0 ? 0 : 0.035
    const end = side > 0 ? 1 : 0.975
    if (along <= start || along >= end) return 0
    const baseLength = 0.13
    const body = leaf.half * (1 - 0.08 * Math.min(1, Math.max(0, (along - start - baseLength) / 0.62)))
    if (along < start + baseLength) {
      const q = (start + baseLength - along) / baseLength
      return Math.max(stalkHalf, body * Math.sqrt(Math.max(0, 1 - q * q)))
    }
    const tipFrom = 0.76
    if (along > tipFrom) {
      const q = (along - tipFrom) / (end - tipFrom)
      return body * Math.sqrt(Math.max(0, 1 - q * q))
    }
    return body
  }
  const tan = Math.tan((64 * Math.PI) / 180)
  const tearsOn = (side: number): Array<[number, number, number]> => leaf.tears.filter(tear => tear[0] === side)
  /** How far a strip freed by a tear has dropped out of line at a place along the blade. */
  const drop = (along: number, side: number): number => {
    let shift = 0
    for (const [, place] of tearsOn(side)) if (along > place && along < place + 0.12) shift = Math.max(shift, 1.5 * (1 - (along - place) / 0.12))
    return shift
  }
  const edge = (along: number, side: number, share = 1): Point => {
    const { p, n } = frame(shareOf(along))
    const width = breadth(along, side) * show(side) * share + (share === 1 ? drop(along, side) : 0)
    return { x: p.x + n.x * width * side, y: p.y + n.y * width * side }
  }
  const stalkEdge = (share: number, side: number): Point => {
    const { p, n } = frame(share)
    return { x: p.x + n.x * stalkHalf * side, y: p.y + n.y * stalkHalf * side }
  }
  const places: number[] = [0.02, 0.07, 0.13]
  for (let step = 1; step <= 12; step += 1) places.push(0.13 + (0.83 * step) / 12)
  places.push(0.985)
  /** One edge of the leaf from the stalk's root to the tip, with its tears cut in. */
  const side = (which: number): Point[] => {
    const points: Point[] = [stalkEdge(0.02, which), stalkEdge(leaf.stalk * 0.6, which)]
    const tears = tearsOn(which).slice()
    for (const along of places) {
      const tear = tears[0]
      if (tear && along > tear[1]) {
        tears.shift()
        const [, place, depth] = tear
        const width = breadth(place, which) * show(which)
        const back = (depth * width) / (bladeLength * tan)
        const lip = edge(place - 0.02, which)
        const deep = edge(place - back, which, 1 - depth)
        const far = edge(place + 0.024, which)
        points.push(lip, lip, deep, deep, far, far)
      }
      if (breadth(along, which) > 0) points.push(edge(along, which))
    }
    return points
  }
  const root = frame(0).p
  const tip = frame(1).p
  const plus = side(1)
  const minus = side(-1)
  const outline = smoothRing([root, root, ...plus, tip, ...minus.slice().reverse()])
  // The narrower half takes a second wash, all but a hair along the midrib, which stays pale.
  const narrow = leaf.plus < leaf.minus ? 1 : -1
  const spine: Point[] = []
  const rim: Point[] = []
  for (let step = 0; step <= 10; step += 1) {
    const along = 0.05 + (0.92 * step) / 10
    const { p, n } = frame(shareOf(along))
    spine.push({ x: p.x + n.x * 0.9 * narrow, y: p.y + n.y * 0.9 * narrow })
    rim.push(edge(along, narrow, 0.98))
  }
  const shade = band(spine, rim)
  // The veins: a few on each half that shows, unevenly spaced.
  const night = stock.dark ? 0.75 : 1
  let veins = ''
  for (const which of [1, -1]) {
    if (show(which) < 0.4) continue
    const count = Math.max(2, Math.round(leaf.veins * (show(which) > 0.9 ? 1 : 0.6)))
    for (let index = 0; index < count; index += 1) {
      const along = 0.12 + (0.7 * (index + 0.5 + (hashUnit(index, leaf.salt + (which > 0 ? 0 : 9)) - 0.5) * 0.8)) / count
      if (tearsOn(which).some(tear => Math.abs(tear[1] - along) < 0.06)) continue
      const width = breadth(along, which) * show(which)
      if (width < 3) continue
      const slant = Math.tan(((62 + 12 * hashUnit(index, leaf.salt + 3)) * Math.PI) / 180)
      const reach = 0.82 + 0.06 * hashUnit(index, leaf.salt + 5)
      const { p, n } = frame(shareOf(along))
      const start = { x: p.x + n.x * which * 1.1, y: p.y + n.y * which * 1.1 }
      const end = edge(along + (reach * width) / (bladeLength * slant), which, reach)
      const forward = frame(shareOf(along + 0.01)).p
      const fx = forward.x - p.x
      const fy = forward.y - p.y
      const fs = Math.hypot(fx, fy) || 1
      const span = Math.hypot(end.x - start.x, end.y - start.y)
      const bend = { x: (start.x + end.x) / 2 - (fx / fs) * span * 0.14, y: (start.y + end.y) / 2 - (fy / fs) * span * 0.14 }
      // A vein is a hair-thin sliver of the midrib's ink rather than a stroke, so the veins and the midrib are one shape.
      const hair = 0.3 * night
      const hx = (-(end.y - start.y) / (span || 1)) * hair
      const hy = ((end.x - start.x) / (span || 1)) * hair
      veins += `M${at(start)}Q${at(bend)} ${at(end)}L${round(end.x + hx)} ${round(end.y + hy)}Q${round(bend.x + hx)} ${round(bend.y + hy)} ${round(start.x + hx)} ${round(start.y + hy)}Z`
    }
  }
  // The midrib, on from the stalk: the strongest line of the leaf, tapering to the tip.
  const ribLeft: Point[] = []
  const ribRight: Point[] = []
  for (let step = 0; step <= 9; step += 1) {
    const share = step / 9
    const { p, n } = frame(share)
    const half = share <= leaf.stalk ? 1.05 : 1.05 - (0.78 * (share - leaf.stalk)) / (1 - leaf.stalk)
    ribLeft.push({ x: p.x - n.x * half, y: p.y - n.y * half })
    ribRight.push({ x: p.x + n.x * half, y: p.y + n.y * half })
  }
  const middle = frame(0.55).p
  const tone = leaf.tone
  const own = stock.banana
  {
    // Its own colours: the blade from the paler back leaves (tone 0.55 and under) to the front ones (tone 1), an underside turned up a
    // little paler still; the narrow half in a deeper green; the midrib and veins pale; the outline (by night, the warm edge of the light).
    const front = Math.min(1, Math.max(0, (tone - 0.55) / 0.45))
    let blade = mixed(own.back, own.blade, front)
    if (leaf.pale) blade = mixed(blade, own.rib, 0.22)
    return {
      defs: '',
      markup:
        `<path d="${outline}" fill="${blade}" stroke="${own.line}" stroke-width="0.95" stroke-opacity="${alpha(own.lineAlpha * (0.6 + 0.4 * tone))}"/>` +
        (leaf.half >= 12 ? `<path d="${shade}" fill="${own.shade}" fill-opacity="${alpha(own.shadeAlpha * (leaf.pale ? 0.6 : 1))}"/>` : '') +
        `<path d="${band(ribLeft, ribRight)}${veins}" fill="${own.rib}" fill-opacity="${alpha(own.ribAlpha * (0.7 + 0.3 * tone))}"/>`,
    }
  }
  return { defs: '', markup: '' }
}

/** A pseudostem: a smooth column, swollen at the foot, tapering a little; two or three faint lines where its sheaths overlap, a few dark blotches, and at
 * its foot the dry shreds of old sheaths peeling away. No rings, no hatching, no fibre: those make a palm's trunk. */
function pseudostem(stem: Pseudostem, stock: Stock): string {
  const height = stem.foot.y - stem.top.y
  const point = (share: number, side: number): Point => {
    const swell = 1 + 0.3 * Math.pow(Math.max(0, 1 - share / 0.2), 2)
    const half = (stem.base + (stem.crown - stem.base) * share) * swell
    return { x: stem.foot.x + (stem.top.x - stem.foot.x) * share + side * half, y: stem.foot.y - height * share }
  }
  const shares = [0, 0.06, 0.16, 0.34, 0.55, 0.78, 1]
  const left = shares.map(share => point(share, -1))
  const right = shares.slice().reverse().map(share => point(share, 1))
  const d = smoothPath(left) + smoothPath(right).replace('M', 'L') + 'Z'
  const line = (lateral: number, from: number, to: number): string => {
    const points = [from, (from + to) / 2, to].map(share => {
      const p = point(share, lateral)
      return { x: p.x + (share === (from + to) / 2 ? 0.4 : 0), y: p.y }
    })
    return smoothPath(points)
  }
  const sheaths = line(-0.42, 0.08, 0.72) + line(0.18, 0.22, 0.97) + line(0.58, 0.05, 0.46)
  let blotches = ''
  for (let index = 0; index < 3; index += 1) {
    const p = point(0.2 + 0.6 * hashUnit(index, stem.salt), (hashUnit(index, stem.salt + 1) - 0.5) * 1.1)
    blotches += `M${at(p)}l${round(0.4 + 0.6 * hashUnit(index, stem.salt + 2))} ${round(1.2 + 1.4 * hashUnit(index, stem.salt + 3))}`
  }
  // Dry shreds at the foot, curling outward from both sides.
  let shreds = ''
  for (const [lateral, rise, reach] of [[-1, 5, 6], [-1, 11, 4.5], [1, 7, 5.5], [1, 3, 4]] as Array<[number, number, number]>) {
    const p = point(rise / height, lateral)
    shreds += `M${at(p)}q${round(lateral * reach * 0.5)} ${round(-0.6)} ${round(lateral * reach)} ${round(reach * 0.55)}`
  }
  const tone = stem.tone
  const own = stock.banana
  {
    const body = mixed(own.back, own.stem, Math.min(1, Math.max(0, (tone - 0.55) / 0.45)))
    return (
      `<path d="${d}" fill="${body}" stroke="${own.line}" stroke-width="0.95" stroke-opacity="${alpha(own.lineAlpha * (0.6 + 0.4 * tone))}"/>` +
      `<path d="${sheaths}" stroke="${own.line}" stroke-width="0.55" stroke-opacity="${alpha(own.lineAlpha * 0.5)}"/>` +
      `<path d="${shreds}" stroke="${own.shred}" stroke-width="0.8" stroke-opacity="0.85"/>` +
      (stem.tone === 1 ? `<path d="${blotches}" stroke="${own.blotch}" stroke-width="1.3" stroke-opacity="0.5"/>` : '')
    )
  }
}

/** The new leaf still rolled (蕉心), standing up out of the main stem: a pale slender spindle, pointed, the edge of its outer layer winding once round it. */
function furledLeaf(stock: Stock): string {
  const d = 'M327.6 762Q326 744 326.8 730Q327.4 722 329.2 715Q331.2 722 332.2 730Q333.8 746 334.6 762Z'
  const own = stock.banana
  {
    return (
      `<path d="${d}" fill="${own.heart}" stroke="${own.line}" stroke-width="0.9" stroke-opacity="${alpha(own.lineAlpha)}"/>` +
      `<path d="M327.2 752Q330.4 744 333.2 734Q331.6 730 329.4 724" stroke="${own.line}" stroke-width="0.6" stroke-opacity="${alpha(own.lineAlpha * 0.6)}"/>`
    )
  }
}

/** A dead leaf hanging folded down against the main stem (一葉舒則一葉焦): a narrow strip, darker and dry, frayed at its end. */
function deadLeaf(stock: Stock): string {
  const d = 'M328.4 773Q322 781 320.8 795Q319.8 809 321.6 823L320 828L322.8 826.4L323.6 831L325 825.6Q324.8 809 326 796Q327.2 783 331 776Z'
  const own = stock.banana
  {
    return (
      `<path d="${d}" fill="${own.dead}" stroke="${own.deadLine}" stroke-width="0.8" stroke-opacity="0.7"/>` +
      `<path d="M329.2 775Q323.8 787 323.2 803Q323 815 323.4 823" stroke="${own.deadLine}" stroke-width="0.5" stroke-opacity="0.5"/>`
    )
  }
}

/** The clump in front of the low wall, back to front: the older stem and its leaves, the main stem, its leaves behind the rolled heart, the heart,
 * the leaves in front of it, the dead leaf, the stone at its foot, the sucker, and tufts of mondo grass (书带草) hiding where they all leave the ground. */
function bananaPlant(stock: Stock): Built {
  let defs = ''
  let index = 0
  const leaves = (list: BananaLeaf[]): string =>
    list
      .map(leaf => {
        const built = bananaLeaf(leaf, `b${index}`, stock)
        index += 1
        defs += built.defs
        return built.markup
      })
      .join('')
  const [older, main, sucker] = STEMS
  const line = (value: number): number => alpha(value * stock.line)
  const markup =
    (older ? pseudostem(older, stock) : '') +
    leaves(LEAVES.slice(0, 2)) +
    (main ? pseudostem(main, stock) : '') +
    leaves(LEAVES.slice(2)) +
    leaves(FRONT_LEAVES.slice(0, 1)) +
    furledLeaf(stock) +
    leaves(FRONT_LEAVES.slice(1)) +
    deadLeaf(stock) +
    (sucker ? pseudostem(sucker, stock) : '') +
    leaves(SUCKER_LEAVES) +
    `<path d="${mondo(318, 833, 12, 61)}${mondo(327, 833, 9, 62)}${mondo(349, 833, 11, 63)}${mondo(375, 833, 8, 64)}${mondo(399, 833, 10, 65)}${mondo(240, 833, 8, 66)}${mondo(289, 833, 9, 67)}" stroke="${stock.walls.tuft}" stroke-width="0.85" stroke-opacity="${line(0.7)}"/>`
  return { defs, markup }
}
/** A small seal: a vermilion square with a sign left bare: a flying eave over a wave, and the moon. A mark, not a character. */
function seal(x: number, y: number, stock: Stock): string {
  const bare = skyAt(stock.sky, x + 12, y + 12)
  return (
    `<g transform="translate(${x} ${y})" opacity="0.92"><rect width="24" height="24" rx="2.2" fill="${stock.seal}"/>` +
    `<path d="M4.6 14.4q3 -0.2 3.8 -3.6q3.6 1.6 7.2 0q0.8 3.4 3.8 3.6M5.2 19.4q3.4 -3 6.8 0t6.8 0" stroke="${bare}" stroke-width="1.6"/>` +
    `<circle cx="17.2" cy="6" r="2" fill="${bare}"/></g>`
  )
}

/** The right band is the Pavilion sheet's pavilion, rockery and water, drawn in their own units and brought nearer: scaled about the
 * pavilion so that its finial reaches about y 400. Everything in that group is written in those units; `toSheet` gives the sheet's. */
const NEAR = { k: 1.5, x: 1410, y: 590, from: { x: 1462, y: 687 } }
const NEAR_X = round(NEAR.x - NEAR.from.x * NEAR.k)
const NEAR_Y = round(NEAR.y - NEAR.from.y * NEAR.k)

function toSheet(x: number, y: number): Point {
  return pt(NEAR_X + x * NEAR.k, NEAR_Y + y * NEAR.k)
}

/** The banana clump, Moon Gate's, drawn in its own units and set down at the peak's left foot, smaller. */
const BANANA_AT = { k: 0.66, x: 330, y: 876, from: { x: 334, y: 833 } }

/** The whole sheet on one stock. */
function gardenSheet(stock: Stock): string {
  const sky = stock.sky
  const ink = stock.ink
  const mists: string[] = []
  const p = stock.paint
  const lamp = p.lamp
  /** A lens of bare air: it lets a thing sink into the water or the mist. Its colour is the sky's where it lies on the sheet (`near`
   * says its numbers are in the pavilion's units); on the water by day it takes the water's own tint. */
  const mist = (cx: number, cy: number, rx: number, ry: number, strength: number, onWater = false, near = false, extra = ''): string => {
    const id = `m${mists.length}`
    const where = near ? toSheet(cx, cy) : pt(cx, cy)
    const air = skyAt(sky, where.x, where.y)
    const colour = onWater && p.waterAlpha > 0 ? mixed(air, p.water, p.waterAlpha * 0.8) : air
    mists.push(
      `<radialGradient id="${id}"><stop offset="0" stop-color="${colour}" stop-opacity="${share(strength)}"/><stop offset="0.5" stop-color="${colour}" stop-opacity="${share(strength * 0.72)}"/>` +
        `<stop offset="0.82" stop-color="${colour}" stop-opacity="${share(strength * 0.22)}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>`,
    )
    return `<ellipse${extra} cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`
  }
  const waterTint = (cx: number, cy: number, rx: number, ry: number): string =>
    p.waterAlpha > 0 ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#wt)"/>` : ''
  /** A ripple: three rings from one point, each widening and fading in turn. At rest they stand as three still rings. */
  const ripple = (cx: number, cy: number, rx: number, seconds: number, delay: number): string => {
    let rings = ''
    for (let ring = 0; ring < 3; ring += 1) {
      const at0 = (ring + 0.6) / 3
      rings +=
        `<ellipse class="ring" cx="${cx}" cy="${cy}" rx="${rx}" ry="${round(rx * 0.26)}" ` +
        `style="transform-origin:${cx}px ${cy}px;transform:scale(${round(at0 * 10) / 10});opacity:${share(0.62 * (1 - at0 * 0.8))};animation-duration:${seconds}s;animation-delay:-${round(delay + (seconds * ring) / 3)}s"/>`
    }
    return rings
  }
  /** One level stroke on the water, faintly waved. */
  const stroke = (x1: number, x2: number, y: number): string => {
    const quarter = round((x2 - x1) / 4)
    return `M${x1} ${y}q${quarter} -1.3 ${quarter * 2} 0t${quarter * 2} 0`
  }
  // By night the strokes under the middle of the pavilion carry its light, the more the nearer the middle.
  const lit = (x1: number, x2: number): string => {
    if (!lamp) return ''
    const off = Math.abs((x1 + x2) / 2 - 1462)
    return off < 56 ? ` stroke="${lamp.reflect}"` : ''
  }
  const litStrength = (x1: number, x2: number, strength: number): number => {
    if (!lamp) return strength
    const off = Math.abs((x1 + x2) / 2 - 1462)
    return off < 56 ? Math.min(1, strength * (2.1 - off / 56)) : strength * 0.6
  }
  const shimmer = (x1: number, x2: number, y: number, strength: number, index: number, width = 1.2): string =>
    `<path class="shim" d="${stroke(x1, x2, y)}"${lit(x1, x2)} stroke-width="${width}" stroke-opacity="${share(litStrength(x1, x2, strength) * stock.line)}" style="animation-duration:${round(6 + hashUnit(index, 41) * 5)}s;animation-delay:-${round(hashUnit(index, 43) * 8)}s"/>`
  const still = (x1: number, x2: number, y: number, strength: number, width = 1.2): string =>
    `<path d="${stroke(x1, x2, y)}"${lit(x1, x2)} stroke-width="${width}" stroke-opacity="${share(litStrength(x1, x2, strength) * 0.8 * stock.line)}"/>`

  const WATER = 856
  const tree = willow(stock)
  const house = pavilion(stock, 1462, 687, 1)
  const back = rockery(stock, ROCKERY_BACK, 'kb')
  const front = rockery(stock, ROCKERY_FRONT, 'kf')
  const wall = gateWall(stock)
  const peak = leftPeak(stock)
  const plant = bananaPlant(stock)
  const waterInk = p.ripple

  const disc =
    `<circle cx="1440" cy="196" r="${stock.haloR}" fill="url(#halo)"/>` +
    `<circle cx="1440" cy="196" r="22" fill="${stock.disc}" fill-opacity="${stock.discAlpha}"/>`

  // By night, under the pavilion, the light it throws on the water: a soft upright glow the strokes break.
  const glowOnWater = lamp ? `<ellipse cx="1462" cy="${WATER + 30}" rx="44" ry="34" fill="url(#pr)"/>` : ''
  const reflections =
    glowOnWater +
    `<g stroke="${waterInk}">` +
    still(1416, 1454, WATER + 10, 0.44, 1.2) +
    shimmer(1468, 1552, WATER + 11, 0.48, 2, 1.2) +
    still(1426, 1472, WATER + 21, 0.38, 1.1) +
    shimmer(1486, 1516, WATER + 20, 0.4, 3, 1.1) +
    shimmer(1528, 1580, WATER + 22, 0.3, 4, 1) +
    shimmer(1442, 1520, WATER + 31, 0.32, 5, 0.9) +
    shimmer(1452, 1488, WATER + 42, 0.28, 6, 0.9) +
    shimmer(1500, 1542, WATER + 45, 0.24, 7, 0.8) +
    shimmer(1460, 1512, WATER + 56, 0.2, 8, 0.8) +
    '</g>'
  const rings = `<g stroke="${waterInk}" stroke-width="0.8" stroke-opacity="${share(0.6 * stock.line)}">` + ripple(1540, WATER + 36, 24, 13, 0) + '</g>'

  const near =
    `<g transform="translate(${NEAR_X} ${NEAR_Y}) scale(${NEAR.k})">` +
    waterTint(1494, 890, 132, 34) +
    back.markup +
    house.markup +
    front.markup +
    tuft(stock, 1476, 827, 10, 67) +
    mist(1500, WATER + 8, 120, 10, 0.8, true, true, ' class="drift"') +
    reflections +
    rings +
    '</g>'

  const style = `
.sway{animation:sway 10s ease-in-out infinite alternate}
.cr{animation:sw 11s ease-in-out infinite alternate}
.ring{animation:ring 13s linear infinite}
.shim{animation:shim 8s ease-in-out infinite alternate}
.drift{animation:drift 40s ease-in-out infinite alternate}
.flk{animation:flk 4.6s ease-in-out infinite alternate}
@keyframes sway{from{transform:rotate(calc(var(--a) * -0.6))}to{transform:rotate(var(--a))}}
@keyframes sw{from{transform:rotate(calc(var(--a) * -1))}to{transform:rotate(var(--a))}}
@keyframes ring{0%{transform:scale(.08);opacity:0}14%{opacity:.7}100%{transform:scale(1);opacity:0}}
@keyframes shim{from{transform:translateX(-3px);opacity:.5}to{transform:translateX(4px);opacity:1}}
@keyframes drift{from{transform:translateX(-10px)}to{transform:translateX(12px)}}
@keyframes flk{from{opacity:.84}to{opacity:1}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  const g = stock.gate
  const left =
    beyondGate(stock) +
    bamboo(stock) +
    wall.markup +
    (g ? `<ellipse cx="${GATE.x}" cy="${WALL.ground + 6}" rx="118" ry="12" fill="url(#gp)"/>` : '') +
    plantedBed(stock) +
    peak.markup +
    `<g transform="translate(${round(BANANA_AT.x - BANANA_AT.from.x * BANANA_AT.k)} ${round(BANANA_AT.y - BANANA_AT.from.y * BANANA_AT.k)}) scale(${BANANA_AT.k})">${plant.markup}</g>` +
    seal(212, 904, stock)

  // Built in drawing order, so that every lens of mist has made its gradient before the defs are written.
  const drawing = `${disc}
${near}
${tree.farStrands}${tree.boughs}${tree.nearStrands}
${left}`

  const defs =
    skyDefs(sky) +
    mists.join('') +
    `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.haloColour}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.haloColour}" stop-opacity="0"/></radialGradient>` +
    (p.waterAlpha > 0
      ? `<radialGradient id="wt"><stop offset="0" stop-color="${p.water}" stop-opacity="${share(p.waterAlpha)}"/><stop offset="0.6" stop-color="${p.water}" stop-opacity="${share(p.waterAlpha * 0.7)}"/><stop offset="1" stop-color="${p.water}" stop-opacity="0"/></radialGradient>`
      : '') +
    (lamp
      ? `<radialGradient id="pr"><stop offset="0" stop-color="${lamp.reflect}" stop-opacity="0.34"/><stop offset="0.5" stop-color="${lamp.reflect}" stop-opacity="0.16"/><stop offset="1" stop-color="${lamp.reflect}" stop-opacity="0"/></radialGradient>`
      : '') +
    back.defs +
    front.defs +
    house.defs +
    wall.defs +
    gateDefs(stock) +
    peak.defs +
    (stock.bambooRamp
      ? `<linearGradient id="bam" gradientUnits="userSpaceOnUse" x1="0" y1="${stock.bambooRamp.from}" x2="0" y2="${stock.bambooRamp.to}">` +
        stock.bambooRamp.stops.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('') +
        '</linearGradient>'
      : '') +
    plant.defs

  const ground = `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>` + sky.glows.map((_, index) => `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow${index})"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${defs}</defs>
${ground}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${drawing}
</g>
</svg>`
}

/** Numbers written without the leading zero of a fraction (0.5 as .5): the same numbers, the same picture, a shorter file. */
function tight(svg: string): string {
  return svg.replace(/(^|[^\d.])0\.(?=\d)/g, '$1.')
}

/** On a clear day (晴日写真), for a light window. */
export function daySvg(): string {
  return tight(gardenSheet(STOCKS.day))
}

/** On the moon-glow night, for a dark window. */
export function nightSvg(): string {
  return tight(gardenSheet(STOCKS.night))
}
