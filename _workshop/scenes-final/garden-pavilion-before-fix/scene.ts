// Pavilion by the Water (水亭曲桥): a Suzhou garden sheet, sibling of Ink Mountains.
// Lower right: a six-sided garden pavilion with the steep, flying eave corners of Jiangnan, a tiled tent roof with a
// gourd finial, slender columns, a hanging fretwork frieze under the lintel and a "beauty's rest" bench leaning out
// over the pond. It stands on a stone plinth among bedded, water-worn rocks; a zigzag bridge of stone slabs with low rails
// comes to it out of the mist and lands at three steps.
// Top right: willow strands hang in across an orange disc. Left band: a Taihu rock, lean and full of holes, rising from lotus leaves.
// The water is only suggested: a few level strokes under the pavilion and slow ripple rings.
// Motion: the willow strands sway, the ripple rings widen and fade, the reflection strokes shimmer; nothing else.
// The ground is the dusk sky of Ink Mountains (orange, wine, violet). Pure string building, no imports, the same string on every call.

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
  /** How much ink a wash takes, relative to the day sheet. */
  wash: number
  /** The same for pen lines. */
  line: number
  /** Strength of the glow round the disc; 0 leaves it out. */
  halo: number
}

const STOCKS: { day: Stock; night: Stock; nightBlue: Stock } = {
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
    ink: '#2b2338', disc: '#ee6a2c', seal: '#c2422b', wall: '#ffffff', wallAlpha: 0.5, bloom: '#e0607c', wash: 1, line: 1, halo: 0,
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
    ink: '#e4d4d8', disc: '#f79a4b', seal: '#b4472e', wall: '#e4d4d8', wallAlpha: 0.2, bloom: '#f08aa0', wash: 0.5, line: 0.8, halo: 0.14,
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
    ink: '#dcd6e8', disc: '#f79a4b', seal: '#b4472e', wall: '#dcd6e8', wallAlpha: 0.2, bloom: '#f08aa0', wash: 0.5, line: 0.8, halo: 0.14,
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
// Rocks. A lake stone's outline is scalloped: hollows scooped by water meet in sharp edges. So an outline is a ring of
// knots, and each edge between two knots is an arc that bulges out (positive) or is scooped in (negative).

type Knot = [number, number, number]

interface StoneShape {
  w: number
  h: number
  knots: Knot[]
  /** Holes: x, y, half width, half height in the shape's own units, and a turn in degrees. */
  holes: number[][]
}

interface StoneLines {
  outline: string
  /** The heavier line on the side turned from the light. */
  accent: string
  /** Wrinkles: a second line inside a swelling, and creases that run in from each sharp edge. */
  inner: string
  dots: string
}

/** The lines of one stone. `grain` is the size of its smallest feature, in sheet units; `swell` tempers how far its
 * swellings round out (below 1 the stone is flatter-faced and harder-edged: stone, not dough), and `scoop` how deep its
 * hollows cut (below 1 the lumps run together into one long water-worn edge instead of a row of separate humps). */
function stoneLines(points: Point[], bulges: number[], seed: number, grain: number, swell = 1, scoop = 1, cushions = true): StoneLines {
  const count = points.length
  let area = 0
  let top = Infinity
  let bottom = -Infinity
  for (let index = 0; index < count; index += 1) {
    const a = points[index]
    const b = points[(index + 1) % count]
    if (!a || !b) continue
    area += a.x * b.y - b.x * a.y
    top = Math.min(top, a.y)
    bottom = Math.max(bottom, a.y)
  }
  const turn = area > 0 ? 1 : -1
  const normals: Point[] = []
  const first = points[0]
  let outline = first ? `M${at(first)}` : ''
  let accent = ''
  let inner = ''
  let dots = ''
  for (let index = 0; index < count; index += 1) {
    const a = points[index]
    const b = points[(index + 1) % count]
    if (!a || !b) continue
    const dx = b.x - a.x
    const dy = b.y - a.y
    const length = Math.hypot(dx, dy) || 1
    const normal = pt((dy * turn) / length, (-dx * turn) / length)
    normals.push(normal)
    const given = bulges[index] ?? 0
    const bulge = given > 0 ? given * swell : given * scoop
    const control = pt((a.x + b.x) / 2 + normal.x * length * bulge, (a.y + b.y) / 2 + normal.y * length * bulge)
    outline += `Q${at(control)} ${at(b)}`
    // The light comes from the upper right.
    const facing = normal.x * 0.6 - normal.y * 0.8
    if (given >= 0.1 && facing < -0.25 && length > grain) accent += `M${at(a)}Q${at(control)} ${at(b)}`
    if (cushions && given > 0.15 && facing < 0.25 && length > grain * 1.7 && hashUnit(index, seed + 3) > 0.3) {
      const depth = grain * (0.55 + 0.3 * hashUnit(index, seed + 4))
      const sink = depth + length * bulge * 0.5
      inner +=
        `M${round(a.x - normal.x * depth + dx * 0.2)} ${round(a.y - normal.y * depth + dy * 0.2)}` +
        `Q${round(control.x - normal.x * sink)} ${round(control.y - normal.y * sink)} ${round(b.x - normal.x * depth - dx * 0.2)} ${round(b.y - normal.y * depth - dy * 0.2)}`
      if (length > grain * 2.6 && facing < 0) {
        const deep = depth * 2.1
        inner +=
          `M${round(a.x - normal.x * deep + dx * 0.34)} ${round(a.y - normal.y * deep + dy * 0.34)}` +
          `Q${round(control.x - normal.x * (deep + length * bulge * 0.7))} ${round(control.y - normal.y * (deep + length * bulge * 0.7))} ${round(b.x - normal.x * deep - dx * 0.3)} ${round(b.y - normal.y * deep - dy * 0.3)}`
      }
    }
  }
  outline += 'Z'
  for (let index = 0; index < count; index += 1) {
    const here = points[index]
    const before = (index + count - 1) % count
    const nIn = normals[before]
    const nOut = normals[index]
    if (!here || !nIn || !nOut) continue
    if (!((bulges[index] ?? 0) < 0 || (bulges[before] ?? 0) < 0)) continue
    if (here.y > bottom - (bottom - top) * 0.2) continue
    let inX = -(nIn.x + nOut.x)
    let inY = -(nIn.y + nOut.y)
    const size = Math.hypot(inX, inY) || 1
    inX /= size
    inY /= size
    const reach = grain * (1.5 + 1.8 * hashUnit(index, seed + 5))
    inner += `M${at(here)}Q${round(here.x + inX * reach * 0.75)} ${round(here.y + inY * reach * 0.6 + reach * 0.2)} ${round(here.x + inX * reach * 0.8)} ${round(here.y + inY * reach * 0.5 + reach * 0.75)}`
    if (hashUnit(index, seed + 6) > 0.68) dots += `M${round(here.x + inX * 3)} ${round(here.y + inY * 3)}h0.1`
  }
  return { outline, accent, inner, dots }
}

/** A point on the rim of an irregular hole; `tilt` turns the whole hole. */
function blobAt(cx: number, cy: number, rx: number, ry: number, seed: number, angle: number, tilt = 0): Point {
  const reach = 1 + 0.27 * Math.sin(2 * angle + seed) + 0.18 * Math.sin(3 * angle + seed * 2.3) + 0.07 * Math.sin(5 * angle + seed * 1.3)
  const x = Math.cos(angle) * rx * reach
  const y = Math.sin(angle) * ry * reach
  return pt(cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt))
}

