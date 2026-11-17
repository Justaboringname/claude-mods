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
  /** Lake stone, modelled: the left peak (against the white wall) and the rockery (against the sky and the water). */
  rocks: { peak: RockTone; pile: RockTone }
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
    rocks: {
      peak: { body: '#cdcfd1', lit: '#ffffff', litAlpha: 0.55, shade: '#2c2e31', shadeAlpha: 0.13, deep: '#1d1f22', deepAlpha: 0.78, line: '#2a2c30', lineAlpha: 0.9, rimLit: false },
      pile: { body: '#d3d5d7', lit: '#ffffff', litAlpha: 0.55, shade: '#2c2e31', shadeAlpha: 0.13, deep: '#1d1f22', deepAlpha: 0.78, line: '#2a2c30', lineAlpha: 0.9, rimLit: false },
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
    rocks: {
      peak: { body: '#5a564e', lit: '#e2ddcf', litAlpha: 0.32, shade: '#0c0b09', shadeAlpha: 0.24, deep: '#080706', deepAlpha: 0.85, line: '#ece7d8', lineAlpha: 0.6, rimLit: true },
      pile: { body: '#45413a', lit: '#e2ddcf', litAlpha: 0.22, shade: '#0c0b09', shadeAlpha: 0.26, deep: '#080706', deepAlpha: 0.88, line: '#ece7d8', lineAlpha: 0.5, rimLit: true },
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
// Lake stones (太湖石), modelled rather than only outlined. Each stone is built round a curved spine (foot to tip) with a
// width on either side, so that its face has its own coordinates: along the spine and across it. Its outline is that body
// with deep bays bitten into it, notches (顿挫) and a worn, ragged edge; its holes are set on the body in a strict order of
// size, some going through (the wall, the sky or the lit gate shows in them) and some blind. Its face is lit as a form: the
// body is rounded over from every edge (the holes' rims too) and lumpy, and lit from where the sun or moon hangs; that light
// is laid down in a few washes of shade and one of light. Over it, made by a seeded generator: long flutes that follow
// the spine and bend round the holes (shade in the groove, light on the flank that faces the light, a broken line in the
// bottom), overhung ledges with shade under them, clusters of small pits (弹子窝), and in every hole its thickness: the dark
// far wall under the lip that faces the light, a lit lip opposite, soft shade spilling below. A brush line round it, heavy on
// the side turned from the light, and ink moss dots. Grey on white by day, moonlit warm grey by night; no colour.

/** The tones of lake stone on one sheet: its own grey, the light on its lit planes, one wash of shade (laid up to three deep),
 * the dark of its hollows, its line (ink by day; by night the light catching an edge, `rimLit`). */
interface RockTone {
  body: string
  lit: string
  litAlpha: number
  shade: string
  shadeAlpha: number
  deep: string
  deepAlpha: number
  line: string
  lineAlpha: number
  rimLit: boolean
}

/** A hole in a stone: where on its face (along the spine 0..1, across it -1..1), its half sizes along and across the spine (in
 * the stone's units), a turn off the spine in degrees, and its shape. A hole that goes through shows what is behind the stone;
 * `wall` is how much of the opening its far wall hides, `toward` the way the tunnel runs (degrees on the sheet: its far
 * opening lies that way inside the near one). */
interface RockHole {
  s: number
  u: number
  a: number
  b: number
  tilt: number
  through: boolean
  form: 'oval' | 'tear' | 'kidney' | 'slot' | 'double'
  wall?: number
  toward?: number
}

/** One stone. `spine` runs from the foot to the tip (x, y pairs); `left` and `right` give its width on either side along it
 * (s, width pairs; left and right as seen walking up the spine). `bites` are bays (positive depth, a share of the width) and
 * spurs (negative): s, side (-1 left, 1 right), depth, reach (in s), sharp (1) or round (0). */
interface RockForm {
  seed: number
  spine: number[]
  left: number[]
  right: number[]
  bites?: number[][]
  /** How worn and ragged its edge is (sheet units), and how many small notches it takes. */
  rough: number
  notches?: number
  /** The share of its length over which the tip rounds off; the same for the foot (0: the foot is cut level), and the share
   * of its width the foot keeps (a stone sitting on another is rounded under, not pointed). */
  tip?: number
  foot?: number
  footKeep?: number
  /** How far in from an edge the face rounds over, and how lumpy the face is (both in the stone's units). */
  round: number
  lumps: number
  holes: RockHole[]
  flutes: number
  /** How long the flutes run (a share of the spine). */
  fluteLength?: number
  /** Ledges: s, u from, u to, how much the ledge bows (in s), how strong. */
  ledges?: number[][]
  pits: number
  /** Moss dots: s, u pairs. */
  moss?: number[]
  /** The foot is sunk in the ground: no line along it. */
  buried?: boolean
  /** The foot sits on the water: its line fades out (drawn with the pen that fades into the water). */
  wet?: boolean
  /** How much longer the lumps of its face run up and down than across (worn flutes), and how many shallow hollows (弹窝)
   * the water has scooped in its face. */
  stretch?: number
  dimples?: number
  /** A cave mouth eaten in at its foot: s of its crown, u of its middle, its half width (a share of the width). */
  cave?: number[]
  /** A flat stone: where across it (u) its top meets its front (the lip), and how deep the dark undercut below it is. */
  lip?: number
  under?: number
  /** Thin enough to take one wash of shade, not two. */
  flat?: boolean
}

/** A seeded run of numbers in 0..1 (mulberry32), so that every call draws the same stone. */
function rng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smooth noise in -1..1 along a line. */
function wave(at: number, salt: number): number {
  return noise(at, salt) * 2 - 1
}

/** Smooth noise in -1..1 over the sheet. */
function wave2(x: number, y: number, salt: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const ex = fx * fx * (3 - 2 * fx)
  const ey = fy * fy * (3 - 2 * fy)
  const corner = (i: number, j: number): number => hashUnit(i * 7919 + j * 104729, salt)
  const top = corner(xi, yi) * (1 - ex) + corner(xi + 1, yi) * ex
  const bottom = corner(xi, yi + 1) * (1 - ex) + corner(xi + 1, yi + 1) * ex
  return (top * (1 - ey) + bottom * ey) * 2 - 1
}

function pairs(values: number[]): Point[] {
  const points: Point[] = []
  for (let index = 0; index + 1 < values.length; index += 2) points.push(pt(values[index] ?? 0, values[index + 1] ?? 0))
  return points
}

function ringArea(points: Point[]): number {
  let area = 0
  points.forEach((a, index) => {
    const b = points[(index + 1) % points.length]
    if (b) area += a.x * b.y - b.x * a.y
  })
  return area / 2
}

function insidePolygon(points: Point[], x: number, y: number): boolean {
  let hit = false
  for (let index = 0, before = points.length - 1; index < points.length; before = index, index += 1) {
    const a = points[index]
    const b = points[before]
    if (!a || !b) continue
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hit = !hit
  }
  return hit
}

/** Fewer points along a line, none of them more than `tolerance` off it (Douglas-Peucker). */
function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length < 3) return points
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const stack: Array<[number, number]> = [[0, points.length - 1]]
  while (stack.length) {
    const [from, to] = stack.pop() as [number, number]
    const a = points[from] as Point
    const b = points[to] as Point
    const dx = b.x - a.x
    const dy = b.y - a.y
    const length = Math.hypot(dx, dy)
    let worst = -1
    let far = 0
    for (let index = from + 1; index < to; index += 1) {
      const p = points[index] as Point
      const off = length < 1e-6 ? Math.hypot(p.x - a.x, p.y - a.y) : Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / length
      if (off > far) {
        far = off
        worst = index
      }
    }
    if (worst > 0 && far > tolerance) {
      keep[worst] = 1
      stack.push([from, worst], [worst, to])
    }
  }
  return points.filter((_, index) => keep[index])
}

/** The same for a closed ring: split at its two farthest-apart points. */
function simplifyRing(points: Point[], tolerance: number): Point[] {
  if (points.length < 5) return points
  const first = points[0] as Point
  let far = 0
  let best = 0
  points.forEach((p, index) => {
    const d = Math.hypot(p.x - first.x, p.y - first.y)
    if (d > far) {
      far = d
      best = index
    }
  })
  const one = simplify(points.slice(0, best + 1), tolerance)
  const two = simplify(points.slice(best).concat([first]), tolerance)
  return one.concat(two.slice(1, -1))
}

/** A coordinate as written: one decimal, or (`q` above 1) a whole number of 1/q units, for a path drawn at scale 1/q. */
function fixer(q: number): (value: number) => number {
  return q > 1 ? (value: number) => Math.round(value * q) : round
}

/** Several rings (or open runs) as one path in relative steps: the first from an absolute point, each next one moved to
 * from where the last left off. */
function rings(list: Point[][], close = true, scale = 1): string {
  const fix = fixer(scale)
  let d = ''
  let cur: Point | null = null
  for (const ring of list) {
    const r: Point[] = []
    for (const p of ring) {
      const q = pt(fix(p.x), fix(p.y))
      const last = r[r.length - 1]
      if (!last || last.x !== q.x || last.y !== q.y) r.push(q)
    }
    if (close && r.length > 2) {
      const a = r[0] as Point
      const b = r[r.length - 1] as Point
      if (a.x === b.x && a.y === b.y) r.pop()
    }
    if (r.length < 2) continue
    const head = r[0] as Point
    const steps: number[] = []
    for (let index = 1; index < r.length; index += 1) {
      const p = r[index] as Point
      const q = r[index - 1] as Point
      steps.push(p.x - q.x, p.y - q.y)
    }
    d += cur ? `m${pack([head.x - cur.x, head.y - cur.y].concat(steps))}` : `M${pack([head.x, head.y])}l${pack(steps)}`
    if (close) {
      d += 'z'
      cur = head
    } else cur = r[r.length - 1] as Point
  }
  return d
}

