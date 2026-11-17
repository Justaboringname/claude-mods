// Pavilion by the Water (水亭曲桥): a Suzhou garden sheet, sibling of Ink Mountains.
// Lower right: a six-sided garden pavilion with the steep, flying eave corners of Jiangnan, a tiled tent roof with a
// gourd finial, slender columns, a hanging fretwork frieze under the lintel and a "beauty's rest" bench leaning out
// over the pond. It stands on a stone plinth among piled lake stones; a zigzag bridge of stone slabs with low rails
// comes to it out of the mist and lands at three steps.
// Top right: willow strands hang in across a small low sun (a pale moon by night). Left band: a Taihu peak in the pond, lean,
// big above and small below, its head leaning and curling over the water, its foot going down into the water among small
// stones and lotus leaves; under the pavilion, a rockery of lake stones piled in courses, high at the right, with a cave at
// the water. Every stone's outline is a brush line of unequal lobes, heavy on its shaded side and broken along its lit top.
// daySvg and nightSvg draw the photographic stocks of Lattice Windows' chosen pair: 晴日写真 (dayNatural: a soft blue-grey air,
// white sill walls and plinth, a 黛 roof with its rows picked out, chestnut wood, the bamboo's greens on the willow and lotus,
// cool grey stone, water a breath bluer than the air) and 灯影夜游 (nightLantern: wine-ink air, the pavilion lit amber-gold
// from within, its light on the floor, the eaves' undersides and the rails, on the sill walls, on the rockery's near side and
// broken on the water; nothing else glows). The older ink sheets and dusk skies are kept as further stocks.
// The water is only suggested: a few level strokes under the pavilion and slow ripple rings.
// Motion: the willow strands sway, the ripple rings widen and fade, the reflection strokes shimmer; nothing else.
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

/** The ground the mountains stand against: a vertical run of colours with glows laid over it. It takes the place of
 * flat paper, and its colours follow the wallpaper of the person's Token Counter app (orange, wine, violet), mirrored
 * so that the orange corner lies behind the disc on the right. */
interface Sky {
  /** Offsets 0..1 down the sheet, with their colours. */
  base: Array<[number, string]>
  glows: Glow[]
}

interface Stock {
  sky: Sky
  ink: string
  disc: string
  seal: string
  /** The whitewash of a low wall: a little lighter than the sky by day, a moonlit wash by night. */
  wall: string
  wallAlpha: number
  /** The blush on the lotus bud. */
  bloom: string
  /** The colour of real shadow (the inside of a blind hole, a cave mouth, the hollow under a stone's lip), and how much of
   * it those take. By day it is the ink; by night it is darker than the sky, so a hollow stays dark instead of turning
   * into a pale spot as the pale night ink would make it. */
  shade: string
  shadeAlpha: number
  /** How much ink a wash takes, relative to the day sheet. */
  wash: number
  /** The same for pen lines. */
  line: number
  /** Strength of the glow round the disc; 0 leaves it out. */
  halo: number
  /** The disc's own cover, and the glow round it: its colour and radius (unset: the disc's colour, 78). */
  discAlpha?: number
  haloColour?: string
  haloR?: number
  /** The photographic stocks (晴日写真 by day, 灯影夜游 by night) paint every thing in its own colour instead of washes of the
   * ink over the sky; `paint` holds those colours. Unset, the sheet is the old ink painting. */
  paint?: Paint
}

/** The colours of a photographic sheet. */
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
  /** The bridge's deck stone. */
  deck: string
  /** Plants: the willow's wood and its near and far strands; the lotus leaf (raised and floating), its line and veins; the
   * lotus bud's petal, the flush at its tip and its line. */
  bough: string
  boughAlpha: number
  willowNear: string
  willowFar: string
  willowAlpha: number
  leaf: string
  leafFloat: string
  leafLine: string
  leafLineAlpha: number
  vein: string
  veinAlpha: number
  petal: string
  flush: string
  petalLine: string
  petalLineAlpha: number
  /** Water: a breath bluer than the air (its colour and cover), and the strokes and rings on it. */
  water: string
  waterAlpha: number
  ripple: string
  /** By night, the pavilion is lit from within (灯影夜游): the light from its middle (0) out to the reach of its glow (1); the warm
   * light it throws on what is next to it (a colour, and its cover from the middle out); and its broken reflection on the water. */
  lamp?: {
    stops: ReadonlyArray<readonly [number, string, number]>
    spill: string
    spillStops: ReadonlyArray<readonly [number, number]>
    reflect: string
  }
}

