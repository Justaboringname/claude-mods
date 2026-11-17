// Ink Mountains: a shan shui sheet. Layered ridges in ink wash rise from the two lower corners and sink into mist;
// the tall massif stands on the right, a low far shore on the left, and the middle of the sheet is left as empty paper.
// Every ridge is one wash that is dark at its summits and fades to bare paper at a level mist line, a fine crest line,
// one spur per summit with its shaded face, and a few hemp-fibre texture strokes hanging from the crest.
// A lone pine leans from the near bank, a small disc hangs high on the right, a skein of birds heads for the peaks.
// Motion: bands of mist drift sideways very slowly and the birds glide; nothing else.
//
// Two sheets share the drawing code:
// - the PAPER sheet (daySvg, nightSvg): plain warm paper and dark ink by day, warm near-black paper, pale warm-grey
//   washes and an amber moon by night. No blue anywhere at night.
// - the DUSK sheet (inkMountainsSvg and STOCKS): the same ridges against a dusk sky after the Token Counter wallpaper
//   (orange, wine, violet). It is kept exactly as it was: nothing below changes what it draws.
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
  if (ridge.line > 0) markup += `<path d="${crest}" ${paint} stroke-width="1.15" stroke-opacity="${round(ridge.line * stock.line * 100) / 100}"/>`
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

// ---------------------------------------------------------------------------------------------------------------
// The paper sheet: plain paper and one ink, with a composition and a brush of its own. Nothing below is used by the dusk sheet.

/** Warm paper, one flat colour, and one warm black ink. The disc is a terracotta sun. */
const PAPER_DAY: Stock = {
  sky: { base: [[0, '#f3eee3'], [1, '#f3eee3']], glows: [] },
  ink: '#2b2622', disc: '#c9572f', seal: '#b93a25', wash: 1, line: 1, halo: 0,
}

/** Warm near-black paper and pale warm-grey ink; the disc is an amber moon. Blue is the weakest channel of every colour here. */
const PAPER_NIGHT: Stock = {
  sky: { base: [[0, '#1d1914'], [1, '#1d1914']], glows: [] },
  ink: '#d9cebd', disc: '#e7a24a', seal: '#a8432b', wash: 0.6, line: 0.92, halo: 0.16,
}

/** The one colour of a paper stock. A flat fill costs less to paint than a gradient, and the sheet is repainted on every frame. */
function paperOf(stock: Stock): string {
  return stock.sky.base[0]?.[1] ?? '#000000'
}

/** A range of the paper sheet: a ridge with a cragged crest. `texture` is how densely its shaded faces are hatched, `trees` the share of
 * the crest that carries tiny pines, `dots` the share that carries moss dots, `hemp` how much of it trails long strokes down the slope. */
interface Range extends Ridge {
  dots: number
  hemp: number
}