/** Rings as smooth curves through the midpoints of their sides (each point the control of a quadratic), in relative steps. */
function smoothRings(list: Point[][], close = true, scale = 1): string {
  const fix = fixer(scale)
  let d = ''
  let cur: Point | null = null
  for (const ring of list) {
    const r = ring.map(p => pt(p.x, p.y))
    const count = r.length
    if (count < 3) continue
    r.forEach((p, index) => (r[index] = pt(fix(p.x), fix(p.y))))
    const even = scale > 1 ? Math.round : round
    const mid = (a: Point, b: Point): Point => pt(even((a.x + b.x) / 2), even((a.y + b.y) / 2))
    const start = close ? mid(r[count - 1] as Point, r[0] as Point) : (r[0] as Point)
    d += cur ? `m${pack([start.x - cur.x, start.y - cur.y])}` : `M${pack([start.x, start.y])}`
    const values: number[] = []
    let at0 = start
    const last = close ? count : count - 1
    for (let index = close ? 0 : 1; index < last; index += 1) {
      const c = r[index] as Point
      const e = close ? mid(c, r[(index + 1) % count] as Point) : index < count - 2 ? mid(c, r[index + 1] as Point) : (r[count - 1] as Point)
      values.push(c.x - at0.x, c.y - at0.y, e.x - at0.x, e.y - at0.y)
      at0 = e
    }
    d += `q${pack(values)}`
    if (close) {
      d += 'z'
      cur = start
    } else cur = at0
  }
  return d
}

/** Rings all wound the same way, so that one path with the nonzero rule fills their union (no darker overlaps, no gaps). */
function wound(list: Point[][]): Point[][] {
  return list.filter(ring => ring.length > 2).map(ring => (ringArea(ring) < 0 ? ring.slice().reverse() : ring))
}

/** The stone's frame: the spine sampled evenly, its direction and its right-hand side at each sample, the width on each
 * side, and the two edges. */
interface RockFrame {
  p: Point[]
  t: Point[]
  n: Point[]
  wl: number[]
  wr: number[]
  count: number
  length: number
  right: Point[]
  left: Point[]
}

/** A width along the spine from its knots, eased between them (flat at each knot: a waist, a swelling). */
function profileAt(knots: number[], s: number): number {
  const list = pairs(knots)
  const first = list[0]
  if (!first) return 0
  if (s <= first.x) return first.y
  for (let index = 1; index < list.length; index += 1) {
    const a = list[index - 1] as Point
    const b = list[index] as Point
    if (s <= b.x) {
      const f = (s - a.x) / (b.x - a.x || 1)
      return a.y + ((b.y - a.y) * (1 - Math.cos(Math.PI * f))) / 2
    }
  }
  return (list[list.length - 1] as Point).y
}

function rockFrame(form: RockForm, k: number, plain = false): RockFrame {
  const dense = spline(pairs(form.spine), 16)
  const cum = [0]
  for (let index = 1; index < dense.length; index += 1) {
    const a = dense[index - 1] as Point
    const b = dense[index] as Point
    cum.push((cum[index - 1] ?? 0) + Math.hypot(b.x - a.x, b.y - a.y))
  }
  const length = cum[cum.length - 1] ?? 1
  const count = Math.max(12, Math.round((length * k) / 1.5))
  const p: Point[] = []
  let seg = 0
  for (let q = 0; q <= count; q += 1) {
    const target = (length * q) / count
    while (seg < dense.length - 2 && (cum[seg + 1] ?? 0) < target) seg += 1
    const a = dense[seg] as Point
    const b = dense[seg + 1] as Point
    const span = (cum[seg + 1] ?? 0) - (cum[seg] ?? 0) || 1
    const f = (target - (cum[seg] ?? 0)) / span
    p.push(pt(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f))
  }
  const t = p.map((_, index) => {
    const a = p[Math.max(0, index - 2)] as Point
    const b = p[Math.min(count, index + 2)] as Point
    const dx = b.x - a.x
    const dy = b.y - a.y
    const size = Math.hypot(dx, dy) || 1
    return pt(dx / size, dy / size)
  })
  const n = t.map(v => pt(-v.y, v.x))
  const rand = rng(form.seed * 31 + 7)
  const step = length / count
  const sides = [-1, 1].map(side => {
    const knots = side < 0 ? form.left : form.right
    const salt = form.seed * 3 + (side < 0 ? 1 : 2)
    const notches: number[][] = []
    const rate = plain ? 0 : form.notches ?? 1
    if (rate > 0) for (let x = 6 + rand() * 20; x < length * k; x += (16 + rand() * 34) / rate) notches.push([x, 1.2 + rand() * 2.8, 1.4 + rand() * 2.6])
    const widths = p.map((_, index) => {
      const s = index / count
      const x = (length * k * index) / count
      const base = profileAt(knots, s)
      let width = base + ((plain ? 0 : form.rough) * (0.62 * wave(x / 15, salt) + 0.3 * wave(x / 6, salt + 5) + 0.16 * wave(x / 2.4, salt + 9))) / k
      for (const bite of form.bites ?? []) {
        if (bite[1] !== side) continue
        const d = (s - (bite[0] ?? 0)) / (bite[3] ?? 0.05)
        width -= base * (bite[2] ?? 0) * (bite[4] ? Math.pow(Math.max(0, 1 - Math.abs(d)), 1.4) : Math.exp(-d * d * 2.5))
      }
      for (const [cx = 0, depth = 0, half = 1] of notches) {
        const d = Math.abs(x - cx) / half
        if (d < 1) width -= (depth / k) * Math.pow(1 - d, 1.5)
      }
      const tip = form.tip ?? 0.05
      if (s > 1 - tip) width *= Math.sqrt(Math.max(0, 1 - Math.pow((s - (1 - tip)) / tip, 2)))
      const foot = form.foot ?? 0
      const keep = form.footKeep ?? 0
      if (foot > 0 && s < foot) width *= keep + (1 - keep) * Math.sqrt(Math.max(0, 1 - Math.pow((foot - s) / foot, 2)))
      return Math.max(width, 0)
    })
    // Where the spine bends, the inner edge must not fold back on itself.
    const edge: Point[] = []
    widths.forEach((_, index) => {
      const at0 = p[index] as Point
      const nn = n[index] as Point
      const tt = t[index] as Point
      let width = widths[index] ?? 0
      let e = pt(at0.x + side * nn.x * width, at0.y + side * nn.y * width)
      const prev = edge[index - 1]
      let guard = 0
      while (prev && guard < 40 && (e.x - prev.x) * tt.x + (e.y - prev.y) * tt.y < 0.2 * step && width > 0.3) {
        width *= 0.93
        e = pt(at0.x + side * nn.x * width, at0.y + side * nn.y * width)
        guard += 1
      }
      widths[index] = width
      edge.push(e)
    })
    return { widths, edge }
  })
  const [left, right] = sides as [{ widths: number[]; edge: Point[] }, { widths: number[]; edge: Point[] }]
  return { p, t, n, wl: left.widths, wr: right.widths, count, length, right: right.edge, left: left.edge }
}

/** A point on the stone's face: `s` along the spine (0 foot, 1 tip), `u` across it (-1 left edge, 1 right edge). */
function faceAt(f: RockFrame, s: number, u: number): { at: Point; t: Point; n: Point; w: number } {
  const x = Math.max(0, Math.min(f.count, s * f.count))
  const i = Math.min(f.count - 1, Math.floor(x))
  const g = x - i
  const mix = (list: Point[]): Point => {
    const a = list[i] as Point
    const b = list[i + 1] as Point
    return pt(a.x + (b.x - a.x) * g, a.y + (b.y - a.y) * g)
  }
  const widths = u >= 0 ? f.wr : f.wl
  const w = (widths[i] ?? 0) * (1 - g) + (widths[i + 1] ?? 0) * g
  const p0 = mix(f.p)
  const n0 = mix(f.n)
  const t0 = mix(f.t)
  const size = Math.hypot(n0.x, n0.y) || 1
  const nn = pt(n0.x / size, n0.y / size)
  return { at: pt(p0.x + nn.x * u * w, p0.y + nn.y * u * w), t: pt(t0.x / size, t0.y / size), n: nn, w }
}

/** The rim of a hole round its centre: its shape, sizes `a` along its axis and `b` across, turned to `angle` (radians). */
function holeRim(hole: RockHole, centre: Point, angle: number, scale: number, seed: number, steps: number): Point[] {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const points: Point[] = []
  for (let index = 0; index < steps; index += 1) {
    const th = (index / steps) * Math.PI * 2
    let r = 1 + 0.07 * Math.sin(3 * th + seed) + 0.05 * Math.sin(5 * th + seed * 1.7) + 0.03 * Math.sin(7 * th + seed * 2.3)
    if (hole.form === 'tear') r *= 0.8 + 0.55 * Math.pow(Math.max(0, Math.cos(th)), 3)
    else if (hole.form === 'kidney') r *= 1 - 0.36 * Math.pow(Math.max(0, Math.sin(th)), 2)
    else if (hole.form === 'slot') r *= 1 - 0.1 * Math.pow(Math.sin(th), 2) + 0.06 * Math.sin(2 * th + seed)
    else if (hole.form === 'double') r *= (0.7 + 0.42 * Math.pow(Math.abs(Math.cos(th)), 0.7)) * (1 + 0.2 * Math.cos(th))
    const x = Math.cos(th) * hole.a * r * scale
    const y = Math.sin(th) * hole.b * r * scale
    points.push(pt(centre.x + x * c - y * s, centre.y + x * s + y * c))
  }
  return points
}

