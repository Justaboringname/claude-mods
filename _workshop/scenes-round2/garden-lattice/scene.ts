// Lattice Windows: two whitewashed garden walls under grey tile copings, one behind the other, in the right band of the sheet.
// Both come out of the mist on their left and run off the sheet on their right. The far wall is the longer one: it has an
// octagonal window filled with ice-crack lattice, and bamboo stands in front of its bare plaster and throws the shadow of its
// leaves on it. The near wall hides the foot of the bamboo; it has a square window filled with crabapple lattice, and the
// canes show dimly through it.
// In the left band a lower wall ends on the sheet. It has a fan-shaped opening; a magnolia bough passes behind it, shows in
// the fan and rises over the coping, and a pair of swallows crosses the sky above.
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
  /** The shadow that leaves cast on a wall. */
  shadowAlpha: number
  /** How much ink the tiles and the ridge take, relative to the day sheet, and how strongly the tile rows are ruled. */
  tile: number
  ridge: number
  rows: number
  /** The same for pen lines. */
  line: number
  petal: string
  petalAlpha: number
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
    shade: '#2b2338', shadeAlpha: 0.17, brickAlpha: 0.3, shadowAlpha: 0.085, tile: 1, ridge: 0.62, rows: 1, line: 1,
    petal: '#ffffff', petalAlpha: 0.94, halo: 0,
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
    shade: '#0b070c', shadeAlpha: 0.5, brickAlpha: 0.42, shadowAlpha: 0.3, tile: 0.14, ridge: 0.2, rows: 0.62, line: 0.8,
    petal: '#f3e6ea', petalAlpha: 0.82, halo: 0.14,
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
    shade: '#07070d', shadeAlpha: 0.5, brickAlpha: 0.42, shadowAlpha: 0.3, tile: 0.14, ridge: 0.2, rows: 0.62, line: 0.8,
    petal: '#ebe6f4', petalAlpha: 0.82, halo: 0.14,
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

