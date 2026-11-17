// Ink Mountains: a shan shui sheet. Layered ridges in ink wash rise from the two lower corners and sink into mist;
// the tall massif stands on the right, a low far shore on the left, and the middle of the sheet is left as empty paper.
// Every ridge is one wash that is dark at its summits and fades to bare paper at a level mist line, a fine crest line,
// one spur per summit with its shaded face, and a few hemp-fibre texture strokes hanging from the crest.
// A lone pine leans from the near bank, a small disc hangs high on the right, a skein of birds heads for the peaks.
// Motion: bands of mist drift sideways very slowly and the birds glide; nothing else.
// The ground is a dusk sky after the Token Counter wallpaper (orange, wine, violet), not flat paper: pale by day, wine-dark by night.
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
  /** How much ink a wash takes, relative to the day sheet. */
  wash: number
  /** The same for pen lines. */
  line: number
  /** Strength of the glow round the disc; 0 leaves it out. */
  halo: number
}

export const STOCKS = {
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
    ink: '#2b2338', disc: '#ee6a2c', seal: '#c2422b', wash: 1, line: 1, halo: 0,
  },
  /** Day, full strength: the Token Counter day colours as they are. Needs a strong veil under the text. */
  dayVivid: {
    sky: {
      base: [[0, '#b4664f'], [0.45, '#a07a95'], [1, '#7c8ac2']],
      glows: [
        { x: 1560, y: 20, r: 760, colour: '#e0703f', alpha: 0.9 },
        { x: 90, y: 400, r: 780, colour: '#6a90cf', alpha: 0.75 },
        { x: 1480, y: 1060, r: 800, colour: '#8a76cc', alpha: 0.7 },
      ],
    },
    ink: '#20162c', disc: '#ffd9b0', seal: '#b23a26', wash: 1.15, line: 1.1, halo: 0.25,
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
    ink: '#e4d4d8', disc: '#f79a4b', seal: '#b4472e', wash: 0.5, line: 0.8, halo: 0.14,
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
    ink: '#dcd6e8', disc: '#f79a4b', seal: '#b4472e', wash: 0.5, line: 0.8, halo: 0.14,
  },
} as const satisfies Record<string, Stock>

export type StockName = keyof typeof STOCKS

interface Point {
  x: number
  y: number
}

/** One summit of a ridge. `left` and `right` are how far its flanks reach. A power above 1 gives that flank a hollow, pointed profile,
 * below 1 a bulging cliff; the two flanks have their own. `spur` is how far the spur leans per unit of its length (0 leaves it out). */
interface Peak {
  x: number
  top: number
  left: number
  right: number
  power: number
  powerRight: number
  spur: number
}

/** One ridge. `foot` is the level its flanks come down to, `mist` the level at which its wash has faded to bare paper.
 * `texture` and `trees` are shares in 0..1: how much of the crest carries texture strokes, and how much carries moss dots. */
interface Ridge {
  name: string
  salt: number
  foot: number
  mist: number
  wash: number
  line: number
  rough: number
  from: number
  to: number
  texture: number
  trees: number
  peaks: Peak[]
}

interface Built {
  defs: string
  markup: string
}

function summit(x: number, top: number, left: number, right: number, power: number, powerRight: number, spur: number): Peak {
  return { x, top, left, right, power, powerRight, spur }
}

