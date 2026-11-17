// Metro Lines: a corner of the diagram of an imaginary city's metro, as a pen plotter might draw it.
// The lines are drawn the way such diagrams are: every one runs east-west, north-south or at 45 degrees, bends are arcs,
// and lines that share a corridor run as a tight bundle and take each bend about one common centre.
// Right band (the subject): a trunk of four lines climbs out of the lower corner, crosses the river on a diagonal,
// meets the embankment line at the big interchange, then opens like a hand: olive away east, plum to its terminus,
// ochre off the sheet, terracotta up to a turning loop round a small lake. Left band (the echo): a pair of lines crosses
// the same river and ends in two termini.
// Stations are small rings, interchanges are capsules across a bundle, a line that ends gets a bar, and every station
// has its name set beside it as a fine dash, because this city has none. Water is ruled in fine pen, the old engraver's way,
// and where the lines cross it they get a bridge: a clear deck and two flared parapets.
// Motion: small trains, each a dash on a copy of its line, run stop to stop, easing in and out of every station and
// standing a while at each; the glints in the ruled water drift slowly downstream.
// At rest the timetable is simply frozen. Two stocks: warm paper for a light window, warm charcoal for a dark one.
// Pure string building, the same string every call.

const WIDTH = 1600
const HEIGHT = 1000

/** Six colours, seven stretches of line: olive runs on both sides of the sheet (C in the west, G in the east). */
type Key = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

interface Stock {
  paper: string
  water: string
  ruling: string
  rulingOpacity: number
  ink: string
  labelOpacity: number
  marker: string
  markerEdge: string
  /** A train's body is its line's colour pushed this far toward `trainToward`; its window band is `trainWindow`. */
  trainToward: string
  trainShare: number
  trainWindow: string
  routes: Record<Key, string>
  /** How much of a route's colour its line keeps; the rest is paper, so the sheet stays a backdrop. */
  strength: Record<Key, number>
}

const DAY: Stock = {
  paper: '#f3eee3', water: '#ebe6d6', ruling: '#857f5e', rulingOpacity: 0.5, ink: '#352e27', labelOpacity: 0.46,
  marker: '#fffdf8', markerEdge: '#352e27', trainToward: '#2b1f17', trainShare: 0.42, trainWindow: '#fbf3e2',
  routes: { A: '#c4552d', B: '#c4962f', C: '#777a3a', D: '#7d4a63', E: '#4a4541', F: '#b0915c', G: '#777a3a' },
  strength: { A: 0.7, B: 0.66, C: 0.58, D: 0.58, E: 0.46, F: 0.66, G: 0.58 },
}
/** The same diagram on warm charcoal: pale warm inks, lit trains, nothing blue. */
const NIGHT: Stock = {
  paper: '#201a14', water: '#27211a', ruling: '#a89a70', rulingOpacity: 0.34, ink: '#d8ccb6', labelOpacity: 0.42,
  marker: '#d9cdb2', markerEdge: '#15100b', trainToward: '#fff0cf', trainShare: 0.3, trainWindow: '#fff3cf',
  routes: { A: '#e07a50', B: '#d8aa52', C: '#a3a058', D: '#b06a66', E: '#a89e8e', F: '#c9b58c', G: '#a3a058' },
  strength: { A: 0.66, B: 0.62, C: 0.6, D: 0.6, E: 0.44, F: 0.5, G: 0.6 },
}

interface Vec {
  x: number
  y: number
}

const DIAGONAL = Math.SQRT1_2
const NORTH: Vec = { x: 0, y: -1 }
const SOUTH: Vec = { x: 0, y: 1 }
const EAST: Vec = { x: 1, y: 0 }
const NORTH_EAST: Vec = { x: DIAGONAL, y: -DIAGONAL }
const NORTH_WEST: Vec = { x: -DIAGONAL, y: -DIAGONAL }
const SOUTH_EAST: Vec = { x: DIAGONAL, y: DIAGONAL }
const SOUTH_WEST: Vec = { x: -DIAGONAL, y: DIAGONAL }

/** One straight stretch of a route: its corridor's centre line (a point and a compass direction) and how far to the right of it the route runs. */
interface Leg {
  at: Vec
  dir: Vec
  offset: number
}

interface Span {
  from: Vec
  dir: Vec
  startLength: number
}

interface Traced {
  d: string
  length: number
  lines: { p: Vec; u: Vec }[]
  spans: Span[]
  /** Points along the path a few pixels apart, for ruling a band about it. */
  points: Vec[]
  end: Vec
  endDir: Vec
}

/** A station on a route. ring: drawn as a ring on this route alone (false: it lies under a capsule, or is the same stop met again on the way back).
 * label: where its name goes (-1 west, 1 east, 2 above, 0 none); gap: how far from the line the name starts, 0 for the usual. */
interface StopSpec {
  leg: number
  ref: Vec
  ring: boolean
  label: number
  gap: number
}