function blob(cx: number, cy: number, rx: number, ry: number, seed: number, tilt = 0): string {
  const points: Point[] = []
  for (let index = 0; index < 9; index += 1) points.push(blobAt(cx, cy, rx, ry, seed, (index * 40 * Math.PI) / 180, tilt))
  return smoothRing(points)
}

/** A stretch of such a rim, between two compass angles on the sheet (0 right, 90 down, 180 left, 270 up). */
function blobArc(cx: number, cy: number, rx: number, ry: number, seed: number, from: number, to: number, tilt = 0): string {
  const points: Point[] = []
  for (let index = 0; index <= 6; index += 1) points.push(blobAt(cx, cy, rx, ry, seed, ((from + ((to - from) * index) / 6) * Math.PI) / 180 - tilt, tilt))
  return smoothPath(points)
}

interface StoneHoles {
  /** The openings themselves. */
  openings: string
  /** Each opening inside its wider mouth: filled with the even-odd rule this is the hole's inner wall, in shadow. */
  walls: string
  /** The mouth's upper edge. */
  mouths: string
}

function stoneHoles(shape: StoneShape, place: (x: number, y: number) => Point, scale: number, seed: number): StoneHoles {
  let openings = ''
  let walls = ''
  let mouths = ''
  shape.holes.forEach((hole, index) => {
    const centre = place(hole[0] ?? 0, hole[1] ?? 0)
    const rx = (hole[2] ?? 1) * scale
    const ry = (hole[3] ?? 1) * scale
    const tilt = ((hole[4] ?? 0) * Math.PI) / 180
    const opening = blob(centre.x, centre.y, rx, ry, seed + index * 1.7, tilt)
    openings += opening
    if (Math.min(rx, ry) < 3.2 || hashUnit(index, seed + 9) < 0.3) return
    // The mouth is wider than the opening and lies to one side of it, mostly up and to the left: the eye looks into the hole
    // past its lit lip. Each hole turns its mouth a little differently and opens it by a different amount.
    const toward = 195 + 90 * hashUnit(index, seed + 11)
    const shift = Math.min(rx, ry) * (0.18 + 0.16 * hashUnit(index, seed + 12))
    const wide = 1.16 + 0.016 * Math.min(rx, ry) + 0.1 * hashUnit(index, seed + 13)
    const mx = centre.x + Math.cos((toward * Math.PI) / 180) * shift
    const my = centre.y + Math.sin((toward * Math.PI) / 180) * shift
    walls += blob(mx, my, rx * wide, ry * wide, seed + index * 1.7, tilt) + opening
    mouths += blobArc(mx, my, rx * wide, ry * wide, seed + index * 1.7, toward - 80, toward + 85, tilt)
  })
  return { openings, walls, mouths }
}

