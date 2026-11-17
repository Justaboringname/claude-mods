// Lattice Windows: two whitewashed garden walls under dark tile copings (粉墙黛瓦), one behind the other, in the right band of the sheet.
// Both come out of the mist on their left (the low mist takes a wall's foot before its coping) and run off the sheet on their right.
// The far wall is the longer one: it has an octagonal window filled with ice-crack lattice, and a grove of ink bamboo stands in front
// of its bare plaster; the shadows of bamboo leaves lie on that plaster and across the window's corner. The near wall hides the foot
// of the bamboo; it has a square window filled with crabapple lattice, and the canes show dimly through it.
// In the left band a lower wall (its coping well below the near one on the right, so the two never read as one horizon) ends on the
// sheet in an upturned ridge. It has a fan-shaped opening; a magnolia bough passes behind it, shows in the fan and rises over the
// coping as woody stems with upright white flowers, and a pair of swallows crosses the sky above.
// Each wall is a wash a little lighter than the sky that fades to bare sky at a level mist line, as the ridges of Ink Mountains do.
// Motion: the leaf shadows drift on the wall, the bamboo nods, a few leaves stir behind the crabapple window, the swallows
// glide, mist drifts. The ground is the dusk sky of Ink Mountains. Pure string building, no imports, the same string on every call.

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

/** The ground the walls stand against: a vertical run of colours with glows laid over it. It takes the place of
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
  /** The limewash of a wall, and how much of it lies over the sky under the eave. */
  lime: string
  limeAlpha: number
  /** How far a lattice bar is taken from the sky towards the limewash. */
  bar: number
  /** The shade inside an opening and under an eave, and the grey of a brick frame. */
  shade: string
  shadeAlpha: number
  brickAlpha: number
  /** The shadow that leaves cast on a wall: a cooler tone than any ink on the sheet, so it reads as shade on plaster and not as faded leaves. */
  shadowInk: string
  shadowAlpha: number
  /** How much deeper than the eave's shade the inside of a pierced window is. */
  hole: number
  /** The colour of the tiles, how much of it the tile slope and the ridge take, and how strongly the round caps and drips along the eave are inked.
   * By day the tiles are dark ink; by night they are dark against the moonlit plaster, and the pale ink only catches their edges. */
  tileInk: string
  tile: number
  ridge: number
  rows: number
  /** The rows of tiles down the slope: each a pale hairline where the rounded cover tile catches the light, and a dark one in the channel beside it. */
  rib: number
  groove: number
  /** The same for pen lines. */
  line: number
  petal: string
  petalAlpha: number
  /** The line round each petal: dark ink by day; by night a dark line too, so the pale petals keep apart from one another. */
  petalLine: string
  petalLineAlpha: number
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
    ink: '#2b2338', disc: '#ee6a2c', seal: '#c2422b', lime: '#ffffff', limeAlpha: 0.66, bar: 0.86,
    shade: '#2b2338', shadeAlpha: 0.17, brickAlpha: 0.3, shadowInk: '#46467e', shadowAlpha: 0.15, hole: 1.8,
    tileInk: '#2b2338', tile: 0.7, ridge: 0.9, rows: 0.9, rib: 0.2, groove: 0.3, line: 1,
    petal: '#ffffff', petalAlpha: 0.94, petalLine: '#2b2338', petalLineAlpha: 0.74, halo: 0,
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
    ink: '#e4d4d8', disc: '#f79a4b', seal: '#b4472e', lime: '#e4d4d8', limeAlpha: 0.15, bar: 0.34,
    shade: '#0b070c', shadeAlpha: 0.5, brickAlpha: 0.42, shadowInk: '#06050c', shadowAlpha: 0.32, hole: 1,
    tileInk: '#0b070c', tile: 0.4, ridge: 0.56, rows: 0.62, rib: 0.17, groove: 0.3, line: 0.8,
    petal: '#f3e6ea', petalAlpha: 0.84, petalLine: '#2b1a24', petalLineAlpha: 0.55, halo: 0.14,
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
    ink: '#dcd6e8', disc: '#f79a4b', seal: '#b4472e', lime: '#dcd6e8', limeAlpha: 0.15, bar: 0.34,
    shade: '#07070d', shadeAlpha: 0.5, brickAlpha: 0.42, shadowInk: '#04050c', shadowAlpha: 0.32, hole: 1,
    tileInk: '#07070d', tile: 0.4, ridge: 0.56, rows: 0.62, rib: 0.17, groove: 0.3, line: 0.8,
    petal: '#ebe6f4', petalAlpha: 0.84, petalLine: '#1c1a2e', petalLineAlpha: 0.55, halo: 0.14,
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

/** A path painted with the sky, layer by layer: an opaque piece of sky in the path's shape. A wall stands on one, so it hides what is behind it and still fades into the same sky. */
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

/** Two places of decimals: the lattices are drawn to this. */
function fine(value: number): number {
  return Math.round(value * 100) / 100
}

/** An opacity, kept in 0..1 and short. */
function alpha(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 1000) / 1000
}

/** One colour taken part of the way to another. */
function mix(from: string, to: string, part: number): string {
  const a = channels(from)
  const b = channels(to)
  return '#' + a.map((value, at) => Math.round(value + ((b[at] ?? 0) - value) * part).toString(16).padStart(2, '0')).join('')
}

function at(x: number, y: number): string {
  return `${round(x)} ${round(y)}`
}

/** Ink that is whole at `top` and gone at `bottom`: the paint of a wall's end, so the line dissolves into the mist as the wash does. */
function fadingInk(id: string, top: number, bottom: number, ink: string): string {
  return (
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${round(top)}" x2="0" y2="${round(bottom)}">` +
    `<stop offset="0" stop-color="${ink}"/><stop offset="0.5" stop-color="${ink}" stop-opacity="0.72"/>` +
    `<stop offset="0.85" stop-color="${ink}" stop-opacity="0.16"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></linearGradient>`
  )
}

function closed(points: Point[]): string {
  return 'M' + points.map(point => `${fine(point.x)} ${fine(point.y)}`).join('L') + 'Z'
}

function squareAround(cx: number, cy: number, half: number): Point[] {
  return [
    { x: cx - half, y: cy - half },
    { x: cx + half, y: cy - half },
    { x: cx + half, y: cy + half },
    { x: cx - half, y: cy + half },
  ]
}

/** A regular octagon standing on a flat side; `half` is half its width. */
function octagonAround(cx: number, cy: number, half: number): Point[] {
  const corner = half * (Math.SQRT2 - 1)
  return [
    { x: cx - corner, y: cy - half },
    { x: cx + corner, y: cy - half },
    { x: cx + half, y: cy - corner },
    { x: cx + half, y: cy + corner },
    { x: cx + corner, y: cy + half },
    { x: cx - corner, y: cy + half },
    { x: cx - half, y: cy + corner },
    { x: cx - half, y: cy - corner },
  ]
}

function areaOf(points: Point[]): number {
  let sum = 0
  for (let index = 0; index < points.length; index += 1) {
    const here = points[index]
    const next = points[(index + 1) % points.length]
    if (here && next) sum += here.x * next.y - next.x * here.y
  }
  return Math.abs(sum) / 2
}

function middleOf(points: Point[]): Point {
  let x = 0
  let y = 0
  for (const point of points) {
    x += point.x
    y += point.y
  }
  return { x: x / points.length, y: y / points.length }
}

interface Cut {
  first: Point[]
  second: Point[]
  from: Point
  to: Point
}

