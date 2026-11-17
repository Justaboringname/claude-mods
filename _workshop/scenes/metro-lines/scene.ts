// Metro Lines: the edge of an imaginary city's transit map. Six routes come in from the edges of the sheet and run
// strictly east-west, north-south or at 45 degrees, with rounded bends; where they share a corridor they run as a
// parallel bundle and take each bend about one common centre. A pale river, water-lined in fine pen, cuts both lower corners.
// Stations are small paper-filled rings, interchanges are capsules across a bundle, a line that ends gets a bar, and
// every station has a "name": one fine dash, since this city has none.
// One or two small trains per line (a short dash on a copy of the line) run out to the end and back, stopping at every station.
// Two stocks: warm paper for a light window, warm charcoal for a dark one. Pure string building, the same string every call.

const WIDTH = 1600
const HEIGHT = 1000

type Key = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

interface Stock {
  paper: string
  water: string
  bank: string
  ink: string
  ring: string
  routes: Record<Key, string>
  /** How much of a route's colour its line keeps; the rest is paper, so the sheet stays a backdrop. */
  lineStrength: Record<Key, number>
  trainStrength: number
  nameOpacity: number
}

const DAY: Stock = {
  paper: '#f3eee3', water: '#ece5d5', bank: '#a39478', ink: '#3b342c', ring: '#fcfaf4',
  routes: { A: '#c4552d', B: '#c08f2e', C: '#7c7f3c', D: '#7f4a61', E: '#4b4640', F: '#ab8c58' },
  lineStrength: { A: 0.7, B: 0.6, C: 0.56, D: 0.56, E: 0.5, F: 0.62 },
  trainStrength: 1, nameOpacity: 0.46,
}
/** The same map on warm charcoal: pale warm inks, no blue anywhere. */
const NIGHT: Stock = {
  paper: '#211a14', water: '#271f18', bank: '#8a7860', ink: '#d6cab4', ring: '#17120d',
  routes: { A: '#e07a50', B: '#d6a850', C: '#9c9a55', D: '#a86468', E: '#b3a999', F: '#c9b58c' },
  lineStrength: { A: 0.62, B: 0.5, C: 0.48, D: 0.52, E: 0.42, F: 0.46 },
  trainStrength: 0.96, nameOpacity: 0.4,
}

interface Vec {
  x: number
  y: number
}

const D = Math.SQRT1_2
const EAST: Vec = { x: 1, y: 0 }
const SOUTH_EAST: Vec = { x: D, y: D }
const SOUTH: Vec = { x: 0, y: 1 }
const NORTH_WEST: Vec = { x: -D, y: -D }
const NORTH: Vec = { x: 0, y: -1 }
const NORTH_EAST: Vec = { x: D, y: -D }

/** One straight stretch of a route: the corridor's centre line (a point and a compass direction) and how far to its right the route runs. */
interface Leg {
  at: Vec
  dir: Vec
  offset: number
}

interface Traced {
  d: string
  length: number
  lines: { p: Vec; u: Vec }[]
  spans: { from: Vec; startLength: number }[]
  end: Vec
  endDir: Vec
}

/** A station. ring: drawn as a ring on this route alone (false: it sits under an interchange capsule). name: which side its dash goes, 0 for none. */
interface StopSpec {
  leg: number
  ref: Vec
  ring: boolean
  name: number
}

/** A train's place at the first frame, which is also where it stands when motion is off: the stop (0 is away, off the sheet),
 * how far through that stop's pause it is (or, if moving, through the run on to the next stop), and whether it is on its way back. */
interface TrainSpec {
  stop: number
  share: number
  inbound: boolean
  moving: boolean
}

interface RouteSpec {
  key: Key
  from: Vec
  legs: Leg[]
  to: Vec
  radius: number
  radii: number[]
  stops: StopSpec[]
  endsAtTerminus: boolean
  barHalf: number
  endName: number
  trains: TrainSpec[]
  awaySeconds: number
}

interface Stop {
  point: Vec
  along: number
}