interface RouteSpec {
  key: Key
  from: Vec
  legs: Leg[]
  to: Vec
  radius: number
  radii: number[]
  stops: StopSpec[]
  /** through: the path itself comes back (a turning loop), so a train only ever runs forward. Otherwise it runs out and back. */
  through: boolean
  /** The far end is a terminus on the sheet (a bar across the line) and not the edge of the sheet. */
  terminus: boolean
  endLabel: number
  awaySeconds: number
  /** Each train's place in the timetable at the first frame, which is also where it stands at rest: which run it is on
   * (0 is the run in from the edge to the first stop) and how far through it (1: just arrived). */
  trains: [number, number][]
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

function sampleLine(points: Vec[], from: Vec, to: Vec): void {
  const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 3))
  for (let step = 0; step <= steps; step += 1) points.push({ x: from.x + ((to.x - from.x) * step) / steps, y: from.y + ((to.y - from.y) * step) / steps })
}

/**
 * A route as one path: straight legs joined by circular bends. A bend's radius is the corridor's radius less the route's
 * offset toward the inside of the turn, so every line of a bundle turns about the same centre.
 */
function trace(from: Vec, legs: Leg[], to: Vec, radius: number, radii: number[]): Traced {
  const lines = legs.map(leg => ({ p: add(leg.at, normal(leg.dir), leg.offset), u: leg.dir }))
  const count = lines.length
  const corners: Vec[] = []
  for (let index = 0; index <= count; index += 1) {
    const before = lines[index - 1]
    const after = lines[index]
    if (!before && after) corners.push(project(from, after))
    else if (before && !after) corners.push(project(to, before))
    else if (before && after) corners.push(meet(before, after))
  }
  let cursor = corners[0] ?? from
  let d = `M${pt(cursor)}`
  let length = 0
  const spans: Span[] = []
  const points: Vec[] = []
  for (let index = 0; index < count; index += 1) {
    const line = lines[index]
    const next = lines[index + 1]
    const corner = corners[index + 1]
    const leg = legs[index]
    const nextLeg = legs[index + 1]
    if (!line || !corner || !leg) continue
    spans.push({ from: cursor, dir: line.u, startLength: length })
    if (!next || !nextLeg) {
      length += Math.hypot(corner.x - cursor.x, corner.y - cursor.y)
      d += `L${pt(corner)}`
      sampleLine(points, cursor, corner)
      cursor = corner
      continue
    }
    const side = Math.sign(cross(line.u, next.u))
    const turn = Math.acos(Math.max(-1, Math.min(1, dot(line.u, next.u))))
    const shared = leg.offset === nextLeg.offset ? leg.offset : 0
    const bend = Math.max(5, (radii[index] ?? radius) - side * shared)
    const tangent = bend * Math.tan(turn / 2)
    const enter = add(corner, line.u, -tangent)
    const leave = add(corner, next.u, tangent)
    length += Math.hypot(enter.x - cursor.x, enter.y - cursor.y) + bend * turn
    d += `L${pt(enter)}A${fmt(bend)} ${fmt(bend)} 0 0 ${side > 0 ? 1 : 0} ${pt(leave)}`
    sampleLine(points, cursor, enter)
    // The bend itself, about its centre, which lies to the side the route turns toward.
    const centre = add(enter, normal(line.u), side * bend)
    const steps = Math.max(2, Math.ceil((bend * turn) / 3))
    for (let step = 1; step <= steps; step += 1) {
      const angle = (side * turn * step) / steps
      const armX = enter.x - centre.x
      const armY = enter.y - centre.y
      points.push({ x: centre.x + armX * Math.cos(angle) - armY * Math.sin(angle), y: centre.y + armX * Math.sin(angle) + armY * Math.cos(angle) })
    }
    cursor = leave
  }
  const last = lines[count - 1]
  return { d, length: Math.round(length * 10) / 10, lines, spans, points, end: cursor, endDir: last ? last.u : EAST }
}

function build(spec: RouteSpec): BuiltRoute {
  const traced = trace(spec.from, spec.legs, spec.to, spec.radius, spec.radii)
  const stops: Stop[] = []
  for (const place of spec.stops) {
    const line = traced.lines[place.leg]
    const span = traced.spans[place.leg]
    if (!line || !span) continue
    const point = project(place.ref, line)
    stops.push({ point, along: span.startLength + dot({ x: point.x - span.from.x, y: point.y - span.from.y }, span.dir) })
  }
  return { spec, traced, stops }
}

function shifted(legs: Leg[], offset: number): Leg[] {
  return legs.map(leg => ({ at: leg.at, dir: leg.dir, offset }))
}

function stop(leg: number, ref: Vec, ring: boolean, label: number, gap = 0): StopSpec {
  return { leg, ref, ring, label, gap }
}

// ---- The diagram ----