// The massif: bottom right, far ridge first. Each ridge is a broad body with summits and shoulders standing on it;
// its flanks come down to the mist well short of the reading column.
const MASSIF: Ridge[] = [
  {
    name: 'a', salt: 3, foot: 742, mist: 708, wash: 0.14, line: 0.36, rough: 4.5, from: 1206, to: 1690, texture: 0, trees: 0,
    peaks: [
      summit(1570, 572, 316, 200, 1.25, 1, 0),
      summit(1362, 566, 80, 60, 1.25, 0.8, -0.18),
      summit(1436, 492, 62, 54, 1, 0.9, 0),
      summit(1502, 404, 126, 92, 1.35, 0.8, -0.22),
      summit(1604, 452, 70, 96, 0.85, 1.1, -0.2),
    ],
  },
  {
    name: 'b', salt: 5, foot: 842, mist: 806, wash: 0.24, line: 0.46, rough: 6.5, from: 1206, to: 1690, texture: 0, trees: 0.3,
    peaks: [
      summit(1612, 704, 340, 200, 1.2, 1, 0),
      summit(1370, 726, 78, 60, 1.2, 0.85, 0),
      summit(1462, 640, 84, 58, 1.25, 0.75, -0.22),
      summit(1524, 628, 44, 40, 0.9, 0.9, 0),
      summit(1576, 560, 112, 86, 1.3, 0.8, -0.26),
    ],
  },
  {
    name: 'c', salt: 7, foot: 938, mist: 902, wash: 0.34, line: 0.54, rough: 7, from: 1206, to: 1690, texture: 0, trees: 0.36,
    peaks: [
      summit(1652, 780, 344, 200, 1.15, 1, 0),
      summit(1400, 826, 78, 62, 1.15, 0.85, 0),
      summit(1554, 730, 92, 62, 1.2, 0.75, -0.24),
      summit(1642, 654, 104, 100, 1.25, 0.9, -0.28),
    ],
  },
  {
    name: 'd', salt: 9, foot: 1070, mist: 1046, wash: 0.46, line: 0.64, rough: 3.5, from: 1206, to: 1690, texture: 0.5, trees: 0.3,
    peaks: [summit(1452, 918, 96, 110, 1.1, 1.1, 0), summit(1650, 770, 296, 100, 0.9, 0.9, 0)],
  },
]

// The far shore: bottom left, lower, longer and paler, so the sheet leans to the right.
const SHORE: Ridge[] = [
  {
    name: 'e', salt: 11, foot: 852, mist: 822, wash: 0.13, line: 0.34, rough: 4, from: -90, to: 440, texture: 0, trees: 0,
    peaks: [
      summit(150, 734, 300, 268, 1.2, 1.3, 0),
      summit(104, 628, 104, 100, 1.3, 0.85, 0.2),
      summit(196, 706, 50, 60, 1.1, 1, 0),
      summit(288, 694, 60, 124, 0.85, 1.4, 0.24),
    ],
  },
  {
    name: 'f', salt: 13, foot: 944, mist: 908, wash: 0.24, line: 0.46, rough: 6, from: -90, to: 440, texture: 0, trees: 0.3,
    peaks: [
      summit(40, 820, 200, 300, 1.1, 1.25, 0),
      summit(6, 716, 110, 110, 1.2, 1, 0),
      summit(176, 770, 80, 130, 0.9, 1.35, 0.24),
      summit(262, 842, 50, 70, 1, 1.2, 0),
    ],
  },
  {
    name: 'g', salt: 15, foot: 1070, mist: 1046, wash: 0.4, line: 0.58, rough: 3, from: -90, to: 440, texture: 0, trees: 0,
    peaks: [summit(-40, 852, 100, 350, 1, 1, 0)],
  },
]

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

/** One summit's own profile in 0..1 at x: 1 at the summit (a little rounded), 0 where its flank ends. */
function lobe(x: number, peak: Peak): number {
  const reach = x < peak.x ? peak.left : peak.right
  const offset = (x - peak.x) / reach
  const soft = 0.11
  const distance = (Math.sqrt(offset * offset + soft * soft) - soft) / (Math.sqrt(1 + soft * soft) - soft)
  return distance >= 1 ? 0 : Math.pow(1 - distance, x < peak.x ? peak.power : peak.powerRight)
}

function ownRise(ridge: Ridge, peak: Peak, x: number): number {
  return (ridge.foot - peak.top) * lobe(x, peak)
}

/** The ridge's height above its foot, without its crags: the summits blended, so that saddles are a little rounded. */
function smoothRise(ridge: Ridge, x: number): number {
  let sum = 0
  for (const peak of ridge.peaks) sum += Math.pow(ownRise(ridge, peak, x), 4)
  // A slow swell along the ridge gives the flanks their shoulders.
  return Math.pow(sum, 0.25) * (0.91 + 0.18 * noise(x / 63, ridge.salt + 2))
}

