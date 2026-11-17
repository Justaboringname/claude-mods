// Ink Mountains at dusk: a shan shui sheet laid on a dusk sky instead of on paper.
// The drawing is the finer one: the massif on the right in five planes ("high distance"), a lower, longer and paler far shore on
// the left ("level distance"), forked spines and hatched shaded faces, tiny far-pines on the crags, a near bank with the lone pine,
// a skein of birds, a sampan and a few lines of water, a seal. The middle of the sheet is left empty for the conversation.
// The ground is the dusk sky after the Token Counter wallpaper (orange, wine, violet, and blue on one night stock).
//
// How the ink sits on the sky: a range is first a piece of sky in its own shape (so it hides what stands behind it), then ink
// laid over it with an alpha that is whole at the summits and gone at a level mist line. Nothing is ever mixed into a flat
// ground colour: every wash and line is alpha ink over the sky, and every "bare" mark (mist, the seal's cut) takes the sky's
// own colour at that place.
// Motion: bands of mist drift sideways very slowly, the birds glide, the boat rocks a few pixels; nothing else.
// Pure string building, no imports, the same string on every call.

const WIDTH = 1600
const HEIGHT = 1000
/** Where the app's prompt box lies across the foot of the sheet. */
const PROMPT_LEFT = 425
const PROMPT_RIGHT = 1370

/** One soft glow of colour in the sky: whole at its centre, gone at its radius. */
interface Glow {
  x: number
  y: number
  r: number
  colour: string
  alpha: number
}

/** The ground the mountains stand against: a vertical run of colours with glows laid over it. Its colours follow the wallpaper
 * of the person's Token Counter app (orange, wine, violet), mirrored so that the orange corner lies behind the disc on the right. */
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

type StockName = 'day' | 'dayVivid' | 'night' | 'nightBlue'

const STOCKS: Record<StockName, Stock> = {
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
}

interface Point {
  x: number
  y: number
}

/** One summit of a range. `left` and `right` are how far its flanks reach. A power above 1 gives that flank a hollow, pointed
 * profile, below 1 a bulging cliff; the two flanks have their own. `spur` is how far the spine leans per unit of its length (0 leaves it out). */
interface Peak {
  x: number
  top: number
  left: number
  right: number
  power: number
  powerRight: number
  spur: number
}

/** One range. `foot` is the level its flanks come down to, `mist` the level at which its wash has faded to bare sky.
 * `texture` is how densely its shaded faces are hatched, `trees` the share of the crest that carries tiny pines, `dots` the share
 * that carries moss dots, `hemp` how much of it trails long strokes down the slope. */
interface Range {
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
  dots: number
  hemp: number
  peaks: Peak[]
}

interface Built {
  defs: string
  markup: string
}

/** The box a shape lies in. */
interface Box {
  left: number
  right: number
  top: number
  bottom: number
}