/** Centre to centre of two lines in a bundle; a line is 6 wide, so a hair of paper shows between them. */
const PITCH = 9
const LINE_WIDTH = 6

// The east river: in from the right edge on a diagonal, then south off the sheet, well clear of the prompt box.
// The embankment line keeps to its outer bank.
const RIVER_HALF = 26
const RIVER_RADIUS = 70
const BANK_GAP = 44
const EAST_RIVER: Leg[] = [
  { at: { x: 1640, y: 736 }, dir: SOUTH_WEST, offset: 0 },
  { at: { x: 1480, y: 896 }, dir: SOUTH, offset: 0 },
]
const EAST_RIVER_FROM: Vec = { x: 1680, y: 696 }
const EAST_RIVER_TO: Vec = { x: 1480, y: 1060 }

// The west river, its mirror: out from under the sidebar on a diagonal, then south.
const WEST_RIVER: Leg[] = [
  { at: { x: -40, y: 490 }, dir: SOUTH_EAST, offset: 0 },
  { at: { x: 366, y: 896 }, dir: SOUTH, offset: 0 },
]
const WEST_RIVER_FROM: Vec = { x: -80, y: 450 }
const WEST_RIVER_TO: Vec = { x: 366, y: 1060 }

// The trunk: four lines north out of the lower right corner, a jog north-west across the river, north again.
// West to east: plum, terracotta, ochre, olive.
const TRUNK_RADIUS = 34
const TRUNK_FOOT: Vec = { x: 1572, y: 1040 }
const TRUNK_JOG: Vec = { x: 1572, y: 884 }
const TRUNK_NORTH: Vec = { x: 1460, y: 772 }
const PLUM_TRACK = -1.5 * PITCH
const TERRACOTTA_TRACK = -0.5 * PITCH
const OCHRE_TRACK = 0.5 * PITCH
const OLIVE_TRACK = 1.5 * PITCH
/** Where terracotta and ochre turn north-east together, and where terracotta turns north again, alone. */
const FORK: Vec = { x: 1460, y: 580 }
const FORK_RADIUS = 28
const STEM: Vec = { x: 1508, y: 532 }
/** Terracotta's turning loop: a tall hexagon standing on the stem. */
const LOOP_FOOT: Vec = { x: 1508, y: 384 }
const LOOP_HALF = 28
const LOOP_TOP = 270
const LOOP_RADIUS = 12
const LAKE_INSET = 11
/** Olive leaves the trunk eastward here, the one level line on the sheet. */
const EAST_BRANCH_Y = 652

function trunk(offset: number): Leg[] {
  return [
    { at: TRUNK_FOOT, dir: NORTH, offset },
    { at: TRUNK_JOG, dir: NORTH_WEST, offset },
    { at: TRUNK_NORTH, dir: NORTH, offset },
  ]
}

/** The big interchange: where the trunk's diagonal meets the embankment line. */
const HUB: Vec = meet({ p: TRUNK_JOG, u: NORTH_WEST }, { p: add({ x: 1640, y: 736 }, normal(SOUTH_WEST), BANK_GAP), u: SOUTH_WEST })
/** Where the trunk and the west pair cross their rivers. */
const EAST_BRIDGE: Vec = meet({ p: TRUNK_JOG, u: NORTH_WEST }, { p: { x: 1640, y: 736 }, u: SOUTH_WEST })
const WEST_BRIDGE: Vec = meet({ p: { x: 262, y: 870 }, u: NORTH_EAST }, { p: { x: -40, y: 490 }, u: SOUTH_EAST })
const FOOT_STOP: Vec = { x: 1572, y: 936 }
const LOWER_STOP: Vec = { x: 1460, y: 714 }
const UPPER_STOP: Vec = { x: 1460, y: 624 }
const FORK_STOP: Vec = { x: 1484, y: 556 }
const STEM_STOP: Vec = { x: 1508, y: 456 }
const LOOP_STOP_Y = 327

// The west pair: north out of the bottom edge, a jog north-east across the river, north again.
const WEST_RADIUS = 28
const WEST_FOOT: Vec = { x: 262, y: 1040 }
const WEST_JOG: Vec = { x: 262, y: 870 }
const WEST_NORTH: Vec = { x: 340, y: 792 }
const WEST_PAIR: Leg[] = [
  { at: WEST_FOOT, dir: NORTH, offset: 0 },
  { at: WEST_JOG, dir: NORTH_EAST, offset: 0 },
  { at: WEST_NORTH, dir: NORTH, offset: 0 },
]
const WEST_FOOT_STOP: Vec = { x: 262, y: 936 }
const WEST_NORTH_STOP: Vec = { x: 340, y: 742 }