/** The crest's y at x. Ledges and crags shrink to nothing where the ridge comes down to its foot. */
function crestY(ridge: Ridge, x: number): number {
  const rise = smoothRise(ridge, x)
  const share = Math.min(1, rise / 70)
  // Ledges: the rise is stepped, as bedded rock is, so a flank is cliff, shelf, cliff. The beds tilt and wander along the ridge.
  const ledges = ridge.rough * share * Math.sin((rise / 58) * Math.PI * 2 + x / 47 + 5 * noise(x / 90, ridge.salt + 6))
  const crags = ridge.rough * 0.6 * share * ((noise(x / 37, ridge.salt) - 0.5) * 1.4 + (noise(x / 13, ridge.salt + 1) - 0.5) * 0.7)
  return ridge.foot - Math.max(0, rise + ledges + crags)
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

/** The crest as points, cut to where the ridge stands clear of its foot. */
function crestPoints(ridge: Ridge): Point[] {
  const all: Point[] = []
  for (let x = ridge.from; x <= ridge.to; x += 6) all.push({ x, y: crestY(ridge, x) })
  let start = 0
  while (start < all.length - 2 && (all[start + 1]?.y ?? 0) >= ridge.foot - 0.5) start += 1
  let end = all.length - 1
  while (end > start + 2 && (all[end - 1]?.y ?? 0) >= ridge.foot - 0.5) end -= 1
  return all.slice(start, end + 1)
}

/** Ink that is whole at `top` and gone at `bottom`: the paint of every pen line on a ridge, so lines dissolve into the mist as the wash does. */
function fadingInk(id: string, top: number, bottom: number, ink: string): string {
  return (
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(bottom)}">` +
    `<stop offset="0" stop-color="${ink}"/><stop offset="0.5" stop-color="${ink}" stop-opacity="0.72"/>` +
    `<stop offset="0.85" stop-color="${ink}" stop-opacity="0.16"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></linearGradient>`
  )
}

/** The hemp-fibre strokes: fine lines that hang a little below the crest and run down the fall of the slope, denser on the shaded left flanks. */
function textureStrokes(ridge: Ridge): string {
  let d = ''
  let index = 0
  let x = ridge.from
  while (x < ridge.to) {
    x += 6 + hashUnit(index, ridge.salt + 31) * 9
    index += 1
    if (x < -20 || x > WIDTH + 20) continue
    const startY = crestY(ridge, x) + 3 + hashUnit(index, ridge.salt + 33) * 16
    const height = ridge.foot - startY
    if (height < 54) continue
    // Which way the ground falls here: positive when the crest drops to the right.
    const fall = (crestY(ridge, x + 9) - crestY(ridge, x - 9)) / 18
    if (hashUnit(index, ridge.salt + 37) > (fall < 0 ? ridge.texture * 0.45 : ridge.texture)) continue
    const length = Math.min(96, height * (0.16 + 0.36 * hashUnit(index, ridge.salt + 41)))
    const lean = Math.max(-0.5, Math.min(0.5, -fall * 0.3)) * -1 + (hashUnit(index, ridge.salt + 43) - 0.5) * 0.14
    const along = (share: number): Point => ({ x: x + lean * length * Math.pow(share, 1.4), y: startY + length * share })
    // Walk the stroke and stop it before it would leave the ridge through the crest.
    let reach = 1
    for (let share = 0.2; share < 1.01; share += 0.2) {
      const point = along(share)
      if (point.y < crestY(ridge, point.x) + 3) {
        reach = share - 0.2
        break
      }
    }
    if (reach < 0.39) continue
    const middle = along(reach / 2)
    const end = along(reach)
    d += `M${round(x)} ${round(startY)}Q${round(2 * middle.x - (x + end.x) / 2)} ${round(2 * middle.y - (startY + end.y) / 2)} ${round(end.x)} ${round(end.y)}`
  }
  return d
}

/** Moss dots: short slanted dabs of darker ink in loose clusters on the crest, some a little below it. */
function mossDots(ridge: Ridge): string {
  let d = ''
  let index = 0
  let x = ridge.from
  while (x < ridge.to) {
    x += 2.5 + hashUnit(index, ridge.salt + 51) * 6
    index += 1
    if (x < -10 || x > WIDTH + 10) continue
    if (noise(x / 21, ridge.salt + 53) < 1 - ridge.trees) continue
    const y = crestY(ridge, x)
    if (ridge.foot - y < 44) continue
    const size = 1.3 + 2.3 * hashUnit(index, ridge.salt + 57)
    d += `M${round(x)} ${round(y - 1 + hashUnit(index, ridge.salt + 55) * 5.5)}l${round(size * 0.35)} ${round(-size)}`
  }
  return d
}