/** A smooth open path through the midpoints of the points. */
function smoothPath(points: Point[]): string {
  const first = points[0]
  const second = points[1]
  const third = points[2]
  const last = points[points.length - 1]
  if (!first || !second || !last) return ''
  if (points.length < 4 || !third) return 'M' + points.map(point => at(point.x, point.y)).join('L')
  let path = `M${at(first.x, first.y)}Q${at(second.x, second.y)} ${at((second.x + third.x) / 2, (second.y + third.y) / 2)}`
  for (let index = 2; index < points.length - 1; index += 1) {
    const here = points[index]
    const next = points[index + 1]
    if (here && next) path += `T${at((here.x + next.x) / 2, (here.y + next.y) / 2)}`
  }
  return `${path}T${at(last.x, last.y)}`
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
 * Every bar is drawn twice, a little wider in ink and then in limewash, so it has two fine edges and the joints come out clean. */
function latticeWindow(id: string, opening: Point[], frame: Point[], bars: string, barWidth: number, depth: number, veil: number, stock: Stock): Built {
  const centre = middleOf(opening)
  const hole = closed(opening)
  const air = skyAt(stock.sky, centre.x, centre.y)
  const limewash = mix(air, stock.lime, stock.bar)
  const pen = depth * stock.line
  const markup =
    // A veil of sky first: what stands behind the window is seen through the air of the garden, paler than what stands in front of the wall.
    (veil > 0 ? `<path d="${hole}" fill="${air}" fill-opacity="${veil}"/>` : '') +
    `<path d="${hole}" fill="url(#deep)" fill-opacity="${alpha(0.7 + 0.3 * depth)}"/>` +
    `<g clip-path="url(#${id})" stroke-linecap="butt" stroke-linejoin="miter"><path d="${bars}" stroke="${stock.ink}" stroke-opacity="${alpha(0.74 * pen)}" stroke-width="${fine(barWidth + 1.7)}"/>` +
    `<path d="${bars}" stroke="${limewash}" stroke-width="${barWidth}"/></g>` +
    `<path d="${closed(frame)}${hole}" fill-rule="evenodd" fill="${stock.shade}" fill-opacity="${alpha(stock.brickAlpha * depth)}"/>` +
    `<path d="${closed(frame)}" stroke="${stock.ink}" stroke-opacity="${alpha(0.8 * pen)}" stroke-width="1.1" stroke-linejoin="miter"/>` +
    `<path d="${hole}" stroke="${stock.ink}" stroke-opacity="${alpha(0.66 * pen)}" stroke-width="0.9" stroke-linejoin="miter"/>`
  return { defs: `<clipPath id="${id}"><path d="${hole}"/></clipPath>`, markup }
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
  const tipLength = wall.band * 4.5
  const tipUp = wall.band * 0.6
  const tipOut = wall.band * 1.1
  const ridgeTop =
    (wall.freeLeft ? `M${round(from - tipOut)} ${round(wall.ridge - tipUp)}Q${round(from + tipLength * 0.3)} ${wall.ridge} ${round(from + tipLength)} ${wall.ridge}` : `M${from} ${wall.ridge}`) +
    (wall.freeRight ? `H${round(to - tipLength)}Q${round(to - tipLength * 0.3)} ${wall.ridge} ${round(to + tipOut)} ${round(wall.ridge - tipUp)}` : `H${to}`)
  const ridgeShape =
    ridgeTop +
    (wall.freeRight ? `Q${round(to + tipOut * 0.1)} ${round(tile - wall.band * 0.2)} ${to - 3} ${tile}` : `V${tile}`) +
    (wall.freeLeft ? `H${from + 3}Q${round(from - tipOut * 0.1)} ${round(tile - wall.band * 0.2)} ${round(from - tipOut)} ${round(wall.ridge - tipUp)}Z` : `H${from}Z`)
  const body = `M${from} ${tile}H${to}V${eave}H${wall.right}V${wall.foot + 2}H${wall.left}V${eave}H${from}Z`
  const face = `M${wall.left} ${eave}H${wall.right}V${wall.foot + 2}H${wall.left}Z`

  // The rows of cover tiles, counted from a free end so that the end of the coping is whole.
  const rows: number[] = []
  if (wall.freeRight) for (let x = Math.round(to - wall.pitch * 0.72); x > Math.max(from + wall.pitch * 0.4, -wall.pitch); x -= wall.pitch) rows.unshift(x)
  else for (let x = Math.round(from + wall.pitch * 0.72); x < Math.min(to - wall.pitch * 0.4, WIDTH + wall.pitch); x += wall.pitch) rows.push(x)
  const cover = Math.round(wall.pitch * 0.38) / 2
  let covers = ''
  let edges = ''
  let caps = ''
  let drips = ''
  rows.forEach((x, index) => {
    covers += `M${round(x)} ${tile + 1.5}V${eave - 1}`
    edges += `M${round(x - cover)} ${tile + 1}V${eave}M${round(x + cover)} ${tile + 1}V${eave}`
    caps += `M${round(x - cover)} ${eave}a${round(cover)} ${round(cover)} 0 0 0 ${round(cover * 2)} 0Z`
    const next = rows[index + 1]
    if (next !== undefined) drips += `M${round(x + cover + 0.4)} ${eave}L${round((x + next) / 2)} ${round(eave + wall.pitch * 0.5)}L${round(next - cover - 0.4)} ${eave}Z`
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
    `<rect x="${from}" y="${tile}" width="${to - from}" height="${wall.roof}" fill="${ink}" fill-opacity="${alpha(0.32 * wall.depth * stock.tile)}"/>` +
    `<path d="${covers}" stroke="${ink}" stroke-opacity="${alpha(0.16 * pen * stock.rows)}" stroke-width="${round(cover * 2)}" stroke-linecap="butt"/>` +
    `<path d="${edges}" stroke="${ink}" stroke-opacity="${alpha(0.46 * pen * stock.rows)}" stroke-width="0.65" stroke-linecap="butt"/>` +
    `<path d="${drips}" fill="${ink}" fill-opacity="${alpha(0.66 * pen * stock.rows)}"/>` +
    `<path d="${caps}" fill="${ink}" fill-opacity="${alpha(0.72 * pen * stock.rows)}"/>` +
    `<path d="M${from} ${eave + 0.5}H${to}${wall.freeLeft ? `M${from} ${tile}V${eave}` : ''}${wall.freeRight ? `M${to} ${tile}V${eave}` : ''}" stroke="${ink}" stroke-opacity="${alpha(0.8 * pen)}" stroke-width="1.1"/>` +
    `<path d="${ridgeShape}" fill="${ink}" fill-opacity="${alpha(stock.ridge * wall.depth)}"/>` +
    `<path d="M${round(from + (wall.freeLeft ? tipLength : 0))} ${round(wall.ridge + wall.band * 0.56)}H${round(to - (wall.freeRight ? tipLength : 0))}" stroke="${stock.lime}" stroke-opacity="${alpha(0.34 * wall.depth)}" stroke-width="0.8"/>` +
    `<path d="${ridgeTop}" stroke="${ink}" stroke-opacity="${alpha(0.86 * pen)}" stroke-width="1.15"/>`
  return { defs, markup }
}

/** One bamboo leaf: a lance from its stalk at (x, y) out along `degrees`, fuller on one side, drawn to a long point. */
function leaf(x: number, y: number, degrees: number, length: number, width: number): string {
  const angle = (degrees * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const to = (along: number, across: number): string => at(x + along * cos - across * sin, y + along * sin + across * cos)
  return `M${at(x, y)}C${to(length * 0.2, -width * 0.62)} ${to(length * 0.6, -width * 0.52)} ${to(length, 0)}C${to(length * 0.62, width * 0.34)} ${to(length * 0.24, width * 0.42)} ${at(x, y)}Z`
}

/** A hand of leaves from one point, fanned about `facing`, the middle ones longest: the 个 and 介 of ink bamboo. */
function leafHand(x: number, y: number, facing: number, count: number, length: number, spread: number, salt: number): string {
  let d = ''
  const middle = (count - 1) / 2
  for (let index = 0; index < count; index += 1) {
    const away = middle === 0 ? 0 : Math.abs(index - middle) / middle
    const reach = length * (1 - 0.2 * away) * (0.88 + 0.24 * hashUnit(index, salt))
    d += leaf(x, y, facing + (index - middle) * spread + (hashUnit(index, salt + 1) - 0.5) * 10, reach, reach * 0.2)
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
}

/** A point on the cane's axis, `part` of the way up. The cane bends over towards its tip and wanders a hair from joint to joint, as no cane is ruled. */
function culmAxis(culm: Culm, part: number): Point {
  return { x: culm.x + culm.lean * Math.pow(part, 1.9) + (noise(part * 4, culm.salt + 21) - 0.5) * 4.4 * part, y: culm.base - (culm.base - culm.top) * part }
}

/** The cane in its joints (each a tapering piece, a hair's gap between), a twig from every upper joint on alternate sides,
 * a hand of leaves at each twig's end and a smaller one half way, and a spray at the tip. */
function bamboo(culm: Culm): { cane: string; twigs: string; leaves: string } {
  const height = culm.base - culm.top
  const count = Math.max(2, Math.round(height / culm.joint))
  let cane = ''
  let twigs = ''
  let leaves = ''
  for (let joint = 0; joint < count; joint += 1) {
    const from = joint / count
    const to = (joint + 1) / count
    const a = culmAxis(culm, from + 1 / height)
    const b = culmAxis(culm, to - 1 / height)
    const widthA = (culm.girth * (1 - 0.6 * from)) / 2
    const widthB = (culm.girth * (1 - 0.6 * to)) / 2
    cane += `M${at(a.x - widthA, a.y)}L${at(b.x - widthB, b.y)}L${at(b.x + widthB, b.y)}L${at(a.x + widthA, a.y)}Z`
    if (to < culm.leafFrom || joint === count - 1) continue
    const knot = culmAxis(culm, to)
    const side = (joint + culm.salt) % 2 === 0 ? -1 : 1
    const reach = culm.leafLength * (0.8 + 0.5 * hashUnit(joint, culm.salt + 3))
    const rise = reach * (0.65 + 0.5 * hashUnit(joint, culm.salt + 5))
    const tip = { x: knot.x + side * reach, y: knot.y - rise }
    if (tip.y > culm.clearFrom && tip.y < culm.clearTo) continue
    const bend = { x: knot.x + side * reach * 0.3, y: knot.y - rise * 0.8 }
    twigs += `M${at(knot.x, knot.y)}Q${at(bend.x, bend.y)} ${at(tip.x, tip.y)}`
    const droop = (hashUnit(joint, culm.salt + 9) - 0.5) * 22
    leaves += leafHand(tip.x, tip.y, (side < 0 ? 142 : 38) + droop * side, 3 + Math.floor(hashUnit(joint, culm.salt + 7) * 1.5), culm.leafLength, 20, culm.salt + joint * 13)
    if (hashUnit(joint, culm.salt + 11) < 0.6) continue
    const half = { x: 0.25 * knot.x + 0.5 * bend.x + 0.25 * tip.x, y: 0.25 * knot.y + 0.5 * bend.y + 0.25 * tip.y }
    leaves += leafHand(half.x, half.y, side < 0 ? 112 : 68, 2, culm.leafLength * 0.8, 26, culm.salt + joint * 13 + 5)
  }
  const crown = culmAxis(culm, 1)
  const toward = culm.lean < 0 ? 204 : -24
  leaves += leafHand(crown.x, crown.y, toward, 3, culm.leafLength * 1.05, culm.lean < 0 ? 24 : -24, culm.salt + 91)
  leaves += leafHand(crown.x, crown.y + 2, culm.lean < 0 ? 322 : 218, 2, culm.leafLength * 0.7, 34, culm.salt + 93)
  return { cane, twigs, leaves }
}

/** The grove between the two walls: each cane with its leaves nods a little about its foot, which the near wall hides. */
function grove(culms: Culm[], stock: Stock): string {
  let markup = ''
  culms.forEach((culm, index) => {
    const parts = bamboo(culm)
    markup +=
      `<g class="nod" style="transform-origin:${culm.x}px ${culm.base}px;animation-duration:${9 + (index % 3) * 2.5}s;animation-delay:-${round(hashUnit(index, 17) * 9)}s">` +
      `<path d="${parts.cane}" fill="${stock.ink}" fill-opacity="${alpha(0.6 * stock.line)}"/>` +
      `<path d="${parts.twigs}" stroke="${stock.ink}" stroke-opacity="${alpha(0.6 * stock.line)}" stroke-width="0.9"/>` +
      `<path d="${parts.leaves}" fill="${stock.ink}" fill-opacity="${alpha(0.72 * stock.line)}"/></g>`
  })
  return markup
}

/** The low twigs of two canes, where the crabapple window shows them, and a few single leaves on them that turn on their stalks. */
function stirringLeaves(stock: Stock): string {
  const hung = [
    { x: 1470, y: 776, facing: 152, length: 26 },
    { x: 1470, y: 776, facing: 116, length: 28 },
    { x: 1470, y: 776, facing: 184, length: 21 },
    { x: 1477, y: 748, facing: 138, length: 23 },
    { x: 1477, y: 748, facing: 100, length: 25 },
    { x: 1511, y: 770, facing: 132, length: 25 },
    { x: 1511, y: 770, facing: 164, length: 19 },
  ]
  return (
    `<path d="M1499 807Q1485 796 1470 776M1499 769Q1489 761 1477 748M1523 797Q1518 784 1511 770" stroke="${stock.ink}" stroke-opacity="${alpha(0.6 * stock.line)}" stroke-width="0.9"/>` +
    hung
      .map(
        (one, index) =>
          `<path class="stir" style="transform-origin:${one.x}px ${one.y}px;animation-duration:${round(4.6 + hashUnit(index, 23) * 3.2)}s;animation-delay:-${round(hashUnit(index, 29) * 5)}s" ` +
          `d="${leaf(one.x, one.y, one.facing, one.length, one.length * 0.2)}" fill="${stock.ink}" fill-opacity="${alpha(0.72 * stock.line)}"/>`,
      )
      .join('')
  )
}

/** The shadow of a bamboo spray on plaster: a stem and hands of large leaves, all in one faint flat tone. It drifts as the spray that casts it sways. */
function leafShadow(stem: Point[], hands: Array<{ part: number; facing: number; count: number; length: number }>, pivot: Point, seconds: number, delay: number, salt: number, stock: Stock): string {
  const first = stem[0]
  const bend = stem[1]
  const last = stem[2]
  if (!first || !bend || !last) return ''
  let leaves = ''
  hands.forEach((hand, index) => {
    const rest = 1 - hand.part
    const x = rest * rest * first.x + 2 * rest * hand.part * bend.x + hand.part * hand.part * last.x
    const y = rest * rest * first.y + 2 * rest * hand.part * bend.y + hand.part * hand.part * last.y
    leaves += leafHand(x, y, hand.facing, hand.count, hand.length, 27, salt + index * 7)
  })
  return (
    `<g class="shade" style="transform-origin:${pivot.x}px ${pivot.y}px;animation-duration:${seconds}s;animation-delay:-${delay}s">` +
    `<path d="M${at(first.x, first.y)}Q${at(bend.x, bend.y)} ${at(last.x, last.y)}" stroke="${stock.shade}" stroke-opacity="${alpha(stock.shadowAlpha * 0.9)}" stroke-width="2.2"/>` +
    `<path d="${leaves}" fill="${stock.shade}" fill-opacity="${alpha(stock.shadowAlpha)}"/></g>`
  )
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

/** One magnolia flower standing on its twig at (x, y), `size` tall, leaning `tilt` degrees from upright: a cup of three petals, or a closed bud. */
function magnolia(x: number, y: number, size: number, tilt: number, open: boolean): string {
  const angle = (tilt * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const to = (across: number, up: number): string => at(x + across * size * cos + up * size * sin, y + across * size * sin - up * size * cos)
  const petal = (lean: number, wide: number, tall: number): string =>
    `M${at(x, y)}C${to(lean - wide, tall * 0.3)} ${to(lean * 1.6 - wide * 0.7, tall * 0.84)} ${to(lean * 1.5, tall)}C${to(lean * 1.2 + wide * 0.7, tall * 0.8)} ${to(lean * 0.5 + wide, tall * 0.3)} ${at(x, y)}Z`
  if (!open) return petal(0, 0.3, 1)
  return petal(-0.3, 0.26, 0.92) + petal(0.3, 0.26, 0.92) + petal(0, 0.3, 1.1)
}

/** The magnolia behind the left wall: a bough that crosses the fan window, goes on behind the plaster and comes up over the coping,
 * bare of leaves, with white cups at the ends of its twigs. */
function magnoliaBough(stock: Stock): string {
  const ink = stock.ink
  const bough: Point[] = [
    { x: 206, y: 834 }, { x: 238, y: 796 }, { x: 272, y: 765 }, { x: 306, y: 742 }, { x: 336, y: 716 }, { x: 356, y: 684 }, { x: 367, y: 648 },
  ]
  const leader: Point[] = [{ x: 367, y: 648 }, { x: 372, y: 608 }, { x: 367, y: 568 }, { x: 356, y: 532 }]
  const limbs: Point[][] = [
    [{ x: 289, y: 753 }, { x: 312, y: 758 }, { x: 332, y: 755 }, { x: 345, y: 746 }],
    [{ x: 272, y: 765 }, { x: 266, y: 748 }, { x: 266, y: 733 }],
    [{ x: 367, y: 648 }, { x: 386, y: 624 }, { x: 398, y: 596 }, { x: 402, y: 571 }],
    [{ x: 372, y: 608 }, { x: 347, y: 592 }, { x: 318, y: 574 }, { x: 294, y: 548 }, { x: 281, y: 520 }],
    [{ x: 356, y: 532 }, { x: 375, y: 514 }, { x: 384, y: 491 }],
    [{ x: 357, y: 535 }, { x: 351, y: 517 }, { x: 347, y: 503 }],
  ]
  const twigs: Point[][] = [
    [{ x: 398, y: 596 }, { x: 408, y: 588 }, { x: 412, y: 580 }],
    [{ x: 318, y: 574 }, { x: 306, y: 554 }, { x: 302, y: 536 }],
    [{ x: 367, y: 568 }, { x: 348, y: 552 }, { x: 337, y: 533 }],
    [{ x: 336, y: 716 }, { x: 330, y: 705 }, { x: 329, y: 697 }],
  ]
  const flowers = [
    { x: 346, y: 744, size: 17, tilt: 28, open: true },
    { x: 266, y: 731, size: 11, tilt: -4, open: false },
    { x: 329, y: 695, size: 10, tilt: -6, open: false },
    { x: 402, y: 568, size: 17, tilt: 8, open: true },
    { x: 413, y: 578, size: 10, tilt: 30, open: false },
    { x: 280, y: 517, size: 18, tilt: -14, open: true },
    { x: 302, y: 533, size: 11, tilt: -8, open: false },
    { x: 337, y: 530, size: 11, tilt: -16, open: false },
    { x: 385, y: 488, size: 16, tilt: 12, open: true },
    { x: 346, y: 500, size: 18, tilt: -8, open: true },
  ]
  const wood = alpha(0.82 * stock.line)
  const cups = flowers.map(flower => magnolia(flower.x, flower.y, flower.size, flower.tilt, flower.open)).join('')
  const stalks = flowers.map(flower => `M${at(flower.x, flower.y + 1.2)}l0 -2`).join('')
  // A twig of three points is one bend, not a corner.
  const bent = (points: Point[]): string => {
    const [a, b, c] = points
    return a && b && c && points.length === 3 ? `M${at(a.x, a.y)}Q${at(b.x, b.y)} ${at(c.x, c.y)}` : smoothPath(points)
  }
  return (
    `<path d="${smoothPath(bough)}" stroke="${ink}" stroke-opacity="${wood}" stroke-width="3.4"/>` +
    `<path d="${smoothPath(leader)}" stroke="${ink}" stroke-opacity="${wood}" stroke-width="2.3"/>` +
    `<path d="${limbs.map(bent).join('')}" stroke="${ink}" stroke-opacity="${wood}" stroke-width="1.7"/>` +
    `<path d="${twigs.map(bent).join('')}" stroke="${ink}" stroke-opacity="${wood}" stroke-width="1.15"/>` +
    `<path d="${cups}" fill="${stock.petal}" fill-opacity="${stock.petalAlpha}" stroke="${ink}" stroke-opacity="${alpha(0.78 * stock.line)}" stroke-width="0.85"/>` +
    `<path d="${stalks}" stroke="${ink}" stroke-opacity="${alpha(0.9 * stock.line)}" stroke-width="1.9"/>`
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
    { x: 262, y: 398, size: 0.96, heading: -24 },
    { x: 302, y: 370, size: 0.8, heading: -31 },
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

/** A small plain seal: a vermilion square with a four-lobed crabapple flower left bare. A mark, not a character. */
function seal(x: number, y: number, stock: Stock): string {
  const bare = skyAt(stock.sky, x + 12, y + 12)
  return (
    `<g transform="translate(${x} ${y})" opacity="0.92"><rect width="24" height="24" rx="2.2" fill="${stock.seal}"/>` +
    `<path d="M15.2 8.8a3.2 3.2 0 0 1 0 6.4a3.2 3.2 0 0 1 -6.4 0a3.2 3.2 0 0 1 0 -6.4a3.2 3.2 0 0 1 6.4 0Z" stroke="${bare}" stroke-width="1.6"/>` +
    `<circle cx="12" cy="12" r="1.3" fill="${bare}"/></g>`
  )
}

// The far wall, with the ice-crack window; the near wall, with the crabapple window; the low wall on the left, with the fan.
const FAR_WALL: Wall = { name: 'a', left: 1244, right: 1660, freeLeft: true, freeRight: false, ridge: 404, band: 5, roof: 19, foot: 664, depth: 0.72, pitch: 8, hides: false }
const NEAR_WALL: Wall = { name: 'b', left: 1296, right: 1660, freeLeft: true, freeRight: false, ridge: 640, band: 6, roof: 23, foot: 912, depth: 1, pitch: 9, hides: true }
const LEFT_WALL: Wall = { name: 'c', left: -40, right: 404, freeLeft: false, freeRight: true, ridge: 646, band: 6, roof: 22, foot: 894, depth: 0.9, pitch: 9, hides: true }

// The bamboo stands between the two walls: its feet are behind the near wall, its leaves lie against the far one and the sky above it.
const GROVE: Culm[] = [
  { x: 1500, base: 880, top: 306, lean: -24, girth: 4.2, joint: 40, leafFrom: 0.68, leafLength: 26, clearFrom: 394, clearTo: 442, salt: 4 },
  { x: 1524, base: 880, top: 250, lean: -38, girth: 4.8, joint: 44, leafFrom: 0.58, leafLength: 27, clearFrom: 394, clearTo: 442, salt: 7 },
  { x: 1566, base: 880, top: 282, lean: -12, girth: 3.8, joint: 39, leafFrom: 0.62, leafLength: 25, clearFrom: 394, clearTo: 442, salt: 10 },
  { x: 1598, base: 880, top: 236, lean: -44, girth: 4.6, joint: 43, leafFrom: 0.6, leafLength: 27, clearFrom: 394, clearTo: 442, salt: 13 },
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

  const iceOpening = octagonAround(1392, 530, 52)
  const iceWindow = latticeWindow('wa', iceOpening, octagonAround(1392, 530, 57), iceCrack(iceOpening, 21, 5), 2.6, FAR_WALL.depth, 0, stock)
  const appleOpening = squareAround(1474, 782, 57)
  const appleWindow = latticeWindow('wb', appleOpening, squareAround(1474, 782, 63), crabapple(1474, 782, 57, 3), 3.1, NEAR_WALL.depth, 0.4, stock)
  const fan = fanOutline(300, 864, 152, 74, 30, 0)
  const fanFrame = fanOutline(300, 864, 152, 74, 30, 5.5)

  const farWall = wallMarkup(FAR_WALL, closed(iceOpening), stock)
  const nearWall = wallMarkup(NEAR_WALL, closed(appleOpening), stock)
  const leftWall = wallMarkup(LEFT_WALL, fan, stock)

  // The shadows lie on the far wall, down and to the left of the leaves that cast them: the light comes from the disc.
  const shadows =
    leafShadow(
      [{ x: 1624, y: 452 }, { x: 1554, y: 458 }, { x: 1508, y: 500 }],
      [{ part: 0.35, facing: 122, count: 3, length: 40 }, { part: 0.68, facing: 108, count: 3, length: 42 }, { part: 1, facing: 144, count: 4, length: 40 }],
      { x: 1624, y: 452 }, 31, 6, 61, stock,
    ) +
    leafShadow(
      [{ x: 1628, y: 546 }, { x: 1578, y: 552 }, { x: 1522, y: 594 }],
      [{ part: 0.4, facing: 116, count: 3, length: 36 }, { part: 1, facing: 138, count: 4, length: 38 }],
      { x: 1628, y: 546 }, 37, 19, 67, stock,
    )

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
<g mask="url(#far)">${farWall.markup}${iceWindow.markup}</g>${shadows}${mistBand(1286, 606, 104, 9, 18, 150, 60)}
${grove(GROVE, stock)}${stirringLeaves(stock)}${mistBand(1486, 628, 170, 9, 24, 140, 30)}
<g mask="url(#near)">${nearWall.markup}${appleWindow.markup}</g>${mistBand(1486, 894, 190, 13, -30, 170, 80)}
${swallows(stock)}
${magnoliaBough(stock)}
${leftWall.markup}${fanMarkup}${mistBand(236, 880, 200, 12, 30, 160, 110)}
${seal(232, 916, stock)}`

  const defs =
    skyDefs(sky) +
    mist.defs() +
    `<radialGradient id="halo"><stop offset="0.3" stop-color="${stock.disc}" stop-opacity="${stock.halo}"/><stop offset="1" stop-color="${stock.disc}" stop-opacity="0"/></radialGradient>` +
    // The shade inside any opening: deepest under its head.
    `<linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${stock.shade}" stop-opacity="${alpha(stock.shadeAlpha * 1.5)}"/>` +
    `<stop offset="1" stop-color="${stock.shade}" stop-opacity="${alpha(stock.shadeAlpha * 0.62)}"/></linearGradient>` +
    // Both walls on the right come out of the mist: nothing of the far one at x 1252 and all of it from x 1332, the near one from x 1308 to x 1404.
    `<linearGradient id="farFade" gradientUnits="userSpaceOnUse" x1="1252" y1="0" x2="1332" y2="0">${MIST_STOPS}</linearGradient>` +
    `<mask id="far" maskUnits="userSpaceOnUse" x="1240" y="390" width="364" height="280"><rect x="1240" y="390" width="364" height="280" fill="url(#farFade)"/></mask>` +
    `<linearGradient id="nearFade" gradientUnits="userSpaceOnUse" x1="1308" y1="0" x2="1404" y2="0">${MIST_STOPS}</linearGradient>` +
    `<mask id="near" maskUnits="userSpaceOnUse" x="1290" y="626" width="314" height="292"><rect x="1290" y="626" width="314" height="292" fill="url(#nearFade)"/></mask>` +
    farWall.defs + nearWall.defs + leftWall.defs + iceWindow.defs + appleWindow.defs

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