/** A crescent along part of a ring: from the ring itself in toward `centre` by `depth` (a share), deepest at `facing`
 * (radians, on the sheet), over `span` either side of it; `outward` lays it just outside the ring instead. */
function crescent(ring: Point[], centre: Point, facing: number, span: number, depth: number, outward = false): Point[] {
  const outer: Point[] = []
  const inner: Point[] = []
  const count = ring.length
  const pick: Array<[number, Point]> = []
  ring.forEach(p => {
    let off = Math.atan2(p.y - centre.y, p.x - centre.x) - facing
    off = Math.atan2(Math.sin(off), Math.cos(off))
    if (Math.abs(off) < span) pick.push([off, p])
  })
  if (pick.length < 2 || count < 3) return []
  pick.sort((a, b) => a[0] - b[0])
  pick.forEach(([off, p]) => {
    const weight = Math.pow(Math.cos((off / span) * (Math.PI / 2)), 0.8)
    const dx = p.x - centre.x
    const dy = p.y - centre.y
    outer.push(p)
    inner.push(outward ? pt(p.x + dx * depth * weight, p.y + dy * depth * weight) : pt(p.x - dx * depth * weight, p.y - dy * depth * weight))
  })
  return outer.concat(inner.reverse())
}

/** A band beside a run of points, on the side given at each point (a unit vector), as wide there as `widths` says, starting
 * `gap` off the run. */
function sideBand(line: Point[], sides: Point[], widths: number[], gap = 0): Point[] {
  const near = line.map((p, index) => pt(p.x + (sides[index]?.x ?? 0) * gap, p.y + (sides[index]?.y ?? 0) * gap))
  const far = line.map((p, index) => pt(p.x + (sides[index]?.x ?? 0) * (gap + (widths[index] ?? 0)), p.y + (sides[index]?.y ?? 0) * (gap + (widths[index] ?? 0))))
  return near.concat(far.reverse())
}

/** The light on a stone's face, worked out on a fine grid over it: the face rounded over from every edge (its holes' rims
 * too) and lumpy, lit from `light`, and by night (the rockery) also by the lamp in the pavilion. Outside the stone each cell
 * takes the light of the nearest cell on it, so the washes run on past the edge and the stone's own shape trims them. */
interface RockField {
  x0: number
  y0: number
  cell: number
  w: number
  h: number
  light: Float32Array
  lamp?: Float32Array
}

function edt1(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array): void {
  let k = 0
  v[0] = 0
  z[0] = -1e20
  z[1] = 1e20
  for (let q = 1; q < n; q += 1) {
    let s = (f[q] as number) + q * q - ((f[v[k] as number] as number) + (v[k] as number) * (v[k] as number))
    s /= 2 * q - 2 * (v[k] as number)
    while (s <= (z[k] as number)) {
      k -= 1
      s = ((f[q] as number) + q * q - ((f[v[k] as number] as number) + (v[k] as number) * (v[k] as number))) / (2 * q - 2 * (v[k] as number))
    }
    k += 1
    v[k] = q
    z[k] = s
    z[k + 1] = 1e20
  }
  k = 0
  for (let q = 0; q < n; q += 1) {
    while ((z[k + 1] as number) < q) k += 1
    const at0 = v[k] as number
    d[q] = (q - at0) * (q - at0) + (f[at0] as number)
  }
}

function scanFill(mask: Uint8Array, w: number, h: number, x0: number, y0: number, cell: number, poly: Point[], value: number): void {
  for (let j = 0; j < h; j += 1) {
    const y = y0 + (j + 0.5) * cell
    const xs: number[] = []
    for (let index = 0; index < poly.length; index += 1) {
      const a = poly[index] as Point
      const b = poly[(index + 1) % poly.length] as Point
      if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x))
    }
    xs.sort((p, q) => p - q)
    for (let m = 0; m + 1 < xs.length; m += 2) {
      const from = Math.max(0, Math.ceil(((xs[m] as number) - x0) / cell - 0.5))
      const to = Math.min(w - 1, Math.floor(((xs[m + 1] as number) - x0) / cell - 0.5))
      for (let i = from; i <= to; i += 1) mask[j * w + i] = value
    }
  }
}

function rockField(outline: Point[], holes: Point[][], form: RockForm, cell: number, light: number[], dimples: number[][], lamp?: { at: Point; reach: number }): RockField {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of outline) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  const x0 = minX - 3 * cell
  const y0 = minY - 3 * cell
  const w = Math.ceil((maxX - minX) / cell) + 7
  const h = Math.ceil((maxY - minY) / cell) + 7
  const size = w * h
  const mask = new Uint8Array(size)
  scanFill(mask, w, h, x0, y0, cell, outline, 1)
  for (const hole of holes) scanFill(mask, w, h, x0, y0, cell, hole, 0)
  // How far each cell on the stone lies from its nearest edge (Felzenszwalb's distance transform).
  const big = 1e10
  const grid = new Float64Array(size)
  for (let index = 0; index < size; index += 1) grid[index] = mask[index] ? big : 0
  const longest = Math.max(w, h)
  const f = new Float64Array(longest)
  const d = new Float64Array(longest)
  const v = new Int32Array(longest)
  const z = new Float64Array(longest + 1)
  for (let i = 0; i < w; i += 1) {
    for (let j = 0; j < h; j += 1) f[j] = grid[j * w + i] as number
    edt1(f, h, d, v, z)
    for (let j = 0; j < h; j += 1) grid[j * w + i] = d[j] as number
  }
  for (let j = 0; j < h; j += 1) {
    for (let i = 0; i < w; i += 1) f[i] = grid[j * w + i] as number
    edt1(f, w, d, v, z)
    for (let i = 0; i < w; i += 1) grid[j * w + i] = d[i] as number
  }
  // The face's height: rounded over from each edge, then lumpy; a little smoothed.
  const R = form.round
  const height = new Float32Array(size)
  for (let j = 0; j < h; j += 1) {
    for (let i = 0; i < w; i += 1) {
      const index = j * w + i
      if (!mask[index]) continue
      const dist = Math.sqrt(grid[index] as number) * cell
      const e = Math.min(dist, R) / R
      const x = x0 + (i + 0.5) * cell
      const y = y0 + (j + 0.5) * cell
      const stretch = form.stretch ?? 1.3
      const lump = 0.65 * wave2(x / 11, y / (11 * stretch), form.seed + 3) + 0.35 * wave2(x / 5, y / (5 * stretch), form.seed + 4)
      let dent = 0
      for (const [dx0 = 0, dy0 = 0, dr = 1, depth = 0] of dimples) {
        const q = ((x - dx0) * (x - dx0) + (y - dy0) * (y - dy0)) / (dr * dr)
        if (q < 1) dent += depth * (1 - q) * (1 - q)
      }
      height[index] = R * Math.sqrt(1 - (1 - e) * (1 - e)) + form.lumps * lump * Math.min(1, dist / 4) - dent * Math.min(1, dist / 2)
    }
  }
  let smooth = new Float32Array(size)
  for (let pass = 0; pass < 2; pass += 1) {
  if (pass) height.set(smooth)
  smooth = new Float32Array(size)
  for (let j = 0; j < h; j += 1) {
    for (let i = 0; i < w; i += 1) {
      const index = j * w + i
      if (!mask[index]) continue
      let total = 0
      let weight = 0
      for (let dj = -1; dj <= 1; dj += 1) {
        for (let di = -1; di <= 1; di += 1) {
          const ii = i + di
          const jj = j + dj
          if (ii < 0 || jj < 0 || ii >= w || jj >= h) continue
          const at0 = jj * w + ii
          total += mask[at0] ? (height[at0] as number) : 0
          weight += 1
        }
      }
      smooth[index] = total / weight
    }
  }
  }
  const [lx = 0, ly = 0, lz = 1] = light
  const lightGrid = new Float32Array(size)
  const lampGrid = lamp ? new Float32Array(size) : undefined
  const known = new Uint8Array(size)
  const queue = new Int32Array(size)
  let tail = 0
  for (let j = 0; j < h; j += 1) {
    for (let i = 0; i < w; i += 1) {
      const index = j * w + i
      if (!mask[index]) continue
      const at0 = (ii: number, jj: number): number => {
        const c = Math.max(0, Math.min(w - 1, ii)) + Math.max(0, Math.min(h - 1, jj)) * w
        return mask[c] ? (smooth[c] as number) : 0
      }
      const gx = (at0(i + 1, j) - at0(i - 1, j)) / (2 * cell)
      const gy = (at0(i, j + 1) - at0(i, j - 1)) / (2 * cell)
      const norm = Math.hypot(gx, gy, 1)
      const nx = -gx / norm
      const ny = -gy / norm
      const nz = 1 / norm
      lightGrid[index] = nx * lx + ny * ly + nz * lz
      if (lamp && lampGrid) {
        const x = x0 + (i + 0.5) * cell
        const y = y0 + (j + 0.5) * cell
        const dx = lamp.at.x - x
        const dy = lamp.at.y - y
        const dz = 26
        const dist = Math.hypot(dx, dy, dz)
        lampGrid[index] = ((nx * dx + ny * dy + nz * dz) / dist) * Math.exp(-Math.hypot(dx, dy) / lamp.reach)
      }
      known[index] = 1
      queue[tail] = index
      tail += 1
    }
  }
  // Off the stone, each cell takes the light of the nearest cell on it.
  let head = 0
  while (head < tail) {
    const index = queue[head] as number
    head += 1
    const i = index % w
    const j = (index - i) / w
    const near = [i > 0 ? index - 1 : -1, i < w - 1 ? index + 1 : -1, j > 0 ? index - w : -1, j < h - 1 ? index + w : -1]
    for (const next of near) {
      if (next < 0 || known[next]) continue
      known[next] = 1
      lightGrid[next] = lightGrid[index] as number
      if (lampGrid) lampGrid[next] = lampGrid[index] as number
      queue[tail] = next
      tail += 1
    }
  }
  return { x0, y0, cell, w, h, light: lightGrid, lamp: lampGrid }
}