interface BuiltRoute {
  spec: RouteSpec
  traced: Traced
  stops: Stop[]
}

/** A fixed pseudo-random number in 0..1 for a whole number, so every build is the same. */
function hash(seed: number): number {
  let value = Math.imul(seed + 17, 374761393) | 0
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  value ^= value >>> 16
  return (value >>> 0) / 4294967296
}

function fmt(value: number): string {
  return String(Math.round(value * 10) / 10)
}

function pt(point: Vec): string {
  return `${fmt(point.x)} ${fmt(point.y)}`
}

function add(a: Vec, b: Vec, scale: number): Vec {
  return { x: a.x + b.x * scale, y: a.y + b.y * scale }
}

function cross(a: Vec, b: Vec): number {
  return a.x * b.y - a.y * b.x
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y
}

/** The right-hand normal of a direction (the sheet's y grows downward). */
function normal(u: Vec): Vec {
  return { x: -u.y, y: u.x }
}

function project(point: Vec, line: { p: Vec; u: Vec }): Vec {
  return add(line.p, line.u, dot({ x: point.x - line.p.x, y: point.y - line.p.y }, line.u))
}

function meet(first: { p: Vec; u: Vec }, second: { p: Vec; u: Vec }): Vec {
  const along = cross({ x: second.p.x - first.p.x, y: second.p.y - first.p.y }, second.u) / cross(first.u, second.u)
  return add(first.p, first.u, along)
}

/** a toward b by share t, as a hex colour. */
function mix(a: string, b: string, t: number): string {
  const first = parseInt(a.slice(1), 16)
  const second = parseInt(b.slice(1), 16)
  let out = '#'
  for (const shift of [16, 8, 0]) {
    const from = (first >> shift) & 255
    const to = (second >> shift) & 255
    out += Math.round(from + (to - from) * t).toString(16).padStart(2, '0')
  }
  return out
}

/**
 * A route as one path: straight legs joined by circular bends. A bend's radius is the corridor's radius less the route's
 * offset toward the inside of the turn, so every line of a bundle turns about the same centre.
 */
function trace(from: Vec, legs: Leg[], to: Vec, radius: number, radii: number[]): Traced {
  const lines = legs.map(leg => ({ p: add(leg.at, normal(leg.dir), leg.offset), u: leg.dir }))
  const count = lines.length
  const vertices: Vec[] = []
  for (let index = 0; index <= count; index += 1) {
    const before = lines[index - 1]
    const after = lines[index]
    if (!before && after) vertices.push(project(from, after))
    else if (before && !after) vertices.push(project(to, before))
    else if (before && after) vertices.push(meet(before, after))
  }
  let cursor = vertices[0] ?? from
  let d = `M${pt(cursor)}`
  let length = 0
  const spans: { from: Vec; startLength: number }[] = []
  for (let index = 0; index < count; index += 1) {
    const line = lines[index]
    const next = lines[index + 1]
    const corner = vertices[index + 1]
    const leg = legs[index]
    const nextLeg = legs[index + 1]
    if (!line || !corner || !leg) continue
    spans.push({ from: cursor, startLength: length })
    if (!next || !nextLeg) {
      length += Math.hypot(corner.x - cursor.x, corner.y - cursor.y)
      d += `L${pt(corner)}`
      cursor = corner
      continue
    }
    const side = Math.sign(cross(line.u, next.u))
    const turn = Math.acos(Math.max(-1, Math.min(1, dot(line.u, next.u))))
    const shared = leg.offset === nextLeg.offset ? leg.offset : 0
    const bend = Math.max(6, (radii[index] ?? radius) - side * shared)
    const tangent = bend * Math.tan(turn / 2)
    const enter = add(corner, line.u, -tangent)
    const leave = add(corner, next.u, tangent)
    length += Math.hypot(enter.x - cursor.x, enter.y - cursor.y) + bend * turn
    d += `L${pt(enter)}A${fmt(bend)} ${fmt(bend)} 0 0 ${side > 0 ? 1 : 0} ${pt(leave)}`
    cursor = leave
  }
  const last = lines[count - 1]
  return { d, length: Math.round(length * 10) / 10, lines, spans, end: cursor, endDir: last ? last.u : EAST }
}

