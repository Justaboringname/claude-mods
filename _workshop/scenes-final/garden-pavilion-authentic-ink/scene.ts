// Pavilion by the Water (水亭曲桥): a Suzhou garden sheet, sibling of Ink Mountains.
// Lower right: a six-sided garden pavilion with the steep, flying eave corners of Jiangnan, a tiled tent roof with a
// gourd finial, slender columns, a hanging fretwork frieze under the lintel and a "beauty's rest" bench leaning out
// over the pond. It stands on a stone plinth among piled lake stones; a zigzag bridge of stone slabs with low rails
// comes to it out of the mist and lands at three steps.
// Top right: willow strands hang in across a small low sun (a pale moon by night). Left band: a Taihu peak in the pond, lean,
// big above and small below, its head hooked over the water, standing on a flat stone among lotus leaves; under the
// pavilion, a rockery of lake stones piled in courses, high at the right, with a cave at the water.
// The two ink sheets (daySvg, nightSvg) are grey ink on mist or charcoal: the sun and the seal are the only colour.
// The water is only suggested: a few level strokes under the pavilion and slow ripple rings.
// Motion: the willow strands sway, the ripple rings widen and fade, the reflection strokes shimmer; nothing else.
// The ground is a sky of mist (by day) or charcoal (by night); the dusk skies of Ink Mountains (orange, wine, violet) are
// kept as further stocks. Pure string building, no imports, the same string on every call.

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
}