/** The light at a point of the sheet, read off the field. */
function fieldAt(field: RockField, values: Float32Array, x: number, y: number): number {
  const i = Math.max(0, Math.min(field.w - 1, Math.floor((x - field.x0) / field.cell)))
  const j = Math.max(0, Math.min(field.h - 1, Math.floor((y - field.y0) / field.cell)))
  return values[j * field.w + i] as number
}

/** The outlines of the part of the field above `level` (`sign` 1) or below it (-1), as closed rings on the sheet (marching
 * squares, the crossings placed along each cell's sides by the values at its corners). */
function levelRings(field: RockField, values: Float32Array, level: number, sign: number, tolerance: number, least: number): Point[][] {
  const { w, h, x0, y0, cell } = field
  const value = (i: number, j: number): number => (i >= 0 && j >= 0 && i < w && j < h ? (values[j * w + i] as number) : level - sign * 1000)
  const isIn = (i: number, j: number): boolean => sign * (value(i, j) - level) > 0
  const key = (i: number, j: number, vertical: number): number => ((j + 1) * (w + 2) + (i + 1)) * 2 + vertical
  const starts = new Map<number, { end: number; at: Point }>()
  const cross = (i1: number, j1: number, i2: number, j2: number): Point => {
    const a = value(i1, j1)
    const b = value(i2, j2)
    const f = Math.max(0, Math.min(1, (level - a) / (b - a || 1e-9)))
    return pt(x0 + (i1 + (i2 - i1) * f + 0.5) * cell, y0 + (j1 + (j2 - j1) * f + 0.5) * cell)
  }
  for (let j = -1; j < h; j += 1) {
    for (let i = -1; i < w; i += 1) {
      const corners: Array<[number, number]> = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]]
      const flags = corners.map(([a, b]) => isIn(a, b))
      if (flags.every(Boolean) || !flags.some(Boolean)) continue
      const edges = [key(i, j, 0), key(i + 1, j, 1), key(i, j + 1, 0), key(i, j, 1)]
      const outs: number[] = []
      const ins: number[] = []
      for (let e = 0; e < 4; e += 1) {
        const here = flags[e]
        const next = flags[(e + 1) % 4]
        if (here && !next) outs.push(e)
        else if (!here && next) ins.push(e)
      }
      const at0 = (e: number): Point => {
        const [a, b] = corners[e] as [number, number]
        const [c, d] = corners[(e + 1) % 4] as [number, number]
        return cross(a, b, c, d)
      }
      const pairsOf: Array<[number, number]> = []
      if (outs.length === 1) pairsOf.push([outs[0] as number, ins[0] as number])
      else {
        const centre = (value(i, j) + value(i + 1, j) + value(i + 1, j + 1) + value(i, j + 1)) / 4
        const joined = sign * (centre - level) > 0
        for (const o of outs) {
          const next = joined ? (o + 1) % 4 : (o + 3) % 4
          pairsOf.push([o, next])
        }
      }
      for (const [from, to] of pairsOf) starts.set(edges[from] as number, { end: edges[to] as number, at: at0(from) })
    }
  }
  const loops: Point[][] = []
  for (const [first] of starts) {
    if (!starts.has(first)) continue
    const loop: Point[] = []
    let current = first
    let guard = 0
    while (starts.has(current) && guard < 100000) {
      const seg = starts.get(current) as { end: number; at: Point }
      starts.delete(current)
      loop.push(seg.at)
      current = seg.end
      guard += 1
    }
    if (loop.length < 3) continue
    const simple = simplifyRing(loop, tolerance)
    if (simple.length > 2 && Math.abs(ringArea(simple)) >= least) loops.push(simple)
  }
  return loops
}

/** Light for a stone: which way the light falls (x, y on the sheet, z toward the eye; any length). */
function lightFrom(x: number, y: number, z: number): number[] {
  const size = Math.hypot(x, y, z) || 1
  return [x / size, y / size, z / size]
}

/** One stone, drawn. `k` is how many sheet units one of its units is (1 on the sheet, 1.5 in the pavilion's group), so that
 * its lines and details keep their size on the sheet. `pen` is the paint of its line (the ink, or a gradient that fades into
 * the water); `lamp` (by night, the rockery) the lit pavilion: where it is, its colour, how far it reaches, its cover. */
