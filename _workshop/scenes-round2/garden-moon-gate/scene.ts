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
  /** The coping: the tiled slope, the troughs between its rows of cover tiles, the tile ends along the eave, the ridge.
   * The slope's colour is also the sheet's shadow colour (under the eave, under a wall's foot, in the hollows of the rock): ink by day, near black by night. */
  tile: Paint
  row: Paint
  eave: Paint
  ridge: Paint
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
    tile: { colour: '#2b2338', alpha: 0.56 },
    row: { colour: '#2b2338', alpha: 0.42 },
    eave: { colour: '#2b2338', alpha: 0.86 },
    ridge: { colour: '#2b2338', alpha: 0.72 },
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
    row: { colour: '#0f090d', alpha: 0.45 },
    eave: { colour: '#e4d4d8', alpha: 0.45 },
    ridge: { colour: '#0f090d', alpha: 0.65 },
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
    row: { colour: '#0b0a12', alpha: 0.45 },
    eave: { colour: '#dcd6e8', alpha: 0.45 },
    ridge: { colour: '#0b0a12', alpha: 0.65 },
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

const GATE_WALL: Wall = { name: 'r', from: 1196, to: 1640, eave: 520, scale: 1, solid: 1332, clear: 1204 }
const LOW_WALL: Wall = { name: 'l', from: -40, to: 446, eave: 736, scale: 0.8, solid: 286, clear: 440 }

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

/** The coping, top to bottom: the ridge of tiles set on edge; the tiled slope, ribbed by the dark troughs between its rows of cover tiles;
 * along the eave the round end of every cover row and, under every trough, a drip tile (a flat lip with a rounded tongue).
 * Below it the two fine lines of the brick cornice. Troughs and tile ends are dashes on straight lines, so the whole coping is a handful of paths. */
function coping(wall: Wall, paint: (colour: string) => string, stock: Stock): string {
  const s = wall.scale
  const pitch = round(11.5 * s)
  const foot = wall.eave - 17 * s
  const top = foot - 9 * s
  const trough = round(2.6 * s)
  const across = (y: number, from: number): string => `M${round(from)} ${round(y)}L${wall.to} ${round(y)}`
  const band = (upper: number, lower: number): string => `M${wall.from} ${round(upper)}L${wall.to} ${round(upper)}L${wall.to} ${round(lower)}L${wall.from} ${round(lower)}Z`
  const centre = wall.from + trough / 2
  const ink = paint(stock.ink)
  const eave = paint(stock.eave.colour)
  // The shadow the coping throws on the plaster: a few thin bands, each fainter than the one above.
  let shadow = ''
  ;[0.085, 0.06, 0.038, 0.02].forEach((share, index) => {
    shadow += `<path d="${band(wall.eave + index * 7 * s, wall.eave + (index + 1) * 7 * s)}" fill="${paint(stock.tile.colour)}" fill-opacity="${share}"/>`
  })
  return (
    shadow +
    // the tiled slope and the ridge on it
    `<path d="${band(foot, wall.eave)}" fill="${paint(stock.tile.colour)}" fill-opacity="${stock.tile.alpha}"/>` +
    `<path d="${band(top, foot - 1.2 * s)}" fill="${paint(stock.ridge.colour)}" fill-opacity="${stock.ridge.alpha}"/>` +
    // the tiles of the ridge, standing on edge
    `<path d="${across((top + foot) / 2 - 0.4 * s, wall.from)}" stroke="${ink}" stroke-width="${round(6 * s)}" stroke-opacity="${alpha(0.26 * stock.line)}" stroke-linecap="butt" stroke-dasharray="${round(0.7 * s)} ${round(2.5 * s)}"/>` +
    `<path d="${across(top, wall.from)}" stroke="${ink}" stroke-width="1.1" stroke-opacity="${alpha(0.9 * stock.line)}"/>` +
    // the troughs between the rows of cover tiles
    `<path d="${across((foot + wall.eave) / 2 - 0.6 * s, wall.from)}" stroke="${paint(stock.row.colour)}" stroke-width="${round(17 * s - 1.2)}" stroke-opacity="${stock.row.alpha}" stroke-linecap="butt" stroke-dasharray="${trough} ${round(pitch - trough)}"/>` +
    // the eave: a drip tile under each trough, the round end of each cover row between them
    `<path d="${across(wall.eave - 0.3 * s, centre - 3.2 * s)}" stroke="${eave}" stroke-width="${round(3.4 * s)}" stroke-opacity="${stock.eave.alpha}" stroke-linecap="butt" stroke-dasharray="${round(6.4 * s)} ${round(pitch - 6.4 * s)}"/>` +
    `<path d="${across(wall.eave + 2.5 * s, centre)}" stroke="${eave}" stroke-width="${round(4.4 * s)}" stroke-opacity="${stock.eave.alpha}" stroke-dasharray="0.01 ${round(pitch - 0.01)}"/>` +
    `<path d="${across(wall.eave - 1.1 * s, centre + pitch / 2)}" stroke="${eave}" stroke-width="${round(5.4 * s)}" stroke-opacity="${stock.eave.alpha}" stroke-dasharray="0.01 ${round(pitch - 0.01)}"/>` +
    // the cornice under the eave
    `<path d="${across(wall.eave + 9.5 * s, wall.from)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="${alpha(0.46 * stock.line)}"/>` +
    `<path d="${across(wall.eave + 13.5 * s, wall.from)}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${alpha(0.28 * stock.line)}"/>`
  )
}