// The rockery under the pavilion, drawn as a painter draws stone: a stone shows three faces (石分三面), a lit top, a
// front, and a side turned from the light. Its outline is a few long, nearly level runs that meet in sharp turns (not a
// row of humps), and the water has eaten in under the front lips, so a dark hollow runs along the waterline.
// Each stone is given on the sheet: its outline knots [x, y, bulge] clockwise from the lower left, the front edge of its
// top (`fold`), its shaded side as a polygon with the turning edge, the hollow at the waterline, grooves, and holes
// (x, y, half width, half height, turn; the first goes through when `pierced`).
interface Slab {
  knots: Knot[]
  fold: number[]
  side?: number[]
  turn?: number[]
  hollow?: number[]
  grooves?: number[][]
  holes?: number[][]
  pierced?: boolean
  tone: number
  seed: number
}

function pairs(values: number[]): Point[] {
  const points: Point[] = []
  for (let index = 0; index + 1 < values.length; index += 2) points.push(pt(values[index] ?? 0, values[index + 1] ?? 0))
  return points
}

/** The highest and lowest y of a closed outline at x, its knots taken as straight edges. */
function spanAt(points: Point[], x: number): [number, number] {
  let top = Infinity
  let bottom = -Infinity
  points.forEach((a, index) => {
    const b = points[(index + 1) % points.length]
    if (!b || a.x === b.x || (a.x - x) * (b.x - x) > 0) return
    const y = a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x)
    top = Math.min(top, y)
    bottom = Math.max(bottom, y)
  })
  return [top, bottom]
}

/** One stone of the rockery. Its fill is the sky there under a wash that deepens toward the waterline and then gives way to
 * the sky itself, so the stone hides what is behind it and still sinks into the water; its lines fade there too. Over it:
 * the shaded side, the front edge of its top with a few slanting cracks hanging from it, the hollow under its lip, moss dots. */