function rockDraw(
  id: string,
  form: RockForm,
  tone: RockTone,
  k: number,
  light: number[],
  pen: string,
  lamp?: { at: Point; colour: string; reach: number; cover: number },
  moon = true,
): Built {
  const frame = rockFrame(form, k)
  const rand = rng(form.seed * 977 + 13)
  const unit = 1 / k
  const outline = frame.right.concat(frame.left.slice().reverse())
  // The holes, each set on the face and turned with the spine; shrunk until it lies inside the stone with a rim to spare.
  const placed = form.holes.map((hole, index) => {
    const face = faceAt(frame, hole.s, hole.u)
    const angle = Math.atan2(face.t.y, face.t.x) + (hole.tilt * Math.PI) / 180
    const seed = index * 2.3 + form.seed * 0.37
    const steps = Math.max(7, Math.min(20, Math.round(Math.max(hole.a, hole.b) * k * 1.0)))
    let scale = 1
    let rim = holeRim(hole, face.at, angle, scale, seed, steps)
    const margin = 1.1 * unit
    const fits = (ring: Point[]): boolean =>
      ring.every(p => {
        const dx = p.x - face.at.x
        const dy = p.y - face.at.y
        const size = Math.hypot(dx, dy) || 1
        return insidePolygon(outline, p.x + (dx / size) * margin, p.y + (dy / size) * margin)
      })
    let guard = 0
    while (!fits(rim) && guard < 16) {
      scale *= 0.9
      rim = holeRim(hole, face.at, angle, scale, seed, steps)
      guard += 1
    }
    // A hole that goes through: its far opening, smaller, pushed toward where the tunnel runs.
    let cut: Point[] | null = null
    if (hole.through) {
      const wall = hole.wall ?? 0.35
      const toward = ((hole.toward ?? 220) * Math.PI) / 180
      let push = wall * Math.min(hole.a, hole.b) * scale * 0.95
      const shrink = 1 - wall * 0.75
      for (let tries = 0; tries < 12; tries += 1) {
        const centre = pt(face.at.x + Math.cos(toward) * push, face.at.y + Math.sin(toward) * push)
        const ring = holeRim(hole, centre, angle, scale * shrink, seed + 0.4, steps)
        if (ring.every(p => insidePolygon(rim, p.x, p.y))) {
          cut = ring
          break
        }
        push *= 0.8
      }
      if (!cut) cut = holeRim(hole, face.at, angle, scale * 0.5, seed + 0.4, steps)
    }
    return { hole, face, rim, cut, scale, angle, size: Math.max(hole.a, hole.b) * scale * k }
  })
  const ellipseReach = (p: Point, item: (typeof placed)[number]): number => {
    const dx = p.x - item.face.at.x
    const dy = p.y - item.face.at.y
    const c = Math.cos(-item.angle)
    const s = Math.sin(-item.angle)
    return Math.hypot((dx * c - dy * s) / (item.hole.a * item.scale), (dx * s + dy * c) / (item.hole.b * item.scale))
  }
  const nearHole = (p: Point, reach: number): boolean => placed.some(item => ellipseReach(p, item) < reach)
  const lightDir = pt(light[0] ?? 0, light[1] ?? 0)
  const lightAngle = Math.atan2(lightDir.y, lightDir.x)
  // Shallow hollows scooped in the face (弹窝), a few clustered: each a bowl the field lights as a bowl.
  const dimples: number[][] = []
  for (let tries = 0; tries < (form.dimples ?? 0) * 12 && dimples.length < (form.dimples ?? 0); tries += 1) {
    const anchor = dimples.length && rand() < 0.45 ? dimples[Math.floor(rand() * dimples.length)] : null
    let at0: Point
    if (anchor) {
      const turn = rand() * Math.PI * 2
      const reach = ((anchor[2] ?? 3) + (2 + rand() * 3) * unit) * 1.05
      at0 = pt((anchor[0] ?? 0) + Math.cos(turn) * reach, (anchor[1] ?? 0) + Math.sin(turn) * reach)
    } else at0 = faceAt(frame, 0.04 + rand() * 0.92, (rand() * 2 - 1) * 0.8).at
    const r = (2.4 + Math.pow(rand(), 1.5) * 4.2) * unit
    if (!insidePolygon(outline, at0.x, at0.y) || nearHole(at0, 1.25 + r / 4)) continue
    dimples.push([at0.x, at0.y, r, r * (0.34 + 0.16 * rand())])
  }
  // The light is worked out on the stone's body without the small wear of its edge, so that its washes run smooth.
  const plain = rockFrame(form, k, true)
  const field = rockField(plain.right.concat(plain.left.slice().reverse()), placed.map(item => item.rim), form, 1.35 * unit, light, dimples, lamp ? { at: lamp.at, reach: lamp.reach } : undefined)
  const tol = 1.2 * unit
  const least = 22 * unit * unit
  // The washes of the light: two of shade (the second laid over the first), one of light, and by night the lamp's.
  const shade1 = levelRings(field, field.light, 0.48, -1, tol, least)
  const shade2 = form.flat ? [] : levelRings(field, field.light, 0.2, -1, tol, least)
  const litRings = moon ? levelRings(field, field.light, 0.79, 1, tol, least) : []
  const lampRings = lamp && field.lamp ? levelRings(field, field.lamp, 0.15, 1, tol * 1.4, least) : []
  const lightAt = (p: Point): number => fieldAt(field, field.light, p.x, p.y)

  // Flutes: grooves along the spine, spread across the face, bending round the holes.
  const grooves: Point[][] = []
  const flanks: Point[][] = []
  const fluteInk: Point[][] = []
  const lengthShare = form.fluteLength ?? 0.32
  const order = Array.from({ length: form.flutes }, (_, index) => index)
  for (let index = order.length - 1; index > 0; index -= 1) {
    const other = Math.floor(rand() * (index + 1))
    const swap = order[index] as number
    order[index] = order[other] as number
    order[other] = swap
  }
  order.forEach((slot, flute) => {
    const u0 = -0.8 + (1.6 * (slot + 0.2 + 0.6 * rand())) / Math.max(1, form.flutes)
    const span = Math.min(0.9, lengthShare * (0.4 + 1.1 * Math.pow(rand(), 1.4)))
    const s0 = 0.03 + rand() * (0.9 - span)
    const along = span * frame.length * k
    const steps = Math.max(3, Math.round(along / 6))
    const line: Point[] = []
    for (let step = 0; step <= steps; step += 1) {
      const s = s0 + (span * step) / steps
      const u = u0 + 0.08 * wave((s * frame.length * k) / 11, form.seed * 7 + flute)
      let at0 = faceAt(frame, s, Math.max(-0.92, Math.min(0.92, u))).at
      // Round the holes: pushed out from each hole's centre to a little beyond its rim.
      for (const item of placed) {
        const r = ellipseReach(at0, item) / 1.5
        if (r < 1 && r > 1e-6) {
          const dx = at0.x - item.face.at.x
          const dy = at0.y - item.face.at.y
          at0 = pt(item.face.at.x + dx / r, item.face.at.y + dy / r)
        }
      }
      line.push(at0)
    }
    // The groove's own direction, and which side of it the light falls on: the flank on that side faces away from it.
    const dirs = line.map((_, index) => {
      const a = line[Math.max(0, index - 1)] as Point
      const b = line[Math.min(line.length - 1, index + 1)] as Point
      const dx = b.x - a.x
      const dy = b.y - a.y
      const size = Math.hypot(dx, dy) || 1
      return pt(-dy / size, dx / size)
    })
    const side = dirs.map(n0 => (n0.x * lightDir.x + n0.y * lightDir.y >= 0 ? n0 : pt(-n0.x, -n0.y)))
    const away = side.map(n0 => pt(-n0.x, -n0.y))
    const broad = (1.2 + 1.6 * rand()) * unit
    const last = line.length - 1
    const swell = line.map((_, index) => Math.pow(Math.sin((Math.PI * (index + 0.5)) / (last + 1)), 0.7))
    grooves.push(sideBand(line, side, swell.map(v => v * broad), -0.3 * unit))
    // The lit flank, where the face is in the light.
    if (rand() < 0.15) {
      const lit = line.map(p => lightAt(p) > 0.42)
      const from = lit.indexOf(true)
      const to = lit.lastIndexOf(true)
      if (from >= 0 && to - from >= 2) {
        const pts = line.slice(from, to + 1)
        const widths = pts.map((_, order2) => Math.sin((Math.PI * (order2 + 0.5)) / pts.length) * (0.6 + 0.5 * rand()) * unit)
        flanks.push(sideBand(pts, away.slice(from, to + 1), widths, 0.45 * unit))
      }
    }
    // A broken line in the bottom of most grooves.
    if (rand() < 0.75) {
      let index = Math.floor(rand() * 2)
      while (index < last) {
        const runLength = 2 + Math.floor(rand() * 3)
        const piece = line.slice(index, Math.min(last, index + runLength) + 1)
        if (piece.length >= 2) fluteInk.push(piece)
        index += runLength + 1
      }
    }
  })

  // Ledges: an overhang across the face, light along its top, shade under it, a line at its edge.
  const ledgeShade: Point[][] = []
  const ledgeLit: Point[][] = []
  const ledgeInk: Point[][] = []
  for (const [s0 = 0.5, u0 = -1, u1 = 1, bow = 0, strength = 1] of form.ledges ?? []) {
    const steps = 9
    const line: Point[] = []
    for (let step = 0; step <= steps; step += 1) {
      const f = step / steps
      line.push(faceAt(frame, s0 + bow * Math.sin(Math.PI * f) + 0.01 * wave(f * 5, form.seed + s0 * 100), u0 + (u1 - u0) * f).at)
    }
    const dirs = line.map((_, index) => {
      const a = line[Math.max(0, index - 1)] as Point
      const b = line[Math.min(steps, index + 1)] as Point
      const dx = b.x - a.x
      const dy = b.y - a.y
      const size = Math.hypot(dx, dy) || 1
      return pt(-dy / size, dx / size)
    })
    const down = dirs.map(n0 => (n0.x * lightDir.x + n0.y * lightDir.y <= 0 ? n0 : pt(-n0.x, -n0.y)))
    const up = down.map(n0 => pt(-n0.x, -n0.y))
    const swell = line.map((_, index) => Math.pow(Math.sin((Math.PI * (index + 0.3)) / (steps + 0.6)), 0.8))
    ledgeShade.push(sideBand(line, down, swell.map(v => v * (3.2 + 2.2 * rand()) * strength * unit), -0.2 * unit))
    ledgeLit.push(sideBand(line, up, swell.map(v => v * 1.1 * unit), 0.3 * unit))
    ledgeInk.push(line.slice(1, steps))
  }

  // The holes: shade spilling below each; the far wall (the whole rim: the far opening is cut out of the stone), darkest under
  // the lip that faces the light; inside a hollow its lit far side; a thin lit lip on the side away from the light; the line of
  // the shaded lip.
  const spill: Point[][] = []
  const walls: Point[][] = []
  const cores: Point[][] = []
  const smallWalls: Point[][] = []
  const smallCores: Point[][] = []
  const glows: Point[][] = []
  const lips: Point[][] = []
  const rimInk: Point[][] = []
  for (const item of placed) {
    const { rim, face } = item
    const r = item.size
    ;(r > 4 ? walls : smallWalls).push(rim)
    ;(r > 4 ? cores : smallCores).push(crescent(rim, face.at, lightAngle, Math.PI * 0.6, item.hole.through ? 0.5 : 0.58))
    if (!item.hole.through && r > 5) glows.push(crescent(rim, face.at, lightAngle + Math.PI, Math.PI * 0.45, 0.28))
    if (r > 6) lips.push(crescent(rim, face.at, lightAngle + Math.PI, Math.PI * 0.4, 0.12, true))
    if (r > 3) {
      const tail = (1.8 + 1.4 * rand()) * item.hole.a * item.scale
      const across = 0.6 * item.hole.b * item.scale
      const dx = -lightDir.x * 0.3
      const dy = 1
      const size = Math.hypot(dx, dy)
      const ux = dx / size
      const uy = dy / size
      const base = face.at
      spill.push([
        pt(base.x - uy * across, base.y + ux * across),
        pt(base.x - uy * across * 0.8 + ux * tail * 0.5, base.y + ux * across * 0.8 + uy * tail * 0.5),
        pt(base.x + ux * tail, base.y + uy * tail),
        pt(base.x + uy * across * 0.8 + ux * tail * 0.5, base.y - ux * across * 0.8 + uy * tail * 0.5),
        pt(base.x + uy * across, base.y - ux * across),
      ])
    }
    const arc = rim
      .map(p => {
        let off = Math.atan2(p.y - face.at.y, p.x - face.at.x) - lightAngle
        off = Math.atan2(Math.sin(off), Math.cos(off))
        return [off, p] as [number, Point]
      })
      .filter(([off]) => Math.abs(off) < Math.PI * 0.55)
      .sort((a, b) => a[0] - b[0])
      .map(([, p]) => p)
    if (arc.length >= 3 && r > 1.6) rimInk.push(arc)
  }

  // A cave mouth at the foot: dark, its roof arched and uneven, open at the water.
  let cave = ''
  let caveRing: Point[][] = []
  let caveArch: Point[] = []
  if (form.cave) {
    const [crown = 0.2, mid = 0, half = 0.3] = form.cave
    const roof: Point[] = []
    for (let step = 0; step <= 10; step += 1) {
      const f = step / 10
      const u = mid - half + 2 * half * f
      const rise = Math.pow(Math.sin(Math.PI * Math.pow(f, 0.75)), 0.6) * crown * (0.8 + 0.45 * wave(f * 5, form.seed + 5))
      roof.push(faceAt(frame, Math.max(0.005, rise), u).at)
    }
    const footL = faceAt(frame, -0.05, mid - half).at
    const footR = faceAt(frame, -0.05, mid + half).at
    caveArch = roof
    caveRing = [[footL].concat(roof, [footR])]
    cave = 'y'
  }

  // A flat stone's lip: the edge where its top meets its front, light above it, a wash of shade on the front below it.
  const lipLine: Point[] = []
  const lipSide: Point[][] = []
  const front: Point[][] = []
  if (form.lip !== undefined) {
    for (let step = 0; step <= 12; step += 1) lipLine.push(faceAt(frame, 0.04 + (0.92 * step) / 12, form.lip + 0.12 * wave(step * 0.7, form.seed + 2)).at)
    const top: Point[] = []
    const bottom: Point[] = []
    for (let step = 0; step <= 12; step += 1) {
      top.push(faceAt(frame, 0.03 + (0.94 * step) / 12, -1.2).at)
      bottom.push(faceAt(frame, 0.03 + (0.94 * step) / 12, 1.2).at)
    }
    lipSide.push(lipLine.concat(top.slice().reverse()))
    front.push(lipLine.concat(bottom.slice().reverse()))
  }
  let under = ''
  if (form.under) {
    const edge = frame.right.filter((_, index) => index % 2 === 0)
    const depth = form.under
    under = rings([edge.concat(edge.slice().reverse().map((p, index) => pt(p.x + 1.5 * wave(index * 0.5, form.seed), p.y + depth * (0.75 + 0.35 * wave(index * 0.4, form.seed + 1)))))])
  }

  // Pits (弹子窝): small clusters, thick in the shade and round the holes, thin on the lit planes.
  const pits: Point[][] = []
  const pitRings: Point[][] = []
  let clusters = 0
  for (let tries = 0; tries < form.pits * 14 && clusters < form.pits; tries += 1) {
    const s = 0.03 + 0.94 * rand()
    const u = (rand() * 2 - 1) * 0.86
    const centre = faceAt(frame, s, u).at
    if (nearHole(centre, 1.3)) continue
    const lit = lightAt(centre)
    const near = nearHole(centre, 2.6) ? 0.35 : 0
    if (rand() > 0.22 + 0.55 * Math.max(0, Math.min(1, 0.85 - lit)) + near) continue
    clusters += 1
    const count = 2 + Math.floor(rand() * 4)
    const spread = (1.5 + rand() * 2.6) * unit
    for (let pit = 0; pit < count; pit += 1) {
      const angle0 = rand() * Math.PI * 2
      const reach = spread * Math.sqrt(rand())
      const at0 = pt(centre.x + Math.cos(angle0) * reach, centre.y + Math.sin(angle0) * reach)
      if (!insidePolygon(outline, at0.x, at0.y) || nearHole(at0, 1.15)) continue
      const r = (0.42 + Math.pow(rand(), 1.8) * 1.15) * unit
      const squash = 0.6 + 0.4 * rand()
      const turn = rand() * Math.PI
      const ring: Point[] = []
      const sides = r * k > 0.9 ? 5 : 4
      for (let side = 0; side < sides; side += 1) {
        const th = (side / sides) * Math.PI * 2 + rand() * 0.5
        const x = Math.cos(th) * r * (0.85 + 0.3 * rand())
        const y = Math.sin(th) * r * squash
        ring.push(pt(at0.x + lightDir.x * r * 0.2 + x * Math.cos(turn) - y * Math.sin(turn), at0.y + lightDir.y * r * 0.2 + x * Math.sin(turn) + y * Math.cos(turn)))
      }
      pits.push(ring)
      if (r * k > 1.05 && rand() < 0.4) pitRings.push(ring.map(p => pt(at0.x + (p.x - at0.x) * 1.4, at0.y + (p.y - at0.y) * 1.4)))
    }
  }

  // The brush line's weight round the outline: heavy where the edge turns from the light (by night, where it takes it).
  const turnSign = ringArea(outline) > 0 ? 1 : -1
  const brush: Point[][] = []
  let runPts: Point[] = []
  let runNorm: Point[] = []
  let runWeight: number[] = []
  const flushBrush = (): void => {
    if (runPts.length >= 3) {
      const total = runPts.length
      const widths = runWeight.map((weight, index) => weight * Math.min(1, (index + 0.5) / 3, (total - index - 0.5) / 3))
      const outer = runPts.map((p, index) => pt(p.x + (runNorm[index]?.x ?? 0) * (widths[index] ?? 0) * 0.35, p.y + (runNorm[index]?.y ?? 0) * (widths[index] ?? 0) * 0.35))
      const inner = runPts.map((p, index) => pt(p.x - (runNorm[index]?.x ?? 0) * (widths[index] ?? 0) * 0.65, p.y - (runNorm[index]?.y ?? 0) * (widths[index] ?? 0) * 0.65))
      brush.push(simplifyRing(outer.concat(inner.reverse()), 0.16 * unit))
    }
    runPts = []
    runNorm = []
    runWeight = []
  }
  const openFoot = form.buried || form.wet
  const footY = (frame.p[0] as Point).y
  for (let index = 0; index < outline.length; index += 2) {
    const a = outline[Math.max(0, index - 2)] as Point
    const b = outline[Math.min(outline.length - 1, index + 2)] as Point
    const here = outline[index] as Point
    const dx = b.x - a.x
    const dy = b.y - a.y
    const size = Math.hypot(dx, dy) || 1
    const out = pt((dy / size) * turnSign, (-dx / size) * turnSign)
    const facing = out.x * lightDir.x + out.y * lightDir.y
    const weight = tone.rimLit ? Math.max(0, facing - 0.05) / 0.95 : Math.max(0, -facing - 0.02) / 0.98
    const low = form.buried ? Math.max(0, Math.min(1, (here.y - footY + 14 * unit) / (14 * unit))) : 0
    const w = (0.3 + 1.6 * Math.pow(weight, 1.1) + 0.5 * low) * unit * (0.8 + 0.4 * wave(index * 0.21, form.seed + 77))
    if ((openFoot && (index < 2 || index > outline.length - 3)) || weight < 0.08) {
      flushBrush()
      continue
    }
    runPts.push(here)
    runNorm.push(out)
    runWeight.push(w)
  }
  flushBrush()

  // Paths in plain paints are written in whole numbers of a small unit (half a sheet unit) and drawn scaled down: shorter.
  const Q = Math.round(2 * k)
  const down = ` transform="scale(${Q === 2 ? '.5' : '.33333'})"`
  const plainPen = !pen.startsWith('url')
  const qi = plainPen ? Q : 1

  // Moss dots (苔点): ink dabs at the foot, in the bays, on the ledges.
  const fixInk = fixer(qi)
  let moss = ''
  pairs(form.moss ?? []).forEach((q, index) => {
    const dot = faceAt(frame, q.x, q.y).at
    const size = (0.5 + 0.9 * hashUnit(index, form.seed)) * unit
    moss += `M${fixInk(dot.x)} ${fixInk(dot.y)}h${fixInk(size)}`
    moss += `m${fixInk((2.2 + 1.2 * hashUnit(index, form.seed + 1)) * unit)} ${fixInk((0.6 - 1.4 * hashUnit(index, form.seed + 2)) * unit)}h${qi > 1 ? 0 : 0.1}`
    if (hashUnit(index, form.seed + 3) > 0.4) moss += `m${fixInk(-(5 + 1.4 * hashUnit(index, form.seed + 4)) * unit)} ${fixInk((0.4 + hashUnit(index, form.seed + 5)) * unit)}h${qi > 1 ? 0 : 0.1}`
  })

  // The stone's body: the outline (open across a buried or wet foot, so that its line is not drawn there) and the far
  // openings of the holes that go through, cut out of it.
  const cuts = placed.flatMap(item => (item.cut ? [item.cut] : []))
  const body = rings([simplify(outline, 0.34 * unit)], !openFoot, qi) + smoothRings(cuts, true, qi)
  const t = tone
  const wash = (d: string, strength: number, rule = false): string =>
    d ? `<path d="${d}" fill="${t.shade}" fill-opacity="${share(strength * t.shadeAlpha)}"${rule ? ' fill-rule="evenodd"' : ''}/>` : ''
  const deep = (d: string, strength: number): string => (d ? `<path d="${d}" fill="${t.deep}" fill-opacity="${share(strength * t.deepAlpha)}"/>` : '')
  const litFill = (d: string, strength: number, rule = false): string =>
    d ? `<path d="${d}" fill="${t.lit}" fill-opacity="${share(strength * t.litAlpha)}"${rule ? ' fill-rule="evenodd"' : ''}/>` : ''
  const ink = (d: string, width: number, strength: number): string =>
    d ? `<path d="${d}" stroke="${pen}" stroke-width="${round(width * unit * qi * 100) / 100}" stroke-opacity="${share(strength * t.lineAlpha)}"/>` : ''
  const defs = `<path id="${id}"${plainPen ? down : ''} fill-rule="evenodd" clip-rule="evenodd" d="${body}"/><clipPath id="${id}k"><use href="#${id}"/></clipPath>`
  const fills =
    wash(smoothRings(shade1, true, Q), 1, true) +
    wash(smoothRings(shade2, true, Q), 1.15, true) +
    (moon ? litFill(smoothRings(litRings, true, Q), 1, true) : '') +
    (lamp && lampRings.length ? `<path d="${smoothRings(lampRings, true, Q)}" fill="${lamp.colour}" fill-opacity="${share(lamp.cover * 0.42)}" fill-rule="evenodd"/>` : '') +
    wash(rings(wound(front), true, Q), 1.2) +
    wash(rings(wound(spill), true, Q) + rings(wound(ledgeShade), true, Q) + rings(wound(grooves), true, Q), 1.25) +
    litFill(rings(wound(flanks.concat(ledgeLit)), true, Q), 0.8) +
    deep(smoothRings(wound(walls), true, Q) + rings(wound(smallWalls), true, Q), 0.58) +
    deep(smoothRings(wound(cores), true, Q) + rings(wound(smallCores), true, Q) + rings(wound(pits), true, Q), 0.7) +
    litFill(smoothRings(wound(glows), true, Q), 0.42) +
    litFill(smoothRings(wound(lips), true, Q), 0.36) +
    deep(cave ? smoothRings(caveRing, true, Q) : '', 0.9)
  const inks =
    ink(rings(fluteInk, false, qi) + smoothRings(pitRings, true, qi), 0.42, 0.45) +
    ink(
      smoothRings(rimInk, false, qi) + rings(ledgeInk, false, qi) + smoothRings(caveArch.length ? [caveArch] : [], false, qi) + smoothRings(lipLine.length ? [lipLine] : [], false, qi),
      0.7,
      0.7,
    )
  const outer =
    (brush.length ? `<path d="${rings(wound(brush), true, qi)}" fill="${pen}" fill-opacity="${share(0.9 * t.lineAlpha)}"/>` : '') +
    (moss ? `<path d="${moss}" stroke="${pen}" stroke-width="${round(1.7 * unit * qi * 10) / 10}" stroke-opacity="${share(0.85 * t.lineAlpha)}"/>` : '')
  const markup =
    (under ? `<path d="${under}" fill="url(#ru)"/>` : '') +
    `<use href="#${id}" fill="${t.body}"/>` +
    `<g clip-path="url(#${id}k)"><g${down}>${fills}${plainPen ? inks : ''}</g>${plainPen ? '' : inks}</g>` +
    `<use href="#${id}" stroke="${pen}" stroke-width="${round(0.65 * unit * qi * 100) / 100}" stroke-opacity="${share(0.85 * t.lineAlpha)}"/>` +
    (plainPen ? `<g${down}>${outer}</g>` : outer)
  return { defs, markup }
}