/** A tuft of mondo grass: a few blades arching out of one root. */
function tuft(x: number, y: number, size: number, salt: number): string {
  let d = ''
  const blades = 6
  for (let blade = 0; blade < blades; blade += 1) {
    const lean = (blade - (blades - 1) / 2) / ((blades - 1) / 2)
    const height = size * (0.62 + 0.38 * (1 - Math.abs(lean))) * (0.8 + 0.4 * hashUnit(blade, salt))
    const reach = lean * size * (0.7 + 0.35 * hashUnit(blade, salt + 1))
    d += `M${round(x + lean * 1.4)} ${round(y)}q${round(reach * 0.3)} ${round(-height)} ${round(reach)} ${round(-height * 0.72)}`
  }
  return d
}

/** A thin wash on the ground under a wall's foot, fading downward in two bands. */
function groundWash(wall: Wall, paint: (colour: string) => string, stock: Stock): string {
  const band = (upper: number, lower: number, share: number): string =>
    `<path d="M${wall.from} ${upper}L${wall.to} ${upper}L${wall.to} ${lower}L${wall.from} ${lower}Z" fill="${paint(stock.tile.colour)}" fill-opacity="${share}"/>`
  return band(GROUND, GROUND + 6, 0.07) + band(GROUND + 6, GROUND + 15, 0.032)
}