function slab(stock: Stock, stone: Slab): Built {
  const points = stone.knots.map(knot => pt(knot[0], knot[1]))
  const lines = stoneLines(points, stone.knots.map(knot => knot[2]), stone.seed, 5, 1, 1, false)
  let cx = 0
  let top = Infinity
  let bottom = -Infinity
  for (const point of points) {
    cx += point.x / points.length
    top = Math.min(top, point.y)
    bottom = Math.max(bottom, point.y)
  }
  let through = ''
  let blind = ''
  ;(stone.holes ?? []).forEach((hole, index) => {
    const d = blob(hole[0] ?? 0, hole[1] ?? 0, hole[2] ?? 2, hole[3] ?? 2, stone.seed + index * 1.7, ((hole[4] ?? 0) * Math.PI) / 180)
    if (index === 0 && stone.pierced) through += d
    else blind += d
  })
  const fold = pairs(stone.fold)
  let cracks = ''
  let count = 0
  fold.forEach((a, index) => {
    const b = fold[index + 1]
    if (!b) return
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    for (let u = 3 + 6 * hashUnit(index, stone.seed + 1); u < length - 2; u += 7 + 9 * hashUnit(count, stone.seed + 2)) {
      count += 1
      if (hashUnit(count, stone.seed + 3) < 0.5) continue
      const x = a.x + ((b.x - a.x) * u) / length
      const y = a.y + ((b.y - a.y) * u) / length
      const reach = Math.min(15, (Math.min(spanAt(points, x)[1], 850) - y) * (0.3 + 0.5 * hashUnit(count, stone.seed + 4)))
      if (reach < 4) continue
      // Cracks slant down to the left, away from the light, as an axe-cut stroke does.
      const lean = -(0.25 + 0.35 * hashUnit(count, stone.seed + 5)) * reach
      cracks += `M${round(x)} ${round(y + 1)}q${round(lean * 0.15)} ${round(reach * 0.6)} ${round(lean)} ${round(reach)}`
    }
  })
  let moss = ''
  const left = fold[0]?.x ?? cx
  const right = fold[fold.length - 1]?.x ?? cx
  for (let index = 0; index < 2; index += 1) {
    const x = left + (right - left) * (0.16 + 0.46 * index + 0.16 * hashUnit(index, stone.seed + 7))
    moss += `M${round(x)} ${round(spanAt(points, x)[0] + 1)}h${round(1.2 + hashUnit(index, stone.seed + 8))}`
  }
  const id = `b${stone.seed}`
  const shade = Math.max(0.6, (bottom - 13 - top) / (bottom - top))
  const defs =
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${bottom}">` +
    `<stop offset="0" stop-color="${mixed(skyAt(stock.sky, cx, top), stock.ink, stone.tone * stock.wash)}"/>` +
    `<stop offset="${round(shade * 100) / 100}" stop-color="${mixed(skyAt(stock.sky, cx, top + (bottom - top) * shade), stock.ink, stone.tone * 1.5 * stock.wash)}"/>` +
    `<stop offset="1" stop-color="${skyAt(stock.sky, cx, bottom)}"/></linearGradient>`
  const hollow = stone.hollow ? pairs(stone.hollow) : []
  const lip = hollow.slice(0, 3)
  const pen = (d: string, width: number, strength: number): string =>
    `<path d="${d}" stroke="url(#rs)" stroke-width="${width}" stroke-opacity="${share(strength * stock.line)}"/>`
  const markup =
    `<path d="${lines.outline}${through}" fill-rule="evenodd" fill="url(#${id})" stroke="url(#rs)" stroke-width="0.95" stroke-opacity="${share(0.76 * stock.line)}"/>` +
    (stone.side ? washed(polyline(pairs(stone.side), true), stock, 0.12) : '') +
    (hollow.length ? `<path d="${smoothPath(lip)}L${hollow.slice(3).map(at).join('L')}Z" fill="url(#rh)"/>` : '') +
    (blind ? washed(blind, stock, 0.26) : '') +
    pen(polyline(fold) + (stone.turn ? polyline(pairs(stone.turn)) : '') + (stone.grooves ?? []).map(groove => smoothPath(pairs(groove))).join('') + cracks + blind + lines.inner, 0.75, 0.48) +
    (lip.length ? pen(smoothPath(lip), 1.3, 0.42) : '') +
    (lines.accent ? pen(lines.accent, 1.6, 0.34) : '') +
    drawn(moss + lines.dots, stock, 2, 0.6)
  return { defs, markup }
}

