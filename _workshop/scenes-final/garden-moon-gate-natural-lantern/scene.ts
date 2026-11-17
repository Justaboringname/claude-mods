// Moon Gate (月洞门框景): a corner of a Suzhou garden, drawn as fine ruled line (界画) with soft ink washes.
// A whitewashed wall stands in the right band under its coping of dark tiles: a ridge of tiles set on edge, the
// tiled slope ribbed by its troughs, and along the eave the round tile ends with a drip tile hanging between each pair.
// A round gate, trimmed with a band of polished grey brick, frames the view beyond: a single Taihu peak after 留园's
// 晚翠峰, heavy at the head (上大下小), a lumpy body with a short arm, its head curling out over the bamboo like a wave
// and coming down onto the body, so that the bamboo shows through the opening under the curl (透); pierced and pocketed
// with openings of every size, rising from a planted bed with low stones at its foot; and a clump of bamboo whose crowns
// rise over the wall. The wall ends clean short of the reading column, as Lattice Windows' walls do: its coping oversails the
// end and turns up in a hook (起翘), and only its lower corner goes into the mist along a slant. In the left band a low stretch
// of the same wall, ending the same way, and in front of it a clump of banana (芭蕉) beside a squat companion stone (蕉石):
// stout stems, broad paddle leaves arching and hanging, a rolled heart, a dead leaf, the oldest leaf torn along its veins.
// On the two ink stocks every wash is neutral grey, and the seal and the small sun are the only colour on the sheet. daySvg and
// nightSvg draw the two photograph stocks, in the sky and paints Lattice Windows chose: 晴日写真 by day, 灯影夜游 by night.
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
  /** A dark sheet: pale ink on a dark ground, so the light on the rock is laid the other way round. */
  dark: boolean
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
  // The fields below belong to the photograph stocks (晴日写真 by day, 灯影夜游 by night); left out, a stock is painted as before.
  /** The shade on plaster (under the eave, the rain streaks, the plinth, the wash under a wall's foot): a cool blue-grey by day. Unset, the tile colour. */
  shade?: string
  /** How much deeper the shade under the eave is laid than on the ink stocks. */
  eaveShade?: number
  /** The plinth's cover of the shade colour. Unset, 0.85 of `stain`. */
  plinth?: number
  /** On a coping laid solid: the light on the cover rows of the slope (the channels between them stay dark), in the glint's colour. */
  coverLight?: number
  /** The disc's own cover, and the glow round it: its colour and radius. */
  discAlpha?: number
  haloColour?: string
  haloR?: number
  /** How far the colour of a bank of mist is taken from the sky towards the plaster: mist is a little lighter than the air it hangs in. */
  mistLift?: number
  /** How far the companion stone's ground is taken from the sky towards the plaster. Unset, half the plaster's alpha. */
  stoneLift?: number
  /** How much of its cover a bank of mist keeps (1 by default). By night a bank takes the ground's own colour, so on the lit plaster it
   * would only be a dark smear: there it is 0. */
  wallMist?: number
  /** The white haze over the far ground beyond the gate, as a cover of the plaster colour. Unset, the plaster's own alpha. */
  haze?: number
  /** The bamboo's own paint: the leaves and the culms. `bambooRamp` instead runs one paint down the sheet (by night: the crowns over
   * the coping catch the lamplight against the sky, the culms seen in the lit gate stand dark against it). `bambooInk` takes the place of `line`. */
  bamboo?: { leaf: string; cane: string }
  bambooRamp?: { from: number; to: number; stops: ReadonlyArray<readonly [number, string]> }
  bambooInk?: number
  /** The line down a wall's free end. Unset, the ink; by night it is dark, as Lattice Windows has it, so the lit plaster is not outlined in pale ink. */
  edgeInk?: string
  /** The mondo grass. Unset, the ink. */
  tuft?: string
  /** The banana's own paints: the blade (front leaves), the paler back leaves, the second wash on a leaf's narrow half, the midrib and veins,
   * the outline and how strong it is, the pseudostem, its blotches and dry shreds, the rolled heart, and the dead leaf and its line. */
  banana?: {
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
    /** By night, the blades run down the sheet from `from` to `to` (as the bamboo's paint does): lit mauve where they rise into the sky over
     * the coping, dark wine where they stand in front of the plaster. One run for the front leaves and one, darker, for the back ones. */
    ramp?: { from: number; to: number; front: readonly [string, string]; back: readonly [string, string] }
  }
  /** The lit courtyard beyond the gate (夜游): the light that fills the opening, from its middle low behind the rock (0) to its rim (1);
   * the warm light it throws on the plaster and brick round the gate and on the ground in front; and how the things beyond the gate are
   * painted against it: their ground (in silhouette) and their line (caught by the light behind them). */
  lamp?: {
    stops: ReadonlyArray<readonly [number, string]>
    spill: string
    spillStops: ReadonlyArray<readonly [number, number]>
    soffit: number
    pool: number
    ground: string
    line: string
    /** The wash on a backlit stone, from its upper left (dimly lit by the garden) to its lower right. */
    washStops: ReadonlyArray<readonly [number, number]>
  }
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
    dark: false, ink: '#2b2338', disc: '#ee6a2c', seal: '#c2422b', wash: 1, line: 1, halo: 0,
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
    dark: true, ink: '#e4d4d8', disc: '#f79a4b', seal: '#b4472e', wash: 0.8, line: 0.8, halo: 0.14,
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
    dark: true, ink: '#dcd6e8', disc: '#f79a4b', seal: '#b4472e', wash: 0.8, line: 0.8, halo: 0.14,
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
  /** Day, ink: for the gardens the dusk colours are too vivid, so this is a sheet of pale, nearly colourless mist with
   * one faint warm blush behind the sun. Not paper-yellow: red, green and blue stay within a few levels of each other.
   * Every wash on it is grey ink; the seal and the small sun are the only colour. */
  dayInk: {
    sky: {
      base: [[0, '#efedeb'], [0.5, '#eae9e9'], [1, '#e3e4e7']],
      glows: [
        { x: 1560, y: 30, r: 600, colour: '#e8cdbb', alpha: 0.42 },
        { x: 110, y: 430, r: 660, colour: '#d3d6dc', alpha: 0.35 },
        { x: 1500, y: 1050, r: 640, colour: '#d2d0d6', alpha: 0.3 },
      ],
    },
    dark: false, ink: '#26262b', disc: '#c65f45', seal: '#b5432e', wash: 1, line: 1, halo: 0,
    plaster: { colour: '#ffffff', alpha: 0.6 },
    tile: { colour: '#26262b', alpha: 0.5 },
    row: { colour: '#26262b', alpha: 0.24 },
    eave: { colour: '#26262b', alpha: 0.72 },
    ridge: { colour: '#26262b', alpha: 0.74 },
    glint: { colour: '#ffffff', alpha: 0.42 },
    stain: 0.075,
    rib: 0.5,
    brick: { colour: '#26262b', alpha: 0.12 },
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
    dark: true, ink: '#dddad6', disc: '#e9dcc6', seal: '#a8432b', wash: 0.8, line: 0.8, halo: 0.12,
    plaster: { colour: '#dddad6', alpha: 0.12 },
    tile: { colour: '#070708', alpha: 0.5 },
    row: { colour: '#070708', alpha: 0.32 },
    eave: { colour: '#070708', alpha: 0.72 },
    ridge: { colour: '#070708', alpha: 0.68 },
    glint: { colour: '#dddad6', alpha: 0.2 },
    stain: 0.16,
    rib: 0.2,
    brick: { colour: '#070708', alpha: 0.3 },
  },
  /** Day, clear (晴日写真), the sky and paints of Lattice Windows' chosen day: the garden as a photograph has it on a fine day, a little
   * muted. A soft blue-grey sky paling to a gold haze round a pale vermilion sun (the haze moved onto this sheet's sun); opaque white
   * walls with cool blue-grey shade under 黛 copings; bamboo in its own green; a banana of muted grey-green with pale midribs and one
   * ochre dead leaf; the Taihu stone in cool grey only. */
  dayNatural: {
    sky: {
      base: [[0, '#cfdae6'], [0.5, '#d3dce7'], [1, '#d8dee8']],
      glows: [
        { x: 1492, y: 198, r: 420, colour: '#ffefd4', alpha: 0.62 },
        { x: -120, y: 40, r: 720, colour: '#c1d0e1', alpha: 0.15 },
        { x: 1480, y: 1060, r: 600, colour: '#e4dfe2', alpha: 0.45 },
      ],
    },
    dark: false, ink: '#262b33', disc: '#eb976a', seal: '#b8432e', wash: 1, line: 1.1, halo: 0.3,
    plaster: { colour: '#fefefe', alpha: 1 },
    tile: { colour: '#262b33', alpha: 1 },
    row: { colour: '#262b33', alpha: 0 },
    eave: { colour: '#262b33', alpha: 1 },
    ridge: { colour: '#262b33', alpha: 1 },
    glint: { colour: '#fefefe', alpha: 0.2 },
    stain: 0.045,
    rib: 0.15,
    brick: { colour: '#3c4a5c', alpha: 0.3 },
    shade: '#3c4a5c', eaveShade: 2.6, plinth: 0.07, coverLight: 0.02,
    discAlpha: 0.94, haloColour: '#f5c39a', haloR: 96, mistLift: 0.55, haze: 0.6, stoneLift: 0.12,
    bamboo: { leaf: '#4f7358', cane: '#3f5a48' },
    tuft: '#4a6650',
    banana: {
      blade: '#86a083', back: '#a9b9a3', shade: '#5d7a5e', shadeAlpha: 0.3, rib: '#dfe5d2', ribAlpha: 0.85,
      line: '#3b4a3e', lineAlpha: 0.72, stem: '#94a888', blotch: '#6e6a5c', shred: '#9b8466', heart: '#b9c9aa', dead: '#a8946e', deadLine: '#5e4e3a',
    },
  },
  /** Night, lantern (灯影夜游), the sky and paints of Lattice Windows' chosen night: the garden open after dark. A deep wine-ink air and
   * a small pale moon; the courtyard beyond the gate lit amber-gold from low behind the rock, so the peak, its bed and the bamboo in the gate
   * stand partly in silhouette, and the light warms the brick rim, the plaster round it and the ground in front; the plaster elsewhere a
   * dusky rose, the tiles near black, the lines a warm pale tone; the bamboo crowns over the coping catch the light against the sky; the
   * banana dark, with a faint warm edge. */
  nightLantern: {
    sky: { base: [[0, '#23171e'], [1, '#1c1218']], glows: [] },
    dark: true, ink: '#e8cfc2', disc: '#f3e8d8', seal: '#a64a3c', wash: 0.8, line: 0.8, halo: 0.2,
    plaster: { colour: '#7e6270', alpha: 1 },
    tile: { colour: '#130a0f', alpha: 1 },
    row: { colour: '#130a0f', alpha: 0 },
    eave: { colour: '#130a0f', alpha: 1 },
    ridge: { colour: '#130a0f', alpha: 1 },
    glint: { colour: '#e8cfc2', alpha: 0.24 },
    stain: 0.1,
    rib: 0.34,
    brick: { colour: '#1c0c18', alpha: 0.62 },
    eaveShade: 2.4, plinth: 0.16, coverLight: 0.03, edgeInk: '#130a0f',
    discAlpha: 1, haloColour: '#d2b4b6', haloR: 80, haze: 0, stoneLift: 0.22, wallMist: 0,
    bambooRamp: { from: 300, to: 620, stops: [[0, '#7a5e66'], [0.55, '#ad8a86'], [1, '#2a141c']] }, bambooInk: 1.1,
    banana: {
      blade: '#3b3034', back: '#33292d', shade: '#1a1014', shadeAlpha: 0.4, rib: '#8a7072', ribAlpha: 0.7,
      line: '#e6aa78', lineAlpha: 0.5, stem: '#3d3135', blotch: '#1a1013', shred: '#7a5e48', heart: '#56454b', dead: '#6b5440', deadLine: '#d69c6c',
      ramp: { from: 688, to: 738, front: ['#7e636b', '#3b3034'], back: ['#685158', '#33292d'] },
    },
    lamp: {
      stops: [[0, '#fae2b0'], [0.3, '#f2c27a'], [0.62, '#d8945a'], [0.85, '#a8664a'], [1, '#7a4436']],
      spill: '#eea87e',
      spillStops: [[0, 0.85], [0.6, 0.6], [0.8, 0.22], [1, 0]],
      soffit: 0.45,
      pool: 0.42,
      ground: '#2a181e',
      line: '#f0bc86',
      washStops: [[0, 0.34], [0.45, 0.14], [1, 0.02]],
    },
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

/** A stretch of wall seen square on, as a photograph of a Suzhou garden has it (and as Lattice Windows paints it): its free end stands clean on
 * the sheet, the coping oversailing it and its ridge turning up in a short hook (起翘); only the wall's lower corner at that end goes into the
 * mist, along a slant from `mist[0]` on the end down to `mist[1]` on the foot (bare on the side away from the wall, whole on the other). */
interface Wall {
  name: string
  from: number
  to: number
  /** The level of the eave: the lower edge of the tiles. */
  eave: number
  scale: number
  /** Which end stands free on the sheet. */
  free: 'left' | 'right'
  mist: [Point, Point]
}

const GATE_WALL: Wall = { name: 'r', from: 1244, to: 1606, eave: 520, scale: 1, free: 'left', mist: [{ x: 1244, y: 700 }, { x: 1326, y: 832 }] }
const LOW_WALL: Wall = { name: 'l', from: -6, to: 404, eave: 736, scale: 0.8, free: 'right', mist: [{ x: 404, y: 786 }, { x: 336, y: 832 }] }

/** The gate: a full circle whose foot is cut by the sill. `drop` is how far its centre stands above the ground. */
const GATE = { x: 1446, drop: 96, r: 114, trim: 12 }

/** How the lower corner goes into the mist across the slant: slowly at first, slowly at last, so that no edge shows. */
const DISSOLVE: Array<[number, number]> = [[0, 0], [0.18, 0.05], [0.36, 0.22], [0.52, 0.48], [0.68, 0.74], [0.84, 0.93], [1, 1]]

/** Paints that fade out across the slant of a wall's lower corner, one per colour: every wash and line of the wall is laid with them, so the
 * corner goes into the mist all together while the rest of the wall, and its free end above the slant, stay whole. `width` is how wide the
 * fade lies across the slant (narrower by night, as in Lattice Windows). */
function fadeMaker(wall: Wall, width: number): { paint: (colour: string) => string; defs: () => string } {
  const colours: string[] = []
  const defs: string[] = []
  // Across the slant, from the bare side to the whole side: for a wall free on the left the bare side is below and to the left of the line.
  const [top, foot] = wall.mist
  const along = Math.hypot(foot.x - top.x, foot.y - top.y) || 1
  const side = wall.free === 'left' ? 1 : -1
  const nx = (side * (foot.y - top.y)) / along
  const ny = (-side * (foot.x - top.x)) / along
  const across = `x1="${round(top.x - (nx * width) / 2)}" y1="${round(top.y - (ny * width) / 2)}" x2="${round(top.x + (nx * width) / 2)}" y2="${round(top.y + (ny * width) / 2)}"`
  return {
    paint(colour) {
      let index = colours.indexOf(colour)
      if (index < 0) {
        index = colours.length
        colours.push(colour)
        defs.push(
          `<linearGradient id="${wall.name}${index}" gradientUnits="userSpaceOnUse" ${across}>` +
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
  // The coping oversails the wall's free end a little; the plaster's own bands (the eave's shadow, the cornice) stop at the end.
  const over = Math.round(COPING.slope * s * 0.22)
  const left = wall.free === 'left' ? wall.from - over : wall.from
  const right = wall.free === 'right' ? wall.to + over : wall.to
  const across = (y: number, from: number): string => `M${round(from)} ${round(y)}L${round(right)} ${round(y)}`
  const band = (upper: number, lower: number): string => `M${round(left)} ${round(upper)}L${round(right)} ${round(upper)}L${round(right)} ${round(lower)}L${round(left)} ${round(lower)}Z`
  const onPlaster = (upper: number, lower: number): string => `M${wall.from} ${round(upper)}L${wall.to} ${round(upper)}L${wall.to} ${round(lower)}L${wall.from} ${round(lower)}Z`
  const plasterAcross = (y: number): string => `M${wall.from} ${round(y)}L${wall.to} ${round(y)}`
  const ink = paint(stock.ink)
  const line = (share: number): number => alpha(share * stock.line)
  // The ridge's free end turns up in a short hook over the end of the tiles (起翘), the way Suzhou wall ridges end.
  const ridgeFoot = foot - 1.4 * s
  const ridgeHigh = ridgeFoot - top
  const tipLength = 27 * s
  const tipUp = 9 * s
  const tipOut = 3.2 * s
  const end = wall.free === 'left' ? left : right
  const toward = wall.free === 'left' ? 1 : -1
  const tip = { x: end - toward * tipOut, y: top - tipUp }
  const ridgeShape =
    wall.free === 'left'
      ? `M${round(tip.x)} ${round(tip.y)}Q${round(end + tipLength * 0.22)} ${round(top)} ${round(end + tipLength)} ${round(top)}H${round(right)}V${round(ridgeFoot)}H${round(end + 2)}Q${round(end + tipOut * 0.4)} ${round(ridgeFoot - ridgeHigh * 0.5)} ${round(tip.x)} ${round(tip.y)}Z`
      : `M${round(left)} ${round(top)}H${round(end - tipLength)}Q${round(end - tipLength * 0.22)} ${round(top)} ${round(tip.x)} ${round(tip.y)}Q${round(end - tipOut * 0.4)} ${round(ridgeFoot - ridgeHigh * 0.5)} ${round(end - 2)} ${round(ridgeFoot)}H${round(left)}Z`
  // The capping line along the ridge, one stroke from the hook's tip along the whole ridge.
  const hookLine =
    `M${round(tip.x)} ${round(tip.y)}Q${round(end + toward * tipLength * 0.22)} ${round(top + 0.5 * s)} ${round(end + toward * tipLength)} ${round(top + 0.5 * s)}` +
    `H${round(wall.free === 'left' ? right : left)}`
  // The shadow the coping throws on the plaster: a few thin bands, each fainter than the one above.
  let shadow = ''
  const deeper = stock.eaveShade ?? 1
  ;[0.09, 0.065, 0.04, 0.02].forEach((share, index) => {
    shadow += `<path d="${onPlaster(eaveY + index * 7 * s, eaveY + (index + 1) * 7 * s)}" fill="${paint(stock.shade ?? stock.tile.colour)}" fill-opacity="${alpha(share * deeper)}"/>`
  })
  // On a solid slope the cover rows catch a little light and the channels between them stay dark.
  const covers = stock.coverLight
    ? `<path d="${across((foot + eaveY) / 2, left + channel)}" stroke="${paint(stock.glint.colour)}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${alpha(stock.coverLight)}" stroke-linecap="butt" stroke-dasharray="${round(pitch - channel)} ${round(channel)}"/>`
    : ''
  const ribInk = stock.coverLight ? paint(stock.glint.colour) : ink
  // The ridge's tiles on edge: one dashed line as tall as a tile, sheared about its own middle so that every dash leans to the right.
  const tickY = round(top + 6.4 * s)
  // The lips along the eave: a pointed drip tile under each channel, a small round lip under each cover row; none past a free end.
  let lips = ''
  const lipsTo = wall.free === 'right' ? right - pitch * 0.5 : wall.to + pitch
  for (let x = left + channel / 2; x < lipsTo; x += pitch) {
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
    (stock.row.alpha > 0
      ? `<path d="${across((foot + eaveY) / 2, left)}" stroke="${paint(stock.row.colour)}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${stock.row.alpha}" stroke-linecap="butt" stroke-dasharray="${round(channel)} ${round(pitch - channel)}"/>`
      : covers) +
    // the edges of the cover rows, and the laps of their tiles
    `<path d="${across((foot + eaveY) / 2, left - 0.4)}" stroke="${ribInk}" stroke-width="${round(eaveY - foot)}" stroke-opacity="${line(stock.rib)}" stroke-linecap="butt" stroke-dasharray="0.8 ${round(channel - 0.8)} 0.8 ${round(pitch - channel - 0.8)}"/>` +
    [7.5, 14.5]
      .map(
        lap =>
          `<path d="${across(foot + lap * s, left + channel + 1.2)}" stroke="${paint(stock.glint.colour)}" stroke-width="0.9" stroke-opacity="${alpha(stock.glint.alpha * (stock.coverLight ? 0.4 : 0.6))}" stroke-linecap="butt" stroke-dasharray="${round(pitch - channel - 2.4)} ${round(channel + 2.4)}"/>`,
      )
      .join('') +
    // the end of the slope over the free end
    `<path d="M${round(end)} ${round(foot)}V${round(eaveY)}" stroke="${ink}" stroke-width="1.1" stroke-opacity="${line(0.8)}"/>` +
    // the ridge: its body with the hook at its free end, its tiles on edge, the capping line running up the hook, the course it stands on
    `<path d="${ridgeShape}" fill="${paint(stock.ridge.colour)}" fill-opacity="${stock.ridge.alpha}"/>` +
    `<path d="M${round(left + (wall.free === 'left' ? 4 : 1))} ${tickY}H${round(right - (wall.free === 'right' ? 4 : 0))}" transform="matrix(1 0 .46 1 ${round(-0.46 * tickY)} 0)" stroke="${paint(stock.glint.colour)}" stroke-width="${round(5.6 * s)}" stroke-opacity="${stock.glint.alpha}" stroke-linecap="butt" stroke-dasharray=".9 ${round(4.4 * s - 0.9)}"/>` +
    `<path d="${hookLine}" stroke="${ink}" stroke-width="${round(3.4 * s)}" stroke-opacity="${line(0.82)}" stroke-linecap="round"/>` +
    `<path d="${across(foot - 0.6 * s, left)}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.6)}"/>` +
    // the lips along the eave
    `<path d="${lips}" fill="${paint(stock.eave.colour)}" fill-opacity="${stock.eave.alpha}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${line(0.55)}"/>` +
    // the cornice under the eave, on the plaster only
    `<path d="${plasterAcross(eaveY + 13 * s)}" stroke="${ink}" stroke-width="0.9" stroke-opacity="${line(0.42)}"/>` +
    `<path d="${plasterAcross(eaveY + 17 * s)}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${line(0.26)}"/>`
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
    `<stop offset="0" stop-color="${stock.shade ?? stock.tile.colour}" stop-opacity="${alpha(stock.stain)}"/><stop offset="0.45" stop-color="${stock.shade ?? stock.tile.colour}" stop-opacity="${alpha(stock.stain * 0.55)}"/>` +
    `<stop offset="1" stop-color="${stock.shade ?? stock.tile.colour}" stop-opacity="0"/></radialGradient>`
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
    `<path d="M${wall.from} ${upper}L${wall.to} ${upper}L${wall.to} ${lower}L${wall.from} ${lower}Z" fill="${paint(stock.shade ?? stock.tile.colour)}" fill-opacity="${share}"/>`
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
    `<path fill-rule="evenodd" d="M${wall.from} ${round(top)}L${wall.to} ${round(top)}L${wall.to} ${GROUND}L${wall.from} ${GROUND}Z${hole}" fill="${paint(stock.shade ?? stock.tile.colour)}" fill-opacity="${alpha(stock.plinth ?? stock.stain * 0.85)}"/>` +
    `<path d="${edge}" stroke="${ink}" stroke-width="0.7" stroke-opacity="${alpha(0.3 * stock.line)}"/>`
  )
}

/** The wall with the gate in it. It is painted over the bamboo and the rock, so they show only through the gate and over the coping. */
function gateWall(stock: Stock): Built {
  const wall = GATE_WALL
  const fade = fadeMaker(wall, stock.dark ? 40 : 52)
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
    // the line down the wall's free end, which goes into the mist with the lower corner
    `<path d="M${wall.from + 0.5} ${wall.eave}V${GROUND}" stroke="${fade.paint(stock.edgeInk ?? stock.ink)}" stroke-width="1" stroke-opacity="${line(0.8)}"/>` +
    coping(wall, fade.paint, stock)

  // The trim of polished brick: a band round the opening, a fine moulding line inside it, its joints as short radial ticks.
  const band = `${arc(rim)}L${round(GATE.x + inner)} ${GROUND}A${GATE.r} ${GATE.r} 0 1 0 ${round(GATE.x - inner)} ${GROUND}Z`
  const jointRadius = GATE.r + GATE.trim / 2 + 1.6
  // The underside of the wall's thickness at the top of the opening: seen from below, a crescent of shadow inside the rim, thickest at the crown.
  const centreY = GROUND - GATE.drop
  const soffit = 5
  const meet = Math.sqrt(GATE.r * GATE.r - (soffit / 2) * (soffit / 2))
  const farEdge = `A${GATE.r} ${GATE.r} 0 0 0 ${round(GATE.x - meet)} ${round(centreY + soffit / 2)}`
  // By night the light beyond the gate warms the brick and the plaster round it (laid over the brick, under the trim's lines), and lights
  // the underside of the arch, which faces down toward the lamps; by day that underside is in shade.
  const lamp = stock.lamp
  const soffitPaint = lamp ? `fill="${lamp.stops[1]?.[1] ?? stock.ink}" fill-opacity="${lamp.soffit}"` : `fill="${stock.shade ?? stock.tile.colour}" fill-opacity="0.3"`
  markup +=
    `<path d="${band}" fill="${stock.brick.colour}" fill-opacity="${stock.brick.alpha}"/>` +
    (lamp ? `<path fill-rule="evenodd" d="${frame(1250, 540)}" fill="url(#spill)"/>` : '') +
    `<path d="M${round(GATE.x - meet)} ${round(centreY + soffit / 2)}A${GATE.r} ${GATE.r} 0 1 1 ${round(GATE.x + meet)} ${round(centreY + soffit / 2)}${farEdge}Z" ${soffitPaint}/>` +
    `<path d="M${round(GATE.x + meet)} ${round(centreY + soffit / 2)}${farEdge}" stroke="${stock.ink}" stroke-width="0.6" stroke-opacity="${line(0.32)}"/>` +
    `<path d="${arc(jointRadius)}" stroke="${stock.ink}" stroke-width="${round(GATE.trim - 4.4)}" stroke-opacity="${line(0.34)}" stroke-linecap="butt" stroke-dasharray="0.7 ${round((jointRadius * Math.PI * 2) / 40 - 0.7)}" stroke-dashoffset="-6"/>` +
    `<path d="${arc(GATE.r + 3.4)}" stroke="${stock.ink}" stroke-width="0.7" stroke-opacity="${line(0.5)}"/>` +
    `<path d="${arc(rim)}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${line(0.72)}"/>` +
    `<path d="${arc(GATE.r)}" stroke="${stock.ink}" stroke-width="1.5" stroke-opacity="${line(0.92)}"/>`

  // The ground the wall stands on (a thin wash under its foot), grass, a few dry strokes of the ground in front.
  markup +=
    groundWash(wall, fade.paint, stock) +
    `<path d="M${wall.from} ${GROUND}L${wall.to} ${GROUND}" stroke="${ink}" stroke-width="1.2" stroke-opacity="${line(0.8)}"/>` +
    `<path d="${tuft(1349, GROUND, 11, 5)}${tuft(1357, GROUND, 7, 6)}${tuft(1582, GROUND, 9, 9)}" stroke="${stock.tuft ?? ink}" stroke-width="0.9" stroke-opacity="${line(0.7)}"/>` +
    `<path d="M1284 ${GROUND + 11}L1340 ${GROUND + 11}M1420 ${GROUND + 15}L1476 ${GROUND + 15}M1540 ${GROUND + 10}L1600 ${GROUND + 10}" stroke="${ink}" stroke-width="0.8" stroke-opacity="${line(0.24)}"/>`

  return { defs: fade.defs() + streaks.defs + `<path id="wf" fill-rule="evenodd" d="${frame(1284, top)}"/>`, markup }
}

/** The round opening as one closed shape, cut by the sill: what the lamp beyond the gate fills. */
function gateOpening(): string {
  const inner = Math.sqrt(GATE.r * GATE.r - GATE.drop * GATE.drop)
  return `M${round(GATE.x + inner)} ${GROUND}A${GATE.r} ${GATE.r} 0 1 0 ${round(GATE.x - inner)} ${GROUND}Z`
}

/** The light in the gate (whole in the opening, brightest low behind the rock), its spill on the plaster and brick round the gate, and the
 * pool of it on the ground in front. */
function lampDefs(stock: Stock): string {
  const lamp = stock.lamp
  if (!lamp) return ''
  const centreY = GROUND - GATE.drop
  return (
    `<radialGradient id="lamp" gradientUnits="userSpaceOnUse" cx="1436" cy="808" r="196">` +
    lamp.stops.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('') +
    '</radialGradient>' +
    `<radialGradient id="spill" gradientUnits="userSpaceOnUse" cx="${GATE.x}" cy="${centreY - 4}" r="190">` +
    lamp.spillStops.map(([offset, part]) => `<stop offset="${offset}" stop-color="${lamp.spill}" stop-opacity="${alpha(part)}"/>`).join('') +
    '</radialGradient>' +
    `<radialGradient id="pool"><stop offset="0" stop-color="${lamp.spill}" stop-opacity="${alpha(lamp.pool)}"/><stop offset="0.5" stop-color="${lamp.spill}" stop-opacity="${alpha(lamp.pool * 0.42)}"/>` +
    `<stop offset="1" stop-color="${lamp.spill}" stop-opacity="0"/></radialGradient>` +
    // The rim light on what stands against the lamp: whole low behind the rock, gone by three quarters of the lamp's reach.
    `<radialGradient id="rim" gradientUnits="userSpaceOnUse" cx="1436" cy="808" r="196"><stop offset="0" stop-color="${lamp.line}"/><stop offset="0.4" stop-color="${lamp.line}" stop-opacity="0.85"/>` +
    `<stop offset="0.62" stop-color="${lamp.line}" stop-opacity="0.35"/><stop offset="0.76" stop-color="${lamp.line}" stop-opacity="0"/></radialGradient>`
  )
}

/** The low stretch of the same wall in the left band: plaster, coping, ground. Nothing stands behind it, so it needs no sky of its own. */
function lowWall(stock: Stock): Built {
  const wall = LOW_WALL
  const fade = fadeMaker(wall, stock.dark ? 40 : 52)
  const ink = fade.paint(stock.ink)
  const line = (share: number): number => alpha(share * stock.line)
  const streaks = stains(wall, [[240, 18, 46], [322, 24, 62], [368, 12, 30]], stock)
  const markup =
    `<path d="M${wall.from} ${wall.eave - 3}L${wall.to} ${wall.eave - 3}L${wall.to} ${GROUND}L${wall.from} ${GROUND}Z" fill="${fade.paint(stock.plaster.colour)}" fill-opacity="${stock.plaster.alpha}"/>` +
    streaks.markup +
    plinth(wall, fade.paint, stock) +
    `<path d="M${wall.to - 0.5} ${wall.eave}V${GROUND}" stroke="${fade.paint(stock.edgeInk ?? stock.ink)}" stroke-width="1" stroke-opacity="${line(0.8)}"/>` +
    coping(wall, fade.paint, stock) +
    groundWash(wall, fade.paint, stock) +
    `<path d="M${wall.from} ${GROUND}L${wall.to} ${GROUND}" stroke="${ink}" stroke-width="1.1" stroke-opacity="${line(0.75)}"/>` +
    `<path d="${tuft(228, GROUND, 9, 21)}" stroke="${stock.tuft ?? ink}" stroke-width="0.9" stroke-opacity="${line(0.7)}"/>` +
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

/** The bamboo's paints on a stock: its own greens, or one ramp down the sheet, or the ink. */
function bambooPaint(stock: Stock): { leaf: string; cane: string; ink: number } {
  if (stock.bambooRamp) return { leaf: 'url(#bam)', cane: 'url(#bam)', ink: stock.bambooInk ?? stock.line }
  return { leaf: stock.bamboo?.leaf ?? stock.ink, cane: stock.bamboo?.cane ?? stock.ink, ink: stock.bambooInk ?? stock.line }
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

    const paint = bambooPaint(stock)
    const tone = culm.tone * paint.ink
    const leaves = `fill="${paint.leaf}" fill-opacity="${alpha(tone * 0.92)}"`
    const stem = (d: string): string => (d ? `<path d="${d}" fill="${paint.cane}" fill-opacity="${alpha(tone * 0.7)}"/>` : '')
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

/** A knot of an outline, in a stone's own units (x to the right, y upward from its foot as a negative number). A third number makes a corner of it. */
type Knot = [number, number] | [number, number, number]

/** One piece of a smooth outline: a quadratic from `a` to `b` pulled toward `c`. `knot` is the outline knot it bends round. */
interface Bend {
  a: Point
  c: Point
  b: Point
  knot: number
}

function mid(first: Point, second: Point): Point {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

/** The pieces of the same smooth ring that `smoothRing` draws through these points: each runs from the midpoint before a point, round it, to the midpoint after. */
function bendsOf(points: Point[], knots: number[]): Bend[] {
  const count = points.length
  return points.map((here, index) => {
    const before = points[(index + count - 1) % count] ?? here
    const after = points[(index + 1) % count] ?? here
    return { a: mid(before, here), c: here, b: mid(here, after), knot: knots[index] ?? 0 }
  })
}

function bendAt(bend: Bend, t: number): Point {
  const u = 1 - t
  return { x: u * u * bend.a.x + 2 * u * t * bend.c.x + t * t * bend.b.x, y: u * u * bend.a.y + 2 * u * t * bend.c.y + t * t * bend.b.y }
}

/** The way a piece runs at t, as a unit vector. */
function bendHeading(bend: Bend, t: number): Point {
  const x = 2 * (1 - t) * (bend.c.x - bend.a.x) + 2 * t * (bend.b.x - bend.c.x)
  const y = 2 * (1 - t) * (bend.c.y - bend.a.y) + 2 * t * (bend.b.y - bend.c.y)
  const length = Math.hypot(x, y)
  if (length > 1e-6) return { x: x / length, y: y / length }
  const chord = Math.hypot(bend.b.x - bend.a.x, bend.b.y - bend.a.y) || 1
  return { x: (bend.b.x - bend.a.x) / chord, y: (bend.b.y - bend.a.y) / chord }
}

/** The stretch of a piece between t0 and t1, itself a quadratic. */
function bendPiece(bend: Bend, t0: number, t1: number): Bend {
  const blend = (p: number, q: number, r: number): number => (1 - t0) * (1 - t1) * p + ((1 - t0) * t1 + t0 * (1 - t1)) * q + t0 * t1 * r
  return { a: bendAt(bend, t0), c: { x: blend(bend.a.x, bend.c.x, bend.b.x), y: blend(bend.a.y, bend.c.y, bend.b.y) }, b: bendAt(bend, t1), knot: bend.knot }
}

/** Pieces written as one path, a new run starting wherever a piece does not begin where the last one ended. */
function bendsPath(bends: Bend[]): string {
  let d = ''
  let last: Point | null = null
  let control: Point | null = null
  for (const bend of bends) {
    const joined = !!last && Math.abs(last.x - bend.a.x) < 0.05 && Math.abs(last.y - bend.a.y) < 0.05
    if (!joined) d += `M${at(bend.a)}`
    // Where the piece runs on smoothly from the last one, its control point is the last one's mirrored, and T says so in half the space.
    const mirrored = joined && control && Math.abs(2 * bend.a.x - control.x - bend.c.x) < 0.08 && Math.abs(2 * bend.a.y - control.y - bend.c.y) < 0.08
    d += mirrored ? `T${at(bend.b)}` : `Q${at(bend.c)} ${at(bend.b)}`
    last = bend.b
    control = bend.c
  }
  return d
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

/** A hole's mouth, in a stone's units: an irregular ring round (x, y) of half sizes rx and ry, turned by `degrees`.
 * A 'tear' draws one end out to a point (turn it so the point hangs where water ran out), a 'kidney' is dented on one side,
 * and every other mouth has one broken corner. */
function mouth(x: number, y: number, rx: number, ry: number, degrees: number, kind: 'oval' | 'tear' | 'kidney', salt: number): Knot[] {
  const turn = (degrees * Math.PI) / 180
  const count = 9
  const corner = Math.floor(hashUnit(0, salt) * count)
  const knots: Knot[] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2 + (hashUnit(index, salt + 1) - 0.5) * 0.3
    let reach = 1 + (hashUnit(index, salt + 2) - 0.5) * 0.24
    if (kind === 'tear' && index === 0) reach = 1.7
    if (kind === 'kidney' && index === 2) reach *= 0.5
    if (kind === 'kidney' && (index === 1 || index === 3)) reach *= 0.85
    const ex = Math.cos(angle) * rx * reach
    const ey = Math.sin(angle) * ry * reach
    const px = x + ex * Math.cos(turn) - ey * Math.sin(turn)
    const py = y + ex * Math.sin(turn) + ey * Math.cos(turn)
    const sharp = kind === 'tear' ? index === 0 : kind === 'oval' ? index === corner : index === 2
    knots.push(sharp ? [px, py, 1] : [px, py])
  }
  return knots
}

/** A hole in a stone. Through it the sky and the bamboo show (透), or it is a blind pocket, dark (漏). `hug` adds a short groove round its lower lip.
 * `share` is how much of a through-hole's mouth is open sky (0.7 if not given): a big hole takes a larger share, so the inner wall seen in it stays a sliver. */
interface Hole {
  knots: Knot[]
  through: boolean
  hug: boolean
  share?: number
}

/** A stone, in its own units. */
interface StoneSpec {
  name: string
  outline: Knot[]
  holes: Hole[]
  /** Small pits: x, y, half width, half height, turn in degrees. */
  pits: Array<[number, number, number, number, number]>
  /** Long grooves the water cut down the stone, each an open line through its knots. */
  grooves: Knot[][]
  /** Where one lobe of the stone overlaps the next (皱): a firmer line running in from a notch of the outline, with shade under its lower side. */
  folds: Knot[][]
  /** The little rings of the 弹子窝 pitting: x, y, radius. */
  rings: Array<[number, number, number]>
  /** Knots of the outline where the line breaks off on the lit side. */
  breaks: number[]
  /** Dots of moss (苔点) in the creases. */
  moss: Array<[number, number]>
  /** How far in from a shaded edge the wash of shade runs, in the stone's units. */
  shade: number
  /** How heavy the shaded contour swells, in the sheet's units. */
  weight: number
  /** A small stone, drawn with one band of shade and no clipping. */
  lean?: boolean
}

/** The stone standing with its foot at (x, y). Its body is first laid in the ground it stands against (`ground`, or the sky itself when that is
 * null), so it hides what is behind it and its through-holes show it. Then, as an ink painter lays a rock: the outline (勾), thin and broken on the
 * lit top and left, swelling on the shaded right and under every overhang; texture strokes (皴) that follow the form: grooves down the column,
 * short ripples on the shaded side of each bulge, rings of pitting; a wash (染) lighter than the strokes, deepening toward the shade and darkest
 * in the undercuts and the blind pockets; and last the moss dots (点). The light falls from the upper left. */
function stone(spec: StoneSpec, x: number, y: number, scale: number, stock: Stock, ground: string | null, backlit = false): Built {
  // A stone standing against the lit courtyard (by night) keeps its line only round its outline, in the colour of the light behind it, so
  // that it stands in silhouette with a lit rim; its holes show the light, with no ring round them that could make an eye of one.
  const lamp = backlit ? stock.lamp : undefined
  // By night its contour is the light behind it: brightest low, where the lamps are, and gone along the crown against the dim top of the arch,
  // so the stone is not ringed by an even pale line (that makes a cut-out of it, and a cartoon creature of every lobe).
  const pen = lamp ? 'url(#rim)' : stock.ink
  // On the lantern night no stone gets a closed pale ring round a hole or a pit: on a dark stone that is an eye.
  const ringless = !!stock.lamp
  const place = (knot: Knot | [number, number]): Point => ({ x: x + knot[0] * scale, y: y + knot[1] * scale })
  const expand = (knots: Knot[]): { points: Point[]; ids: number[] } => {
    const points: Point[] = []
    const ids: number[] = []
    knots.forEach((knot, index) => {
      points.push(place(knot))
      ids.push(index)
      if (knot[2]) {
        points.push(place(knot))
        ids.push(index)
      }
    })
    return { points, ids }
  }
  const ring = (knots: Knot[]): string => smoothRing(expand(knots).points)
  const bendsFor = (knots: Knot[]): Bend[] => {
    const { points, ids } = expand(knots)
    return bendsOf(points, ids)
  }
  const centre = (knots: Knot[]): { x: number; y: number; rx: number; ry: number } => {
    let cx = 0
    let cy = 0
    for (const knot of knots) {
      cx += knot[0] / knots.length
      cy += knot[1] / knots.length
    }
    let rx = 0
    let ry = 0
    for (const knot of knots) {
      rx = Math.max(rx, Math.abs(knot[0] - cx))
      ry = Math.max(ry, Math.abs(knot[1] - cy))
    }
    return { x: cx, y: cy, rx, ry }
  }
  /** The mouth drawn in and set toward one side: for a through-hole the opening seen through it (set toward the lower right, so the inner wall
   * shows as a crescent along the upper left), for a pocket its dark depth (set toward the upper left, so the lit lip shows on the lower right). */
  const shifted = (knots: Knot[], share: number, toward: number): Knot[] => {
    const c = centre(knots)
    return knots.map((knot): Knot => [
      c.x + (knot[0] - c.x) * share + toward * (1 - share) * 0.5 * c.rx,
      c.y + (knot[1] - c.y) * share + toward * (1 - share) * 0.62 * c.ry,
      knot[2] ?? 0,
    ])
  }
  /** The part of a ring on one side of its centre: `side` +1 keeps the lower right, -1 the upper left. */
  const partial = (knots: Knot[], side: number, grow = 1): string => {
    const c = centre(knots)
    const grown = knots.map((knot): Knot => [c.x + (knot[0] - c.x) * grow, c.y + (knot[1] - c.y) * grow, knot[2] ?? 0])
    const cx = x + c.x * scale
    const cy = y + c.y * scale
    return bendsPath(bendsFor(grown).filter(bend => side * (bend.c.x - cx + (bend.c.y - cy) * 1.2) > 0.6 * scale))
  }

  const outlineBends = bendsFor(spec.outline)
  const outline = ring(spec.outline)
  const throughs = spec.holes.filter(hole => hole.through)
  const blinds = spec.holes.filter(hole => !hole.through)
  const throats = throughs.map(hole => shifted(hole.knots, hole.share ?? 0.7, 1))
  const pockets = blinds.map(hole => shifted(hole.knots, 0.58, -1))
  const shape = outline + throats.map(ring).join('')

  // The outline's faces: the ones that look right or down are in shade.
  const footY = y - 4 * scale
  const outward = (bend: Bend, t: number): Point => {
    const heading = bendHeading(bend, t)
    return { x: heading.y, y: -heading.x }
  }
  const shaded = outlineBends.map(bend => {
    const out = outward(bend, 0.5)
    return (out.x > 0.3 || out.y > 0.42) && bendAt(bend, 0.5).y < footY
  })
  // Runs of shaded pieces, each sampled every quarter piece, with the outward normal at every sample.
  const runs: Array<Array<{ p: Point; out: Point }>> = []
  const count = outlineBends.length
  const startAt = shaded.findIndex(value => !value)
  let current: Array<{ p: Point; out: Point }> = []
  for (let step = 0; step <= count; step += 1) {
    const index = (startAt + step) % count
    const bend = outlineBends[index]
    if (step < count && bend && shaded[index]) {
      for (const t of [0, 0.5]) current.push({ p: bendAt(bend, t), out: outward(bend, t) })
    } else if (current.length) {
      const previous = outlineBends[(index + count - 1) % count]
      if (previous) current.push({ p: bendAt(previous, 1), out: outward(previous, 1) })
      if (current.length > 3) runs.push(current)
      current = []
    }
  }
  const inset = (sample: { p: Point; out: Point }, depth: number): Point => ({ x: sample.p.x - sample.out.x * depth, y: sample.p.y - sample.out.y * depth })
  const taper = (index: number, length: number): number => Math.pow(Math.sin((Math.PI * (index + 0.5)) / length), 0.6)
  const openings = spec.holes.map(hole => centre(hole.knots))
  const clear = (point: Point, margin: number): boolean =>
    openings.every(c => {
      const dx = (point.x - (x + c.x * scale)) / ((c.rx + margin) * scale)
      const dy = (point.y - (y + c.y * scale)) / ((c.ry + margin) * scale)
      return dx * dx + dy * dy > 1
    })

  // The wash of shade along every shaded face, three thin layers, each running in less far, so it deepens toward the edge; deeper under an overhang.
  const shadeBand = (share: number, salt: number): string =>
    runs
      .map((run, order) =>
        band(
          run.map(sample => sample.p),
          run.map((sample, index) => {
            const under = sample.out.y > 0.6 ? 1.7 : 1
            return inset(sample, spec.shade * scale * share * under * (0.65 + 0.7 * noise(index / 2, salt + order)) * taper(index, run.length))
          }),
        ),
      )
      .join('')
  // The swelling of the shaded contour: a thin band laid inside the line, thick in the middle of each run and gone at its ends, unevenly, like a brush pressed and lifted.
  const swell = runs
    .map((run, order) =>
      band(
        run.map(sample => sample.p),
        run.map((sample, index) => inset(sample, spec.weight * taper(index, run.length) * (0.55 + 0.9 * noise(index / 1.6, 401 + order)))),
      ),
    )
    .join('')
  // Ripples (皴) on the shaded side of the bulges: short strokes that follow the edge a little way in, one or two together.
  let ripples = ''
  runs.forEach((run, order) => {
    for (let index = 1; index + 2 < run.length; index += 3) {
      if (hashUnit(index, 503 + order) < 0.3) continue
      const depth = (3 + 3 * hashUnit(index, 509 + order)) * scale
      const stroke = [0, 1, 2].map(step => run[index + step]).filter((sample): sample is { p: Point; out: Point } => !!sample)
      const points = stroke.map(sample => inset(sample, depth))
      if (points.length < 3 || !points.every(point => clear(point, 2.5))) continue
      const [first, middle, last] = points
      if (first && middle && last) ripples += `M${at(first)}Q${at(middle)} ${at(last)}`
      if (hashUnit(index, 521 + order) < 0.55) {
        const deeper = stroke.slice(0, 2).map(sample => inset(sample, depth + 2.4 * scale))
        const [from, to] = deeper
        if (from && to && clear(to, 2.5)) ripples += `M${at(from)}L${at(to)}`
      }
    }
  })
  // The outline itself, broken for a moment at the given knots on the lit side.
  const pieces: Bend[] = []
  const broken = new Set<number>()
  for (const bend of outlineBends) {
    if (spec.breaks.includes(bend.knot) && !broken.has(bend.knot)) {
      broken.add(bend.knot)
      pieces.push(bendPiece(bend, 0, 0.3), bendPiece(bend, 0.72, 1))
    } else pieces.push(bend)
  }
  const line = bendsPath(pieces)

  const grooves = spec.grooves.map(groove => smoothPath(groove.map(place))).join('')
  const folds = spec.folds.map(fold => smoothPath(fold.map(place))).join('')
  // Under each fold, a crescent of shade on its lower right, widest in the middle of the fold.
  const foldShade = spec.folds
    .map(fold => {
      const points = fold.map(place)
      const offsets = points.map((point, index) => {
        const before = points[Math.max(0, index - 1)] ?? point
        const after = points[Math.min(points.length - 1, index + 1)] ?? point
        const dx = after.x - before.x
        const dy = after.y - before.y
        const size = Math.hypot(dx, dy) || 1
        let nx = -dy / size
        let ny = dx / size
        if (nx + ny < 0) {
          nx = -nx
          ny = -ny
        }
        const width = 3.2 * scale * Math.pow(Math.sin((Math.PI * index) / Math.max(1, points.length - 1)), 0.8)
        return { x: point.x + nx * width, y: point.y + ny * width }
      })
      return smoothPath(points) + smoothPath(offsets.slice().reverse()).replace('M', 'L') + 'Z'
    })
    .join('')
  const hugs = spec.holes
    .filter(hole => hole.hug)
    .map(hole => partial(hole.knots, 1, 1.45))
    .join('')
  const rims = throats.map(throat => partial(throat, -1)).join('') + pockets.map(pocket => partial(pocket, 1)).join('')
  const pits = spec.pits.map(([px, py, rx, ry, degrees], index) => ring(mouth(px, py, rx, ry, degrees, 'oval', 600 + index))).join('')
  let rings = ''
  for (const [rx, ry, radius] of spec.rings) {
    const p = place([rx, ry])
    const r = round(radius * scale)
    rings += `M${round(p.x - r)} ${round(p.y)}a${r} ${r} 0 1 0 ${round(2 * r)} 0a${r} ${r} 0 1 0 ${round(-2 * r)} 0`
  }
  let moss = ''
  spec.moss.forEach((dab, index) => {
    const p = place(dab)
    moss += `M${at(p)}l${round(0.5 + 0.8 * hashUnit(index, 7))} ${round(-1 - 1.2 * hashUnit(index, 9))}`
  })

  const wash = (share: number): number => alpha(share * stock.wash)
  const ink = (share: number): number => alpha(share * stock.line)
  const dark = stock.tile.colour
  const id = spec.name
  // Each of the three layers of shade: by day a pale grey, so the three together stay lighter than the strokes (染淡于皴).
  const shadeAlpha = stock.dark ? 0.15 : 0.085
  // The wash runs across the stone from its lit upper left to its shaded lower right. By day the ink is dark, so the wash deepens toward the shade;
  // at night the ink is pale moonlight, so it is laid on the lit side instead.
  let top = 0
  let bottom = -1e9
  let left = 1e9
  let right = -1e9
  for (const knot of spec.outline) {
    top = Math.min(top, knot[1])
    bottom = Math.max(bottom, knot[1])
    left = Math.min(left, knot[0])
    right = Math.max(right, knot[0])
  }
  const from = place([left, top])
  const to = place([right, bottom])
  const stops = lamp ? lamp.washStops : stock.dark ? [[0, 0.24], [0.45, 0.1], [1, 0.02]] : [[0, 0], [0.4, 0.05], [1, 0.2]]
  const defs =
    `<linearGradient id="${id}w" gradientUnits="userSpaceOnUse" x1="${round(from.x)}" y1="${round(from.y)}" x2="${round(to.x)}" y2="${round(to.y)}">` +
    // On a solid ground the wash is mixed into it, stop by stop, so the body is laid in one fill; over the sky it is a separate translucent layer.
    stops.map(([offset, share]) => (ground ? `<stop offset="${offset}" stop-color="${mixed(ground, stock.ink, wash(share ?? 0))}"/>` : `<stop offset="${offset}" stop-color="${stock.ink}" stop-opacity="${wash(share ?? 0)}"/>`)).join('') +
    '</linearGradient>' +
    `<path id="${id}" fill-rule="evenodd" clip-rule="evenodd" d="${shape}"/>` +
    (spec.lean === true || spec.outline.length < 16 ? '' : `<clipPath id="${id}c"><use href="#${id}"/></clipPath>`)
  // A small stone needs no clipping: its one band of shade is too thin to spill past a notch.
  const small = spec.lean === true || spec.outline.length < 16
  const body = ground ? `<use href="#${id}" fill="url(#${id}w)"/>` : skyPaintedUse(id, stock.sky) + `<use href="#${id}" fill="url(#${id}w)"/>`
  const crescents = throughs.map(hole => ring(hole.knots)).join('') + throats.map(ring).join('')
  const shades = small
    ? `<path d="${shadeBand(0.8, 311)}" fill="${dark}" fill-opacity="${alpha(shadeAlpha * 1.6)}"/>`
    : `<g clip-path="url(#${id}c)" fill="${dark}"><path d="${shadeBand(1, 311)}" fill-opacity="${shadeAlpha}"/><path d="${shadeBand(0.45, 317)}" fill-opacity="${alpha(shadeAlpha * 1.4)}"/>${foldShade ? `<path d="${foldShade}" fill-opacity="${alpha(shadeAlpha * 1.6)}"/>` : ''}</g>`
  const blindFill = blinds.map(hole => ring(hole.knots)).join('') + pits
  const markup =
    `<g fill-rule="evenodd">${body}` +
    shades +
    (crescents ? `<path d="${crescents}" fill="${dark}" fill-opacity="${stock.dark ? 0.55 : 0.4}"/>` : '') +
    (blindFill ? `<path d="${blindFill}" fill="${dark}" fill-opacity="${stock.dark ? 0.45 : 0.3}"/>` : '') +
    (pockets.length ? `<path d="${pockets.map(ring).join('')}" fill="${dark}" fill-opacity="${stock.dark ? 0.6 : 0.5}"/>` : '') +
    '</g>' +
    // The furrows and folds a little firmer than the ripples and rings, so the column reads as cut by water and not as a smooth post.
    (grooves + folds ? `<path d="${grooves}${folds}" stroke="${stock.ink}" stroke-width="0.75" stroke-opacity="${ink(lamp ? 0.42 : 0.62)}"/>` : '') +
    (ripples + hugs + rings + rims ? `<path d="${ripples}${hugs}${rings}${rims}" stroke="${stock.ink}" stroke-width="0.65" stroke-opacity="${ink(lamp ? 0.3 : 0.5)}"/>` : '') +
    `<path d="${line}${ringless ? '' : spec.holes.map(hole => ring(hole.knots)).join('') + pits}" stroke="${pen}" stroke-width="0.88" stroke-opacity="${ink(0.84)}"/>` +
    (swell ? `<path d="${swell}" fill="${pen}" fill-opacity="${ink(0.8)}"/>` : '') +
    (moss && !lamp ? `<path d="${moss}" stroke="${stock.ink}" stroke-width="1.7" stroke-opacity="${ink(0.85)}"/>` : '')
  return { defs, markup }
}

// The peak in the gate, after 留园's 晚翠峰 and 冠云峰: a stone heavy at the head (上大下小), as 園冶 asks of a single standing stone. From a flared
// foot a lower body rises in lobes of unequal length broken by notches at different heights on its two sides, furrowed down its length by the
// water (long grooves, and folds with their shade); a short arm juts out on the left a little above the middle and ends square, with a hollow at
// its root; above a pinched neck the stone swells into a great head: one big lobe on its left, a square corner, a crown bowed up and highest in its
// middle, a small crack, and a lower squarish block leaning out to the right. There the head curls over like a wave, tucks its lip under, and
// comes down onto the body again as a bridge of stone, so that the biggest opening (透) is a wide bitten gap at the stone's edge under the curl,
// with the bamboo (or, by night, the lamplight) showing through it: too big and too near the edge to be read as an eye. No other opening is in the
// head, and no pit (a lone dark dot on a head is an eye). A slot runs down through the lower body (漏), and blind pockets and pits of every size
// lie on the neck and body so that no two openings sit level. Its sharp turns are the arm, the corner of the head and the foot.
const PEAK: StoneSpec = {
  name: 'pk',
  outline: [
    // the flared foot, a lower lobe, a near-straight run up to the arm
    [-37, 0, 1], [-45, -6], [-45, -15], [-38, -22, 1], [-44, -32], [-46, -46], [-34, -62, 1], [-31, -76], [-30, -88], [-26, -94, 1],
    // the short arm, ending square
    [-37, -99], [-47, -104, 1], [-45, -114], [-31, -120, 1],
    // the neck, hollow, to the waist
    [-24, -133], [-18, -146, 1],
    // the left of the head: one big lobe swelling out from the waist, a notch, a small lobe up to a square corner
    [-30, -151], [-42, -160], [-47, -176], [-47, -194], [-43, -207], [-37, -214, 1], [-43, -224], [-40, -236, 1],
    // the top: a crown bowed up from the square corner, highest in its middle, a small crack, and a lower squarish block leaning out over the curl
    [-30, -244], [-14, -250], [4, -254], [22, -255], [38, -252], [50, -247, 1], [58, -249], [70, -246, 1], [79, -240],
    // the curl's face, its lip tucked under, and the curl coming down again onto the body as a bridge of stone round the great opening
    [82, -230, 1], [89, -220], [90, -208], [84, -199, 1], [90, -188], [87, -175], [79, -165, 1], [76, -156], [69, -147], [63, -141, 1],
    // the right side down: lobes of every length between notches set at other heights than the left's
    [59, -128], [53, -116], [45, -104, 1], [50, -92], [50, -80], [44, -72, 1], [49, -62], [47, -50], [41, -42, 1], [45, -30], [47, -14], [43, 0, 1],
  ],
  holes: [
    // the great opening under the curl, where the curl has come down onto the body again: a wide bitten hole at the stone's edge, through which
    // the bamboo (or, by night, the light) shows (透); too big and too near the edge to be read as an eye
    { knots: [[45, -190], [53, -199], [65, -197], [73, -187], [74, -174], [68, -161], [63, -149, 1], [57, -155], [54, -165], [51, -178]], through: true, hug: false, share: 0.86 },
    // a pocket in the root of the arm
    { knots: mouth(-36, -110, 4.6, 3.2, -14, 'kidney', 15), through: false, hug: false },
    // a slot right down through the lower body (漏)
    { knots: mouth(4, -86, 3.6, 10, 4, 'oval', 9), through: true, hug: false },
    // a kidney-shaped pocket low on the body
    { knots: mouth(-10, -40, 6, 4, -8, 'kidney', 7), through: false, hug: true },
  ],
  // Pits only on the neck and the body: on the head a lone dark dot is read as an eye.
  pits: [[14, -66, 1.8, 2.4, 10], [-22, -22, 2.4, 1.7, 30], [10, -10, 1.8, 1.4, 0], [-22, -127, 1.6, 2.2, 0], [38, -120, 2, 1.5, 20]],
  // The water's furrows: long, a little wavy, broken, most of them on the shaded half of the column.
  grooves: [
    [[33, -92], [35, -78], [33, -64]],
    [[10, -50], [8, -34], [10, -17]],
    [[-16, -86], [-18, -73], [-16, -60]],
    [[33, -46], [35, -31], [33, -16]],
    [[-26, -40], [-28, -26], [-26, -12]],
    [[16, -236], [14, -220], [16, -206]],
    [[-6, -186], [-8, -170], [-6, -156]],
    [[26, -150], [28, -136]],
    [[-30, -204], [-32, -190]],
    [[56, -238], [60, -224], [58, -212]],
  ],
  // From every notch a fold runs in, with its shade under it; two long ones run down the column as furrows.
  folds: [
    [[-38, -22], [-31, -21], [-25, -18]],
    [[-34, -62], [-27, -60], [-21, -56]],
    [[-26, -94], [-19, -92], [-13, -89]],
    [[-31, -120], [-24, -117], [-18, -113]],
    [[-18, -146], [-11, -144], [-5, -140]],
    [[-37, -214], [-30, -212], [-24, -208]],
    [[82, -230], [75, -227], [67, -226]],
    [[84, -199], [78, -200]],
    [[79, -165], [75, -166]],
    [[63, -141], [57, -140]],
    [[45, -104], [39, -102], [34, -98]],
    [[44, -72], [38, -70], [33, -66]],
    [[41, -42], [35, -40], [30, -36]],
    [[24, -112], [21, -94], [23, -76], [21, -58]],
    [[-4, -78], [-6, -60], [-4, -44], [-6, -28]],
  ],
  rings: [[4, -34, 1.5], [7, -31, 1.1], [3, -29, 1], [-16, -135, 1.4], [-13, -132, 1], [-17, -131, 0.9], [-32, -214, 1.2], [-29, -211, 0.9], [-33, -210, 0.8]],
  breaks: [7, 18, 25, 28],
  moss: [[-31, -120], [-28, -119], [63, -141], [-18, -146], [-34, -62], [-37, -214]],
  shade: 11,
  weight: 1.4,
}

// A low stone at the peak's foot; a smaller one and a pebble are drawn plainly in `peakBed`.
const FOOT_STONES: Array<{ spec: StoneSpec; x: number; y: number }> = [
  {
    spec: {
      name: 'q0',
      outline: [[-13, 0, 1], [-14, -4], [-12, -9], [-7, -13], [-2, -12, 1], [3, -16], [8, -15], [12, -11], [13, -6], [12, 0, 1]],
      holes: [],
      pits: [[5, -9, 1.6, 1.2, 10]],
      grooves: [],
      folds: [[[-2, -12], [1, -8], [2, -4]]],
      rings: [],
      breaks: [3],
      moss: [[-8, -2], [9, -1]],
      shade: 4,
      weight: 0.9,
      lean: true,
    },
    x: 1433,
    y: 828,
  },
]

// The stone beside the banana (蕉石): a squat companion nearly as tall as it is wide, wider at its top than its foot, notched under on both sides,
// its top in two lobes of unequal height, the higher one leaning toward the stems. Its one through-hole is a low hollow at its foot, not a
// socket in its face; a small pocket sits higher on the other side, so the openings never line up into a face. It stands just behind the
// clump, so the oldest leaf hangs down in front of it.
const BANANA_STONE: StoneSpec = {
  name: 'cs',
  outline: [
    [-26, 0, 1], [-29, -5], [-27, -11, 1], [-31, -17], [-33, -26], [-29, -32, 1], [-27, -39], [-20, -45], [-13, -44, 1], [-6, -50],
    [3, -54], [10, -51, 1], [16, -57], [24, -59], [30, -53], [33, -44], [30, -36, 1], [25, -31], [25, -21], [22, -13, 1],
    [25, -6], [24, 0, 1],
  ],
  holes: [
    // a low hollow right through under the left lobe, where the stone stands on the ground: a little cave at its foot, not an eye in its face
    { knots: mouth(-13, -10, 5.2, 2.6, -8, 'kidney', 51), through: true, hug: false, share: 0.72 },
    // a pocket where the notch under the right lobe runs in
    { knots: mouth(21, -33, 3.2, 1.8, 10, 'kidney', 53), through: false, hug: false },
  ],
  pits: [],
  grooves: [[[-4, -36], [-6, -25], [-4, -14]], [[-17, -38], [-19, -28]]],
  folds: [[[-27, -11], [-22, -14]], [[-29, -32], [-23, -31]], [[10, -51], [12, -45], [13, -39]], [[30, -36], [23, -37], [17, -35]]],
  rings: [[21, -45, 1.1], [23.5, -43, 0.8], [20, -42, 0.7]],
  breaks: [7],
  moss: [[-21, -2], [-15, -1], [18, -2], [28, -35]],
  shade: 7,
  weight: 1.1,
  lean: true,
}

/** What lies behind a thing beyond the gate, low down: the sky with the haze over the far ground laid on it. */
function beyondGround(stock: Stock, x: number, y: number): string {
  // By night the things beyond the gate stand against the lamp: their ground is the dark of a silhouette.
  if (stock.lamp) return stock.lamp.ground
  const distance = Math.hypot((x - GATE.x) / 112, (y - (GROUND - 26)) / 30)
  const share = distance >= 1 ? 0 : distance < 0.6 ? 0.8 - (0.44 * distance) / 0.6 : 0.36 * (1 - (distance - 0.6) / 0.4)
  return mixed(skyAt(stock.sky, x, y), stock.plaster.colour, (stock.haze ?? stock.plaster.alpha) * share)
}

/** The low planted bed the peak rises from: a gentle mound over its foot, the two low stones and a pebble half sunk in it, tufts of mondo grass, moss dots. */
function peakBed(stock: Stock): Built {
  const line = (share: number): number => alpha(share * stock.line)
  const d = 'M1372 828Q1380 821 1390 819.5Q1402 818 1414 818.6Q1430 819.2 1446 822Q1458 824.5 1470 828Z'
  const stones = FOOT_STONES.map(entry => stone(entry.spec, entry.x, entry.y, 1, stock, beyondGround(stock, entry.x, entry.y - 6), true))
  // By night the bed stands against the lamp: its lines are the light caught along its edges, the grass glows, the moss is not seen.
  const pen = stock.lamp ? stock.lamp.line : stock.ink
  const grass = stock.lamp ? stock.lamp.line : stock.tuft ?? stock.ink
  // A smaller stone left of the foot and a pebble right of it, each a single wash and line.
  const pebbles = smoothRing([[-8, 0], [-8, 0], [-9, -4], [-6, -8], [-1, -9], [-1, -9], [3, -10], [7, -7], [8, -3], [8, 0], [8, 0]].map(([px, py]) => ({ x: 1388 + (px ?? 0), y: 828 + (py ?? 0) }))) +
    smoothRing([[-4, 0], [-4, 0], [-4.5, -2], [-1, -4], [3, -3.5], [4.5, 0], [4.5, 0]].map(([px, py]) => ({ x: 1454 + (px ?? 0), y: 828 + (py ?? 0) })))
  const markup =
    `<path d="${d}" fill="${beyondGround(stock, 1412, 824)}"/>` +
    `<path d="${d}" fill="${stock.ink}" fill-opacity="${alpha(0.05 * stock.wash)}"/>` +
    `<path d="M1374 827.4Q1380 821 1390 819.5Q1402 818 1408 818.2M1417 818.7Q1430 819.2 1446 822Q1458 824.5 1468 827.6" stroke="${pen}" stroke-width="0.8" stroke-opacity="${line(0.55)}"/>` +
    stones.map(entry => entry.markup).join('') +
    `<path d="${pebbles}" fill="${mixed(beyondGround(stock, 1420, 824), stock.ink, alpha(0.1 * stock.wash))}" stroke="${pen}" stroke-width="0.85" stroke-opacity="${line(0.8)}"/>` +
    `<path d="M1393.4 826.4Q1395.6 823.6 1395.8 820.8M1457.6 827.4Q1458.8 826 1458.4 824.8" stroke="${pen}" stroke-width="1.2" stroke-opacity="${line(0.55)}"/>` +
    `<path d="${tuft(1392, 820.5, 9, 31)}${tuft(1397, 820, 6, 32)}${tuft(1421, 820.5, 8, 35)}${tuft(1462, 827, 7, 36)}${tuft(1512, GROUND - 5, 7, 39)}" stroke="${grass}" stroke-width="0.85" stroke-opacity="${line(0.72)}"/>` +
    (stock.lamp ? '' : `<path d="M1384 820l.7-1.6M1401.5 818.4l.9-1.4M1413 818.8l.6-1.7M1441 821.6l.8-1.2M1379 823.4l.6-1.4" stroke="${stock.ink}" stroke-width="1.7" stroke-opacity="${line(0.85)}"/>`)
  return { defs: stones.map(entry => entry.defs).join(''), markup }
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

/** A colour laid over another, as a wash would be. */
function mixed(under: string, over: string, share: number): string {
  const a = channels(under)
  const b = channels(over)
  return '#' + a.map((value, index) => Math.round(value + ((b[index] ?? 0) - value) * share).toString(16).padStart(2, '0')).join('')
}

/** The pale ground of the plant's leaves and stems: the sky there with a breath of the wall's plaster in it, so that they hide what is behind them and stand a little lighter than the sky. */
function bananaGround(stock: Stock, x: number, y: number): string {
  return mixed(skyAt(stock.sky, x, y), stock.plaster.colour, stock.plaster.alpha * 0.7)
}

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
  if (own) {
    // Its own colours: the blade from the paler back leaves (tone 0.55 and under) to the front ones (tone 1), an underside turned up a
    // little paler still; the narrow half in a deeper green; the midrib and veins pale; the outline (by night, the warm edge of the light).
    const front = Math.min(1, Math.max(0, (tone - 0.55) / 0.45))
    let blade = mixed(own.back, own.blade, front)
    if (leaf.pale) blade = mixed(blade, own.rib, 0.22)
    if (own.ramp) blade = tone >= 0.8 ? 'url(#bnf)' : 'url(#bnb)'
    return {
      defs: '',
      markup:
        `<path d="${outline}" fill="${blade}" stroke="${own.line}" stroke-width="0.95" stroke-opacity="${alpha(own.lineAlpha * (0.6 + 0.4 * tone))}"/>` +
        (leaf.half >= 12 ? `<path d="${shade}" fill="${own.shade}" fill-opacity="${alpha(own.shadeAlpha * (leaf.pale ? 0.6 : 1))}"/>` : '') +
        `<path d="${band(ribLeft, ribRight)}${veins}" fill="${own.rib}" fill-opacity="${alpha(own.ribAlpha * (0.7 + 0.3 * tone))}"/>`,
    }
  }
  const fill = leaf.pale ? 0.045 : 0.11
  // The opaque ground and the wash over it are one colour, laid once.
  const markup =
    `<path d="${outline}" fill="${mixed(bananaGround(stock, middle.x, middle.y), stock.ink, alpha(fill * tone * stock.wash))}" stroke="${stock.ink}" stroke-width="0.95" stroke-opacity="${alpha(0.74 * tone * stock.line)}"/>` +
    (leaf.half >= 12 ? `<path d="${shade}" fill="${stock.ink}" fill-opacity="${alpha((leaf.pale ? 0.07 : 0.12) * tone * stock.wash)}"/>` : '') +
    `<path d="${band(ribLeft, ribRight)}${veins}" fill="${stock.ink}" fill-opacity="${alpha(0.72 * tone * stock.line)}"/>`
  return { defs: '', markup }
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
  const ground = bananaGround(stock, stem.foot.x, stem.foot.y - height / 2)
  const tone = stem.tone
  const own = stock.banana
  if (own) {
    const body = mixed(own.back, own.stem, Math.min(1, Math.max(0, (tone - 0.55) / 0.45)))
    return (
      `<path d="${d}" fill="${body}" stroke="${own.line}" stroke-width="0.95" stroke-opacity="${alpha(own.lineAlpha * (0.6 + 0.4 * tone))}"/>` +
      `<path d="${sheaths}" stroke="${own.line}" stroke-width="0.55" stroke-opacity="${alpha(own.lineAlpha * 0.5)}"/>` +
      `<path d="${shreds}" stroke="${own.shred}" stroke-width="0.8" stroke-opacity="0.85"/>` +
      (stem.tone === 1 ? `<path d="${blotches}" stroke="${own.blotch}" stroke-width="1.3" stroke-opacity="0.5"/>` : '')
    )
  }
  return (
    `<path d="${d}" fill="${mixed(ground, stock.ink, alpha(0.12 * tone * stock.wash))}" stroke="${stock.ink}" stroke-width="0.95" stroke-opacity="${alpha(0.74 * tone * stock.line)}"/>` +
    `<path d="${sheaths}${shreds}" stroke="${stock.ink}" stroke-width="0.55" stroke-opacity="${alpha(0.42 * tone * stock.line)}"/>` +
    (stem.tone === 1 ? `<path d="${blotches}" stroke="${stock.ink}" stroke-width="1.3" stroke-opacity="${alpha(0.3 * tone * stock.line)}"/>` : '')
  )
}

/** The new leaf still rolled (蕉心), standing up out of the main stem: a pale slender spindle, pointed, the edge of its outer layer winding once round it. */
function furledLeaf(stock: Stock): string {
  const d = 'M327.6 762Q326 744 326.8 730Q327.4 722 329.2 715Q331.2 722 332.2 730Q333.8 746 334.6 762Z'
  const own = stock.banana
  if (own)
    return (
      `<path d="${d}" fill="${own.heart}" stroke="${own.line}" stroke-width="0.9" stroke-opacity="${alpha(own.lineAlpha)}"/>` +
      `<path d="M327.2 752Q330.4 744 333.2 734Q331.6 730 329.4 724" stroke="${own.line}" stroke-width="0.6" stroke-opacity="${alpha(own.lineAlpha * 0.6)}"/>`
    )
  return (
    `<path d="${d}" fill="${mixed(bananaGround(stock, 330, 738), stock.ink, alpha(0.05 * stock.wash))}" stroke="${stock.ink}" stroke-width="0.9" stroke-opacity="${alpha(0.74 * stock.line)}"/>` +
    `<path d="M327.2 752Q330.4 744 333.2 734Q331.6 730 329.4 724" stroke="${stock.ink}" stroke-width="0.6" stroke-opacity="${alpha(0.5 * stock.line)}"/>`
  )
}

/** A dead leaf hanging folded down against the main stem (一葉舒則一葉焦): a narrow strip, darker and dry, frayed at its end. */
function deadLeaf(stock: Stock): string {
  const d = 'M328.4 773Q322 781 320.8 795Q319.8 809 321.6 823L320 828L322.8 826.4L323.6 831L325 825.6Q324.8 809 326 796Q327.2 783 331 776Z'
  const own = stock.banana
  if (own)
    return (
      `<path d="${d}" fill="${own.dead}" stroke="${own.deadLine}" stroke-width="0.8" stroke-opacity="0.7"/>` +
      `<path d="M329.2 775Q323.8 787 323.2 803Q323 815 323.4 823" stroke="${own.deadLine}" stroke-width="0.5" stroke-opacity="0.5"/>`
    )
  return (
    `<path d="${d}" fill="${mixed(bananaGround(stock, 323, 800), stock.ink, alpha(0.24 * stock.wash))}" stroke="${stock.ink}" stroke-width="0.8" stroke-opacity="${alpha(0.66 * stock.line)}"/>` +
    `<path d="M329.2 775Q323.8 787 323.2 803Q323 815 323.4 823" stroke="${stock.ink}" stroke-width="0.5" stroke-opacity="${alpha(0.45 * stock.line)}"/>`
  )
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
  const companion = stone(BANANA_STONE, 262, GROUND + 1, 1, stock, mixed(skyAt(stock.sky, 262, 810), stock.plaster.colour, stock.stoneLift ?? stock.plaster.alpha * 0.5))
  const ramp = stock.banana?.ramp
  if (ramp)
    defs += ([['bnf', ramp.front], ['bnb', ramp.back]] as Array<[string, readonly [string, string]]>)
      .map(([id, [high, low]]) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${ramp.from}" x2="0" y2="${ramp.to}"><stop offset="0" stop-color="${high}"/><stop offset="1" stop-color="${low}"/></linearGradient>`)
      .join('')
  defs += companion.defs
  const line = (share: number): number => alpha(share * stock.line)
  const markup =
    (older ? pseudostem(older, stock) : '') +
    leaves(LEAVES.slice(0, 2)) +
    companion.markup +
    (main ? pseudostem(main, stock) : '') +
    leaves(LEAVES.slice(2)) +
    leaves(FRONT_LEAVES.slice(0, 1)) +
    furledLeaf(stock) +
    leaves(FRONT_LEAVES.slice(1)) +
    deadLeaf(stock) +
    (sucker ? pseudostem(sucker, stock) : '') +
    leaves(SUCKER_LEAVES) +
    `<path d="${tuft(318, GROUND + 1, 12, 61)}${tuft(327, GROUND + 1, 9, 62)}${tuft(349, GROUND + 1, 11, 63)}${tuft(375, GROUND + 1, 8, 64)}${tuft(399, GROUND + 1, 10, 65)}${tuft(240, GROUND + 1, 8, 66)}${tuft(289, GROUND + 1, 9, 67)}" stroke="${stock.tuft ?? stock.ink}" stroke-width="0.85" stroke-opacity="${line(0.7)}"/>`
  return { defs, markup }
}

// ---------------------------------------------------------------------------------------------------------------
// The small things

/** A lens of bare sky: a thin bar of cloud across the disc, or a bank of mist a wall sinks into. It takes the sky's colour where it lies and does not move. */
function mistMaker(sky: Sky, tone = '#ffffff', lift = 0): { bank: (cx: number, cy: number, rx: number, ry: number, peak: number, share?: number) => string; defs: () => string } {
  const gradients: string[] = []
  return {
    // `share` takes only part of the lift: a bank whose edge reaches into the reading column stays nearly the colour of the air there.
    bank(cx, cy, rx, ry, peak, share = 1) {
      const id = `m${gradients.length}`
      const colour = lift > 0 ? mixed(skyAt(sky, cx, cy), tone, lift * share) : skyAt(sky, cx, cy)
      if (peak <= 0) return ''
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
    `d="${leaf(x, y, angle, length, 2)}" fill="${bambooPaint(stock).leaf}" fill-opacity="${alpha(0.8 * bambooPaint(stock).ink)}"/>`
  )
}

/** The whole sheet on one stock. */
function moonGateSheet(stock: Stock): string {
  const wall = gateWall(stock)
  const low = lowWall(stock)
  const peak = stone(PEAK, 1392, GROUND - 6, 0.68, stock, beyondGround(stock, 1412, 740), true)
  const bed = peakBed(stock)
  const plant = bananaPlant(stock)
  const mist = mistMaker(stock.sky, stock.plaster.colour, stock.mistLift ?? 0)
  const onWall = stock.wallMist ?? 1
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
    (stock.halo > 0 ? `<circle cx="1492" cy="198" r="${stock.haloR ?? 78}" fill="url(#halo)"/>` : '') +
    `<circle cx="1492" cy="198" r="23" fill="${stock.disc}" fill-opacity="${stock.discAlpha ?? 0.9}"/>` +
    mist.bank(1482, 208, 66, 4.6, 1) +
    mist.bank(1510, 219, 40, 2.6, 1)

  // Beyond the gate: the far edge of the sill, the bamboo, the peak in front of it rising from its planted bed.
  // By night the courtyard beyond is lit: the light fills the opening, laid before the bamboo and the peak so they stand dark against it.
  const beyond =
    (stock.lamp ? `<path d="${gateOpening()}" fill="url(#lamp)"/>` : `<ellipse cx="${GATE.x}" cy="${GROUND - 26}" rx="112" ry="30" fill="url(#haze)"/>`) +
    `<path d="M1330 ${GROUND - 5}L1560 ${GROUND - 5}" stroke="${stock.lamp ? stock.lamp.line : stock.ink}" stroke-width="0.8" stroke-opacity="${line(0.5)}"/>` +
    bamboo(stock) +
    peak.markup +
    bed.markup

  const drawing = `${disc}
${beyond}
${wall.markup}${stock.lamp ? `<ellipse cx="${GATE.x}" cy="${GROUND + 5}" rx="150" ry="13" fill="url(#pool)"/>` : ''}${mist.bank(1258, 806, 96, 30, 0.9 * onWall, 0.35)}${mist.bank(1236, 536, 80, 15, 0.9 * onWall, 0.4)}${mist.bank(1284, 672, 58, 12, 0.4 * onWall)}
${fallingLeaf('fa', 1318, 466, 28, 38, 9, stock)}${fallingLeaf('fb', 1344, GROUND + 2.5, 8, 53, 46.6, stock)}
${low.markup}${mist.bank(408, 802, 84, 26, 0.9 * onWall, 0.2)}${mist.bank(424, 730, 64, 12, 0.8 * onWall, 0.2)}
${plant.markup}
${seal(236, 858, stock)}`

  const defs =
    skyDefs(stock.sky) +
    mist.defs() +
    (stock.lamp
      ? ''
      : `<radialGradient id="haze"><stop offset="0" stop-color="${stock.plaster.colour}" stop-opacity="${alpha((stock.haze ?? stock.plaster.alpha) * 0.8)}"/><stop offset="0.6" stop-color="${stock.plaster.colour}" stop-opacity="${alpha((stock.haze ?? stock.plaster.alpha) * 0.36)}"/><stop offset="1" stop-color="${stock.plaster.colour}" stop-opacity="0"/></radialGradient>`) +
    (stock.halo > 0 ? `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.haloColour ?? stock.disc}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.haloColour ?? stock.disc}" stop-opacity="0"/></radialGradient>` : '') +
    lampDefs(stock) +
    (stock.bambooRamp
      ? `<linearGradient id="bam" gradientUnits="userSpaceOnUse" x1="0" y1="${stock.bambooRamp.from}" x2="0" y2="${stock.bambooRamp.to}">` +
        stock.bambooRamp.stops.map(([offset, colour]) => `<stop offset="${offset}" stop-color="${colour}"/>`).join('') +
        '</linearGradient>'
      : '') +
    wall.defs +
    low.defs +
    peak.defs +
    bed.defs +
    plant.defs

  const sky = `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>` + stock.sky.glows.map((_, index) => `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow${index})"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${defs}</defs>
${sky}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${drawing}
</g>
</svg>`
}

/** Moon Gate on any of its skies. */
export function sceneSvg(stock: 'dayNatural' | 'nightLantern' | 'dayInk' | 'nightInk' | 'day' | 'night' | 'nightWine'): string {
  return moonGateSheet(
    stock === 'dayNatural' ? STOCKS.dayNatural : stock === 'nightLantern' ? STOCKS.nightLantern :
    stock === 'dayInk' ? STOCKS.dayInk : stock === 'nightInk' ? STOCKS.nightInk : stock === 'day' ? STOCKS.day : stock === 'night' ? STOCKS.nightBlue : STOCKS.night,
  )
}

/** Moon Gate on a clear day (晴日写真), for a light window: white walls, 黛 tiles, green bamboo and banana, grey stone, under a soft blue sky. */
export function daySvg(): string {
  return sceneSvg('dayNatural')
}

/** Moon Gate on a garden night (灯影夜游), for a dark window: wine-ink air, a small pale moon, the courtyard beyond the gate lit amber-gold. */
export function nightSvg(): string {
  return sceneSvg('nightLantern')
}