const STOCKS: { day: Stock; night: Stock; nightBlue: Stock; dayInk: Stock; nightInk: Stock; dayNatural: Stock; nightLantern: Stock } = {
  /** Day, clear (晴日写真), the sky and colours of Lattice Windows' chosen day: a soft blue-grey air paling to a gold haze round a
   * pale vermilion sun (its glow moved onto this sheet's sun); a white sill wall and a white stone plinth; a 黛 roof with its rows
   * picked out; chestnut wood; willow and lotus in the bamboo's muted greens; a white lotus bud flushed pink; lake stone in cool
   * grey only; water a breath bluer than the air. */
  dayNatural: {
    sky: {
      base: [[0, '#cfdae6'], [0.5, '#d3dce7'], [1, '#d8dee8']],
      glows: [
        { x: 1440, y: 222, r: 420, colour: '#ffefd4', alpha: 0.62 },
        { x: -120, y: 40, r: 720, colour: '#c1d0e1', alpha: 0.15 },
        { x: 1480, y: 1060, r: 600, colour: '#e4dfe2', alpha: 0.45 },
      ],
    },
    ink: '#262b33', disc: '#eb976a', seal: '#b8432e', wall: '#ffffff', wallAlpha: 0.5, bloom: '#ddb3d0', shade: '#262b33', shadeAlpha: 1, wash: 1, line: 1.1,
    halo: 0.3, haloColour: '#f5c39a', haloR: 96, discAlpha: 0.94,
    paint: {
      plaster: '#fefefe', plinth: '#fdfdfd', cool: '#3c4a5c', coolAlpha: 0.3,
      tile: '#262b33', tileLight: 0.02, lime: '#ffffff', rib: 0.2, groove: '#14171d', grooveAlpha: 0.55,
      soffit: '#3a3a40', soffitAlpha: 0.78,
      wood: '#4a3b38', woodFar: '#4a3b38', woodFarAlpha: 0.6, rail: '#4a3b38',
      stone: '#dfe3e8', stoneLit: '#ffffff', stoneLitAlpha: 0.8, stoneWash: '#3c4a5c', stoneWashAlpha: 1, hollow: '#232a35', hollowAlpha: 1, stoneLine: '#262b33',
      deck: '#f5f6f8',
      bough: '#544a48', boughAlpha: 0.9, willowNear: '#4f7358', willowFar: '#7c9a84', willowAlpha: 1,
      leaf: '#5f8068', leafFloat: '#7c9a84', leafLine: '#33493c', leafLineAlpha: 0.8, vein: '#e9efe9', veinAlpha: 0.42,
      petal: '#ffffff', flush: '#ddb3d0', petalLine: '#4a3d50', petalLineAlpha: 0.78,
      water: '#b4c6dc', waterAlpha: 0.42, ripple: '#55667c',
    },
  },
  /** Night, lantern (灯影夜游), the sky and colours of Lattice Windows' chosen night: a deep wine-ink air, a small pale moon; the
   * pavilion lit from within in amber-gold, the light brightest in its middle, on the floor, the undersides of the eaves and the
   * rails, warming the plaster of the sill walls, broken in reflection on the water, and catching the side of the rockery that faces
   * it; the near columns and the hanging fretwork dark against it. Tiles near black, lines a pale warm tone. Nothing else glows. */
  nightLantern: {
    sky: { base: [[0, '#23171e'], [1, '#1c1218']], glows: [] },
    ink: '#e8cfc2', disc: '#f3e8d8', seal: '#a64a3c', wall: '#7e6270', wallAlpha: 1, bloom: '#d2a6c4', shade: '#0e0709', shadeAlpha: 0.9, wash: 0.5, line: 0.8,
    halo: 0.2, haloColour: '#d2b4b6', haloR: 80, discAlpha: 1,
    paint: {
      plaster: '#7e6270', plinth: '#5e4852', cool: '#120a10', coolAlpha: 0.5,
      tile: '#130a0f', tileLight: 0, lime: '#e8cfc2', rib: 0.1, groove: '#070305', grooveAlpha: 0.5,
      soffit: '#130a0f', soffitAlpha: 0.9,
      wood: '#2a141b', woodFar: '#c8925e', woodFarAlpha: 0.55, rail: '#f6d7a0',
      stone: '#33272e', stoneLit: '#d2b4b6', stoneLitAlpha: 0.26, stoneWash: '#0e0709', stoneWashAlpha: 0.7, hollow: '#0b0507', hollowAlpha: 0.9, stoneLine: '#e8cfc2',
      deck: '#4a3942',
      bough: '#b49690', boughAlpha: 0.7, willowNear: '#a8878a', willowFar: '#7a5e66', willowAlpha: 0.8,
      leaf: '#3a3433', leafFloat: '#33292d', leafLine: '#c9aea4', leafLineAlpha: 0.6, vein: '#c9aea4', veinAlpha: 0.22,
      petal: '#f3e3dc', flush: '#d2a6c4', petalLine: '#2a161d', petalLineAlpha: 0.6,
      water: '#1c1218', waterAlpha: 0, ripple: '#c9aea4',
      lamp: {
        stops: [[0, '#fae2b0', 1], [0.3, '#f2c27a', 0.86], [0.62, '#de9c58', 0.38], [1, '#c4844e', 0]],
        spill: '#eea87e',
        spillStops: [[0, 0.85], [0.42, 0.6], [0.7, 0.24], [1, 0]],
        reflect: '#f2c27a',
      },
    },
  },
  /** Day, pale: the Token Counter day colours let down with white, so dark text reads straight on it. */
  day: {
    sky: {
      base: [[0, '#f8ddd0'], [0.45, '#eddce8'], [1, '#dee4f6']],
      glows: [
        { x: 1560, y: 30, r: 640, colour: '#f49a62', alpha: 0.5 },
        { x: 110, y: 430, r: 660, colour: '#aebdec', alpha: 0.42 },
        { x: 1500, y: 1050, r: 640, colour: '#c3b3ea', alpha: 0.4 },
      ],
    },
    ink: '#2b2338', disc: '#ee6a2c', seal: '#c2422b', wall: '#ffffff', wallAlpha: 0.5, bloom: '#e0607c', shade: '#2b2338', shadeAlpha: 1, wash: 1, line: 1, halo: 0,
  },
  /** Night, no blue: one small vivid orange glow, everything dark around it in wine and plum (red stays the
   * strongest channel everywhere, never brown: dimmed orange turns brown, so the dark tones are wine instead). */
  night: {
    sky: {
      base: [[0, '#2b1519'], [0.5, '#1d121c'], [1, '#130e16']],
      glows: [
        { x: 1390, y: 230, r: 780, colour: '#8a3248', alpha: 0.4 },
        { x: 1545, y: 55, r: 430, colour: '#f5822f', alpha: 0.5 },
        { x: 1450, y: 990, r: 720, colour: '#4c2148', alpha: 0.38 },
        { x: 130, y: 520, r: 700, colour: '#3c1c3c', alpha: 0.36 },
      ],
    },
    ink: '#e4d4d8', disc: '#f79a4b', seal: '#b4472e', wall: '#e4d4d8', wallAlpha: 0.2, bloom: '#f08aa0', shade: '#0b070c', shadeAlpha: 0.9, wash: 0.5, line: 0.8, halo: 0.14,
  },
  /** Night, as the Token Counter has it: the same orange glow falling off through wine and violet into blue. */
  nightBlue: {
    sky: {
      base: [[0, '#24171a'], [0.5, '#17161f'], [1, '#10131d']],
      glows: [
        { x: 1390, y: 230, r: 780, colour: '#8a3248', alpha: 0.4 },
        { x: 1545, y: 55, r: 430, colour: '#f5822f', alpha: 0.5 },
        { x: 1440, y: 1000, r: 760, colour: '#582a6c', alpha: 0.42 },
        { x: 120, y: 420, r: 760, colour: '#24408e', alpha: 0.46 },
        { x: 240, y: 1040, r: 620, colour: '#1a4690', alpha: 0.3 },
      ],
    },
    ink: '#dcd6e8', disc: '#f79a4b', seal: '#b4472e', wall: '#dcd6e8', wallAlpha: 0.2, bloom: '#f08aa0', shade: '#07070d', shadeAlpha: 0.9, wash: 0.5, line: 0.8, halo: 0.14,
  },
  /** Day, ink: for the gardens the dusk colours are too vivid, so this is a sheet of pale, nearly colourless mist with
   * one faint warm blush behind the sun. Not paper-yellow: red, green and blue stay within a few levels of each other.
   * The muted cinnabar sun and the seal are the only colour on it; the lotus bud is a grey wash like the leaves. */
  dayInk: {
    sky: {
      base: [[0, '#efedeb'], [0.5, '#eae9e9'], [1, '#e3e4e7']],
      glows: [
        { x: 1560, y: 30, r: 600, colour: '#e8cdbb', alpha: 0.42 },
        { x: 110, y: 430, r: 660, colour: '#d3d6dc', alpha: 0.35 },
        { x: 1500, y: 1050, r: 640, colour: '#d2d0d6', alpha: 0.3 },
      ],
    },
    ink: '#26262b', disc: '#c65f45', seal: '#b5432e', wall: '#ffffff', wallAlpha: 0.5, bloom: '#8f8e92', shade: '#26262b', shadeAlpha: 1, wash: 1, line: 1, halo: 0,
  },
  /** Night, ink: a charcoal sheet with a dim warm glow round a pale moon. No blue, no wine. */
  nightInk: {
    sky: {
      base: [[0, '#1c1b1d'], [0.5, '#161618'], [1, '#101012']],
      glows: [
        { x: 1390, y: 230, r: 780, colour: '#2b282b', alpha: 0.4 },
        { x: 1545, y: 55, r: 400, colour: '#8a6a52', alpha: 0.38 },
        { x: 1450, y: 990, r: 720, colour: '#222024', alpha: 0.35 },
        { x: 130, y: 520, r: 700, colour: '#232428', alpha: 0.36 },
      ],
    },
    ink: '#dddad6', disc: '#e9dcc6', seal: '#a8432b', wall: '#dddad6', wallAlpha: 0.2, bloom: '#cfccc8', shade: '#070708', shadeAlpha: 0.9, wash: 0.5, line: 0.8, halo: 0.12,
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

// ---------------------------------------------------------------------------------------------------------------------
// Lake stones (太湖石), drawn as the 1613 woodcuts of the 素园石谱 and the Ming painters draw them. An outline of many
// small scallops with notches between them, heavier on the side turned from the light and at the foot, thinner and here
// and there broken along the lit top. A few holes of very different sizes: each a closed loop with a second, partial
// line inside it for the thickness of its rim; the blind ones dark inside, the through ones open to whatever lies
// behind. Long grooves down the stone, short curved strokes on the shaded side of a swelling, a cluster or two of small
// rings (弹子窝). Pale grey washes, darkest in the hollows and under an overhang, and most of the stone left bare.
// The stone has no colour: by day paper white and grey ink; by night pale ink and real shadow.

/** One knot of an outline: x, y, and how far the edge from it to the next knot bulges out (positive) or is scooped in (negative). */
type Knot = [number, number, number]

interface LakeHole {
  /** Centre and half sizes in the stone's own units, and a turn in degrees. */
  x: number
  y: number
  rx: number
  ry: number
  tilt: number
  /** It goes right through: the sky, or whatever is behind the stone, shows inside it. */
  through: boolean
  form: 'oval' | 'tear' | 'kidney'
  /** The way the hole runs back into the stone, as a compass angle on the sheet (0 right, 90 down): its far opening lies
   * that way inside the near one, so the hole's wall shows on the other side, under its upper lip. */
  toward: number
}

interface LakeStone {
  knots: Knot[]
  holes: LakeHole[]
  /** The inner lines that part one lobe of the stone from the next, as a painter draws them: each starts at a notch of
   * the outline, sweeps in and ends open. The side of each turned from the light takes a band of shade. */
  contours?: number[][]
  /** Long grooves down the stone, each a run of points (x, y, x, y, ...). */
  grooves?: number[][]
  /** Short curved strokes (皴) on the shaded side of a swelling: three points each. */
  hatches?: number[][]
  /** Washes of shade just inside the outline on the side turned from the light: from one knot to another (clockwise),
   * and their width; each swells from nothing to its width and back, following the outline. */
  rims?: number[][]
  /** Clusters of small rings (弹子窝): x, y and the cluster's size. */
  rings?: number[][]
  /** Shadow under an overhang: a ring of points, washed with shade. */
  shadows?: number[][]
  /** The front edge of a flat top (a slab's lip), as a run of points. */
  lip?: number[]
  /** The hollow under that lip, at the water: a ring of points, filled with the darkness that fades into the water. */
  under?: number[]
  /** A cave mouth: a ring of points, dark inside; only its arch is drawn. */
  cave?: number[]
  /** Moss dots: x, y pairs. */
  moss?: number[]
  /** Outline edges, by the index of the knot they leave, drawn only in part: the lost edges on the lit side. */
  lost?: number[]
  /** Outline edges not drawn at all: where the stone sits on or behind another, so the pile reads as one mass. */
  seams?: number[]
  /** How white its lit side is, relative to the wall's whitewash. */
  tone: number
}

/** The light comes from the upper right, where the sun hangs. */
const LIGHT = pt(0.6, -0.8)

function lerp(a: Point, b: Point, t: number): Point {
  return pt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
}

/** How far the rim of a hole of the given form reaches at an angle round it, before the hole is turned. A tear points up,
 * a kidney is pressed in along its top. */
function holeReach(form: LakeHole['form'], angle: number, seed: number, rough = 1): number {
  const wobble = rough * (0.05 * Math.sin(3 * angle + seed) + 0.04 * Math.sin(5 * angle + seed * 1.7))
  if (form === 'tear') return 0.84 + 0.62 * Math.pow(Math.max(0, -Math.sin(angle)), 4) + wobble
  if (form === 'kidney') return 1.04 - 0.4 * Math.pow(Math.max(0, -Math.sin(angle)), 2) + wobble
  return 1 + 0.08 * Math.sin(2 * angle + seed) + wobble
}

/** The rim of a hole, `k` of its size, its centre moved `shift` units toward where it runs back. */
function holeRing(hole: LakeHole, place: (x: number, y: number) => Point, k: number, shift: number, seed: number, from = 0, to = Math.PI * 2, steps = 12): Point[] {
  const tilt = (hole.tilt * Math.PI) / 180
  const toward = (hole.toward * Math.PI) / 180
  const cx = hole.x + Math.cos(toward) * shift
  const cy = hole.y + Math.sin(toward) * shift
  const points: Point[] = []
  const closed = to - from >= Math.PI * 2 - 0.001
  for (let index = 0; index < (closed ? steps : steps + 1); index += 1) {
    const angle = from + ((to - from) * index) / steps
    // A big hole's rim is worn more unevenly than a small one's.
    const reach = holeReach(hole.form, angle, seed, Math.min(hole.rx, hole.ry) > 8 ? 2.2 : 1) * k
    const x = Math.cos(angle) * hole.rx * reach
    const y = Math.sin(angle) * hole.ry * reach
    points.push(place(cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)))
  }
  return points
}

/** A small ring as a path: two half circles. */
function ringAt(x: number, y: number, r: number): string {
  return `M${round(x - r)} ${round(y)}a${round(r)} ${round(r)} 0 1 0 ${round(2 * r)} 0a${round(r)} ${round(r)} 0 1 0 ${round(-2 * r)} 0`
}

/** A band of shade along an inner contour, on its side turned from the light: widest near the notch it starts from,
 * gone at its open end. */
function contourBand(points: Point[], width: number): string {
  const a = points[0]
  const b = points[points.length - 1]
  if (!a || !b || points.length < 3) return ''
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 1
  let nx = -dy / length
  let ny = dx / length
  if (nx * LIGHT.x + ny * LIGHT.y > 0) {
    nx = -nx
    ny = -ny
  }
  const last = points.length - 1
  const offset = points.map((point, index) => {
    const reach = width * (index === last ? 0 : index === 0 ? 0.75 : 1 - (0.45 * (index - 1)) / Math.max(1, last - 1))
    return pt(point.x + nx * reach, point.y + ny * reach)
  })
  return smoothPath(points) + 'L' + smoothPath(offset.reverse()).slice(1) + 'Z'
}

/** One lake stone. `place` takes the stone's own units to the sheet (a plain scale and shift, so its proportions hold);
 * `scale` is that scale, for line widths, bands and the size below which a hole is only a pit. `pen` is the paint of its
 * lines (the ink, or a gradient that lets them fade into the water) and `underPaint` the fill of the hollow under its lip
 * and of a cave mouth. */
function lakeStone(
  stock: Stock,
  id: string,
  stone: LakeStone,
  place: (x: number, y: number) => Point,
  scale: number,
  pen: string,
  underPaint: string,
  weight = 1,
  glow?: { from: Point; colour: string; cover: number },
): Built {
  const salt = id.charCodeAt(0) * 7 + id.charCodeAt(id.length - 1)
  // Each long convex edge is broken into two to four smaller scallops of unequal size, with a small notch where they meet:
  // the lobed, cloud-like edge of a water-worn stone (the 素园石谱 draws it so), never one long even arc. Bays and seams stay
  // whole. `parent` keeps the knot each new edge came from, so seams, lost edges and rim washes still find their edges.
  const given = stone.knots.map(knot => place(knot[0], knot[1]))
  let givenArea = 0
  given.forEach((a, index) => {
    const b = given[(index + 1) % given.length]
    if (b) givenArea += a.x * b.y - b.x * a.y
  })
  const givenTurn = givenArea > 0 ? 1 : -1
  const knots: Knot[] = []
  const parent: number[] = []
  const firstOf: number[] = []
  given.forEach((a, index) => {
    const b = given[(index + 1) % given.length]
    const bulge = stone.knots[index]?.[2] ?? 0
    firstOf.push(knots.length)
    if (!b) return
    const dx = b.x - a.x
    const dy = b.y - a.y
    const length = Math.hypot(dx, dy) || 1
    const pieces = bulge < -0.04 || (stone.seams ?? []).includes(index) ? 1 : Math.max(1, Math.min(5, Math.round(length / (7 + 3 * scale))))
    if (pieces === 1) {
      knots.push([a.x, a.y, bulge])
      parent.push(index)
      return
    }
    const c = pt((a.x + b.x) / 2 + ((dy * givenTurn) / length) * length * bulge, (a.y + b.y) / 2 + ((-dx * givenTurn) / length) * length * bulge)
    let t = 0
    for (let piece = 0; piece < pieces; piece += 1) {
      const u = 1 - t
      // Each scallop is pushed a little in or out of the parent curve, and now and then one is a shallow bite instead of a
      // swelling: the edge goes hollow then bulging, never one even run of beads.
      const jog = piece === 0 ? 0 : (hashUnit(index * 11 + piece, salt + 6) - 0.5) * (1.4 + 0.9 * scale)
      const bite = piece > 0 && hashUnit(index * 13 + piece, salt + 9) < 0.2
      knots.push([
        u * u * a.x + 2 * u * t * c.x + t * t * b.x + ((dy * givenTurn) / length) * jog,
        u * u * a.y + 2 * u * t * c.y + t * t * b.y + ((-dx * givenTurn) / length) * jog,
        bite ? -0.07 : 0.12 + 0.3 * hashUnit(index * 7 + piece, salt + 5),
      ])
      parent.push(index)
      t = Math.min(0.94, t + (1 + 0.55 * (hashUnit(index * 5 + piece, salt + 3) - 0.5)) / pieces)
    }
  })
  const points = knots.map(knot => pt(knot[0], knot[1]))
  const count = points.length
  let area = 0
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  points.forEach((a, index) => {
    const b = points[(index + 1) % count]
    if (!b) return
    area += a.x * b.y - b.x * a.y
    minX = Math.min(minX, a.x)
    maxX = Math.max(maxX, a.x)
    minY = Math.min(minY, a.y)
    maxY = Math.max(maxY, a.y)
  })
  const turn = area > 0 ? 1 : -1
  const first = points[0]
  let outline = first ? `M${at(first)}` : ''
  let hollows = ''
  const lost = (stone.lost ?? []).flatMap(edge => parent.flatMap((from, index) => (from === edge ? [index] : [])))
  const seams = (stone.seams ?? []).flatMap(edge => parent.flatMap((from, index) => (from === edge ? [index] : [])))
  const controls: Point[] = []
  for (let index = 0; index < count; index += 1) {
    const a = points[index]
    const b = points[(index + 1) % count]
    if (!a || !b) continue
    const dx = b.x - a.x
    const dy = b.y - a.y
    const length = Math.hypot(dx, dy) || 1
    const normal = pt((dy * turn) / length, (-dx * turn) / length)
    const bulge = knots[index]?.[2] ?? 0
    const control = pt((a.x + b.x) / 2 + normal.x * length * bulge, (a.y + b.y) / 2 + normal.y * length * bulge)
    controls.push(control)
    outline += `Q${at(control)} ${at(b)}`
    if (bulge < -0.1) {
      // A bay in the outline: a crescent of shade just inside it, deepest at its middle.
      const deep = pt(control.x - normal.x * length * 0.24, control.y - normal.y * length * 0.24)
      hollows += `M${at(a)}Q${at(control)} ${at(b)}Q${at(deep)} ${at(a)}Z`
    }
  }
  outline += 'Z'

  // The painter's line round the stone (勾), one brush band per run of it: heavy where the edge turns from the light and along
  // the foot, thin where it faces the light, swelling where it turns into a notch (顿), and broken along the lit top, where
  // the light eats the edge. Seams (where a stone sits on or behind another) are left open.
  const height = maxY - minY || 1
  const lightDir = glow
    ? (() => {
        const dx = glow.from.x - (minX + maxX) / 2
        const dy = glow.from.y - (minY + maxY) / 2
        const length = Math.hypot(dx, dy) || 1
        return pt(dx / length, dy / length)
      })()
    : LIGHT
  const notch = points.map((here, index) => {
    const cin = controls[(index + count - 1) % count]
    const cout = controls[index]
    if (!cin || !cout) return false
    const ix = here.x - cin.x
    const iy = here.y - cin.y
    const ox = cout.x - here.x
    const oy = cout.y - here.y
    const size = (Math.hypot(ix, iy) || 1) * (Math.hypot(ox, oy) || 1)
    return ((ix * oy - iy * ox) * turn) / size < -0.22
  })
  // On a dark sheet the line is paler than the stone: it is the light catching the edge, so it is heavy on the lit side.
  const rimLit = !!stock.paint && luma(stock.paint.stoneLine) > luma(stock.paint.stone)
  const quad = (a: Point, c: Point, b: Point, t: number): { at: Point; normal: Point } => {
    const u = 1 - t
    const tx = 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x)
    const ty = 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y)
    const size = Math.hypot(tx, ty) || 1
    return { at: pt(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y), normal: pt((ty * turn) / size, (-tx * turn) / size) }
  }
  // Which part of each edge is drawn: all of it, a piece of it (a lit edge, broken), or none (a seam).
  const spans: Array<[number, number] | null> = []
  for (let index = 0; index < count; index += 1) {
    const a = points[index]
    const b = points[(index + 1) % count]
    const c = controls[index]
    if (!a || !b || !c || seams.includes(index)) {
      spans.push(null)
      continue
    }
    const mid = quad(a, c, b, 0.5).normal
    const facing = mid.x * lightDir.x + mid.y * lightDir.y
    const pick = hashUnit(index, salt + 13)
    if (lost.includes(index)) spans.push([0, 0.3])
    else if ((rimLit ? -facing : facing) > 0.4) spans.push(pick < 0.4 ? [0, 0.48 + 0.2 * hashUnit(index, salt + 14)] : pick < 0.75 ? [0.28 + 0.14 * hashUnit(index, salt + 15), 1] : [0, 0.84])
    else spans.push([0, 1])
  }
  let begin = 0
  for (let index = 0; index < count; index += 1) {
    const before = spans[(index + count - 1) % count]
    const here = spans[index]
    if (!before || before[1] < 1 || (here && here[0] > 0)) {
      begin = index
      break
    }
  }
  let brush = ''
  let runPoints: Point[] = []
  let runWidths: number[] = []
  let sample = 0
  const flush = (): void => {
    const total = runPoints.length
    if (total >= 2) {
      // The brush goes down and lifts off: the band thins to a point at both ends of the run.
      const along: number[] = [0]
      for (let index = 1; index < total; index += 1) {
        const a = runPoints[index - 1]
        const b = runPoints[index]
        along.push((along[index - 1] ?? 0) + (a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 0))
      }
      const whole = along[total - 1] ?? 0
      const reach = 2.2 + 2.2 * scale
      brush += ribbon(runPoints, runWidths.map((width, index) => width * Math.max(0.12, Math.min(1, (along[index] ?? 0) / reach, (whole - (along[index] ?? 0)) / reach))))
    }
    runPoints = []
    runWidths = []
  }
  for (let step = 0; step < count; step += 1) {
    const index = (begin + step) % count
    const span = spans[index]
    const a = points[index]
    const b = points[(index + 1) % count]
    const c = controls[index]
    if (!span || !a || !b || !c) {
      flush()
      continue
    }
    const [t0, t1] = span
    if (t0 > 0) flush()
    const length = Math.hypot(b.x - a.x, b.y - a.y) * (t1 - t0)
    const steps = Math.max(2, Math.min(6, Math.round(length / (3.2 + 2.4 * scale))))
    for (let part = runPoints.length && t0 === 0 ? 1 : 0; part <= steps; part += 1) {
      const t = t0 + ((t1 - t0) * part) / steps
      const { at: here, normal } = quad(a, c, b, t)
      const facing = normal.x * lightDir.x + normal.y * lightDir.y
      const dark = Math.max(0, Math.min(1, ((rimLit ? facing + 0.1 : 0.3 - facing)) / 1.1))
      const low = Math.max(0, Math.min(1, (here.y - (maxY - 0.2 * height)) / (0.2 * height)))
      const accent = 1 + 0.36 * (notch[index] ? Math.max(0, 1 - 3 * t) : 0) + 0.36 * (notch[(index + 1) % count] ? Math.max(0, 1 - 3 * (1 - t)) : 0)
      const wobble = 0.8 + 0.4 * noise(sample * 0.8, salt + 31)
      sample += 1
      runPoints.push(here)
      runWidths.push((0.38 + 1.6 * Math.pow(dark, 1.3) + (normal.y > -0.4 && !rimLit ? 0.6 * low : 0)) * accent * wobble * weight)
    }
    if (t1 < 1) flush()
  }
  flush()

  // The holes. A pit is a small loop, lightly washed. A hole has its near rim and its far opening (`k` of its size, moved
  // toward where it runs back); between them its wall, darkest under the upper lip; a line along the far opening on the
  // wall's side. A blind hole's floor is a lighter grey than that wall, so it never reads as a dark pupil in a pale iris.
  let cuts = ''
  let walls = ''
  let floors = ''
  let pits = ''
  let rims = ''
  let inner = ''
  stone.holes.forEach((hole, index) => {
    const seed = index * 1.9 + 0.7
    const near = smoothRing(holeRing(hole, place, 1, 0, seed))
    if (Math.min(hole.rx, hole.ry) * scale < 2.6) {
      pits += near
      return
    }
    // A hole that goes through has a wide far opening pushed against its near rim on the side it runs back to, so its wall is
    // a crescent on one side only (a passage, not a ring round a pupil), and only that side's lip is drawn.
    const k = hole.through ? 0.76 : 0.6
    const shift = (1 - k) * Math.min(hole.rx, hole.ry) * (hole.through ? 1.05 : 0.9)
    const far = smoothRing(holeRing(hole, place, k, shift, seed))
    const wallSide = ((hole.toward + 180 - hole.tilt) * Math.PI) / 180
    rims += hole.through ? smoothPath(holeRing(hole, place, 1, 0, seed, wallSide - 1.3, wallSide + 1.3, 8)) : near
    walls += near + far
    if (hole.through) cuts += far
    else floors += far
    const centre = ((hole.toward + 180 - hole.tilt) * Math.PI) / 180
    inner += smoothPath(holeRing(hole, place, k, shift, seed, centre - 1.35, centre + 1.35, 6))
  })

  const run = (values: number[]): Point[] => pairs(values).map(point => place(point.x, point.y))
  // The washes inside the outline on its shaded side: the outline's own arcs, then back along a line set in from them.
  let rimWash = ''
  for (const rim of stone.rims ?? []) {
    const from = firstOf[rim[0] ?? 0] ?? 0
    const to = firstOf[rim[1] ?? 0] ?? 0
    const width = (rim[2] ?? 4) * scale
    const edges: number[] = []
    for (let index = from; index !== to && edges.length < count; index = (index + 1) % count) edges.push(index)
    const start = points[from]
    if (!start || !edges.length) continue
    let d = `M${at(start)}`
    const inside: Point[] = []
    edges.forEach((edge, order) => {
      const a = points[edge]
      const b = points[(edge + 1) % count]
      const c = controls[edge]
      if (!a || !b || !c) return
      d += `Q${at(c)} ${at(b)}`
      for (let step = 0; step < 4; step += 1) {
        const t = step / 4
        const u = 1 - t
        const on = pt(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y)
        const tx = 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x)
        const ty = 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y)
        const size = Math.hypot(tx, ty) || 1
        const reach = width * Math.pow(Math.sin((Math.PI * (order + t)) / edges.length), 0.6)
        inside.push(pt(on.x - ((ty * turn) / size) * reach, on.y + ((tx * turn) / size) * reach))
      }
    })
    const end = points[to]
    if (end) inside.push(end)
    rimWash += d + 'L' + inside.reverse().map(at).join('L') + 'Z'
  }
  let bands = ''
  for (const contour of stone.contours ?? []) {
    const line = run(contour)
    const path = spline(line, 3)
    const last = Math.max(1, path.length - 1)
    brush += ribbon(path, path.map((_, index) => (0.25 + 1.05 * Math.pow(1 - index / last, 0.9)) * weight * (0.85 + 0.3 * hashUnit(index, salt + 41))))
    bands += contourBand(line, 5 * scale + 0.6)
  }
  let texture = ''
  for (const groove of stone.grooves ?? []) texture += smoothPath(run(groove))
  for (const hatch of stone.hatches ?? []) {
    const [a, c, b] = run(hatch)
    if (a && c && b) texture += `M${at(a)}Q${at(c)} ${at(b)}`
  }
  // Each cluster is turned its own way and some lose a ring, so no two read as the same stamp.
  let rings = ''
  ;(stone.rings ?? []).forEach((ring, order) => {
    const centre = place(ring[0] ?? 0, ring[1] ?? 0)
    const size = (ring[2] ?? 1) * scale
    const angle = hashUnit(order, salt + 7) * Math.PI * 2
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const offsets: Array<[number, number, number]> = [[0, 0, 1.25], [2.9, -1.5, 0.95], [1.4, 2.6, 1.05], [-2.5, 1.7, 0.8]]
    offsets.forEach(([ox, oy, r], k) => {
      if (k === 3 && hashUnit(order, salt + 8) < 0.5) return
      rings += ringAt(centre.x + (ox * c - oy * s) * size, centre.y + (ox * s + oy * c) * size, r * size)
    })
  })
  let shadows = ''
  for (const shadow of stone.shadows ?? []) shadows += smoothRing(run(shadow))
  // Moss dots (苔点) go on in small clusters: one dab and one or two lesser dots beside it, never one even dash.
  let moss = ''
  let mossSmall = ''
  run(stone.moss ?? []).forEach((dot, index) => {
    moss += `M${at(dot)}h${round((0.5 + 0.9 * hashUnit(index, salt)) * scale + 0.2)}`
    mossSmall += `M${round(dot.x + (2.6 + 1.4 * hashUnit(index, salt + 1)) * scale)} ${round(dot.y + (0.6 - 1.6 * hashUnit(index, salt + 2)) * scale)}h0.1`
    if (hashUnit(index, salt + 3) > 0.35) mossSmall += `M${round(dot.x - (2.2 + 1.2 * hashUnit(index, salt + 4)) * scale)} ${round(dot.y + (0.3 + hashUnit(index, salt + 5)) * scale)}h0.1`
  })

  const p = stock.paint
  // Where the light comes from across the stone: the sun at the upper right, or (by night, for the rockery) the lit pavilion.
  const centreX = (minX + maxX) / 2
  const centreY = (minY + maxY) / 2
  // By day the light falls across the stone from the right a little above its middle, so the head is not singled out.
  let lx1 = maxX
  let ly1 = minY + (maxY - minY) * 0.36
  let lx2 = minX
  let ly2 = minY + (maxY - minY) * 0.6
  if (glow) {
    const dx = glow.from.x - centreX
    const dy = glow.from.y - centreY
    const length = Math.hypot(dx, dy) || 1
    const reach = Math.max(maxX - minX, maxY - minY) * 0.55
    lx1 = centreX + (dx / length) * reach
    ly1 = centreY + (dy / length) * reach
    lx2 = centreX - (dx / length) * reach
    ly2 = centreY - (dy / length) * reach
  }
  const litColour = glow ? glow.colour : p ? p.stoneLit : stock.wall
  const litCover = glow ? glow.cover : p ? p.stoneLitAlpha * stone.tone : stock.wallAlpha * stone.tone
  const defs =
    `<path id="${id}" fill-rule="evenodd" d="${outline}${cuts}"/>` +
    // Paper white where the stone turns to the light, fading out across it; the rest of it is the bare sheet.
    `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${round(lx1)}" y1="${round(ly1)}" x2="${round(lx2)}" y2="${round(ly2)}">` +
    `<stop offset="0" stop-color="${litColour}" stop-opacity="${share(litCover)}"/><stop offset="${glow ? 0.17 : p ? 0.34 : 0.42}" stop-color="${litColour}" stop-opacity="0"/>` +
    (p ? `<stop offset="1" stop-color="${p.stoneWash}" stop-opacity="${share(0.3 * p.stoneWashAlpha)}"/>` : '') +
    '</linearGradient>'
  // Forms are washed in the cool shade, hollows in the dark of a hollow (by day both cool grey, never a colour).
  const shade = (d: string, strength: number, extra = ''): string =>
    d ? `<path d="${d}" fill="${p ? p.stoneWash : stock.shade}" fill-opacity="${share(strength * (p ? p.stoneWashAlpha : stock.shadeAlpha))}"${extra}/>` : ''
  const deep = (d: string, strength: number, extra = ''): string =>
    d ? `<path d="${d}" fill="${p ? p.hollow : stock.shade}" fill-opacity="${share(strength * (p ? p.hollowAlpha : stock.shadeAlpha))}"${extra}/>` : ''
  const line = (d: string, width: number, strength: number): string =>
    d ? `<path d="${d}" stroke="${pen}" stroke-width="${round(width * weight * 100) / 100}" stroke-opacity="${share(strength * stock.line)}"/>` : ''
  const lip = stone.lip ? smoothPath(run(stone.lip)) : ''
  const under = stone.under ? smoothRing(run(stone.under)) : ''
  const cavePoints = stone.cave ? run(stone.cave) : []
  const cave = cavePoints.length ? smoothPath(cavePoints) + 'Z' : ''
  const arch = cavePoints.length > 4 ? smoothPath(cavePoints.slice(1, -1)) : ''
  const markup =
    (under ? `<path d="${under}" fill="${underPaint}"/>` : '') +
    // The body: by day an opaque pale cool grey (lake stone has no colour); on the old ink sheets a piece of sky a little greyed.
    (p
      ? `<use href="#${id}" fill="${p.stone}"/>`
      : skyPaintedShape(id, stock.sky) + `<use href="#${id}" fill="${stock.ink}" fill-opacity="${share(0.11 * stock.wash)}"/>`) +
    `<use href="#${id}" fill="url(#${id}g)"/>` +
    shade(rimWash, p ? 0.17 : 0.13) +
    shade(bands + hollows + shadows, p ? 0.15 : 0.12) +
    deep(walls, p ? 0.27 : 0.4, ' fill-rule="evenodd"') +
    deep(floors, 0.18) +
    deep(pits, 0.26) +
    (cave ? `<path d="${cave}" fill="url(#rc)"/>` : '') +
    line(texture, 0.65, rimLit ? 0.4 : 0.52) +
    line(rings, 0.5, 0.42) +
    // By night a hole through the stone shows the dark air: its lip is only touched, so it stays a void in the stone and does
    // not become a pale ring round a dark pupil.
    line(inner, 0.6, rimLit ? 0.3 : 0.5) +
    line(rims, 0.65, rimLit ? 0.32 : 0.6) +
    line(pits, 0.6, 0.42) +
    line(lip, 1.3, 0.68) +
    line(arch, 1.3, 0.72) +
    (brush ? `<path d="${brush}" fill="${pen}" fill-opacity="${share((rimLit ? 0.66 : 0.84) * stock.line)}"/>` : '') +
    (moss ? `<path d="${moss}" stroke="${pen}" stroke-width="${round(2.1 * weight * 10) / 10}" stroke-opacity="${share(0.72 * stock.line)}"/>` : '') +
    (mossSmall ? `<path d="${mossSmall}" stroke="${pen}" stroke-width="${round(1.3 * weight * 10) / 10}" stroke-opacity="${share(0.66 * stock.line)}"/>` : '')
  return { defs, markup }
}