const STOCKS: { day: Stock; night: Stock; nightBlue: Stock; dayInk: Stock; nightInk: Stock } = {
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
function holeReach(form: LakeHole['form'], angle: number, seed: number): number {
  const wobble = 0.05 * Math.sin(3 * angle + seed) + 0.04 * Math.sin(5 * angle + seed * 1.7)
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
    const reach = holeReach(hole.form, angle, seed) * k
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
function lakeStone(stock: Stock, id: string, stone: LakeStone, place: (x: number, y: number) => Point, scale: number, pen: string, underPaint: string, weight = 1): Built {
  const points = stone.knots.map(knot => place(knot[0], knot[1]))
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
  let heavy = ''
  let middle = ''
  let light = ''
  let hollows = ''
  const lost = stone.lost ?? []
  const seams = stone.seams ?? []
  const controls: Point[] = []
  for (let index = 0; index < count; index += 1) {
    const a = points[index]
    const b = points[(index + 1) % count]
    if (!a || !b) continue
    const dx = b.x - a.x
    const dy = b.y - a.y
    const length = Math.hypot(dx, dy) || 1
    const normal = pt((dy * turn) / length, (-dx * turn) / length)
    const bulge = stone.knots[index]?.[2] ?? 0
    const control = pt((a.x + b.x) / 2 + normal.x * length * bulge, (a.y + b.y) / 2 + normal.y * length * bulge)
    controls.push(control)
    outline += `Q${at(control)} ${at(b)}`
    if (bulge < -0.1) {
      // A bay in the outline: a crescent of shade just inside it, deepest at its middle.
      const deep = pt(control.x - normal.x * length * 0.24, control.y - normal.y * length * 0.24)
      hollows += `M${at(a)}Q${at(control)} ${at(b)}Q${at(deep)} ${at(a)}Z`
    }
    if (seams.includes(index)) continue
    let piece = `M${at(a)}Q${at(control)} ${at(b)}`
    if (lost.includes(index)) {
      // Only the first part of the edge: the light eats the rest.
      const near = lerp(a, control, 0.5)
      piece = `M${at(a)}Q${at(near)} ${at(lerp(near, lerp(control, b, 0.5), 0.5))}`
    }
    const facing = normal.x * LIGHT.x + normal.y * LIGHT.y
    if (facing < -0.3) heavy += piece
    else if (facing > 0.4) light += piece
    else middle += piece
  }
  outline += 'Z'

  // The holes. A pit is a small loop, lightly washed. A hole has its near rim and its far opening (`k` of its size, moved
  // toward where it runs back); between them its wall, darkest under the upper lip; a line along the far opening on the
  // wall's side. A blind hole's floor is a lighter grey than that wall, so it never reads as a dark pupil in a pale iris.
  // Round the mouth of a through hole the stone swells: one more arc outside its rim, below it, where the water turned.
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
    const k = hole.through ? 0.66 : 0.6
    const shift = (1 - k) * Math.min(hole.rx, hole.ry) * 0.9
    const far = smoothRing(holeRing(hole, place, k, shift, seed))
    rims += near
    walls += near + far
    if (hole.through) cuts += far
    else floors += far
    const centre = ((hole.toward + 180 - hole.tilt) * Math.PI) / 180
    inner += smoothPath(holeRing(hole, place, k, shift, seed, centre - 1.35, centre + 1.35, 6))
    if (hole.through && Math.min(hole.rx, hole.ry) * scale > 3.4) inner += smoothPath(holeRing(hole, place, 1.42, 0, seed + 2, 0.45, 2.45, 6))
  })

  const run = (values: number[]): Point[] => pairs(values).map(point => place(point.x, point.y))
  // The washes inside the outline on its shaded side: the outline's own arcs, then back along a line set in from them.
  let rimWash = ''
  for (const rim of stone.rims ?? []) {
    const from = rim[0] ?? 0
    const to = rim[1] ?? 0
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
  let contours = ''
  let bands = ''
  for (const contour of stone.contours ?? []) {
    const line = run(contour)
    contours += smoothPath(line)
    bands += contourBand(line, 5 * scale + 0.6)
  }
  let texture = ''
  for (const groove of stone.grooves ?? []) texture += smoothPath(run(groove))
  for (const hatch of stone.hatches ?? []) {
    const [a, c, b] = run(hatch)
    if (a && c && b) texture += `M${at(a)}Q${at(c)} ${at(b)}`
  }
  // Each cluster is turned its own way and some lose a ring, so no two read as the same stamp.
  const salt = id.charCodeAt(0) * 7 + id.charCodeAt(id.length - 1)
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

  const defs =
    `<path id="${id}" fill-rule="evenodd" d="${outline}${cuts}"/>` +
    // Paper white where the stone turns to the light, fading out across it; the rest of it is the bare sheet.
    `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${round(maxX)}" y1="${round(minY + (maxY - minY) * 0.25)}" x2="${round(minX)}" y2="${round(minY + (maxY - minY) * 0.6)}">` +
    `<stop offset="0" stop-color="${stock.wall}" stop-opacity="${share(stock.wallAlpha * stone.tone)}"/><stop offset="0.42" stop-color="${stock.wall}" stop-opacity="0"/></linearGradient>`
  const shade = (d: string, strength: number, extra = ''): string => (d ? `<path d="${d}" fill="${stock.shade}" fill-opacity="${share(strength * stock.shadeAlpha)}"${extra}/>` : '')
  const line = (d: string, width: number, strength: number): string =>
    d ? `<path d="${d}" stroke="${pen}" stroke-width="${round(width * weight * 100) / 100}" stroke-opacity="${share(strength * stock.line)}"/>` : ''
  const lip = stone.lip ? smoothPath(run(stone.lip)) : ''
  const under = stone.under ? smoothRing(run(stone.under)) : ''
  const cavePoints = stone.cave ? run(stone.cave) : []
  const cave = cavePoints.length ? smoothPath(cavePoints) + 'Z' : ''
  const arch = cavePoints.length > 4 ? smoothPath(cavePoints.slice(1, -1)) : ''
  const markup =
    (under ? `<path d="${under}" fill="${underPaint}"/>` : '') +
    skyPaintedShape(id, stock.sky) +
    // The body a pale grey: lake stone is grey, never coloured, and a little darker than the mist it stands in.
    `<use href="#${id}" fill="${stock.ink}" fill-opacity="${share(0.11 * stock.wash)}"/>` +
    `<use href="#${id}" fill="url(#${id}g)"/>` +
    shade(rimWash, 0.13) +
    shade(bands + hollows + shadows, 0.12) +
    shade(walls, 0.4, ' fill-rule="evenodd"') +
    shade(floors, 0.18) +
    shade(pits, 0.26) +
    (cave ? `<path d="${cave}" fill="url(#rc)"/>` : '') +
    line(texture, 0.6, 0.36) +
    line(rings, 0.5, 0.4) +
    line(contours, 0.85, 0.58) +
    line(inner, 0.6, 0.5) +
    line(rims, 0.8, 0.66) +
    line(pits, 0.6, 0.42) +
    line(lip, 1.3, 0.68) +
    line(arch, 1.3, 0.72) +
    line(light, 0.7, 0.6) +
    line(middle, 1.05, 0.74) +
    line(heavy, 1.7, 0.8) +
    (moss ? `<path d="${moss}" stroke="${pen}" stroke-width="${round(2.1 * weight * 10) / 10}" stroke-opacity="${share(0.72 * stock.line)}"/>` : '') +
    (mossSmall ? `<path d="${mossSmall}" stroke="${pen}" stroke-width="${round(1.3 * weight * 10) / 10}" stroke-opacity="${share(0.66 * stock.line)}"/>` : '')
  return { defs, markup }
}

function pairs(values: number[]): Point[] {
  const points: Point[] = []
  for (let index = 0; index + 1 < values.length; index += 2) points.push(pt(values[index] ?? 0, values[index + 1] ?? 0))
  return points
}

// The peak in the pond (立峰), after the Lingering Garden's 冠云峰 and the 晚翠峰 of its stone-grove court: a lean column,
// big above and small below (上大下小, 园冶). Its head is a crown of three unequal swellings with notches between them
// that runs out to the right into a short, heavy curl, cantilevered over the water beyond the foot like a breaking wave,
// its blunt lip turned down (short, so it never hangs like a beak or a trunk); on the left the head stands nearly flush
// with the neck. The one large hole goes through the neck just under the overhang, off-centre, high up (the sky shows
// in it); the head itself is left whole, so nothing in it can be read as an eye. Below, a waist under half the head's
// width, a short arm thrust out to the left a little below the middle, and a foot that goes down into its base stone
// with no line drawn across it. The outline mixes nearly straight runs, round lobes of unequal size and a few deep
// bays. A few holes of middling size lower down, one of them through, and a scatter of small pits. Inner contours part
// its lobes, as a painter draws them; long grooves and short curved strokes on the shaded side. In a box about 124 wide
// and 240 tall, clockwise from the left of its crown.
const PEAK: LakeStone = {
  knots: [
    [38, 28, 0.12], [42, 12, 0.2], [58, 10, -0.1], [66, 2, 0.06], [88, 0, 0.18], [105, 13, 0.1], [124, 20, 0.22], [134, 42, 0.12],
    [130, 58, 0.16], [127, 75, 0.26], [118, 73, -0.2], [108, 66, -0.1], [98, 70, 0.08], [96, 86, 0.14], [89, 101, -0.1], [88, 116, 0.04],
    [86, 128, 0.16], [82, 142, -0.24], [92, 156, 0.26], [88, 178, 0.03], [90, 198, 0.12], [84, 214, -0.12], [88, 230, 0.08], [92, 240, 0],
    [30, 240, 0.08], [34, 226, 0.03], [28, 210, 0.18], [39, 195, -0.2], [22, 182, 0.06], [10, 172, 0.2], [16, 160, -0.16], [32, 152, 0.04],
    [38, 134, 0.14], [45, 117, -0.16], [36, 100, 0.2], [44, 86, 0.04], [40, 64, -0.14], [34, 46, 0.12],
  ],
  holes: [
    { x: 75, y: 77, rx: 11, ry: 8.5, tilt: -22, through: true, form: 'kidney', toward: 120 },
    { x: 58, y: 120, rx: 5.6, ry: 3.8, tilt: -10, through: false, form: 'kidney', toward: 95 },
    { x: 30, y: 174, rx: 6, ry: 4, tilt: -14, through: false, form: 'kidney', toward: 80 },
    { x: 72, y: 140, rx: 2.2, ry: 6, tilt: 12, through: false, form: 'oval', toward: 90 },
    { x: 66, y: 204, rx: 6, ry: 7.6, tilt: 15, through: true, form: 'oval', toward: 60 },
    { x: 82, y: 122, rx: 1.8, ry: 2.6, tilt: 10, through: false, form: 'oval', toward: 90 },
    { x: 54, y: 160, rx: 2, ry: 2.4, tilt: 0, through: false, form: 'oval', toward: 90 },
    { x: 78, y: 182, rx: 1.7, ry: 2.2, tilt: -10, through: false, form: 'oval', toward: 90 },
    { x: 46, y: 228, rx: 2.2, ry: 1.8, tilt: 0, through: false, form: 'oval', toward: 90 },
    { x: 76, y: 234, rx: 1.6, ry: 2, tilt: 0, through: false, form: 'oval', toward: 90 },
  ],
  contours: [
    // The crown's two swellings; the underside of the head where it hangs over the neck.
    [58, 10, 62, 20, 70, 28, 82, 32],
    [105, 13, 103, 21, 105, 29],
    [40, 64, 49, 59, 57, 58, 63, 61],
    // The hook's inner swelling, rising from the bay under it.
    [108, 66, 113, 57, 119, 49, 124, 41],
    // The lobe at the right of the waist; the waist's left lobe; the lobe at the right below it.
    [89, 101, 82, 105, 76, 111, 70, 120],
    [45, 117, 50, 123, 53, 131, 53, 142],
    [82, 142, 75, 148, 70, 157, 68, 167],
    // The underside of the arm where it leaves the body; the lower lobe at the right.
    [39, 195, 47, 189, 58, 185, 68, 187],
    [84, 214, 76, 217, 68, 223, 64, 233],
  ],
  grooves: [
    [48, 72, 46, 86, 48, 100],
    [62, 90, 60, 102, 62, 111],
    [60, 136, 59, 148],
    [46, 144, 44, 156, 46, 170],
    [58, 164, 56, 176],
    [42, 200, 40, 212, 43, 224],
    [78, 150, 80, 162],
    [60, 34, 58, 44, 60, 54],
    [114, 30, 116, 44],
  ],
  hatches: [
    [41, 34, 38, 41, 40, 49],
    [43, 94, 42, 100, 44, 106],
    [44, 128, 42, 134, 44, 140],
    [34, 204, 32, 210, 34, 216],
    [16, 177, 21, 181, 27, 183],
    [123, 70, 118, 67, 113, 63],
    [92, 12, 98, 16, 102, 22],
  ],
  rings: [[44, 184, 1], [74, 20, 0.9], [104, 40, 0.85]],
  rims: [[24, 27, 7], [27, 29, 5], [30, 34, 6], [34, 37, 6], [9, 12, 5]],
  shadows: [
    // Under the hook, on the neck below its bay.
    [98, 71, 95, 80, 94, 92, 90, 89, 91, 77],
    // The foot, where it meets its base.
    [31, 239, 91, 239, 89, 232, 60, 230, 34, 233],
  ],
  // In clusters at the crown's notch, on the arm and in the crease under the head; none along the foot.
  moss: [57, 11.5, 17, 161, 41, 66],
  lost: [3, 19],
  // The foot is not drawn: the peak goes down into its base stone, not onto it.
  seams: [23],
  tone: 0.85,
}

/** The broad flat stone the peak stands on, low in the water, wider than its foot, thicker at its left; and the dark
 * hollow under it. Its top is not drawn where the peak goes down into it, and only begun at either side, so the peak
 * grows out of it instead of standing on a tray; its front is an uneven face with a few short grooves. */
const PEAK_BASE: LakeStone = {
  knots: [
    [4, 249, 0.12], [10, 239, 0.08], [22, 234, -0.06], [40, 231.5, 0.03], [96, 233, 0.05], [108, 235, 0.14], [117, 238, -0.14],
    [127, 243, 0.1], [124, 250, 0.04], [104, 253, -0.07], [84, 251.5, 0.05], [58, 254, -0.05], [32, 252.5, 0.06], [12, 254, 0.05],
  ],
  holes: [{ x: 106, y: 248, rx: 2.4, ry: 1.6, tilt: 0, through: false, form: 'oval', toward: 90 }],
  grooves: [[44, 246, 43, 252], [88, 246.5, 89, 251.5], [113, 244, 112, 249.5]],
  shadows: [[8, 247, 30, 244, 52, 246.5, 76, 244.5, 100, 246, 124, 246.5, 122, 251, 104, 253, 84, 251.5, 58, 254, 32, 252.5, 12, 253]],
  under: [10, 252.5, 32, 252, 58, 253, 84, 251, 104, 252.5, 124, 249.5, 128, 254, 100, 258, 60, 259, 20, 258, 6, 254],
  moss: [101, 235],
  lost: [1, 4],
  seams: [2, 3],
  tone: 0.8,
}

/** A low companion stone in the water at the left of the base, leaning out over the water; its hole low on its side. */
const PEAK_COMPANION: LakeStone = {
  knots: [[-14, 230, 0.12], [-8, 218, 0.06], [4, 212, 0.16], [16, 214, -0.1], [24, 220, 0.18], [28, 234, 0.04], [26, 244, 0.1], [28, 252, 0], [-2, 252, 0.06], [-2, 244, -0.14], [-10, 238, 0.1]],
  holes: [{ x: 16, y: 238, rx: 3.8, ry: 2.8, tilt: -10, through: false, form: 'kidney', toward: 90 }],
  contours: [[16, 214, 12, 222, 6, 228, 4, 236]],
  rings: [[2, 224, 0.6]],
  under: [-2, 251.5, 28, 251.5, 30, 256, 12, 258.5, -2, 256],
  lost: [2],
  tone: 0.9,
}

/** A pebble of a stone at the right of the base. */
const PEAK_PEBBLE: LakeStone = {
  knots: [[122, 254, 0.1], [124, 246, 0.14], [133, 241, 0.12], [142, 246, 0.1], [144, 254, 0]],
  holes: [],
  under: [122, 253.5, 144, 253.5, 140, 258, 126, 258.5],
  tone: 0.8,
}

/** The peak, its base and its two small companions, the foot of the peak at (footX, footY). */
function pondPeak(stock: Stock, footX: number, footY: number, size: number): Built {
  const place = (x: number, y: number): Point => pt(footX + (x - 61) * size, footY + (y - 240) * size)
  const parts = [
    lakeStone(stock, 'pb', PEAK_BASE, place, size, stock.ink, 'url(#lu)'),
    lakeStone(stock, 'pk', PEAK, place, size, stock.ink, 'url(#lu)'),
    lakeStone(stock, 'pc', PEAK_COMPANION, place, size, stock.ink, 'url(#lu)', 0.9),
    lakeStone(stock, 'pp', PEAK_PEBBLE, place, size, stock.ink, 'url(#lu)', 0.85),
  ]
  const top = place(0, 250).y
  const defs =
    parts.map(part => part.defs).join('') +
    // The hollows under the base and its companions, darkest at the stone and gone a few units down in the water.
    `<linearGradient id="lu" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(place(0, 259).y)}">` +
    `<stop offset="0" stop-color="${stock.shade}" stop-opacity="${share(0.5 * stock.shadeAlpha)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="0"/></linearGradient>`
  return { defs, markup: parts.map(part => part.markup).join('') }
}

// The rockery under the pavilion (池山), piled from lake stones in rough level courses rather than set in a row: one main
// mass, high, at the right, stacked from two stones (the upper one big above and small below, its crown broken by a
// notch and curling over on the right, a hole through it low on its side); a lower tip in front of the pavilion and a
// lower one still at its corner, at uneven heights and spacing; flat stones at the water whose straight lips hang over a
// dark hollow; a low, wide cave mouth at the waterline under the main mass. Where one stone sits on or behind another
// the line between them is left out. All in sheet units.
const ROCKERY_BACK: LakeStone[] = [
  // The main mass, its lower stone, down to the water, with the cave.
  {
    knots: [[1518, 856, 0.04], [1516, 838, 0.1], [1521, 820, 0.04], [1529, 806, 0.16], [1545, 798, 0.03], [1562, 800, -0.12], [1578, 795, 0.18], [1596, 798, 0.04], [1607, 810, 0.1], [1609, 856, 0]],
    holes: [{ x: 1598, y: 822, rx: 3.6, ry: 2.6, tilt: -8, through: false, form: 'kidney', toward: 90 }],
    // Low and wide, higher at the left: a mouth the water has eaten in under the stone.
    cave: [1535, 857, 1539, 852, 1547, 848, 1558, 847, 1569, 848, 1578, 851, 1583, 857],
    contours: [[1607, 810, 1597, 815, 1590, 822, 1587, 831], [1521, 820, 1530, 824, 1538, 831], [1562, 800, 1566, 810, 1572, 816]],
    grooves: [[1552, 808, 1550, 820, 1553, 832], [1576, 818, 1577, 830]],
    hatches: [[1524, 836, 1522, 842, 1524, 848]],
    rings: [[1594, 838, 0.7]],
    rims: [[0, 3, 4]],
    moss: [1531, 805.5],
    seams: [9],
    lost: [6, 7],
    tone: 0.3,
  },
  // Its upper stone, the high point: two unequal swellings at its crown with a notch between them, the right one
  // curling over; narrow at its waist; a hole through it low on its right side, where no face can be made of it.
  {
    knots: [[1534, 790, 0.1], [1535, 772, 0.06], [1540, 760, 0.14], [1552, 754, 0.14], [1567, 750, 0.16], [1580, 738, 0.1], [1596, 740, 0.08], [1603, 752, -0.06], [1598, 762, 0.14], [1594, 770, -0.06], [1588, 782, 0.1], [1584, 801, 0.1], [1548, 802, -0.1]],
    holes: [{ x: 1574, y: 790, rx: 4.4, ry: 4.6, tilt: 10, through: true, form: 'oval', toward: 120 }],
    contours: [[1567, 750, 1569, 757, 1575, 763, 1586, 767], [1540, 760, 1548, 766, 1551, 777]],
    grooves: [[1546, 774, 1544, 786], [1560, 764, 1561, 778]],
    hatches: [[1538, 778, 1536, 784, 1538, 790]],
    rims: [[12, 2, 4], [8, 10, 3]],
    rings: [[1588, 750, 0.7]],
    // The dark joint where it sits on the lower stone.
    shadows: [[1546, 801, 1566, 806, 1586, 800, 1590, 804, 1568, 811, 1544, 806]],
    moss: [1567, 749.5],
    seams: [11],
    lost: [4, 5],
    tone: 0.6,
  },
]

const ROCKERY_FRONT: LakeStone[] = [
  // Under the pavilion's corner, beside the steps: the lowest tip, two unequal swellings with a crease between them, the
  // right one higher; a small slot of a hole low on its right, off the middle.
  {
    knots: [[1427, 846, 0.04], [1428, 835, 0.1], [1432, 824, 0.16], [1442, 826.5, -0.2], [1447, 816, 0.12], [1458, 812.5, 0.16], [1467, 817, 0.04], [1471, 825, -0.12], [1476, 832, 0.1], [1477, 846, 0]],
    holes: [
      { x: 1463, y: 828, rx: 2.7, ry: 4, tilt: 16, through: false, form: 'tear', toward: 100 },
      { x: 1436, y: 836, rx: 1.5, ry: 1.2, tilt: 0, through: false, form: 'oval', toward: 90 },
    ],
    contours: [[1442, 826.5, 1445, 832, 1444, 839]],
    hatches: [[1431, 834, 1430, 839, 1432, 844]],
    rings: [[1452, 826, 0.55]],
    rims: [[0, 2, 3]],
    moss: [1443, 826],
    seams: [9],
    lost: [4],
    tone: 0.5,
  },
  // In front of the pavilion, under its right-hand column: the second tip, upright, its crown broken by a notch, bays
  // eaten into both sides, and a small hole through it low on the right.
  {
    knots: [
      [1472, 846, 0.04], [1474, 831, 0.1], [1480, 820, -0.12], [1479, 810, 0.14], [1488, 802, 0.08], [1497, 804, -0.16], [1504, 797, 0.14],
      [1515, 800, 0.1], [1521, 810, -0.06], [1524, 820, 0.12], [1518, 828, -0.16], [1522, 838, 0.08], [1523, 846, 0],
    ],
    holes: [
      { x: 1511, y: 823, rx: 2.9, ry: 4.2, tilt: -14, through: true, form: 'kidney', toward: 110 },
      { x: 1487, y: 817, rx: 1.5, ry: 1.9, tilt: 0, through: false, form: 'oval', toward: 90 },
      { x: 1500, y: 836, rx: 1.3, ry: 1.1, tilt: 0, through: false, form: 'oval', toward: 90 },
    ],
    contours: [[1497, 804, 1496, 812, 1499, 821], [1518, 828, 1512, 833, 1508, 841]],
    grooves: [[1488, 826, 1487, 837]],
    rings: [[1506, 810, 0.55]],
    rims: [[0, 3, 3]],
    moss: [1497, 803.5],
    seams: [12],
    lost: [6],
    tone: 0.6,
  },
  // The flat stone the bridge and the steps come down onto: thin, its back edge lost under the steps, its front an
  // uneven lip over a dark hollow, a few short grooves down its face.
  {
    knots: [[1371, 847, 0.06], [1373, 840, -0.1], [1379, 834, 0.1], [1391, 831, 0.01], [1408, 830.5, -0.01], [1424, 832, 0.05], [1431, 838, -0.12], [1427, 845, 0.08], [1414, 849, -0.05], [1396, 848, 0.04], [1380, 850, 0.03]],
    holes: [],
    lip: [1377, 839, 1392, 837.5, 1406, 839, 1420, 838, 1430, 840.5],
    grooves: [[1390, 841, 1389, 846], [1416, 842, 1417, 847]],
    under: [1376, 848, 1396, 847, 1414, 848, 1428, 844, 1432, 850, 1412, 856, 1384, 856],
    seams: [3],
    lost: [2, 4],
    tone: 0.5,
  },
  // The long flat stone along the water in front of the two tips: thicker at its right end, its back edge not drawn so
  // the tips go down into it, its front an uneven lip over a dark hollow with a few short grooves down the face.
  {
    knots: [
      [1441, 851, 0.08], [1446, 844, 0.04], [1466, 840, 0.01], [1490, 840.5, -0.02], [1512, 838.5, 0.02], [1530, 840, 0.06],
      [1538, 845, -0.12], [1535, 850, 0.06], [1520, 853, -0.06], [1500, 852, 0.04], [1478, 854, -0.04], [1456, 853, 0.05],
    ],
    holes: [{ x: 1470, y: 849, rx: 1.5, ry: 1.2, tilt: 0, through: false, form: 'oval', toward: 90 }],
    lip: [1444, 845, 1458, 843.5, 1472, 844.5, 1486, 842.5, 1500, 844, 1516, 843, 1535, 844],
    grooves: [[1462, 846.5, 1461, 851], [1494, 846, 1495, 851.5], [1521, 845.5, 1520, 850.5]],
    under: [1446, 853.5, 1478, 855, 1500, 853, 1528, 852.5, 1538, 856, 1500, 860, 1452, 859],
    moss: [1466, 841.5],
    seams: [2, 3],
    lost: [1, 4],
    tone: 0.5,
  },
]

function rockery(stock: Stock, stones: LakeStone[], prefix: string): Built {
  const built = stones.map((stone, index) => lakeStone(stock, `${prefix}${index}`, stone, (x, y) => pt(x, y), 1, 'url(#rs)', 'url(#ru)', 0.85))
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
  return drawn(d, stock, 0.8, 0.62)
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
  let stalk = ''
  // The stalk leaves the underside at the hub and bows a little on its way down to the water.
  if (raised) stalk = drawn(`M${at(hub)}C${round(hub.x - bow * 0.3)} ${round(hub.y + (water - hub.y) * 0.4)} ${round(hub.x + bow * 0.75)} ${round(hub.y + (water - hub.y) * 0.65)} ${round(hub.x + bow)} ${round(water)}`, stock, 1.1, 0.62)
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
    lip = `<path d="${fold}" fill="${mixed(skyAt(stock.sky, cx, cy), stock.ink, tone * 0.3 * stock.wash)}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${share(0.66 * stock.line)}"/>`
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
  /** The tile rows of face k: they run down the fall of the roof, and the corner ribs cut them off. */
  const tileRows = (k: number): string => {
    const seen = Math.max(0.2, Math.abs(Math.sin(normalAngle(k))))
    const spacing = Math.max(5.6, 3.1 / seen / size)
    const count = Math.floor((sideHalf * 2) / spacing)
    let d = ''
    for (let row = 0; row < count; row += 1) {
      const a = (row + 0.5 - count / 2) * spacing
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

  // The floor, and the far benches seen through the pavilion.
  out += washed(polyline(faces.map(k => polar(cornerAngle(k), PLINTH, FLOOR)), true), stock, 0.09)
  const railEnd = (k: number, end: number): Point => onFace(k, end * (columnSideHalf + (hasBench(k + end) ? LEAN * tanHalf : 0)), columnApothem + LEAN, RAIL)
  let far = ''
  for (const k of backFaces) {
    if (!hasBench(k)) continue
    far += polyline([onFace(k, -columnSideHalf, columnApothem, RAIL), onFace(k, columnSideHalf, columnApothem, RAIL)]) + polyline([onFace(k, -columnSideHalf, columnApothem, SEAT), onFace(k, columnSideHalf, columnApothem, SEAT)])
  }
  out += drawn(far, stock, 0.9, 0.3)

  const column = (k: number): string => {
    const angle = cornerAngle(k)
    const isFar = Math.sin(angle) < -0.3
    const foot = polar(angle, COLUMN, FLOOR)
    const head = polar(angle, COLUMN, LINTEL)
    const halfWidth = size * (isFar ? 1.8 : 2.4)
    const shaft = `M${round(foot.x - halfWidth)} ${round(foot.y)}L${round(head.x - halfWidth)} ${round(head.y)}L${round(head.x + halfWidth)} ${round(head.y)}L${round(foot.x + halfWidth)} ${round(foot.y)}Z`
    const base = `M${round(foot.x - halfWidth - 1.6)} ${round(foot.y + 1)}h${round(halfWidth * 2 + 3.2)}v${round(-3.2 * size)}h${round(-halfWidth * 2 - 3.2)}Z`
    return inked(shaft, stock, isFar ? 0.42 : 0.84) + inked(base, stock, isFar ? 0.36 : 0.7)
  }
  const byDepth = faces.slice().sort((a, b) => Math.sin(cornerAngle(a)) - Math.sin(cornerAngle(b)))
  for (const k of byDepth) if (Math.sin(cornerAngle(k)) < -0.3) out += column(k)

  // The low whitewashed sill wall under the bench, on the two faces that look over the water.
  const benchFaces = frontFaces.filter(k => hasBench(k))
  let panels = ''
  for (const k of benchFaces) {
    panels += polyline([onFace(k, -columnSideHalf, columnApothem, FLOOR), onFace(k, columnSideHalf, columnApothem, FLOOR), onFace(k, columnSideHalf, columnApothem, SEAT), onFace(k, -columnSideHalf, columnApothem, SEAT)], true)
  }
  out += skyPainted(panels, stock.sky) + `<path d="${panels}" fill="${stock.wall}" fill-opacity="${stock.wallAlpha}"/>` + drawn(panels, stock, 0.8, 0.5)
  for (const k of byDepth) if (Math.sin(cornerAngle(k)) >= -0.3) out += column(k)

  // The stone plinth: three faces toward us, the darker the more they turn from the light. Its foot goes down among the rocks.
  let plinthLines = ''
  let masonry = ''
  for (const k of frontFaces) {
    const a = polar(cornerAngle(k), PLINTH, FLOOR)
    const b = polar(cornerAngle(k + 1), PLINTH, FLOOR)
    const c = polar(cornerAngle(k + 1), PLINTH, GROUND)
    const d = polar(cornerAngle(k), PLINTH, GROUND)
    out += washed(polyline([a, b, c, d], true), stock, 0.1 + 0.16 * shade(k))
    plinthLines += polyline([d, a, b, c]) + polyline([polar(cornerAngle(k), PLINTH, FLOOR - 4.5), polar(cornerAngle(k + 1), PLINTH, FLOOR - 4.5)])
    const course = FLOOR - 15
    const side = PLINTH * Math.sin(half)
    masonry += polyline([onFace(k, -side, plinthApothem, course), onFace(k, side, plinthApothem, course)])
    for (const at of [0.22 + 0.12 * hashUnit(k, 91), 0.62 + 0.12 * hashUnit(k, 93)]) masonry += polyline([onFace(k, side * (2 * at - 1), plinthApothem, FLOOR - 4.5), onFace(k, side * (2 * at - 1), plinthApothem, course)])
    const low = side * (0.7 * hashUnit(k, 95) - 0.35)
    masonry += polyline([onFace(k, low, plinthApothem, course), onFace(k, low, plinthApothem, GROUND)])
  }
  out += drawn(plinthLines, stock, 0.9, 0.68) + drawn(masonry, stock, 0.6, 0.34)
  // Three stone steps down from the open face to the slab the bridge lands on, as wide as the opening: the risers washed,
  // each nosing drawn as a firm line, and the stepped cheek on the near side.
  {
    const p = plinthApothem
    const half = 21
    const levels = [FLOOR, FLOOR - 9.3, FLOOR - 18.6, GROUND]
    let risers = ''
    let nosings = ''
    const profile: Point[] = []
    for (let index = 1; index <= 2; index += 1) {
      const b = p + 10 * index
      const from = levels[index] ?? 0
      const to = levels[index + 1] ?? 0
      risers += polyline([onFace(ENTRY, -half, b, from), onFace(ENTRY, half, b, from), onFace(ENTRY, half, b, to), onFace(ENTRY, -half, b, to)], true)
      nosings += polyline([onFace(ENTRY, -half, b, from), onFace(ENTRY, half, b, from)]) + polyline([onFace(ENTRY, half, b - 10, from), onFace(ENTRY, half, b, from), onFace(ENTRY, half, b, to)])
      profile.push(onFace(ENTRY, -half, b - 10, from), onFace(ENTRY, -half, b, from))
    }
    profile.push(onFace(ENTRY, -half, p + 20, GROUND), onFace(ENTRY, -half, p, GROUND))
    nosings += polyline([onFace(ENTRY, -half, p, levels[1] ?? 0), onFace(ENTRY, half, p, levels[1] ?? 0)])
    const cheek = polyline(profile, true)
    const centre = onFace(ENTRY, 0, p + 14, levels[2] ?? 0)
    out += blank(risers + cheek, skyAt(stock.sky, centre.x, centre.y)) + washed(risers, stock, 0.08) + washed(cheek, stock, 0.26) + drawn(cheek, stock, 0.7, 0.5) + drawn(nosings, stock, 1.1, 0.62)
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
  out += drawn(seats, stock, round(2.2 * size), 0.74) + drawn(slats, stock, 0.8, 0.68) + drawn(rails, stock, 1.5, 0.88)

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
  out += washed(beams, stock, 0.36) + drawn(fret, stock, 0.75, 0.72)

  // The shade under the roof.
  {
    const left = polar(cornerAngle(3), COLUMN, 0).x
    const right = polar(cornerAngle(0), COLUMN, 0).x
    const top = cy - 2 * size
    const bottom = cy + 40 * size
    defs +=
      `<linearGradient id="pu" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(bottom)}">` +
      `<stop offset="0" stop-color="${stock.ink}" stop-opacity="${share(0.3 * stock.wash)}"/><stop offset="0.5" stop-color="${stock.ink}" stop-opacity="${share(0.12 * stock.wash)}"/>` +
      `<stop offset="1" stop-color="${stock.ink}" stop-opacity="0"/></linearGradient>`
    out += `<path d="M${round(left)} ${round(top)}H${round(right)}V${round(bottom)}H${round(left)}Z" fill="url(#pu)"/>`
  }
  // The underside of the eaves, where a lifted corner lets the eye in under the roof.
  let soffits = ''
  for (const k of frontFaces) soffits += polyline(eaveOf(k, 2).concat([polar(cornerAngle(k + 1), COLUMN, LINTEL + 2), polar(cornerAngle(k), COLUMN, LINTEL + 2)]), true)
  out += washed(soffits, stock, 0.5)

  // The roof. The far faces first: only their flying corners show above the near ones.
  out += washed(backFaces.map(k => faceOf(k)).join(''), stock, 0.26) + drawn(backFaces.map(k => polyline(eaveOf(k))).join(''), stock, 0.8, 0.5)
  for (const k of faces) if (!isFront(k) && !isFront(k - 1)) out += inked(hipRidge(k), stock, 0.74)
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
  for (const k of faces) if (isFront(k) || isFront(k - 1)) out += inked(hipRidge(k), stock, 0.86)

  // The finial: a collar and a gourd with a point.
  {
    const apex = proj(0, RISE, 0)
    const profile: Array<[number, number]> = [[7.5, -4], [6.4, 2], [4.2, 5], [3.5, 7.2], [6.2, 11], [6.8, 15], [5.2, 19.5], [2.6, 21.6], [4.1, 24.6], [4.2, 27.6], [2.4, 30.6], [0.9, 33], [0.5, 40], [0, 44]]
    const right = profile.map(([r, h]) => pt(apex.x + r * size, apex.y - h * size))
    const left = profile.slice(0, -1).reverse().map(([r, h]) => pt(apex.x - r * size, apex.y - h * size))
    out += inked(polyline(right.concat(left), true), stock, 0.88)
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
  const defs =
    `<linearGradient id="bf" gradientUnits="userSpaceOnUse" x1="1226" y1="0" x2="1262" y2="0">` +
    `<stop offset="0" stop-color="${stock.ink}" stop-opacity="0"/><stop offset="1" stop-color="${stock.ink}"/></linearGradient>`
  const markup =
    `<path d="${railOf(far)}" stroke="${paint}" stroke-width="0.85" stroke-opacity="${share(0.4 * stock.line)}"/>` +
    `<path d="${deck}" fill="${paint}" fill-opacity="${share(0.09 * stock.wash)}"/>` +
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
  const boughs = inked(taper(boughA, along => 5.4 - 4.4 * Math.pow(along, 0.8)), stock, 0.8) + inked(taper(boughB, along => 3.6 - 2.8 * along), stock, 0.66)
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
      const half = reach * 0.1
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
    const markup =
      `<g class="sway" style="transform-origin:${round(strand.start.x)}px ${round(strand.start.y)}px;--a:${swing}deg;animation-delay:-${delay}s">` +
      drawn(smoothPath(stem), stock, 0.7, strength) +
      `<path d="${leaves}" fill="${stock.ink}" fill-opacity="${share(strength * stock.line)}"/>` +
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
  /** A lens of bare sky: it lets a thing sink into the water or the mist. It does not move. */
  const mist = (cx: number, cy: number, rx: number, ry: number, strength: number): string => {
    const id = `m${mists.length}`
    const colour = skyAt(sky, cx, cy)
    mists.push(
      `<radialGradient id="${id}"><stop offset="0" stop-color="${colour}" stop-opacity="${share(strength)}"/><stop offset="0.5" stop-color="${colour}" stop-opacity="${share(strength * 0.72)}"/>` +
        `<stop offset="0.82" stop-color="${colour}" stop-opacity="${share(strength * 0.22)}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>`,
    )
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`
  }
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
  const shimmer = (x1: number, x2: number, y: number, strength: number, index: number, width = 1.2): string =>
    `<path class="shim" d="${stroke(x1, x2, y)}" stroke-width="${width}" stroke-opacity="${share(strength * stock.line)}" style="animation-duration:${round(6 + hashUnit(index, 41) * 5)}s;animation-delay:-${round(hashUnit(index, 43) * 8)}s"/>`
  /** The same stroke held still: the water next to the prompt box does not move. */
  const still = (x1: number, x2: number, y: number, strength: number, width = 1.2): string =>
    `<path d="${stroke(x1, x2, y)}" stroke-width="${width}" stroke-opacity="${share(strength * 0.8 * stock.line)}"/>`

  const WATER = 856
  const tree = willow(stock)
  const span = bridge(stock, 824)
  const house = pavilion(stock, 1462, 687, 1)
  const stone = pondPeak(stock, 300, 884, 0.9)
  const back = rockery(stock, ROCKERY_BACK, 'kb')
  const front = rockery(stock, ROCKERY_FRONT, 'kf')

  const disc =
    (stock.halo > 0 ? `<circle cx="1440" cy="222" r="78" fill="url(#halo)"/>` : '') + `<circle cx="1440" cy="222" r="22" fill="${stock.disc}" fill-opacity="0.9"/>`

  const reflections =
    `<g stroke="${ink}">` +
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

  const pondLeft = `<g stroke="${ink}" stroke-width="1.2">` + shimmer(244, 290, 922, 0.34, 11) + shimmer(300, 362, 926, 0.3, 12) + '</g>'

  // The rings keep clear of the prompt box: their motion stays more than fifty units from either end of it.
  const rings =
    `<g stroke="${ink}" stroke-width="1.1" stroke-opacity="${share(0.6 * stock.line)}">` + ripple(1532, WATER + 38, 26, 13, 0) + ripple(348, 936, 22, 15, 4) + '</g>'

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
${span.markup}${mist(1234, 812, 24, 18, 0.7)}
${back.markup}
${house.markup}
${front.markup}${tuft(stock, 1476, 827, 10, 67)}
${mist(1490, WATER + 8, 130, 10, 0.8)}
${reflections}
${stone.markup}
${lotusLeaf(stock, 242, 842, 31, 14, -0.32, 3, 0.18, 905, -1, -8)}${lotusLeaf(stock, 352, 830, 27, 12, 0.36, 5, 0.18, 903, 1, 20)}${lotusScroll(stock, 222, 832, 24, -1.05, 906)}
${lotusBud(stock, 372, 798, 1, 364, 902)}${mist(300, 906, 96, 7, 0.75)}
${drawn('M376 899q7 -1.3 14 0t14 0', stock, 0.9, 0.5)}${lotusLeaf(stock, 272, 903, 27, 9.5, -0.05, 7, 0.21, 0, 1)}${lotusLeaf(stock, 330, 907, 25, 8.5, 0.08, 11, 0.19, 0, -1)}
${pondLeft}
${rings}
${seal(212, 914, stock)}`

  const defs =
    skyDefs(sky) +
    mists.join('') +
    `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.disc}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.disc}" stop-opacity="0"/></radialGradient>` +
    // The rockery's lines fade into the water; the hollows under its lips are darkest at the stone and gone in the water.
    `<linearGradient id="rs" gradientUnits="userSpaceOnUse" x1="0" y1="840" x2="0" y2="860"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="rc" gradientUnits="userSpaceOnUse" x1="0" y1="847" x2="0" y2="859"><stop offset="0" stop-color="${stock.shade}" stop-opacity="${share(0.72 * stock.shadeAlpha)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="${share(0.12 * stock.shadeAlpha)}"/></linearGradient>` +
    `<linearGradient id="ru" gradientUnits="userSpaceOnUse" x1="0" y1="842" x2="0" y2="860"><stop offset="0" stop-color="${stock.shade}" stop-opacity="${share(0.5 * stock.shadeAlpha)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="0"/></linearGradient>` +
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
export function sceneSvg(stock: 'dayInk' | 'nightInk' | 'day' | 'night' | 'nightWine'): string {
  return gardenSheet(
    stock === 'dayInk' ? STOCKS.dayInk : stock === 'nightInk' ? STOCKS.nightInk : stock === 'day' ? STOCKS.day : stock === 'night' ? STOCKS.nightBlue : STOCKS.night,
  )
}

/** On the pale ink sheet, in dark ink, for a light window. */
export function daySvg(): string {
  return sceneSvg('dayInk')
}

/** On the charcoal ink sheet, in pale ink, for a dark window. */
export function nightSvg(): string {
  return sceneSvg('nightInk')
}