// ---------------------------------------------------------------------------------------------------------------------
// The left peak (立峰), after the Lingering Garden's 冠云峰 and 晚翠峰: lean and top-heavy (上大下小), its head a broad crown
// of lobes leaning over to the left toward the gate and overhanging its neck, the neck pinched, a stubby spur low on the right,
// the foot flaring into the planted bed. Its holes in a strict order of size: one large and ragged high in the head with a
// cluster of smaller ones round it, a chain of slots and hollows down the body, one through the spur. In sheet units; the light
// from the sun or moon at the upper right.

const LEFT_PEAK: RockForm = {
  seed: 11,
  spine: [376, 884, 376, 835, 375, 798, 374, 765, 373, 740, 375, 712, 376, 685, 373, 660, 367, 638, 360, 619, 352, 603],
  left: [0, 34, 0.05, 31, 0.17, 26, 0.3, 29, 0.41, 24, 0.49, 25, 0.59, 17, 0.66, 20, 0.74, 21, 0.8, 24, 0.845, 40, 0.9, 44, 0.95, 31, 1, 14],
  right: [0, 33, 0.05, 30, 0.17, 28, 0.3, 32, 0.37, 26, 0.41, 27, 0.49, 30, 0.59, 19, 0.66, 27, 0.75, 36, 0.83, 34, 0.89, 40, 0.94, 31, 1, 15],
  bites: [
    [0.435, 1, -0.32, 0.04, 0], [0.395, 1, 0.22, 0.025, 0], [0.8, 1, 0.22, 0.025, 1], [0.965, 1, 0.36, 0.02, 1], [0.92, 1, 0.22, 0.018, 1], [0.69, 1, 0.14, 0.03, 0],
    [0.53, 1, 0.12, 0.03, 0], [0.2, 1, 0.12, 0.03, 0], [0.83, -1, 0.12, 0.02, 0], [0.98, -1, 0.3, 0.016, 1], [0.935, -1, 0.18, 0.02, 1],
    [0.62, -1, 0.14, 0.025, 1], [0.38, -1, 0.16, 0.03, 0], [0.24, -1, 0.14, 0.03, 0],
  ],
  rough: 1.7,
  notches: 1.1,
  tip: 0.075,
  round: 12,
  lumps: 2.2,
  stretch: 2.4,
  dimples: 13,
  holes: [
    { s: 0.89, u: 0.05, a: 4.6, b: 11.5, tilt: -22, through: true, form: 'double', wall: 0.42, toward: 210 },
    { s: 0.84, u: -0.72, a: 2.4, b: 6.5, tilt: -15, through: false, form: 'kidney' },
    { s: 0.948, u: -0.32, a: 3.2, b: 2.2, tilt: 30, through: false, form: 'kidney' },
    { s: 0.82, u: 0.55, a: 2.2, b: 3, tilt: 0, through: false, form: 'tear' },
    { s: 0.862, u: -0.42, a: 2.6, b: 1.8, tilt: -20, through: false, form: 'oval' },
    { s: 0.928, u: 0.5, a: 2.6, b: 1.5, tilt: 10, through: true, form: 'slot', wall: 0.35, toward: 200 },
    { s: 0.735, u: 0.38, a: 4, b: 2.8, tilt: -10, through: true, form: 'tear', wall: 0.45, toward: 215 },
    { s: 0.78, u: 0.74, a: 2.4, b: 1.8, tilt: 0, through: true, form: 'oval', wall: 0.35, toward: 190 },
    { s: 0.765, u: -0.3, a: 2.6, b: 3.2, tilt: 0, through: false, form: 'tear' },
    { s: 0.665, u: -0.08, a: 7.5, b: 2.6, tilt: 8, through: true, form: 'slot', wall: 0.35, toward: 240 },
    { s: 0.6, u: 0.45, a: 3.4, b: 2.8, tilt: 20, through: false, form: 'kidney' },
    { s: 0.545, u: -0.55, a: 3.2, b: 2.6, tilt: 0, through: true, form: 'oval', wall: 0.35, toward: 210 },
    { s: 0.432, u: 0.78, a: 3.2, b: 4, tilt: 0, through: true, form: 'oval', wall: 0.3, toward: 180 },
    { s: 0.5, u: 0.15, a: 4.8, b: 3, tilt: -10, through: false, form: 'double' },
    { s: 0.34, u: 0.18, a: 6.5, b: 4, tilt: -10, through: true, form: 'double', wall: 0.4, toward: 225 },
    { s: 0.38, u: -0.5, a: 4, b: 3, tilt: 10, through: false, form: 'kidney' },
    { s: 0.25, u: -0.15, a: 3.4, b: 2.4, tilt: 0, through: false, form: 'tear' },
    { s: 0.2, u: 0.55, a: 2.6, b: 2.2, tilt: 15, through: true, form: 'oval', wall: 0.35, toward: 215 },
    { s: 0.12, u: 0.1, a: 3, b: 2, tilt: 0, through: false, form: 'oval' },
    { s: 0.71, u: 0.7, a: 2.4, b: 2, tilt: 0, through: false, form: 'oval' },
  ],
  flutes: 10,
  fluteLength: 0.3,
  ledges: [[0.575, -0.95, -0.2, 0.008, 1], [0.455, 0.35, 0.95, -0.006, 0.9], [0.285, -0.95, -0.35, 0.008, 0.9], [0.73, -0.55, 0.1, 0.01, 0.9]],
  pits: 10,
  moss: [0.02, -0.85, 0.03, 0.7, 0.38, -0.95, 0.62, -0.95, 0.8, 1, 0.43, 1, 0.79, -1],
  buried: true,
}