const ROUTES: RouteSpec[] = [
  // E, graphite: the embankment line, along the river's outer bank from the right edge to the bottom edge.
  {
    key: 'E', from: { x: 1640, y: 688 }, legs: shifted(EAST_RIVER, BANK_GAP), to: { x: 1436, y: 1040 }, radius: RIVER_RADIUS, radii: [],
    stops: [stop(0, { x: 1572, y: 742 }, true, -1), stop(0, HUB, false, 0)],
    through: false, terminus: false, endLabel: 0, awaySeconds: 14, trains: [[2, 0.5]],
  },
  // F, sand: the east line of the west pair; it carries on north to its terminus.
  {
    key: 'F', from: WEST_FOOT, legs: shifted(WEST_PAIR, PITCH / 2), to: { x: 344.5, y: 604 }, radius: WEST_RADIUS, radii: [],
    stops: [stop(0, WEST_FOOT_STOP, false, 1), stop(2, WEST_NORTH_STOP, false, 1), stop(2, { x: 344.5, y: 668 }, true, 1)],
    through: false, terminus: true, endLabel: 1, awaySeconds: 20, trains: [[3, 1]],
  },
  // C, olive in the west: the west line of the pair; it peels off north-west to a terminus of its own.
  {
    key: 'C', from: WEST_FOOT, legs: [...shifted(WEST_PAIR, -PITCH / 2), { at: { x: 335.5, y: 700 }, dir: NORTH_WEST, offset: 0 }, { at: { x: 270, y: 634.5 }, dir: NORTH, offset: 0 }],
    to: { x: 270, y: 534 }, radius: WEST_RADIUS, radii: [WEST_RADIUS, WEST_RADIUS, 22, 22],
    stops: [stop(0, WEST_FOOT_STOP, false, 0), stop(2, WEST_NORTH_STOP, false, 0), stop(3, { x: 303, y: 667.5 }, true, -1), stop(4, { x: 270, y: 590 }, true, -1)],
    through: false, terminus: true, endLabel: -1, awaySeconds: 10, trains: [[1, 0.52]],
  },
  // G, olive in the east: the trunk's east line; it turns east out of the bundle and leaves by the right edge.
  {
    key: 'G', from: TRUNK_FOOT, legs: [...trunk(OLIVE_TRACK), { at: { x: 1540, y: EAST_BRANCH_Y }, dir: EAST, offset: 0 }], to: { x: 1640, y: EAST_BRANCH_Y },
    radius: TRUNK_RADIUS, radii: [TRUNK_RADIUS, TRUNK_RADIUS, 22],
    stops: [stop(0, FOOT_STOP, false, 0), stop(1, HUB, false, 0), stop(2, LOWER_STOP, false, 1), stop(3, { x: 1546, y: EAST_BRANCH_Y }, true, 2)],
    through: false, terminus: false, endLabel: 0, awaySeconds: 18, trains: [[3, 0.3]],
  },
  // B, ochre: north-east with terracotta, then on alone off the right edge.
  {
    key: 'B', from: TRUNK_FOOT, legs: [...trunk(OCHRE_TRACK), { at: FORK, dir: NORTH_EAST, offset: OCHRE_TRACK }], to: { x: 1640, y: 412 },
    radius: TRUNK_RADIUS, radii: [TRUNK_RADIUS, TRUNK_RADIUS, FORK_RADIUS],
    stops: [
      stop(0, FOOT_STOP, false, 0), stop(1, HUB, false, 0), stop(2, LOWER_STOP, false, 0), stop(2, UPPER_STOP, false, 1),
      stop(3, FORK_STOP, false, 1), stop(3, { x: 1556, y: 490 }, true, 0),
    ],
    through: false, terminus: false, endLabel: 0, awaySeconds: 12, trains: [[5, 0.4]],
  },
  // D, plum: the trunk's west line; it peels off north-west and ends a short walk from the others.
  {
    key: 'D', from: TRUNK_FOOT, legs: [...trunk(PLUM_TRACK), { at: { x: 1460 + PLUM_TRACK, y: 676 }, dir: NORTH_WEST, offset: 0 }, { at: { x: 1364, y: 600 }, dir: NORTH, offset: 0 }],
    to: { x: 1364, y: 462 }, radius: TRUNK_RADIUS, radii: [TRUNK_RADIUS, TRUNK_RADIUS, 24, 24],
    stops: [
      stop(0, FOOT_STOP, false, -1), stop(1, HUB, false, -1), stop(2, LOWER_STOP, false, 0),
      stop(3, { x: 1460 + PLUM_TRACK - 52, y: 624 }, true, -1), stop(4, { x: 1364, y: 528 }, true, -1),
    ],
    through: false, terminus: true, endLabel: -1, awaySeconds: 16, trains: [[4, 0.32]],
  },
  // A, terracotta: the hero. Up the trunk, north-east with ochre, north alone, round its turning loop and all the way back.
  {
    key: 'A', from: TRUNK_FOOT,
    legs: [
      ...trunk(TERRACOTTA_TRACK), { at: FORK, dir: NORTH_EAST, offset: TERRACOTTA_TRACK }, { at: STEM, dir: NORTH, offset: 0 },
      { at: LOOP_FOOT, dir: NORTH_EAST, offset: 0 }, { at: { x: LOOP_FOOT.x + LOOP_HALF, y: LOOP_FOOT.y - LOOP_HALF }, dir: NORTH, offset: 0 },
      { at: { x: LOOP_FOOT.x, y: LOOP_TOP }, dir: NORTH_WEST, offset: 0 }, { at: { x: LOOP_FOOT.x, y: LOOP_TOP }, dir: SOUTH_WEST, offset: 0 },
      { at: { x: LOOP_FOOT.x - LOOP_HALF, y: LOOP_FOOT.y - LOOP_HALF }, dir: SOUTH, offset: 0 }, { at: LOOP_FOOT, dir: SOUTH_EAST, offset: 0 },
      // Home again down the same track: the legs turned about, so "right of the corridor" changes sign.
      { at: STEM, dir: SOUTH, offset: 0 }, { at: FORK, dir: SOUTH_WEST, offset: -TERRACOTTA_TRACK }, { at: TRUNK_NORTH, dir: SOUTH, offset: -TERRACOTTA_TRACK },
      { at: TRUNK_JOG, dir: SOUTH_EAST, offset: -TERRACOTTA_TRACK }, { at: TRUNK_FOOT, dir: SOUTH, offset: -TERRACOTTA_TRACK },
    ],
    to: TRUNK_FOOT, radius: TRUNK_RADIUS,
    radii: [TRUNK_RADIUS, TRUNK_RADIUS, FORK_RADIUS, 24, LOOP_RADIUS, LOOP_RADIUS, LOOP_RADIUS, LOOP_RADIUS, LOOP_RADIUS, LOOP_RADIUS, LOOP_RADIUS, 24, FORK_RADIUS, TRUNK_RADIUS, TRUNK_RADIUS],
    stops: [
      stop(0, FOOT_STOP, false, 0), stop(1, HUB, false, 0), stop(2, LOWER_STOP, false, 0), stop(2, UPPER_STOP, false, 0),
      stop(3, FORK_STOP, false, 0), stop(4, STEM_STOP, true, 1),
      stop(6, { x: LOOP_FOOT.x + LOOP_HALF, y: LOOP_STOP_Y }, true, 1), stop(9, { x: LOOP_FOOT.x - LOOP_HALF, y: LOOP_STOP_Y }, true, -1),
      stop(11, STEM_STOP, false, 0), stop(12, FORK_STOP, false, 0), stop(13, UPPER_STOP, false, 0), stop(13, LOWER_STOP, false, 0),
      stop(14, HUB, false, 0), stop(15, FOOT_STOP, false, 0),
    ],
    through: true, terminus: false, endLabel: 0, awaySeconds: 10, trains: [[1, 0.56], [7, 0.36], [10, 0.45]],
  },
]