// The massif, bottom right, far range first: "high distance". The first is a wash with no line at all, the palest thing on the sheet.
// One host peak, with guests of other heights and builds around it: spires, a thumb, blunt shoulders.
const EAST: Range[] = [
  {
    name: 'y', salt: 21, foot: 706, mist: 652, wash: 0.07, line: 0, rough: 7, from: 1206, to: 1612, texture: 0, trees: 0, dots: 0, hemp: 0,
    peaks: [summit(1578, 306, 116, 150, 1, 1.15, 0), summit(1466, 470, 60, 64, 0.7, 0.8, 0), summit(1668, 392, 90, 120, 1, 1.1, 0)],
  },
  {
    name: 'a', salt: 3, foot: 742, mist: 706, wash: 0.17, line: 0.46, rough: 14, from: 1206, to: 1612, texture: 0.5, trees: 0, dots: 0.16, hemp: 0,
    peaks: [
      summit(1570, 580, 316, 200, 1.25, 1, 0),
      summit(1358, 588, 70, 50, 1.05, 0.6, -0.16),
      summit(1428, 506, 40, 44, 0.55, 0.6, 0),
      summit(1498, 380, 112, 82, 1.3, 0.66, -0.2),
      summit(1604, 458, 60, 96, 0.7, 1.1, -0.18),
    ],
  },
  {
    name: 'b', salt: 5, foot: 842, mist: 806, wash: 0.3, line: 0.58, rough: 14, from: 1206, to: 1612, texture: 0.6, trees: 0.34, dots: 0.12, hemp: 0,
    peaks: [
      summit(1612, 708, 340, 200, 1.2, 1, 0),
      summit(1374, 738, 66, 54, 1.05, 0.7, 0),
      summit(1462, 650, 74, 50, 1.15, 0.6, -0.2),
      summit(1580, 556, 100, 84, 1.2, 0.7, -0.24),
    ],
  },
  {
    name: 'c', salt: 7, foot: 938, mist: 902, wash: 0.42, line: 0.68, rough: 13, from: 1206, to: 1612, texture: 0.7, trees: 0.4, dots: 0.14, hemp: 0,
    peaks: [
      summit(1652, 784, 344, 200, 1.15, 1, 0),
      summit(1418, 846, 56, 54, 0.6, 0.7, 0),
      summit(1552, 738, 80, 56, 1.1, 0.66, -0.22),
      summit(1644, 650, 96, 100, 1.2, 0.8, -0.26),
    ],
  },
  {
    name: 'd', salt: 9, foot: 1070, mist: 1046, wash: 0.56, line: 0.8, rough: 5, from: 1206, to: 1612, texture: 0, trees: 0, dots: 0.18, hemp: 0.6,
    peaks: [summit(1452, 918, 96, 110, 1.1, 1.1, 0), summit(1650, 770, 296, 100, 0.9, 0.9, 0)],
  },
]

// The far shore, bottom left: "level distance". Lower, longer and paler than the massif, so the sheet leans to the right.
const WEST: Range[] = [
  {
    name: 'z', salt: 23, foot: 806, mist: 768, wash: 0.065, line: 0, rough: 8, from: -12, to: 440, texture: 0, trees: 0, dots: 0, hemp: 0,
    peaks: [summit(236, 644, 150, 124, 1.3, 1.15, 0), summit(344, 708, 64, 84, 1.1, 1.4, 0), summit(50, 676, 130, 120, 1.3, 1.3, 0)],
  },
  {
    name: 'e', salt: 11, foot: 852, mist: 824, wash: 0.15, line: 0.42, rough: 10, from: -12, to: 440, texture: 0.5, trees: 0, dots: 0.14, hemp: 0,
    peaks: [
      summit(150, 752, 300, 280, 1.35, 1.5, 0),
      summit(98, 660, 92, 88, 1.2, 0.7, 0.18),
      summit(198, 726, 40, 48, 0.8, 0.8, 0),
      summit(300, 702, 38, 64, 0.6, 0.9, 0.2),
    ],
  },
  {
    name: 'f', salt: 13, foot: 944, mist: 910, wash: 0.27, line: 0.54, rough: 11, from: -12, to: 440, texture: 0.6, trees: 0.34, dots: 0.12, hemp: 0,
    peaks: [
      summit(40, 826, 200, 300, 1.1, 1.35, 0),
      summit(6, 726, 110, 110, 1.2, 1, 0),
      summit(180, 782, 64, 108, 0.85, 1.3, 0.22),
      summit(268, 856, 38, 66, 0.7, 1.1, 0),
    ],
  },
  {
    name: 'g', salt: 15, foot: 1070, mist: 1046, wash: 0.44, line: 0.68, rough: 4.5, from: -12, to: 440, texture: 0, trees: 0, dots: 0.16, hemp: 0.3,
    peaks: [summit(-40, 852, 100, 350, 1, 1, 0)],
  },
]

/** One summit's own height above the foot at x: sharper at the tip than the dusk sheet's. */
function peakRise(range: Range, peak: Peak, x: number): number {
  const offset = Math.abs(x - peak.x) / (x < peak.x ? peak.left : peak.right)
  if (offset >= 1) return 0
  const soft = 0.05
  const distance = (Math.sqrt(offset * offset + soft * soft) - soft) / (Math.sqrt(1 + soft * soft) - soft)
  return (range.foot - peak.top) * Math.pow(1 - distance, x < peak.x ? peak.power : peak.powerRight)
}