function build(spec: RouteSpec): BuiltRoute {
  const traced = trace(spec.from, spec.legs, spec.to, spec.radius, spec.radii)
  const stops: Stop[] = []
  for (const stop of spec.stops) {
    const line = traced.lines[stop.leg]
    const span = traced.spans[stop.leg]
    if (!line || !span) continue
    const point = project(stop.ref, line)
    stops.push({ point, along: span.startLength + dot({ x: point.x - span.from.x, y: point.y - span.from.y }, line.u) })
  }
  return { spec, traced, stops }
}

// ---- The map. Right band: a trunk of three lines climbs out of the lower right corner, jogs north-west over the river,
// and opens: plum away to the west, terracotta and ochre together to the north-east, then terracotta alone to its terminus.
// A graphite line hugs the river's inner bank. Left band: two lines come down out of the sidebar. ----

const GAP = 10
const TRUNK_SOUTH: Vec = { x: 1550, y: 1000 }
const TRUNK_JOG: Vec = { x: 1550, y: 905 }
const TRUNK_NORTH: Vec = { x: 1450, y: 805 }
const FORK: Vec = { x: 1450, y: 560 }
const TRUNK_RADIUS = 34

function trunk(offset: number): Leg[] {
  return [
    { at: TRUNK_SOUTH, dir: NORTH, offset },
    { at: TRUNK_JOG, dir: NORTH_WEST, offset },
    { at: TRUNK_NORTH, dir: NORTH, offset },
  ]
}

const RIVER_HALF = 17
const RIVER_RADIUS = 60
const EAST_RIVER: Leg[] = [
  { at: { x: 1436, y: 1040 }, dir: NORTH, offset: 0 },
  { at: { x: 1436, y: 934 }, dir: NORTH_EAST, offset: 0 },
  { at: { x: 1570, y: 800 }, dir: EAST, offset: 0 },
]
const WEST_RIVER: Leg[] = [
  { at: { x: -40, y: 792 }, dir: EAST, offset: 0 },
  { at: { x: 232, y: 792 }, dir: SOUTH_EAST, offset: 0 },
  { at: { x: 350, y: 910 }, dir: SOUTH, offset: 0 },
]

/** Where the bank line meets the trunk on its diagonal, and the interchanges further up. */
const BRIDGE_STOP: Vec = { x: 1530, y: 885 }
const TRUNK_STOP: Vec = { x: 1450, y: 730 }
const UPPER_STOP: Vec = { x: 1450, y: 618 }
const FORK_STOP: Vec = { x: 1490, y: 520 }

const WEST_BUNDLE: Leg[] = [
  { at: { x: -40, y: 566 }, dir: EAST, offset: 0 },
  { at: { x: 226, y: 566 }, dir: SOUTH_EAST, offset: 0 },
  { at: { x: 300, y: 640 }, dir: SOUTH, offset: 0 },
]
const WEST_DIAGONAL_STOP: Vec = { x: 263, y: 603 }
const WEST_STOP: Vec = { x: 300, y: 704 }

function shifted(legs: Leg[], offset: number): Leg[] {
  return legs.map(leg => ({ at: leg.at, dir: leg.dir, offset }))
}