/** One summit's form: a spur running down from it, the face left of the spur under a second, lighter wash,
 * and a bundle of parallel strokes hanging from the spur across that face, the way a brush hatches a shaded slope. */
function peakForm(ridge: Ridge, peak: Peak, index: number, stock: Stock): Built {
  const summitY = crestY(ridge, peak.x)
  const length = (ridge.foot - summitY) * (0.5 + 0.14 * hashUnit(index, ridge.salt + 61))
  const endY = summitY + length
  const onSpur = (share: number): Point => {
    const wander = (Math.sin(share * 5.2 + index * 2 + ridge.salt) * 4 + Math.sin(share * 11 + index) * 1.6) * share
    return { x: peak.x + peak.spur * length * Math.pow(share, 1.2) + wander, y: summitY + length * share }
  }
  const spur: Point[] = []
  for (let step = 0; step <= 7; step += 1) spur.push(onSpur(step / 7))
  // The shaded face: from the summit leftward under the crest (under this summit's own flank where a neighbour stands taller), down to the level the spur ends at.
  const top: Point[] = []
  for (let x = peak.x; x > peak.x - peak.left * 1.1; x -= 7) {
    const own = ownRise(ridge, peak, x)
    const y = own < smoothRise(ridge, x) - 6 ? ridge.foot - own : crestY(ridge, x)
    if (y >= endY) {
      top.push({ x, y: endY })
      break
    }
    top.push({ x, y })
  }
  let hatch = ''
  for (let stroke = 0; stroke < 5; stroke += 1) {
    const from = onSpur(0.1 + 0.15 * stroke + 0.05 * hashUnit(stroke, ridge.salt + index * 7 + 81))
    const reach = length * (0.4 - 0.05 * stroke) * (0.8 + 0.4 * hashUnit(stroke, ridge.salt + index * 7 + 83))
    const bend = { x: from.x - reach * 0.36, y: from.y + reach * 0.46 }
    const to = { x: from.x - reach * 0.44, y: from.y + reach }
    if (bend.y < crestY(ridge, bend.x) + 4 || to.y < crestY(ridge, to.x) + 6) continue
    hatch += `M${round(from.x)} ${round(from.y)}Q${round(bend.x)} ${round(bend.y)} ${round(to.x)} ${round(to.y)}`
  }
  const id = `h${ridge.name}${index}`
  const back = spur.slice().reverse().map(point => `L${round(point.x)} ${round(point.y)}`).join('')
  const face = top.length > 1 ? `<path d="${smoothPath(top)}${back}Z" style="fill:url(#${id})" fill-opacity="${round(ridge.wash * stock.wash * 60) / 100}"/>` : ''
  const line = `<path d="${smoothPath(spur)}" stroke="url(#${id})" stroke-width="1" stroke-opacity="${round(ridge.line * stock.line * 90) / 100}"/>`
  const strokes = hatch ? `<path d="${hatch}" stroke="url(#s${ridge.name})" stroke-width="0.9" stroke-opacity="${round(ridge.line * stock.line * 80) / 100}"/>` : ''
  return { defs: fadingInk(id, summitY, endY, stock.ink), markup: face + line + strokes }
}