function pairs(values: number[]): Point[] {
  const points: Point[] = []
  for (let index = 0; index + 1 < values.length; index += 2) points.push(pt(values[index] ?? 0, values[index + 1] ?? 0))
  return points
}

// The peak in the pond (立峰), after the Lingering Garden's 冠云峰 (as the 1998 survey drawing has it: a column of lumps stacked
// a little to one side and the other, notched where they meet, holed from top to foot) and the 晚翠峰 of its stone-grove court,
// within the rules of 园冶 (上大下小): top-heavy, its head about twice the width of its waist and leaning out to the right, past
// the foot by about a fifth of its height. The head is three lumps, not one dome: a lower one at its back, the crest high and
// left of the middle, and the overhang, whose end curls down and whose underside steps back to the neck in a bite and a
// hollow; the neck runs down from there on a slant, so nothing reads as a cap on a stalk. Below, a waist about half the head's
// width, the body's lumps, a short blunt arm thrust out to the left, and the foot. One large hole goes through the head at its
// back, left of the middle, the sky in it; a lesser one through the stone below it on the same passage (漏); then a slot, a
// hollow under the arm, a small hole low down and a few pits, all of different sizes and shapes, no two level with each other.
// No line runs over a hole as a brow would. The foot is not set on a slab: it goes down into the water among small stones and
// the lotus. In a box about 150 wide and 252 tall.
const PEAK: LakeStone = {
  knots: [
    // The head: its back at the left in two lumps; the crown rising to its high point left of the middle and falling away to
    // the right in uneven steps (one shallow notch) into the overhang; the overhang's outer face in lumps, its end curling down;
    // its underside stepping back to the neck in a bite and a hollow, so it is not a ledge.
    [48, 44, 0.2], [44, 30, 0.22], [56, 12, 0.18], [70, 3, 0.14], [84, 6, 0.2], [93, 15, 0.16], [106, 12, 0.2], [118, 18, 0.22],
    [130, 24, 0.2], [142, 36, 0.26], [148, 54, 0.2], [147, 70, 0.28], [140, 86, 0.3], [128, 88, -0.05], [120, 84, 0.2], [112, 92, -0.16],
    [104, 104, 0.18], [100, 114, 0.1], [94, 120, 0.2],
    // The waist, then the body: lumps jutting a little to one side and the other, notched where they meet, down to the water.
    [96, 134, 0.18], [90, 140, 0.22], [98, 152, 0.2], [100, 166, 0.14], [94, 176, 0.2], [96, 188, 0.22], [92, 198, -0.08], [97, 208, 0.18],
    [95, 222, 0.16], [88, 230, 0.2], [94, 242, 0.12], [88, 252, 0.04],
    // The foot; the lower lumps at the left, one thrust out in a blunt arm; the waist; the head's lower lumps at the back.
    [24, 252, 0.22], [30, 240, 0.18], [26, 230, -0.1], [32, 222, 0.24], [20, 212, 0.26], [12, 198, 0.22], [16, 186, 0.2], [26, 182, -0.12],
    [34, 176, 0.2], [30, 164, 0.22], [38, 152, -0.08], [40, 140, 0.2], [46, 132, -0.12], [46, 120, 0.22], [40, 108, 0.2], [44, 96, -0.06],
    [38, 84, 0.24], [42, 70, 0.18], [38, 58, 0.2],
  ],
  holes: [
    // The big hole, through the head's lower part at its back, left of the middle: its wall seen on its lower left only, and a
    // flute running down out of it. The others make a chain of different sizes and shapes down and across the body.
    { x: 64, y: 64, rx: 12, ry: 18, tilt: 24, through: true, form: 'kidney', toward: 320 },
    // A lesser hole through the stone below it, on the same passage (漏): the two read as a way the water ran down the stone.
    { x: 54, y: 104, rx: 5.2, ry: 7.4, tilt: 12, through: true, form: 'tear', toward: 300 },
    { x: 76, y: 118, rx: 3.4, ry: 8, tilt: -10, through: false, form: 'tear', toward: 100 },
    { x: 26, y: 200, rx: 4.6, ry: 3, tilt: -16, through: false, form: 'kidney', toward: 70 },
    { x: 60, y: 233, rx: 4, ry: 5, tilt: 12, through: true, form: 'oval', toward: 60 },
    { x: 84, y: 170, rx: 2.6, ry: 4, tilt: 8, through: false, form: 'oval', toward: 100 },
    { x: 70, y: 198, rx: 1.7, ry: 2.2, tilt: -10, through: false, form: 'oval', toward: 90 },
    { x: 44, y: 244, rx: 2, ry: 1.6, tilt: 0, through: false, form: 'oval', toward: 90 },
  ],
  contours: [
    // Short partings, each from its notch: the crest from the overhang; the overhang's outer lobes; its end from its underside;
    // each lump of the body from the next; below the big hole, never above it.
    [93, 15, 94, 24, 92, 30],
    [94, 120, 88, 124, 86, 132],
    [90, 140, 83, 146, 80, 154],
    [94, 176, 87, 180, 84, 188],
    [92, 198, 85, 202, 83, 210],
    [88, 230, 80, 233, 76, 240],
    [26, 230, 34, 233, 40, 238],
    [26, 182, 34, 186, 40, 192],
    [38, 152, 46, 156, 50, 162],
    [46, 132, 53, 136, 56, 144],
    [44, 96, 52, 98, 56, 104],
  ],
  grooves: [
    [60, 84, 58, 92, 56, 96],
    [52, 114, 50, 124, 52, 134],
    [66, 150, 64, 168, 66, 186],
    [100, 26, 108, 33, 113, 42],
    [120, 30, 129, 39, 134, 50],
    [128, 56, 133, 64, 134, 74],
    [52, 26, 54, 38],
  ],
  // Short curved strokes in small groups, on the side of each swelling turned from the light (皴): the back of the head, the
  // underside of the overhang, the shaded side of each lump of the body.
  hatches: [
    [46, 36, 43, 41, 44, 47], [44, 46, 41, 51, 42, 57],
    [42, 74, 40, 80, 42, 86],
    [126, 80, 120, 81, 116, 85], [118, 88, 113, 90, 110, 95],
    [42, 112, 40, 118, 42, 124],
    [36, 156, 34, 162, 35, 168], [32, 164, 30, 170, 32, 176],
    [24, 204, 22, 210, 24, 216], [16, 190, 19, 194, 23, 196],
    [30, 228, 28, 234, 30, 240],
    [86, 150, 83, 156, 84, 162],
  ],
  rings: [[106, 50, 0.75], [66, 180, 0.7]],
  rims: [[31, 36, 6], [36, 41, 5], [41, 45, 6], [45, 49, 6], [49, 3, 6], [12, 18, 6]],
  shadows: [
    // On the neck, under the overhang: the shade it throws down the slant.
    [112, 93, 106, 102, 101, 113, 96, 111, 101, 101, 108, 92],
    // The foot, where it goes down into the water.
    [24, 251, 88, 251, 86, 244, 70, 242, 52, 245, 36, 241, 26, 245],
  ],
  under: [24, 251, 40, 250, 62, 252, 80, 250, 88, 251, 92, 255, 76, 258, 56, 256, 36, 259, 20, 256],
  moss: [93, 15.5, 70, 3.5, 30, 246, 90, 140.5, 26, 182.5],
  seams: [30],
  tone: 0.9,
}