/** A small stone at the peak's foot: a low companion at its left, between it and the gate. */
const LEFT_COMPANIONS: RockForm[] = [
  {
    seed: 23,
    spine: [334, 882, 333, 862, 330, 846],
    right: [0, 22, 0.5, 20, 1, 12],
    left: [0, 24, 0.5, 21, 1, 14],
    bites: [[0.55, 1, 0.16, 0.1, 1]],
    rough: 1.2,
    tip: 0.3,
    round: 7,
    lumps: 0,
    dimples: 2,
    holes: [{ s: 0.45, u: -0.3, a: 2.6, b: 3.6, tilt: 0, through: false, form: 'kidney' }, { s: 0.62, u: 0.4, a: 1.8, b: 1.4, tilt: 0, through: false, form: 'oval' }],
    flutes: 2,
    fluteLength: 0.6,
    pits: 2,
    moss: [0.85, -0.4],
    buried: true,
  },
]

function leftPeak(stock: Stock): Built {
  const tone = stock.rocks.peak
  const light = lightFrom(0.62, -0.6, 0.5)
  const parts = [
    rockDraw('lc0', LEFT_COMPANIONS[0] as RockForm, tone, 1, light, tone.line),
    rockDraw('lp', LEFT_PEAK, tone, 1, light, tone.line),
  ]
  return { defs: parts.map(part => part.defs).join(''), markup: parts.map(part => part.markup).join('') }
}

// ---------------------------------------------------------------------------------------------------------------------
// The rockery under the pavilion (池山), in the pavilion's own units (its group is drawn at 1.5): lake stones piled in rough
// courses. Behind the pavilion, the main mass: high, at the right, two stones stacked, the upper one big above and small
// below, its crown leaning toward the pavilion, holes through it at its edge; the lower one eaten out at the water into a
// dark cave. In front of the pavilion, lower tips at uneven heights (one under its right column, one lower at its corner), and
// flat stones at the water whose lips hang over a dark undercut. A tuft of grass from a crack between the tips.