/** The crest's y at x. The summits are blended with crisp saddles, then cragged: sharp sub-peaks, small notches, and bedded ledges,
 * all of which shrink to nothing where the range comes down to its foot. */
function brushCrestY(range: Range, x: number): number {
  let sum = 0
  for (const peak of range.peaks) sum += Math.pow(peakRise(range, peak, x), 6)
  const rise = Math.pow(sum, 1 / 6) * (0.93 + 0.14 * noise(x / 63, range.salt + 2))
  const share = Math.min(1, rise / 80)
  const ridged = 1 - Math.abs(2 * noise(x / 37, range.salt + 4) - 1)
  const fine = noise(x / 13, range.salt + 1) - 0.5
  const ledges = Math.sin((rise / 58) * Math.PI * 2 + x / 47 + 5 * noise(x / 90, range.salt + 6))
  return range.foot - Math.max(0, rise + range.rough * share * (1.4 * (ridged - 0.6) + 0.5 * fine + 0.7 * ledges))
}

/** The crest as points, cut to where the range stands clear of its foot. */
function rangePoints(range: Range): Point[] {
  const all: Point[] = []
  for (let x = range.from; x <= range.to; x += 4) all.push({ x, y: brushCrestY(range, x) })
  let start = 0
  while (start < all.length - 2 && (all[start + 1]?.y ?? 0) >= range.foot - 0.5) start += 1
  let end = all.length - 1
  while (end > start + 2 && (all[end - 1]?.y ?? 0) >= range.foot - 0.5) end -= 1
  return all.slice(start, end + 1)
}

/** Where the brush is pressed harder along a crest: the slopes that face away from the sun (it stands on the right),
 * in runs that break off and start again the way a dry brush does. */
function pressedRuns(range: Range, points: Point[]): string {
  let d = ''
  let run: Point[] = []
  const flush = (): void => {
    if (run.length >= 3) d += smoothPath(run)
    run = []
  }
  for (let index = 0; index < points.length - 1; index += 1) {
    const here = points[index]
    const next = points[index + 1]
    if (!here || !next) continue
    const climbs = next.y < here.y - 0.6
    const pressed = (climbs && noise(here.x / 19, range.salt + 91) > 0.3) || noise(here.x / 27, range.salt + 93) > 0.82
    if (pressed && range.foot - here.y > 14) run.push(here)
    else flush()
  }
  flush()
  return d
}

/** Tiny pines standing along a crest in loose stands, in the shorthand for a far pine: a trunk crossed by three level boughs, the lowest the widest. */
function pineMarks(range: Range): string {
  let d = ''
  let index = 0
  let x = range.from
  while (x < range.to) {
    x += 4 + hashUnit(index, range.salt + 51) * 6
    index += 1
    if (noise(x / 30, range.salt + 53) < 1 - range.trees) continue
    const y = brushCrestY(range, x)
    if (range.foot - y < 46) continue
    // A pine wants a foothold: most stand on shoulders and summits, few on a cliff.
    const slope = (brushCrestY(range, x + 4) - brushCrestY(range, x - 4)) / 8
    if (hashUnit(index, range.salt + 55) > 0.1 + 0.9 / (1 + 0.32 * slope * slope)) continue
    const height = 4.5 + 7.5 * Math.pow(hashUnit(index, range.salt + 57), 1.4)
    const lean = (hashUnit(index, range.salt + 59) - 0.5) * 1.8
    const wide = [height * 0.17, height * 0.3, height * 0.42]
    d +=
      `M${round(x)} ${round(y + 1)}l${round(lean)} ${round(-height - 1)}` +
      `m${round(-(wide[0] ?? 0) - lean * 0.2)} ${round(height * 0.2)}h${round(2 * (wide[0] ?? 0))}` +
      `m${round(-(wide[0] ?? 0) - (wide[1] ?? 0) - lean * 0.25)} ${round(height * 0.25)}h${round(2 * (wide[1] ?? 0))}` +
      `m${round(-(wide[1] ?? 0) - (wide[2] ?? 0) - lean * 0.25)} ${round(height * 0.25)}h${round(2 * (wide[2] ?? 0))}`
  }
  return d
}