/** A low companion stone at the left of the foot, leaning out over the water, lobed; a hollow low on its side. */
const PEAK_COMPANION: LakeStone = {
  knots: [[-14, 238, 0.22], [-8, 224, 0.26], [4, 214, 0.2], [16, 216, -0.16], [22, 222, 0.28], [30, 238, 0.12], [30, 251, 0.04], [-2, 252, 0.08], [-12, 248, 0.16]],
  holes: [{ x: 8, y: 239, rx: 3.6, ry: 2.6, tilt: -12, through: false, form: 'kidney', toward: 90 }],
  contours: [[16, 216, 18, 226, 20, 234]],
  rings: [[-2, 228, 0.6]],
  under: [-2, 251.5, 30, 251.5, 32, 256, 12, 258.5, -6, 256],
  seams: [6],
  tone: 0.9,
}

/** A small lump in front of the foot at the right, half in the water. */
const PEAK_FRONT: LakeStone = {
  knots: [[70, 252, 0.08], [72, 242, 0.24], [84, 235, 0.18], [96, 238, -0.14], [104, 236, 0.26], [114, 246, 0.12], [113, 253, 0]],
  holes: [{ x: 97, y: 246, rx: 1.9, ry: 1.5, tilt: 0, through: false, form: 'oval', toward: 90 }],
  under: [70, 252, 113, 252.5, 112, 257, 90, 259, 70, 256],
  seams: [6],
  tone: 0.85,
}