function summit(x: number, top: number, left: number, right: number, power: number, powerRight: number, spur: number): Peak {
  return { x, top, left, right, power, powerRight, spur }
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
    name: 'd', salt: 9, foot: 1070, mist: 1046, wash: 0.5, line: 0.8, rough: 5, from: 1206, to: 1612, texture: 0, trees: 0, dots: 0.18, hemp: 0.6,
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

/** A kept shape painted with the sky, layer by layer: an opaque piece of sky in that shape. A range stands on one, so it hides what
 * is behind it and still fades into the same sky. A glow that does not reach the shape's box would paint nothing there, and is left out;
 * so is one whose very edge only grazes the box, changing no colour there by more than a fraction of one step of eight-bit colour. */
function skyPainted(id: string, box: Box, sky: Sky): string {
  let markup = `<use href="#${id}" fill="url(#sky)"/>`
  sky.glows.forEach((glow, index) => {
    const nearX = Math.min(box.right, Math.max(box.left, glow.x))
    const nearY = Math.min(box.bottom, Math.max(box.top, glow.y))
    const distance = Math.hypot(nearX - glow.x, nearY - glow.y)
    if (distance >= glow.r) return
    const under = channels(skyAt(sky, nearX, nearY))
    const over = channels(glow.colour)
    const most = Math.max(...over.map((value, at) => Math.abs(value - (under[at] ?? 0))))
    if (glow.alpha * falloffAt(distance / glow.r) * most < 0.6) return
    markup += `<use href="#${id}" fill="url(#glow${index})"/>`
  })
  return markup
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

/** Ink that is whole at `top` and gone at `bottom`: the paint of every pen line on a range, so lines dissolve into the mist as the wash does. */
function fadingInk(id: string, top: number, bottom: number, ink: string): string {
  return (
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(bottom)}">` +
    `<stop offset="0" stop-color="${ink}"/><stop offset="0.5" stop-color="${ink}" stop-opacity="0.72"/>` +
    `<stop offset="0.85" stop-color="${ink}" stop-opacity="0.16"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></linearGradient>`
  )
}

/** One summit's own height above the foot at x, sharp at the tip. */
function peakRise(range: Range, peak: Peak, x: number): number {
  const offset = Math.abs(x - peak.x) / (x < peak.x ? peak.left : peak.right)
  if (offset >= 1) return 0
  const soft = 0.05
  const distance = (Math.sqrt(offset * offset + soft * soft) - soft) / (Math.sqrt(1 + soft * soft) - soft)
  return (range.foot - peak.top) * Math.pow(1 - distance, x < peak.x ? peak.power : peak.powerRight)
}

/** The crest's y at x. The summits are blended with crisp saddles, then cragged: sharp sub-peaks, small notches, and bedded ledges,
 * all of which shrink to nothing where the range comes down to its foot. */
function crestY(range: Range, x: number): number {
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
function crestPoints(range: Range): Point[] {
  const all: Point[] = []
  for (let x = range.from; x <= range.to; x += 4) all.push({ x, y: crestY(range, x) })
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

/** Tiny pines standing along a crest in loose stands, in the shorthand for a far pine: a trunk hung with three tiers of boughs that
 * droop from it like the strokes of 个, the lowest the widest. (Level boughs read at this size as a cross or a mast, not a tree.) */
function pineMarks(range: Range): string {
  let d = ''
  let index = 0
  let x = range.from
  while (x < range.to) {
    x += 4 + hashUnit(index, range.salt + 51) * 6
    index += 1
    if (noise(x / 30, range.salt + 53) < 1 - range.trees) continue
    const y = crestY(range, x)
    // Well clear of the mist, where a half-faded pine reads as a stray glyph on a low cone.
    if (range.foot - y < 46 || y > range.mist - 56) continue
    // A pine wants a foothold: most stand on shoulders and summits, few on a cliff.
    const slope = (crestY(range, x + 4) - crestY(range, x - 4)) / 8
    if (hashUnit(index, range.salt + 55) > 0.1 + 0.9 / (1 + 0.32 * slope * slope)) continue
    const height = 4.5 + 7.5 * Math.pow(hashUnit(index, range.salt + 57), 1.4)
    const lean = (hashUnit(index, range.salt + 59) - 0.5) * 1.8
    const tip = { x: x + lean, y: y - height }
    d += `M${round(x)} ${round(y + 1)}L${round(tip.x)} ${round(tip.y)}`
    for (const [down, wide] of [[0.04, 0.16], [0.3, 0.27], [0.56, 0.38]] as Array<[number, number]>) {
      const at = { x: tip.x - lean * down, y: tip.y + (height + 1) * down }
      const half = height * wide
      const droop = half * 0.55
      d += `M${round(at.x - half)} ${round(at.y + droop)}L${round(at.x)} ${round(at.y)}L${round(at.x + half)} ${round(at.y + droop)}`
    }
  }
  return d
}

/** Moss dots: short dabs of dark ink in loose clusters on the crest, some a little below it. Only on the upper part of a range:
 * lower down the crest line has faded into the mist, and a dot there (heavier than the line) hangs in the air as a stray speck. */
function dotMarks(range: Range, top: number): string {
  let d = ''
  let index = 0
  let x = range.from
  while (x < range.to) {
    x += 2.4 + hashUnit(index, range.salt + 71) * 4.2
    index += 1
    if (noise(x / 13, range.salt + 73) < 1 - range.dots) continue
    const y = crestY(range, x)
    if (range.foot - y < 40 || y > top + 0.55 * (range.mist - top)) continue
    const size = 0.5 + 1.3 * hashUnit(index, range.salt + 77)
    d += `M${round(x)} ${round(y - 1 + hashUnit(index, range.salt + 75) * 5)}l${round(size * 0.5)} ${round(-size)}`
  }
  return d
}

/** Hemp-fibre strokes for an earthen bank: fine lines that hang a little below the crest and run down the fall of the slope,
 * two or three at a time side by side, the way a split brush lays them, so they read as the grain of the bank and not as scratches. */
function hempStrokes(range: Range): string {
  let d = ''
  let index = 0
  let x = range.from
  while (x < range.to) {
    x += 7 + hashUnit(index, range.salt + 31) * 10
    index += 1
    // Nothing busy right beside the prompt box (x 425..1370 near the foot of the sheet): the bank there keeps its wash and strata only.
    if (x > PROMPT_LEFT - 110 && x < PROMPT_RIGHT + 110) continue
    // The fibres hang from below the second line of strata, so that they never cross the strata in an X.
    const startY = crestY(range, x) + 2 * (10 + 10 * noise(x / 40, range.salt + 102)) + 3 + hashUnit(index, range.salt + 33) * 12
    const height = range.foot - startY
    if (height < 54) continue
    const fall = (crestY(range, x + 9) - crestY(range, x - 9)) / 18
    if (hashUnit(index, range.salt + 37) > (fall < 0 ? range.hemp * 0.5 : range.hemp)) continue
    const length = Math.min(58, height * (0.12 + 0.26 * hashUnit(index, range.salt + 41)))
    const lean = Math.max(-0.75, Math.min(0.75, fall * 0.6)) + (hashUnit(index, range.salt + 43) - 0.5) * 0.16
    // Across the stroke, one unit: the way its companions stand off from it.
    const norm = Math.hypot(lean, 1)
    const across = { x: 1 / norm, y: -lean / norm }
    const fibres = hashUnit(index, range.salt + 45) < 0.55 ? 3 : 2
    for (let fibre = 0; fibre < fibres; fibre += 1) {
      // The companions stand well off the first fibre and start lower and at different heights: set close and level, a bundle
      // reads as the mark of a claw.
      const offset = (fibre - (fibres - 1) / 2) * (5 + 2.5 * hashUnit(index * 3 + fibre, range.salt + 47))
      const stagger = fibre === Math.floor(fibres / 2) ? 0 : 3 + 8 * hashUnit(index * 3 + fibre, range.salt + 48)
      const fromX = x + across.x * offset
      const fromY = startY + across.y * offset + Math.abs(offset) * 0.6 + stagger
      const own = length * (fibre === Math.floor(fibres / 2) ? 1 : 0.5 + 0.35 * hashUnit(index * 3 + fibre, range.salt + 49))
      const along = (share: number): Point => ({ x: fromX + lean * own * Math.pow(share, 1.3), y: fromY + own * share })
      if (fromY < crestY(range, fromX) + 3) continue
      let reach = 1
      for (let share = 0.2; share < 1.01; share += 0.2) {
        const point = along(share)
        if (point.y < crestY(range, point.x) + 3) {
          reach = share - 0.2
          break
        }
      }
      if (reach < 0.39) continue
      const middle = along(reach / 2)
      const end = along(reach)
      // A hair of a wave: the middle pushed off the chord a little, alternately to either side.
      const sway = (fibre % 2 === 0 ? 1 : -1) * 1.1
      d += `M${round(fromX)} ${round(fromY)}Q${round(2 * middle.x - (fromX + end.x) / 2 + sway)} ${round(2 * middle.y - (fromY + end.y) / 2)} ${round(end.x)} ${round(end.y)}`
    }
  }
  return d
}

/** The second stroke of an earthen bank: the crest drawn again a little way down the slope, twice, in broken runs. */
function strataLines(range: Range): string {
  let d = ''
  for (let layer = 1; layer <= 2; layer += 1) {
    let run: Point[] = []
    for (let x = range.from; x <= range.to + 6; x += 6) {
      const crest = crestY(range, x)
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
    const y = crestY(range, x)
    if (range.foot - y < 40) continue
    const size = 3.4 + 3.6 * hashUnit(index, range.salt + 125)
    const root = `M${round(x)} ${round(y + 0.6)}`
    d += `${root}l${round(-size * 0.5)} ${round(-size * 0.75)}${root}l${round(size * 0.06)} ${round(-size)}${root}l${round(size * 0.55)} ${round(-size * 0.7)}`
  }
  return d
}

/** One summit's form: a spine running down from it and forking once, the face on the shaded side of the spine under a second wash,
 * and short texture strokes scattered down that face (and a few on the lit side), all falling the way the slope falls. */
function summitForm(range: Range, peak: Peak, index: number, stock: Stock): Built & { shaded: string; lit: string } {
  let summitX = peak.x
  let summitY = crestY(range, peak.x)
  for (let x = peak.x - 18; x <= peak.x + 18; x += 2) {
    const y = crestY(range, x)
    if (y < summitY) {
      summitY = y
      summitX = x
    }
  }
  const height = range.foot - summitY
  const seed = range.salt * 17 + index * 5
  const length = height * (0.48 + 0.16 * hashUnit(index, range.salt + 61))
  const endY = summitY + length
  const inside = (point: Point, margin: number): boolean => point.y >= crestY(range, point.x) + margin
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
    let y = crestY(range, x)
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
      `<path d="${lines}" stroke="url(#${id})" stroke-opacity="${round(ink * 92) / 100}"/>`,
    // The texture strokes are handed back bare: the range draws every summit's in one path (one ink, so the order does not matter).
    shaded,
    lit,
  }
}

/** A whole range. Its body is kept once and used several times: as a piece of the sky that hides what stands behind (one layer for the
 * sky's run of colours and one for each glow that reaches it), as the wash that fades to that sky at the mist line, and as the crest
 * line (whose ink fades out at the same level, so the body's sides and foot leave no line). The farthest range on each side has
 * nothing but sky behind it (the disc and the birds stay clear of it, gliding included), where a piece of sky would paint the very
 * colours already there; it is left out for that range alone, which costs nothing to the picture and saves work on every frame. */
function rangeMarkup(range: Range, stock: Stock, farthest: boolean): Built {
  const points = crestPoints(range)
  const first = points[0]
  const last = points[points.length - 1]
  if (!first || !last) return { defs: '', markup: '' }
  const box: Box = { left: first.x, right: last.x, top: range.foot, bottom: range.foot + 2 }
  for (const point of points) box.top = Math.min(box.top, point.y)
  const top = box.top
  // A far plane is a wash and nothing else. Pale ink on a dark sky shows about half as much as dark ink on a pale one, so by night
  // a far plane would all but vanish at the stock's own wash; there (and only for those line-less planes) it takes a little more.
  const share = range.wash * stock.wash * (range.line === 0 && stock.line < 1 ? 1.7 : 1)
  const ink = range.line * stock.line
  const alpha = (part: number): number => round(share * part * 1000) / 1000
  const body = `b${range.name}`
  const paint = `stroke="url(#s${range.name})"`
  let defs =
    `<linearGradient id="w${range.name}" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${range.mist}">` +
    `<stop offset="0" stop-color="${stock.ink}" stop-opacity="${alpha(1)}"/><stop offset="0.3" stop-color="${stock.ink}" stop-opacity="${alpha(0.8)}"/>` +
    `<stop offset="0.6" stop-color="${stock.ink}" stop-opacity="${alpha(0.42)}"/><stop offset="0.85" stop-color="${stock.ink}" stop-opacity="${alpha(0.1)}"/>` +
    `<stop offset="1" stop-color="${stock.ink}" stop-opacity="0"/></linearGradient>` +
    (range.line > 0 ? fadingInk(`s${range.name}`, top, range.mist, stock.ink) : '') +
    `<path id="${body}" d="${smoothPath(points)}V${range.foot + 2}H${round(first.x)}Z"/>`
  let markup = (farthest ? '' : skyPainted(body, box, stock.sky)) + `<use href="#${body}" fill="url(#w${range.name})"/>`
  let shaded = ''
  let lit = ''
  range.peaks.forEach((peak, index) => {
    if (peak.spur === 0) return
    const form = summitForm(range, peak, index, stock)
    defs += form.defs
    markup += form.markup
    shaded += form.shaded
    lit += form.lit
  })
  if (shaded) markup += `<path d="${shaded}" ${paint} stroke-width="0.85" stroke-opacity="${round(ink * 80) / 100}"/>`
  if (lit) markup += `<path d="${lit}" ${paint} stroke-width="0.8" stroke-opacity="${round(ink * 40) / 100}"/>`
  if (range.hemp > 0) {
    markup +=
      `<path d="${hempStrokes(range)}" ${paint} stroke-width="0.85" stroke-opacity="${round(ink * 72) / 100}"/>` +
      `<path d="${strataLines(range)}" ${paint} stroke-width="0.9" stroke-opacity="${round(ink * 55) / 100}"/>` +
      `<path d="${tuftMarks(range)}" ${paint} stroke-width="0.9" stroke-opacity="${round(Math.min(1, ink * 1.25) * 100) / 100}"/>`
  }
  if (range.line > 0) {
    markup += `<use href="#${body}" ${paint} stroke-width="0.9" stroke-opacity="${round(ink * 85) / 100}"/>`
    const pressed = pressedRuns(range, points)
    if (pressed) markup += `<path d="${pressed}" ${paint} stroke-width="1.7" stroke-opacity="${round(Math.min(1, ink * 1.05) * 100) / 100}"/>`
  }
  // The tiny pines and the moss dots are the crispest marks on a range; pale on a dark sky they would read as bright glyphs, so by
  // night they are let down a little, as the lone pine is.
  // The dots most of all: pale and round on a dark crest they string together like beads, so by night they are smaller and fainter.
  const night = stock.line < 1
  const carry = night ? 0.84 : 1
  if (range.trees > 0) markup += `<path d="${pineMarks(range)}" ${paint} stroke-width="0.95" stroke-opacity="${round(Math.min(1, ink * 1.4 * carry) * 100) / 100}"/>`
  if (range.dots > 0) markup += `<path d="${dotMarks(range, top)}" ${paint} stroke-width="${night ? 1.7 : 2.1}" stroke-opacity="${round(Math.min(1, ink * 1.35 * (night ? 0.74 : 1)) * 100) / 100}"/>`
  return { defs, markup }
}

/** Bands of mist: long soft lenses of bare sky that drift sideways and back. Each takes the sky's colour where it lies.
 * On a dark stock a band of bare sky across pale ink is a dark band, and a thin dark band reads as a stripe, not as mist; there
 * the bands are made deeper and fainter still, a veil that dims the ink rather than a ribbon that cuts it. The threads across the disc
 * keep the old, crisper profile: a thin line of cloud across the sun is meant to read as a line. */
function mistMaker(
  sky: Sky,
  dark: boolean,
): { band: (cx: number, cy: number, rx: number, ry: number, reach: number, seconds: number, delay: number, thread?: boolean) => string; defs: () => string } {
  const gradients: string[] = []
  return {
    band(cx, cy, rx, ry, reach, seconds, delay, thread = false) {
      const id = `m${gradients.length}`
      const colour = skyAt(sky, cx, cy)
      // A band's top and bottom edges are what make it vapour or a stripe: the old profile fell from 0.7 to 0.24 within a few
      // pixels, which by day drew a crisp pale seam across the peaks. The bands are now a little deeper with a long, even falloff.
      const depth = thread ? 1 : dark ? 1.45 : 1.3
      const strength = thread ? 1 : dark ? 0.72 : 0.94
      const profile: Array<[number, number]> = thread
        ? [[0, 0.88], [0.45, 0.7], [0.8, 0.24], [1, 0]]
        : [[0, 0.86], [0.22, 0.8], [0.45, 0.6], [0.68, 0.3], [0.86, 0.09], [1, 0]]
      const stop = (offset: number, opacity: number): string => `<stop offset="${offset}" stop-color="${colour}" stop-opacity="${round(opacity * strength * 100) / 100}"/>`
      gradients.push(`<radialGradient id="${id}">${profile.map(([offset, opacity]) => stop(offset, opacity)).join('')}</radialGradient>`)
      return `<ellipse class="drift" cx="${cx}" cy="${cy}" rx="${rx}" ry="${round(ry * depth)}" fill="url(#${id})" style="--reach:${reach}px;animation-duration:${seconds}s;animation-delay:-${delay}s"/>`
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

/** The lone pine: a tapered, leaning, bending trunk with two roots, a few boughs reaching out (longest on the leaning side),
 * flat pads of needle fans along them. */
function lonePine(rootX: number, rootY: number, height: number, lean: number, salt: number, stock: Stock): string {
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
  // Pale ink on a dark sky carries further than dark ink on a pale one: by night the pine is let down a little, so it stays the
  // nearest thing on the sheet without becoming the brightest.
  const share = stock.line < 1 ? 0.84 : 1
  return (
    `<path d="${trunk}" fill="${stock.ink}" fill-opacity="${round(0.9 * share * 100) / 100}"/>` +
    `<path d="${limbs}${roots}" stroke="${stock.ink}" stroke-width="1.5" stroke-opacity="${round(0.9 * share * 100) / 100}"/>` +
    `<path d="${needles}" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${round(Math.min(1, 0.86 * stock.line) * 100) / 100}"/>`
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
  return `<g class="flock" stroke="${stock.ink}" stroke-width="1.2" stroke-opacity="${round(Math.min(1, 0.78 * stock.line) * 100) / 100}">${marks}</g>`
}

/** A sampan with one figure under a rain hat, poling: the thing that makes the bare sky under the far shore read as water. */
function sampan(x: number, y: number, stock: Stock): string {
  const share = Math.min(1, stock.line)
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

/** A small plain seal: a vermilion square with two waves and a dot cut out of it. The cut shows the sky's colour at that place. */
function seal(x: number, y: number, stock: Stock): string {
  const bare = skyAt(stock.sky, x + 12, y + 12)
  return (
    `<g transform="translate(${x} ${y})" opacity="0.92"><rect width="24" height="24" rx="2.2" fill="${stock.seal}"/>` +
    `<path d="M5 12.4q3.5 -3.2 7 0t7 0M5 18q3.5 -3.2 7 0t7 0" stroke="${bare}" stroke-width="1.7"/>` +
    `<circle cx="16.4" cy="6.4" r="2.1" fill="${bare}"/></g>`
  )
}

/** The whole sheet on one stock. */
function sheet(stock: Stock): string {
  // The ranges are listed far to near on each side.
  const east = EAST.map((range, index) => rangeMarkup(range, stock, index === 0))
  const west = WEST.map((range, index) => rangeMarkup(range, stock, index === 0))
  const bank = EAST[4]
  const pineX = 1516
  const pineMarkup = bank ? lonePine(pineX, crestY(bank, pineX) + 4, 104, -0.16, 41, stock) : ''
  const mist = mistMaker(stock.sky, stock.wash < 1)
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

  // The disc hangs high on the right, inside the sky's orange glow, with two threads of mist across it.
  const disc =
    (stock.halo > 0 ? `<circle cx="1452" cy="212" r="78" fill="url(#halo)"/>` : '') +
    `<circle cx="1452" cy="212" r="23" fill="${stock.disc}" fill-opacity="0.9"/>` +
    band(1442, 222, 66, 4.6, 14, 110, 20, true) +
    band(1470, 233, 40, 2.6, -10, 86, 50, true)

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
${waterLines([[268, 918, 78], [322, 904, 34], [300, 932, 58], [356, 913, 22]], stock)}
${sampan(338, 892, stock)}
${seal(218, 908, stock)}`

  const defs =
    skyDefs(stock.sky) +
    mist.defs() +
    (stock.halo > 0 ? `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.disc}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.disc}" stop-opacity="0"/></radialGradient>` : '') +
    east.map(part => part.defs).join('') +
    west.map(part => part.defs).join('')

  // Each glow is painted only over the square it reaches (beyond its radius it is clear), which is the same sky for less work per frame.
  const reach = (glow: Glow): string => {
    const left = Math.max(0, Math.floor(glow.x - glow.r))
    const top = Math.max(0, Math.floor(glow.y - glow.r))
    const right = Math.min(WIDTH, Math.ceil(glow.x + glow.r))
    const bottom = Math.min(HEIGHT, Math.ceil(glow.y + glow.r))
    return `x="${left}" y="${top}" width="${right - left}" height="${bottom - top}"`
  }
  const sky = `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>` + stock.sky.glows.map((glow, index) => `<rect ${reach(glow)} fill="url(#glow${index})"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${defs}</defs>
${sky}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${drawing}
</g>
</svg>`
}

/** Ink Mountains on any of the dusk stocks. */
export function sceneSvg(stock: 'day' | 'dayVivid' | 'night' | 'nightBlue'): string {
  return sheet(STOCKS[stock])
}

/** Ink Mountains on the pale dusk sky, in dark violet ink, for a light window. */
export function daySvg(): string {
  return sheet(STOCKS.day)
}

/** Ink Mountains on the night sky that falls from orange through wine and violet into blue, in pale ink, for a dark window. */
export function nightSvg(): string {
  return sheet(STOCKS.nightBlue)
}