const ROUTES: RouteSpec[] = [
  // F, sand: the inner line of the left pair; it ends north of the river.
  {
    key: 'F', from: { x: -40, y: 576 }, legs: shifted(WEST_BUNDLE, GAP), to: { x: 290, y: 772 }, radius: 34, radii: [],
    stops: [{ leg: 0, ref: { x: 96, y: 576 }, ring: false, name: 0 }, { leg: 1, ref: WEST_DIAGONAL_STOP, ring: false, name: 0 }, { leg: 2, ref: WEST_STOP, ring: false, name: 0 }],
    endsAtTerminus: true, barHalf: 6.5, endName: -1, trains: [{ stop: 4, share: 0.4, inbound: false, moving: false }], awaySeconds: 16,
  },
  // C, olive: the outer line of the left pair; it crosses the river and leaves by the bottom edge.
  {
    key: 'C', from: { x: -40, y: 566 }, legs: shifted(WEST_BUNDLE, 0), to: { x: 300, y: 1040 }, radius: 34, radii: [],
    stops: [
      { leg: 0, ref: { x: 96, y: 566 }, ring: false, name: 0 }, { leg: 1, ref: WEST_DIAGONAL_STOP, ring: false, name: 1 },
      { leg: 2, ref: WEST_STOP, ring: false, name: 1 }, { leg: 2, ref: { x: 300, y: 790 }, ring: true, name: 1 },
      { leg: 2, ref: { x: 300, y: 940 }, ring: true, name: -1 },
    ],
    endsAtTerminus: false, barHalf: 0, endName: 0, trains: [{ stop: 2, share: 0.5, inbound: false, moving: true }], awaySeconds: 9,
  },
  // E, graphite: along the river's inner bank, through the trunk's interchange.
  {
    key: 'E', from: { x: 1468, y: 1040 }, legs: shifted(EAST_RIVER, 32), to: { x: 1640, y: 832 }, radius: RIVER_RADIUS, radii: [],
    stops: [{ leg: 1, ref: BRIDGE_STOP, ring: false, name: 0 }],
    endsAtTerminus: false, barHalf: 0, endName: 0, trains: [{ stop: 0, share: 0.35, inbound: false, moving: false }], awaySeconds: 22,
  },
  // B, ochre: the trunk's east line; it turns north-east with the hero, then goes on alone to the right edge.
  {
    key: 'B', from: { x: 1560, y: 1040 }, legs: [...trunk(GAP), { at: FORK, dir: NORTH_EAST, offset: GAP }], to: { x: 1640, y: 384 },
    radius: TRUNK_RADIUS, radii: [],
    stops: [
      { leg: 1, ref: BRIDGE_STOP, ring: false, name: 0 }, { leg: 2, ref: TRUNK_STOP, ring: false, name: 1 },
      { leg: 2, ref: UPPER_STOP, ring: false, name: 1 }, { leg: 3, ref: FORK_STOP, ring: false, name: 1 },
    ],
    endsAtTerminus: false, barHalf: 0, endName: 0, trains: [{ stop: 4, share: 0.62, inbound: false, moving: true }], awaySeconds: 8,
  },
  // D, plum: the trunk's west line; it peels off north-west and ends a short walk from the others.
  {
    key: 'D', from: { x: 1540, y: 1040 }, legs: [...trunk(-GAP), { at: { x: 1440, y: 664 }, dir: NORTH_WEST, offset: 0 }, { at: { x: 1350, y: 574 }, dir: NORTH, offset: 0 }],
    to: { x: 1350, y: 444 }, radius: TRUNK_RADIUS, radii: [TRUNK_RADIUS, TRUNK_RADIUS, 24, 24],
    stops: [
      { leg: 1, ref: BRIDGE_STOP, ring: false, name: 0 }, { leg: 2, ref: TRUNK_STOP, ring: false, name: 0 },
      { leg: 3, ref: { x: 1394, y: 618 }, ring: true, name: -1 }, { leg: 4, ref: { x: 1350, y: 524 }, ring: true, name: -1 },
    ],
    endsAtTerminus: true, barHalf: 9, endName: -1, trains: [{ stop: 4, share: 0.5, inbound: true, moving: false }], awaySeconds: 12,
  },
  // A, terracotta: the hero. Up the trunk, north-east with the ochre line, then alone to a terminus high in the right band.
  {
    key: 'A', from: { x: 1550, y: 1040 }, legs: [...trunk(0), { at: FORK, dir: NORTH_EAST, offset: 0 }, { at: { x: 1530, y: 480 }, dir: NORTH, offset: 0 }],
    to: { x: 1530, y: 226 }, radius: TRUNK_RADIUS, radii: [TRUNK_RADIUS, TRUNK_RADIUS, TRUNK_RADIUS, 24],
    stops: [
      { leg: 1, ref: BRIDGE_STOP, ring: false, name: 0 }, { leg: 2, ref: TRUNK_STOP, ring: false, name: 0 },
      { leg: 2, ref: UPPER_STOP, ring: false, name: 0 }, { leg: 3, ref: FORK_STOP, ring: false, name: 0 },
      { leg: 4, ref: { x: 1530, y: 402 }, ring: true, name: 1 }, { leg: 4, ref: { x: 1530, y: 314 }, ring: true, name: 1 },
    ],
    endsAtTerminus: true, barHalf: 9, endName: 1, trains: [{ stop: 5, share: 0.5, inbound: false, moving: true }, { stop: 2, share: 0.4, inbound: true, moving: false }], awaySeconds: 6,
  },
]