/** A pebble of a stone further right, under the overhang. */
const PEAK_PEBBLE: LakeStone = {
  knots: [[118, 254, 0.1], [120, 246, 0.22], [130, 240, 0.16], [138, 243, 0.22], [142, 252, 0.04], [140, 255, 0]],
  holes: [],
  under: [118, 253.5, 142, 253.5, 140, 258, 126, 258.5],
  seams: [5],
  tone: 0.8,
}

/** The peak and the small stones at its foot, the foot of the peak at (footX, footY). */
function pondPeak(stock: Stock, footX: number, footY: number, size: number): Built {
  const place = (x: number, y: number): Point => pt(footX + (x - 61) * size, footY + (y - 240) * size)
  const parts = [
    lakeStone(stock, 'pk', PEAK, place, size, stock.ink, 'url(#lu)'),
    lakeStone(stock, 'pf', PEAK_FRONT, place, size, stock.ink, 'url(#lu)', 0.85),
    lakeStone(stock, 'pc', PEAK_COMPANION, place, size, stock.ink, 'url(#lu)', 0.9),
    lakeStone(stock, 'pp', PEAK_PEBBLE, place, size, stock.ink, 'url(#lu)', 0.85),
  ]
  const top = place(0, 250).y
  const defs =
    parts.map(part => part.defs).join('') +
    // The hollows under the stones at the water, darkest at the stone and gone a few units down in it.
    `<linearGradient id="lu" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(place(0, 259).y)}">` +
    `<stop offset="0" stop-color="${stock.shade}" stop-opacity="${share(0.5 * stock.shadeAlpha)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="0"/></linearGradient>`
  return { defs, markup: parts.map(part => part.markup).join('') }
}

// The rockery under the pavilion (池山), piled from lake stones in rough level courses rather than set in a row: one main
// mass, high, at the right, stacked from two stones (the upper one big above and small below, its crown broken by a notch
// and curling over on the right, a hole through it low on its shaded side); a lower tip in front of the pavilion and a lower
// one still at its corner, at uneven heights and spacing; flat stones at the water whose lips hang over a dark hollow; a
// low, wide cave mouth at the waterline under the main mass. Every outline is unequal lobes with notches between them. Where
// one stone sits on or behind another the line between them is left out. All in sheet units.
const ROCKERY_BACK: LakeStone[] = [
  // The main mass, its lower course, down to the water: a broad stone whose top the upper stone sits on, notched at its ends,
  // with a low, uneven cave the water has eaten in under it. No hole above the cave.
  {
    knots: [
      [1514, 856, 0.08], [1512, 842, 0.24], [1518, 831, -0.1], [1514, 820, 0.22], [1521, 810, 0.16], [1533, 805, 0.1],
      [1548, 808, 0.08], [1562, 804, 0.06], [1578, 807, 0.06], [1592, 803, 0.16], [1605, 808, 0.2], [1609, 820, 0.18], [1604, 830, -0.14],
      [1610, 842, 0.1], [1610, 856, 0],
    ],
    holes: [
      { x: 1590, y: 820, rx: 1.6, ry: 2, tilt: 0, through: false, form: 'oval', toward: 90 },
      { x: 1530, y: 841, rx: 1.4, ry: 1.2, tilt: 0, through: false, form: 'oval', toward: 90 },
    ],
    // Low and wide, its roof uneven: a mouth the water has eaten in under the stone.
    cave: [1534, 857, 1538, 850, 1546, 846, 1553, 847, 1560, 844, 1569, 846, 1577, 850, 1582, 857],
    contours: [[1518, 831, 1527, 834, 1531, 842], [1604, 830, 1597, 834, 1594, 842]],
    grooves: [[1528, 814, 1526, 828], [1594, 812, 1596, 826]],
    hatches: [[1521, 840, 1519, 846, 1521, 852]],
    rings: [[1600, 846, 0.6]],
    rims: [[0, 4, 4]],
    moss: [1531, 806.5],
    seams: [5, 6, 7, 8, 14],
    tone: 0.32,
  },
  // Its upper stone, the high point: big above and small below, its crown broken by notches into unequal swellings, its left
  // side bitten by a cleft, its right side notched. No round hole: only a dark crack and a few pits.
  {
    knots: [
      [1538, 806, 0.14], [1534, 794, 0.22], [1541, 783, -0.12], [1533, 772, 0.24], [1538, 760, 0.18], [1535, 750, 0.2], [1545, 742, 0.12],
      [1553, 746, -0.16], [1560, 736, 0.22], [1572, 737, 0.14], [1578, 731, 0.2], [1590, 736, 0.12], [1597, 733, 0.22], [1607, 744, 0.2],
      [1610, 756, 0.12], [1603, 765, -0.18], [1609, 778, 0.22], [1601, 792, 0.18], [1594, 805, 0.06], [1550, 809, -0.06],
    ],
    holes: [
      { x: 1588, y: 752, rx: 1.4, ry: 1.8, tilt: 0, through: false, form: 'oval', toward: 90 },
      { x: 1556, y: 778, rx: 1.6, ry: 1.3, tilt: 0, through: false, form: 'oval', toward: 90 },
    ],
    contours: [[1541, 783, 1550, 786, 1555, 793], [1553, 746, 1556, 755, 1555, 764], [1603, 765, 1596, 770, 1593, 778]],
    grooves: [[1568, 752, 1566, 768, 1568, 784], [1584, 760, 1586, 776, 1584, 790]],
    hatches: [[1537, 766, 1535, 772, 1537, 778], [1538, 794, 1536, 799, 1538, 804], [1600, 782, 1598, 788, 1599, 794]],
    rims: [[0, 3, 4], [15, 17, 3]],
    rings: [[1592, 768, 0.7]],
    // The dark joint where it sits on the lower stone.
    shadows: [[1546, 805, 1566, 809, 1586, 804, 1590, 808, 1568, 813, 1544, 809]],
    moss: [1560, 736.5, 1597, 733.5],
    seams: [18, 19],
    tone: 0.5,
  },
]