/** Interchanges: a capsule from one route's stop to another's. */
const CAPSULES: [Key, number, Key, number][] = [
  ['D', 0, 'G', 0],
  ['D', 1, 'G', 1],
  ['D', 2, 'G', 2],
  ['A', 3, 'B', 3],
  ['A', 4, 'B', 4],
  ['C', 0, 'F', 0],
  ['C', 1, 'F', 1],
]

// ---- Trains ----

/** A train is a dash with round ends: this much dash, and half the body's width again at each end. */
const TRAIN_DASH = 11
const TRAIN_WIDTH = 7.4
const TRAIN_REACH = TRAIN_DASH / 2 + TRAIN_WIDTH / 2
/** Two windows along the body: inset, pane, pillar, pane. */
const WINDOWS = [1.4, 3.4, 1.4, 3.4]
/** Pixels a second, averaged over a run between two stops. */
const SPEED = 16
const DWELL_SECONDS = 5

interface Segment {
  from: number
  to: number
  placeFrom: number
  placeTo: number
  ease: string
}

interface Timetable {
  keyframes: string
  seconds: number
  segments: Segment[]
}

/** A train's cycle: away off the sheet, then stop to stop to the far end, and (unless the line comes back by itself) home again the same way. */
function timetable(route: BuiltRoute): Timetable {
  const length = route.traced.length
  const away = -TRAIN_REACH - 4
  const alongs = route.stops.map(place => place.along)
  const farEnd = route.spec.terminus ? length - TRAIN_REACH - 7 : length + TRAIN_REACH + 4
  const places = route.spec.through ? [away, ...alongs, farEnd] : [away, ...alongs, farEnd, ...alongs.slice().reverse(), away]
  const farIndex = alongs.length + 1
  const lastIndex = places.length - 1
  const segments: Segment[] = []
  let clock = 0
  for (let index = 0; index <= lastIndex; index += 1) {
    const here = places[index] ?? 0
    const next = places[index + 1]
    const offSheet = index === 0 || (index === farIndex && !route.spec.terminus)
    // A wait: away off the sheet, turning round at a terminus, or standing at a platform.
    if (index < lastIndex || route.spec.through) {
      const wait = index === 0 ? route.spec.awaySeconds : index === farIndex ? 9 : DWELL_SECONDS
      segments.push({ from: clock, to: clock + wait, placeFrom: here, placeTo: here, ease: 'linear' })
      clock += wait
    }
    if (next === undefined) continue
    const nextOffSheet = index + 1 === lastIndex || (index + 1 === farIndex && !route.spec.terminus)
    const run = Math.max(3, Math.abs(next - here) / SPEED)
    // In from the edge already at speed, away over the edge still gathering it; between platforms, both.
    const ease = offSheet ? 'ease-out' : nextOffSheet ? 'ease-in' : 'ease-in-out'
    segments.push({ from: clock, to: clock + run, placeFrom: here, placeTo: next, ease })
    clock += run
  }
  let steps = ''
  for (const segment of segments) {
    steps += `${((segment.from / clock) * 100).toFixed(2)}%{stroke-dashoffset:${fmt(TRAIN_DASH / 2 - segment.placeFrom)};animation-timing-function:${segment.ease}}`
  }
  const lastSegment = segments[segments.length - 1]
  steps += `100%{stroke-dashoffset:${fmt(TRAIN_DASH / 2 - (lastSegment ? lastSegment.placeTo : away))}}`
  return { keyframes: `@keyframes run${route.spec.key}{${steps}}`, seconds: Math.round(clock * 10) / 10, segments }
}