/** Interchanges: a capsule from one route's stop to another's. */
const CAPSULES: [Key, number, Key, number][] = [
  ['D', 0, 'B', 0],
  ['D', 1, 'B', 1],
  ['A', 2, 'B', 2],
  ['A', 3, 'B', 3],
  ['F', 0, 'C', 0],
  ['F', 1, 'C', 1],
  ['F', 2, 'C', 2],
]

const TRAIN_LENGTH = 15
const SPEED = 23
const DWELL_SECONDS = 3.6

interface Timetable {
  keyframes: string
  seconds: number
  places: number[]
  pauses: { from: number; to: number }[]
  runs: { from: number; to: number; ease: string }[]
}

/** How far along a run a train is after a share of its time: the CSS easing curve, solved by halving. */
function eased(ease: string, share: number): number {
  const x1 = ease === 'ease-out' ? 0 : 0.42
  const x2 = ease === 'ease-in' ? 1 : 0.58
  let low = 0
  let high = 1
  for (let step = 0; step < 30; step += 1) {
    const middle = (low + high) / 2
    const x = 3 * (1 - middle) * (1 - middle) * middle * x1 + 3 * (1 - middle) * middle * middle * x2 + middle * middle * middle
    if (x < share) low = middle
    else high = middle
  }
  const at = (low + high) / 2
  return 3 * (1 - at) * at * at + at * at * at
}

/** A train's run out and (played backwards) home again: away off the sheet, in to each stop, a pause, on to the end. */
function timetable(route: BuiltRoute): Timetable {
  const name = `run${route.spec.key}`
  const length = route.traced.length
  const lastPlace = route.spec.endsAtTerminus ? length - TRAIN_LENGTH / 2 - 7 : length + TRAIN_LENGTH
  const places = [0, ...route.stops.map(stop => stop.along), lastPlace]
  const frames: { at: number; place: number; ease: string }[] = [{ at: 0, place: 0, ease: '' }]
  const pauses: { from: number; to: number }[] = [{ from: 0, to: route.spec.awaySeconds }]
  const runs: { from: number; to: number; ease: string }[] = []
  let clock = route.spec.awaySeconds
  let ease = 'ease-out'
  frames.push({ at: clock, place: 0, ease })
  for (let index = 1; index < places.length; index += 1) {
    const here = places[index] ?? 0
    const before = places[index - 1] ?? 0
    const isLast = index === places.length - 1
    const left = clock
    clock += Math.max(3, (here - before) / SPEED)
    runs.push({ from: left, to: clock, ease })
    frames.push({ at: clock, place: here, ease: '' })
    const arrived = clock
    clock += isLast ? (route.spec.endsAtTerminus ? 8 : 5) : DWELL_SECONDS
    pauses.push({ from: arrived, to: clock })
    const leavesSheetNext = index === places.length - 2 && !route.spec.endsAtTerminus
    ease = leavesSheetNext ? 'ease-in' : 'ease-in-out'
    frames.push({ at: clock, place: here, ease: isLast ? '' : ease })
  }
  const steps = frames
    .map(frame => `${((frame.at / clock) * 100).toFixed(2)}%{stroke-dashoffset:${fmt(TRAIN_LENGTH / 2 - frame.place)}${frame.ease ? `;animation-timing-function:${frame.ease}` : ''}}`)
    .join('')
  return { keyframes: `@keyframes ${name}{${steps}}`, seconds: Math.round(clock * 10) / 10, places, pauses, runs }
}