/** The wall with the gate in it. It is painted over the bamboo and the rock, so they show only through the gate and over the coping. */
function gateWall(stock: Stock): Built {
  const wall = GATE_WALL
  const fade = fadeMaker(wall)
  const ink = fade.paint(stock.ink)
  const top = wall.eave - 26 * wall.scale
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

  let markup =
    // a piece of sky in the wall's shape (only as far left as anything stands behind it), the plaster over it
    `<g fill-rule="evenodd">${skyPainted(frame(1284, top), stock.sky)}<path d="${frame(wall.from, wall.eave - 3)}" fill="${fade.paint(stock.plaster.colour)}" fill-opacity="${stock.plaster.alpha}"/></g>` +
    coping(wall, fade.paint, stock)

  // The trim of polished brick: a band round the opening, a fine moulding line inside it, its joints as short radial ticks.
  const band = `${arc(rim)}L${round(GATE.x + inner)} ${GROUND}A${GATE.r} ${GATE.r} 0 1 0 ${round(GATE.x - inner)} ${GROUND}Z`
  const jointRadius = GATE.r + GATE.trim / 2 + 1.6
  markup +=
    `<path d="${band}" fill="${stock.brick.colour}" fill-opacity="${stock.brick.alpha}"/>` +
    `<path d="${arc(jointRadius)}" stroke="${stock.ink}" stroke-width="${round(GATE.trim - 4.4)}" stroke-opacity="${line(0.34)}" stroke-linecap="butt" stroke-dasharray="0.7 ${round((jointRadius * Math.PI * 2) / 40 - 0.7)}" stroke-dashoffset="-6"/>` +
    `<path d="${arc(GATE.r + 3.4)}" stroke="${stock.ink}" stroke-width="0.7" stroke-opacity="${line(0.5)}"/>` +
    `<path d="${arc(rim)}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${line(0.72)}"/>` +
    `<path d="${arc(GATE.r)}" stroke="${stock.ink}" stroke-width="1.5" stroke-opacity="${line(0.92)}"/>`

  // The ground the wall stands on (a thin wash under its foot), grass, a few dry strokes of the ground in front.
  markup +=
    groundWash(wall, fade.paint, stock) +
    `<path d="M${wall.from} ${GROUND}L${wall.to} ${GROUND}" stroke="${ink}" stroke-width="1.2" stroke-opacity="${line(0.8)}"/>` +
    `<path d="${tuft(1302, GROUND, 9, 3)}${tuft(1349, GROUND, 11, 5)}${tuft(1358, GROUND, 7, 6)}${tuft(1535, GROUND, 11, 7)}${tuft(1584, GROUND, 9, 9)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="${line(0.72)}"/>` +
    `<path d="M1284 ${GROUND + 11}L1340 ${GROUND + 11}M1420 ${GROUND + 15}L1476 ${GROUND + 15}M1540 ${GROUND + 10}L1600 ${GROUND + 10}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.24)}"/>`

  return { defs: fade.defs(), markup }
}

/** The low stretch of the same wall in the left band: plaster, coping, ground. Nothing stands behind it, so it needs no sky of its own. */
function lowWall(stock: Stock): Built {
  const wall = LOW_WALL
  const fade = fadeMaker(wall)
  const ink = fade.paint(stock.ink)
  const line = (share: number): number => alpha(share * stock.line)
  const markup =
    `<path d="M${wall.from} ${wall.eave - 3}L${wall.to} ${wall.eave - 3}L${wall.to} ${GROUND}L${wall.from} ${GROUND}Z" fill="${fade.paint(stock.plaster.colour)}" fill-opacity="${stock.plaster.alpha}"/>` +
    coping(wall, fade.paint, stock) +
    groundWash(wall, fade.paint, stock) +
    `<path d="M${wall.from} ${GROUND}L${wall.to} ${GROUND}" stroke="${ink}" stroke-width="1.1" stroke-opacity="${line(0.75)}"/>` +
    `<path d="${tuft(228, GROUND, 9, 21)}${tuft(352, GROUND, 9, 23)}${tuft(360, GROUND, 6, 24)}${tuft(396, GROUND, 8, 25)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="${line(0.7)}"/>` +
    `<path d="M214 ${GROUND + 11}L282 ${GROUND + 11}M330 ${GROUND + 16}L388 ${GROUND + 16}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.22)}"/>`
  return { defs: fade.defs(), markup }
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
    d += leaf(from.x, from.y, angle, reach, 1.3 + reach * 0.03)
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
}

// Pale culms first: they stand further back. They rise in two close groups and part as they climb; the clump leans to the left, toward the open sky.
const CULMS: Culm[] = [
  { x: 1486, y: 824, height: 440, lean: -2, bend: -5, girth: 1.8, joint: 1, reach: 33, blade: 25, tone: 0.48, salt: 37, pivot: 580, crown: 508, low: [] },
  { x: 1410, y: 822, height: 449, lean: -70, bend: 6, girth: 1.7, joint: 1, reach: 33, blade: 25, tone: 0.55, salt: 11, pivot: 580, crown: 508, low: [] },
  { x: 1451, y: 823, height: 468, lean: -22, bend: 8, girth: 2, joint: 1, reach: 34, blade: 26, tone: 0.66, salt: 23, pivot: 580, crown: 508, low: [[5, 1]] },
  { x: 1497, y: 826, height: 420, lean: 24, bend: 6, girth: 1.9, joint: 1, reach: 34, blade: 26, tone: 0.84, salt: 53, pivot: 580, crown: 508, low: [[4, 1]] },
  { x: 1444, y: 825, height: 492, lean: -56, bend: -7, girth: 2.3, joint: 1, reach: 36, blade: 27, tone: 0.94, salt: 41, pivot: 580, crown: 508, low: [] },
  { x: 1471, y: 827, height: 128, lean: 30, bend: 3, girth: 1.2, joint: 0.56, reach: 24, blade: 21, tone: 0.9, salt: 67, pivot: 0, crown: 790, low: [] },
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
  return `M${at(fromLeft)}Q${at(waistLeft)} ${at(toLeft)}L${at(toRight)}Q${at(waistRight)} ${at(fromRight)}Z`
}