// The tall stone behind the pavilion's right-hand bench: upright, pinched at the waist, its crown turned over to the right;
// one long slot through it, low on its lit side. Nothing dark near its crown: a dot there, or two holes side by side, reads as an eye.
const ROCKERY_BACK: Slab[] = [
  {
    knots: [[1530, 846, 0], [1528, 830, 0.08], [1532, 816, -0.18], [1526, 800, 0.1], [1529, 784, -0.2], [1524, 768, 0.12], [1532, 752, 0.08], [1544, 742, 0.05], [1560, 736, 0.06], [1576, 738, -0.1], [1585, 748, 0.1], [1580, 760, -0.14], [1574, 766, 0.06], [1578, 782, 0.12], [1572, 800, -0.15], [1576, 818, 0.1], [1584, 834, 0.05], [1586, 846, 0]],
    fold: [1532, 754, 1546, 746, 1562, 742, 1580, 746],
    turn: [1548, 746, 1552, 766, 1546, 788, 1552, 808, 1549, 830],
    side: [1532, 752, 1548, 746, 1552, 766, 1546, 788, 1552, 808, 1549, 846, 1530, 846, 1528, 830, 1532, 816, 1526, 800, 1529, 784, 1524, 768],
    grooves: [[1564, 752, 1568, 770, 1562, 786], [1556, 812, 1553, 826, 1556, 838]],
    holes: [[1565, 806, 3.2, 8.4, 12]],
    pierced: true,
    tone: 0.12,
    seed: 13,
  },
]

// The front of the rockery, back to front: the long bedded stone under the front bench, the corner stone, the slab the bridge
// lands on, and the stone under the steps. Each juts out over the water at its top and is eaten away below; their tops stand
// a little above the foot of the plinth, so it sits in them.
const ROCKERY_FRONT: Slab[] = [
  {
    knots: [[1466, 858, 0], [1463, 846, -0.15], [1457, 838, 0.05], [1462, 828, 0.03], [1478, 822, -0.04], [1494, 823, 0.03], [1506, 819, -0.05], [1520, 816, 0.03], [1532, 815, 0.06], [1538, 826, -0.1], [1534, 838, 0.05], [1538, 858, 0]],
    fold: [1460, 832, 1478, 826, 1494, 827, 1506, 823, 1520, 820, 1533, 819],
    hollow: [1462, 846, 1490, 843, 1534, 846, 1536, 858, 1462, 858],
    tone: 0.13,
    seed: 15,
  },
  {
    knots: [[1530, 858, 0], [1531, 846, -0.12], [1526, 836, 0.04], [1532, 826, 0.03], [1546, 819, -0.04], [1562, 818, 0.04], [1578, 814, 0.05], [1590, 822, 0.06], [1594, 834, -0.1], [1599, 846, 0.04], [1602, 858, 0]],
    fold: [1529, 830, 1546, 823, 1562, 822, 1578, 818, 1591, 826],
    turn: [1534, 828, 1534, 842, 1537, 856],
    side: [1532, 826, 1534, 828, 1534, 842, 1537, 858, 1530, 858, 1531, 846, 1526, 836],
    hollow: [1536, 850, 1562, 846, 1596, 849, 1598, 858, 1534, 858],
    tone: 0.15,
    seed: 21,
  },
  {
    knots: [[1388, 858, 0], [1386, 846, -0.15], [1379, 840, 0.04], [1381, 834, 0.03], [1396, 832, 0.02], [1412, 833, 0.03], [1421, 836, 0.05], [1419, 844, -0.12], [1416, 858, 0]],
    fold: [1381, 836, 1396, 835, 1412, 836, 1420, 838],
    hollow: [1384, 845, 1402, 843, 1419, 845, 1418, 858, 1386, 858],
    tone: 0.14,
    seed: 23,
  },
  {
    knots: [[1414, 860, 0], [1411, 848, -0.14], [1405, 840, 0.04], [1410, 830, 0.03], [1426, 825, -0.04], [1444, 826, 0.03], [1460, 822, 0.04], [1472, 828, 0.06], [1476, 838, -0.1], [1480, 848, 0.05], [1476, 860, 0]],
    fold: [1408, 834, 1426, 829, 1444, 830, 1460, 826, 1473, 832],
    turn: [1412, 833, 1414, 846, 1416, 858],
    side: [1410, 830, 1412, 833, 1414, 846, 1416, 860, 1414, 860, 1411, 848, 1405, 840],
    hollow: [1414, 851, 1444, 848, 1478, 851, 1478, 860, 1414, 860],
    tone: 0.16,
    seed: 19,
  },
]

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