/** How far through a run a train is after a share of its time: the CSS easing curve, solved by halving. */
function eased(ease: string, share: number): number {
  if (ease === 'linear') return share
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

/** Where along its line a train's middle is, `seconds` into the cycle. */
function placeAt(table: Timetable, seconds: number): number {
  for (const segment of table.segments) {
    if (seconds <= segment.to) {
      const share = segment.to > segment.from ? (seconds - segment.from) / (segment.to - segment.from) : 0
      return segment.placeFrom + (segment.placeTo - segment.placeFrom) * eased(segment.ease, Math.max(0, share))
    }
  }
  return -TRAIN_REACH - 4
}

// ---- Water ----

const RULING_GAP = 6
/** How a ruled row is broken: pen down, a glint, pen down, a glint (pixels), and how fast the glints drift along it (pixels a second). */
const GLINTS: { dashes: number[]; speed: number }[] = [
  { dashes: [171, 7, 96, 6], speed: 3.6 },
  { dashes: [127, 8, 182, 6], speed: 4.4 },
  { dashes: [148, 6, 108, 8], speed: 3.1 },
  { dashes: [194, 7, 83, 5], speed: 4 },
  { dashes: [104, 6, 139, 8], speed: 3.4 },
]

function glintPeriod(index: number): number {
  return (GLINTS[index]?.dashes ?? []).reduce((sum, part) => sum + part, 0)
}

/** One ruled row of water from `from` to `to` at height y: a pen line, each end a hair short of the bank, broken by glints
 * that drift along it. Every row has its own place in the drift, which is also where its glints lie at rest.
 * `downstream` is +1 when the water runs toward the row's start (west), -1 when it runs east. */
function ruled(from: number, to: number, y: number, seed: number, downstream: number): string {
  const start = Math.max(-12, from + 0.5 + hash(seed) * 2.2)
  const end = Math.min(WIDTH + 12, to - 0.5 - hash(seed + 1) * 2.2)
  if (end - start < 7) return ''
  const kind = Math.floor(hash(seed + 2) * GLINTS.length)
  const period = glintPeriod(kind)
  const seconds = period / (GLINTS[kind]?.speed ?? 4)
  const share = hash(seed + 3)
  const rest = Math.round(period * (downstream > 0 ? share : 1 - share))
  return `<path class="g${kind}${downstream > 0 ? '' : ' east'}" d="M${fmt(start)} ${y}H${fmt(end)}" stroke-dashoffset="${rest}" style="animation-delay:${fmt(-share * seconds)}s"/>`
}

/** Horizontal ruling inside the band `half` either side of a traced centre line, the old engraver's sign for water. */
function ruleBand(points: Vec[], half: number, seed: number, downstream: number): string {
  let rows = ''
  let top = HEIGHT
  let bottom = 0
  for (const point of points) {
    top = Math.min(top, point.y - half)
    bottom = Math.max(bottom, point.y + half)
  }
  const first = Math.max(0, Math.ceil(top / RULING_GAP))
  const last = Math.min(Math.floor(HEIGHT / RULING_GAP), Math.floor(bottom / RULING_GAP))
  for (let row = first; row <= last; row += 1) {
    const y = row * RULING_GAP + 2
    // The band at this height is the union of the chords of the discs about each sampled point.
    const chords: [number, number][] = []
    for (const point of points) {
      const rise = y - point.y
      if (Math.abs(rise) >= half) continue
      const reach = Math.sqrt(half * half - rise * rise)
      chords.push([point.x - reach, point.x + reach])
    }
    chords.sort((a, b) => a[0] - b[0])
    let open: [number, number] | null = null
    let piece = 0
    for (const chord of chords) {
      if (open && chord[0] <= open[1] + 0.5) {
        open[1] = Math.max(open[1], chord[1])
        continue
      }
      if (open) rows += ruled(open[0], open[1], y, seed + row * 13 + piece * 101, downstream)
      piece += 1
      open = [chord[0], chord[1]]
    }
    if (open) rows += ruled(open[0], open[1], y, seed + row * 13 + piece * 101, downstream)
  }
  return rows
}

/** The lake inside the turning loop: the loop's own hexagon, drawn in by LAKE_INSET, ruled like the river. */
function ruleLake(seed: number): string {
  let rows = ''
  const top = LOOP_TOP + LAKE_INSET * Math.SQRT2
  const bottom = LOOP_FOOT.y - LAKE_INSET * Math.SQRT2
  const half = LOOP_HALF - LAKE_INSET
  for (let row = Math.ceil(top / RULING_GAP); row * RULING_GAP + 2 < bottom; row += 1) {
    const y = row * RULING_GAP + 2
    const reach = Math.min(half, y - top, bottom - y)
    if (reach >= 3.5) rows += ruled(LOOP_FOOT.x - reach - 1.5, LOOP_FOOT.x + reach + 1.5, y, seed + row * 13, row % 2 === 0 ? 1 : -1)
  }
  return rows
}

/** A bridge, the engraver's way: a clear deck under the lines and a fine parapet either side of them, flared at both ends.
 * `along` is the way the lines run, `halfWidth` how far the outermost line's edge lies from the middle of the bundle. */
function bridge(at: Vec, along: Vec, halfWidth: number): { deck: string; parapets: string } {
  const reach = RIVER_HALF + 4.5
  const across = normal(along)
  const deck = `M${pt(add(at, along, -reach))}L${pt(add(at, along, reach))}`
  let parapets = ''
  for (const side of [-1, 1]) {
    const from = add(add(at, across, side * (halfWidth + 3.4)), along, -reach)
    const to = add(add(at, across, side * (halfWidth + 3.4)), along, reach)
    const flareFrom = add(add(from, along, -3.6), across, side * 3.6)
    const flareTo = add(add(to, along, 3.6), across, side * 3.6)
    parapets += `M${pt(flareFrom)}L${pt(from)}L${pt(to)}L${pt(flareTo)}`
  }
  return { deck, parapets }
}

/** A station's name, greeked: a fine dash beside it (or, for side 2, above it), its length fixed by the seed.
 * An interchange gets two, a name and what it connects. */
function nameDash(point: Vec, side: number, gap: number, seed: number, twoLines: boolean): string {
  const length = 13 + Math.round(hash(seed) * 16)
  if (side === 2) return `M${fmt(point.x - length / 2)} ${fmt(point.y - gap)}H${fmt(point.x + length / 2)}`
  const start = point.x + side * gap
  if (!twoLines) return `M${fmt(start)} ${fmt(point.y)}H${fmt(start + side * length)}`
  const second = Math.round(length * (0.4 + hash(seed + 5) * 0.3))
  return `M${fmt(start)} ${fmt(point.y - 2.5)}H${fmt(start + side * (length + 5))}M${fmt(start)} ${fmt(point.y + 2.5)}H${fmt(start + side * second)}`
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
    const colour = mix(stock.paper, stock.routes[key], stock.strength[key])
    const body = mix(stock.routes[key], stock.trainToward, stock.trainShare)
    shapes += `<path id="r${key}" pathLength="${route.traced.length}" d="${route.traced.d}"/>`
    lines += `<use href="#r${key}" stroke="${colour}"/>`
    if (route.spec.terminus) {
      const across = normal(route.traced.endDir)
      bars += `<path d="M${pt(add(route.traced.end, across, -8.5))}L${pt(add(route.traced.end, across, 8.5))}" stroke="${colour}"/>`
      if (route.spec.endLabel !== 0) names += nameDash(route.traced.end, route.spec.endLabel, 15, routeIndex * 31 + 29, false)
    }
    const table = timetable(route)
    keyframes += table.keyframes
    trainRules += `.t${key}{animation:run${key} ${table.seconds}s linear infinite}`
    const beyond = fmt(route.traced.length + 200)
    const runs = table.segments.filter(segment => segment.placeFrom !== segment.placeTo)
    for (const [run, share] of route.spec.trains) {
      const segment = runs[run]
      if (!segment) continue
      const seconds = segment.from + (segment.to - segment.from) * share
      const rest = `stroke-dashoffset="${fmt(TRAIN_DASH / 2 - placeAt(table, seconds))}" style="animation-delay:${fmt(-seconds)}s"`
      trains +=
        `<use href="#r${key}" class="t${key} body" stroke="${body}" stroke-dasharray="${TRAIN_DASH} ${beyond}" ${rest}/>` +
        `<use href="#r${key}" class="t${key} glass" stroke-dasharray="0 ${WINDOWS.join(' ')} ${beyond}" ${rest}/>`
    }
    route.spec.stops.forEach((spec, index) => {
      const place = route.stops[index]
      if (!place) return
      if (spec.ring) rings += `<circle cx="${fmt(place.point.x)}" cy="${fmt(place.point.y)}" r="3.6"/>`
      if (spec.label !== 0) names += nameDash(place.point, spec.label, spec.gap > 0 ? spec.gap : spec.ring ? 10 : 14, routeIndex * 31 + index, !spec.ring)
    })
  })

  let capsules = ''
  for (const [firstKey, firstStop, secondKey, secondStop] of CAPSULES) {
    const first = byKey(firstKey)?.stops[firstStop]
    const second = byKey(secondKey)?.stops[secondStop]
    if (first && second) capsules += `M${pt(first.point)}L${pt(second.point)}`
  }

  // A walk between the plum line's station and the interchange beside it: a dotted link, as diagrams draw them.
  const walkFrom = byKey('D')?.stops[3]?.point
  const walkTo = byKey('A')?.stops[3]?.point
  const walk = walkFrom && walkTo ? `<path d="M${pt(add(walkFrom, EAST, 8.5))}L${pt(add(walkTo, EAST, -9.5))}" stroke="${stock.ink}" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0.1 4.5" stroke-opacity="0.62"/>` : ''

  // Water: a faint band under each river, then the ruling, every row of it with glints adrift downstream.
  const eastRiver = trace(EAST_RIVER_FROM, EAST_RIVER, EAST_RIVER_TO, RIVER_RADIUS, [])
  const westRiver = trace(WEST_RIVER_FROM, WEST_RIVER, WEST_RIVER_TO, RIVER_RADIUS, [])
  const water =
    `<path d="${eastRiver.d}" stroke="${stock.water}" stroke-width="${RIVER_HALF * 2}"/><path d="${westRiver.d}" stroke="${stock.water}" stroke-width="${RIVER_HALF * 2}"/>` +
    `<g stroke="${stock.ruling}" stroke-width="0.9" stroke-opacity="${stock.rulingOpacity}">` +
    ruleBand(eastRiver.points, RIVER_HALF - 1, 300, 1) + ruleBand(westRiver.points, RIVER_HALF - 1, 700, -1) + ruleLake(911) +
    `</g>`
  const glintRules = GLINTS.map((glint, index) => {
    const period = glintPeriod(index)
    return `.g${index}{stroke-dasharray:${glint.dashes.join(' ')};animation:g${index} ${fmt(period / glint.speed)}s linear infinite}@keyframes g${index}{from{stroke-dashoffset:0}to{stroke-dashoffset:${period}}}`
  }).join('')

  const eastBridge = bridge(EAST_BRIDGE, NORTH_WEST, PITCH * 1.5 + LINE_WIDTH / 2)
  const westBridge = bridge(WEST_BRIDGE, NORTH_EAST, PITCH / 2 + LINE_WIDTH / 2)
  const decks =
    `<path d="${eastBridge.deck}" stroke="${stock.paper}" stroke-width="${(PITCH * 1.5 + LINE_WIDTH / 2 + 3.4) * 2}"/>` +
    `<path d="${westBridge.deck}" stroke="${stock.paper}" stroke-width="${(PITCH / 2 + LINE_WIDTH / 2 + 3.4) * 2}"/>`
  const parapets = `<path d="${eastBridge.parapets}${westBridge.parapets}" stroke="${stock.ink}" stroke-width="1.1" stroke-opacity="0.62" stroke-linejoin="round" stroke-linecap="round"/>`

  const style = `
path,use{fill:none}
.lines use,.bars path{stroke-width:${LINE_WIDTH}}
.body{stroke-width:${TRAIN_WIDTH};stroke-linecap:round}
.glass{stroke:${stock.trainWindow};stroke-width:2}
.rings circle{fill:${stock.marker};stroke:${stock.markerEdge};stroke-width:1.3}
${glintRules}.east{animation-direction:reverse}
${trainRules}
${keyframes}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${shapes}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${stock.paper}"/>
${water}
${decks}
<g class="lines">${lines}</g>
<g class="bars">${bars}</g>
${parapets}
${walk}
<path d="${names}" stroke="${stock.ink}" stroke-width="1" stroke-opacity="${stock.labelOpacity}"/>
<path d="${capsules}" stroke="${stock.markerEdge}" stroke-width="11.4" stroke-linecap="round"/><path d="${capsules}" stroke="${stock.marker}" stroke-width="8.8" stroke-linecap="round"/>
<g class="rings">${rings}</g>
<g>${trains}</g>
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