/** A convex piece cut in two by the straight line through `through` at `angle`. */
function cutPiece(piece: Point[], through: Point, angle: number): Cut | null {
  const normalX = -Math.sin(angle)
  const normalY = Math.cos(angle)
  const sides = piece.map(point => (point.x - through.x) * normalX + (point.y - through.y) * normalY)
  const first: Point[] = []
  const second: Point[] = []
  const ends: Point[] = []
  for (let index = 0; index < piece.length; index += 1) {
    const here = piece[index]
    const next = piece[(index + 1) % piece.length]
    const sideHere = sides[index] ?? 0
    const sideNext = sides[(index + 1) % piece.length] ?? 0
    if (!here || !next) continue
    if (sideHere >= 0) first.push(here)
    else second.push(here)
    if (sideHere >= 0 !== sideNext >= 0) {
      const part = sideHere / (sideHere - sideNext)
      const crossing = { x: here.x + (next.x - here.x) * part, y: here.y + (next.y - here.y) * part }
      first.push(crossing)
      second.push(crossing)
      ends.push(crossing)
    }
  }
  const from = ends[0]
  const to = ends[1]
  if (ends.length !== 2 || !from || !to) return null
  return { first, second, from, to }
}

/** Ice-crack lattice (冰裂纹): the opening is broken again and again, always the largest piece, by a straight crack that runs
 * askew across the piece's long way. Every crack ends on an older one, as cracks in ice do, and no piece is a sliver. */
function iceCrack(outline: Point[], cells: number, salt: number): string {
  const pieces: Point[][] = [outline]
  let d = ''
  for (let turn = 0; pieces.length < cells && turn < cells * 3; turn += 1) {
    let pick = 0
    let most = 0
    pieces.forEach((piece, index) => {
      const weight = areaOf(piece) * (0.8 + 0.4 * hashUnit(index + turn * 31, salt + 9))
      if (weight > most) {
        most = weight
        pick = index
      }
    })
    const piece = pieces[pick]
    if (!piece) break
    const size = Math.sqrt(areaOf(piece))
    const centre = middleOf(piece)
    // The piece's long way: the direction between its two corners that lie farthest apart.
    let long = 0
    let farthest = 0
    for (const a of piece) {
      for (const b of piece) {
        const distance = Math.hypot(b.x - a.x, b.y - a.y)
        if (distance > farthest) {
          farthest = distance
          long = Math.atan2(b.y - a.y, b.x - a.x)
        }
      }
    }
    let chosen: Cut | null = null
    for (let attempt = 0; attempt < 10 && !chosen; attempt += 1) {
      const seed = turn * 16 + attempt
      const lean = (hashUnit(seed, salt) < 0.5 ? -1 : 1) * (13 + 27 * hashUnit(seed, salt + 1)) * (Math.PI / 180)
      const slide = (hashUnit(seed, salt + 2) - 0.5) * 0.3 * size
      const through = { x: centre.x + slide * Math.cos(long), y: centre.y + slide * Math.sin(long) }
      const cut = cutPiece(piece, through, long + Math.PI / 2 + lean)
      if (!cut) continue
      const one = areaOf(cut.first)
      const other = areaOf(cut.second)
      if (Math.min(one, other) < 0.33 * (one + other)) continue
      // A crack that lands on a corner would make a four-way joint; ice does not break that way.
      const from = cut.from
      const to = cut.to
      if (piece.some(corner => Math.hypot(corner.x - from.x, corner.y - from.y) < 7 || Math.hypot(corner.x - to.x, corner.y - to.y) < 7)) continue
      chosen = cut
    }
    if (!chosen) chosen = cutPiece(piece, centre, long + Math.PI / 2 + 0.35)
    if (!chosen) break
    pieces.splice(pick, 1, chosen.first, chosen.second)
    d += `M${fine(chosen.from.x)} ${fine(chosen.from.y)}L${fine(chosen.to.x)} ${fine(chosen.to.y)}`
  }
  return d
}

/** Crabapple lattice (海棠纹): a square net of four-lobed flowers. Each flower is four half circles standing on the sides of a
 * small square, so its lobes meet in four cusps; a short straight bar ties every flower to its neighbours and to the frame. */
function crabapple(cx: number, cy: number, half: number, count: number): string {
  const pitch = (2 * half) / count
  const lobe = fine(pitch * 0.2)
  const two = fine(lobe * 2)
  let d = ''
  const centres: number[] = []
  for (let index = 0; index < count; index += 1) centres.push((index + 0.5) * pitch - half)
  for (const dy of centres) {
    for (const dx of centres) {
      const x = cx + dx
      const y = cy + dy
      d += `M${fine(x + lobe)} ${fine(y - lobe)}a${lobe} ${lobe} 0 0 1 0 ${two}a${lobe} ${lobe} 0 0 1 -${two} 0a${lobe} ${lobe} 0 0 1 0 -${two}a${lobe} ${lobe} 0 0 1 ${two} 0Z`
    }
  }
  // The ties: from the frame to the first lobe, from lobe to lobe, from the last lobe to the frame, along every row and every column.
  for (const across of centres) {
    for (let index = 0; index <= count; index += 1) {
      const from = index === 0 ? -half - 3 : (centres[index - 1] ?? 0) + two
      const to = index === count ? half + 3 : (centres[index] ?? 0) - two
      d += `M${fine(cx + from)} ${fine(cy + across)}H${fine(cx + to)}M${fine(cx + across)} ${fine(cy + from)}V${fine(cy + to)}`
    }
  }
  return d
}

/** A lattice window (漏窗): the shade of the opening, the lattice, and the frame of thin grey bricks round it.
 * Every bar is drawn twice, a little wider in ink and then in limewash, so it has two fine edges and the joints come out clean;
 * the bars are written once in the defs and drawn twice from there. `shade` is how much of the full shade of an opening this one takes:
 * a window with nothing behind it is a deep slot in the wall, one with bamboo behind it lets the garden's light through. */
function latticeWindow(id: string, opening: Point[], frame: Point[], bars: string, barWidth: number, depth: number, veil: number, shade: number, stock: Stock): Built {
  const centre = middleOf(opening)
  const hole = closed(opening)
  const air = skyAt(stock.sky, centre.x, centre.y)
  const limewash = mix(air, stock.lime, stock.bar)
  const pen = depth * stock.line
  const markup =
    // A veil of sky first: what stands behind the window is seen through the air of the garden, paler than what stands in front of the wall.
    (veil > 0 ? `<path d="${hole}" fill="${air}" fill-opacity="${veil}"/>` : '') +
    `<path d="${hole}" fill="url(#deep)" fill-opacity="${alpha(shade * (0.7 + 0.3 * depth))}"/>` +
    `<g clip-path="url(#${id})" stroke-linecap="butt" stroke-linejoin="miter"><use href="#${id}l" stroke="${stock.ink}" stroke-opacity="${alpha(0.74 * pen)}" stroke-width="${fine(barWidth + 1.6)}"/>` +
    `<use href="#${id}l" stroke="${limewash}" stroke-width="${barWidth}"/></g>` +
    `<path d="${closed(frame)}${hole}" fill-rule="evenodd" fill="${stock.shade}" fill-opacity="${alpha(stock.brickAlpha * depth)}"/>` +
    `<path d="${closed(frame)}" stroke="${stock.ink}" stroke-opacity="${alpha(0.8 * pen)}" stroke-width="1.1" stroke-linejoin="miter"/>` +
    `<path d="${hole}" stroke="${stock.ink}" stroke-opacity="${alpha(0.66 * pen)}" stroke-width="0.9" stroke-linejoin="miter"/>`
  return { defs: `<clipPath id="${id}"><path d="${hole}"/></clipPath><path id="${id}l" d="${bars}"/>`, markup }
}