const ROCKERY_FRONT: LakeStone[] = [
  // Under the pavilion's corner, beside the steps: the lowest stone, low and wider than it is tall, its top rising to the right
  // in two swellings with a notch between; clefts open from its notches, and no hole.
  {
    knots: [
      [1427, 846, 0.06], [1425, 838, 0.22], [1431, 832, 0.14], [1440, 830, -0.12], [1446, 824, 0.2], [1458, 821, 0.12], [1468, 822, 0.18],
      [1477, 828, 0.16], [1475, 835, -0.12], [1480, 841, 0.12], [1480, 846, 0],
    ],
    holes: [{ x: 1436, y: 838, rx: 1.5, ry: 1.2, tilt: 0, through: false, form: 'oval', toward: 90 }],
    contours: [[1440, 830, 1444, 836, 1443, 842], [1475, 835, 1468, 838, 1465, 843]],
    hatches: [[1429, 837, 1428, 841, 1430, 845]],
    rings: [[1462, 829, 0.55]],
    rims: [[0, 3, 3]],
    moss: [1446, 824.5],
    seams: [10],
    tone: 0.42,
  },
  // In front of the pavilion, under its right-hand column: the second stone, wider than tall, its top tilted and broken by a
  // notch, bays eaten into both sides; clefts from its notches and two pits, no hole.
  {
    knots: [
      [1476, 846, 0.06], [1474, 834, 0.2], [1481, 824, -0.12], [1479, 814, 0.22], [1490, 806, 0.12], [1500, 808, -0.14], [1507, 799, 0.2],
      [1518, 801, 0.18], [1525, 812, 0.16], [1520, 824, -0.16], [1525, 836, 0.14], [1525, 846, 0],
    ],
    holes: [
      { x: 1488, y: 830, rx: 1.5, ry: 1.9, tilt: 0, through: false, form: 'oval', toward: 90 },
    ],
    contours: [[1500, 808, 1499, 816, 1502, 824], [1520, 824, 1513, 828, 1510, 836], [1481, 824, 1487, 827, 1490, 834]],
    grooves: [[1492, 822, 1491, 836]],
    rings: [[1512, 812, 0.55]],
    rims: [[0, 3, 3]],
    moss: [1500, 808.5],
    seams: [11],
    tone: 0.45,
  },
  // The flat stone the bridge and the steps come down onto: thin, its back edge lost under the steps, its front an
  // uneven lip over a dark hollow, a few short grooves down its face.
  {
    knots: [[1371, 847, 0.14], [1374, 839, -0.12], [1380, 834, 0.2], [1392, 831, 0.04], [1404, 830, -0.08], [1416, 831, 0.12], [1426, 833, 0.16], [1431, 839, -0.16], [1428, 845, 0.12], [1414, 849, -0.08], [1396, 848, 0.06], [1380, 850, 0.06]],
    holes: [],
    lip: [1377, 839, 1392, 837.5, 1406, 839, 1420, 838, 1430, 840.5],
    grooves: [[1390, 841, 1389, 846], [1416, 842, 1417, 847]],
    under: [1376, 848, 1396, 847, 1414, 848, 1428, 844, 1432, 850, 1412, 856, 1384, 856],
    seams: [3, 4],
    tone: 0.4,
  },
  // The long flat stone along the water in front of the two tips: thicker at its right end, its back edge not drawn so
  // the tips go down into it, its front an uneven lip over a dark hollow with a few short grooves down the face.
  {
    knots: [
      [1441, 851, 0.12], [1446, 844, 0.08], [1460, 841, -0.06], [1474, 840, 0.06], [1490, 840.5, -0.04], [1504, 839, 0.06], [1516, 838.5, -0.06], [1530, 840, 0.12],
      [1538, 845, -0.16], [1535, 850, 0.12], [1520, 853, -0.1], [1500, 852, 0.06], [1478, 854, -0.06], [1456, 853, 0.08],
    ],
    holes: [{ x: 1470, y: 849, rx: 1.5, ry: 1.2, tilt: 0, through: false, form: 'oval', toward: 90 }],
    lip: [1444, 845, 1458, 843.5, 1472, 844.5, 1486, 842.5, 1500, 844, 1516, 843, 1535, 844],
    grooves: [[1462, 846.5, 1461, 851], [1494, 846, 1495, 851.5], [1521, 845.5, 1520, 850.5]],
    under: [1446, 853.5, 1478, 855, 1500, 853, 1528, 852.5, 1538, 856, 1500, 860, 1452, 859],
    moss: [1466, 841.5],
    seams: [2, 3, 4, 5],
    tone: 0.4,
  },
]

/** Where the pavilion's light comes from, by night: the rockery takes it on the side that faces the pavilion. */
const PAVILION_LIGHT = pt(1462, 727)

function rockery(stock: Stock, stones: LakeStone[], prefix: string): Built {
  const lamp = stock.paint?.lamp
  const glow = lamp ? { from: PAVILION_LIGHT, colour: lamp.spill, cover: 0.55 } : undefined
  const built = stones.map((stone, index) => lakeStone(stock, `${prefix}${index}`, stone, (x, y) => pt(x, y), 1, 'url(#rs)', 'url(#ru)', 0.85, glow))
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
  return stock.paint ? strokeWith(d, stock.paint.lamp ? stock.paint.leafLine : stock.paint.willowNear, 0.8, 0.8) : drawn(d, stock, 0.8, 0.62)
}

// ---------------------------------------------------------------------------------------------------------------------
// Lotus.

/** One lotus leaf. Held above the water it is a shallow funnel seen from a little above: its ruffled rim, and the hub (the
 * lowest point of the bowl) sunk toward the near rim, so the veins run long to the far rim and short to the near one; the
 * stalk leaves the hub and bows on its way down to the water. Floating, it lies flat with its hub at the middle. Some
 * have a lip of the rim curled over to show the pale underside. */
function lotusLeaf(stock: Stock, cx: number, cy: number, rx: number, ry: number, tilt: number, seed: number, tone: number, water: number, curl: number, bow = 0): string {
  const raised = water > cy
  const ruffle = raised ? 0.05 : 0.03
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  const turn = (x: number, y: number): Point => pt(cx + x * cosT - y * sinT, cy + x * sinT + y * cosT)
  const rimAt = (angle: number, reach: number): Point => {
    const wave = 1 + 0.085 * Math.sin(3 * angle + seed) + 0.06 * Math.sin(5 * angle + seed * 1.7) + ruffle * Math.sin(8 * angle + seed * 0.6)
    return turn(Math.cos(angle) * rx * wave * reach, Math.sin(angle) * ry * wave * reach)
  }
  const rim: Point[] = []
  for (let index = 0; index < 18; index += 1) rim.push(rimAt((index / 18) * Math.PI * 2, 1))
  const ring = smoothRing(rim)
  const hub = turn(rx * 0.04, ry * (raised ? 0.5 : 0.1))
  let veins = ''
  for (let index = 0; index < 13; index += 1) {
    const angle = ((index + 0.3 * hashUnit(index, seed)) / 13) * Math.PI * 2
    veins += `M${at(hub)}L${at(rimAt(angle, 0.82 + 0.1 * hashUnit(index, seed + 1)))}`
  }
  const p = stock.paint
  let stalk = ''
  // The stalk leaves the underside at the hub and bows a little on its way down to the water.
  const stalkPath = `M${at(hub)}C${round(hub.x - bow * 0.3)} ${round(hub.y + (water - hub.y) * 0.4)} ${round(hub.x + bow * 0.75)} ${round(hub.y + (water - hub.y) * 0.65)} ${round(hub.x + bow)} ${round(water)}`
  if (raised) stalk = p ? strokeWith(stalkPath, p.leafLine, 1.1, 0.75) : drawn(stalkPath, stock, 1.1, 0.62)
  let lip = ''
  if (curl !== 0) {
    // A stretch of the near rim, folded back toward the hub.
    const from = curl > 0 ? 0.42 : 1.9
    const outer: Point[] = []
    const inside: Point[] = []
    for (let index = 0; index <= 6; index += 1) {
      const part = index / 6
      const angle = from + part * 0.95
      outer.push(rimAt(angle, 1))
      inside.push(rimAt(angle, 1 - 0.3 * Math.sin(Math.PI * part)))
    }
    const fold = smoothPath(outer) + 'L' + smoothPath(inside.reverse()).slice(1) + 'Z'
    // The turned lip shows the leaf's paler, bluer underside.
    lip = p
      ? `<path d="${fold}" fill="${mixed(p.leafFloat, p.vein, 0.35)}" stroke="${p.leafLine}" stroke-width="0.8" stroke-opacity="${share(p.leafLineAlpha * 0.9)}"/>`
      : `<path d="${fold}" fill="${mixed(skyAt(stock.sky, cx, cy), stock.ink, tone * 0.3 * stock.wash)}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${share(0.66 * stock.line)}"/>`
  }
  if (p) {
    // Raised leaves in the deeper green, floating ones paler; the veins pale, from a dark hub.
    const body = `<path d="${ring}" fill="${raised ? p.leaf : p.leafFloat}" stroke="${p.leafLine}" stroke-width="0.95" stroke-opacity="${share(p.leafLineAlpha)}"/>`
    return stalk + body + strokeWith(veins, p.vein, 0.6, p.veinAlpha) + strokeWith(`M${at(hub)}h0.1`, p.leafLine, 2.2, 0.6) + lip
  }
  const body = `<path d="${ring}" fill="${mixed(skyAt(stock.sky, cx, cy), stock.ink, tone * stock.wash)}" stroke="${stock.ink}" stroke-width="0.95" stroke-opacity="${share(0.72 * stock.line)}"/>`
  return stalk + body + drawn(veins + `M${at(hub)}h0.1`, stock, 0.6, 0.36) + drawn(`M${at(hub)}h0.1`, stock, 2.2, 0.5) + lip
}

/** A young leaf still rolled: a spindle on its stalk. */
function lotusScroll(stock: Stock, x: number, y: number, length: number, angle: number, water: number): string {
  const dx = Math.cos(angle) * length
  const dy = Math.sin(angle) * length
  const nx = -Math.sin(angle) * length * 0.2
  const ny = Math.cos(angle) * length * 0.2
  const a = pt(x - dx / 2, y - dy / 2)
  const b = pt(x + dx / 2, y + dy / 2)
  const body = `M${at(a)}Q${round(x + nx)} ${round(y + ny)} ${at(b)}Q${round(x - nx)} ${round(y - ny)} ${at(a)}Z`
  const seam = `M${at(a)}Q${round(x + nx * 0.3)} ${round(y + ny * 0.3)} ${at(b)}`
  const p = stock.paint
  if (p)
    return (
      strokeWith(`M${round(x)} ${round(y)}Q${round(x + 2)} ${round((y + water) / 2)} ${round(x + 5)} ${round(water)}`, p.leafLine, 1, 0.72) +
      `<path d="${body}" fill="${mixed(p.leafFloat, p.vein, 0.15)}" stroke="${p.leafLine}" stroke-width="0.9" stroke-opacity="${share(p.leafLineAlpha)}"/>` +
      strokeWith(seam, p.leafLine, 0.6, 0.5)
    )
  return (
    drawn(`M${round(x)} ${round(y)}Q${round(x + 2)} ${round((y + water) / 2)} ${round(x + 5)} ${round(water)}`, stock, 1, 0.6) +
    blank(body, skyAt(stock.sky, x, y)) +
    washed(body, stock, 0.2) +
    drawn(seam, stock, 0.6, 0.45) +
    drawn(body, stock, 0.9, 0.72)
  )
}