/** A whole ridge: wash, shaded faces, spurs, texture, moss dots, crest line. The wash is opaque, so a nearer ridge hides what stands behind it. */
function ridgeMarkup(ridge: Ridge, stock: Stock): Built {
  const points = crestPoints(ridge)
  const first = points[0]
  const last = points[points.length - 1]
  if (!first || !last) return { defs: '', markup: '' }
  let top = ridge.foot
  for (const point of points) top = Math.min(top, point.y)
  const share = ridge.wash * stock.wash
  const crest = smoothPath(points)
  const paint = `stroke="url(#s${ridge.name})"`
  const alpha = (part: number): number => round(share * part * 1000) / 1000
  let defs =
    `<linearGradient id="w${ridge.name}" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${ridge.mist}">` +
    `<stop offset="0" stop-color="${stock.ink}" stop-opacity="${alpha(1)}"/><stop offset="0.3" stop-color="${stock.ink}" stop-opacity="${alpha(0.8)}"/>` +
    `<stop offset="0.6" stop-color="${stock.ink}" stop-opacity="${alpha(0.42)}"/><stop offset="0.85" stop-color="${stock.ink}" stop-opacity="${alpha(0.1)}"/>` +
    `<stop offset="1" stop-color="${stock.ink}" stop-opacity="0"/></linearGradient>` +
    fadingInk(`s${ridge.name}`, top, ridge.mist, stock.ink)
  // A piece of sky in the ridge's shape first (it hides the ridges behind), then the ink over it, fading to that sky at the mist line.
  const body = `${crest}L${round(last.x)} ${ridge.foot + 2}L${round(first.x)} ${ridge.foot + 2}Z`
  let markup = skyPainted(body, stock.sky) + `<path d="${body}" style="fill:url(#w${ridge.name})"/>`
  ridge.peaks.forEach((peak, index) => {
    if (peak.spur === 0) return
    const form = peakForm(ridge, peak, index, stock)
    defs += form.defs
    markup += form.markup
  })
  if (ridge.texture > 0) markup += `<path d="${textureStrokes(ridge)}" ${paint} stroke-width="0.9" stroke-opacity="${round(ridge.line * stock.line * 85) / 100}"/>`
  if (ridge.trees > 0) markup += `<path d="${mossDots(ridge)}" ${paint} stroke-width="1.7" stroke-opacity="${round(Math.min(1, ridge.line * stock.line * 1.35) * 100) / 100}"/>`
  markup += `<path d="${crest}" ${paint} stroke-width="1.15" stroke-opacity="${round(ridge.line * stock.line * 100) / 100}"/>`
  return { defs, markup }
}

/** Bands of mist: long soft lenses of bare sky that drift sideways and back. Each takes the sky's colour where it lies. */
function mistMaker(sky: Sky): { band: (cx: number, cy: number, rx: number, ry: number, reach: number, seconds: number, delay: number) => string; defs: () => string } {
  const gradients: string[] = []
  return {
    band(cx, cy, rx, ry, reach, seconds, delay) {
      const id = `m${gradients.length}`
      const colour = skyAt(sky, cx, cy)
      gradients.push(
        `<radialGradient id="${id}"><stop offset="0" stop-color="${colour}" stop-opacity="0.88"/><stop offset="0.45" stop-color="${colour}" stop-opacity="0.7"/>` +
          `<stop offset="0.8" stop-color="${colour}" stop-opacity="0.24"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>`,
      )
      return `<ellipse class="drift" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})" style="--reach:${reach}px;animation-duration:${seconds}s;animation-delay:-${delay}s"/>`
    },
    defs: () => gradients.join(''),
  }
}

/** A fan of pine needles opening upward from one point, the middle needles longest. */
function needleFan(x: number, y: number, radius: number, seed: number): string {
  let d = ''
  for (let needle = 0; needle < 9; needle += 1) {
    const angle = ((192 + (156 * needle) / 8 + (hashUnit(needle, seed) - 0.5) * 10) * Math.PI) / 180
    const reach = radius * (0.66 + 0.34 * Math.sin((Math.PI * (needle + 0.5)) / 9)) * (0.9 + 0.2 * hashUnit(needle, seed + 1))
    d += `M${round(x)} ${round(y)}l${round(Math.cos(angle) * reach)} ${round(Math.sin(angle) * reach)}`
  }
  return d
}