// The Taihu rock: 瘦 lean, 皱 wrinkled, 漏 hollowed, 透 pierced. A peak stone, heavy at the top: a broad crown that
// overhangs on both sides (its right horn hooked over a deep cusp), a body that narrows into a thin waist, and a small foot.
// Long runs of its outline alternate with a few deep notches. Drawn in a box 100 wide and 240 tall, clockwise from its crown.
const TAIHU: StoneShape = {
  w: 100, h: 240,
  knots: [
    [34, 6, 0.18], [52, 0, 0.12], [66, 5, -0.28], [80, 2, 0.22], [96, 14, 0.18], [94, 28, -0.12], [82, 36, -0.38], [76, 48, 0.24], [86, 60, 0.2], [80, 74, -0.34],
    [76, 86, 0.14], [80, 100, 0.22], [84, 114, -0.26], [76, 128, 0.12], [72, 146, 0.18], [70, 164, -0.24], [66, 180, 0.14], [62, 198, 0.16], [60, 216, 0.12], [64, 232, 0.05],
    [60, 240, 0.05], [32, 240, 0.12], [29, 226, -0.2], [36, 212, 0.14], [30, 194, 0.22], [32, 176, -0.28], [24, 160, 0.18], [26, 142, 0.2], [16, 128, -0.3], [12, 112, 0.2],
    [20, 98, -0.24], [14, 86, 0.18], [8, 76, 0.24], [2, 58, 0.16], [10, 44, -0.32], [6, 30, 0.22], [18, 16, 0.16],
  ],
  holes: [[72, 22, 9, 6.5, -25], [24, 56, 6.5, 10, 20], [44, 106, 8, 11, 10], [56, 74, 5, 7.5, -15], [50, 150, 4, 7, -10], [48, 40, 4, 5, 0], [44, 188, 3.2, 5, 0], [62, 98, 2.6, 3.4, 0], [36, 26, 3, 3.6, 0], [48, 222, 2.4, 3.4, 0], [30, 140, 3.4, 5.2, 15], [66, 132, 2.8, 4, 0]],
}

/** Long wrinkles that run down the stone between its holes. */
const TAIHU_FLOWS: number[][] = [
  [40, 12, 36, 30, 38, 52, 34, 72, 36, 90],
  [62, 112, 58, 128, 56, 140],
  [40, 128, 38, 140, 40, 162, 38, 178],
  [54, 168, 52, 182, 56, 200, 52, 216],
  [84, 44, 80, 56, 82, 66],
  [12, 64, 16, 78],
]
/** Dimples: shallow hollows that do not go through. x, y, radius. */
const TAIHU_DIMPLES: Array<[number, number, number]> = [
  [60, 10, 3], [30, 40, 3], [66, 50, 3], [14, 70, 3], [34, 88, 3], [66, 122, 3], [32, 120, 3], [42, 164, 3], [56, 196, 2.6], [40, 206, 2.6], [56, 232, 2.4], [87, 22, 2.4],
]

