// Moon Gate (月洞门框景): a corner of a Suzhou garden, drawn as fine ruled line (界画) with soft ink washes.
// A whitewashed wall stands in the right band under its coping of dark tiles: a ridge of tiles set on edge, the
// tiled slope ribbed by its troughs, and along the eave the round tile ends with a drip tile hanging between each pair.
// A round gate, trimmed with a band of polished grey brick, frames the view beyond: a Taihu rock, lean and full
// of holes, and a clump of bamboo whose crowns rise over the wall. The wall sinks into mist before it reaches the
// reading column. In the left band a low stretch of the same wall, with the leaves of banana plants behind it.
// Motion: the bamboo sways a little (each crown about a point hidden behind the wall, each twig about its node)
// and now and then a leaf drifts down in front of the wall. Nothing else moves. At rest one leaf hangs in the air
// before the wall and one lies at the foot of the gate.
// The ground is the dusk sky of Ink Mountains, so the two sheets are siblings.
// Pure string building, no imports, the same string on every call.

const WIDTH = 1600
const HEIGHT = 1000
/** The level both stretches of wall stand on. */
const GROUND = 832

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

/** A wash: a colour and how much of it is laid on. */
interface Paint {
  colour: string
  alpha: number
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
  /** The lime plaster of the wall, laid over the sky. */
  plaster: Paint
  /** The coping: the tiled slope, the channels between its rows of cover tiles, the tile ends along the eave, the ridge.
   * The slope's colour is also the sheet's shadow colour (under the eave, under a wall's foot, in the hollows of the rock): ink by day, near black by night. */
  tile: Paint
  row: Paint
  eave: Paint
  ridge: Paint
  /** The light caught by the tiles set on edge along the ridge. */
  glint: Paint
  /** How dark the old rain streaks under the eaves are, in the slope's colour. */
  stain: number
  /** How strongly the edges of the cover rows are drawn on the tiled slope. Faint at night, where pale lines on the dark tiles would read as a railing. */
  rib: number
  /** The polished grey brick round the gate. */
  brick: Paint
}

const STOCKS = {
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
    plaster: { colour: '#ffffff', alpha: 0.6 },
    tile: { colour: '#2b2338', alpha: 0.5 },
    row: { colour: '#2b2338', alpha: 0.24 },
    eave: { colour: '#2b2338', alpha: 0.72 },
    ridge: { colour: '#2b2338', alpha: 0.74 },
    glint: { colour: '#ffffff', alpha: 0.42 },
    stain: 0.075,
    rib: 0.5,
    brick: { colour: '#2b2338', alpha: 0.12 },
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
    ink: '#e4d4d8', disc: '#f79a4b', seal: '#b4472e', wash: 0.8, line: 0.8, halo: 0.14,
    plaster: { colour: '#e4d4d8', alpha: 0.12 },
    tile: { colour: '#0f090d', alpha: 0.5 },
    row: { colour: '#0f090d', alpha: 0.32 },
    eave: { colour: '#0f090d', alpha: 0.72 },
    ridge: { colour: '#0f090d', alpha: 0.68 },
    glint: { colour: '#e4d4d8', alpha: 0.2 },
    stain: 0.16,
    rib: 0.2,
    brick: { colour: '#0f090d', alpha: 0.3 },
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
    ink: '#dcd6e8', disc: '#f79a4b', seal: '#b4472e', wash: 0.8, line: 0.8, halo: 0.14,
    plaster: { colour: '#dcd6e8', alpha: 0.12 },
    tile: { colour: '#0b0a12', alpha: 0.5 },
    row: { colour: '#0b0a12', alpha: 0.32 },
    eave: { colour: '#0b0a12', alpha: 0.72 },
    ridge: { colour: '#0b0a12', alpha: 0.68 },
    glint: { colour: '#dcd6e8', alpha: 0.2 },
    stain: 0.16,
    rib: 0.2,
    brick: { colour: '#0b0a12', alpha: 0.3 },
  },
} as const satisfies Record<string, Stock>

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