/** Moss dots: short dabs of dark ink in loose clusters on the crest, some a little below it. */
function dotMarks(range: Range): string {
  let d = ''
  let index = 0
  let x = range.from
  while (x < range.to) {
    x += 2.4 + hashUnit(index, range.salt + 71) * 4.2
    index += 1
    if (noise(x / 13, range.salt + 73) < 1 - range.dots) continue
    const y = brushCrestY(range, x)
    if (range.foot - y < 40) continue
    const size = 0.5 + 1.3 * hashUnit(index, range.salt + 77)
    d += `M${round(x)} ${round(y - 1 + hashUnit(index, range.salt + 75) * 5)}l${round(size * 0.5)} ${round(-size)}`
  }
  return d
}

/** Hemp-fibre strokes for an earthen bank: long fine lines that hang a little below the crest and run down the fall of the slope. */
function hempStrokes(range: Range): string {
  let d = ''
  let index = 0
  let x = range.from
  while (x < range.to) {
    x += 6 + hashUnit(index, range.salt + 31) * 9
    index += 1
    const startY = brushCrestY(range, x) + 3 + hashUnit(index, range.salt + 33) * 16
    const height = range.foot - startY
    if (height < 54) continue
    const fall = (brushCrestY(range, x + 9) - brushCrestY(range, x - 9)) / 18
    if (hashUnit(index, range.salt + 37) > (fall < 0 ? range.hemp * 0.45 : range.hemp)) continue
    const length = Math.min(96, height * (0.16 + 0.36 * hashUnit(index, range.salt + 41)))
    const lean = Math.max(-0.5, Math.min(0.5, fall * 0.3)) + (hashUnit(index, range.salt + 43) - 0.5) * 0.14
    const along = (share: number): Point => ({ x: x + lean * length * Math.pow(share, 1.4), y: startY + length * share })
    let reach = 1
    for (let share = 0.2; share < 1.01; share += 0.2) {
      const point = along(share)
      if (point.y < brushCrestY(range, point.x) + 3) {
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

/** The second stroke of an earthen bank: the crest drawn again a little way down the slope, twice, in broken runs. */
function strataLines(range: Range): string {
  let d = ''
  for (let layer = 1; layer <= 2; layer += 1) {
    let run: Point[] = []
    for (let x = range.from; x <= range.to + 6; x += 6) {
      const crest = brushCrestY(range, x)
      const kept = x <= range.to && range.foot - crest > 60 && noise(x / 31, range.salt + 110 + layer) > 0.44
      if (kept) {
        run.push({ x, y: crest + layer * (10 + 10 * noise(x / 40, range.salt + 100 + layer)) })
      } else {
        if (run.length >= 4) d += smoothPath(run)
        run = []
      }
    }
  }
  return d
}

/** Grass on a bank's edge: tufts of three blades, here and there. */
function tuftMarks(range: Range): string {
  let d = ''
  let index = 0
  let x = range.from
  while (x < range.to) {
    x += 8 + hashUnit(index, range.salt + 121) * 22
    index += 1
    if (noise(x / 46, range.salt + 123) < 0.4) continue
    const y = brushCrestY(range, x)
    if (range.foot - y < 40) continue
    const size = 3.4 + 3.6 * hashUnit(index, range.salt + 125)
    const root = `M${round(x)} ${round(y + 0.6)}`
    d += `${root}l${round(-size * 0.5)} ${round(-size * 0.75)}${root}l${round(size * 0.06)} ${round(-size)}${root}l${round(size * 0.55)} ${round(-size * 0.7)}`
  }
  return d
}

/** One summit's form: a spine running down from it and forking once, the face on the shaded side of the spine under a second wash,
 * and short texture strokes scattered down that face (and a few on the lit side), all falling the way the slope falls. */
function brushForm(range: Range, peak: Peak, index: number, stock: Stock): Built {
  let summitX = peak.x
  let summitY = brushCrestY(range, peak.x)
  for (let x = peak.x - 18; x <= peak.x + 18; x += 2) {
    const y = brushCrestY(range, x)
    if (y < summitY) {
      summitY = y
      summitX = x
    }
  }
  const height = range.foot - summitY
  const seed = range.salt * 17 + index * 5
  const length = height * (0.48 + 0.16 * hashUnit(index, range.salt + 61))
  const endY = summitY + length
  const inside = (point: Point, margin: number): boolean => point.y >= brushCrestY(range, point.x) + margin
  const onSpine = (share: number): Point => {
    const wander = ((noise(share * 4.6 + seed, 63) - 0.5) * 18 + (noise(share * 12 + seed, 64) - 0.5) * 7) * Math.min(1, share * 3.5)
    return { x: summitX + peak.spur * length * Math.pow(share, 1.15) + wander, y: summitY + length * share }
  }
  const spine: Point[] = []
  for (let step = 0; step <= 9; step += 1) {
    const point = onSpine(step / 9)
    if (step > 2 && !inside(point, 2)) break
    spine.push(point)
  }
  // The fork: a shorter spine leaving the first one a quarter of the way down, on the other side.
  const fork: Point[] = []
  if (height > 130) {
    const from = onSpine(0.26)
    const reach = length * 0.5
    const away = peak.spur < 0 ? 1 : -1
    for (let step = 0; step <= 6; step += 1) {
      const share = step / 6
      const point = { x: from.x + away * 0.46 * reach * Math.pow(share, 1.1) + (noise(share * 4 + seed, 67) - 0.5) * 11 * share, y: from.y + reach * share }
      if (step > 1 && !inside(point, 2)) break
      fork.push(point)
    }
  }
  // The shaded face: from the summit along the crest on the spur's side, down to the level the spine ends at.
  const side = peak.spur < 0 ? -1 : 1
  const reachOut = side < 0 ? peak.left : peak.right
  const top: Point[] = [{ x: summitX, y: summitY }]
  let lowest = summitY
  for (let step = 5; step < reachOut * 1.15; step += 5) {
    const x = summitX + side * step
    let y = brushCrestY(range, x)
    // Where the crest climbs again toward a neighbour, the face keeps to this summit's own flank.
    if (y < lowest - 8) y = Math.max(range.foot - peakRise(range, peak, x), lowest)
    lowest = Math.max(lowest, y)
    if (y >= endY) {
      top.push({ x, y: endY })
      break
    }
    top.push({ x, y })
  }
  const edgeX = (y: number): number => {
    for (let at = 1; at < top.length; at += 1) {
      const a = top[at - 1]
      const b = top[at]
      if (a && b && y <= b.y) return a.x + (b.x - a.x) * Math.max(0, Math.min(1, b.y === a.y ? 0 : (y - a.y) / (b.y - a.y)))
    }
    return top[top.length - 1]?.x ?? summitX
  }
  const count = Math.round((range.texture * length) / 6.5)
  let shaded = ''
  let lit = ''
  for (let stroke = 0; stroke < count; stroke += 1) {
    const anchor = onSpine(0.06 + 0.8 * ((stroke + hashUnit(stroke, seed + 81)) / count))
    const across = 0.06 + 0.62 * hashUnit(stroke, seed + 83)
    const from = { x: anchor.x + across * (edgeX(anchor.y) - anchor.x), y: anchor.y + (hashUnit(stroke, seed + 85) - 0.5) * 6 }
    const reach = (9 + 22 * hashUnit(stroke, seed + 87)) * Math.min(1, height / 150 + 0.35)
    const lean = side * (0.22 + 0.34 * across) * reach
    const to = { x: from.x + lean, y: from.y + reach }
    if (!inside(from, 2.5) || !inside(to, 3)) continue
    shaded += `M${round(from.x)} ${round(from.y)}Q${round(from.x + lean * 0.25)} ${round(from.y + reach * 0.55)} ${round(to.x)} ${round(to.y)}`
  }
  for (let stroke = 0; stroke < count / 3; stroke += 1) {
    const anchor = onSpine(0.1 + 0.7 * ((stroke + hashUnit(stroke, seed + 71)) / (count / 3)))
    const from = { x: anchor.x - side * (4 + 0.3 * reachOut * hashUnit(stroke, seed + 73)), y: anchor.y }
    const reach = (8 + 14 * hashUnit(stroke, seed + 77)) * Math.min(1, height / 150 + 0.35)
    const to = { x: from.x - side * 0.3 * reach, y: from.y + reach }
    if (!inside(from, 2.5) || !inside(to, 3)) continue
    lit += `M${round(from.x)} ${round(from.y)}L${round(to.x)} ${round(to.y)}`
  }
  const id = `h${range.name}${index}`
  const ink = range.line * stock.line
  const back = spine.slice().reverse().map(point => `L${round(point.x)} ${round(point.y)}`).join('')
  const lines = smoothPath(spine) + (fork.length > 2 ? smoothPath(fork) : '')
  return {
    defs: fadingInk(id, summitY, endY, stock.ink),
    markup:
      (top.length > 1 ? `<path d="${smoothPath(top)}${back}Z" fill="url(#${id})" fill-opacity="${round(range.wash * stock.wash * 62) / 100}"/>` : '') +
      `<path d="${lines}" stroke="url(#${id})" stroke-opacity="${round(ink * 92) / 100}"/>` +
      (shaded ? `<path d="${shaded}" stroke="url(#s${range.name})" stroke-width="0.85" stroke-opacity="${round(ink * 80) / 100}"/>` : '') +
      (lit ? `<path d="${lit}" stroke="url(#s${range.name})" stroke-width="0.8" stroke-opacity="${round(ink * 40) / 100}"/>` : ''),
  }
}

/** A whole range. Its body is kept once and used three times: as a piece of bare paper that hides what stands behind, as the wash
 * that fades to that paper at the mist line, and as the crest line (whose ink fades out at the same level, so the body's sides and foot leave no line). */
function rangeMarkup(range: Range, stock: Stock): Built {
  const points = rangePoints(range)
  const first = points[0]
  const last = points[points.length - 1]
  if (!first || !last) return { defs: '', markup: '' }
  let top = range.foot
  for (const point of points) top = Math.min(top, point.y)
  const share = range.wash * stock.wash
  const ink = range.line * stock.line
  const alpha = (part: number): number => round(share * part * 1000) / 1000
  const body = `b${range.name}`
  const paint = `stroke="url(#s${range.name})"`
  let defs =
    `<linearGradient id="w${range.name}" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${range.mist}">` +
    `<stop offset="0" stop-color="${stock.ink}" stop-opacity="${alpha(1)}"/><stop offset="0.3" stop-color="${stock.ink}" stop-opacity="${alpha(0.8)}"/>` +
    `<stop offset="0.6" stop-color="${stock.ink}" stop-opacity="${alpha(0.42)}"/><stop offset="0.85" stop-color="${stock.ink}" stop-opacity="${alpha(0.1)}"/>` +
    `<stop offset="1" stop-color="${stock.ink}" stop-opacity="0"/></linearGradient>` +
    fadingInk(`s${range.name}`, top, range.mist, stock.ink) +
    `<path id="${body}" d="${smoothPath(points)}V${range.foot + 2}H${round(first.x)}Z"/>`
  let markup = `<use href="#${body}" fill="${paperOf(stock)}"/><use href="#${body}" fill="url(#w${range.name})"/>`
  range.peaks.forEach((peak, index) => {
    if (peak.spur === 0) return
    const form = brushForm(range, peak, index, stock)
    defs += form.defs
    markup += form.markup
  })
  if (range.hemp > 0) {
    markup +=
      `<path d="${hempStrokes(range)}" ${paint} stroke-width="0.9" stroke-opacity="${round(ink * 85) / 100}"/>` +
      `<path d="${strataLines(range)}" ${paint} stroke-width="0.9" stroke-opacity="${round(ink * 55) / 100}"/>` +
      `<path d="${tuftMarks(range)}" ${paint} stroke-width="0.9" stroke-opacity="${round(Math.min(1, ink * 1.25) * 100) / 100}"/>`
  }
  if (range.line > 0) {
    markup += `<use href="#${body}" ${paint} stroke-width="0.9" stroke-opacity="${round(ink * 85) / 100}"/>`
    const pressed = pressedRuns(range, points)
    if (pressed) markup += `<path d="${pressed}" ${paint} stroke-width="1.7" stroke-opacity="${round(Math.min(1, ink * 1.05) * 100) / 100}"/>`
  }
  if (range.trees > 0) markup += `<path d="${pineMarks(range)}" ${paint} stroke-width="0.95" stroke-opacity="${round(Math.min(1, ink * 1.4) * 100) / 100}"/>`
  if (range.dots > 0) markup += `<path d="${dotMarks(range)}" ${paint} stroke-width="2.1" stroke-opacity="${round(Math.min(1, ink * 1.35) * 100) / 100}"/>`
  return { defs, markup }
}

/** The lone pine of the paper sheet: a tapered, leaning, bending trunk with two roots, a few boughs reaching out (longest on the
 * leaning side), flat pads of needle fans along them. `share` thins its ink. */
function brushPine(rootX: number, rootY: number, height: number, lean: number, salt: number, stock: Stock, share: number): string {
  const axis = (part: number): Point => ({
    x: rootX + lean * height * Math.pow(part, 1.2) + Math.sin(part * Math.PI * 1.35) * height * 0.07,
    y: rootY - height * part,
  })
  const left: Point[] = []
  const right: Point[] = []
  for (let step = 0; step <= 10; step += 1) {
    const part = step / 10
    const point = axis(part)
    const half = 0.55 + 3.1 * Math.pow(1 - part, 1.5)
    left.push({ x: point.x - half, y: point.y })
    right.unshift({ x: point.x + half, y: point.y })
  }
  const trunk = smoothPath(left) + 'L' + smoothPath(right).slice(1) + 'Z'
  const roots = `M${round(rootX - 3)} ${round(rootY - 2)}q-3 3 -8 3.6M${round(rootX + 3)} ${round(rootY - 2)}q2 3.4 6 4.4`
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
      const part = 0.3 + (0.76 * fan) / count
      const rest = 1 - part
      const x = rest * rest * start.x + 2 * rest * part * control.x + part * part * end.x
      const y = rest * rest * start.y + 2 * rest * part * control.y + part * part * end.y
      const envelope = 0.7 + 0.3 * Math.sin((Math.PI * (fan + 0.5)) / (count + 1))
      needles += needleFan(x, y + 1.5 * hashUnit(fan, salt + index * 13), (9.5 + 2.5 * hashUnit(fan, salt + index * 17)) * envelope, salt + index * 31 + fan * 3)
    }
  })
  const tip = axis(1)
  needles += needleFan(tip.x, tip.y + 3, 10.5, salt + 201) + needleFan(tip.x - 8, tip.y + 7, 8.5, salt + 203) + needleFan(tip.x + 7.5, tip.y + 8, 8, salt + 205)
  const alpha = (part: number): number => round(part * share * 100) / 100
  return (
    `<path d="${trunk}" fill="${stock.ink}" fill-opacity="${alpha(0.9)}"/>` +
    `<path d="${limbs}${roots}" stroke="${stock.ink}" stroke-width="1.5" stroke-opacity="${alpha(0.9)}"/>` +
    `<path d="${needles}" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${alpha(0.86)}"/>`
  )
}

/** A sampan with one figure under a rain hat, poling: the thing that makes the bare paper under the far shore read as water. */
function sampan(x: number, y: number, stock: Stock, share: number): string {
  const alpha = (part: number): number => round(part * share * 100) / 100
  return (
    `<g class="boat"><path d="M${x - 16} ${y - 3}Q${x - 1} ${y + 5.2} ${x + 15} ${y - 2.2}Q${x - 1} ${y + 1.6} ${x - 16} ${y - 3}Z" fill="${stock.ink}" fill-opacity="${alpha(0.85)}"/>` +
    `<path d="M${x - 2} ${y + 0.6}q4.5 -7.4 10 -0.6M${x - 9.4} ${y - 0.4}l-0.5 -6.4M${x - 13.4} ${y - 6.4}l3.5 -2.6l3.6 2.6M${x - 8.6} ${y - 4.6}L${x - 25} ${y + 6.4}" stroke="${stock.ink}" stroke-width="1.05" stroke-opacity="${alpha(0.85)}"/>` +
    `<path d="M${x - 12} ${y + 7.6}h23M${x - 4} ${y + 11}h11" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${alpha(0.3)}"/></g>`
  )
}

/** A few level lines of water: fine, short, each bowed a hair. */
function waterLines(lines: Array<[number, number, number]>, stock: Stock): string {
  let d = ''
  for (const [x, y, length] of lines) d += `M${x} ${y}q${round(length / 4)} -1.1 ${round(length / 2)} 0t${round(length / 2)} 0`
  return `<path d="${d}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${round(0.3 * stock.line * 100) / 100}"/>`
}

/** The whole paper sheet on one stock. */
function paperSheet(stock: Stock, pineShare: number): string {
  const east = EAST.map(range => rangeMarkup(range, stock))
  const west = WEST.map(range => rangeMarkup(range, stock))
  const bank = EAST[4]
  const pineX = 1516
  const pineMarkup = bank ? brushPine(pineX, brushCrestY(bank, pineX) + 4, 104, -0.16, 41, stock, pineShare) : ''
  const mist = mistMaker(stock.sky)
  const band = mist.band

  const style = `
.drift{animation:drift 150s ease-in-out infinite alternate}
.flock{animation:glide 130s linear infinite;animation-delay:-30s}
.bob{animation:bob 6s ease-in-out infinite alternate}
.boat{animation:boat 110s ease-in-out infinite alternate}
@keyframes drift{from{transform:translateX(calc(var(--reach) * -1))}to{transform:translateX(var(--reach))}}
@keyframes glide{0%{transform:translate(-42px,14px);opacity:0}8%{opacity:1}82%{opacity:1}100%{transform:translate(228px,-76px);opacity:0}}
@keyframes bob{from{transform:translateY(-1.6px)}to{transform:translateY(1.8px)}}
@keyframes boat{from{transform:translate(-7px,0.4px)}to{transform:translate(9px,-0.4px)}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  const disc =
    (stock.halo > 0 ? `<circle cx="1452" cy="212" r="78" fill="url(#halo)"/>` : '') +
    `<circle cx="1452" cy="212" r="23" fill="${stock.disc}" fill-opacity="0.9"/>` +
    band(1442, 222, 66, 4.6, 14, 110, 20) +
    band(1470, 233, 40, 2.6, -10, 86, 50)

  // Built in drawing order, so that every band of mist has made its gradient before the defs are written.
  const drawing = `${disc}
${birds(stock)}
${east[0]?.markup ?? ''}${band(1560, 560, 170, 14, 30, 180, 80)}
${east[1]?.markup ?? ''}${band(1452, 548, 150, 11, 22, 120, 30)}${band(1480, 620, 240, 21, 46, 150, 40)}${band(1344, 672, 120, 8, -30, 190, 120)}
${east[2]?.markup ?? ''}${band(1520, 754, 222, 18, -40, 170, 70)}${band(1392, 792, 130, 8, 30, 130, 10)}
${east[3]?.markup ?? ''}${band(1440, 868, 214, 15, 36, 160, 100)}
${east[4]?.markup ?? ''}${pineMarkup}
${west[0]?.markup ?? ''}
${west[1]?.markup ?? ''}${band(262, 768, 200, 15, 34, 170, 60)}
${west[2]?.markup ?? ''}${band(214, 878, 190, 12, -30, 140, 90)}
${west[3]?.markup ?? ''}
${waterLines([[268, 918, 78], [322, 904, 34], [300, 932, 58], [366, 914, 26]], stock)}
${sampan(338, 892, stock, pineShare)}
${seal(218, 908, stock)}`

  const defs =
    mist.defs() +
    (stock.halo > 0 ? `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.disc}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.disc}" stop-opacity="0"/></radialGradient>` : '') +
    east.map(part => part.defs).join('') +
    west.map(part => part.defs).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${defs}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${paperOf(stock)}"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${drawing}
</g>
</svg>`
}

/** Ink Mountains on warm paper in dark ink, for a light window. */
export function daySvg(): string {
  return paperSheet(PAPER_DAY, 1)
}

/** Ink Mountains in pale warm-grey washes on warm near-black paper, under an amber moon, for a dark window. */
export function nightSvg(): string {
  return paperSheet(PAPER_NIGHT, 0.74)
}