/** One garden wall seen square on. `left` and `right` are the ends of its face; an end that is `free` stands on the sheet and the coping
 * oversails it. From the top: the ridge of the coping (its free tips turned up a little), the tile slope, the eave, the plaster face,
 * which is gone at `foot`. `depth` is 1 for the nearest wall and less for a wall further off. */
interface Wall {
  name: string
  left: number
  right: number
  freeLeft: boolean
  freeRight: boolean
  ridge: number
  band: number
  roof: number
  foot: number
  depth: number
  pitch: number
  /** Whether anything stands behind the wall that it must hide. */
  hides: boolean
}

/** A wall: a piece of sky in its shape if it must hide what stands behind (all but what `holes` show), limewash fading to the mist line,
 * the shade under the eave, and the coping: tile rows, drip tiles along the eave, ridge. */
function wallMarkup(wall: Wall, holes: string, stock: Stock): Built {
  const over = Math.round(wall.roof * 0.22)
  const from = wall.freeLeft ? wall.left - over : wall.left
  const to = wall.freeRight ? wall.right + over : wall.right
  const tile = wall.ridge + wall.band
  const eave = tile + wall.roof
  const pen = wall.depth * stock.line
  const ink = stock.ink
  // A free end of the ridge turns up in a short hook over the end of the tiles (起翘), the way Suzhou wall ridges end; it does not run on past them.
  const tipLength = wall.band * 3.4
  const tipUp = wall.band * 1.15
  const tipOut = wall.band * 0.4
  const ridgeTop =
    (wall.freeLeft ? `M${round(from - tipOut)} ${round(wall.ridge - tipUp)}Q${round(from + tipLength * 0.22)} ${wall.ridge} ${round(from + tipLength)} ${wall.ridge}` : `M${from} ${wall.ridge}`) +
    (wall.freeRight ? `H${round(to - tipLength)}Q${round(to - tipLength * 0.22)} ${wall.ridge} ${round(to + tipOut)} ${round(wall.ridge - tipUp)}` : `H${to}`)
  const ridgeShape =
    ridgeTop +
    (wall.freeRight ? `Q${round(to - tipOut * 0.4)} ${round(tile - wall.band * 0.5)} ${to - 2} ${tile}` : `V${tile}`) +
    (wall.freeLeft ? `H${from + 2}Q${round(from + tipOut * 0.4)} ${round(tile - wall.band * 0.5)} ${round(from - tipOut)} ${round(wall.ridge - tipUp)}Z` : `H${from}Z`)
  const body = `M${from} ${tile}H${to}V${eave}H${wall.right}V${wall.foot + 2}H${wall.left}V${eave}H${from}Z`
  const face = `M${wall.left} ${eave}H${wall.right}V${wall.foot + 2}H${wall.left}Z`

  // The rows of cover tiles, counted from a free end so that the end of the coping is whole.
  const rows: number[] = []
  if (wall.freeRight) for (let x = Math.round(to - wall.pitch * 0.72); x > Math.max(from + wall.pitch * 0.4, -wall.pitch); x -= wall.pitch) rows.unshift(x)
  else for (let x = Math.round(from + wall.pitch * 0.72); x < Math.min(to - wall.pitch * 0.4, WIDTH + wall.pitch); x += wall.pitch) rows.push(x)
  const cover = Math.round(wall.pitch * 0.36) / 2
  const drop = round(wall.pitch * 0.34)
  let ribs = ''
  let grooves = ''
  let caps = ''
  let drips = ''
  rows.forEach((x, index) => {
    // The lit crown of each cover tile, and the dark channel just past it; the row's two hairlines are a hair apart.
    ribs += `M${round(x - cover * 0.4)} ${tile + 2}V${eave - 1}`
    grooves += `M${round(x + cover + 0.6)} ${tile + 1}V${eave}`
    caps += `M${round(x - cover)} ${eave}a${round(cover)} ${round(cover)} 0 0 0 ${round(cover * 2)} 0Z`
    const next = rows[index + 1]
    if (next !== undefined) drips += `M${round(x + cover + 0.8)} ${eave}l${round((next - x) / 2 - cover - 0.8)} ${drop}l${round((next - x) / 2 - cover - 0.8)} -${drop}Z`
  })

  const faceFrom = Math.max(wall.left, -10)
  const faceTo = Math.min(wall.right, WIDTH + 10)
  const mould = eave + Math.round(wall.roof * 0.56)
  const lime = stock.limeAlpha * (0.6 + 0.4 * wall.depth)
  const name = wall.name
  const defs =
    `<linearGradient id="l${name}" gradientUnits="userSpaceOnUse" x1="0" y1="${eave}" x2="0" y2="${wall.foot}">` +
    `<stop offset="0" stop-color="${stock.lime}" stop-opacity="${alpha(lime)}"/><stop offset="0.45" stop-color="${stock.lime}" stop-opacity="${alpha(lime * 0.9)}"/>` +
    `<stop offset="0.78" stop-color="${stock.lime}" stop-opacity="${alpha(lime * 0.36)}"/><stop offset="1" stop-color="${stock.lime}" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="e${name}" gradientUnits="userSpaceOnUse" x1="0" y1="${eave}" x2="0" y2="${mould}">` +
    `<stop offset="0" stop-color="${stock.shade}" stop-opacity="${alpha(stock.shadeAlpha * 1.25 * wall.depth)}"/><stop offset="1" stop-color="${stock.shade}" stop-opacity="${alpha(stock.shadeAlpha * 0.25 * wall.depth)}"/></linearGradient>` +
    fadingInk(`s${name}`, eave, eave + (wall.foot - eave) * 0.72, ink)

  let markup =
    (wall.hides ? `<g fill-rule="evenodd">${skyPainted(ridgeShape + body + holes, stock.sky)}</g>` : '') +
    `<path d="${face}${holes}" fill-rule="evenodd" fill="url(#l${name})"/>` +
    `<rect x="${faceFrom}" y="${eave}" width="${faceTo - faceFrom}" height="${mould - eave}" fill="url(#e${name})"/>` +
    `<path d="M${faceFrom} ${mould + 0.5}H${faceTo}" stroke="${ink}" stroke-opacity="${alpha(0.42 * pen)}" stroke-width="0.9"/>`
  if (wall.freeLeft) markup += `<path d="M${wall.left + 0.5} ${eave}V${wall.foot}" stroke="url(#s${name})" stroke-opacity="${alpha(0.6 * pen)}" stroke-width="1"/>`
  if (wall.freeRight) markup += `<path d="M${wall.right - 0.5} ${eave}V${wall.foot}" stroke="url(#s${name})" stroke-opacity="${alpha(0.6 * pen)}" stroke-width="1"/>`
  markup +=
    `<rect x="${from}" y="${tile}" width="${to - from}" height="${wall.roof}" fill="${stock.tileInk}" fill-opacity="${alpha(stock.tile * wall.depth)}"/>` +
    // The slope is lighter where the tiles turn towards the sky under the ridge and darkest at the eave, where the courses overlap most.
    `<rect x="${from}" y="${tile}" width="${to - from}" height="${round(wall.roof * 0.45)}" fill="${stock.lime}" fill-opacity="${alpha(stock.rib * 0.5 * wall.depth)}"/>` +
    `<path d="${ribs}" stroke="${stock.lime}" stroke-opacity="${alpha(stock.rib * wall.depth)}" stroke-width="0.75" stroke-linecap="butt"/>` +
    `<path d="${grooves}" stroke="${stock.tileInk}" stroke-opacity="${alpha(stock.groove * wall.depth)}" stroke-width="0.8" stroke-linecap="butt"/>` +
    `<path d="${drips}" fill="${ink}" fill-opacity="${alpha(0.7 * pen * stock.rows)}"/>` +
    `<path d="${caps}" fill="${ink}" fill-opacity="${alpha(0.78 * pen * stock.rows)}"/>` +
    `<path d="M${from} ${eave + 0.5}H${to}${wall.freeLeft ? `M${from} ${tile}V${eave}` : ''}${wall.freeRight ? `M${to} ${tile}V${eave}` : ''}" stroke="${ink}" stroke-opacity="${alpha(0.8 * pen)}" stroke-width="1.1"/>` +
    `<path d="${ridgeShape}" fill="${stock.tileInk}" fill-opacity="${alpha(stock.ridge * wall.depth)}"/>` +
    `<path d="M${round(from + (wall.freeLeft ? tipLength : 0))} ${round(wall.ridge + wall.band * 0.56)}H${round(to - (wall.freeRight ? tipLength : 0))}" stroke="${stock.lime}" stroke-opacity="${alpha(0.34 * wall.depth)}" stroke-width="0.8"/>` +
    `<path d="${ridgeTop}" stroke="${ink}" stroke-opacity="${alpha(0.86 * pen)}" stroke-width="1.15"/>`
  return { defs, markup }
}