/** The same, for a shape written once in the defs under `id`: each layer of sky is a <use> of it, so the long path is not written out again per layer. */
function skyPaintedUse(id: string, sky: Sky): string {
  return `<use href="#${id}" style="fill:url(#sky)"/>` + sky.glows.map((_, index) => `<use href="#${id}" style="fill:url(#glow${index})"/>`).join('')
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

function at(point: Point): string {
  return `${round(point.x)} ${round(point.y)}`
}

function midway(first: Point, second: Point): string {
  return `${round((first.x + second.x) / 2)} ${round((first.y + second.y) / 2)}`
}

/** A smooth open path through the midpoints of the points. */
function smoothPath(points: Point[]): string {
  const first = points[0]
  const second = points[1]
  const third = points[2]
  const last = points[points.length - 1]
  if (!first || !second || !last) return ''
  if (points.length < 4 || !third) return 'M' + points.map(at).join('L')
  let path = `M${at(first)}Q${at(second)} ${midway(second, third)}`
  for (let index = 2; index < points.length - 1; index += 1) {
    const here = points[index]
    const next = points[index + 1]
    if (here && next) path += `T${midway(here, next)}`
  }
  return `${path}T${at(last)}`
}

/** The same for a closed ring. A point given twice in a row makes a corner there. */
function smoothRing(points: Point[]): string {
  const count = points.length
  const closing = points[count - 1]
  let path = ''
  for (let index = 0; index < count; index += 1) {
    const here = points[index]
    const next = points[(index + 1) % count]
    if (!here || !next || !closing) continue
    if (index === 0) path = `M${midway(closing, here)}Q${at(here)} ${midway(here, next)}`
    else path += `T${midway(here, next)}`
  }
  return `${path}Z`
}

function alpha(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100
}

// ---------------------------------------------------------------------------------------------------------------
// The walls

/** A stretch of wall seen square on. It dissolves into the sky between `solid` and `clear`. */
interface Wall {
  name: string
  from: number
  to: number
  /** The level of the eave: the lower edge of the tiles. */
  eave: number
  scale: number
  solid: number
  clear: number
}

const GATE_WALL: Wall = { name: 'r', from: 1196, to: 1606, eave: 520, scale: 1, solid: 1332, clear: 1204 }
const LOW_WALL: Wall = { name: 'l', from: -6, to: 446, eave: 736, scale: 0.8, solid: 286, clear: 440 }

/** The gate: a full circle whose foot is cut by the sill. `drop` is how far its centre stands above the ground. */
const GATE = { x: 1446, drop: 96, r: 114, trim: 12 }

/** How a wall dissolves: slowly at first, slowly at last, so that no edge shows. */
const DISSOLVE: Array<[number, number]> = [[0, 0], [0.18, 0.05], [0.36, 0.22], [0.52, 0.48], [0.68, 0.74], [0.84, 0.93], [1, 1]]

/** Paints that fade out along a wall, one per colour: every wash and line of the wall is laid with them, so the whole wall dissolves together. */
function fadeMaker(wall: Wall): { paint: (colour: string) => string; defs: () => string } {
  const colours: string[] = []
  const defs: string[] = []
  return {
    paint(colour) {
      let index = colours.indexOf(colour)
      if (index < 0) {
        index = colours.length
        colours.push(colour)
        defs.push(
          `<linearGradient id="${wall.name}${index}" gradientUnits="userSpaceOnUse" x1="${wall.clear}" y1="0" x2="${wall.solid}" y2="0">` +
            DISSOLVE.map(([offset, share]) => `<stop offset="${offset}" stop-color="${colour}" stop-opacity="${share}"/>`).join('') +
            '</linearGradient>',
        )
      }
      return `url(#${wall.name}${index})`
    },
    defs: () => defs.join(''),
  }
}

/** The coping's parts, in the sheet's units on the near wall: the ridge, the tiled slope under it, and the spacing of the rows of cover tiles.
 * The gate (about 2.3 m across) sets the scale at about 100 units to the metre: a coping some 35 cm high, its cover rows 19 cm apart. */
const COPING = { ridge: 11, slope: 21, pitch: 19 }

/** The top of a wall's ridge. */
function copingTop(wall: Wall): number {
  return wall.eave - (COPING.ridge + COPING.slope) * wall.scale
}

/** The coping, top to bottom, as a Suzhou wall has it: a ridge of small tiles stood on edge and leaning all one way, under a fine capping line;
 * the tiled slope seen square on, the rows of cover tiles running down it as ribs with the dark channels of the pan tiles between them,
 * every cover tile lapping the one below; along the eave, under each channel, the pointed lip of a drip tile (滴水), and between them the small
 * rounded lip that closes each cover row (花边). Below, the shadow the eave throws and the two fine lines of a brick cornice.
 * Channels, rib edges and laps are dashes on straight lines, so the slope is a handful of paths; the lips are one path. */
function coping(wall: Wall, paint: (colour: string) => string, stock: Stock): string {
  const s = wall.scale
  const pitch = COPING.pitch * s
  const eaveY = wall.eave
  const foot = eaveY - COPING.slope * s
  const top = copingTop(wall)
  const channel = 0.42 * pitch
  const across = (y: number, from: number): string => `M${round(from)} ${round(y)}L${wall.to} ${round(y)}`
  const band = (upper: number, lower: number): string => `M${wall.from} ${round(upper)}L${wall.to} ${round(upper)}L${wall.to} ${round(lower)}L${wall.from} ${round(lower)}Z`
  const ink = paint(stock.ink)
  const line = (share: number): number => alpha(share * stock.line)
  // The shadow the coping throws on the plaster: a few thin bands, each fainter than the one above.
  let shadow = ''
  ;[0.09, 0.065, 0.04, 0.02].forEach((share, index) => {
    shadow += `<path d="${band(eaveY + index * 7 * s, eaveY + (index + 1) * 7 * s)}" fill="${paint(stock.tile.colour)}" fill-opacity="${share}"/>`
  })
  // The ridge's tiles on edge: one dashed line as tall as a tile, sheared about its own middle so that every dash leans to the right.
  const tickY = round(top + 6.4 * s)
  // The lips along the eave: a pointed drip tile under each channel, a small round lip under each cover row.
  let lips = ''
  for (let x = wall.from + channel / 2; x < wall.to + pitch; x += pitch) {
    const half = 0.3 * pitch
    const hang = 0.5 * pitch
    lips += `M${pack([x - half, eaveY - 0.6 * s])}q${pack([0.62 * half, 0.36 * hang, half, hang, 0.38 * half, -0.64 * hang, half, -hang])}z`
    const cover = x + pitch / 2
    const lip = 0.21 * pitch
    lips += `M${pack([cover - lip, eaveY - 0.6 * s])}q${pack([0, 1.3 * lip, lip, 1.3 * lip, lip, 0, lip, -1.3 * lip])}z`
  }
  return (
    shadow +
    // the slope, and its channels darker
    `<path d="${band(foot, eaveY)}" fill="${paint(stock.tile.colour)}" fill-opacity="${stock.tile.alpha}"/>` +
    `<path d="${across((foot + eaveY) / 2, wall.from)}" stroke="${paint(stock.row.colour)}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${stock.row.alpha}" stroke-linecap="butt" stroke-dasharray="${round(channel)} ${round(pitch - channel)}"/>` +
    // the edges of the cover rows, and the laps of their tiles
    `<path d="${across((foot + eaveY) / 2, wall.from - 0.4)}" stroke="${ink}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${line(stock.rib)}" stroke-linecap="butt" stroke-dasharray="0.8 ${round(channel - 0.8)} 0.8 ${round(pitch - channel - 0.8)}"/>` +
    [7.5, 14.5]
      .map(
        lap =>
          `<path d="${across(foot + lap * s, wall.from + channel + 1.2)}" stroke="${paint(stock.glint.colour)}" stroke-width="0.9" stroke-opacity="${alpha(stock.glint.alpha * 0.6)}" stroke-linecap="butt" stroke-dasharray="${round(pitch - channel - 2.4)} ${round(channel + 2.4)}"/>`,
      )
      .join('') +
    // the ridge: its body, its tiles on edge, the capping line, the course it stands on
    `<path d="${band(top, foot - 1.4 * s)}" fill="${paint(stock.ridge.colour)}" fill-opacity="${stock.ridge.alpha}"/>` +
    `<path d="M${round(wall.from + 1)} ${tickY}H${wall.to}" transform="matrix(1 0 .46 1 ${round(-0.46 * tickY)} 0)" stroke="${paint(stock.glint.colour)}" stroke-width="${round(5.6 * s)}" stroke-opacity="${stock.glint.alpha}" stroke-linecap="butt" stroke-dasharray=".9 ${round(4.4 * s - 0.9)}"/>` +
    `<path d="${band(top - 1.2 * s, top + 2.2 * s)}" fill="${ink}" fill-opacity="${line(0.82)}"/>` +
    `<path d="${across(foot - 0.6 * s, wall.from)}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.6)}"/>` +
    // the lips along the eave
    `<path d="${lips}" fill="${paint(stock.eave.colour)}" fill-opacity="${stock.eave.alpha}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${line(0.55)}"/>` +
    // the cornice under the eave
    `<path d="${across(eaveY + 13 * s, wall.from)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="${line(0.42)}"/>` +
    `<path d="${across(eaveY + 17 * s, wall.from)}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${line(0.26)}"/>`
  )
}

/** Old rain streaks on the plaster: where water ran off the eave for years it left soft grey runs, darkest just under the eave and dying away down the wall.
 * Each is [x, breadth, length]: a soft smudge, fading to nothing at its sides and its foot, two or three of them laid over one another where the run was heavy. */
function stains(wall: Wall, runs: Array<[number, number, number]>, stock: Stock): Built {
  const id = `st${wall.name}`
  const top = wall.eave + 2
  let markup = ''
  runs.forEach(([x, breadth, length], index) => {
    // A smudge is the upper half of a soft ellipse: its box reaches as far again below the run's foot.
    markup += `<rect x="${round(x - breadth / 2)}" y="${round(top)}" width="${round(breadth)}" height="${round(length * 2)}" fill="url(#${id})"/>`
    if (length > 50) {
      const shift = (hashUnit(index, 83) - 0.5) * breadth * 0.7
      markup += `<rect x="${round(x + shift - breadth * 0.22)}" y="${round(top)}" width="${round(breadth * 0.44)}" height="${round(length * 2.5)}" fill="url(#${id})"/>`
    }
  })
  const defs =
    `<radialGradient id="${id}" cx="0.5" cy="0" r="0.5">` +
    `<stop offset="0" stop-color="${stock.tile.colour}" stop-opacity="${alpha(stock.stain)}"/><stop offset="0.45" stop-color="${stock.tile.colour}" stop-opacity="${alpha(stock.stain * 0.55)}"/>` +
    `<stop offset="1" stop-color="${stock.tile.colour}" stop-opacity="0"/></radialGradient>`
  return { defs, markup }
}

/** A tuft of mondo grass (沿阶草): five blades out of one root, mostly upright, the clump leaning a little to one side. */
function tuft(x: number, y: number, size: number, salt: number): string {
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

/** A thin wash on the ground under a wall's foot, fading downward in two bands. */
function groundWash(wall: Wall, paint: (colour: string) => string, stock: Stock): string {
  const band = (upper: number, lower: number, share: number): string =>
    `<path d="M${wall.from} ${upper}L${wall.to} ${upper}L${wall.to} ${lower}L${wall.from} ${lower}Z" fill="${paint(stock.tile.colour)}" fill-opacity="${share}"/>`
  return band(GROUND, GROUND + 6, 0.07) + band(GROUND + 6, GROUND + 15, 0.032)
}

/** The plinth (勒脚) along a wall's foot: a band of grey rendering, a little darker than the plaster, under a fine line where the plaster stops.
 * `gap` is the stretch the gate cuts out of it, and `hole` the gate's opening as a subpath, so the band stops at the gate. */
function plinth(wall: Wall, paint: (colour: string) => string, stock: Stock, gap?: [number, number], hole = ''): string {
  const top = GROUND - 30 * wall.scale
  const ink = paint(stock.ink)
  const edge = gap
    ? `M${wall.from} ${round(top)}L${round(gap[0])} ${round(top)}M${round(gap[1])} ${round(top)}L${wall.to} ${round(top)}`
    : `M${wall.from} ${round(top)}L${wall.to} ${round(top)}`
  return (
    `<path fill-rule="evenodd" d="M${wall.from} ${round(top)}L${wall.to} ${round(top)}L${wall.to} ${GROUND}L${wall.from} ${GROUND}Z${hole}" fill="${paint(stock.tile.colour)}" fill-opacity="${alpha(stock.stain * 0.85)}"/>` +
    `<path d="${edge}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${alpha(0.3 * stock.line)}"/>`
  )
}

/** The wall with the gate in it. It is painted over the bamboo and the rock, so they show only through the gate and over the coping. */
function gateWall(stock: Stock): Built {
  const wall = GATE_WALL
  const fade = fadeMaker(wall)
  const ink = fade.paint(stock.ink)
  const top = copingTop(wall) - 1.5
  const rim = GATE.r + GATE.trim
  const inner = Math.sqrt(GATE.r * GATE.r - GATE.drop * GATE.drop)
  const arc =(radius: number): string => {
    const half = Math.sqrt(radius * radius - GATE.drop * GATE.drop)
    return `M${round(GATE.x - half)} ${GROUND}A${radius} ${radius} 0 1 1 ${round(GATE.x + half)} ${GROUND}`
  }
  // The opening runs the other way round, so it is a hole under either fill rule.
  const hole = `M${round(GATE.x + inner)} ${GROUND}A${GATE.r} ${GATE.r} 0 1 0 ${round(GATE.x - inner)} ${GROUND}Z`
  const frame = (from: number, y: number): string => `M${from} ${round(y)}L${wall.to} ${round(y)}L${wall.to} ${GROUND}L${from} ${GROUND}Z${hole}`
  const line = (share: number): number => alpha(share * stock.line)
  const streaks = stains(wall, [[1352, 22, 64], [1394, 12, 40], [1476, 28, 66], [1533, 16, 100], [1586, 24, 150]], stock)
  // The plinth stops at the gate's trim: only the slice of the trim's circle that falls within the plinth's height is cut out of it.
  const plinthTop = GROUND - 30 * wall.scale
  const plinthReach = Math.sqrt(rim * rim - (plinthTop - (GROUND - GATE.drop)) ** 2)
  const footReach = Math.sqrt(rim * rim - GATE.drop * GATE.drop)
  const plinthCut =
    `M${round(GATE.x - plinthReach)} ${round(plinthTop)}A${rim} ${rim} 0 0 0 ${round(GATE.x - footReach)} ${GROUND}` +
    `L${round(GATE.x + footReach)} ${GROUND}A${rim} ${rim} 0 0 0 ${round(GATE.x + plinthReach)} ${round(plinthTop)}Z`

  let markup =
    // a piece of sky in the wall's shape (only as far left as anything stands behind it), the plaster over it
    `<g fill-rule="evenodd">${skyPaintedUse('wf', stock.sky)}<path d="${frame(wall.from, wall.eave - 3)}" fill="${fade.paint(stock.plaster.colour)}" fill-opacity="${stock.plaster.alpha}"/></g>` +
    streaks.markup +
    plinth(wall, fade.paint, stock, [GATE.x - plinthReach, GATE.x + plinthReach], plinthCut) +
    coping(wall, fade.paint, stock)

  // The trim of polished brick: a band round the opening, a fine moulding line inside it, its joints as short radial ticks.
  const band = `${arc(rim)}L${round(GATE.x + inner)} ${GROUND}A${GATE.r} ${GATE.r} 0 1 0 ${round(GATE.x - inner)} ${GROUND}Z`
  const jointRadius = GATE.r + GATE.trim / 2 + 1.6
  // The underside of the wall's thickness at the top of the opening: seen from below, a crescent of shadow inside the rim, thickest at the crown.
  const centreY = GROUND - GATE.drop
  const soffit = 5
  const meet = Math.sqrt(GATE.r * GATE.r - (soffit / 2) * (soffit / 2))
  const farEdge = `A${GATE.r} ${GATE.r} 0 0 0 ${round(GATE.x - meet)} ${round(centreY + soffit / 2)}`
  markup +=
    `<path d="${band}" fill="${stock.brick.colour}" fill-opacity="${stock.brick.alpha}"/>` +
    `<path d="M${round(GATE.x - meet)} ${round(centreY + soffit / 2)}A${GATE.r} ${GATE.r} 0 1 1 ${round(GATE.x + meet)} ${round(centreY + soffit / 2)}${farEdge}Z" fill="${stock.tile.colour}" fill-opacity="0.3"/>` +
    `<path d="M${round(GATE.x + meet)} ${round(centreY + soffit / 2)}${farEdge}" stroke="${stock.ink}" stroke-width="0.6" stroke-opacity="${line(0.32)}"/>` +
    `<path d="${arc(jointRadius)}" stroke="${stock.ink}" stroke-width="${round(GATE.trim - 4.4)}" stroke-opacity="${line(0.34)}" stroke-linecap="butt" stroke-dasharray="0.7 ${round((jointRadius * Math.PI * 2) / 40 - 0.7)}" stroke-dashoffset="-6"/>` +
    `<path d="${arc(GATE.r + 3.4)}" stroke="${stock.ink}" stroke-width="0.7" stroke-opacity="${line(0.5)}"/>` +
    `<path d="${arc(rim)}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${line(0.72)}"/>` +
    `<path d="${arc(GATE.r)}" stroke="${stock.ink}" stroke-width="1.5" stroke-opacity="${line(0.92)}"/>`

  // The ground the wall stands on (a thin wash under its foot), grass, a few dry strokes of the ground in front.
  markup +=
    groundWash(wall, fade.paint, stock) +
    `<path d="M${wall.from} ${GROUND}L${wall.to} ${GROUND}" stroke="${ink}" stroke-width="1.2" stroke-opacity="${line(0.8)}"/>` +
    `<path d="${tuft(1349, GROUND, 11, 5)}${tuft(1357, GROUND, 7, 6)}${tuft(1582, GROUND, 9, 9)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="${line(0.7)}"/>` +
    `<path d="M1284 ${GROUND + 11}L1340 ${GROUND + 11}M1420 ${GROUND + 15}L1476 ${GROUND + 15}M1540 ${GROUND + 10}L1600 ${GROUND + 10}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.24)}"/>`

  return { defs: fade.defs() + streaks.defs + `<path id="wf" fill-rule="evenodd" d="${frame(1284, top)}"/>`, markup }
}

/** The low stretch of the same wall in the left band: plaster, coping, ground. Nothing stands behind it, so it needs no sky of its own. */
function lowWall(stock: Stock): Built {
  const wall = LOW_WALL
  const fade = fadeMaker(wall)
  const ink = fade.paint(stock.ink)
  const line = (share: number): number => alpha(share * stock.line)
  const streaks = stains(wall, [[240, 18, 46], [322, 24, 62], [368, 12, 30]], stock)
  const markup =
    `<path d="M${wall.from} ${wall.eave - 3}L${wall.to} ${wall.eave - 3}L${wall.to} ${GROUND}L${wall.from} ${GROUND}Z" fill="${fade.paint(stock.plaster.colour)}" fill-opacity="${stock.plaster.alpha}"/>` +
    streaks.markup +
    plinth(wall, fade.paint, stock) +
    coping(wall, fade.paint, stock) +
    groundWash(wall, fade.paint, stock) +
    `<path d="M${wall.from} ${GROUND}L${wall.to} ${GROUND}" stroke="${ink}" stroke-width="1.1" stroke-opacity="${line(0.75)}"/>` +
    `<path d="${tuft(228, GROUND, 9, 21)}${tuft(352, GROUND, 9, 23)}${tuft(359, GROUND, 6, 24)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="${line(0.7)}"/>` +
    `<path d="M214 ${GROUND + 11}L282 ${GROUND + 11}M330 ${GROUND + 16}L388 ${GROUND + 16}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.22)}"/>`
  return { defs: fade.defs() + streaks.defs, markup }
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

// Pale culms first: they stand further back. They rise in two close groups and part as they climb; the clump leans to the left, toward the open sky,
// its tallest culm arching out over the wall, the others stepping down to the right, so the crowns make no level hedge along the coping.
const CULMS: Culm[] = [
  { x: 1486, y: 824, height: 404, lean: 6, bend: -11, girth: 1.8, joint: 1, reach: 32, blade: 26.4, tone: 0.46, salt: 37, pivot: 580, crown: 500, low: [[5, -1]], sparse: 0.25 },
  { x: 1410, y: 822, height: 466, lean: -70, bend: 12, girth: 1.7, joint: 1, reach: 33, blade: 27.5, tone: 0.55, salt: 11, pivot: 580, crown: 500, low: [[7, -1]], sparse: 0.3 },
  { x: 1451, y: 823, height: 512, lean: -30, bend: 3, girth: 2, joint: 1, reach: 34, blade: 28.6, tone: 0.66, salt: 23, pivot: 580, crown: 500, low: [[5, 1]], sparse: 0.3 },
  { x: 1497, y: 826, height: 430, lean: 30, bend: 11, girth: 1.9, joint: 1, reach: 34, blade: 28.6, tone: 0.84, salt: 53, pivot: 580, crown: 500, low: [[4, 1]], sparse: 0.2 },
  { x: 1444, y: 825, height: 556, lean: -100, bend: -8, girth: 2.3, joint: 1, reach: 36, blade: 29.7, tone: 0.94, salt: 41, pivot: 580, crown: 488, low: [[7, 1]], sparse: 0.35 },
  { x: 1471, y: 827, height: 128, lean: 30, bend: 3, girth: 1.2, joint: 0.56, reach: 24, blade: 23.1, tone: 0.9, salt: 67, pivot: 0, crown: 790, low: [], sparse: 0 },
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

/** The clump: each culm as a column of internodes, its twigs as paths that sway about their nodes, and the crown of a tall culm as a group that sways about a point behind the wall. */
function bamboo(stock: Stock): string {
  let markup = ''
  CULMS.forEach((culm, order) => {
    const nodes = culmNodes(culm)
    let lower = ''
    let upper = ''
    let lowerTwigs = ''
    let upperTwigs = ''
    const isUpper = (share: number): boolean => culm.pivot === 0 || culmPoint(culm, share).y < culm.pivot
    for (let index = 1; index < nodes.length; index += 1) {
      const from = nodes[index - 1] ?? 0
      const to = nodes[index] ?? 1
      if (isUpper((from + to) / 2)) upper += internode(culm, from, to)
      else lower += internode(culm, from, to)
    }
    const swaying = (d: string, origin: Point, salt: number, lively: number): string => {
      const turn = round((1.6 + 1.8 * hashUnit(1, salt)) * lively)
      const seconds = round(4.6 + 4.2 * hashUnit(2, salt))
      return `<path class="sw" style="--a:${turn}deg;transform-origin:${round(origin.x)}px ${round(origin.y)}px;animation-duration:${seconds}s;animation-delay:-${round(hashUnit(3, salt) * 9)}s" d="${d}"/>`
    }
    const tip = culmPoint(culm, 1)
    const crownTop = culmPoint(culm, 0).y - culm.height * 0.95
    for (let index = 1; index < nodes.length - 1; index += 1) {
      const share = nodes[index] ?? 0
      const node = culmPoint(culm, share)
      const listed = culm.low.find(entry => entry[0] === index)
      if (node.y > culm.crown && !listed) continue
      if (!listed && hashUnit(index, culm.salt + 77) < culm.sparse) continue
      const side = listed ? listed[1] : (index + culm.salt) % 2 === 0 ? 1 : -1
      // How far up the crown this node sits: twigs and leaves grow smaller toward the tip.
      const high = listed ? 0.3 : Math.min(1, Math.max(0, (culm.crown - node.y) / (culm.crown - crownTop)))
      const length = culm.reach * (1 - 0.45 * high) * (0.86 + 0.28 * hashUnit(index, culm.salt + 5))
      const piece = swaying(twig(node, side, length, culm.blade * (1 - 0.18 * high), culm.salt * 31 + index, listed ? 0 : high), node, culm.salt * 17 + index, 1)
      if (isUpper(share)) upperTwigs += piece
      else lowerTwigs += piece
    }
    // The tip: a last small group that carries on the way the culm leans.
    upperTwigs += swaying(spray(tip, culm.lean < 0 ? 158 : 22, 3, culm.blade * 0.78, culm.salt * 13) + leaf(tip.x, tip.y, ((culm.lean < 0 ? -112 : -68) * Math.PI) / 180, culm.blade * 0.5, 1.6), tip, culm.salt * 19, 1.2)

    const tone = culm.tone * stock.line
    const leaves = `fill="${stock.ink}" fill-opacity="${alpha(tone * 0.92)}"`
    const stem = (d: string): string => (d ? `<path d="${d}" fill="${stock.ink}" fill-opacity="${alpha(tone * 0.7)}"/>` : '')
    const origin = culm.pivot === 0 ? { x: culm.x, y: culm.y } : { x: culmPoint(culm, (culm.y - culm.pivot) / culm.height).x, y: culm.pivot }
    const seconds = round(9 + 6 * hashUnit(order, 97))
    const turn = culm.pivot === 0 ? 0.9 : 0.5
    markup +=
      stem(lower) +
      (lowerTwigs ? `<g ${leaves}>${lowerTwigs}</g>` : '') +
      `<g class="cr" style="--a:${turn}deg;transform-origin:${round(origin.x)}px ${round(origin.y)}px;animation-duration:${seconds}s;animation-delay:-${round(hashUnit(order, 99) * 12)}s">${stem(upper)}<g ${leaves}>${upperTwigs}</g></g>`
  })
  return markup
}

// ---------------------------------------------------------------------------------------------------------------
// The Taihu rock

/** A knot of an outline, in the rock's own units (x to the right, y upward from its foot as a negative number). A third number makes a corner of it. */
type Knot = [number, number] | [number, number, number]

// Lean (瘦): a tall standing stone, narrow at the foot and heavy at the head, that winds like an S as water wore it:
// swells and ledges low on the left, a waist pinched from both sides, a chest swelling to the left, a belly to the right, and a head that hangs over to the right.
// The outline runs smoothly through these knots, clockwise from the left of the foot; its corners are where two lobes meet or a ledge breaks off.
const ROCK_OUTLINE: Knot[] = [
  [-8, 0, 1], [-11, -6], [-8, -14, 1], [-13, -22], [-19, -30], [-18, -38], [-12, -44, 1], [-16, -52], [-22, -58], [-20, -66, 1],
  [-13, -70], [-17, -78], [-27, -84], [-33, -92], [-36, -102], [-33, -112, 1], [-38, -118], [-40, -128], [-34, -136, 1], [-38, -144],
  [-37, -154], [-29, -162], [-20, -164, 1], [-12, -171], [-1, -174], [8, -178], [18, -175, 1], [24, -170], [33, -168], [40, -160],
  [42, -150], [37, -142, 1], [30, -138], [25, -130], [28, -122], [34, -114], [35, -104], [29, -96, 1], [22, -90], [24, -82],
  [21, -74, 1], [15, -66], [18, -58], [25, -50], [27, -40], [22, -32, 1], [18, -24], [19, -14], [14, -6], [13, 0, 1],
]

// Pierced (透): the holes that go right through: a large one in the chest, one in the head that leaves only a thin bridge of stone at its edge,
// a long one slanting through the belly and a small one by the waist. Each is irregular, with a corner or two where it broke.
const ROCK_HOLES: Knot[][] = [
  [[-27, -104], [-24, -113, 1], [-15, -118], [-7, -113], [-4, -106], [-9, -101, 1], [-12, -95], [-20, -93]],
  [[20, -159], [26, -164, 1], [34, -161], [36, -153], [31, -149, 1], [24, -151]],
  [[6, -45], [8, -55, 1], [15, -59], [19, -53], [15, -45, 1], [10, -38]],
  [[-10, -78], [-6, -84, 1], [-1, -81], [-3, -75]],
]

// Hollowed (漏): pockets that do not go through: a crevice slanting down the left of the head, and a pocket low on the left.
// No two openings sit level with one another, so the stone never makes a face.
const ROCK_HOLLOWS: Knot[][] = [
  [[-33, -147], [-30, -151, 1], [-26, -144], [-22, -135], [-22, -129, 1], [-27, -134]],
  [[-13, -27], [-10, -34, 1], [-6, -32], [-3, -26], [-7, -19, 1], [-11, -21]],
]

// Wrinkled (皱): folds that run in from where two lobes meet and sweep round the swellings, toward a hole or out to nothing.
const ROCK_FOLDS: Knot[][] = [
  [[-33, -112], [-26, -117], [-18, -123], [-9, -126], [-1, -123]],
  [[37, -142], [28, -143], [18, -146], [11, -153], [7, -163]],
  [[21, -74], [13, -72], [5, -67], [-3, -62], [-8, -55]],
  [[29, -96], [20, -95], [12, -99], [6, -107], [4, -116]],
  [[-12, -44], [-5, -42], [0, -35], [1, -27], [-1, -18]],
  [[-20, -66], [-13, -63], [-7, -59]],
  [[-20, -164], [-14, -158], [-5, -156]],
]

/** The rock standing at (x, y): a piece of sky in its shape (so that it hides the bamboo behind it, which still shows through its holes),
 * a wash that deepens toward its shaded side, under the upper lip of every hole the dark of the stone's thickness, the dark of every pocket
 * (dark on every sheet, night too), broken strokes that follow the outline a little way inside its shaded side, folds, a low stone and dabs of moss at its foot. */
function rock(x: number, y: number, scale: number, stock: Stock): Built {
  const place = (knot: Knot): Point => ({ x: round(x + knot[0] * scale), y: round(y + knot[1] * scale) })
  const ring = (knots: Knot[]): string => {
    const points: Point[] = []
    for (const knot of knots) {
      points.push(place(knot))
      if (knot[2]) points.push(place(knot))
    }
    return smoothRing(points)
  }
  /** What shows through a hole: its mouth drawn in and set toward the lower right, so that inside the mouth a crescent of the stone's
   * inner wall stays in shadow along the upper left, thick at the top and gone at the bottom, the way a hole bored through at a slant is seen. */
  const throat = (knots: Knot[], share: number): Knot[] => {
    let centreX = 0
    let centreY = 0
    for (const knot of knots) {
      centreX += knot[0] / knots.length
      centreY += knot[1] / knots.length
    }
    let reachX = 0
    let reachY = 0
    for (const knot of knots) {
      reachX = Math.max(reachX, Math.abs(knot[0] - centreX))
      reachY = Math.max(reachY, Math.abs(knot[1] - centreY))
    }
    return knots.map((knot): Knot => [
      centreX + (knot[0] - centreX) * share + (1 - share) * 0.5 * reachX,
      centreY + (knot[1] - centreY) * share + (1 - share) * 0.66 * reachY,
      knot[2] ?? 0,
    ])
  }
  const outline = ring(ROCK_OUTLINE)
  const throats = ROCK_HOLES.map(hole => throat(hole, 0.72))
  const mouths = ROCK_HOLES.map(ring).join('')
  const through = throats.map(ring).join('')
  const hollows = ROCK_HOLLOWS.map(ring).join('')
  const stone = ring([[18, 0, 1], [19, -6], [24, -10], [31, -8], [35, -3], [36, 0, 1]])
  const shape = outline + through + stone
  // The faces that look right or down are in shade. Along them the outline is drawn again just inside, heavier, so the contour swells
  // on the shaded side and thins on the lit one; and a little further in, a few short texture strokes (皴) of uneven length and depth,
  // each on its own, none touching a hole.
  const openings = ROCK_HOLES.concat(ROCK_HOLLOWS)
  const knots = ROCK_OUTLINE
  const faces = knots.map((here, index) => {
    const before = knots[(index + knots.length - 1) % knots.length] ?? here
    const after = knots[(index + 1) % knots.length] ?? here
    const tx = after[0] - before[0]
    const ty = after[1] - before[1]
    const length = Math.hypot(tx, ty) || 1
    const outX = ty / length
    const outY = -tx / length
    return { here, outX, outY, shaded: (outX > 0.3 || outY > 0.45) && here[1] < -6 }
  })
  const insetAt = (index: number, depth: number): Point | null => {
    const face = faces[index]
    if (!face || !face.shaded) return null
    const point: Knot = [face.here[0] - face.outX * depth, face.here[1] - face.outY * depth]
    if (openings.some(opening => opening.some(corner => Math.hypot(corner[0] - point[0], corner[1] - point[1]) < 5))) return null
    return { x: round(x + point[0] * scale), y: round(y + point[1] * scale) }
  }
  const strokeThrough = (points: Point[]): string => {
    const [first, middle, last] = points
    if (!first || !middle) return ''
    return last ? `M${at(first)}Q${at(middle)} ${at(last)}` : `M${at(first)}L${at(middle)}`
  }
  let contour = ''
  let run: Point[] = []
  for (let index = 0; index <= knots.length; index += 1) {
    const point = index < knots.length ? insetAt(index, 0.7) : null
    if (point) run.push(point)
    else {
      if (run.length > 2) contour += smoothPath(run)
      run = []
    }
  }
  // The shade itself: along every shaded face a band of wash that runs in from the edge, laid twice, the second band narrower, so it deepens toward the edge.
  const shadeBand = (depth: number): string => {
    let d = ''
    let outer: Point[] = []
    let inner: Point[] = []
    const close = (): void => {
      if (outer.length > 2) d += smoothPath(outer) + smoothPath(inner.slice().reverse()).replace('M', 'L') + 'Z'
      outer = []
      inner = []
    }
    faces.forEach(face => {
      if (!face.shaded) return close()
      const deep = depth * (0.7 + 0.6 * noise(face.here[1] / 14, 317))
      outer.push({ x: x + face.here[0] * scale, y: y + face.here[1] * scale })
      inner.push({ x: x + (face.here[0] - face.outX * deep) * scale, y: y + (face.here[1] - face.outY * deep) * scale })
    })
    close()
    return d
  }
  let texture = ''
  for (let index = 0; index < knots.length; ) {
    if (!faces[index]?.shaded || hashUnit(index, 301) < 0.3) {
      index += 1
      continue
    }
    const span = hashUnit(index, 303) < 0.45 ? 1 : 2
    const depth = 2.6 + 3.4 * hashUnit(index, 307)
    const points: Point[] = []
    for (let step = 0; step <= span; step += 1) {
      const point = insetAt(index + step, depth + (step - span / 2) * 1.4 * (hashUnit(index, 311) - 0.5))
      if (!point) break
      points.push(point)
    }
    texture += strokeThrough(points)
    index += span + 1 + (hashUnit(index, 313) < 0.5 ? 1 : 0)
  }
  let creases = ''
  for (const fold of ROCK_FOLDS) creases += smoothPath(fold.map(place))
  let moss = ''
  const dabs: Knot[] = [[-11, -3], [-7, -1], [-3, -2], [11, -2], [23, -8], [27, -7], [31, -5], [-9, -8], [9, -7]]
  dabs.forEach((dab, index) => {
    const point = place(dab)
    moss += `M${at(point)}l${round(0.6 + hashUnit(index, 7))} ${round(-1.5 - 1.5 * hashUnit(index, 9))}`
  })
  const wash = (share: number): number => alpha(share * stock.wash)
  const line = (share: number): number => alpha(share * stock.line)
  // At night the shadow colour is near black and the ink is pale.
  const night = stock.tile.colour !== stock.ink
  const defs =
    // The light falls from the upper left. By day the ink is dark, so the wash deepens toward the lower right; at night the ink is pale moonlight, so it is laid the other way round.
    `<linearGradient id="rk" gradientUnits="userSpaceOnUse" x1="${round(x - 34 * scale)}" y1="${round(y - 150 * scale)}" x2="${round(x + 30 * scale)}" y2="${round(y - 10 * scale)}">` +
    `<stop offset="0" stop-color="${stock.ink}" stop-opacity="${wash(night ? 0.3 : 0.05)}"/><stop offset="1" stop-color="${stock.ink}" stop-opacity="${wash(night ? 0.05 : 0.3)}"/></linearGradient>`
  const markup =
    `<g fill-rule="evenodd">${skyPaintedUse('rs', stock.sky)}<use href="#rs" fill="url(#rk)"/>` +
    `<g clip-path="url(#rc)" fill="${stock.tile.colour}" fill-opacity="${alpha(stock.stain * 0.9)}"><path d="${shadeBand(9)}"/><path d="${shadeBand(4)}"/></g>` +
    `<path d="${mouths + through}" fill="${stock.tile.colour}" fill-opacity="0.5"/>` +
    `<path d="${hollows}" fill="${stock.tile.colour}" fill-opacity="0.4"/></g>` +
    `<path d="${through}" stroke="${stock.ink}" stroke-width="0.6" stroke-opacity="${line(0.42)}"/>` +
    `<path d="${mouths + hollows}" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${line(0.8)}"/>` +
    `<path d="${texture}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${line(0.46)}"/>` +
    `<path d="${creases}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${line(0.5)}"/>` +
    `<path d="${contour}" stroke="${stock.ink}" stroke-width="1.9" stroke-opacity="${line(0.5)}"/>` +
    `<path d="${outline + stone}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${line(0.88)}"/>` +
    `<path d="${moss}" stroke="${stock.ink}" stroke-width="1.6" stroke-opacity="${line(0.8)}"/>`
  return { defs: defs + `<path id="rs" fill-rule="evenodd" clip-rule="evenodd" d="${shape}"/><clipPath id="rc"><use href="#rs"/></clipPath>`, markup }
}

// ---------------------------------------------------------------------------------------------------------------
// The banana plant

/** One banana leaf: its midrib from the stalk through a bend to the tip, half its breadth, and how much of that shows on either side
 * of the midrib (`plus` is the side to the right of the way the leaf runs): a leaf seen at a slant shows one half narrow. */
interface Frond {
  from: Point
  bend: Point
  to: Point
  half: number
  plus: number
  minus: number
  salt: number
  tone: number
}

// Two plants stand behind the low wall; their leaves rise over its ridge, and one hangs its tip down in front of the coping.
// Every leaf starts at the ridge, where its stalk comes out from behind the wall.
const FRONDS: Frond[] = [
  // the smaller plant, leaning left toward the sidebar
  { from: { x: 238, y: 711 }, bend: { x: 230, y: 652 }, to: { x: 186, y: 620 }, half: 17, plus: 0.55, minus: 1, salt: 5, tone: 0.72 },
  // arching to the left
  { from: { x: 296, y: 711 }, bend: { x: 268, y: 606 }, to: { x: 220, y: 642 }, half: 21, plus: 0.52, minus: 1, salt: 9, tone: 0.86 },
  // the tall one
  { from: { x: 300, y: 711 }, bend: { x: 296, y: 634 }, to: { x: 334, y: 566 }, half: 23, plus: 1, minus: 0.6, salt: 17, tone: 1 },
  // arching to the right and over the wall
  { from: { x: 304, y: 711 }, bend: { x: 360, y: 596 }, to: { x: 394, y: 744 }, half: 20, plus: 0.5, minus: 1, salt: 13, tone: 0.92 },
]

/** A colour laid over another, as a wash would be. */
function mixed(under: string, over: string, share: number): string {
  const a = channels(under)
  const b = channels(over)
  return '#' + a.map((value, index) => Math.round(value + ((b[index] ?? 0) - value) * share).toString(16).padStart(2, '0')).join('')
}

/** The pale ground of the plant's leaves and stem: the sky there with a breath of the wall's plaster in it, so that they hide what is behind them and stand a little lighter than the sky. */
function bananaGround(stock: Stock, x: number, y: number): string {
  return mixed(skyAt(stock.sky, x, y), stock.plaster.colour, stock.plaster.alpha * 0.7)
}

/** The breadth of a banana blade along its length, 0..1: it swells quickly out of the stalk, runs almost parallel-sided down most of its length,
 * and ends in a rounded, blunt tip, not a point: the oblong leaf of 芭蕉, not the lance of a canna. */
function oblong(along: number): number {
  if (along <= 0) return 0
  if (along < 0.14) return Math.pow(Math.sin((Math.PI / 2) * (along / 0.14)), 0.8)
  const body = 1 - 0.1 * Math.min(1, (along - 0.14) / 0.68)
  if (along <= 0.82) return body
  return 0.9 * Math.sqrt(Math.max(0, 1 - Math.pow((along - 0.82) / 0.18, 2)))
}

/** A banana leaf: a broad blade with a blunt tip on a short stalk, torn here and there along its veins, one half in a second wash,
 * the midrib and the fine parallel veins drawn over it. It is first painted opaque, so it hides what is behind it. */
function frond(leafShape: Frond, index: number, stock: Stock): Built {
  const steps = 18
  const stalk = 0.14
  const sample = (step: number): { x: number; y: number; normalX: number; normalY: number; width: number } => {
    const share = Math.min(1, Math.max(0, step / steps))
    const rest = 1 - share
    const dx = rest * (leafShape.bend.x - leafShape.from.x) + share * (leafShape.to.x - leafShape.bend.x)
    const dy = rest * (leafShape.bend.y - leafShape.from.y) + share * (leafShape.to.y - leafShape.bend.y)
    const length = Math.hypot(dx, dy) || 1
    const along = (share - stalk) / (1 - stalk)
    return {
      x: rest * rest * leafShape.from.x + 2 * rest * share * leafShape.bend.x + share * share * leafShape.to.x,
      y: rest * rest * leafShape.from.y + 2 * rest * share * leafShape.bend.y + share * share * leafShape.to.y,
      normalX: -dy / length,
      normalY: dx / length,
      width: share <= stalk ? 1.4 : 1.4 + leafShape.half * oblong(along),
    }
  }
  const edge = (step: number, side: number, share: number): Point => {
    const here = sample(step)
    const width = here.width * (side > 0 ? leafShape.plus : leafShape.minus) * share
    return { x: here.x + here.normalX * width * side, y: here.y + here.normalY * width * side }
  }
  // One side of the blade from stalk to tip. A tear is a narrow notch that runs in along a vein; only the broad half is torn, the half seen at a slant is too narrow to show it.
  const side = (which: number): Point[] => {
    const points: Point[] = []
    for (let step = 1; step < steps; step += 1) {
      points.push(edge(step, which, 1))
      const broad = (which > 0 ? leafShape.plus : leafShape.minus) > 0.8
      if (broad && step >= 4 && step <= steps - 3 && hashUnit(step, leafShape.salt + (which > 0 ? 0 : 50)) < 0.26) {
        const lip = edge(step + 0.28, which, 1)
        const deep = edge(step + 0.44, which, 0.46)
        const far = edge(step + 0.64, which, 1)
        points.push(lip, lip, deep, deep, far, far)
      }
    }
    // The blunt tip: two more points round the end of the blade.
    points.push(edge(steps - 0.5, which, 1), edge(steps - 0.15, which, 1))
    return points
  }
  const spine: Point[] = []
  for (let step = 0; step <= steps; step += 1) spine.push(sample(step))
  const first = spine[0] ?? leafShape.from
  const tip = spine[steps] ?? leafShape.to
  const plus = side(1)
  const minus = side(-1)
  const outline = smoothRing([first, first, ...plus, tip, ...minus.slice().reverse()])
  // The narrow half takes a second wash: it is the half seen at a slant.
  const narrow = leafShape.plus < leafShape.minus ? plus : minus
  const shade = smoothRing([first, first, ...spine.slice(1, steps), tip, ...narrow.slice().reverse()])
  let veins = ''
  for (let step = 3; step < steps - 0.9; step += 1) {
    const root = sample(step)
    veins += `M${at(edge(step + 0.5, 1, 0.97))}L${at(root)}L${at(edge(step + 0.5, -1, 0.97))}`
  }
  const middle = sample(steps * 0.55)
  const tone = leafShape.tone
  const id = `b${index}`
  const markup =
    `<use href="#${id}" fill="${bananaGround(stock, middle.x, middle.y)}"/>` +
    `<use href="#${id}" fill="${stock.ink}" fill-opacity="${alpha(0.09 * tone * stock.wash)}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${alpha(0.74 * tone * stock.line)}"/>` +
    `<path d="${shade}" fill="${stock.ink}" fill-opacity="${alpha(0.11 * tone * stock.wash)}"/>` +
    `<path d="${veins}" stroke="${stock.ink}" stroke-width="0.5" stroke-opacity="${alpha(0.3 * tone * stock.line)}"/>` +
    `<path d="${smoothPath(spine)}" stroke="${stock.ink}" stroke-width="1.5" stroke-opacity="${alpha(0.72 * tone * stock.line)}"/>`
  return { defs: `<path id="${id}" d="${outline}"/>`, markup }
}

/** The new leaf, still rolled: a slim cylinder as thick as a finger, rounded off near its tip, with the edge of its outer layer winding up round it. */
function furledLeaf(stock: Stock): string {
  const d = 'M276.6 711Q273.4 668 274.2 634Q274.6 608 278.6 591Q283.6 608 283.8 634Q284.6 672 287.4 711Z'
  return (
    `<path d="${d}" fill="${bananaGround(stock, 279, 650)}"/>` +
    `<path d="${d}" fill="${stock.ink}" fill-opacity="${alpha(0.16 * stock.wash)}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${alpha(0.74 * stock.line)}"/>` +
    `<path d="M274.4 690Q280 682 285.4 664M274.2 640Q279 632 283.4 616M279.6 711Q279 680 279.4 652" stroke="${stock.ink}" stroke-width="0.7" stroke-opacity="${alpha(0.5 * stock.line)}"/>`
  )
}

// ---------------------------------------------------------------------------------------------------------------
// The small things

/** A lens of bare sky: a thin bar of cloud across the disc, or a bank of mist a wall sinks into. It takes the sky's colour where it lies and does not move. */
function mistMaker(sky: Sky): { bank: (cx: number, cy: number, rx: number, ry: number, peak: number) => string; defs: () => string } {
  const gradients: string[] = []
  return {
    bank(cx, cy, rx, ry, peak) {
      const id = `m${gradients.length}`
      const colour = skyAt(sky, cx, cy)
      gradients.push(
        `<radialGradient id="${id}"><stop offset="0" stop-color="${colour}" stop-opacity="${alpha(0.88 * peak)}"/><stop offset="0.45" stop-color="${colour}" stop-opacity="${alpha(0.7 * peak)}"/>` +
          `<stop offset="0.8" stop-color="${colour}" stop-opacity="${alpha(0.24 * peak)}"/><stop offset="1" stop-color="${colour}" stop-opacity="0"/></radialGradient>`,
      )
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`
    },
    defs: () => gradients.join(''),
  }
}

/** A small plain seal: a vermilion square with a ring standing on a line left bare, the gate itself. A mark, not a character. */
function seal(x: number, y: number, stock: Stock): string {
  const bare = skyAt(stock.sky, x + 12, y + 12)
  return (
    `<g transform="translate(${x} ${y})" opacity="0.92"><rect width="24" height="24" rx="2.2" fill="${stock.seal}"/>` +
    `<circle cx="12" cy="11" r="5.6" stroke="${bare}" stroke-width="1.7"/>` +
    `<path d="M4.6 19.4L19.4 19.4" stroke="${bare}" stroke-width="1.7"/></g>`
  )
}

/** A leaf that has left the bamboo. It is drawn where it rests when nothing moves; the animation carries it down from the crowns past that place. */
function fallingLeaf(name: string, x: number, y: number, degrees: number, seconds: number, delay: number, stock: Stock): string {
  const angle = (degrees * Math.PI) / 180
  const length = 17
  return (
    `<path class="${name}" style="transform-origin:${round(x + (Math.cos(angle) * length) / 2)}px ${round(y + (Math.sin(angle) * length) / 2)}px;animation-duration:${seconds}s;animation-delay:-${delay}s" ` +
    `d="${leaf(x, y, angle, length, 2)}" fill="${stock.ink}" fill-opacity="${alpha(0.8 * stock.line)}"/>`
  )
}

/** The whole sheet on one stock. */
function moonGateSheet(stock: Stock): string {
  const wall = gateWall(stock)
  const low = lowWall(stock)
  const stone = rock(1404, GROUND - 6, 0.92, stock)
  const fronds = FRONDS.map((leafShape, index) => frond(leafShape, index, stock))
  const mist = mistMaker(stock.sky)
  const line = (share: number): number => alpha(share * stock.line)

  const style = `
.sw{animation:sw 6s ease-in-out infinite alternate}
.cr{animation:sw 11s ease-in-out infinite alternate}
.fa{animation:fa 38s linear infinite}
.fb{animation:fb 53s linear infinite}
@keyframes sw{from{transform:rotate(calc(var(--a) * -1))}to{transform:rotate(var(--a))}}
@keyframes fa{0%{transform:translate(92px,-66px) rotate(-50deg);opacity:0}5%{opacity:1}14%{transform:translate(64px,-46px) rotate(20deg)}24%{transform:translate(30px,-26px) rotate(-35deg)}32%{transform:translate(10px,-8px) rotate(24deg)}38%{transform:translate(0px,0px) rotate(0deg)}50%{transform:translate(-16px,80px) rotate(42deg)}62%{transform:translate(-4px,180px) rotate(-22deg)}74%{transform:translate(-22px,286px) rotate(26deg)}84%{transform:translate(-30px,362px) rotate(76deg);opacity:1}90%{transform:translate(-30px,362px) rotate(76deg);opacity:0}100%{transform:translate(-30px,362px) rotate(76deg);opacity:0}}
@keyframes fb{0%{transform:translate(96px,-462px) rotate(40deg);opacity:0}4%{opacity:1}14%{transform:translate(86px,-392px) rotate(-30deg)}28%{transform:translate(40px,-318px) rotate(50deg)}42%{transform:translate(10px,-244px) rotate(-20deg)}56%{transform:translate(-30px,-160px) rotate(44deg)}70%{transform:translate(-36px,-76px) rotate(-36deg)}82%{transform:translate(0px,0px) rotate(0deg)}94%{transform:translate(0px,0px) rotate(0deg);opacity:1}100%{transform:translate(0px,0px) rotate(0deg);opacity:0}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  const disc =
    (stock.halo > 0 ? `<circle cx="1492" cy="198" r="78" fill="url(#halo)"/>` : '') +
    `<circle cx="1492" cy="198" r="23" fill="${stock.disc}" fill-opacity="0.9"/>` +
    mist.bank(1482, 208, 66, 4.6, 1) +
    mist.bank(1510, 219, 40, 2.6, 1)

  // Beyond the gate: the far edge of the sill, the bamboo, the rock in front of it, grass at their feet.
  const beyond =
    `<ellipse cx="${GATE.x}" cy="${GROUND - 26}" rx="112" ry="30" fill="url(#haze)"/>` +
    `<path d="M1330 ${GROUND - 5}L1560 ${GROUND - 5}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${line(0.5)}"/>` +
    bamboo(stock) +
    stone.markup +
    `<path d="${tuft(1385, GROUND - 6, 8, 31)}${tuft(1466, GROUND - 5, 8, 35)}${tuft(1512, GROUND - 5, 7, 39)}" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${line(0.72)}"/>`

  const drawing = `${disc}
${beyond}
${wall.markup}${mist.bank(1258, 806, 96, 30, 0.9)}${mist.bank(1236, 536, 80, 15, 0.9)}${mist.bank(1284, 672, 58, 12, 0.4)}
${fallingLeaf('fa', 1318, 466, 28, 38, 9, stock)}${fallingLeaf('fb', 1344, GROUND + 2.5, 8, 53, 46.6, stock)}
${low.markup}${mist.bank(408, 802, 84, 26, 0.9)}${mist.bank(424, 730, 64, 12, 0.8)}
${fronds.slice(0, 2).map(part => part.markup).join('')}${furledLeaf(stock)}${fronds.slice(2).map(part => part.markup).join('')}
${seal(236, 858, stock)}`

  const defs =
    skyDefs(stock.sky) +
    mist.defs() +
    `<radialGradient id="haze"><stop offset="0" stop-color="${stock.plaster.colour}" stop-opacity="${alpha(stock.plaster.alpha * 0.8)}"/><stop offset="0.6" stop-color="${stock.plaster.colour}" stop-opacity="${alpha(stock.plaster.alpha * 0.36)}"/><stop offset="1" stop-color="${stock.plaster.colour}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.disc}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.disc}" stop-opacity="0"/></radialGradient>` +
    wall.defs +
    low.defs +
    stone.defs +
    fronds.map(part => part.defs).join('')

  const sky = `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>` + stock.sky.glows.map((_, index) => `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow${index})"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${defs}</defs>
${sky}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${drawing}
</g>
</svg>`
}

/** Moon Gate on any of its three skies. */
export function sceneSvg(stock: 'day' | 'night' | 'nightWine'): string {
  return moonGateSheet(stock === 'day' ? STOCKS.day : stock === 'night' ? STOCKS.nightBlue : STOCKS.night)
}

/** Moon Gate under a pale dusk sky, for a light window. */
export function daySvg(): string {
  return sceneSvg('day')
}

/** Moon Gate under the blue night sky with its one orange glow, for a dark window. */
export function nightSvg(): string {
  return sceneSvg('night')
}