const ROCKERY_BACK: RockForm[] = [
  // The lower course of the main mass, down to the water, its cave low under it.
  {
    seed: 41,
    spine: [1561, 860, 1562, 836, 1565, 808],
    left: [0, 52, 0.4, 49, 0.8, 42, 1, 32],
    right: [0, 52, 0.5, 50, 1, 38],
    bites: [[0.5, -1, 0.14, 0.1, 1], [0.72, 1, 0.12, 0.08, 1], [0.86, -1, 0.1, 0.06, 0]],
    rough: 1.4,
    tip: 0.28,
    foot: 0.1,
    footKeep: 0.85,
    round: 8,
    lumps: 1.6,
    stretch: 1.2,
    dimples: 6,
    cave: [0.4, -0.14, 0.4],
    holes: [
      { s: 0.62, u: 0.5, a: 3.4, b: 5.5, tilt: -15, through: true, form: 'double', wall: 0.45, toward: 210 },
      { s: 0.66, u: -0.6, a: 2.2, b: 4, tilt: 20, through: false, form: 'slot' },
      { s: 0.84, u: 0.1, a: 1.8, b: 2.4, tilt: 0, through: false, form: 'kidney' },
      { s: 0.5, u: -0.15, a: 1.5, b: 1.9, tilt: 0, through: false, form: 'oval' },
    ],
    flutes: 5,
    fluteLength: 0.6,
    ledges: [[0.5, 0.35, 0.95, -0.02, 0.8]],
    pits: 5,
    moss: [0.95, -0.3, 0.5, 0.98],
    wet: true,
    under: 6,
  },
  // The upper stone, the high point: big above and small below, its crown leaning toward the pavilion and broken into
  // unequal tips, a hole through it at its right edge and another low at its left.
  {
    seed: 43,
    spine: [1571, 820, 1573, 792, 1576, 762, 1580, 735],
    left: [0, 30, 0.25, 37, 0.45, 34, 0.6, 22, 0.8, 24, 1, 12],
    right: [0, 26, 0.4, 28, 0.7, 24, 1, 14],
    bites: [[0.53, -1, 0.36, 0.05, 1], [0.15, -1, 0.18, 0.05, 1], [0.62, 1, 0.25, 0.05, 1], [0.9, 1, 0.24, 0.035, 1], [0.86, -1, 0.2, 0.04, 0], [0.3, 1, 0.12, 0.05, 0]],
    rough: 1.6,
    tip: 0.1,
    foot: 0.08,
    footKeep: 0.7,
    round: 8,
    lumps: 1.6,
    stretch: 1.4,
    dimples: 6,
    holes: [
      { s: 0.7, u: 0.15, a: 5, b: 3.8, tilt: 10, through: true, form: 'kidney', wall: 0.42, toward: 200 },
      { s: 0.45, u: -0.18, a: 3, b: 4, tilt: 0, through: true, form: 'double', wall: 0.4, toward: 210 },
      { s: 0.17, u: -0.62, a: 1.6, b: 2.2, tilt: 0, through: false, form: 'tear' },
      { s: 0.36, u: 0.8, a: 3, b: 2.2, tilt: 0, through: true, form: 'oval', wall: 0.3, toward: 180 },
      { s: 0.82, u: 0.45, a: 2, b: 1.5, tilt: 0, through: false, form: 'slot' },
      { s: 0.3, u: 0.05, a: 2.2, b: 1.8, tilt: 0, through: false, form: 'kidney' },
      { s: 0.52, u: -0.35, a: 1.8, b: 1.5, tilt: 0, through: false, form: 'oval' },
    ],
    flutes: 6,
    fluteLength: 0.55,
    ledges: [[0.4, -0.95, -0.3, 0.015, 1], [0.73, -0.9, -0.2, 0.02, 0.9]],
    pits: 5,
    moss: [0.4, -0.7, 0.73, -0.8, 0.99, 0.1],
  },
]

const ROCKERY_FRONT: RockForm[] = [
  // Under the pavilion's corner, beside the steps: the lowest tip.
  {
    seed: 51,
    spine: [1453, 852, 1452, 837, 1456, 823],
    left: [0, 27, 0.6, 24, 1, 14],
    right: [0, 26, 0.6, 22, 1, 12],
    bites: [[0.55, -1, 0.2, 0.12, 1], [0.72, 1, 0.2, 0.08, 1], [0.86, -1, 0.22, 0.06, 1]],
    rough: 1.2,
    tip: 0.3,
    round: 6,
    lumps: 1.3,
    dimples: 3,
    holes: [
      { s: 0.48, u: -0.35, a: 2.6, b: 3.2, tilt: 0, through: false, form: 'kidney' },
      { s: 0.58, u: 0.45, a: 1.8, b: 1.6, tilt: 0, through: true, form: 'oval', wall: 0.4, toward: 210 },
      { s: 0.28, u: 0.1, a: 1.6, b: 2.2, tilt: 0, through: false, form: 'oval' },
      { s: 0.75, u: -0.1, a: 1.4, b: 1.2, tilt: 0, through: false, form: 'oval' },
    ],
    flutes: 3,
    fluteLength: 0.7,
    pits: 2,
    moss: [0.92, -0.2],
    wet: true,
  },
  // In front of the pavilion, under its right-hand column: the middle tip, leaning, its crown split into a main tip and a
  // lower one at its left.
  {
    seed: 53,
    spine: [1502, 853, 1501, 832, 1505, 815, 1511, 804],
    left: [0, 25, 0.5, 21, 0.75, 12, 1, 7],
    right: [0, 22, 0.5, 19, 0.75, 14, 1, 6],
    bites: [[0.82, -1, 0.38, 0.05, 1], [0.45, -1, 0.2, 0.08, 1], [0.62, 1, 0.26, 0.06, 1], [0.3, 1, 0.14, 0.08, 0]],
    rough: 1.3,
    tip: 0.16,
    round: 6,
    lumps: 1.3,
    stretch: 1.5,
    dimples: 4,
    holes: [
      { s: 0.24, u: 0.42, a: 3.6, b: 2.2, tilt: 25, through: true, form: 'slot', wall: 0.4, toward: 210 },
      { s: 0.5, u: -0.45, a: 2, b: 1.6, tilt: 0, through: false, form: 'kidney' },
      { s: 0.72, u: 0.1, a: 1.5, b: 1.2, tilt: 0, through: true, form: 'oval', wall: 0.4, toward: 200 },
      { s: 0.15, u: -0.4, a: 1.6, b: 1.4, tilt: 0, through: false, form: 'oval' },
      { s: 0.56, u: 0.6, a: 1.3, b: 1.1, tilt: 0, through: false, form: 'oval' },
    ],
    flutes: 4,
    fluteLength: 0.7,
    pits: 3,
    moss: [0.97, 0],
    wet: true,
  },
  // The flat stone the steps come down onto: thin, its front an uneven lip over a dark undercut.
  {
    seed: 57,
    spine: [1370, 844, 1384, 841, 1400, 840, 1418, 840.5, 1432, 843],
    left: [0, 5, 0.5, 6.5, 1, 5],
    right: [0, 6, 0.5, 7.5, 1, 6],
    bites: [[0.3, -1, 0.3, 0.05, 1], [0.72, -1, 0.25, 0.06, 1]],
    rough: 0.9,
    tip: 0.04,
    foot: 0.04,
    footKeep: 0.45,
    round: 3,
    lumps: 0.6,
    holes: [{ s: 0.6, u: 0.45, a: 1.6, b: 1.2, tilt: 0, through: false, form: 'oval' }],
    flutes: 0,
    pits: 2,
    lip: -0.35,
    under: 7,
    flat: true,
  },
  // The long flat stone along the water in front of the two tips.
  {
    seed: 59,
    spine: [1442, 849, 1470, 846, 1500, 846.5, 1538, 848],
    left: [0, 5, 0.5, 6.5, 1, 6],
    right: [0, 6, 0.5, 7, 1, 7.5],
    bites: [[0.2, -1, 0.25, 0.04, 1], [0.55, -1, 0.3, 0.04, 1], [0.82, -1, 0.2, 0.05, 1]],
    rough: 1,
    tip: 0.03,
    foot: 0.03,
    footKeep: 0.45,
    round: 3,
    lumps: 0.6,
    holes: [{ s: 0.3, u: 0.45, a: 1.8, b: 1.2, tilt: 0, through: false, form: 'oval' }, { s: 0.8, u: 0.35, a: 1.5, b: 1.1, tilt: 0, through: false, form: 'oval' }],
    flutes: 0,
    pits: 2,
    moss: [0.2, -0.9],
    lip: -0.4,
    under: 8,
    flat: true,
  },
]

/** Where the pavilion's light comes from, by night: the rockery takes it on the side that faces the pavilion. */
const PAVILION_LIGHT = pt(1462, 727)

function rockery(stock: Stock, stones: RockForm[], prefix: string): Built {
  const lamp = stock.paint?.lamp
  const tone = stock.rocks.pile
  const light = lightFrom(0.35, -0.8, 0.5)
  const glow = lamp ? { at: PAVILION_LIGHT, colour: lamp.spill, reach: 70, cover: 0.9 } : undefined
  // By night the stones in front of the pavilion take its lamp, not the moon.
  const built = stones.map((stone, index) => rockDraw(`${prefix}${index}`, stone, tone, 1.5, light, tone.line, glow, !(glow && prefix === 'kf')))
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
    tuft(stock, 1478, 834, 10, 67) +
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
    // The rockery's lines fade into the water; the hollows under its lips are darkest at the stone and gone in the water.
    `<linearGradient id="ru" gradientUnits="userSpaceOnUse" x1="0" y1="847" x2="0" y2="862"><stop offset="0" stop-color="${stock.shade}" stop-opacity="${share(0.5 * stock.shadeAlpha)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="0"/></linearGradient>` +
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

/** On a clear day (晴日写真), for a light window. */
export function daySvg(): string {
  return gardenSheet(STOCKS.day)
}

/** On the moon-glow night, for a dark window. */
export function nightSvg(): string {
  return gardenSheet(STOCKS.night)
}