/** A twig from a node: it rises outward and bows over, a sliver that tapers to nothing, with a group of three leaves hanging from its end and a pair on the way.
 * Twig and leaves are one filled path, so they sway as one. */
function twig(node: Point, side: number, length: number, blade: number, salt: number): string {
  const lift = ((40 + 16 * hashUnit(1, salt)) * Math.PI) / 180
  const end = { x: node.x + side * length * Math.cos(lift), y: node.y - length * Math.sin(lift) * 0.76 }
  const bend = { x: node.x + side * length * 0.36, y: node.y - length * 0.7 }
  const part = 0.58
  const rest = 1 - part
  const halfway = { x: rest * rest * node.x + 2 * rest * part * bend.x + part * part * end.x, y: rest * rest * node.y + 2 * rest * part * bend.y + part * part * end.y }
  let d = `M${at(node)}Q${at(bend)} ${at(end)}Q${round(bend.x + side * 0.9)} ${round(bend.y + 1)} ${round(node.x)} ${round(node.y + 1.3)}Z`
  d += spray(end, side > 0 ? 62 : 118, hashUnit(2, salt) > 0.68 ? 4 : 3, blade, salt + 3)
  d += spray(halfway, side > 0 ? 84 : 96, hashUnit(4, salt) > 0.7 ? 3 : 2, blade * 0.84, salt + 9)
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
      const side = listed ? listed[1] : (index + culm.salt) % 2 === 0 ? 1 : -1
      // How far up the crown this node sits: twigs and leaves grow smaller toward the tip.
      const high = listed ? 0.3 : Math.min(1, Math.max(0, (culm.crown - node.y) / (culm.crown - crownTop)))
      const length = culm.reach * (1 - 0.45 * high) * (0.86 + 0.28 * hashUnit(index, culm.salt + 5))
      const piece = swaying(twig(node, side, length, culm.blade * (1 - 0.18 * high), culm.salt * 31 + index), node, culm.salt * 17 + index, 1)
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

// Lean (瘦): a tall slim peak that winds like an S: a narrow foot, a belly to the right, a waist cut deep from the left,
// a chest swelling to the left, and a head that hangs over to the right.
// These are the cusps of its outline, clockwise from the left of its foot. Water wears such a stone into scoops, so between
// each pair of cusps the outline is a hollow; a third number sets how deep (as a share of the gap) where chance should not.
const ROCK_CUSPS: Knot[] = [
  [-12, 0, 0.06], [-15, -11], [-9, -22], [-12, -33], [-19, -42], [-14, -52], [-5, -61], [-9, -71], [-22, -73], [-33, -81],
  [-39, -93], [-36, -106], [-28, -114], [-24, -123], [-30, -134], [-26, -146], [-17, -152], [-9, -158], [-2, -165], [7, -160],
  [12, -151], [23, -156], [33, -151], [39, -141], [36, -130], [27, -125], [19, -119], [21, -109], [29, -103], [30, -92],
  [21, -85], [15, -75], [20, -66], [30, -61], [38, -51], [39, -39], [33, -29], [24, -24], [21, -13], [17, -4, 0.06],
  [14, 0, 0],
]

// Pierced (透): the holes that go right through, in the chest, the head and the belly.
const ROCK_HOLES: Knot[][] = [
  [[-26, -97], [-23, -106, 1], [-14, -111], [-6, -106], [-3, -96], [-7, -87, 1], [-16, -84], [-23, -88]],
  [[14, -142], [18, -149, 1], [26, -148], [32, -142], [30, -135, 1], [22, -132], [16, -135]],
  [[16, -46], [20, -54, 1], [28, -54], [34, -46], [31, -37, 1], [22, -34], [17, -39]],
]

// Hollowed (漏): cavities that do not go through: dark mouths of several sizes, each with one sharp corner.
const ROCK_HOLLOWS: Knot[][] = [
  [[-27, -139], [-22, -143, 1], [-17, -138], [-20, -131], [-26, -133]],
  [[1, -75], [5, -79, 1], [9, -74], [7, -68], [2, -69]],
  [[7, -107], [11, -111, 1], [15, -106], [12, -100], [7, -102]],
  [[-9, -45], [-4, -50, 1], [2, -45], [-1, -38], [-8, -39]],
  [[2, -16], [5, -19, 1], [8, -15], [5, -11], [2, -12]],
  [[1, -152], [4, -155, 1], [7, -151], [5, -147], [1, -148]],
  [[-13, -126], [-9, -129, 1], [-6, -125], [-9, -121], [-13, -122]],
  [[19, -98], [23, -101, 1], [25, -96], [22, -92], [19, -94]],
]

// Wrinkled (皱): creases that run in from the notches of the outline, each a start, a bend and an end.
const ROCK_CREASES: Array<[Knot, Knot, Knot]> = [
  [[-5, -61], [3, -59], [10, -64]],
  [[19, -119], [11, -119], [4, -114]],
  [[-24, -123], [-17, -119], [-14, -113]],
  [[15, -75], [10, -81], [8, -89]],
  [[-9, -22], [-2, -24], [3, -31]],
  [[21, -13], [14, -17], [12, -24]],
  [[12, -151], [9, -144], [10, -137]],
  [[-12, -33], [-5, -32], [0, -27]],
  [[21, -85], [24, -78], [22, -70]],
  [[-9, -71], [-3, -80], [3, -84]],
]

/** The rock standing at (x, y): a piece of sky in its shape (so that it hides the bamboo behind it, which still shows through its holes),
 * a wash that deepens toward its shaded side, the dark of every hollow and of the stone's thickness under the upper lip of every hole (dark on every sheet, night too),
 * broken strokes that follow the outline a little way inside its shaded side, creases, a low stone and dabs of moss at its foot. */
function rock(x: number, y: number, scale: number, stock: Stock): Built {
  // Whole pixels are fine enough for a stone, and they keep its path short: it is written out once for every layer of the sky.
  const place = (knot: Knot): Point => ({ x: Math.round(x + knot[0] * scale), y: Math.round(y + knot[1] * scale) })
  const ring = (knots: Knot[]): string => {
    const points: Point[] = []
    for (const knot of knots) {
      points.push(place(knot))
      if (knot[2]) points.push(place(knot))
    }
    return smoothRing(points)
  }
  // The outline: from cusp to cusp one curve bowed inward, so every cusp is a corner and every gap a scoop.
  // `vertices` keeps the cusps and the deepest point of each scoop, for the texture strokes below.
  const vertices: Knot[] = []
  let outline = ''
  ROCK_CUSPS.forEach((cusp, index) => {
    const next = ROCK_CUSPS[(index + 1) % ROCK_CUSPS.length] ?? cusp
    const dx = next[0] - cusp[0]
    const dy = next[1] - cusp[1]
    const gap = Math.hypot(dx, dy) || 1
    const depth = gap * (cusp[2] ?? 0.06 + 0.16 * hashUnit(index, 61))
    const inward = (share: number): Knot => [(cusp[0] + next[0]) / 2 - (dy / gap) * depth * share, (cusp[1] + next[1]) / 2 + (dx / gap) * depth * share]
    vertices.push([cusp[0], cusp[1]], inward(1))
    outline += `${index === 0 ? `M${at(place(cusp))}` : ''}Q${at(place(inward(2)))} ${at(place(next))}`
  })
  outline += 'Z'
  // What shows through a hole is smaller than its mouth and sits low in it: the rest of the mouth is the stone's thickness, seen from under its upper lip.
  const throats = ROCK_HOLES.map(hole => {
    let centreX = 0
    let centreY = 0
    for (const knot of hole) {
      centreX += knot[0] / hole.length
      centreY += knot[1] / hole.length
    }
    let radius = 0
    for (const knot of hole) radius += Math.hypot(knot[0] - centreX, knot[1] - centreY) / hole.length
    return hole.map((knot): Knot => [centreX + 0.22 * radius + (knot[0] - centreX) * 0.54, centreY + 0.32 * radius + (knot[1] - centreY) * 0.5, knot[2] ?? 0])
  })
  const mouths = ROCK_HOLES.map(ring).join('')
  const through = throats.map(ring).join('')
  const hollows = ROCK_HOLLOWS.map(ring).join('')
  const stone = ring([[18, 0, 1], [19, -6], [24, -10], [31, -8], [35, -3], [36, 0, 1]])
  const shape = outline + through + stone
  // Texture strokes: the outline again, a little way inside, on the faces that look right or down, broken into dashes; none may touch a hole.
  const openings = ROCK_HOLES.concat(ROCK_HOLLOWS)
  const inset = (depth: number): string => {
    let d = ''
    let run: Point[] = []
    const flush = (): void => {
      if (run.length > 2) d += smoothPath(run)
      run = []
    }
    for (let index = 0; index < vertices.length; index += 1) {
      const before = vertices[(index + vertices.length - 1) % vertices.length]
      const here = vertices[index]
      const after = vertices[(index + 1) % vertices.length]
      if (!before || !here || !after) continue
      const tx = after[0] - before[0]
      const ty = after[1] - before[1]
      const length = Math.hypot(tx, ty) || 1
      const outX = ty / length
      const outY = -tx / length
      const point: Knot = [here[0] - outX * depth, here[1] - outY * depth]
      const shaded = (outX > 0.3 || outY > 0.45) && here[1] < -3
      const clear = !openings.some(opening => opening.some(corner => Math.hypot(corner[0] - point[0], corner[1] - point[1]) < 4))
      if (shaded && clear) run.push({ x: round(x + point[0] * scale), y: round(y + point[1] * scale) })
      else flush()
    }
    flush()
    return d
  }
  let creases = ''
  for (const [from, bend, to] of ROCK_CREASES) creases += `M${at(place(from))}Q${at(place(bend))} ${at(place(to))}`
  let moss = ''
  const dabs: Knot[] = [[-11, -3], [-7, -1], [-3, -2], [11, -2], [23, -8], [27, -7], [31, -5], [-9, -8], [9, -7]]
  dabs.forEach((dab, index) => {
    const point = place(dab)
    moss += `M${at(point)}l${round(0.6 + hashUnit(index, 7))} ${round(-1.5 - 1.5 * hashUnit(index, 9))}`
  })
  const wash = (share: number): number => alpha(share * stock.wash)
  const line = (share: number): number => alpha(share * stock.line)
  const defs =
    `<linearGradient id="rk" gradientUnits="userSpaceOnUse" x1="${round(x - 34 * scale)}" y1="${round(y - 150 * scale)}" x2="${round(x + 30 * scale)}" y2="${round(y - 10 * scale)}">` +
    `<stop offset="0" stop-color="${stock.ink}" stop-opacity="${wash(0.05)}"/><stop offset="1" stop-color="${stock.ink}" stop-opacity="${wash(0.3)}"/></linearGradient>`
  const markup =
    `<g fill-rule="evenodd">${skyPainted(shape, stock.sky)}<path d="${shape}" fill="url(#rk)"/>` +
    `<path d="${mouths + through}" fill="${stock.tile.colour}" fill-opacity="0.46"/></g>` +
    `<path d="${hollows}" fill="${stock.tile.colour}" fill-opacity="0.34"/>` +
    `<path d="${mouths + hollows}" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${line(0.8)}"/>` +
    `<path d="${inset(3)}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${line(0.5)}" stroke-dasharray="7 3 3 4 11 5"/>` +
    `<path d="${inset(6.2)}" stroke="${stock.ink}" stroke-width="0.7" stroke-opacity="${line(0.32)}" stroke-dasharray="4 8 9 6 3 10"/>` +
    `<path d="${creases}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${line(0.5)}"/>` +
    `<path d="${outline + stone}" stroke="${stock.ink}" stroke-width="1.2" stroke-opacity="${line(0.92)}"/>` +
    `<path d="${moss}" stroke="${stock.ink}" stroke-width="1.6" stroke-opacity="${line(0.8)}"/>`
  return { defs, markup }
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
  { from: { x: 238, y: 716 }, bend: { x: 230, y: 652 }, to: { x: 186, y: 620 }, half: 17, plus: 0.55, minus: 1, salt: 5, tone: 0.72 },
  // arching to the left
  { from: { x: 296, y: 716 }, bend: { x: 268, y: 606 }, to: { x: 220, y: 642 }, half: 21, plus: 0.52, minus: 1, salt: 9, tone: 0.86 },
  // the tall one
  { from: { x: 300, y: 716 }, bend: { x: 296, y: 634 }, to: { x: 334, y: 566 }, half: 23, plus: 1, minus: 0.6, salt: 17, tone: 1 },
  // arching to the right and over the wall
  { from: { x: 304, y: 716 }, bend: { x: 360, y: 596 }, to: { x: 394, y: 744 }, half: 20, plus: 0.5, minus: 1, salt: 13, tone: 0.92 },
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
      width: share <= stalk ? 1.4 : 1.4 + leafShape.half * Math.pow(Math.sin(Math.PI * Math.pow(along, 0.82)), 0.62),
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
    return points
  }
  const spine: Point[] = []
  for (let step = 0; step <= steps; step += 1) spine.push(sample(step))
  const first = spine[0] ?? leafShape.from
  const tip = spine[steps] ?? leafShape.to
  const plus = side(1)
  const minus = side(-1)
  const outline = smoothRing([first, first, ...plus, tip, tip, ...minus.slice().reverse()])
  // The narrow half takes a second wash: it is the half seen at a slant.
  const narrow = leafShape.plus < leafShape.minus ? plus : minus
  const shade = smoothRing([first, first, ...spine.slice(1, steps), tip, tip, ...narrow.slice().reverse()])
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

/** The new leaf, still rolled: a slim spindle among the others, one line winding round it. */
function furledLeaf(stock: Stock): string {
  const d = 'M297 716Q288 668 288 598Q297 664 302.4 716Z'
  return (
    `<path d="${d}" fill="${bananaGround(stock, 292, 650)}"/>` +
    `<path d="${d}" fill="${stock.ink}" fill-opacity="${alpha(0.16 * stock.wash)}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${alpha(0.74 * stock.line)}"/>` +
    `<path d="M295.6 692Q294.4 664 290.6 638" stroke="${stock.ink}" stroke-width="0.7" stroke-opacity="${alpha(0.5 * stock.line)}"/>`
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
@keyframes fa{0%{transform:translate(68px,-210px) rotate(-50deg);opacity:0}5%{opacity:1}16%{transform:translate(38px,-156px) rotate(20deg)}30%{transform:translate(50px,-100px) rotate(-35deg)}44%{transform:translate(12px,-46px) rotate(30deg)}56%{transform:translate(0px,0px) rotate(0deg)}70%{transform:translate(-28px,72px) rotate(42deg)}84%{transform:translate(-12px,148px) rotate(-22deg)}95%{transform:translate(-34px,218px) rotate(26deg);opacity:1}100%{transform:translate(-36px,224px) rotate(30deg);opacity:0}}
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
    `<path d="${tuft(1385, GROUND - 6, 8, 31)}${tuft(1441, GROUND - 5, 8, 33)}${tuft(1468, GROUND - 5, 7, 35)}${tuft(1497, GROUND - 5, 8, 37)}${tuft(1511, GROUND - 5, 6, 39)}" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${line(0.72)}"/>`

  const drawing = `${disc}
${beyond}
${wall.markup}${mist.bank(1258, 806, 96, 30, 0.9)}${mist.bank(1236, 536, 80, 15, 0.9)}${mist.bank(1284, 672, 58, 12, 0.4)}
${fallingLeaf('fa', 1294, 606, 28, 38, 9, stock)}${fallingLeaf('fb', 1344, GROUND + 2.5, 8, 53, 31, stock)}
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