/** A broken line's dashes and gaps, fixed by the seed, never regular: that is what keeps a water-line from reading as a kerb. */
function broken(seed: number, dashFrom: number, dashTo: number, gapFrom: number, gapTo: number): string {
  const parts: number[] = []
  for (let index = 0; index < 7; index += 1) {
    parts.push(Math.round(dashFrom + hash(seed + index * 2) * (dashTo - dashFrom)), Math.round(gapFrom + hash(seed + index * 2 + 1) * (gapTo - gapFrom)))
  }
  return parts.join(' ')
}

/** The river: a faint band between two fine bank lines, water-lined inside the way a chart is: broken lines that crowd
 * each bank, shorter and sparser toward the middle, which is left open. */
function river(legs: Leg[], from: Vec, to: Vec, stock: Stock, seed: number): string {
  const body = trace(from, legs, to, RIVER_RADIUS, [])
  let markup = `<path d="${body.d}" stroke="${stock.water}" stroke-width="${RIVER_HALF * 2}"/>`
  const inset = [0, 4, 8.6, 13.4]
  const opacity = [0.8, 0.6, 0.45, 0.34]
  const dashes = [[0, 0, 0, 0], [30, 78, 5, 11], [12, 36, 9, 24], [5, 15, 20, 52]]
  for (let line = 0; line < inset.length; line += 1) {
    for (const side of [-1, 1]) {
      const offset = side * (RIVER_HALF - (inset[line] ?? 0))
      const drawn = trace(from, shifted(legs, offset), to, RIVER_RADIUS, [])
      const range = dashes[line] ?? [0, 0, 0, 0]
      const dash = line === 0 ? '' : ` stroke-dasharray="${broken(seed + line * 40 + side * 7, range[0] ?? 0, range[1] ?? 0, range[2] ?? 0, range[3] ?? 0)}"`
      markup += `<path d="${drawn.d}" stroke="${stock.bank}" stroke-width="${line === 0 ? 1.1 : 0.9}" stroke-opacity="${opacity[line] ?? 1}"${dash}/>`
    }
  }
  return markup
}

/** A station's name, greeked: a fine dash beside it, its length fixed by the seed. An interchange gets two, like a name and what it connects. */
function nameDash(point: Vec, side: number, gap: number, seed: number, twoLines: boolean): string {
  const length = 12 + Math.round(hash(seed) * 15)
  const start = point.x + side * gap
  if (!twoLines) return `M${fmt(start)} ${fmt(point.y)}L${fmt(start + side * length)} ${fmt(point.y)}`
  const second = Math.round(length * (0.4 + hash(seed + 5) * 0.3))
  return `M${fmt(start)} ${fmt(point.y - 2.5)}L${fmt(start + side * (length + 4))} ${fmt(point.y - 2.5)}M${fmt(start)} ${fmt(point.y + 2.5)}L${fmt(start + side * second)} ${fmt(point.y + 2.5)}`
}

