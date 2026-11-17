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
  /** Lake stone (太湖石): the paints of the rockery's stones, and the body of the left peak (against the white wall, a little darker). */
  rock: RockPaint & { peakBody: string }
  /** By night, the lantern's warm light where it falls on the stones turned to the pavilion. */
  lampOnStone?: string
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
      body: '#d5d7db', peakBody: '#d3d5d9', lit: '#ffffff', litCover: 0.72, wash: '#3a3d42', washCover: 1, deep: '#1d1f23', hollow: 1.5,
      pen: '#262b33', penCover: 0.9, lip: '#ffffff', lipCover: 0.95, pit: '#5c6067', pitCover: 0.75, cave: '#3a3c40', caveDeep: '#26282c',
    },
    bamboo: { leaf: '#4f7358', cane: '#3f5a48' },
  },
  /** The moon-glow night (model nightMoonGlow): the app's own dark grey as the ground (#181818; the person found the warm black too yellow), one small pale yellow glow round the moon, moon-white plaster,
   * tiles near black, pale warm lines; the pavilion lit amber from within, its light on the floor, the eaves' undersides, the rails,
   * the sill walls, the rockery's near side and broken on the water; the courtyard beyond the gate softly lit. Nothing purple. */
  night: {
    sky: { base: [[0, '#181818'], [1, '#181818']], glows: [{ x: 1440, y: 196, r: 236, colour: '#eadf9f', alpha: 0.3 }] },
    dark: true, ink: '#ece7d8', disc: '#f8f1cf', seal: '#a64a3c', shade: '#0e0c0a', shadeAlpha: 0.9, wash: 0.5, line: 0.8,
    halo: 0.3, haloColour: '#efe2a8', haloR: 104, discAlpha: 1,
    paint: {
      plaster: '#d8d4c8', plinth: '#aaa598', cool: '#0e0c0a', coolAlpha: 0.5,
      tile: '#0c0a09', tileLight: 0, lime: '#ece7d8', rib: 0.1, groove: '#050403', grooveAlpha: 0.5,
      soffit: '#0c0a09', soffitAlpha: 0.9,
      wood: '#1c1915', woodFar: '#c8925e', woodFarAlpha: 0.55, rail: '#f6d7a0',
      stone: '#3a3731', stoneLit: '#d8d4c8', stoneLitAlpha: 0.26, stoneWash: '#0e0c0a', stoneWashAlpha: 0.7, hollow: '#0a0908', hollowAlpha: 0.9, stoneLine: '#ece7d8',
      bough: '#a39d88', boughAlpha: 0.7, willowNear: '#9c977f', willowFar: '#6b675a', willowAlpha: 0.8, grass: '#c9c3b0',
      water: '#181818', waterAlpha: 0, ripple: '#c9c3b0',
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
      body: '#6a6a67', peakBody: '#666663', lit: '#c9cac7', litCover: 0.55, wash: '#1e1e1f', washCover: 1.45, deep: '#121214', hollow: 1.75,
      pen: '#0d0d0e', penCover: 0.85, lip: '#d2d3d0', lipCover: 0.7, pit: '#3a3a3b', pitCover: 0.8, cave: '#161618', caveDeep: '#0e0e10',
    },
    lampOnStone: '#e6d6bc',
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
/** A small ring as a path: two half circles. */
function ringAt(x: number, y: number, r: number): string {
  return `M${round(x - r)} ${round(y)}a${round(r)} ${round(r)} 0 1 0 ${round(2 * r)} 0a${round(r)} ${round(r)} 0 1 0 ${round(-2 * r)} 0`
}

function pairs(values: number[]): Point[] {
  const points: Point[] = []
  for (let index = 0; index + 1 < values.length; index += 2) points.push(pt(values[index] ?? 0, values[index + 1] ?? 0))
  return points
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
// Lake stones as a 玲珑 peak is painted: a firm lobed outline in brush (勾), heavy where it turns from the light and swelling
// at every cleft (顿), thin and broken where the light eats it; then the stone modelled from its hollows, not from round lumps:
// the darks go into the holes, the furrows, the bays and under each ledge, the lights onto the ridges between the holes and the
// planes turned to the sun or moon. Every hole shows the stone's thickness: the wall of its tunnel as a dark crescent on the side
// turned to the light (it faces away from it), the deepest part of that wall darker still, a lit lip on the rim that faces the
// light, a soft shade spilling below it on the face of the stone, and an inner rim line. A through-hole is cut out of the stone, so
// whatever is truly behind it shows (the sky, the white wall); a blind one is a hollow. Texture strokes (皴) follow the form, the
// small pits (弹子窝) come in clusters, and a few dots of moss (苔点) sit in the clefts. No colour: neutral grey ink on white by day,
// moonlit warm grey by night.

/** The paints of a lake stone: its body, the light on it, the washes of shade, the dark of its hollows (and how far into that dark a
 * hole goes), its line, its lit lips, the rings of its pits, and the flat dark of a cave mouth and of the passage turning inside it. */
interface RockPaint {
  body: string
  lit: string
  litCover: number
  wash: string
  washCover: number
  deep: string
  hollow: number
  pen: string
  penCover: number
  lip: string
  lipCover: number
  pit: string
  pitCover: number
  cave: string
  caveDeep: string
}

/** One opening in a stone, in the stone's units: centre, half sizes, a turn in degrees. One that goes `through` is cut out of
 * the stone; a blind one is a hollow. `toward` is the way its tunnel runs back into the stone, as a compass angle on the sheet
 * (0 right, 90 down): its far opening lies that way inside the near one, so its wall shows on the other side. */
interface RockHole {
  x: number
  y: number
  rx: number
  ry: number
  tilt: number
  form?: 'oval' | 'tear' | 'kidney'
  through?: boolean
  /** A shallow hollow rather than a hole: a soft grey dish with a dark crescent under its lip. */
  dish?: boolean
  toward?: number
  /** How much of the near rim the far opening fills (less: a thicker wall shows). */
  open?: number
  /** A shape of its own (x, y pairs round its middle at x, y): a gap between stones, not an oval. */
  ring?: number[]
  /** Where its rim catches the light: pairs of angles (radians) measured from the way its tunnel runs back (`toward`); empty for
   * none. Left out, the look decides (the rim on that side, on all holes or on some). */
  lip?: number[]
}

/** A stone drawn by hand. Runs of points are flat lists x, y, x, y, ... in the stone's units. */
interface Rock {
  /** The outline, clockwise: x, y and 1 where it turns sharply (a cleft), 0 where it runs smoothly on. */
  knots: number[]
  holes: RockHole[]
  /** The edge of an overhang inside the outline: an ink line from a cleft, shade under it, light along its top. */
  ledges?: number[][]
  /** A fold of the surface: a fine line, shade on its side away from the light, light on the other. */
  furrows?: number[][]
  /** Long flowing lines of the worn surface (皱), drawn as fine lines only. */
  veins?: number[][]
  /** Short texture strokes (皴): three points each. */
  cun?: number[][]
  /** Clusters of small pits (弹子窝): x, y, the cluster's reach, how many. */
  nests?: number[][]
  /** Patches of wash and of light: closed runs (soft rings, or polygons with their corners kept on a `crisp` stone, a slab). */
  shades?: number[][]
  lights?: number[][]
  crisp?: boolean
  /** Moss dots: x, y pairs. */
  moss?: number[]
  /** Edges (by the index of the knot they leave) not inked at all, where the stone goes into the ground or behind another. */
  seams?: number[]
  /** Edges drawn straight: a foot set level into the bed. */
  level?: number[]
  /** How deeply the water has worn this stone's outline, and how far apart it is walked, in place of the look's (a flat slab is
   * worn less and walked in longer steps); `smooth` draws the walked outline as a curve through its steps instead of straight
   * between them. */
  wear?: number
  step?: number
  smooth?: boolean
  /** Edges (by the index of the knot they leave) inked but not worn: the two walls of a narrow crack, which must not cross. */
  calm?: number[]
  /** The crisp dark hollow under a lip over the water (a closed run), drawn behind the stone. */
  under?: number[]
  /** A cave mouth behind the stones (a closed run, flat dark), the passage turning inside it (darker), the lit lower lip of the
   * stone over it, and the water's edge running into it (open runs). */
  cave?: number[]
  caveDeep?: number[]
  rim?: number[][]
  glint?: number[]
}

/** How a stone is drawn on its sheet. */
interface RockLook {
  paint: RockPaint
  /** Toward the light, a unit vector on the sheet. */
  light: Point
  /** Sheet units per unit of the group the stone is drawn in (1 on the sheet, 1.5 inside the pavilion's group). */
  scale: number
  weight: number
  /** The gradient that lays the light across the stone's body. */
  gradient: string
  /** The paint of the outline and the clefts (the ink, or a gradient that lets it fade into the water). */
  pen?: string
  /** How far apart the outline is walked, in sheet units, and how deeply the water has worn it (1 as the peak is worn). */
  step?: number
  wear?: number
  /** Drawn as the rockery is: no swirl line round a hole's hollow (it would sit over the hole like a brow), a blind hole dark right
   * through (no paler floor in it like a pupil), a lit lip on only some holes. */
  plain?: boolean
  /** By night, the lantern: where it hangs (in the units the stone is drawn in), and the paint of the warm light it lays along the
   * faces turned to it (only there: it is a light on the stone, not the stone's colour). */
  lamp?: { at: Point; paint: string; top: number; bottom: number }
}

function rotate(v: Point, angle: number): Point {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return pt(v.x * c - v.y * s, v.x * s + v.y * c)
}

interface Piece {
  a: Point
  c1: Point
  c2: Point
  b: Point
}

function cubicAtT(piece: Piece, t: number): Point {
  const u = 1 - t
  return pt(
    u * u * u * piece.a.x + 3 * u * u * t * piece.c1.x + 3 * u * t * t * piece.c2.x + t * t * t * piece.b.x,
    u * u * u * piece.a.y + 3 * u * u * t * piece.c1.y + 3 * u * t * t * piece.c2.y + t * t * t * piece.b.y,
  )
}

function cubicSlope(piece: Piece, t: number): Point {
  const u = 1 - t
  return pt(
    3 * u * u * (piece.c1.x - piece.a.x) + 6 * u * t * (piece.c2.x - piece.c1.x) + 3 * t * t * (piece.b.x - piece.c2.x),
    3 * u * u * (piece.c1.y - piece.a.y) + 6 * u * t * (piece.c2.y - piece.c1.y) + 3 * t * t * (piece.b.y - piece.c2.y),
  )
}

/** The outline as cubic pieces through the knots: smooth where it runs on (the tangent from the knots either side), turned
 * sharply at a cleft, where each side leaves or arrives a little from outside so that the lobes meet in a crisp notch. */
function lerpPoint(a: Point, b: Point, t: number): Point {
  return pt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
}

function rockPieces(knots: number[], place: (x: number, y: number) => Point, straight: number[] = []): { pieces: Piece[]; turn: number; notch: boolean[] } {
  const points: Point[] = []
  const notch: boolean[] = []
  for (let index = 0; index + 2 < knots.length; index += 3) {
    points.push(place(knots[index] ?? 0, knots[index + 1] ?? 0))
    notch.push(knots[index + 2] === 1)
  }
  const count = points.length
  let area = 0
  points.forEach((a, index) => {
    const b = points[(index + 1) % count] ?? a
    area += a.x * b.y - b.x * a.y
  })
  const turn = area > 0 ? 1 : -1
  const leave: Point[] = []
  const arrive: Point[] = []
  points.forEach((here, index) => {
    const before = points[(index + count - 1) % count] ?? here
    const after = points[(index + 1) % count] ?? here
    if (!notch[index]) {
      const t = pt((after.x - before.x) / 2, (after.y - before.y) / 2)
      leave.push(t)
      arrive.push(t)
    } else {
      leave.push(rotate(pt((after.x - here.x) * 0.9, (after.y - here.y) * 0.9), -turn * 0.55))
      arrive.push(rotate(pt((here.x - before.x) * 0.9, (here.y - before.y) * 0.9), turn * 0.55))
    }
  })
  const pieces = points.map((a, index) => {
    const b = points[(index + 1) % count] ?? a
    const l = leave[index] ?? pt(0, 0)
    const r = arrive[(index + 1) % count] ?? pt(0, 0)
    if (straight.includes(index)) return { a, c1: lerpPoint(a, b, 1 / 3), c2: lerpPoint(a, b, 2 / 3), b }
    return { a, c1: pt(a.x + l.x / 3, a.y + l.y / 3), c2: pt(b.x - r.x / 3, b.y - r.y / 3), b }
  })
  return { pieces, turn, notch }
}

/** The pieces as one closed path in relative cubic steps (every point rounded first, so the pen never drifts). */
function piecesPath(pieces: Piece[]): string {
  const first = pieces[0]
  if (!first) return ''
  let x = round(first.a.x)
  let y = round(first.a.y)
  const head = `M${pack([x, y])}c`
  const values: number[] = []
  for (const piece of pieces) {
    const c1x = round(piece.c1.x)
    const c1y = round(piece.c1.y)
    const c2x = round(piece.c2.x)
    const c2y = round(piece.c2.y)
    const bx = round(piece.b.x)
    const by = round(piece.b.y)
    values.push(round(c1x - x), round(c1y - y), round(c2x - x), round(c2y - y), round(bx - x), round(by - y))
    x = bx
    y = by
  }
  return head + pack(values) + 'z'
}

/** A closed smooth ring through the midpoints of the points, each point the control of its piece, in relative steps. */
function ringD(points: Point[]): string {
  const count = points.length
  if (count < 3) return ''
  const mids = points.map((p, index) => {
    const q = points[(index + 1) % count] ?? p
    return pt(round((p.x + q.x) / 2), round((p.y + q.y) / 2))
  })
  const start = mids[count - 1] ?? pt(0, 0)
  const p0 = points[0] ?? pt(0, 0)
  const m0 = mids[0] ?? pt(0, 0)
  let x = m0.x
  let y = m0.y
  const rest: number[] = []
  for (let index = 1; index < count; index += 1) {
    const m = mids[index] ?? m0
    rest.push(round(m.x - x), round(m.y - y))
    x = m.x
    y = m.y
  }
  return `M${pack([start.x, start.y])}q${pack([round(round(p0.x) - start.x), round(round(p0.y) - start.y), round(m0.x - start.x), round(m0.y - start.y)])}t${pack(rest)}z`
}

/** An open smooth line through the midpoints of the points, from the first to the last, in relative steps. */
function lineD(points: Point[]): string {
  const count = points.length
  const first = points[0]
  if (!first || count < 2) return ''
  let x = round(first.x)
  let y = round(first.y)
  if (count === 2) {
    const b = points[1] ?? first
    return `M${pack([x, y])}l${pack([round(round(b.x) - x), round(round(b.y) - y)])}`
  }
  const second = points[1] ?? first
  const mid = (p: Point, q: Point): Point => pt(round((p.x + q.x) / 2), round((p.y + q.y) / 2))
  const m1 = count === 3 ? pt(round((points[2] ?? first).x), round((points[2] ?? first).y)) : mid(second, points[2] ?? second)
  let d = `M${pack([x, y])}q${pack([round(round(second.x) - x), round(round(second.y) - y), round(m1.x - x), round(m1.y - y)])}`
  x = m1.x
  y = m1.y
  if (count > 3) {
    const rest: number[] = []
    for (let index = 2; index < count - 1; index += 1) {
      const m = index === count - 2 ? pt(round((points[count - 1] ?? first).x), round((points[count - 1] ?? first).y)) : mid(points[index] ?? first, points[index + 1] ?? first)
      rest.push(round(m.x - x), round(m.y - y))
      x = m.x
      y = m.y
    }
    d += `t${pack(rest)}`
  }
  return d
}

/** How far a hole's rim reaches at an angle round it, before it is turned: a tear points up, a kidney is pressed in on top. */
function rimReach(form: RockHole['form'], angle: number, seed: number, rough: number): number {
  const wobble = rough * (0.06 * Math.sin(3 * angle + seed) + 0.045 * Math.sin(5 * angle + seed * 1.7))
  if (form === 'tear') return 0.84 + 0.6 * Math.pow(Math.max(0, -Math.sin(angle)), 4) + wobble
  if (form === 'kidney') return 1.05 - 0.42 * Math.pow(Math.max(0, -Math.sin(angle)), 2) + wobble
  return 1 + 0.08 * Math.sin(2 * angle + seed) + wobble
}

/** Points round a hole's rim, `k` of its size, its centre moved by (dx, dy) in the stone's units; angles are on the sheet. */
function rimPoints(hole: RockHole, place: (x: number, y: number) => Point, k: number, dx: number, dy: number, seed: number, from: number, to: number, steps: number): Point[] {
  const tilt = (hole.tilt * Math.PI) / 180
  const points: Point[] = []
  const closed = to - from >= Math.PI * 2 - 0.001
  if (hole.ring) {
    // An opening of a drawn shape (a gap between stones): its rim where a ray from its middle at each angle meets the shape.
    const ring = pairs(hole.ring)
    const many = steps * 2
    for (let index = 0; index < (closed ? many : many + 1); index += 1) {
      const angle = from + ((to - from) * index) / many
      const ux = Math.cos(angle)
      const uy = Math.sin(angle)
      let reach = 0
      ring.forEach((a, at) => {
        const b = ring[(at + 1) % ring.length] ?? a
        const ex = b.x - a.x
        const ey = b.y - a.y
        const den = ux * ey - uy * ex
        if (Math.abs(den) < 1e-9) return
        const along = ((a.x - hole.x) * ey - (a.y - hole.y) * ex) / den
        const cross = ((a.x - hole.x) * uy - (a.y - hole.y) * ux) / den
        if (along > 0 && cross >= 0 && cross <= 1) reach = Math.max(reach, along)
      })
      points.push(place(hole.x + dx + ux * reach * k, hole.y + dy + uy * reach * k))
    }
    return points
  }
  const rough = Math.min(hole.rx, hole.ry) > 6 ? 2 : 1
  for (let index = 0; index < (closed ? steps : steps + 1); index += 1) {
    const angle = from + ((to - from) * index) / steps - tilt
    const reach = rimReach(hole.form, angle, seed, rough) * k
    const x = Math.cos(angle) * hole.rx * reach
    const y = Math.sin(angle) * hole.ry * reach
    points.push(place(hole.x + dx + x * Math.cos(tilt) - y * Math.sin(tilt), hole.y + dy + x * Math.sin(tilt) + y * Math.cos(tilt)))
  }
  return points
}

/** A band along a run of points, out to one side by `widths` (the side `side` faces, +1 or -1 of the run's left normal). */
function sideBand(points: Point[], widths: number[], side: number, coarse = false): string {
  const offset: Point[] = []
  const last = points.length - 1
  points.forEach((here, index) => {
    const before = points[Math.max(0, index - 1)] ?? here
    const after = points[Math.min(last, index + 1)] ?? here
    const dx = after.x - before.x
    const dy = after.y - before.y
    const length = Math.hypot(dx, dy) || 1
    const w = (widths[index] ?? 0) * side
    offset.push(pt(here.x - (dy / length) * w, here.y + (dx / length) * w))
  })
  return polyD(points.concat(offset.reverse()), coarse)
}

/** A soft wash along a run of points, out to one side by `widths`, as a smooth closed ring (a wash has no corners). */
function smoothBand(points: Point[], widths: number[], side: number): string {
  const offset: Point[] = []
  const last = points.length - 1
  points.forEach((here, index) => {
    const before = points[Math.max(0, index - 1)] ?? here
    const after = points[Math.min(last, index + 1)] ?? here
    const dx = after.x - before.x
    const dy = after.y - before.y
    const length = Math.hypot(dx, dy) || 1
    const w = (widths[index] ?? 0) * side
    offset.push(pt(here.x - (dy / length) * w, here.y + (dx / length) * w))
  })
  return ringD(points.concat(offset.slice(1, -1).reverse()))
}

/** A closed polygon in relative steps, written tightly: one decimal (or whole units for a soft wash, `coarse`), no repeated point. */
function polyD(points: Point[], coarse = false): string {
  const snap = (value: number): number => (coarse ? Math.round(value) : round(value))
  let x = 0
  let y = 0
  const values: number[] = []
  let head = ''
  points.forEach((point, index) => {
    const px = snap(point.x)
    const py = snap(point.y)
    if (index === 0) head = `M${pack([px, py])}`
    else if (px !== x || py !== y) values.push(round(px - x), round(py - y))
    x = px
    y = py
  })
  return values.length >= 4 ? `${head}l${pack(values)}z` : ''
}

/** A brush band along a run of points (as `ribbon`), written tightly. */
function bandD(points: Point[], widths: number[]): string {
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
  return polyD(left.concat(right))
}

/** Which side of a run (+1 or -1, as `sideBand` takes it) is turned from the light. */
function shadedSide(points: Point[], light: Point): number {
  const a = points[0]
  const b = points[points.length - 1]
  if (!a || !b) return 1
  const dx = b.x - a.x
  const dy = b.y - a.y
  // sideBand's +1 side is (-dy, dx).
  return -dy * light.x + dx * light.y > 0 ? -1 : 1
}

/** An ellipse as two arcs (a small hole's rim): centre, half sizes, a turn in degrees. */
function ellipseD(c: Point, rx: number, ry: number, tilt: number): string {
  const a = (tilt * Math.PI) / 180
  const dx = rx * Math.cos(a)
  const dy = rx * Math.sin(a)
  const arc = `a${pack([rx, ry])} ${Math.round(tilt)} 1 0 `
  return `M${pack([c.x + dx, c.y + dy])}${arc}${pack([-2 * dx, -2 * dy])}${arc}${pack([2 * dx, 2 * dy])}z`
}

/** Part of an ellipse's rim, from one angle to another on the sheet (radians), as one arc. */
function ellipseArcD(c: Point, rx: number, ry: number, tilt: number, from: number, to: number): string {
  const a = (tilt * Math.PI) / 180
  const onRim = (angle: number): Point => {
    const u = angle - a
    const x = Math.cos(u) * rx
    const y = Math.sin(u) * ry
    return pt(c.x + x * Math.cos(a) - y * Math.sin(a), c.y + x * Math.sin(a) + y * Math.cos(a))
  }
  const p = onRim(from)
  const q = onRim(to)
  return `M${pack([p.x, p.y])}a${pack([rx, ry])} ${Math.round(tilt)} ${to - from > Math.PI ? 1 : 0} 1 ${pack([q.x - p.x, q.y - p.y])}`
}

/** Points round an ellipse (or part of it, from one angle to another on the sheet, in radians): centre, half sizes, a turn in degrees. */
function ellipsePoints(c: Point, rx: number, ry: number, tilt: number, from: number, to: number, steps: number): Point[] {
  const a = (tilt * Math.PI) / 180
  const points: Point[] = []
  for (let index = 0; index <= steps; index += 1) {
    const u = from + ((to - from) * index) / steps - a
    const x = Math.cos(u) * rx
    const y = Math.sin(u) * ry
    points.push(pt(c.x + x * Math.cos(a) - y * Math.sin(a), c.y + x * Math.sin(a) + y * Math.cos(a)))
  }
  return points
}

/** A number as short as it can be written: no leading zero. */
function tiny(value: number): string {
  const text = String(value)
  return text.startsWith('0.') ? text.slice(1) : text
}

/** What a lake stone (or a course of them) is drawn from: one path's data per paint. */
interface RockLayers {
  outline: string
  cuts: string
  washL: string
  washD: string
  lights: string
  warm: string
  warmEdge: string
  mouths: string
  walls: string
  floors: string
  deeper: string
  rings: string
  fine: string
  lips: string
  brush: string
  moss: string
  under: string
  cave: string
  caveDeep: string
  rim: string
  /** The shade a stone throws on the course under it, along the edges it overhangs with. */
  cast: string
}

const NO_LAYERS: RockLayers = {
  outline: '', cuts: '', washL: '', washD: '', lights: '', warm: '', warmEdge: '', mouths: '', walls: '', floors: '', deeper: '', rings: '',
  fine: '', lips: '', brush: '', moss: '', under: '', cave: '', caveDeep: '', rim: '', cast: '',
}

/** One lake stone's layers. `place` takes its units to the sheet (or to its group's units). */
function rockLayers(id: string, rock: Rock, place: (x: number, y: number) => Point, look: RockLook): RockLayers {
  const L = look.light
  /** Lengths given in sheet units, in the units the stone is drawn in. */
  const s = 1 / look.scale
  const placeK = Math.hypot(place(1, 0).x - place(0, 0).x, place(1, 0).y - place(0, 0).y) || 1
  const w = look.weight
  const seams = rock.seams ?? []
  const { pieces, turn, notch } = rockPieces(rock.knots, place, rock.level ?? [])
  const count = pieces.length
  const salt = id.charCodeAt(0) * 7 + id.charCodeAt(id.length - 1) * 3

  // The outline worn by water at a smaller scale than its knots: walked in short steps, each pushed in or out along the normal by a
  // slow wobble, and here and there a small nick bitten into it. Where the stone goes into the ground (a seam) it is left plain.
  interface Sample {
    at: Point
    normal: Point
    piece: number
    t: number
  }
  const samples: Sample[] = []
  let walked = 0
  pieces.forEach((piece, index) => {
    const length = Math.hypot(piece.b.x - piece.a.x, piece.b.y - piece.a.y) * 1.08
    const steps = Math.max(2, Math.round(length / ((rock.step ?? look.step ?? 3.3) * s)))
    const plain = seams.includes(index) || (rock.calm ?? []).includes(index)
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps
      const slope = cubicSlope(piece, t)
      const size = Math.hypot(slope.x, slope.y) || 1
      const normal = pt((turn * slope.y) / size, (-turn * slope.x) / size)
      const here = cubicAtT(piece, t)
      walked += length / steps / s
      // Fade the wear out toward a cleft, so that the cleft stays crisp.
      const calm = Math.min(1, t / 0.2, (1 - t) / 0.2)
      const wear = rock.wear ?? look.wear ?? 1
      let push = plain ? 0 : (1.3 * (noise(walked / 11, salt + 61) - 0.5) + 0.7 * wear * (noise(walked / 4.2, salt + 67) - 0.5)) * calm * wear
      if (!plain && step > 0 && hashUnit(Math.round(walked * 10), salt + 71) < 0.07 * wear) push -= 1.4 * wear
      samples.push({ at: pt(here.x + normal.x * push * s, here.y + normal.y * push * s), normal, piece: index, t })
    }
  })
  const total = samples.length
  // A stone walked in longer steps may have its outline drawn as a smooth curve through them (no flat facets between them).
  const outline = rock.smooth ? ringD(samples.map(sample => sample.at)) : polyD(samples.map(sample => sample.at))

  // Pits (弹子窝) are small open rings, as the brush turns them: no fleck of light in them (that makes an eye). Each ring is a
  // filled band between two circles (a stroked circle costs many times more to draw): the outer one, then the inner one from
  // where the outer ends.
  let rings = ''
  const pit = (centre: Point, size: number): void => {
    const r = Math.max(1, Math.min(1.8, size * 0.8)) * s
    const band = 0.6 * s
    const outer = round(r + band / 2)
    const inner = round(r - band / 2)
    rings += `M${pack([centre.x - 0.05, centre.y + outer])}a${pack([outer, outer])} 0 1 1 .1 0m${pack([-0.1, round(inner - outer)])}a${pack([inner, inner])} 0 1 1 .1 0`
  }

  // The holes.
  const backward = (Math.atan2(-L.y, -L.x) * 180) / Math.PI
  let cuts = ''
  let mouths = ''
  let walls = ''
  let floors = ''
  let deeper = ''
  let fine = ''
  let lips = ''
  let washL = ''
  let washD = ''
  let lights = ''
  rock.holes.forEach((hole, index) => {
    const seed = index * 1.9 + 0.7 + salt * 0.01
    // On the rockery a long narrow slot is a hole, not a pit: only a hole small both ways is a pit there.
    const small = Math.min(hole.rx, hole.ry) * placeK * look.scale + 1e-9
    // Which way it is drawn. On the rockery that goes by its longer reach, so that a long narrow slot is a hole with a rough rim
    // (not a pit, nor a neat ellipse): a pit only when small both ways, a true ellipse only up to a middle size.
    const reachMax = Math.max(hole.rx, hole.ry) * placeK * look.scale + 1e-9
    const isPit = look.plain ? reachMax < 2.6 : small < 2.6
    const isSmall = look.plain ? reachMax < 5.5 : small < 4.2
    const toward = ((hole.toward ?? backward + (hashUnit(index, salt) - 0.5) * 50) * Math.PI) / 180
    const wallSide = toward + Math.PI
    const steps = small < 2.6 ? 7 : small < 5 ? 9 : 12
    const near = rimPoints(hole, place, 1, 0, 0, seed, 0, Math.PI * 2, steps)
    const centre = place(hole.x, hole.y)
    // On the rockery only some lips catch the light; a hole may say where its own lip is.
    const litLip = !look.plain || hashUnit(index, salt + 93) < 0.5
    const lipArcs = (width: number): Array<[number, number]> => {
      if (!hole.lip) return litLip ? [[toward - width, toward + width]] : []
      const arcs: Array<[number, number]> = []
      for (let at = 0; at + 1 < hole.lip.length; at += 2) arcs.push([toward + (hole.lip[at] ?? 0), toward + (hole.lip[at + 1] ?? 0)])
      return arcs
    }
    /** Which side of an arc round the hole (+1 or -1, as `sideBand` takes it) faces the hole's centre. */
    const inward = (arc: Point[], c: Point): number => {
      const mid = arc[Math.floor(arc.length / 2)] ?? c
      const probe = arc[Math.floor(arc.length / 2) + 1] ?? mid
      return -(probe.y - mid.y) * (c.x - mid.x) + (probe.x - mid.x) * (c.y - mid.y) > 0 ? 1 : -1
    }
    const outward = (arc: Point[]): number => -inward(arc, centre)
    if (small >= 4.5) {
      // The hollow the hole sits in (弹涡): the slope round it falls into it, so the part of that slope turned from the light is
      // shaded and the part facing it lit; a fine line runs along the ridge where the slope begins, round its shaded side (卷云皴).
      const reachOut = (small * (hole.dish ? 0.7 : 1.05) + 1) * s
      const shadeArc = rimPoints(hole, place, 1, 0, 0, seed, wallSide - 1.5, wallSide + 1.5, 5)
      washL += smoothBand(shadeArc, shadeArc.map((_, at) => reachOut * Math.pow(Math.sin((Math.PI * at) / (shadeArc.length - 1)), 0.8)), outward(shadeArc))
      const litArc = rimPoints(hole, place, 1, 0, 0, seed, toward - 1.1, toward + 1.1, 4)
      if (small >= 6) lights += smoothBand(litArc, litArc.map((_, at) => reachOut * 0.42 * Math.pow(Math.sin((Math.PI * at) / (litArc.length - 1)), 0.9)), outward(litArc))
      if (!look.plain) {
        const swirl = 1.5 + 0.35 * hashUnit(index, salt + 81)
        const turnBy = (hashUnit(index, salt + 83) - 0.5) * 1.2
        fine += lineD(rimPoints(hole, place, swirl, 0, 0, seed + 2, wallSide - 1.1 + turnBy, wallSide + 1.3 + turnBy, 5))
      }
    }
    if (hole.dish) {
      // A shallow dish: a soft grey hollow, darker under its lip on the side turned to the light, its lower rim lit.
      washD += ringD(near)
      const arc = rimPoints(hole, place, 1, 0, 0, seed, wallSide - 1.3, wallSide + 1.3, 6)
      const reach = small * 0.55 * s
      washD += sideBand(arc, arc.map((_, at) => reach * Math.pow(Math.sin((Math.PI * at) / (arc.length - 1)), 0.9)), inward(arc, centre), true)
      fine += lineD(rimPoints(hole, place, 1, 0, 0, seed, wallSide - (look.plain ? 1.2 : 1.5), wallSide + (look.plain ? 1.2 : 1.5), 6))
      for (const [from, to] of lipArcs(1.1)) lips += lineD(rimPoints(hole, place, 0.96, 0, 0, seed, from, to, 5))
      return
    }
    // A hole that goes through has a wide far opening pressed against its near rim on the side it runs back to, so its wall is a
    // crescent on one side only (a passage, not a ring round a pupil). A blind one is deeper and darker.
    const k = hole.open ?? (hole.through ? 0.8 : small < 2.6 ? 0.5 : 0.6)
    const shift = (hole.through ? 0.95 : 0.82) * (1 - k) * Math.min(hole.rx, hole.ry)
    const dx = Math.cos(toward) * shift
    const dy = Math.sin(toward) * shift
    if (isPit) {
      // A pit.
      pit(centre, small)
      return
    }
    if (isSmall && look.plain) {
      // On the rockery a small hole keeps its own form (a tear, a kidney, a rough oval), never a flat true ellipse with a line
      // over it (an almond with a lid reads as an eye): its far opening or its dark inner wall on the side turned to the light
      // only, a short rim line there, and a lit lip only where it is asked for (or on some).
      const nearD = ringD(near)
      if (hole.through) {
        const farD = ringD(rimPoints(hole, place, k, dx, dy, seed, 0, Math.PI * 2, steps))
        walls += nearD + farD
        cuts += farD
      } else {
        mouths += nearD
        const arc = rimPoints(hole, place, 1, 0, 0, seed, wallSide - 1.05, wallSide + 1.05, 5)
        deeper += sideBand(arc, arc.map((_, at) => small * 0.62 * s * Math.pow(Math.sin((Math.PI * at) / (arc.length - 1)), 0.8)), inward(arc, centre))
      }
      fine += lineD(rimPoints(hole, place, 1, 0, 0, seed, wallSide - 0.95, wallSide + 0.95, 4))
      for (const [from, to] of lipArcs(0.8)) lips += lineD(rimPoints(hole, place, 0.95, 0, 0, seed, from, to, 3))
      return
    }
    if (isSmall) {
      // A small hole, drawn as true ellipses. One that goes through: its rim and its far opening moved toward where it runs back,
      // the sky (or the wall) seen through that. A blind one: a hollow, mid dark all through, its shaded inner wall a darker
      // crescent hugging the rim on the side turned to the light (never a dark dot in the middle: that is a pupil).
      const r = (value: number): number => value * placeK
      const ring = (c: Point, kr: number): string => polyD(ellipsePoints(c, r(hole.rx * kr), r(hole.ry * kr), hole.tilt, 0, Math.PI * 2, 14).slice(0, 14))
      const arc = (kr: number, from: number, to: number, n: number): string => lineD(ellipsePoints(centre, r(hole.rx * kr), r(hole.ry * kr), hole.tilt, from, to, n))
      const nearD = ring(centre, 1)
      if (hole.through) {
        const farD = ring(place(hole.x + dx, hole.y + dy), k)
        walls += nearD + farD
        cuts += farD
      } else {
        mouths += nearD
        const arc = rimPoints(hole, place, 1, 0, 0, seed, wallSide - 1.35, wallSide + 1.35, 5)
        deeper += sideBand(arc, arc.map((_, at) => small * 0.55 * s * Math.pow(Math.sin((Math.PI * at) / (arc.length - 1)), 0.8)), inward(arc, centre))
      }
      const reach = look.plain ? 1.2 : 2
      fine += arc(1, wallSide - reach, wallSide + reach, look.plain ? 4 : 6)
      for (const [from, to] of lipArcs(0.9)) lips += arc(0.95, from, to, 3)
      return
    }
    const far = rimPoints(hole, place, k, dx, dy, seed, 0, Math.PI * 2, steps)
    walls += ringD(near) + ringD(far)
    if (hole.through) cuts += ringD(far)
    else floors += ringD(far)
    // The deepest part of the tunnel's wall, against its far opening on the wall's side.
    const arc = rimPoints(hole, place, k, dx, dy, seed, wallSide - 1.25, wallSide + 1.25, small < 6 ? 4 : 6)
    const reach = (1 - k) * Math.min(hole.rx, hole.ry) * placeK * (hole.through ? 1.5 : 0.95)
    const farCentre = place(hole.x + dx, hole.y + dy)
    deeper += sideBand(arc, arc.map((_, at) => reach * Math.pow(Math.sin((Math.PI * at) / (arc.length - 1)), 0.8)), -inward(arc, farCentre))
    // The rim line round the wall's side, the inner rim along the far opening, the lit lip on the side facing the light.
    const sweep = look.plain ? 1.5 : 2.1
    fine += lineD(rimPoints(hole, place, 1, 0, 0, seed, wallSide - sweep, wallSide + sweep, small < 6 ? 5 : 7))
    if (small >= 5 && !look.plain) fine += lineD(rimPoints(hole, place, k, dx, dy, seed, wallSide - 1.3, wallSide + 1.3, 4))
    for (const [from, to] of lipArcs(0.95)) lips += lineD(rimPoints(hole, place, 0.97, 0, 0, seed, from, to, 4))
    // A soft shade spilling below a large hole on the face of the stone.
    if (small < 6) return
    const below = rimPoints(hole, place, 1, 0, 0, seed, Math.PI / 2 - 0.9, Math.PI / 2 + 0.9, 4)
    const drop = (small * 0.5 + 0.8) * s
    washL += smoothBand(below, below.map((_, at) => drop * Math.pow(Math.sin((Math.PI * at) / (below.length - 1)), 1.3)), -inward(below, centre))
  })

  // The washes laid by the outline's own facing: a narrow shade where it turns from the light, a lit band where it faces it, a
  // deeper shade in its bays. Each is a band set in from a run of samples (every other one: a wash needs no finer step); `out`
  // sets it out from the outline instead (the shade a stone throws below an edge it overhangs with).
  const runBands = (pick: (sample: Sample, index: number) => number, width: number, out = false, coarse = true): string => {
    let d = ''
    let run: Point[] = []
    let inner: Point[] = []
    const sign = out ? 1 : -1
    const flush = (): void => {
      if (run.length >= 3) {
        inner[0] = run[0] ?? pt(0, 0)
        inner[inner.length - 1] = run[run.length - 1] ?? pt(0, 0)
        d += polyD(run.concat(inner.reverse()), coarse)
      }
      run = []
      inner = []
    }
    for (let index = 0; index < total; index += 3) {
      const sample = samples[index]
      if (!sample) continue
      const value = seams.includes(sample.piece) ? 0 : pick(sample, index)
      if (value > 0.02) {
        run.push(sample.at)
        inner.push(pt(sample.at.x + sign * sample.normal.x * width * value, sample.at.y + sign * sample.normal.y * width * value))
      } else flush()
    }
    flush()
    return d
  }
  const clamp = (value: number): number => Math.max(0, Math.min(1, value))
  const facing = (sample: Sample): number => sample.normal.x * L.x + sample.normal.y * L.y
  washL += runBands(sample => clamp((-facing(sample) - 0.05) / 0.6) ** 0.8, (look.plain ? 10 : 7) * s)
  washD += runBands(sample => clamp((-facing(sample) - 0.45) / 0.4), 2.6 * s)
  lights += runBands(sample => clamp((facing(sample) - 0.3) / 0.5), 2.6 * s)
  washD += runBands((sample, index) => {
    const before = samples[(index + total - 3) % total]
    const after = samples[(index + 3) % total]
    if (!before || !after) return 0
    const cross = before.normal.x * after.normal.y - before.normal.y * after.normal.x
    return cross * turn < -0.1 ? Math.min(1, -cross * turn * 2.5) : 0
  }, 5 * s)
  // By night, the lantern's light caught along the rims turned to it, only between the height of its floor and the shade of its
  // roof: a narrow band (no wider than 6 sheet units) and a narrower one on the very edge, paler than the stone (a light on it,
  // not its colour).
  let warm = ''
  let warmEdge = ''
  const lamp = look.lamp
  if (lamp) {
    const toLamp = (sample: Sample): number => {
      const vx = lamp.at.x - sample.at.x
      const vy = lamp.at.y - sample.at.y
      const span = clamp((sample.at.y - lamp.top) / (8 * s)) * clamp((lamp.bottom - sample.at.y) / (8 * s))
      return ((sample.normal.x * vx + sample.normal.y * vy) / (Math.hypot(vx, vy) || 1)) * span
    }
    warm = runBands(sample => clamp((toLamp(sample) - 0.25) / 0.4), 5.5 * s)
    warmEdge = runBands(sample => clamp((toLamp(sample) - 0.35) / 0.35), 2 * s)
  }
  // The shade under every edge that faces down: it falls on the stone below (clipped to it when drawn).
  const cast = runBands(sample => clamp((sample.normal.y * (L.y < 0 ? 1 : -1) - 0.45) / 0.3), 3.6 * s, true, false)

  const run = (values: number[]): Point[] => pairs(values).map(point => place(point.x, point.y))
  let brush = ''
  // Ledges: a brush line from a cleft, thinning as it goes; shade under it, light along its top.
  for (const ledge of rock.ledges ?? []) {
    const line = spline(run(ledge), 2)
    const last = Math.max(1, line.length - 1)
    brush += bandD(line, line.map((_, index) => (0.28 + 0.85 * Math.pow(1 - index / last, 0.6)) * w * (0.85 + 0.3 * hashUnit(index, salt + 41))))
    const side = shadedSide(line, L)
    washD += sideBand(line, line.map((_, index) => (2.4 * s + 0.6) * Math.pow(Math.sin((Math.PI * (index + 0.6)) / (last + 1.2)), 0.7) * (1 - 0.4 * (index / last))), side, true)
    washL += sideBand(line, line.map((_, index) => (7.5 * s + 1) * Math.pow(Math.sin((Math.PI * (index + 0.5)) / (last + 1)), 0.8)), side, true)
    lights += sideBand(line, line.map((_, index) => 2 * s * Math.pow(Math.sin((Math.PI * (index + 0.5)) / (last + 1)), 0.9)), -side, true)
  }
  // Furrows: a fine line, shade on one side, light on the other.
  for (const furrow of rock.furrows ?? []) {
    const points = run(furrow)
    const line = spline(points, 2)
    const last = Math.max(1, line.length - 1)
    fine += lineD(points)
    const side = shadedSide(line, L)
    washL += sideBand(line, line.map((_, index) => (2.4 * s + 0.4) * Math.pow(Math.sin((Math.PI * (index + 0.5)) / (last + 1)), 0.8)), side, true)
    lights += sideBand(line, line.map((_, index) => 1.5 * s * Math.pow(Math.sin((Math.PI * (index + 0.5)) / (last + 1)), 0.9)), -side, true)
  }
  const patchD = (points: Point[]): string => (rock.crisp ? polyD(points) : ringD(points))
  for (const patch of rock.shades ?? []) washD += patchD(run(patch))
  for (const patch of rock.lights ?? []) lights += patchD(run(patch))
  for (const stroke of (rock.cun ?? []).concat(rock.veins ?? [])) fine += lineD(run(stroke))
  // Clusters of small pits (弹子窝), scattered round a point, of two sizes.
  ;(rock.nests ?? []).forEach((nest, order) => {
    const [nx = 0, ny = 0, reach = 3, many = 5] = nest
    for (let index = 0; index < many; index += 1) {
      const angle = hashUnit(order * 17 + index, salt + 51) * Math.PI * 2
      const far = reach * Math.sqrt(hashUnit(order * 17 + index, salt + 52))
      pit(place(nx + Math.cos(angle) * far, ny + Math.sin(angle) * far), 1.1 + 0.8 * hashUnit(order * 17 + index, salt + 53))
    }
  })

  // The outline in brush: heavy where it turns from the light and along the foot, swelling into every cleft, thin where it faces
  // the light and there broken here and there; nothing along a seam.
  let maxY = -Infinity
  let minY = Infinity
  samples.forEach(sample => {
    maxY = Math.max(maxY, sample.at.y)
    minY = Math.min(minY, sample.at.y)
  })
  const height = maxY - minY || 1
  let runPoints: Point[] = []
  let runWidths: number[] = []
  const flushBrush = (): void => {
    if (runPoints.length >= 2) {
      const ends = runPoints.length - 1
      brush += bandD(runPoints, runWidths.map((width, index) => width * Math.max(0.15, Math.min(1, index / 2, (ends - index) / 2))))
    }
    runPoints = []
    runWidths = []
  }
  // Start where a seam is, so that a run does not wrap round the start.
  let begin = 0
  for (let index = 0; index < total; index += 1) {
    if (seams.includes(samples[index]?.piece ?? -1)) {
      begin = index
      break
    }
  }
  for (let step = 0; step <= total; step += 1) {
    const index = (begin + step) % total
    const sample = samples[index]
    if (!sample) continue
    if (seams.includes(sample.piece)) {
      flushBrush()
      continue
    }
    const lit = facing(sample)
    // The light eats some of the edges that face it.
    if (lit > 0.4 && hashUnit(sample.piece, salt + 13) < 0.45 && sample.t > 0.2 && sample.t < 0.85) {
      flushBrush()
      continue
    }
    // A brush band needs no finer step than every other sample, except into a cleft.
    const nearNotch = (notch[sample.piece] && sample.t < 0.3 ? 1 - sample.t / 0.3 : 0) + (notch[(sample.piece + 1) % count] && sample.t > 0.6 ? (sample.t - 0.6) / 0.4 : 0)
    if (step % 3 !== 0 && nearNotch === 0) continue
    const dark = clamp((0.3 - lit) / 1.1)
    const low = clamp((sample.at.y - (maxY - 0.12 * height)) / (0.12 * height))
    const wobble = 0.8 + 0.4 * noise(index * 0.35, salt + 31)
    runPoints.push(sample.at)
    runWidths.push((0.32 + 1.5 * Math.pow(dark, 1.25) + 0.5 * low) * (1 + 0.7 * nearNotch) * wobble * w)
  }
  flushBrush()

  let moss = ''
  // Moss (苔点): one round dot of ink each, of a size of its own.
  run(rock.moss ?? []).forEach((dot, index) => {
    const r = round((0.9 + 0.7 * hashUnit(index, salt)) * s)
    moss += `M${pack([dot.x - r, dot.y])}a${pack([r, r])} 0 1 0 ${pack([2 * r, 0])}a${pack([r, r])} 0 1 0 ${pack([-2 * r, 0])}`
  })
  if (rock.glint) lips += lineD(run(rock.glint))

  return {
    outline,
    cuts,
    washL,
    washD,
    lights,
    warm,
    warmEdge,
    mouths,
    walls,
    floors,
    deeper,
    rings,
    fine,
    lips,
    brush,
    moss,
    under: rock.under ? polyD(run(rock.under)) : '',
    cave: rock.cave ? ringD(run(rock.cave)) : '',
    caveDeep: rock.caveDeep ? ringD(run(rock.caveDeep)) : '',
    rim: (rock.rim ?? []).map(part => lineD(run(part))).join(''),
    cast,
  }
}

/** The stone (or the course of stones) drawn from its layers. `below` names the course it sits on: the shade it throws falls on that. */
function emitRock(id: string, layers: RockLayers, look: RockLook, below?: string): Built {
  const paint = look.paint
  const w = look.weight
  const s = 1 / look.scale
  const h = paint.hollow
  const pen = look.pen ?? paint.pen
  const fillOf = (d: string, colour: string, cover: number, extra = ''): string =>
    d ? `<path d="${d}" fill="${colour}"${cover < 1 ? ` fill-opacity="${tiny(share(cover))}"` : ''}${extra}/>` : ''
  const strokeOf = (d: string, colour: string, width: number, cover: number): string =>
    d ? `<path d="${d}" stroke="${colour}" stroke-width="${tiny(Math.round(width * 100) / 100)}"${cover < 1 ? ` stroke-opacity="${tiny(share(cover))}"` : ''}/>` : ''
  const defs =
    `<path id="${id}" fill-rule="evenodd" clip-rule="evenodd" d="${layers.outline}${layers.cuts}"/>` + `<clipPath id="${id}c"><use href="#${id}"/></clipPath>`
  const markup =
    (below ? fillOf(layers.cast, paint.deep, 0.62 * h, ` clip-path="url(#${below}c)"`) : '') +
    fillOf(layers.under, paint.deep, 0.62 * h) +
    fillOf(layers.cave, paint.cave, 1) +
    fillOf(layers.caveDeep, paint.caveDeep, 1) +
    `<use href="#${id}" fill="${paint.body}"/>` +
    `<use href="#${id}" fill="url(#${look.gradient})"/>` +
    `<g clip-path="url(#${id}c)">` +
    fillOf(layers.washL, paint.wash, 0.12 * paint.washCover * (look.plain ? 1.5 : 1)) +
    fillOf(layers.washD, paint.wash, 0.2 * paint.washCover * (look.plain ? 1.4 : 1)) +
    fillOf(layers.lights, paint.lit, paint.litCover) +
    (look.lamp ? fillOf(layers.warm, look.lamp.paint, 1) + fillOf(layers.warmEdge, look.lamp.paint, 1) : '') +
    '</g>' +
    fillOf(layers.mouths, paint.deep, 0.28 * h) +
    fillOf(layers.walls, paint.deep, 0.4 * h, ' fill-rule="evenodd"') +
    fillOf(layers.floors, paint.deep, (look.plain ? 0.4 : 0.22) * h) +
    fillOf(layers.deeper, paint.deep, 0.5 * h) +
    fillOf(layers.rings, paint.pit, paint.pitCover, ' fill-rule="evenodd"') +
    strokeOf(layers.lips, paint.lip, 0.6 * w, paint.lipCover * 0.55) +
    strokeOf(layers.rim, paint.lip, 2.2 * s, paint.lipCover) +
    strokeOf(layers.fine, paint.pen, 0.5 * w, 0.55 * paint.penCover) +
    fillOf(layers.brush, pen, 0.86 * paint.penCover) +
    fillOf(layers.moss, paint.pen, 0.8 * paint.penCover)
  return { defs, markup }
}

/** One lake stone. */
function drawRock(id: string, rock: Rock, place: (x: number, y: number) => Point, look: RockLook): Built {
  return emitRock(id, rockLayers(id, rock, place, look), look)
}

/** A course of stones laid side by side (none overlapping another), drawn as one: each has its own outline, holes, washes and
 * brush, but they share their paths. It sits on the course `below`, if any, and overhangs it. */
function drawCourse(id: string, rocks: Rock[], place: (x: number, y: number) => Point, look: RockLook, below?: string): Built {
  const merged: RockLayers = { ...NO_LAYERS }
  rocks.forEach((rock, index) => {
    const layers = rockLayers(`${id}${String.fromCharCode(97 + index)}`, rock, place, look)
    for (const key of Object.keys(merged) as Array<keyof RockLayers>) merged[key] += layers[key]
  })
  return emitRock(id, merged, look, below)
}

// The free-standing peak in the left band, a 玲珑 peak after 玉玲珑 and 瑞云峰 (research §3, silhouette B) set in a lean, hooked
// posture: widest in its head and shoulders (上大下小), the head hooking out to the left toward the gate and ending in two blunt
// lobes round a small hole, the column pinched low, just above its foot, to under half its greatest width, and the foot spreading
// into the bed. 27 openings in a strict order of size, crowded into its upper two thirds: two large ones (the crown pierced against
// the sky, a long passage through the shoulder against the wall), six of middle size, a dozen small, and pits; the holes that go
// through lie where the sky or the plaster is behind them, the blind ones where the coping is. Light comes from the right, a little
// above (the sun or the moon): ledges, furrows and the shaded washes lie on the left and under every swelling. In sheet units.
const LEFT_PEAK: Rock = {
  knots: [
    296.5, 670, 0, 299, 658, 0, 303.5, 648, 1, 311, 642, 0, 318, 634, 0, 326, 632, 1, 334, 624, 0, 343, 621, 0, 349, 615, 1, 357, 608, 0,
    365, 607, 0, 372, 615, 1, 380, 604, 0, 391, 599.5, 0, 401, 602, 0, 407, 608, 1, 413, 611, 0, 415, 621, 0, 411, 631, 1, 415, 641, 0,
    416, 655, 0, 412, 666, 1, 414.5, 678, 0, 412, 689, 0, 404, 695, 1, 396, 704, 0, 400, 716, 0, 408, 726, 0, 410, 738, 1, 415, 750, 0,
    416, 762, 0, 411, 772, 0, 402, 778, 1, 396, 788, 0, 401, 800, 0, 405, 810, 1, 404, 824, 0, 400, 836, 0, 398, 846, 1, 404, 857, 0,
    411, 865, 0, 416, 872, 1, 348, 872, 1, 352, 862, 0, 349, 850, 1, 343, 840, 0, 340, 828, 0, 344, 816, 1, 337, 806, 0, 334, 794, 0,
    340, 784, 1, 334, 774, 0, 324, 766, 0, 318, 754, 0, 316, 742, 1, 311, 732, 0, 311, 720, 0, 320, 712, 1, 313, 707, 0, 305, 706, 0,
    300.5, 700, 0, 299, 692, 1, 295, 682, 0,
  ],
  holes: [
    // The two large ones: the crown pierced against the sky, a long passage close to the left edge against the wall (透), so
    // that only an arm of stone is left beside it.
    { x: 389, y: 622, rx: 13, ry: 8.5, tilt: -14, form: 'kidney', through: true },
    { x: 327, y: 724, rx: 9.5, ry: 15, tilt: 18, form: 'tear', through: true },
    // Middle sizes: the loop at the hook's end, hollows in the coping's band (one a deep hole in a shallow dish, 洞中有洞), holes
    // through near the right edge, a slot down the body (漏), dishes with holes in them.
    { x: 310, y: 694, rx: 6.5, ry: 3.2, tilt: -28, form: 'kidney', through: true },
    { x: 336, y: 658, rx: 12, ry: 13, tilt: -10, dish: true },
    { x: 340, y: 654, rx: 4, ry: 5.5, tilt: 10, form: 'tear' },
    { x: 402, y: 647, rx: 6, ry: 8, tilt: 12, form: 'kidney' },
    { x: 396, y: 760, rx: 5, ry: 7, tilt: -14, through: true },
    { x: 372, y: 790, rx: 4.5, ry: 14, tilt: 8, through: true },
    { x: 386, y: 826, rx: 7, ry: 9, tilt: -6, dish: true },
    { x: 384, y: 830, rx: 2.8, ry: 3.8, tilt: 0, form: 'kidney' },
    { x: 358, y: 742, rx: 8, ry: 7, tilt: 30, dish: true },
    { x: 384, y: 712, rx: 3.6, ry: 4.8, tilt: -10, through: true },
    // Small.
    { x: 356, y: 618, rx: 3, ry: 2.4, tilt: 20, through: true },
    { x: 338, y: 630, rx: 2.4, ry: 2, tilt: 0, through: true },
    { x: 312, y: 662, rx: 3.5, ry: 4.5, tilt: 20 },
    { x: 372, y: 668, rx: 5, ry: 3.6, tilt: -6, form: 'kidney' },
    { x: 366, y: 696, rx: 3.4, ry: 2.6, tilt: 14 },
    { x: 348, y: 706, rx: 3, ry: 2.4, tilt: -20, through: true },
    { x: 382, y: 744, rx: 3.4, ry: 4.2, tilt: 0 },
    { x: 404, y: 738, rx: 2.4, ry: 3.4, tilt: 0, through: true },
    { x: 350, y: 774, rx: 3.4, ry: 2.8, tilt: -10 },
    { x: 362, y: 736.5, rx: 1.6, ry: 1.4, tilt: 0 },
    { x: 356, y: 812, rx: 3, ry: 2.4, tilt: 0 },
    { x: 380, y: 856, rx: 2.6, ry: 3.6, tilt: 8 },
    { x: 392, y: 684, rx: 3, ry: 2.4, tilt: 0 },
    // Pits.
    { x: 324, y: 698, rx: 1.7, ry: 1.4, tilt: 0 },
    { x: 384, y: 644, rx: 1.8, ry: 1.5, tilt: 0 },
    { x: 410, y: 650, rx: 1.4, ry: 1.8, tilt: 0 },
    { x: 362, y: 828, rx: 1.7, ry: 1.4, tilt: 0 },
    { x: 392, y: 800, rx: 1.3, ry: 1.6, tilt: 0 },
    { x: 368, y: 860, rx: 1.8, ry: 1.4, tilt: 0 },
    { x: 350, y: 840, rx: 1.5, ry: 1.2, tilt: 0 },
  ],
  ledges: [
    [326, 632, 332, 640, 342, 644, 352, 643],
    [412, 631, 406, 639, 398, 645],
    [413, 666, 407, 674, 397, 678, 386, 678, 378, 682],
    [404, 695, 395, 693, 384, 697, 374, 705, 368, 714],
    [320, 712, 329, 705, 340, 701, 350, 702],
    [410, 738, 403, 744, 393, 748, 386, 756],
    [402, 778, 394, 781, 387, 788, 384, 798],
    [405, 810, 398, 813, 391, 818],
    [398, 846, 391, 849, 384, 855, 380, 864],
    [349, 850, 356, 854, 364, 856],
    [372, 614, 368, 622, 360, 628, 352, 630],
  ],
  furrows: [
    [372, 630, 381, 635, 395, 634, 403, 628],
    [338, 706, 343, 720, 341, 736, 334, 748],
    [380, 778, 383, 792, 380, 806],
    [362, 798, 360, 814, 364, 832, 362, 846],
    [394, 840, 392, 856, 396, 866],
  ],
  veins: [
    [364, 610, 366, 626, 362, 640, 356, 650],
    [378, 640, 382, 652, 380, 668],
    [352, 676, 354, 688, 358, 702, 362, 716, 368, 728],
    [374, 722, 375, 738, 372, 754, 366, 766, 364, 776],
    [388, 770, 386, 786, 384, 800, 382, 812],
    [362, 840, 360, 852, 362, 866],
    [342, 714, 346, 728, 345, 742, 340, 752],
    [318, 676, 316, 690, 312, 702],
    [300, 664, 306, 674, 314, 677],
    [404, 672, 409, 684],
    [356, 680, 362, 686, 372, 686],
  ],
  cun: [
    [302, 666, 300, 673, 302, 680],
    [304, 650, 302, 656, 303, 662],
    [314, 726, 312, 732, 314, 738],
    [320, 748, 318, 754, 320, 760],
    [352, 856, 350, 862, 352, 868],
    [346, 712, 350, 716, 354, 716],
    [312, 646, 318, 642, 324, 642],
    [364, 760, 366, 766, 364, 772],
  ],
  nests: [
    [352, 640, 3.5, 4],
    [392, 692, 3, 3],
    [366, 764, 3.5, 4],
    [390, 852, 3, 3],
    [318, 700, 2.5, 3],
    [400, 725, 2.2, 3],
  ],
  moss: [326, 632.5, 404, 695.5, 320, 712.5, 349, 850.5, 410, 869],
  seams: [41],
  level: [41],
}

/** Behind the peak's right side, in shade: a lobe at its shoulder over the end of the wall's coping, and the back of the stone in
 * the deep bay under it, hiding the wall's end. */
const LEFT_BACK: Rock[] = [
  {
    knots: [405, 628, 1, 412, 626, 0, 417.5, 630, 0, 419.5, 637, 0, 418.5, 648, 1, 419, 659, 0, 417.5, 669, 0, 413, 675, 1, 405, 672, 0],
    holes: [],
    seams: [0, 7, 8],
  },
  {
    knots: [393, 690, 1, 401, 685.5, 0, 408, 687, 0, 412, 693, 0, 410.5, 704, 1, 412.5, 716, 0, 412, 730, 0, 410.5, 744, 1, 402, 750, 0, 393, 745, 1],
    holes: [],
    veins: [[408, 698, 409, 712, 408, 724]],
    seams: [0, 1, 7, 8, 9],
  },
]

/** A low companion at the left of the peak's foot, between the peak and the gate: wider than tall, leaning, notched, holed. */
const LEFT_COMPANION: Rock = {
  knots: [
    314, 874, 1, 313, 864, 0, 318, 854, 0, 326, 848, 1, 332, 851, 0, 338, 845, 0, 346, 846, 1, 351, 854, 0, 352, 864, 0, 355, 874, 1,
  ],
  holes: [
    { x: 330, y: 862, rx: 3.6, ry: 2.8, tilt: -10, form: 'kidney' },
    { x: 342, y: 856, rx: 2, ry: 2.6, tilt: 0, through: true },
    { x: 320, y: 866, rx: 1.4, ry: 1.2, tilt: 0 },
  ],
  ledges: [[326, 848, 330, 854, 336, 856]],
  cun: [[316, 860, 315, 865, 317, 870]],
  nests: [[346, 866, 2.5, 3]],
  moss: [347, 873],
  seams: [9],
  level: [9],
}

/** A small stone at the right of the peak's foot. */
const RIGHT_COMPANION: Rock = {
  knots: [410, 874, 1, 411, 866, 0, 416, 858, 1, 421, 856, 0, 424.5, 862, 0, 425, 874, 1],
  holes: [
    { x: 418, y: 866, rx: 2.4, ry: 2, tilt: 10, form: 'kidney' },
    { x: 421, y: 860, rx: 1.1, ry: 1.3, tilt: 0 },
  ],
  seams: [5],
  level: [5],
}

function leftPeak(stock: Stock): Built {
  const paint: RockPaint = { ...stock.rock, body: stock.rock.peakBody }
  const light = pt(0.9, -0.44)
  const look: RockLook = { paint, light, scale: 1, weight: 1, gradient: 'pkg' }
  const place = (x: number, y: number): Point => pt(x, y)
  const parts = [
    drawCourse('lb', LEFT_BACK, place, { ...look, paint: { ...paint, body: mixed(paint.body, paint.wash, 0.22) } }),
    drawRock('lp', LEFT_PEAK, place, look),
    drawCourse('lc', [LEFT_COMPANION, RIGHT_COMPANION], place, { ...look, weight: 0.9 }),
  ]
  // The light across the stone's body: paper white where it turns to the light, gone across its middle, a cool shade on the far side.
  const gradient =
    `<linearGradient id="pkg" x1="1" y1="0.2" x2="0" y2="0.7">` +
    `<stop offset="0" stop-color="${paint.lit}" stop-opacity="${share(paint.litCover * 0.8)}"/><stop offset="0.38" stop-color="${paint.lit}" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="${paint.wash}" stop-opacity="${share(0.36 * paint.washCover)}"/></linearGradient>`
  return { defs: gradient + parts.map(part => part.defs).join(''), markup: parts.map(part => part.markup).join('') }
}

// The rockery by the pavilion (池山), a 湖石假山 laid out on the sheet (its numbers are sheet units; it is drawn inside the pavilion's
// group). Behind the pavilion's right side the main mass is piled in rough courses of holed, furrowed, lobed stones, each set a
// little out over the one below so that a dark band of shade lies under every overhang. In the water, two jambs with a cave mouth
// between them (the left one leaning out over it); across them a lintel, its lower lip lit only on its right half. On the lintel,
// at the back, two stones: a low one at the left behind the pavilion's corner, and at the right a lower tip at the frame; in front
// of them the crest, the rockery's one high point, its head notched and hooking over to the left in a beak with sky under it,
// its left side stepping down in unequal lobes. Between the crest and each stone behind it a gap the sky shows through. One large
// opening through the crest with a smaller one off its wall (洞中有洞), a few middle ones of other forms, small pits; long fine
// lines down the bulges. In front of the plinth two holed lumps at uneven heights, grass in the crack between them; thin flat
// slabs at the water, their ends broken square, their front edges notched, a crisp dark undercut under each; a step stone under
// the stair, which stands on it.
const RIGHT_MASS: { low: Rock[]; middle: Rock[]; back: Rock[]; top: Rock[] } = {
  low: [
    // The left jamb of the cave, its right side leaning out over the mouth; the cave mouth behind the stones.
    {
      knots: [1501, 847, 1, 1499, 834, 0, 1502, 820, 0, 1500, 808, 1, 1506, 802, 0, 1514, 799, 0, 1522, 801, 1, 1530, 798, 0, 1537, 801, 0, 1541, 808, 1, 1540, 816, 0, 1546.5, 824.5, 1, 1541.5, 834, 0, 1542, 847, 1],
      holes: [{ x: 1529, y: 812, rx: 1.4, ry: 1.2, tilt: 0 }],
      veins: [[1512, 806, 1515, 820, 1512, 834]],
      moss: [1500.5, 844],
      seams: [13],
      cave: [1534, 847, 1535, 832, 1539, 822, 1548, 818, 1558, 818, 1567, 821, 1573, 830, 1574, 847],
      caveDeep: [1547, 847, 1548, 836, 1552, 829, 1559, 826, 1567, 828, 1573, 835, 1574, 847],
      glint: [1543, 843.5, 1555, 843.5],
    },
    // The right jamb, a pillar in the water: a tear, a kidney low down, a flute.
    {
      knots: [1567, 847, 1, 1570, 837, 0, 1566, 828, 0, 1569, 818, 1, 1567, 808, 0, 1571, 799, 0, 1578, 794, 1, 1587, 796, 0, 1595, 792, 0, 1603, 794, 1, 1610, 792, 0, 1617, 796, 1, 1617, 847, 1],
      holes: [
        { x: 1590, y: 821, rx: 3.2, ry: 4.6, tilt: 14, form: 'tear' },
        { x: 1599, y: 837, rx: 2.4, ry: 3.4, tilt: 28, form: 'kidney' },
        { x: 1581, y: 806, rx: 1.4, ry: 1.2, tilt: 0 },
      ],
      veins: [[1576, 810, 1579, 822, 1577, 834, 1579, 844], [1606, 802, 1608, 816, 1605, 828]],
      seams: [11, 12],
    },
    // The step stone the stair stands on (drawn behind the pavilion, so the stair's foot covers its back): a rough block, its top lit
    // and lumpy at both ends, its nosing chipped, the front face darker down to the slab in front of it.
    {
      knots: [
        1281, 806, 1, 1284, 799.5, 0, 1290, 796.5, 0, 1297, 798, 1, 1320, 799, 0, 1342, 800, 0, 1353, 799.5, 1, 1360, 798.5, 0, 1366, 802.5, 1, 1367.5, 810, 0,
        1364.5, 818, 1, 1368, 830, 1, 1282, 830, 1, 1280, 822, 0, 1284, 815.5, 1, 1279.5, 810, 0,
      ],
      holes: [
        { x: 1317, y: 819, rx: 3.6, ry: 2.8, tilt: -25, form: 'kidney' },
      ],
      nests: [[1333, 822, 2.4, 3]],
      ledges: [[1279.5, 810, 1290, 809, 1300, 811, 1311, 810.5], [1321, 811.5, 1336, 812.5, 1350, 812, 1364.5, 813]],
      lights: [[1283, 801.5, 1296, 799.5, 1330, 801, 1361, 801.5, 1364, 806, 1340, 808.5, 1312, 808, 1290, 807.5]],
      veins: [[1306, 814, 1308, 824], [1353, 815, 1352, 825]],
      crisp: true,
      wear: 1,
      step: 4,
      seams: [11],
      level: [11],
    },
  ],
  middle: [
    // The lintel: a long stone laid across both jambs and out over them, its top hidden under the stones on it; its lower lip over
    // the cave notched and lit on its right half only; pierced against the sky at its left end, a shallow dish at its right.
    {
      knots: [
        1511, 772, 0, 1514, 762, 0, 1530, 759, 0, 1560, 758, 0, 1590, 757, 0, 1617, 759, 1, 1617, 800, 1, 1606, 802, 0, 1596, 799, 1, 1586, 803, 0,
        1577, 801, 1, 1573, 808, 0, 1573.5, 816, 0, 1569, 823, 1, 1562, 825.5, 0, 1554, 827, 0, 1547, 823, 1, 1544, 815, 0, 1538, 808, 0, 1528, 810, 1,
        1519, 806, 0, 1512, 799, 0, 1513, 788, 1,
      ],
      holes: [
        { x: 1530, y: 788, rx: 4.6, ry: 3.2, tilt: 28, form: 'kidney', through: true, open: 0.72 },
        { x: 1589, y: 786, rx: 6.5, ry: 5, tilt: -15, dish: true },
        { x: 1539, y: 779, rx: 2.4, ry: 3.4, tilt: -10, form: 'tear' },
        { x: 1553, y: 777, rx: 1.4, ry: 1.2, tilt: 0 },
      ],
      veins: [[1546, 778, 1551, 790, 1548, 803], [1578, 773, 1580, 785, 1579, 795]],
      ledges: [[1577, 801, 1583, 796.5, 1591, 795.5, 1598, 797], [1528, 810, 1534, 805.5, 1537, 799]],
      nests: [[1569, 781, 2.4, 3]],
      rim: [[1555.5, 826.5, 1559.8, 825.4], [1564.5, 824.3, 1568.5, 822, 1571.8, 816.5]],
      seams: [0, 1, 2, 3, 4, 5, 21, 22],
    },
  ],
  back: [
    // At the back, on the lintel and behind the crest: a low stone at the left behind the pavilion's corner, its top well under
    // the crest's head; between it and the crest a gap the sky shows through.
    {
      knots: [
        1503, 720, 1, 1507, 711.5, 0, 1514, 707.5, 0, 1521, 709.5, 1, 1527, 706.5, 0, 1533, 708, 0, 1540, 715, 1, 1541, 730, 0, 1530, 734.5, 1, 1527.5, 743, 0,
        1530, 751, 1, 1539, 756, 0, 1538, 766, 1, 1530, 770, 0, 1520, 767, 1, 1510, 770, 0, 1503, 766, 1, 1501, 744, 0,
      ],
      holes: [{ x: 1513, y: 733, rx: 3.4, ry: 2.6, tilt: -28, form: 'kidney' }, { x: 1518, y: 720, rx: 1.4, ry: 1.2, tilt: 0 }, { x: 1524, y: 755, rx: 1.3, ry: 1.1, tilt: 0 }],
      veins: [[1508, 714, 1510, 724], [1523, 714, 1525, 728, 1523, 742]],
      ledges: [[1521, 709.5, 1516, 713, 1510, 714]],
      moss: [1521, 710],
      seams: [5, 6, 11, 12, 14, 15, 16, 17],
    },
    // At the right, the lower tip at the frame, about three quarters of the crest's height; between it and the crest a gap.
    {
      knots: [
        1579, 676, 1, 1584, 667.5, 0, 1589, 660, 0, 1594, 654.5, 1, 1601, 657.5, 0, 1609, 655, 0, 1617, 659, 1, 1617, 768, 1, 1606, 767, 0, 1598, 770.5, 0,
        1590, 766, 1, 1582, 768, 0, 1577, 760, 1, 1578, 726, 0, 1587.5, 718, 1, 1589, 708, 0, 1587.5, 698, 1, 1578, 690, 0,
      ],
      holes: [{ x: 1595, y: 688, rx: 2.6, ry: 3.6, tilt: 12, form: 'kidney' }, { x: 1597, y: 728, rx: 2, ry: 3, tilt: -15, form: 'tear' }, { x: 1596, y: 709, rx: 1.3, ry: 1.1, tilt: 0 }],
      veins: [[1590, 736, 1592, 748, 1590, 760, 1592, 767], [1596, 660, 1598, 672, 1597, 680]],
      seams: [0, 6, 7, 11, 12, 17],
    },
  ],
  top: [
    // The crest: the rockery's one high point, its head in two lobes with a notch between them, the left one hooking over and
    // curling down toward the pavilion with sky under it, its left side stepping down in unequal lobes, its foot lobed over the
    // lintel. Its crown pierced against the sky; one large opening through its body with a smaller one off its lower wall (洞中有洞),
    // a slanted slot and a small hole through it low down, a tear, a kidney and small hollows blind, pits and rings; long fine
    // lines down its bulges; shade under the ledges of its lobes.
    {
      step: 3.4,
      wear: 1.3,
      knots: [
        1563, 611.5, 1, 1567.5, 606.5, 0, 1574, 603.5, 0, 1580.5, 603, 0, 1585.5, 605, 0, 1588.5, 609.5, 1, 1591, 615, 0, 1589.5, 622, 0, 1586.5, 632, 1, 1588, 645, 0,
        1585.5, 657, 0, 1584, 668, 1, 1585.5, 681, 0, 1583, 693, 0, 1580.5, 702, 1, 1582, 712, 0, 1586.5, 723, 0, 1588.5, 736, 1, 1590, 748, 0, 1592, 760, 0,
        1588.5, 767, 1, 1580, 773, 0, 1572, 765, 1, 1563.5, 773.5, 0, 1555, 765.5, 1, 1546, 774, 0, 1538, 766.5, 1, 1532.5, 770.5, 0, 1529.5, 762, 1, 1532, 752, 0,
        1535.5, 742, 0, 1532, 731, 1, 1529, 721, 0, 1530, 710, 0, 1534, 700, 1, 1535, 689, 0, 1535.5, 678, 0, 1539.5, 669, 1, 1543.5, 662, 0, 1548, 653, 1,
        1553, 645.5, 0, 1558.5, 635, 1, 1564, 628, 0, 1571, 619.5, 1, 1566.5, 615.5, 0,
      ],
      holes: [
        { x: 1557, y: 686, rx: 10, ry: 7, tilt: -18, form: 'kidney', through: true, open: 0.72, toward: 125, lip: [2.39, 2.99, 3.24, 3.79] },
        { x: 1545.5, y: 699, rx: 3.4, ry: 2.4, tilt: 35, through: true, open: 0.75, toward: 125, lip: [] },
        { x: 1573.5, y: 735, rx: 2.4, ry: 7.5, tilt: 22, through: true, open: 0.8 },
        { x: 1565, y: 747, rx: 1.8, ry: 2.8, tilt: 15, through: true, open: 0.8 },
        { x: 1567.5, y: 718, rx: 6, ry: 4.6, tilt: 20, dish: true },
        { x: 1546.5, y: 719, rx: 3.6, ry: 5, tilt: -12, form: 'tear' },
        { x: 1577.5, y: 663, rx: 4.2, ry: 3.2, tilt: -40, form: 'kidney' },
        { x: 1553, y: 757, rx: 3, ry: 2.2, tilt: -30, form: 'kidney' },
        { x: 1561, y: 702, rx: 1.4, ry: 1.2, tilt: 0 },
        { x: 1584, y: 693, rx: 1.2, ry: 1.1, tilt: 0 },
        { x: 1581, y: 614, rx: 1.2, ry: 1.1, tilt: 0 },
      ],
      ledges: [
        [1558.5, 635, 1564, 640, 1568.5, 648, 1570, 656, 1568, 665, 1564.5, 672],
        [1548, 653, 1553, 659, 1555.5, 667, 1554.5, 674],
        [1539.5, 669, 1544, 674, 1545.5, 680],
        [1534, 700, 1540, 704.5, 1548, 706.5, 1555, 707.5],
        [1584, 668, 1578, 674, 1572, 676, 1568.5, 679],
        [1586.5, 632, 1580, 637, 1574, 637.5, 1569, 635, 1563.5, 634],
        [1580.5, 702, 1576.5, 706, 1570, 708, 1563, 708.5],
        [1588.5, 736, 1583, 741, 1580, 749, 1581, 757, 1583.5, 764],
        [1532, 731, 1537, 735, 1541.5, 742, 1542, 750, 1540, 758, 1541, 765],
        [1571, 619.5, 1575, 623],
      ],
      veins: [
        [1586, 612, 1583.5, 622, 1584, 630],
        [1576.5, 607, 1579.5, 616, 1578.5, 624, 1575, 631],
        [1561, 656, 1563, 664],
        [1556, 713, 1557, 724, 1555.5, 734, 1558, 744],
        [1540, 679, 1541, 690],
        [1572, 765, 1570.5, 759],
        [1555, 765.5, 1555.5, 760],
        [1586, 682, 1583.5, 690],
      ],
      nests: [[1579, 647, 2.6, 4], [1549, 741, 2.4, 3]],
      moss: [1539, 666.5, 1534, 700.5],
    },
  ],
}

const FRONT_LUMPS: Rock[] = [
  // The lower lump under the corner beside the steps: its top uneven, lobed and notched, a kidney hollow, a slot through it under an
  // overhang (the light under the plinth shows through), a tear low down.
  {
    knots: [
      1356, 836, 1, 1352, 824, 0, 1356, 815, 1, 1362, 810, 0, 1370, 809, 1, 1377, 806.5, 0, 1384, 803.5, 1, 1390, 798, 0, 1397, 794.5, 1, 1404, 797, 0,
      1410, 795, 1, 1417, 794.5, 0, 1423, 798, 1, 1428, 803, 0, 1431, 811, 1, 1429, 821, 0, 1432, 836, 1,
    ],
    holes: [
      { x: 1404, y: 811, rx: 4.4, ry: 3.3, tilt: -30, form: 'kidney' },
      { x: 1377, y: 816, rx: 6, ry: 2.2, tilt: -8, through: true, toward: 300, open: 0.85 },
      { x: 1362, y: 826, rx: 2.6, ry: 3.6, tilt: 18, form: 'tear' },
      { x: 1421, y: 816, rx: 1.4, ry: 1.2, tilt: 0 },
    ],
    ledges: [[1384, 800, 1384, 806, 1380, 811, 1372, 812], [1423, 798, 1419, 803, 1416, 810], [1356, 815, 1362, 817, 1368, 816]],
    furrows: [[1426, 818, 1424, 828]],
    veins: [[1392, 811, 1395, 822, 1393, 832], [1414, 817, 1412, 829]],
    nests: [[1397, 821, 2.4, 3]],
    moss: [1431, 834],
    seams: [16],
  },
  // The taller lump under the right-hand column, its top leaning left over a deep notch: a cleft through it (漏) down its left side,
  // a shallow dish under an overhang, a tear, pits.
  {
    step: 3.4,
    wear: 1.3,
    knots: [
      1436, 836, 1, 1435, 822, 0, 1438, 810, 1, 1441, 799, 0, 1445, 789, 1, 1450, 780, 0, 1456, 774, 1, 1463, 774, 0, 1469, 771, 1, 1476, 767.5, 0,
      1483, 762.5, 1, 1491, 763, 0, 1497, 768.5, 0, 1499.5, 776, 1, 1497.5, 783, 0, 1502, 791, 0, 1504, 802, 1, 1501, 812, 0, 1505, 822, 1, 1507, 836, 1,
    ],
    holes: [
      { x: 1450, y: 800, rx: 2.6, ry: 9.5, tilt: 12, through: true, toward: 0, open: 0.8 },
      { x: 1486, y: 797, rx: 6.5, ry: 5.2, tilt: -12, dish: true },
      { x: 1470, y: 813, rx: 2.8, ry: 4, tilt: 22, form: 'tear' },
      { x: 1478, y: 777, rx: 1.4, ry: 1.2, tilt: 0 },
      { x: 1493, y: 816, rx: 1.4, ry: 1.2, tilt: 0 },
    ],
    ledges: [[1469, 768, 1466, 775, 1459, 779, 1452, 780], [1499.5, 776, 1494, 782, 1484, 786], [1504, 802, 1497, 806, 1490, 806], [1501, 812, 1494, 820]],
    furrows: [[1476, 771, 1478, 781]],
    veins: [[1459, 796, 1462, 810, 1459, 824], [1481, 806, 1484, 819, 1481, 831]],
    nests: [[1467, 800, 2.4, 3]],
    moss: [1437, 834],
    seams: [19],
  },
]

const FRONT_SLABS: Rock[] = [
  // The slab at the water under the stair: thin, its ends broken off square and chipped, a lit top, a crisp nosing, a darker front
  // face notched along its lower edge, a crisp dark undercut where it stands out over the water.
  {
    knots: [
      1271.5, 830.5, 1, 1279, 827.5, 1, 1298, 827, 0, 1318, 826.5, 0, 1336, 827, 0, 1352, 826.5, 0, 1364, 827.5, 1, 1367.5, 831, 1, 1365, 833.5, 1, 1369.5, 836, 1,
      1366, 840, 1, 1356, 839.5, 0, 1349, 841, 1, 1346.5, 838.5, 1, 1336, 840.5, 0, 1322, 840, 1, 1319, 837.5, 1, 1310, 841, 0, 1292, 840.5, 0, 1283, 841, 1,
      1279.5, 838.5, 1, 1273, 839.5, 1, 1269.5, 835, 1,
    ],
    holes: [{ x: 1316, y: 835.5, rx: 3.2, ry: 1.9, tilt: -6, dish: true, lip: [] }],
    ledges: [[1271.5, 832.5, 1290, 832.3, 1312, 832.8, 1338, 832.4, 1365, 832.6]],
    lights: [[1274, 830.3, 1300, 828.2, 1336, 828.2, 1362, 829, 1364.5, 830.8, 1336, 831.6, 1300, 831.8, 1276, 831.8]],
    wear: 0.7,
    step: 6,
    crisp: true,
    under: [1276, 838, 1300, 838, 1340, 838, 1364, 838, 1363, 842.5, 1340, 843.6, 1310, 844, 1290, 843.6, 1277, 842.5],
  },
  // The long slab along the water in front of the lumps: two slabs laid end to end (a crack across between them), ends broken off.
  {
    knots: [
      1377, 831, 1, 1383, 828, 1, 1400, 828.5, 0, 1420, 827.5, 0, 1440, 828, 0, 1451, 827, 1, 1454, 829.5, 1, 1458, 827.5, 1, 1476, 826.5, 0, 1496, 827, 0,
      1514, 826.5, 0, 1527, 827.5, 1, 1531.5, 830, 1, 1529.5, 832.5, 1, 1533.5, 835.5, 1, 1529, 840, 1, 1514, 839, 0, 1505, 840.5, 1, 1502, 837.5, 1, 1490, 841, 0,
      1470, 840.5, 0, 1458, 841, 1, 1455, 838.5, 1, 1452, 838.5, 1, 1447, 841, 1, 1430, 840.5, 0, 1421, 841.5, 1, 1418, 838.5, 1, 1406, 841, 0, 1390, 840.5, 0,
      1381, 840.5, 1, 1376, 837, 1,
    ],
    holes: [{ x: 1478, y: 835.5, rx: 3.4, ry: 2, tilt: -8, dish: true, lip: [] }, { x: 1428, y: 835, rx: 1.4, ry: 1.2, tilt: 0 }],
    ledges: [[1377, 832.8, 1400, 832.2, 1425, 832.6, 1451, 832.3], [1456, 832.5, 1480, 831.8, 1505, 832.2, 1531, 831.8]],
    veins: [[1454, 829.6, 1453.5, 838.4]],
    lights: [[1380, 830.3, 1406, 829.2, 1450, 828.3, 1498, 828.3, 1527, 829.2, 1529.5, 830.8, 1498, 831.4, 1450, 831.6, 1406, 831.8, 1381, 832]],
    wear: 0.7,
    step: 6,
    crisp: true,
    under: [1382, 838, 1450, 838, 1460, 838, 1525, 838, 1525, 842.5, 1500, 843.5, 1470, 844, 1440, 844, 1410, 843.6, 1383, 842.5],
  },
]

/** Where the pavilion's light comes from, by night (in the pavilion's units): the rockery takes it on the faces turned to it. */
const PAVILION_LIGHT = pt(1462, 727)

/** The rockery, laid out in sheet units and drawn in the pavilion's group: lit from the upper right; by night the lantern catches
 * only the rims of the back stones turned to the lit pavilion, between its floor and the shade of its roof (the plinth keeps it
 * off the stones in front). Its lines fade into the water. */
function rockery(stock: Stock): { back: Built; front: Built } {
  const paint = stock.rock
  const lamp = stock.paint.lamp
  const fromSheet = (x: number, y: number): Point => pt((x - NEAR_X) / NEAR.k, (y - NEAR_Y) / NEAR.k)
  const look: RockLook = {
    paint,
    light: pt(0.5, -0.87),
    scale: NEAR.k,
    weight: 0.66,
    gradient: 'rkg',
    step: 4.6,
    wear: 1.7,
    plain: true,
    pen: 'url(#rks)',
    lamp: lamp ? { at: PAVILION_LIGHT, paint: 'url(#rkl)', top: fromSheet(0, 640).y, bottom: fromSheet(0, 772).y } : undefined,
  }
  const courses = [
    drawCourse('ka', RIGHT_MASS.low, fromSheet, look),
    drawCourse('kb', RIGHT_MASS.middle, fromSheet, look, 'ka'),
    drawCourse('kd', RIGHT_MASS.back, fromSheet, look, 'kb'),
    drawCourse('kc', RIGHT_MASS.top, fromSheet, look, 'kb'),
  ]
  const plainLook: RockLook = { ...look, lamp: undefined }
  const fronts = [drawCourse('kf', FRONT_LUMPS, fromSheet, plainLook), drawCourse('ks', FRONT_SLABS, fromSheet, plainLook)]
  const shared =
    `<linearGradient id="rkg" x1="0.7" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${paint.lit}" stop-opacity="${share(paint.litCover * 0.8)}"/>` +
    `<stop offset="0.36" stop-color="${paint.lit}" stop-opacity="0"/><stop offset="1" stop-color="${paint.wash}" stop-opacity="${share(0.42 * paint.washCover)}"/></linearGradient>` +
    `<linearGradient id="rks" gradientUnits="userSpaceOnUse" x1="0" y1="848" x2="0" y2="861"><stop offset="0" stop-color="${paint.pen}" stop-opacity="${share(paint.penCover)}"/><stop offset="1" stop-color="${paint.pen}" stop-opacity="0"/></linearGradient>` +
    (lamp
      ? `<radialGradient id="rkl" gradientUnits="userSpaceOnUse" cx="${PAVILION_LIGHT.x}" cy="${PAVILION_LIGHT.y + 20}" r="150">` +
        `<stop offset="0" stop-color="${stock.lampOnStone}" stop-opacity="0.55"/><stop offset="0.55" stop-color="${stock.lampOnStone}" stop-opacity="0.4"/><stop offset="1" stop-color="${stock.lampOnStone}" stop-opacity="0"/></radialGradient>`
      : '')
  const join = (parts: Built[]): Built => ({ defs: parts.map(part => part.defs).join(''), markup: parts.map(part => part.markup).join('') })
  const back = join(courses)
  return { back: { defs: shared + back.defs, markup: back.markup }, front: join(fronts) }
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
    : skyPainted(panels, stock.sky) + drawn(panels, stock, 0.8, 0.5)
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

// `from` reaches well past the sheet's left edge: the whole left group is set down smaller and further right (LEFT_AT).
const WALL: Wall = { from: -70, to: 410, eave: 668, ground: 846, scale: 0.8 }

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
/** A small plain seal: a vermilion square with a four-lobed crabapple flower left bare, the same mark as Lattice Windows. A mark,
 * not a character. */
function seal(x: number, y: number, stock: Stock): string {
  const bare = skyAt(stock.sky, x + 12, y + 12)
  return (
    `<g transform="translate(${x} ${y})" opacity="0.92"><rect width="24" height="24" rx="2.2" fill="${stock.seal}"/>` +
    `<path d="M15.2 8.8a3.2 3.2 0 0 1 0 6.4a3.2 3.2 0 0 1 -6.4 0a3.2 3.2 0 0 1 0 -6.4a3.2 3.2 0 0 1 6.4 0Z" stroke="${bare}" stroke-width="1.6"/>` +
    `<circle cx="12" cy="12" r="1.3" fill="${bare}"/></g>`
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

/** The left group (wall, gate, peak, banana, bamboo) is drawn in the numbers it was designed in and set down a little smaller
 * and further right: on a wide window the app's sidebar covers the sheet to about x 197, and the gate's ring, which began at
 * 178, lost its left side there. Now the ring runs from about 210 to 338 and the peak still ends before the reading column. */
const LEFT_AT = { k: 0.889, x: 52, y: 98 }

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
  const { back, front } = rockery(stock)
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
    tuft(stock, 1477, 830, 10, 67) +
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
    `<g transform="translate(${LEFT_AT.x} ${LEFT_AT.y}) scale(${LEFT_AT.k})">` +
    beyondGate(stock) +
    bamboo(stock) +
    wall.markup +
    (g ? `<ellipse cx="${GATE.x}" cy="${WALL.ground + 6}" rx="118" ry="12" fill="url(#gp)"/>` : '') +
    plantedBed(stock) +
    peak.markup +
    `<g transform="translate(${round(BANANA_AT.x - BANANA_AT.from.x * BANANA_AT.k)} ${round(BANANA_AT.y - BANANA_AT.from.y * BANANA_AT.k)}) scale(${BANANA_AT.k})">${plant.markup}</g>` +
    '</g>' +
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

/** Every path's data written again as tightly as it goes, losing nothing: each step relative or absolute, whichever is shorter,
 * in whole tenths (every number in these sheets has at most one decimal, so the steps are exact). A path with any finer number
 * is left as it is. The shapes, and so the pixels, are the same. */
function tightPath(d: string): string {
  const tokens = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)/g) ?? []
  // A smooth curve that reflects its last control point (T, S) is drawn a hair differently when its steps are relative: left alone.
  if (tokens.some(token => /\.\d\d/.test(token) || /^[TtSs]$/.test(token))) return d
  const counts: Record<string, number> = { M: 2, L: 2, T: 2, Q: 4, C: 6, S: 4, H: 1, V: 1, A: 7, Z: 0 }
  const tenth = (token: string): number => Math.round(parseFloat(token) * 10)
  const text = (value: number): string => {
    const sign = value < 0 ? '-' : ''
    const whole = Math.floor(Math.abs(value) / 10)
    const part = Math.abs(value) % 10
    return sign + (part ? `${whole || ''}.${part}` : `${whole}`)
  }
  let out = ''
  let last = ''
  /** Numbers run on with as little between them as the grammar allows. */
  const put = (letter: string, values: string[]): void => {
    let body = ''
    let previous = letter === last ? out : ''
    for (const value of values) {
      const tail = body || previous
      const joined = !tail || /[A-Za-z]$/.test(tail) || value.startsWith('-') || (value.startsWith('.') && /\.\d*$/.test(tail))
      body += (joined ? '' : ' ') + value
      previous = ''
    }
    out += (letter === last ? '' : letter) + body
    last = letter
  }
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  let command = ''
  let index = 0
  while (index < tokens.length) {
    const token = tokens[index] ?? ''
    if (/[A-Za-z]/.test(token)) {
      command = token
      index += 1
      if (command === 'Z' || command === 'z') {
        out += 'z'
        last = 'z'
        x = startX
        y = startY
      }
      continue
    }
    const upper = command.toUpperCase()
    const relative = command !== upper
    const many = counts[upper] ?? 0
    if (!many) return d
    const values = tokens.slice(index, index + many).map(tenth)
    if (values.length < many) return d
    index += many
    // The point each value is measured from, absolute and relative; arcs keep their radii, turn and flags.
    const absolute: number[] = []
    const steps: number[] = []
    values.forEach((value, at) => {
      if (upper === 'A' && at < 5) {
        absolute.push(value)
        steps.push(value)
        return
      }
      const isY = upper === 'V' ? true : upper === 'H' ? false : upper === 'A' ? at === 6 : at % 2 === 1
      const base = isY ? y : x
      const abs = relative ? value + base : value
      absolute.push(abs)
      steps.push(abs - base)
    })
    if (upper === 'H') x = absolute[0] ?? x
    else if (upper === 'V') y = absolute[0] ?? y
    else {
      x = absolute[absolute.length - 2] ?? x
      y = absolute[absolute.length - 1] ?? y
    }
    const first = out === ''
    const shortRel = steps.map(text)
    const shortAbs = absolute.map(text)
    const useRel = !first && shortRel.join(' ').length <= shortAbs.join(' ').length
    if (upper === 'M') {
      startX = x
      startY = y
      // Pairs after a move are lines.
      command = relative ? 'l' : 'L'
      // A move breaks any run: written with its letter always.
      last = ''
      put(useRel ? 'm' : 'M', useRel ? shortRel : shortAbs)
      last = useRel ? 'l' : 'L'
      continue
    }
    put(useRel ? upper.toLowerCase() : upper, useRel ? shortRel : shortAbs)
  }
  return out
}

/** The sheet with its paths written tightly. */
function tight(svg: string): string {
  return svg.replace(/ d="([^"]*)"/g, (_, d: string) => ` d="${tightPath(d)}"`)
}

/** On a clear day (晴日写真), for a light window. */
export function daySvg(): string {
  return tight(gardenSheet(STOCKS.day))
}

/** On the moon-glow night, for a dark window. */
export function nightSvg(): string {
  return tight(gardenSheet(STOCKS.night))
}