function taihuRock(stock: Stock, footX: number, footY: number, size: number): Built {
  // The stone leans a little toward the open sheet and sways as it rises.
  const place = (x: number, y: number): Point => {
    const up = TAIHU.h - y
    return pt(footX + (x - 43 + up * 0.03 + 4 * Math.sin((y / TAIHU.h) * Math.PI * 1.6 + 0.4)) * size, footY - up * size)
  }
  const lines = stoneLines(TAIHU.knots.map(knot => place(knot[0], knot[1])), TAIHU.knots.map(knot => knot[2]), 7, 6.5 * size, 0.62)
  const holes = stoneHoles(TAIHU, place, size, 3)
  let dimples = ''
  TAIHU_DIMPLES.forEach((dimple, index) => {
    const centre = place(dimple[0], dimple[1])
    dimples += blobArc(centre.x, centre.y, dimple[2] * size, dimple[2] * size * 1.2, index * 2.1, 150 + 40 * hashUnit(index, 81), 330 + 40 * hashUnit(index, 83))
  })
  let flows = ''
  for (const flow of TAIHU_FLOWS) {
    const run: Point[] = []
    for (let index = 0; index + 1 < flow.length; index += 2) run.push(place(flow[index] ?? 0, flow[index + 1] ?? 0))
    flows += smoothPath(run.length === 3 ? spline(run, 2) : run)
  }
  const left = place(0, 110).x
  const right = place(100, 110).x
  const defs =
    `<path id="th" fill-rule="evenodd" d="${lines.outline}${holes.openings}"/>` +
    `<linearGradient id="tr" gradientUnits="userSpaceOnUse" x1="${round(left)}" y1="${round(footY)}" x2="${round(right)}" y2="${round(footY - 200 * size)}">` +
    `<stop offset="0" stop-color="${stock.ink}" stop-opacity="${share(0.3 * stock.wash)}"/><stop offset="0.42" stop-color="${stock.ink}" stop-opacity="${share(0.12 * stock.wash)}"/>` +
    `<stop offset="0.9" stop-color="${stock.ink}" stop-opacity="0"/></linearGradient>`
  const markup =
    skyPaintedShape('th', stock.sky) +
    `<use href="#th" fill="${stock.ink}" fill-opacity="${share(0.06 * stock.wash)}"/><use href="#th" fill="url(#tr)"/>` +
    washed(holes.walls, stock, 0.2, ' fill-rule="evenodd"') +
    drawn(flows, stock, 0.7, 0.3) +
    drawn(lines.inner + dimples, stock, 0.8, 0.44) +
    drawn(holes.mouths, stock, 0.75, 0.46) +
    drawn(lines.accent, stock, 1.9, 0.46) +
    // The outline and the rims of the openings in one line, drawn from the shape already kept in the defs.
    `<use href="#th" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${share(0.72 * stock.line)}"/>` +
    drawn(lines.dots, stock, 1.8, 0.55)
  return { defs, markup }
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
  const stone = taihuRock(stock, 298, 892, 0.88)
  const back = ROCKERY_BACK.map(part => slab(stock, part))
  const front = ROCKERY_FRONT.map(part => slab(stock, part))

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
${back.map(part => part.markup).join('')}
${house.markup}
${front.map(part => part.markup).join('')}${tuft(stock, 1503, 823, 11, 67)}
${mist(1466, WATER + 3, 150, 19, 0.92)}
${reflections}
${lotusLeaf(stock, 242, 842, 31, 14, -0.32, 3, 0.18, 905, -1, -8)}${lotusLeaf(stock, 352, 830, 27, 12, 0.36, 5, 0.18, 903, 1, 20)}${lotusScroll(stock, 222, 832, 24, -1.05, 906)}
${stone.markup}
${lotusBud(stock, 372, 798, 1, 364, 902)}${mist(302, 900, 92, 9, 0.88)}
${drawn('M280 894q9 -1.6 18 0t18 0', stock, 0.9, 0.5)}${lotusLeaf(stock, 272, 903, 27, 9.5, -0.05, 7, 0.21, 0, 1)}${lotusLeaf(stock, 330, 907, 25, 8.5, 0.08, 11, 0.19, 0, -1)}
${pondLeft}
${rings}
${seal(212, 914, stock)}`

  const defs =
    skyDefs(sky) +
    mists.join('') +
    `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.disc}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.disc}" stop-opacity="0"/></radialGradient>` +
    // The rockery's lines fade into the water, and so do the hollows under its lips.
    `<linearGradient id="rs" gradientUnits="userSpaceOnUse" x1="0" y1="834" x2="0" y2="857"><stop offset="0" stop-color="${ink}"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="rh" gradientUnits="userSpaceOnUse" x1="0" y1="843" x2="0" y2="858"><stop offset="0" stop-color="${ink}" stop-opacity="${share(0.36 * stock.wash)}"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></linearGradient>` +
    back.map(part => part.defs).join('') +
    front.map(part => part.defs).join('') +
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

/** The sheet on any of its three skies: the pale day, the blue night, the wine night. */
export function sceneSvg(stock: 'day' | 'night' | 'nightWine'): string {
  return gardenSheet(stock === 'day' ? STOCKS.day : stock === 'night' ? STOCKS.nightBlue : STOCKS.night)
}

/** Under the pale dusk sky, in dark ink, for a light window. */
export function daySvg(): string {
  return gardenSheet(STOCKS.day)
}

/** Under the blue night sky, in pale ink, for a dark window. */
export function nightSvg(): string {
  return gardenSheet(STOCKS.nightBlue)
}