/** The lone pine: a tapered, leaning, bending trunk, a few boughs reaching out (longest on the leaning side), flat pads of needle fans along them. */
function pine(rootX: number, rootY: number, height: number, lean: number, salt: number, stock: Stock): string {
  const axis = (share: number): Point => ({
    x: rootX + lean * height * Math.pow(share, 1.2) + Math.sin(share * Math.PI * 1.35) * height * 0.07,
    y: rootY - height * share,
  })
  const left: Point[] = []
  const right: Point[] = []
  for (let step = 0; step <= 10; step += 1) {
    const share = step / 10
    const point = axis(share)
    const half = 0.6 + 3.3 * Math.pow(1 - share, 1.3) + (step === 0 ? 2.4 : 0)
    left.push({ x: point.x - half, y: point.y })
    right.unshift({ x: point.x + half, y: point.y })
  }
  const trunk = 'M' + left.concat(right).map(point => `${round(point.x)} ${round(point.y)}`).join('L') + 'Z'
  const boughs = [
    { at: 0.5, side: -1, reach: 0.66, lift: 0.03 },
    { at: 0.63, side: 1, reach: 0.4, lift: 0.1 },
    { at: 0.76, side: -1, reach: 0.46, lift: 0.1 },
    { at: 0.88, side: 1, reach: 0.3, lift: 0.14 },
  ]
  let limbs = ''
  let needles = ''
  boughs.forEach((bough, index) => {
    const start = axis(bough.at)
    const span = bough.reach * height
    const end = { x: start.x + bough.side * span, y: start.y - span * bough.lift }
    const control = { x: start.x + bough.side * span * 0.42, y: start.y - span * (bough.lift + 0.2) }
    limbs += `M${round(start.x)} ${round(start.y)}Q${round(control.x)} ${round(control.y)} ${round(end.x)} ${round(end.y)}`
    const count = Math.max(2, Math.round((span * 0.74) / 8.5))
    for (let fan = 0; fan <= count; fan += 1) {
      const share = 0.3 + (0.76 * fan) / count
      const rest = 1 - share
      const x = rest * rest * start.x + 2 * rest * share * control.x + share * share * end.x
      const y = rest * rest * start.y + 2 * rest * share * control.y + share * share * end.y
      const envelope = 0.7 + 0.3 * Math.sin((Math.PI * (fan + 0.5)) / (count + 1))
      needles += needleFan(x, y + 1.5 * hashUnit(fan, salt + index * 13), (9.5 + 2.5 * hashUnit(fan, salt + index * 17)) * envelope, salt + index * 31 + fan * 3)
    }
  })
  const tip = axis(1)
  needles += needleFan(tip.x, tip.y + 3, 10.5, salt + 201) + needleFan(tip.x - 8, tip.y + 7, 8.5, salt + 203) + needleFan(tip.x + 7.5, tip.y + 8, 8, salt + 205)
  return (
    `<path d="${trunk}" style="fill:${stock.ink}" fill-opacity="0.9"/>` +
    `<path d="${limbs}" stroke="${stock.ink}" stroke-width="1.5" stroke-opacity="0.9"/>` +
    `<path d="${needles}" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${round(0.86 * stock.line * 100) / 100}"/>`
  )
}

/** A skein of birds, each a two-stroke mark, the leader on the right: they are heading for the peaks. */
function birds(stock: Stock): string {
  const skein = [
    { x: 1408, y: 320, size: 1 },
    { x: 1386, y: 309, size: 0.9 },
    { x: 1385, y: 334, size: 0.86 },
    { x: 1362, y: 301, size: 0.78 },
    { x: 1360, y: 347, size: 0.74 },
    { x: 1339, y: 293, size: 0.66 },
  ]
  let marks = ''
  skein.forEach((bird, index) => {
    const size = bird.size
    // Two wings arching up from the body; every other bird holds them flatter.
    const arch = index % 2 === 0 ? 5.4 : 4.2
    const d = `M${round(bird.x - 7.6 * size)} ${round(bird.y - 2.8 * size)}Q${round(bird.x - 3.2 * size)} ${round(bird.y - arch * size)} ${round(bird.x)} ${round(bird.y)}Q${round(bird.x + 3 * size)} ${round(bird.y - (arch + 0.9) * size)} ${round(bird.x + 8 * size)} ${round(bird.y - 4 * size)}`
    marks += `<path class="bob" style="animation-duration:${5 + (index % 4) * 1.5}s;animation-delay:-${round(hashUnit(index, 71) * 6)}s" d="${d}"/>`
  })
  return `<g class="flock" stroke="${stock.ink}" stroke-width="1.2" stroke-opacity="${round(0.78 * stock.line * 100) / 100}">${marks}</g>`
}