/** A lotus bud on its stalk: a closed teardrop with one petal's edge, a blush at its tip. */
function lotusBud(stock: Stock, x: number, y: number, size: number, footX: number, footY: number): string {
  const body = `M${round(x)} ${round(y)}C${round(x + 6.4 * size)} ${round(y + 6 * size)} ${round(x + 6.8 * size)} ${round(y + 14 * size)} ${round(x)} ${round(y + 19 * size)}C${round(x - 6.8 * size)} ${round(y + 14 * size)} ${round(x - 6.4 * size)} ${round(y + 6 * size)} ${round(x)} ${round(y)}Z`
  const petal = `M${round(x + 0.4 * size)} ${round(y + 1.5 * size)}Q${round(x + 3.2 * size)} ${round(y + 10 * size)} ${round(x + 0.8 * size)} ${round(y + 18.4 * size)}M${round(x - 0.6 * size)} ${round(y + 3 * size)}Q${round(x - 3.6 * size)} ${round(y + 11 * size)} ${round(x - 1.6 * size)} ${round(y + 18.2 * size)}`
  const stalk = `M${round(x)} ${round(y + 19 * size)}Q${round(x + (footX - x) * 0.1)} ${round((y + footY) / 2)} ${round(footX)} ${round(footY)}`
  const p = stock.paint
  if (p)
    // White, flushed pink-violet toward its tip (the gradient `bud` runs down it), its petal edges in a soft plum line.
    return (
      strokeWith(stalk, p.leafLine, 1.1, 0.8) +
      `<path d="${body}" fill="url(#bud)"/>` +
      strokeWith(petal, p.petalLine, 0.7, p.petalLineAlpha * 0.7) +
      strokeWith(body, p.petalLine, 1, p.petalLineAlpha)
    )
  return (
    drawn(stalk, stock, 1.1, 0.66) +
    blank(body, skyAt(stock.sky, x, y + 9)) +
    `<path d="${body}" fill="${stock.bloom}" fill-opacity="0.42"/>` +
    drawn(petal, stock, 0.7, 0.5) +
    drawn(body, stock, 1, 0.8)
  )
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
    out += fillWith(polyline(room, true), 'url(#pg)', 1)
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
// The zigzag bridge: flat stone slabs on low piers, a low rail on either side, turning at every pier.
// Its plan lies on the water; the eye is higher here than for the pavilion, as a painter lifts the ground to show a path.

function bridge(stock: Stock, level: number): Built {
  const KY = 0.45
  const HALF = 11
  const POST = 5.5
  const THICK = 4.2
  // In plan: x along the sheet, z toward the eye. It turns at every pier, about forty degrees each way, and it keeps
  // to the far side of the water (negative z) so that nothing of it comes down beside the prompt box.
  const centre: Array<[number, number]> = [[1226, -14], [1262, -47], [1298, -13], [1334, -46], [1368, -12], [1400, 3]]
  const last = centre.length - 1
  const unit = (from: [number, number], to: [number, number]): [number, number] => {
    const dx = to[0] - from[0]
    const dz = to[1] - from[1]
    const length = Math.hypot(dx, dz) || 1
    return [dx / length, dz / length]
  }
  const near: Array<[number, number]> = []
  const far: Array<[number, number]> = []
  centre.forEach((here, index) => {
    const before = centre[Math.max(0, index - 1)] ?? here
    const after = centre[Math.min(last, index + 1)] ?? here
    const dIn = index > 0 ? unit(before, here) : unit(here, after)
    const dOut = index < last ? unit(here, after) : dIn
    const nIn: [number, number] = [-dIn[1], dIn[0]]
    const nOut: [number, number] = [-dOut[1], dOut[0]]
    const dot = nIn[0] * nOut[0] + nIn[1] * nOut[1]
    const mitre: [number, number] = [(nIn[0] + nOut[0]) / (1 + dot), (nIn[1] + nOut[1]) / (1 + dot)]
    near.push([here[0] + mitre[0] * HALF, here[1] + mitre[1] * HALF])
    far.push([here[0] - mitre[0] * HALF, here[1] - mitre[1] * HALF])
  })
  const flat = (plan: [number, number], height = 0): Point => pt(plan[0], level + KY * plan[1] - height)
  const between = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const railOf = (edge: Array<[number, number]>): string => {
    let d = polyline(edge.map(plan => flat(plan, POST)))
    edge.forEach((plan, index) => {
      d += polyline([flat(plan), flat(plan, POST + 1.6)])
      const next = edge[index + 1]
      if (next) d += polyline([flat(between(plan, next)), flat(between(plan, next), POST)])
    })
    return d
  }
  const paint = 'url(#bf)'
  const deck = polyline(near.map(plan => flat(plan)).concat(far.map(plan => flat(plan)).reverse()), true)
  const edge = polyline(near.map(plan => flat(plan)).concat(near.map(plan => flat(plan, -THICK)).reverse()), true)
  let joints = ''
  let piers = ''
  let wet = ''
  centre.forEach((_, index) => {
    const a = near[index]
    const b = far[index]
    const nextA = near[index + 1]
    const nextB = far[index + 1]
    if (!a || !b) return
    if (nextA && nextB) joints += polyline([flat(between(b, nextB)), flat(between(a, nextA))])
    joints += polyline([flat(b), flat(a)])
    if (index === 0 || index === last) return
    const foot = flat(a, -THICK)
    piers += `M${round(foot.x - 2.2)} ${round(foot.y)}v7h4.4v-7Z`
    wet += `M${round(foot.x - 7)} ${round(foot.y + 7.8)}h14`
  })
  // A photographic sheet lays the deck in its own pale stone, out of the mist as the lines are.
  const p = stock.paint
  const defs =
    `<linearGradient id="bf" gradientUnits="userSpaceOnUse" x1="1226" y1="0" x2="1262" y2="0">` +
    `<stop offset="0" stop-color="${stock.ink}" stop-opacity="0"/><stop offset="1" stop-color="${stock.ink}"/></linearGradient>` +
    (p
      ? `<linearGradient id="bw" gradientUnits="userSpaceOnUse" x1="1226" y1="0" x2="1268" y2="0">` +
        `<stop offset="0" stop-color="${p.deck}" stop-opacity="0"/><stop offset="1" stop-color="${p.deck}"/></linearGradient>`
      : '')
  const markup =
    `<path d="${railOf(far)}" stroke="${paint}" stroke-width="0.85" stroke-opacity="${share(0.4 * stock.line)}"/>` +
    (p ? `<path d="${deck}" fill="url(#bw)"/>` : `<path d="${deck}" fill="${paint}" fill-opacity="${share(0.09 * stock.wash)}"/>`) +
    `<path d="${joints}" stroke="${paint}" stroke-width="0.7" stroke-opacity="${share(0.4 * stock.line)}"/>` +
    `<path d="${deck}" stroke="${paint}" stroke-width="0.9" stroke-opacity="${share(0.7 * stock.line)}"/>` +
    `<path d="${edge}" fill="${paint}" fill-opacity="${share(0.5 * stock.wash)}"/>` +
    `<path d="${piers}" fill="${paint}" fill-opacity="${share(0.5 * stock.wash)}"/>` +
    `<path d="${wet}" stroke="${paint}" stroke-width="0.8" stroke-opacity="${share(0.4 * stock.line)}"/>` +
    `<path d="${railOf(near)}" stroke="${paint}" stroke-width="1" stroke-opacity="${share(0.66 * stock.line)}"/>`
  return { defs, markup }
}

// ---------------------------------------------------------------------------------------------------------------------
// The willow: two boughs come in at the top right, and their strands hang, each one swaying from where it leaves the bough.

function willow(stock: Stock): { boughs: string; farStrands: string; nearStrands: string } {
  const boughA = spline([pt(1634, 84), pt(1580, 78), pt(1528, 86), pt(1476, 94), pt(1428, 116), pt(1390, 136), pt(1364, 162)], 8)
  const boughB = spline([pt(1636, 22), pt(1590, 40), pt(1548, 44), pt(1512, 62), pt(1484, 78)], 8)
  const p = stock.paint
  const boughA2 = taper(boughA, along => 5.4 - 4.4 * Math.pow(along, 0.8))
  const boughB2 = taper(boughB, along => 3.6 - 2.8 * along)
  const boughs = p
    ? fillWith(boughA2, p.bough, p.boughAlpha) + fillWith(boughB2, p.bough, p.boughAlpha * 0.82)
    : inked(boughA2, stock, 0.8) + inked(boughB2, stock, 0.66)
  const pick = (bough: Point[], along: number): Point => bough[Math.round(along * (bough.length - 1))] ?? pt(0, 0)
  interface Strand {
    start: Point
    length: number
    near: boolean
  }
  const strands: Strand[] = []
  const onA: Array<[number, number]> = [[0.12, 176], [0.26, 304], [0.38, 232], [0.5, 336], [0.6, 208], [0.72, 286], [0.85, 196], [1, 158]]
  onA.forEach(([along, length], index) => strands.push({ start: pick(boughA, along), length, near: index % 2 === 1 }))
  const onB: Array<[number, number]> = [[0.3, 150], [0.6, 236], [0.82, 188], [1, 262]]
  onB.forEach(([along, length], index) => strands.push({ start: pick(boughB, along), length, near: index % 2 === 0 }))
  let farStrands = ''
  let nearStrands = ''
  strands.forEach((strand, index) => {
    const seed = 300 + index * 7
    const lean = -0.02 - 0.07 * hashUnit(seed, 1)
    const wave = 3 + 5 * hashUnit(seed, 3)
    const phase = hashUnit(seed, 5) * 6.28
    const reachOut = 8 + 12 * hashUnit(seed, 17)
    // A strand leaves the bough along it, toward the tip, and only then gives in and hangs.
    const along = (s: number): Point =>
      pt(
        strand.start.x - reachOut * (1 - Math.pow(1 - s, 6)) + strand.length * lean * Math.pow(s, 1.4) + wave * Math.sin(s * 3.6 + phase) * s,
        strand.start.y + strand.length * Math.pow(s, 1.16),
      )
    const stem: Point[] = []
    for (let part = 0; part <= 10; part += 1) stem.push(along(Math.pow(part / 10, 1.3)))
    // Leaves: slender, pointed at both ends, hanging close along the strand (never more than about fifteen degrees out
    // from it), at uneven steps and on either side as they come. Each is a small filled lens drawn from its stalk end.
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
      // A slender four-sided leaf, widest two fifths of the way out (about a fifth of its length across): at this
      // size it reads as a lens, and straight edges cost the renderer less than curves on strands that move.
      const half = reach * (p ? 0.15 : 0.1)
      const nx = -Math.sin(angle) * half
      const ny = Math.cos(angle) * half
      const wx = round(0.4 * dx + nx)
      const wy = round(0.4 * dy + ny)
      const vx = round(0.4 * dx - nx)
      const vy = round(0.4 * dy - ny)
      leaves += count === 0 ? `M${at(here)}` : `m${round(here.x - pen.x)} ${round(here.y - pen.y)}`
      leaves += `l${wx} ${wy}l${round(dx - wx)} ${round(dy - wy)}l${round(vx - dx)} ${round(vy - dy)}z`
      // After z the pen is back at the leaf's stalk end; keep it where the rounded numbers have really put it.
      pen = count === 0 ? pt(round(here.x), round(here.y)) : pt(pen.x + round(here.x - pen.x), pen.y + round(here.y - pen.y))
      s += (5.5 + 9 * hashUnit(count, seed + 11)) / strand.length
      count += 1
    }
    const strength = strand.near ? 0.7 : 0.4
    const swing = round(0.7 + 0.8 * hashUnit(seed, 13))
    // One breeze crosses the tree from the right, so the strands answer one after another.
    const delay = round(((1636 - strand.start.x) / 290) * 5 + hashUnit(seed, 15) * 1.6)
    const green = p ? (strand.near ? p.willowNear : p.willowFar) : stock.ink
    const cover = p ? (strand.near ? 1 : 0.8) * p.willowAlpha : strength * stock.line
    const markup =
      `<g class="sway" style="transform-origin:${round(strand.start.x)}px ${round(strand.start.y)}px;--a:${swing}deg;animation-delay:-${delay}s">` +
      (p ? strokeWith(smoothPath(stem), p.bough, 0.7, cover * 0.8) : drawn(smoothPath(stem), stock, 0.7, strength)) +
      `<path d="${leaves}" fill="${green}" fill-opacity="${share(cover)}"/>` +
      '</g>'
    if (strand.near) nearStrands += markup
    else farStrands += markup
  })
  return { boughs, farStrands, nearStrands }
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

/** The whole sheet on one stock. */
function gardenSheet(stock: Stock): string {
  const sky = stock.sky
  const ink = stock.ink
  const mists: string[] = []
  const p = stock.paint
  const lamp = p?.lamp
  /** A lens of bare sky: it lets a thing sink into the water or the mist. It does not move. On the water of a photographic
   * sheet it takes the water's own tint, so it does not lay a band of air across the pond. */
  const mist = (cx: number, cy: number, rx: number, ry: number, strength: number, onWater = false): string => {
    const id = `m${mists.length}`
    const air = skyAt(sky, cx, cy)
    const colour = onWater && p && p.waterAlpha > 0 ? mixed(air, p.water, p.waterAlpha * 0.8) : air
    mists.push(
      `<radialGradient id="${id}"><stop offset="0" stop-color="${colour}" stop-opacity="${share(strength)}"/><stop offset="0.5" stop-color="${colour}" stop-opacity="${share(strength * 0.72)}"/>` +
        `<stop offset="0.82" stop-color="${colour}" stop-opacity="${share(strength * 0.22)}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>`,
    )
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`
  }
  /** The water's tint (a breath bluer than the air), as a soft lens under the pavilion and in the pond; none by night. */
  const waterTint = (cx: number, cy: number, rx: number, ry: number): string =>
    p && p.waterAlpha > 0 ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#wt)"/>` : ''
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
  // By night the strokes under the middle of the pavilion carry its light, the more the nearer the middle; the rest are the
  // pale ink of the water.
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
  /** The same stroke held still: the water next to the prompt box does not move. */
  const still = (x1: number, x2: number, y: number, strength: number, width = 1.2): string =>
    `<path d="${stroke(x1, x2, y)}"${lit(x1, x2)} stroke-width="${width}" stroke-opacity="${share(litStrength(x1, x2, strength) * 0.8 * stock.line)}"/>`

  const WATER = 856
  const tree = willow(stock)
  const span = bridge(stock, 824)
  const house = pavilion(stock, 1462, 687, 1)
  const stone = pondPeak(stock, 300, 884, 0.9)
  const back = rockery(stock, ROCKERY_BACK, 'kb')
  const front = rockery(stock, ROCKERY_FRONT, 'kf')
  const waterInk = p ? p.ripple : ink

  const disc =
    (stock.halo > 0 ? `<circle cx="1440" cy="222" r="${stock.haloR ?? 78}" fill="url(#halo)"/>` : '') +
    `<circle cx="1440" cy="222" r="22" fill="${stock.disc}" fill-opacity="${stock.discAlpha ?? 0.9}"/>`

  // By night, under the pavilion, the light it throws on the water: a soft upright glow the strokes break.
  const glowOnWater = lamp ? `<ellipse cx="1462" cy="${WATER + 30}" rx="44" ry="34" fill="url(#pr)"/>` : ''
  const reflections =
    glowOnWater +
    `<g stroke="${waterInk}">` +
    still(1412, 1454, WATER + 10, 0.44, 1.4) +
    shimmer(1468, 1552, WATER + 11, 0.48, 2, 1.4) +
    still(1424, 1472, WATER + 21, 0.38, 1.3) +
    shimmer(1486, 1516, WATER + 20, 0.4, 3, 1.3) +
    shimmer(1528, 1580, WATER + 22, 0.3, 4, 1.2) +
    shimmer(1442, 1520, WATER + 31, 0.32, 5, 1.1) +
    shimmer(1452, 1488, WATER + 42, 0.28, 6, 1) +
    shimmer(1500, 1542, WATER + 45, 0.24, 7, 1) +
    shimmer(1460, 1512, WATER + 56, 0.2, 8, 0.9) +
    shimmer(1472, 1504, WATER + 69, 0.15, 9, 0.8) +
    '</g>'

  const pondLeft = `<g stroke="${waterInk}" stroke-width="1.2">` + shimmer(244, 290, 922, 0.34, 11) + shimmer(300, 362, 926, 0.3, 12) + '</g>'

  // The rings keep clear of the prompt box: their motion stays more than fifty units from either end of it.
  const rings =
    `<g stroke="${waterInk}" stroke-width="1.1" stroke-opacity="${share(0.6 * stock.line)}">` + ripple(1532, WATER + 38, 26, 13, 0) + ripple(348, 936, 22, 15, 4) + '</g>'

  const style = `
.sway{animation:sway 10s ease-in-out infinite alternate}
.ring{animation:ring 13s linear infinite}
.shim{animation:shim 8s ease-in-out infinite alternate}
@keyframes sway{from{transform:rotate(calc(var(--a) * -0.6))}to{transform:rotate(var(--a))}}
@keyframes ring{0%{transform:scale(.08);opacity:0}14%{opacity:.7}100%{transform:scale(1);opacity:0}}
@keyframes shim{from{transform:translateX(-3px);opacity:.5}to{transform:translateX(4px);opacity:1}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  // Built in drawing order, so that every lens of mist has made its gradient before the defs are written.
  const drawing = `${disc}
${tree.farStrands}${tree.boughs}${tree.nearStrands}
${span.markup}${mist(1234, 812, 24, 18, 0.7)}${waterTint(1440, 890, 190, 40)}
${back.markup}
${house.markup}
${front.markup}${tuft(stock, 1476, 827, 10, 67)}
${mist(1490, WATER + 8, 130, 10, 0.8, true)}
${reflections}
${waterTint(300, 914, 118, 22)}${stone.markup}
${lotusLeaf(stock, 242, 842, 31, 14, -0.32, 3, 0.18, 905, -1, -8)}${lotusLeaf(stock, 352, 830, 27, 12, 0.36, 5, 0.18, 903, 1, 20)}${lotusScroll(stock, 222, 832, 24, -1.05, 906)}
${lotusBud(stock, 372, 798, 1, 364, 902)}${mist(300, 901, 100, 9, 0.75, true)}
${p ? strokeWith('M376 899q7 -1.3 14 0t14 0', waterInk, 0.9, 0.5 * stock.line) : drawn('M376 899q7 -1.3 14 0t14 0', stock, 0.9, 0.5)}${lotusLeaf(stock, 272, 903, 27, 9.5, -0.05, 7, 0.21, 0, 1)}${lotusLeaf(stock, 330, 907, 25, 8.5, 0.08, 11, 0.19, 0, -1)}
${pondLeft}
${rings}
${seal(212, 914, stock)}`

  const haloColour = stock.haloColour ?? stock.disc
  const defs =
    skyDefs(sky) +
    mists.join('') +
    `<radialGradient id="halo"><stop offset="0.3" stop-color="${haloColour}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${haloColour}" stop-opacity="0"/></radialGradient>` +
    // The rockery's lines fade into the water; the hollows under its lips are darkest at the stone and gone in the water.
    `<linearGradient id="rs" gradientUnits="userSpaceOnUse" x1="0" y1="840" x2="0" y2="860"><stop offset="0" stop-color="${lamp ? mixed(ink, lamp.spill, 0.45) : ink}"/><stop offset="1" stop-color="${lamp ? mixed(ink, lamp.spill, 0.45) : ink}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="rc" gradientUnits="userSpaceOnUse" x1="0" y1="847" x2="0" y2="859"><stop offset="0" stop-color="${stock.shade}" stop-opacity="${share(0.72 * stock.shadeAlpha)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="${share(0.12 * stock.shadeAlpha)}"/></linearGradient>` +
    `<linearGradient id="ru" gradientUnits="userSpaceOnUse" x1="0" y1="842" x2="0" y2="860"><stop offset="0" stop-color="${stock.shade}" stop-opacity="${share(0.5 * stock.shadeAlpha)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="0"/></linearGradient>` +
    (p
      ? // The lotus bud: flushed at its tip, white below.
        `<linearGradient id="bud" gradientUnits="userSpaceOnUse" x1="0" y1="798" x2="0" y2="817"><stop offset="0" stop-color="${p.flush}"/><stop offset="0.5" stop-color="${mixed(p.petal, p.flush, 0.3)}"/><stop offset="1" stop-color="${p.petal}"/></linearGradient>` +
        (p.waterAlpha > 0
          ? `<radialGradient id="wt"><stop offset="0" stop-color="${p.water}" stop-opacity="${share(p.waterAlpha)}"/><stop offset="0.6" stop-color="${p.water}" stop-opacity="${share(p.waterAlpha * 0.7)}"/><stop offset="1" stop-color="${p.water}" stop-opacity="0"/></radialGradient>`
          : '') +
        (lamp
          ? `<radialGradient id="pr"><stop offset="0" stop-color="${lamp.reflect}" stop-opacity="0.34"/><stop offset="0.5" stop-color="${lamp.reflect}" stop-opacity="0.16"/><stop offset="1" stop-color="${lamp.reflect}" stop-opacity="0"/></radialGradient>`
          : '')
      : '') +
    back.defs +
    front.defs +
    span.defs +
    house.defs +
    stone.defs

  const ground = `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>` + sky.glows.map((_, index) => `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow${index})"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${defs}</defs>
${ground}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${drawing}
</g>
</svg>`
}

/** The sheet on any of its skies: the two ink sheets (pale mist, charcoal), and the three dusk ones (the pale day, the
 * blue night, the wine night). */
export function sceneSvg(stock: 'dayNatural' | 'nightLantern' | 'dayInk' | 'nightInk' | 'day' | 'night' | 'nightWine'): string {
  return gardenSheet(
    stock === 'dayNatural' ? STOCKS.dayNatural : stock === 'nightLantern' ? STOCKS.nightLantern :
    stock === 'dayInk' ? STOCKS.dayInk : stock === 'nightInk' ? STOCKS.nightInk : stock === 'day' ? STOCKS.day : stock === 'night' ? STOCKS.nightBlue : STOCKS.night,
  )
}

/** On a clear day (晴日写真), for a light window: white sill walls and plinth, a 黛 roof, green willow and lotus, grey lake stone. */
export function daySvg(): string {
  return sceneSvg('dayNatural')
}

/** On a garden night (灯影夜游), for a dark window: wine-ink air, the pavilion lit amber-gold from within. */
export function nightSvg(): string {
  return sceneSvg('nightLantern')
}