function metroSheet(stock: Stock): string {
  const routes = ROUTES.map(build)
  const byKey = (key: Key): BuiltRoute | undefined => routes.find(route => route.spec.key === key)

  let shapes = ''
  let lines = ''
  let bars = ''
  let trains = ''
  let rings = ''
  let names = ''
  let keyframes = ''
  let trainRules = ''

  routes.forEach((route, routeIndex) => {
    const key = route.spec.key
    const colour = mix(stock.paper, stock.routes[key], stock.lineStrength[key])
    const trainColour = mix(stock.paper, stock.routes[key], stock.trainStrength)
    shapes += `<path id="r${key}" pathLength="${route.traced.length}" d="${route.traced.d}"/>`
    lines += `<use href="#r${key}" stroke="${colour}"/>`
    if (route.spec.endsAtTerminus) {
      const across = normal(route.traced.endDir)
      bars += `<path d="M${pt(add(route.traced.end, across, -route.spec.barHalf))}L${pt(add(route.traced.end, across, route.spec.barHalf))}" stroke="${colour}"/>`
      if (route.spec.endName !== 0) names += nameDash(route.traced.end, route.spec.endName, route.spec.barHalf + 6, routeIndex * 31 + 29, false)
    }
    const table = timetable(route)
    keyframes += table.keyframes
    trainRules += `.t${key}{animation:run${key} ${table.seconds}s linear infinite alternate}`
    for (const train of route.spec.trains) {
      const here = table.places[train.stop] ?? 0
      const run = table.runs[train.stop]
      const pause = table.pauses[train.stop] ?? { from: 0, to: 0 }
      const span = train.moving && run ? run : pause
      const elapsed = span.from + (span.to - span.from) * train.share
      const place = train.moving && run ? here + ((table.places[train.stop + 1] ?? here) - here) * eased(run.ease, train.share) : here
      const delay = train.inbound ? table.seconds * 2 - elapsed : elapsed
      trains += `<use href="#r${key}" class="t${key}" stroke="${trainColour}" stroke-dasharray="${TRAIN_LENGTH} ${fmt(route.traced.length + 60)}" stroke-dashoffset="${fmt(TRAIN_LENGTH / 2 - place)}" style="animation-delay:${fmt(-delay)}s"/>`
    }
    route.spec.stops.forEach((stop, index) => {
      const place = route.stops[index]
      if (!place) return
      if (stop.ring) rings += `<circle cx="${fmt(place.point.x)}" cy="${fmt(place.point.y)}" r="3.5"/>`
      if (stop.name !== 0) names += nameDash(place.point, stop.name, stop.ring ? 9.5 : 13, routeIndex * 31 + index, !stop.ring)
    })
  })

  let capsules = ''
  for (const [firstKey, firstStop, secondKey, secondStop] of CAPSULES) {
    const first = byKey(firstKey)?.stops[firstStop]
    const second = byKey(secondKey)?.stops[secondStop]
    if (first && second) capsules += `M${pt(first.point)}L${pt(second.point)}`
  }

  // A walk between the plum line's station and the interchange beside it: a dotted link, as maps draw them.
  const walkFrom = byKey('D')?.stops[2]?.point
  const walkTo = byKey('A')?.stops[2]?.point
  const walk = walkFrom && walkTo ? `<path d="M${pt(add(walkFrom, EAST, 8))}L${pt(add(walkTo, EAST, -9))}" stroke="${stock.ink}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0.1 4.4" stroke-opacity="0.7"/>` : ''

  const style = `
path,use{fill:none}
.lines use,.bars path{stroke-width:6}
.trains use{stroke-width:6;stroke-linecap:round}
.rings circle{fill:${stock.ring};stroke:${stock.ink};stroke-width:1.3}
${trainRules}
${keyframes}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${shapes}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${stock.paper}"/>
<g>${river(EAST_RIVER, { x: 1436, y: 1040 }, { x: 1640, y: 800 }, stock, 300)}${river(WEST_RIVER, { x: -40, y: 792 }, { x: 350, y: 1040 }, stock, 500)}</g>
<g class="lines">${lines}</g>
<g class="bars">${bars}</g>
<g class="trains">${trains}</g>
${walk}
<path d="${names}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${stock.nameOpacity}"/>
<path d="${capsules}" stroke="${stock.ink}" stroke-width="11.6" stroke-linecap="round"/><path d="${capsules}" stroke="${stock.ring}" stroke-width="9" stroke-linecap="round"/>
<g class="rings">${rings}</g>
</svg>`
}

/** Metro Lines on warm paper, for a light window. */
export function daySvg(): string {
  return metroSheet(DAY)
}

/** Metro Lines on warm charcoal, for a dark window. */
export function nightSvg(): string {
  return metroSheet(NIGHT)
}