/** A small plain seal: a vermilion square with two waves and a dot left bare. A mark, not a character. */
function seal(x: number, y: number, stock: Stock): string {
  const bare = skyAt(stock.sky, x + 12, y + 12)
  return (
    `<g transform="translate(${x} ${y})" opacity="0.92"><rect width="24" height="24" rx="2.2" fill="${stock.seal}"/>` +
    `<path d="M5 12.4q3.5 -3.2 7 0t7 0M5 18q3.5 -3.2 7 0t7 0" stroke="${bare}" stroke-width="1.7"/>` +
    `<circle cx="16.4" cy="6.4" r="2.1" fill="${bare}"/></g>`
  )
}

/** The whole sheet on one stock. */
function inkMountainsSheet(stock: Stock): string {
  const massif = MASSIF.map(ridge => ridgeMarkup(ridge, stock))
  const shore = SHORE.map(ridge => ridgeMarkup(ridge, stock))
  const bank = MASSIF[3]
  const pineX = 1516
  const pineMarkup = bank ? pine(pineX, crestY(bank, pineX) + 4, 104, -0.16, 41, stock) : ''
  const mist = mistMaker(stock.sky)
  const mistBand = mist.band

  const style = `
path{fill:none;stroke-linecap:round;stroke-linejoin:round}
.drift{animation:drift 150s ease-in-out infinite alternate}
.flock{animation:glide 130s linear infinite;animation-delay:-30s}
.bob{animation:bob 6s ease-in-out infinite alternate}
@keyframes drift{from{transform:translateX(calc(var(--reach) * -1))}to{transform:translateX(var(--reach))}}
@keyframes glide{0%{transform:translate(-69px,23px);opacity:0}8%{opacity:1}82%{opacity:1}100%{transform:translate(231px,-77px);opacity:0}}
@keyframes bob{from{transform:translateY(-1.6px)}to{transform:translateY(1.8px)}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  const disc =
    (stock.halo > 0 ? `<circle cx="1452" cy="212" r="78" fill="url(#halo)"/>` : '') +
    `<circle cx="1452" cy="212" r="23" fill="${stock.disc}" fill-opacity="0.9"/>` +
    mistBand(1442, 222, 66, 4.6, 14, 110, 20) +
    mistBand(1470, 233, 40, 2.6, -10, 86, 50)

  // Built in drawing order, so that every band of mist has made its gradient before the defs are written.
  const drawing = `${disc}
${birds(stock)}
${massif[0]?.markup ?? ''}${mistBand(1474, 502, 108, 8, 22, 120, 30)}${mistBand(1480, 612, 240, 21, 46, 150, 40)}${mistBand(1344, 668, 120, 8, -30, 190, 120)}
${massif[1]?.markup ?? ''}${mistBand(1520, 754, 222, 18, -40, 170, 70)}${mistBand(1392, 792, 130, 8, 30, 130, 10)}
${massif[2]?.markup ?? ''}${mistBand(1440, 868, 214, 15, 36, 160, 100)}
${massif[3]?.markup ?? ''}${pineMarkup}
${shore[0]?.markup ?? ''}${mistBand(262, 768, 200, 15, 34, 170, 60)}
${shore[1]?.markup ?? ''}${mistBand(214, 878, 190, 12, -30, 140, 90)}
${shore[2]?.markup ?? ''}
${seal(232, 908, stock)}`

  const defs =
    skyDefs(stock.sky) +
    mist.defs() +
    `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.disc}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.disc}" stop-opacity="0"/></radialGradient>` +
    massif.map(part => part.defs).join('') +
    shore.map(part => part.defs).join('')

  const sky = `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>` + stock.sky.glows.map((_, index) => `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow${index})"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${defs}</defs>
${sky}
${drawing}
</svg>`
}

/** Ink Mountains on any of its stocks. */
export function inkMountainsSvg(stock: StockName): string {
  return inkMountainsSheet(STOCKS[stock])
}

/** Ink Mountains under a pale dusk sky, for a light window. */
export function daySvg(): string {
  return inkMountainsSheet(STOCKS.day)
}

/** Ink Mountains under a wine-dark sky with one orange glow, for a dark window. */
export function nightSvg(): string {
  return inkMountainsSheet(STOCKS.night)
}