/** One bamboo leaf: a slender blade from its stalk at (x, y) out along `degrees`, pinched at the stalk, widest a third of the way out,
 * fuller on one side, drawn to a long point: the press, swell and lift of one brush stroke.
 * `bend` curls the blade as it goes (a share of its length at the tip, positive turning it clockwise on the sheet). */
function leaf(x: number, y: number, degrees: number, length: number, width: number, bend = 0): string {
  const angle = (degrees * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const to = (along: number, across: number): string => {
    const curl = across + (bend * along * along) / length
    return at(x + along * cos - curl * sin, y + along * sin + curl * cos)
  }
  return `M${at(x, y)}C${to(length * 0.2, -width * 0.95)} ${to(length * 0.62, -width * 0.7)} ${to(length, 0)}C${to(length * 0.66, width * 0.48)} ${to(length * 0.22, width * 0.6)} ${at(x, y)}Z`
}

/** A hand of leaves from one point, fanned about `facing`, the middle ones longest: the 个 and 介 of ink bamboo. */
function leafHand(x: number, y: number, facing: number, count: number, length: number, spread: number, salt: number, bend = 0, fat = 0.2): string {
  let d = ''
  const middle = (count - 1) / 2
  for (let index = 0; index < count; index += 1) {
    const away = middle === 0 ? 0 : Math.abs(index - middle) / middle
    const reach = length * (1 - 0.24 * away) * (0.86 + 0.28 * hashUnit(index, salt))
    d += leaf(x, y, facing + (index - middle) * spread + (hashUnit(index, salt + 1) - 0.5) * 12, reach, reach * fat, bend * (0.6 + 0.8 * hashUnit(index, salt + 2)))
  }
  return d
}

/** One cane of bamboo. It stands at `x` on `base`, reaches `top`, and leans by `lean` at its tip.
 * No twig ends between `clearFrom` and `clearTo`: that is where a coping crosses the cane, and leaves over its tiles would be a tangle. */
interface Culm {
  x: number
  base: number
  top: number
  lean: number
  girth: number
  joint: number
  leafFrom: number
  leafLength: number
  clearFrom: number
  clearTo: number
  salt: number
  /** How much ink the cane takes: 1 for a cane in front, less for one standing further back in the grove. */
  tone: number
}

/** A point on the cane's axis, `part` of the way up. The cane bends over towards its tip and wanders a hair from joint to joint, as no cane is ruled. */
function culmAxis(culm: Culm, part: number): Point {
  return { x: culm.x + culm.lean * Math.pow(part, 1.9) + (noise(part * 4, culm.salt + 21) - 0.5) * 4.4 * part, y: culm.base - (culm.base - culm.top) * part }
}

/** The cane in its joints (each a tapering piece, a hair's gap between, a short node stroke across the top of each), a short twig
 * from every upper joint on alternate sides with a hand of leaves hanging from its end, now and then a pair of leaves at the joint
 * itself, and a spray at the tip. Leaves come in two inks, as a painter lays the near leaves in dark ink and the far ones in pale. */
function bamboo(culm: Culm): { cane: string; nodes: string; twigs: string; dark: string; pale: string } {
  const height = culm.base - culm.top
  const count = Math.max(2, Math.round(height / culm.joint))
  let cane = ''
  let nodes = ''
  let twigs = ''
  let dark = ''
  let pale = ''
  const lay = (d: string, salt: number): void => {
    if (hashUnit(salt, culm.salt + 41) < 0.64) dark += d
    else pale += d
  }
  for (let joint = 0; joint < count; joint += 1) {
    const from = joint / count
    const to = (joint + 1) / count
    const a = culmAxis(culm, from + 1.2 / height)
    const b = culmAxis(culm, to - 1.2 / height)
    const widthA = (culm.girth * (1 - 0.55 * from)) / 2
    const widthB = (culm.girth * (1 - 0.55 * to)) / 2
    cane += `M${at(a.x - widthA, a.y)}L${at(b.x - widthB, b.y)}L${at(b.x + widthB, b.y)}L${at(a.x + widthA, a.y)}Z`
    if (joint > 0) nodes += `M${at(a.x - widthA - 1.4, a.y + 0.4)}Q${at(a.x, a.y - 1.1)} ${at(a.x + widthA + 1.4, a.y + 0.4)}`
    if (to < culm.leafFrom || joint === count - 1) continue
    const knot = culmAxis(culm, to)
    const side = (joint + culm.salt) % 2 === 0 ? -1 : 1
    const reach = culm.leafLength * (0.5 + 0.4 * hashUnit(joint, culm.salt + 3))
    const slant = ((38 + 22 * hashUnit(joint, culm.salt + 5)) * Math.PI) / 180
    const tip = { x: knot.x + side * reach * Math.sin(slant), y: knot.y - reach * Math.cos(slant) }
    if (tip.y > culm.clearFrom - 6 && tip.y < culm.clearTo) continue
    twigs += `M${at(knot.x, knot.y)}Q${at((knot.x + tip.x) / 2 + side * 1.5, (knot.y + tip.y) / 2 - 2.5)} ${at(tip.x, tip.y)}`
    // The hand hangs out and down from the twig's end, heavy: 38 to 72 degrees below level, two or three blades.
    const below = 38 + 34 * hashUnit(joint, culm.salt + 9)
    const facing = side < 0 ? 180 - below : below
    const leaves = 2 + Math.floor(hashUnit(joint, culm.salt + 7) * 1.9)
    lay(leafHand(tip.x, tip.y, facing, leaves, culm.leafLength, 17, culm.salt + joint * 13, side * 0.09, 0.11), joint * 2)
    if (hashUnit(joint, culm.salt + 11) < 0.6 || (knot.y < culm.clearTo + 10 && knot.y > culm.clearFrom - 20)) continue
    // A pair hanging from the joint on the other side.
    lay(leafHand(knot.x - side * 1.5, knot.y + 1, side < 0 ? 66 : 114, 2, culm.leafLength * 0.84, 20, culm.salt + joint * 13 + 5, -side * 0.07, 0.11), joint * 2 + 1)
  }
  const crown = culmAxis(culm, 1)
  // The tip: three narrow blades drooping the way the cane leans, and a pale pair hanging steeper below them.
  const toward = culm.lean < 0 ? 150 : 30
  dark += leafHand(crown.x, crown.y + 2, toward, 3, culm.leafLength * 0.92, 13, culm.salt + 91, culm.lean < 0 ? -0.08 : 0.08, 0.1)
  pale += leafHand(crown.x, crown.y + 7, culm.lean < 0 ? 118 : 62, 2, culm.leafLength * 0.8, 18, culm.salt + 93, 0, 0.11)
  return { cane, nodes, twigs, dark, pale }
}

/** The grove between the two walls: each cane with its leaves nods a little about its foot, which the near wall hides. */
function grove(culms: Culm[], stock: Stock): string {
  let markup = ''
  culms.forEach((culm, index) => {
    const parts = bamboo(culm)
    const ink = stock.line * culm.tone
    markup +=
      `<g class="nod" style="transform-origin:${culm.x}px ${culm.base}px;animation-duration:${9 + (index % 3) * 2.5}s;animation-delay:-${round(hashUnit(index, 17) * 9)}s">` +
      `<path d="${parts.pale}" fill="${stock.ink}" fill-opacity="${alpha(0.36 * ink)}"/>` +
      `<path d="${parts.cane}" fill="${stock.ink}" fill-opacity="${alpha(0.58 * ink)}"/>` +
      `<path d="${parts.nodes}" stroke="${stock.ink}" stroke-opacity="${alpha(0.8 * ink)}" stroke-width="1.1"/>` +
      `<path d="${parts.twigs}" stroke="${stock.ink}" stroke-opacity="${alpha(0.55 * ink)}" stroke-width="0.8"/>` +
      `<path d="${parts.dark}" fill="${stock.ink}" fill-opacity="${alpha(0.74 * ink)}"/></g>`
  })
  return markup
}

/** The low twigs of two canes, where the crabapple window shows them, and a few single leaves on them that turn on their stalks.
 * Each twig starts on its cane's own axis, at `y`, and reaches `reach` across to `side`. */
function stirringLeaves(culms: Culm[], stock: Stock): string {
  const twigs = [
    { cane: 1, y: 806, side: -1, reach: 22, rise: 24, facings: [150, 118, 176], length: 30 },
    { cane: 3, y: 772, side: -1, reach: 15, rise: 20, facings: [136, 104], length: 28 },
    { cane: 3, y: 818, side: 1, reach: 13, rise: 16, facings: [52, 84], length: 26 },
  ]
  let stems = ''
  let leaves = ''
  let count = 0
  twigs.forEach(twig => {
    const culm = culms[twig.cane]
    if (!culm) return
    const knot = culmAxis(culm, (culm.base - twig.y) / (culm.base - culm.top))
    const tip = { x: knot.x + twig.side * twig.reach, y: knot.y - twig.rise }
    stems += `M${at(knot.x, knot.y)}Q${at(knot.x + twig.side * twig.reach * 0.35, knot.y - twig.rise * 0.7)} ${at(tip.x, tip.y)}`
    twig.facings.forEach((facing, index) => {
      const length = twig.length * (0.84 + 0.3 * hashUnit(count, 31))
      leaves +=
        `<path class="stir" style="transform-origin:${round(tip.x)}px ${round(tip.y)}px;animation-duration:${round(4.6 + hashUnit(count, 23) * 3.2)}s;animation-delay:-${round(hashUnit(count, 29) * 5)}s" ` +
        `d="${leaf(tip.x, tip.y, facing, length, length * 0.12, (index % 2 === 0 ? 1 : -1) * 0.06)}"/>`
      count += 1
    })
  })
  return (
    `<path d="${stems}" stroke="${stock.ink}" stroke-opacity="${alpha(0.6 * stock.line)}" stroke-width="0.9"/>` +
    `<g fill="${stock.ink}" fill-opacity="${alpha(0.74 * stock.line)}">${leaves}</g>`
  )
}

/** The shadow of a bamboo spray on plaster: hands of long slender leaves, all in one faint, cool, flat tone; the twig that holds them is too
 * thin to throw a shadow that shows, so the hands lie on the wall on their own (`stem` only places them).
 * It drifts as the spray that casts it sways. The leaves are written once in the defs and laid twice: the shadow, and a fainter copy a little
 * down and to the left, the penumbra a shadow cast from a few feet off has, without a blur. */
function leafShadow(id: string, stem: Point[], hands: Array<{ part: number; facing: number; count: number; length: number }>, pivot: Point, seconds: number, delay: number, salt: number, stock: Stock): Built {
  const first = stem[0]
  const bend = stem[1]
  const last = stem[2]
  if (!first || !bend || !last) return { defs: '', markup: '' }
  let leaves = ''
  hands.forEach((hand, index) => {
    const rest = 1 - hand.part
    const x = rest * rest * first.x + 2 * rest * hand.part * bend.x + hand.part * hand.part * last.x
    const y = rest * rest * first.y + 2 * rest * hand.part * bend.y + hand.part * hand.part * last.y
    leaves += leafHand(x, y, hand.facing, hand.count, hand.length, 19, salt + index * 7, 0.1, 0.12)
  })
  const tone = `fill="${stock.shadowInk}"`
  return {
    defs: `<path id="${id}" d="${leaves}"/>`,
    markup:
      `<g class="shade" style="transform-origin:${pivot.x}px ${pivot.y}px;animation-duration:${seconds}s;animation-delay:-${delay}s">` +
      `<use href="#${id}" transform="translate(-3 2.6)" ${tone} fill-opacity="${alpha(stock.shadowAlpha * 0.45)}"/>` +
      `<use href="#${id}" ${tone} fill-opacity="${alpha(stock.shadowAlpha)}"/></g>`,
  }
}

/** The outline of a folding fan's leaf (便面): two arcs about one centre below it and two straight sides. `grow` moves every edge outward. */
function fanOutline(cx: number, cy: number, outer: number, inner: number, halfAngle: number, grow: number): string {
  const angle = (halfAngle * Math.PI) / 180
  const corner = (radius: number, side: number): Point => {
    const along = Math.sqrt(radius * radius - grow * grow)
    return { x: cx + side * (grow * Math.cos(angle) + along * Math.sin(angle)), y: cy + grow * Math.sin(angle) - along * Math.cos(angle) }
  }
  const big = outer + grow
  const small = inner - grow
  const a = corner(big, -1)
  const b = corner(big, 1)
  const c = corner(small, 1)
  const e = corner(small, -1)
  return `M${fine(a.x)} ${fine(a.y)}A${big} ${big} 0 0 1 ${fine(b.x)} ${fine(b.y)}L${fine(c.x)} ${fine(c.y)}A${small} ${small} 0 0 0 ${fine(e.x)} ${fine(e.y)}Z`
}

/** One magnolia (玉兰) standing on its twig at (x, y), `size` tall, leaning `tilt` degrees from upright, in three layers so that a nearer
 * petal hides the outline of the one behind it: `back` (two outer tepals turned out), `side` (the two that cup the flower), `front` (the
 * tall middle tepal, or a closed bud), and `sheath`, the dark furred bract at the foot. */
interface Flower {
  back: string
  side: string
  front: string
  sheath: string
}

function magnolia(x: number, y: number, size: number, tilt: number, open: boolean): Flower {
  const angle = (tilt * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const to = (across: number, up: number): string => at(x + across * size * cos + up * size * sin, y + across * size * sin - up * size * cos)
  // A tepal: narrow at its foot, widest high up, with a blunt rounded tip (the tangent at the tip is level), as a magnolia's is; a pointed tip makes a tulip.
  const petal = (lean: number, wide: number, tall: number, foot = 0): string =>
    `M${to(foot, 0.04)}C${to(foot + lean - wide * 1.1, tall * 0.42)} ${to(lean * 1.5 - wide * 0.62, tall * 1.02)} ${to(lean * 1.5, tall)}C${to(lean * 1.5 + wide * 0.62, tall * 0.98)} ${to(foot + lean * 0.5 + wide * 1.1, tall * 0.42)} ${to(foot, 0.04)}Z`
  const sheath = `M${to(-0.11, 0.08)}Q${to(-0.12, -0.08)} ${to(0, -0.14)}Q${to(0.12, -0.08)} ${to(0.11, 0.08)}Q${to(0, 0.13)} ${to(-0.11, 0.08)}Z`
  if (!open) return { back: '', side: '', front: petal(0, 0.24, 1), sheath: `M${to(-0.17, 0.06)}Q${to(-0.24, 0.36)} ${to(0, 0.58)}Q${to(0.24, 0.36)} ${to(0.17, 0.06)}Q${to(0, -0.04)} ${to(-0.17, 0.06)}Z` }
  return {
    back: petal(-0.32, 0.19, 0.84, -0.04) + petal(0.32, 0.19, 0.84, 0.04),
    side: petal(-0.2, 0.27, 0.96, -0.05) + petal(0.2, 0.27, 0.96, 0.05),
    front: petal(0.02, 0.27, 1.06),
    sheath,
  }
}

/** A branch as a filled shape that tapers from `from` wide at its first point to `to` at its last, along a smooth curve through the points:
 * the swell and thinning a brush gives a branch, which a stroke of one width cannot. */
function taper(points: Point[], from: number, to: number, woody = false): string {
  const samples: Point[] = []
  for (let index = 0; index < points.length - 1; index += 1) {
    const p1 = points[index]
    const p2 = points[index + 1]
    const p0 = points[index - 1] ?? p1
    const p3 = points[index + 2] ?? p2
    if (!p0 || !p1 || !p2 || !p3) continue
    // A woody branch keeps its elbows: straight runs between the points, so it turns at each bud scar as magnolia wood does.
    if (woody) {
      samples.push(p1, { x: p1.x + (p2.x - p1.x) * 0.5, y: p1.y + (p2.y - p1.y) * 0.5 })
      continue
    }
    for (let step = 0; step < 4; step += 1) {
      const t = step / 4
      const t2 = t * t
      const t3 = t2 * t
      const blend = (a: number, b: number, c: number, d: number): number => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3)
      samples.push({ x: blend(p0.x, p1.x, p2.x, p3.x), y: blend(p0.y, p1.y, p2.y, p3.y) })
    }
  }
  const last = points[points.length - 1]
  if (last) samples.push(last)
  const left: string[] = []
  const right: string[] = []
  const count = samples.length
  samples.forEach((point, index) => {
    const before = samples[Math.max(0, index - 1)] ?? point
    const after = samples[Math.min(count - 1, index + 1)] ?? point
    const length = Math.hypot(after.x - before.x, after.y - before.y) || 1
    const half = (from + (to - from) * Math.pow(index / Math.max(1, count - 1), 0.8)) / 2
    const nx = (-(after.y - before.y) / length) * half
    const ny = ((after.x - before.x) / length) * half
    left.push(at(point.x + nx, point.y + ny))
    right.unshift(at(point.x - nx, point.y - ny))
  })
  return `M${left.join('L')}L${right.join('L')}Z`
}

/** The magnolia behind the left wall: a bough that crosses the fan window, goes on behind the plaster and comes up over the coping,
 * bare of leaves, with white cups at the ends of its twigs. */
function magnoliaBough(stock: Stock): string {
  const ink = stock.ink
  // Drawn for a wall whose ridge stands at 644, and set down with it by LOW.
  const down = (points: Point[]): Point[] => points.map(point => ({ x: point.x, y: point.y + LOW }))
  const bough = down([
    { x: 206, y: 834 }, { x: 238, y: 796 }, { x: 272, y: 765 }, { x: 306, y: 742 }, { x: 336, y: 716 }, { x: 356, y: 684 }, { x: 367, y: 648 },
  ])
  // Over the coping the crown is magnolia wood: two stems from the same bough, ascending, turning a little at every bud scar,
  // branching at 30 to 50 degrees into short stiff limbs, each ending in one upright flower or a furred bud; a few bare spurs between.
  const leader = down([{ x: 366, y: 654 }, { x: 371, y: 614 }, { x: 363, y: 580 }, { x: 358, y: 549 }, { x: 349, y: 506 }])
  const second = down([{ x: 322, y: 658 }, { x: 319, y: 622 }, { x: 308, y: 592 }, { x: 297, y: 565 }, { x: 287, y: 542 }, { x: 281, y: 522 }])
  const limbs = [
    [{ x: 371, y: 614 }, { x: 387, y: 596 }, { x: 396, y: 580 }, { x: 401, y: 572 }],
    [{ x: 363, y: 580 }, { x: 348, y: 566 }, { x: 340, y: 550 }, { x: 337, y: 535 }],
    [{ x: 358, y: 549 }, { x: 372, y: 530 }, { x: 380, y: 510 }, { x: 384, y: 493 }],
    [{ x: 319, y: 622 }, { x: 329, y: 607 }, { x: 333, y: 593 }],
  ].map(down)
  const twigs = [
    [{ x: 387, y: 596 }, { x: 399, y: 591 }, { x: 410, y: 582 }],
    [{ x: 308, y: 592 }, { x: 306, y: 568 }, { x: 302, y: 537 }],
    [{ x: 297, y: 565 }, { x: 285, y: 559 }, { x: 276, y: 549 }],
    // Bare spurs: the short stubs a magnolia carries all along its wood.
    [{ x: 366, y: 632 }, { x: 357, y: 624 }, { x: 352, y: 621 }],
    [{ x: 314, y: 607 }, { x: 306, y: 603 }],
    [{ x: 380, y: 510 }, { x: 389, y: 506 }],
  ].map(down)
  // Inside the fan, where the bough crosses it: smooth and broad, the wood seen close.
  const fanLimbs = [
    [{ x: 289, y: 753 }, { x: 312, y: 758 }, { x: 332, y: 755 }, { x: 345, y: 746 }],
    [{ x: 272, y: 765 }, { x: 266, y: 748 }, { x: 266, y: 733 }],
  ].map(down)
  const flowers = [
    { x: 346, y: 744, size: 22, tilt: 28, open: true },
    { x: 266, y: 731, size: 14, tilt: -4, open: false },
    { x: 402, y: 569, size: 23, tilt: 10, open: true },
    { x: 412, y: 580, size: 13, tilt: 34, open: false },
    { x: 280, y: 518, size: 24, tilt: -14, open: true },
    { x: 302, y: 534, size: 14, tilt: -6, open: false },
    { x: 275, y: 547, size: 12, tilt: -30, open: false },
    { x: 337, y: 532, size: 14, tilt: -14, open: false },
    { x: 334, y: 591, size: 17, tilt: 8, open: true },
    { x: 385, y: 490, size: 21, tilt: 10, open: true },
    { x: 348, y: 503, size: 24, tilt: -8, open: true },
  ]
  const wood = alpha(0.84 * stock.line)
  const built = flowers.map(flower => magnolia(flower.x, flower.y + LOW, flower.size, flower.tilt, flower.open))
  const layer = (part: keyof Flower): string => built.map(flower => flower[part]).join('')
  const petals = `fill="${stock.petal}" fill-opacity="${stock.petalAlpha}" stroke="${stock.petalLine}" stroke-opacity="${stock.petalLineAlpha}" stroke-width="0.8"`
  const branches =
    taper(bough, 6.2, 3.8) +
    fanLimbs.map(limb => taper(limb, 2.4, 1)).join('') +
    taper(leader, 5, 1.8, true) +
    taper(second, 4, 1.5, true) +
    limbs.map(limb => taper(limb, 2.5, 1.2, true)).join('') +
    twigs.map(twig => taper(twig, 1.5, 0.8, true)).join('')
  return (
    `<path d="${branches}" fill="${ink}" fill-opacity="${wood}"/>` +
    `<path d="${layer('back')}" ${petals}/>` +
    `<path d="${layer('side')}" ${petals}/>` +
    `<path d="${layer('front')}" ${petals}/>` +
    `<path d="${layer('sheath')}" fill="${ink}" fill-opacity="${alpha(0.86 * stock.line)}"/>`
  )
}

/** A pair of swallows over the left wall, seen from below as they bank: a slim body, two wings swept back (the far one shortened),
 * a forked tail. They glide up the sheet together and come round again. */
function swallows(stock: Stock): string {
  const outline: Array<[string, ...number[]]> = [
    ['M', 6.5, 0], ['C', 4.5, -1.9, 1, -1.8, -4.5, -0.9], ['L', -4.5, 0.9], ['C', 1, 1.8, 4.5, 1.9, 6.5, 0],
    ['M', 3, -1], ['C', 1.5, -5, -1.5, -9, -6.5, -12], ['C', -4, -8, -2.2, -4.5, -1.2, -1.1],
    ['M', 3, 1], ['C', 1.5, 4, -1, 6.6, -5, 8.6], ['C', -3.2, 6, -2, 3.4, -1.2, 1.1],
    ['M', -4, -0.9], ['L', -12.5, -3.4], ['L', -7, 0], ['L', -12.5, 3.4], ['L', -4, 0.9],
  ]
  const birds = [
    { x: 262, y: 430, size: 0.96, heading: -24 },
    { x: 302, y: 402, size: 0.8, heading: -31 },
  ]
  let marks = ''
  birds.forEach((bird, index) => {
    const angle = (bird.heading * Math.PI) / 180
    const cos = Math.cos(angle) * bird.size
    const sin = Math.sin(angle) * bird.size
    let d = ''
    for (const [command, ...numbers] of outline) {
      const points: string[] = []
      for (let pair = 0; pair < numbers.length; pair += 2) {
        const along = numbers[pair] ?? 0
        const across = numbers[pair + 1] ?? 0
        points.push(at(bird.x + along * cos - across * sin, bird.y + along * sin + across * cos))
      }
      d += command + points.join(' ')
    }
    marks += `<path class="bob" style="animation-duration:${5 + index * 1.7}s;animation-delay:-${round(hashUnit(index, 71) * 6)}s" d="${d}"/>`
  })
  return `<g class="pair" fill="${stock.ink}" fill-opacity="${alpha(0.84 * stock.line)}">${marks}</g>`
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

/** A small seal in the outline of a crabapple (海棠) window, the four-lobed opening of a Suzhou garden wall: vermilion, with four
 * petals left bare. A mark, not a character. */
function seal(x: number, y: number, stock: Stock): string {
  const bare = skyAt(stock.sky, x + 12, y + 12)
  return (
    `<g transform="translate(${x} ${y})" opacity="0.92"><path d="M18.1 5.9A6.2 6.2 0 0 1 18.1 18.1A6.2 6.2 0 0 1 5.9 18.1A6.2 6.2 0 0 1 5.9 5.9A6.2 6.2 0 0 1 18.1 5.9Z" fill="${stock.seal}"/>` +
    `<path d="M12 10.7Q9.2 7.3 12 3.3Q14.8 7.3 12 10.7ZM13.3 12Q16.7 9.2 20.7 12Q16.7 14.8 13.3 12ZM12 13.3Q14.8 16.7 12 20.7Q9.2 16.7 12 13.3ZM10.7 12Q7.3 14.8 3.3 12Q7.3 9.2 10.7 12Z" fill="${bare}"/></g>`
  )
}

// The far wall, with the ice-crack window; the near wall, with the crabapple window; the low wall on the left, with the fan.
// The left wall stands LOW below the near wall on the right, so that their copings do not line up into one horizon across the sheet.
const LOW = 56
const FAR_WALL: Wall = { name: 'a', left: 1244, right: 1660, freeLeft: true, freeRight: false, ridge: 403, band: 7, roof: 19, foot: 664, depth: 0.72, pitch: 8, hides: false }
const NEAR_WALL: Wall = { name: 'b', left: 1296, right: 1660, freeLeft: true, freeRight: false, ridge: 638, band: 8, roof: 23, foot: 912, depth: 1, pitch: 9, hides: true }
const LEFT_WALL: Wall = { name: 'c', left: -40, right: 404, freeLeft: false, freeRight: true, ridge: 644 + LOW, band: 8, roof: 22, foot: 894 + LOW, depth: 0.9, pitch: 9, hides: true }

// The bamboo stands between the two walls: its feet are behind the near wall, its leaves lie against the far one and the sky above it.
// One cane leads, taller and darker than the rest; one leans the other way and crosses it; one stands pale at the back; the feet are unevenly spaced.
const GROVE: Culm[] = [
  { x: 1552, base: 880, top: 318, lean: -12, girth: 3, joint: 40, leafFrom: 0.62, leafLength: 38, clearFrom: 394, clearTo: 442, salt: 19, tone: 0.5 },
  { x: 1494, base: 880, top: 300, lean: -26, girth: 4.2, joint: 41, leafFrom: 0.66, leafLength: 40, clearFrom: 394, clearTo: 442, salt: 4, tone: 0.92 },
  { x: 1536, base: 880, top: 258, lean: -40, girth: 5.6, joint: 46, leafFrom: 0.56, leafLength: 46, clearFrom: 394, clearTo: 442, salt: 7, tone: 1.12 },
  { x: 1508, base: 880, top: 298, lean: 30, girth: 3.8, joint: 40, leafFrom: 0.64, leafLength: 40, clearFrom: 394, clearTo: 442, salt: 10, tone: 0.86 },
  { x: 1590, base: 880, top: 272, lean: -28, girth: 4.4, joint: 43, leafFrom: 0.6, leafLength: 42, clearFrom: 394, clearTo: 442, salt: 13, tone: 1 },
]

/** How a wall comes out of the mist from left to right, as the greys of a mask: slowly at first, slowly at the last, so that neither end of the fade shows as a band. */
const MIST_STOPS = [[0, 0], [0.2, 0.06], [0.4, 0.3], [0.6, 0.7], [0.8, 0.94], [1, 1]]
  .map(([offset, part]) => {
    const grey = Math.round((part ?? 0) * 255).toString(16).padStart(2, '0')
    return `<stop offset="${offset}" stop-color="#${grey}${grey}${grey}"/>`
  })
  .join('')

/** The whole sheet on one stock. */
function latticeSheet(stock: Stock): string {
  const sky = stock.sky
  const mist = mistMaker(sky)
  const mistBand = mist.band

  const iceOpening = octagonAround(1376, 530, 52)
  const iceWindow = latticeWindow('wa', iceOpening, octagonAround(1376, 530, 57), iceCrack(iceOpening, 34, 5), 2.2, FAR_WALL.depth, 0, 1, stock)
  const appleOpening = squareAround(1474, 782, 57)
  const appleWindow = latticeWindow('wb', appleOpening, squareAround(1474, 782, 63), crabapple(1474, 782, 57, 4), 2.5, NEAR_WALL.depth, 0.3, 0.5, stock)
  const fan = fanOutline(300, 864 + LOW, 152, 74, 30, 0)
  const fanFrame = fanOutline(300, 864 + LOW, 152, 74, 30, 5.5)

  const farWall = wallMarkup(FAR_WALL, closed(iceOpening), stock)
  const nearWall = wallMarkup(NEAR_WALL, closed(appleOpening), stock)
  const leftWall = wallMarkup(LEFT_WALL, fan, stock)

  // The shadows lie on the bare plaster of the far wall between the ice-crack window and the grove, one of them across the window's corner:
  // 竹影 on a white wall, cast by sprays out of the picture to the right.
  const shadows = [
    leafShadow(
      'sh0',
      [{ x: 1496, y: 458 }, { x: 1452, y: 462 }, { x: 1404, y: 498 }],
      [{ part: 0.22, facing: 116, count: 3, length: 50 }, { part: 0.6, facing: 102, count: 3, length: 52 }, { part: 1, facing: 128, count: 3, length: 48 }],
      { x: 1496, y: 458 }, 31, 6, 61, stock,
    ),
    leafShadow(
      'sh1',
      [{ x: 1502, y: 562 }, { x: 1472, y: 566 }, { x: 1438, y: 590 }],
      [{ part: 0.45, facing: 110, count: 2, length: 44 }, { part: 1, facing: 132, count: 3, length: 40 }],
      { x: 1502, y: 562 }, 37, 19, 67, stock,
    ),
  ]

  const style = `
.drift{animation:drift 150s ease-in-out infinite alternate}
.nod{animation:nod 11s ease-in-out infinite alternate}
.stir{animation:stir 5s ease-in-out infinite alternate}
.shade{animation:shade 34s ease-in-out infinite alternate}
.pair{animation:glide 96s linear infinite;animation-delay:-28s}
.bob{animation:bob 6s ease-in-out infinite alternate}
@keyframes drift{from{transform:translateX(calc(var(--reach) * -1))}to{transform:translateX(var(--reach))}}
@keyframes nod{from{transform:rotate(-.4deg)}to{transform:rotate(.5deg)}}
@keyframes stir{from{transform:rotate(-5deg)}to{transform:rotate(6deg)}}
@keyframes glide{0%{transform:translate(-32px,13px);opacity:0}10%{opacity:1}80%{opacity:1}100%{transform:translate(78px,-31px);opacity:0}}
@keyframes bob{from{transform:translateY(-1.4px)}to{transform:translateY(1.6px)}}
@keyframes shade{from{transform:translate(-15px,4px) rotate(-1.5deg)}to{transform:translate(21px,-4px) rotate(2deg)}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  const disc =
    (stock.halo > 0 ? `<circle cx="1452" cy="212" r="78" fill="url(#halo)"/>` : '') +
    `<circle cx="1452" cy="212" r="23" fill="${stock.disc}" fill-opacity="0.9"/>` +
    mistBand(1442, 222, 66, 4.6, 14, 110, 20) +
    mistBand(1470, 233, 40, 2.6, -10, 86, 50)

  const frameInk = alpha(0.8 * LEFT_WALL.depth * stock.line)
  const fanMarkup =
    `<path d="${fan}" fill="url(#deep)" fill-opacity="0.28"/>` +
    `<path d="${fanFrame}${fan}" fill-rule="evenodd" fill="${stock.shade}" fill-opacity="${alpha(stock.brickAlpha * LEFT_WALL.depth)}"/>` +
    `<path d="${fanFrame}" stroke="${stock.ink}" stroke-opacity="${frameInk}" stroke-width="1.1" stroke-linejoin="miter"/>` +
    `<path d="${fan}" stroke="${stock.ink}" stroke-opacity="${alpha(0.66 * LEFT_WALL.depth * stock.line)}" stroke-width="0.9" stroke-linejoin="miter"/>`

  // Built in drawing order, so that every band of mist has made its gradient before the defs are written.
  const drawing = `${disc}
<g mask="url(#far)">${farWall.markup}${iceWindow.markup}</g>${shadows.map(part => part.markup).join('')}${mistBand(1286, 606, 104, 9, 18, 150, 60)}
${grove(GROVE, stock)}${stirringLeaves(GROVE, stock)}${mistBand(1486, 628, 170, 9, 24, 140, 30)}
<g mask="url(#near)">${nearWall.markup}${appleWindow.markup}</g>${mistBand(1324, 812, 68, 9, -14, 130, 40)}${mistBand(1486, 894, 190, 13, -30, 170, 80)}
${swallows(stock)}
${magnoliaBough(stock)}
${leftWall.markup}${fanMarkup}${mistBand(236, 880 + LOW, 200, 12, 30, 160, 110)}
${seal(232, 904, stock)}`

  const defs =
    skyDefs(sky) +
    mist.defs() +
    `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.disc}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.disc}" stop-opacity="0"/></radialGradient>` +
    // The shade inside any opening: deepest under its head.
    `<linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${stock.shade}" stop-opacity="${alpha(stock.shadeAlpha * 1.5 * stock.hole)}"/>` +
    `<stop offset="1" stop-color="${stock.shade}" stop-opacity="${alpha(stock.shadeAlpha * 0.62 * stock.hole)}"/></linearGradient>` +
    // Both walls on the right come out of the mist. The mist lies low, so it takes a wall's foot further along than its coping: the edge of
    // the fade slants, the coping reaching about 45 px further left than the plaster's foot. The far wall comes out over 66 px from x 1236
    // at its ridge, the near one over 96 px from x 1300 at its ridge.
    `<linearGradient id="farFade" gradientUnits="userSpaceOnUse" x1="1236" y1="403" x2="1300.8" y2="390.5">${MIST_STOPS}</linearGradient>` +
    `<mask id="far" maskUnits="userSpaceOnUse" x="1230" y="390" width="374" height="280"><rect x="1230" y="390" width="374" height="280" fill="url(#farFade)"/></mask>` +
    `<linearGradient id="nearFade" gradientUnits="userSpaceOnUse" x1="1300" y1="638" x2="1394.8" y2="622.8">${MIST_STOPS}</linearGradient>` +
    `<mask id="near" maskUnits="userSpaceOnUse" x="1290" y="626" width="314" height="292"><rect x="1290" y="626" width="314" height="292" fill="url(#nearFade)"/></mask>` +
    farWall.defs + nearWall.defs + leftWall.defs + iceWindow.defs + appleWindow.defs + shadows.map(part => part.defs).join('')

  const ground = `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>` + sky.glows.map((_, index) => `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow${index})"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${defs}</defs>
${ground}
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
${drawing}
</g>
</svg>`
}

/** Lattice Windows on any of its stocks: the pale day sky, the blue night sky, or the wine night sky. */
export function sceneSvg(stock: 'day' | 'night' | 'nightWine'): string {
  return latticeSheet(stock === 'day' ? STOCKS.day : stock === 'night' ? STOCKS.nightBlue : STOCKS.night)
}

/** Lattice Windows under a pale dusk sky, for a light window. */
export function daySvg(): string {
  return sceneSvg('day')
}

/** Lattice Windows under the blue night sky with one orange glow, for a dark window. */
export function nightSvg(): string {
  return sceneSvg('night')
}
