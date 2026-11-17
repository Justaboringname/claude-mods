// Strategy Sheet: a coach's drafting sheet for a robotics match, drawn with two pens.
// Right band: one end of a generic field seen from above, at 68 units to the metre. The end wall carries a metre scale, a goal
// stands at its middle with range rings struck from it, and the lower corner is cut off by a hatched loading station.
// An autonomous run is planned across it as a spline through waypoint rings; a rust pen drives the run again and again,
// slower through the bends, the way a real drivetrain would, and each waypoint is dotted as the pen reaches it.
// A small swerve-drive robot, 8810, waits at the start; a dashed ghost of it stands where the run ends.
// Above the field a heading dial turns its needle to wherever the robot is facing on the run.
// Left band: the same robot seen from the side. A family of ballistic arcs from its shooter into one goal, one per launch angle;
// a ball flies each arc in turn, quick off the wheel and slow over the top.
// The reading column between them is left as bare paper. Two stocks: warm paper for a light window, kraft for a dark one.
// Pure string building, no imports, the same string on every call.

const WIDTH = 1600
const HEIGHT = 1000

interface Stock {
  paper: string
  wash: string
  ink: string
  rust: string
}

const DAY: Stock = { paper: '#f3eee3', wash: '#e8d6bd', ink: '#1f2a48', rust: '#c4552d' }
/** Night stock: kraft. Blue is the weakest channel of every colour on it. */
const NIGHT: Stock = { paper: '#231c15', wash: '#30261b', ink: '#d6c4a2', rust: '#e0895a' }

interface Point {
  x: number
  y: number
}

/** A waypoint of the run. `dir` is the way the path travels through it, `facing` the way the robot points (a swerve drive can differ);
 * both in degrees, clockwise on screen from east. `reach` and `leave` are the lengths of the spline's handles into and out of it. */
interface Anchor {
  x: number
  y: number
  dir: number
  reach: number
  leave: number
  facing: number
  piece: boolean
}

/** The run, sampled: its path string, points along it, the share of its length and of its time at which each point is reached, and which samples are the waypoints. */
interface Run {
  d: string
  points: Point[]
  along: number[]
  time: number[]
  anchorIndex: number[]
}

interface Markup {
  defs: string
  css: string
  body: string
}

// ---- the field (top view) ----
const METRE = 68
const WALL = 1552
const TOP = 372
const FLOOR = 930
/** The loading station cuts this much off the lower corner along each wall. */
const STATION = 92
const GOAL: Point = { x: 1538, y: 651 }
const ROBOT_HALF = 31

const AUTO: Anchor[] = [
  { x: 1392, y: 436, dir: 165, reach: 0, leave: 64, facing: 180, piece: false },
  { x: 1290, y: 536, dir: 88, reach: 46, leave: 38, facing: 118, piece: true },
  { x: 1402, y: 651, dir: 90, reach: 40, leave: 40, facing: 0, piece: false },
  { x: 1298, y: 756, dir: 84, reach: 38, leave: 40, facing: 110, piece: true },
  { x: 1470, y: 848, dir: 50, reach: 72, leave: 0, facing: 45, piece: false },
]

/** One clock for everything that follows the run: the pen, the waypoint dots and the dial's needle. */
const RUN_SECONDS = 92
const RUN_DRAW_SHARE = 36
const RUN_HOLD_UNTIL = 85
const RUN_GONE_AT = 90
/** The pen is most of the way down the run at the first frame. */
const RUN_TIMING = 'animation-delay:-23s'

// ---- the shot (side view) ----
const GROUND = 906
/** The ball leaves the top of the shooter's wheel. */
const LAUNCH: Point = { x: 234, y: 870 }
const TARGET: Point = { x: 390, y: 750 }
/** How high above the launch point each arc tops out. The steps grow, so the arcs open like a fan and never crowd. */
const APEXES = [123, 136, 154, 180, 216, 266, 336]

// ---- the heading dial (upper right) ----
const DIAL: Point = { x: 1470, y: 226 }
const DIAL_RADIUS = 30

function n(value: number): number {
  return Math.round(value * 10) / 10
}

function radians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function polar(centre: Point, radius: number, degrees: number): Point {
  return { x: centre.x + radius * Math.cos(radians(degrees)), y: centre.y + radius * Math.sin(radians(degrees)) }
}

function at(point: Point): string {
  return `${n(point.x)} ${n(point.y)}`
}

/** An arc about `centre`, clockwise on screen from `from` to `to` degrees. */
function arc(centre: Point, radius: number, from: number, to: number): string {
  return `M${at(polar(centre, radius, from))}A${radius} ${radius} 0 ${to - from > 180 ? 1 : 0} 1 ${at(polar(centre, radius, to))}`
}

/** Three shrinking dashes that carry a line on past its end: the drawing goes on, the sheet does not. */
function trailOff(x: number, y: number, dx: number, dy: number): string {
  let path = ''
  let reach = 0
  for (const dash of [9, 5, 2]) {
    reach += 6
    path += `M${n(x + dx * reach)} ${n(y + dy * reach)}l${n(dx * dash)} ${n(dy * dash)}`
    reach += dash
  }
  return path
}

function cubicAt(a: Point, b: Point, c: Point, d: Point, t: number): Point {
  const u = 1 - t
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  }
}

/** The run as a spline through its anchors, with a time for every sample: full speed on the straights, slower where the path bends, eased off the line and into the stop. */
function planRun(anchors: Anchor[]): Run {
  const perSegment = 48
  const first = anchors[0] ?? { x: 0, y: 0 }
  const points: Point[] = [{ x: first.x, y: first.y }]
  const anchorIndex = [0]
  let d = `M${first.x} ${first.y}`
  for (let index = 0; index < anchors.length - 1; index += 1) {
    const from = anchors[index]
    const to = anchors[index + 1]
    if (!from || !to) continue
    const out = polar(from, from.leave, from.dir)
    const back = polar(to, -to.reach, to.dir)
    d += `C${at(out)} ${at(back)} ${to.x} ${to.y}`
    for (let step = 1; step <= perSegment; step += 1) points.push(cubicAt(from, out, back, to, step / perSegment))
    anchorIndex.push(points.length - 1)
  }
  const last = points.length - 1
  const along: number[] = [0]
  for (let index = 1; index <= last; index += 1) {
    const here = points[index] ?? first
    const before = points[index - 1] ?? first
    along.push((along[index - 1] ?? 0) + Math.hypot(here.x - before.x, here.y - before.y))
  }
  const total = along[last] ?? 1
  // Speed from the bend: a turn of 120 units' radius or wider is taken flat out.
  const raw: number[] = []
  for (let index = 0; index <= last; index += 1) {
    const middle = Math.min(Math.max(index, 3), last - 3)
    const a = points[middle - 3] ?? first
    const b = points[middle] ?? first
    const c = points[middle + 3] ?? first
    let turn = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x)
    while (turn > Math.PI) turn -= Math.PI * 2
    while (turn < -Math.PI) turn += Math.PI * 2
    const span = ((along[middle + 3] ?? 0) - (along[middle - 3] ?? 0)) / 2
    const radius = span / Math.max(Math.abs(turn), 0.0001)
    const cornering = Math.min(1, Math.max(0.42, Math.sqrt(radius / 120)))
    const here = along[index] ?? 0
    const ramp = Math.min(1, 0.3 + here / 70, 0.3 + (total - here) / 70)
    raw.push(cornering * ramp)
  }
  const speed = raw.map((_, index) => {
    let sum = 0
    let count = 0
    for (let near = index - 6; near <= index + 6; near += 1) {
      const value = raw[near]
      if (value === undefined) continue
      sum += value
      count += 1
    }
    return sum / count
  })
  const time: number[] = [0]
  for (let index = 1; index <= last; index += 1) {
    const pace = ((speed[index] ?? 1) + (speed[index - 1] ?? 1)) / 2
    time.push((time[index - 1] ?? 0) + ((along[index] ?? 0) - (along[index - 1] ?? 0)) / pace)
  }
  const whole = time[last] ?? 1
  return { d, points, along: along.map(value => value / total), time: time.map(value => value / whole), anchorIndex }
}

/** Where the run is at a share (0..1) of its time: the sample index, fractional. */
function sampleAtTime(run: Run, share: number): number {
  const last = run.time.length - 1
  for (let index = 1; index <= last; index += 1) {
    const before = run.time[index - 1] ?? 0
    const after = run.time[index] ?? 1
    if (share <= after) return index - 1 + (after > before ? (share - before) / (after - before) : 0)
  }
  return last
}

function blend(values: number[], sample: number): number {
  const whole = Math.min(values.length - 2, Math.floor(sample))
  const before = values[whole] ?? 0
  const after = values[whole + 1] ?? before
  return before + (after - before) * (sample - whole)
}

/** The percent of the run's cycle at which the pen reaches waypoint `index`. */
function reachedAt(run: Run, index: number): number {
  return n((run.time[run.anchorIndex[index] ?? 0] ?? 0) * RUN_DRAW_SHARE)
}

/** Small ticks across the planned path at equal steps of time: close together in the bends, where the robot is slow. */
function timeTicks(run: Run, count: number): string {
  let path = ''
  for (let tick = 1; tick < count; tick += 1) {
    const sample = sampleAtTime(run, tick / count)
    const whole = Math.min(run.points.length - 2, Math.floor(sample))
    const before = run.points[whole]
    const after = run.points[whole + 1]
    if (!before || !after) continue
    const share = sample - whole
    const x = before.x + (after.x - before.x) * share
    const y = before.y + (after.y - before.y) * share
    const length = Math.hypot(after.x - before.x, after.y - before.y) || 1
    const acrossX = (-(after.y - before.y) / length) * 2.8
    const acrossY = ((after.x - before.x) / length) * 2.8
    path += `M${n(x - acrossX)} ${n(y - acrossY)}L${n(x + acrossX)} ${n(y + acrossY)}`
  }
  return path
}

/** A swerve-drive robot seen from above: bumpers, frame, four steered wheel modules and an arrow for its front. `wheel` is where the wheels point. */
function robot(centre: Point, facing: number, wheel: number, stock: Stock): string {
  const half = ROBOT_HALF
  const frame = half - 6
  let modules = ''
  for (const [x, y] of [[17, 17], [17, -17], [-17, 17], [-17, -17]] as const) {
    modules += `<g transform="translate(${x} ${y}) rotate(${wheel - facing})"><circle r="6.6" stroke-width=".9" stroke-opacity=".6"/><path d="M-4.6 0H4.6" stroke-width="3.2" stroke-opacity=".85"/></g>`
  }
  return (
    `<g transform="translate(${centre.x} ${centre.y}) rotate(${facing})" stroke="${stock.ink}">` +
    `<rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" rx="7" fill="${stock.paper}" stroke-width="1.3" stroke-opacity=".9"/>` +
    `<rect x="${-frame}" y="${-frame}" width="${frame * 2}" height="${frame * 2}" rx="1.5" stroke-width=".9" stroke-opacity=".55"/>` +
    modules +
    `<path d="M-4 -4.4L4.6 0L-4 4.4Z" fill="${stock.ink}" fill-opacity=".7" stroke="none"/>` +
    `</g>`
  )
}

/** Where the robot will stand at the end of the run: a dashed outline and its front mark, nothing more. */
function ghost(centre: Point, facing: number, stock: Stock): string {
  const half = ROBOT_HALF
  return (
    `<g transform="translate(${centre.x} ${centre.y}) rotate(${facing})" stroke="${stock.ink}" stroke-opacity=".5">` +
    `<rect x="${-half}" y="${-half}" width="${half * 2}" height="${half * 2}" rx="7" stroke-width="1" stroke-dasharray="5 4.4" stroke-linecap="butt"/>` +
    `<path d="M${half - 13} -5L${half - 6} 0L${half - 13} 5" stroke-width="1"/>` +
    `</g>`
  )
}

/** A dot at every whole metre of the field, like the grid of a squared sheet. Left out where something stands, and fainter toward the reading column. */
function gridDots(stock: Stock): string {
  let dots = ''
  for (let column = 1; column <= 4; column += 1) {
    let path = ''
    for (let row = 1; row <= 8; row += 1) {
      const x = WALL - column * METRE
      const y = FLOOR - row * METRE
      // Row 4 would run a few units under the centre line.
      if (row === 4) continue
      if (x + y > WALL + FLOOR - STATION - 14) continue
      if (AUTO.some((anchor, index) => Math.hypot(anchor.x - x, anchor.y - y) < (index === 0 || index === AUTO.length - 1 ? 56 : 20))) continue
      path += `M${x} ${y}h0`
    }
    dots += `<path d="${path}" stroke-opacity="${n(0.52 - column * 0.07)}"/>`
  }
  return `<g stroke="${stock.ink}" stroke-width="1.7">${dots}</g>`
}

/** The end of the field that does not move: walls, the metre scale outside the end wall, the goal, its centre line and range rings, the station's ground. */
function field(stock: Stock): string {
  const cornerY = FLOOR - STATION
  const cornerX = WALL - STATION
  const wall = `M1372 ${TOP}H${WALL}V${cornerY}L${cornerX} ${FLOOR}H1426`
  const ends = trailOff(1372, TOP, -1, 0) + trailOff(1426, FLOOR, -1, 0)
  let ticks = ''
  let numerals = ''
  for (let half = 0; half <= 16; half += 1) {
    const y = FLOOR - (half * METRE) / 2
    ticks += `M${WALL} ${y}h${half % 2 === 0 ? 8 : 4.5}`
    if (half % 4 === 0) numerals += `<text x="${WALL + 13}" y="${y + 3.2}">${half / 2}</text>`
  }
  const goal = `M${WALL} ${GOAL.y - 44}L${WALL - 28} ${GOAL.y - 24}V${GOAL.y + 24}L${WALL} ${GOAL.y + 44}`
  const centreLine = `M${WALL - 36} ${GOAL.y}H1262`
  const rings = arc(GOAL, 2 * METRE, 100, 260) + arc(GOAL, 3 * METRE, 128, 232)
  const ringMarks = `M${GOAL.x - 3 * METRE} ${GOAL.y - 4}v8`
  return (
    `<path d="M${WALL} ${cornerY}V${FLOOR}H${cornerX}Z" fill="${stock.wash}" fill-opacity=".6"/>` +
    gridDots(stock) +
    `<g stroke="${stock.ink}">` +
    `<path d="${centreLine}" stroke-width=".9" stroke-opacity=".36" stroke-dasharray="22 4 3 4" stroke-linecap="butt"/>` +
    `<path d="${rings}" stroke-width="1" stroke-opacity=".42"/>` +
    `<path d="${ringMarks}" stroke-width="1" stroke-opacity=".5"/>` +
    `<path d="M${WALL} ${cornerY}V${FLOOR}H${cornerX}" stroke-width=".9" stroke-opacity=".45"/>` +
    `<path d="${wall}" stroke-width="1.3" stroke-opacity=".88"/>` +
    `<path d="${ends}" stroke-width="1.3" stroke-opacity=".6"/>` +
    `<path d="${ticks}" stroke-width="1" stroke-opacity=".6"/>` +
    `<path d="${goal}" stroke-width="1.3" stroke-opacity=".88"/>` +
    `<circle cx="${GOAL.x}" cy="${GOAL.y}" r="8" stroke-width="1" stroke-opacity=".7"/>` +
    `</g>` +
    `<circle cx="${GOAL.x}" cy="${GOAL.y}" r="1.6" fill="${stock.ink}" fill-opacity=".8"/>` +
    `<g fill="${stock.ink}" fill-opacity=".55" font-size="9">${numerals}` +
    `<text x="${GOAL.x - 3 * METRE - 6}" y="${GOAL.y - 7}" text-anchor="end">3 m</text>` +
    `<text x="${GOAL.x - 2 * METRE + 9}" y="${GOAL.y - 9}">2 m</text>` +
    `</g>`
  )
}

/** Hatch strokes across the loading station, square to its face, in the order a pen would take them: out along one, back along the next. */
function stationHatch(): string[] {
  const paths: string[] = []
  const face = Math.SQRT2 * STATION
  let stroke = 0
  for (let along = 7; along < face - 4; along += 8.6) {
    const x = WALL - STATION + along * Math.SQRT1_2
    const y = FLOOR - along * Math.SQRT1_2
    const depth = Math.min(along, face - along) * Math.SQRT1_2 - 1.5
    if (depth < 4) continue
    paths.push(stroke % 2 === 0 ? `M${n(x)} ${n(y)}l${n(depth)} ${n(depth)}` : `M${n(x + depth)} ${n(y + depth)}l${n(-depth)} ${n(-depth)}`)
    stroke += 1
  }
  return paths
}

/** The station: its face in a firm rust line, and the hatching redrawn stroke by stroke on a slow cycle. */
function station(stock: Stock): Markup {
  const paths = stationHatch()
  const cycle = 84
  const step = cycle / paths.length
  const drawn = n(100 / paths.length)
  let defs = ''
  let strokes = ''
  let heads = ''
  paths.forEach((path, line) => {
    const phase = (((31 - line * step) % cycle) + cycle) % cycle
    const timing = `style="animation-delay:${n(-phase)}s"`
    defs += `<path id="h${line}" pathLength="1" d="${path}"/>`
    strokes += `<use href="#h${line}" class="ink" ${timing}/>`
    heads += `<use href="#h${line}" class="pen" ${timing}/>`
  })
  const rest = 100 - 5 - drawn
  const css = `
.h .ink{animation:h-ink ${cycle}s linear infinite}.h .pen{stroke-width:5.5;animation:h-pen ${cycle}s linear infinite}
@keyframes h-ink{0%{stroke-dashoffset:1.01;opacity:1}${drawn}%{stroke-dashoffset:0;opacity:1}${n(drawn * 2.5)}%{stroke-dashoffset:0;opacity:.8}${n(rest)}%{stroke-dashoffset:0;opacity:.8}${n(rest + drawn)}%{stroke-dashoffset:-1.01}100%{stroke-dashoffset:-1.01;opacity:.8}}
@keyframes h-pen{0%{stroke-dashoffset:0;opacity:1}${drawn}%{stroke-dashoffset:-1;opacity:1}${n(drawn + 0.01)}%{stroke-dashoffset:-1;opacity:0}100%{stroke-dashoffset:-1;opacity:0}}`
  const body =
    `<g class="h" stroke="${stock.rust}" stroke-width="1" stroke-opacity=".8">${strokes}${heads}</g>` +
    `<path d="M${WALL - STATION} ${FLOOR}L${WALL} ${FLOOR - STATION}" stroke="${stock.rust}" stroke-width="1.4" stroke-opacity=".95"/>`
  return { defs, css, body }
}

/** The autonomous run: the plan in hairline ink with its time ticks, the waypoints, and the rust pen that drives it. */
function autoRun(stock: Stock, run: Run): Markup {
  const stops = 30
  let ink = ''
  let pen = ''
  for (let stop = 0; stop <= stops; stop += 1) {
    const along = blend(run.along, sampleAtTime(run, stop / stops))
    const percent = n((stop / stops) * RUN_DRAW_SHARE)
    ink += `${percent}%{stroke-dashoffset:${stop === 0 ? 1.01 : (1 - along).toFixed(4)};opacity:1}`
    pen += `${percent}%{stroke-dashoffset:${(-along).toFixed(4)};opacity:1}`
  }
  ink += `${RUN_HOLD_UNTIL}%{stroke-dashoffset:0;opacity:1}${RUN_GONE_AT}%{stroke-dashoffset:0;opacity:0}${RUN_GONE_AT + 0.1}%{stroke-dashoffset:1.01;opacity:0}100%{stroke-dashoffset:1.01;opacity:1}`
  pen += `${RUN_DRAW_SHARE + 0.6}%{stroke-dashoffset:-1;opacity:1}${RUN_DRAW_SHARE + 1.6}%{stroke-dashoffset:-1;opacity:0}100%{stroke-dashoffset:-1;opacity:0}`
  let css = `
.a .ink{stroke-width:1.5;animation:a-ink ${RUN_SECONDS}s linear infinite;${RUN_TIMING}}.a .pen{stroke-width:7;animation:a-pen ${RUN_SECONDS}s linear infinite;${RUN_TIMING}}
@keyframes a-ink{${ink}}
@keyframes a-pen{${pen}}`
  let marks = ''
  let dots = ''
  const lastIndex = AUTO.length - 1
  AUTO.forEach((anchor, index) => {
    if (index === 0) return
    const reached = reachedAt(run, index)
    if (anchor.piece) marks += `<circle cx="${anchor.x}" cy="${anchor.y}" r="10.5" stroke-width=".9" stroke-opacity=".4" stroke-dasharray="2.2 3.3"/>`
    // The facing tick stands clear of the ring, like the lubber mark of a compass. The last waypoint's facing is the ghost's.
    if (index !== lastIndex) marks += `<path d="M${at(polar(anchor, 8.6, anchor.facing))}L${at(polar(anchor, 17.5, anchor.facing))}" stroke-width="1.1" stroke-opacity=".8"/>`
    marks += `<circle cx="${anchor.x}" cy="${anchor.y}" r="4.8" fill="${stock.paper}" stroke-width="1.1" stroke-opacity=".85"/>`
    dots += `<circle cx="${anchor.x}" cy="${anchor.y}" r="2.1" style="animation:dot${index} ${RUN_SECONDS}s linear infinite;${RUN_TIMING}"/>`
    css += `
@keyframes dot${index}{0%{opacity:0}${reached}%{opacity:0}${n(reached + 0.4)}%{opacity:1}${RUN_HOLD_UNTIL}%{opacity:1}${RUN_GONE_AT}%{opacity:0}100%{opacity:0}}`
  })
  const start = AUTO[0] ?? { x: 0, y: 0, dir: 0, facing: 0 }
  const end = AUTO[lastIndex] ?? { x: 0, y: 0, facing: 0 }
  const defs = `<path id="run" pathLength="1" d="${run.d}"/>`
  const body =
    `<use href="#run" stroke="${stock.ink}" stroke-width=".8" stroke-opacity=".36"/>` +
    `<path d="${timeTicks(run, 40)}" stroke="${stock.ink}" stroke-width=".9" stroke-opacity=".42"/>` +
    ghost(end, end.facing, stock) +
    `<g class="a" stroke="${stock.rust}"><use href="#run" class="ink"/><use href="#run" class="pen"/></g>` +
    `<g stroke="${stock.ink}">${marks}</g>` +
    `<g fill="${stock.rust}">${dots}</g>` +
    robot(start, start.facing, start.dir, stock) +
    `<text x="${start.x}" y="${start.y - ROBOT_HALF - 9}" text-anchor="middle" font-size="12" letter-spacing="2" fill="${stock.rust}">8810</text>` +
    `<text x="${WALL - 10}" y="${TOP + 18}" text-anchor="end" font-size="9.5" letter-spacing="1.2" fill="${stock.ink}" fill-opacity=".6">AUTO 1</text>`
  return { defs, css, body }
}

/** The heading dial: a graduated ring, and a rust needle that turns to each waypoint's facing as the pen reaches it. */
function dial(stock: Stock, run: Run): Markup {
  let ticks = ''
  for (let degrees = 0; degrees < 360; degrees += 15) {
    const inner = DIAL_RADIUS - (degrees % 90 === 0 ? 8 : degrees % 45 === 0 ? 5.5 : 3.2)
    ticks += `M${at(polar(DIAL, inner, degrees))}L${at(polar(DIAL, DIAL_RADIUS, degrees))}`
  }
  let frames = ''
  AUTO.forEach((anchor, index) => {
    frames += `${reachedAt(run, index)}%{transform:rotate(${anchor.facing}deg);animation-timing-function:ease-in-out}`
  })
  const start = AUTO[0]?.facing ?? 0
  const end = AUTO[AUTO.length - 1]?.facing ?? 0
  frames += `${RUN_GONE_AT}%{transform:rotate(${end}deg);animation-timing-function:ease-in-out}100%{transform:rotate(${start}deg)}`
  const css = `
.needle{transform-origin:${DIAL.x}px ${DIAL.y}px;transform:rotate(${end}deg);animation:needle ${RUN_SECONDS}s linear infinite;${RUN_TIMING}}
@keyframes needle{${frames}}`
  const needle = `M${DIAL.x - 9} ${DIAL.y}H${DIAL.x + 20}M${DIAL.x + 14} ${DIAL.y - 3.6}L${DIAL.x + 20.6} ${DIAL.y}L${DIAL.x + 14} ${DIAL.y + 3.6}`
  const body =
    `<g stroke="${stock.ink}">` +
    `<circle cx="${DIAL.x}" cy="${DIAL.y}" r="${DIAL_RADIUS}" stroke-width="1" stroke-opacity=".6"/>` +
    `<path d="${ticks}" stroke-width=".9" stroke-opacity=".55"/>` +
    `</g>` +
    `<path class="needle" d="${needle}" stroke="${stock.rust}" stroke-width="1.4"/>` +
    `<circle cx="${DIAL.x}" cy="${DIAL.y}" r="2.4" fill="${stock.paper}" stroke="${stock.ink}" stroke-width="1" stroke-opacity=".85"/>` +
    `<g fill="${stock.ink}" fill-opacity=".55" font-size="9">` +
    `<text x="${DIAL.x + DIAL_RADIUS + 7}" y="${DIAL.y + 3.2}">0</text>` +
    `<text x="${DIAL.x}" y="${DIAL.y - DIAL_RADIUS - 7}" text-anchor="middle">90</text>` +
    `</g>`
  return { defs: '', css, body }
}

/** The shot from the side: ground with a metre scale, the robot and its shooter wheel, a protractor at the launch point, the goal on its post, and the family of arcs with the ball that flies them. */
function shot(stock: Stock): Markup {
  const reach = TARGET.x - LAUNCH.x
  const rise = LAUNCH.y - TARGET.y
  const cycle = 84
  const step = cycle / APEXES.length
  const drawShare = 9.2
  let defs = ''
  let css = ''
  let strokes = ''
  let balls = ''
  const angles: number[] = []
  APEXES.forEach((apex, line) => {
    // The launch slope whose arc tops out `apex` above the launch point and still comes down through the goal.
    const slope = (2 * (apex + Math.sqrt(apex * apex - apex * rise))) / reach
    angles.push(Math.round((Math.atan(slope) * 180) / Math.PI))
    const drop = (reach * slope - rise) / (reach * reach)
    // A parabola is exactly one quadratic curve, and its parameter is time: the ball crosses the ground at a steady rate.
    const control = { x: LAUNCH.x + reach / 2, y: LAUNCH.y - (slope * reach) / 2 }
    defs += `<path id="s${line}" pathLength="1" d="M${at(LAUNCH)}Q${at(control)} ${at(TARGET)}"/>`
    const lengths: number[] = [0]
    let before = LAUNCH
    for (let sample = 1; sample <= 100; sample += 1) {
      const x = (reach * sample) / 100
      const here = { x: LAUNCH.x + x, y: LAUNCH.y - (slope * x - drop * x * x) }
      lengths.push((lengths[sample - 1] ?? 0) + Math.hypot(here.x - before.x, here.y - before.y))
      before = here
    }
    const whole = lengths[100] ?? 1
    let ink = ''
    let ball = ''
    for (let stop = 0; stop <= 10; stop += 1) {
      const along = (lengths[stop * 10] ?? 0) / whole
      const percent = n((stop / 10) * drawShare)
      ink += `${percent}%{stroke-dashoffset:${stop === 0 ? 1.01 : (1 - along).toFixed(4)};opacity:1}`
      ball += `${percent}%{stroke-dashoffset:${(-along).toFixed(4)};opacity:1}`
    }
    ink += `${n(drawShare * 2.4)}%{stroke-dashoffset:0;opacity:.76}83%{stroke-dashoffset:0;opacity:.76}88%{stroke-dashoffset:0;opacity:0}88.1%{stroke-dashoffset:1.01;opacity:0}100%{stroke-dashoffset:1.01;opacity:1}`
    ball += `${n(drawShare + 0.01)}%{stroke-dashoffset:-1;opacity:0}100%{stroke-dashoffset:-1;opacity:0}`
    css += `
@keyframes s-ink${line}{${ink}}
@keyframes s-ball${line}{${ball}}`
    // Arc 3 is in flight at the first frame; the others follow one step apart.
    const phase = (((2.5 - (line - 3) * step) % cycle) + cycle) % cycle
    const opacity = n(1 - 0.065 * line)
    strokes += `<use href="#s${line}" class="ink" stroke-opacity="${opacity}" style="animation:s-ink${line} ${cycle}s linear infinite;animation-delay:${n(-phase)}s"/>`
    balls += `<use href="#s${line}" class="pen" style="animation:s-ball${line} ${cycle}s linear infinite;animation-delay:${n(-phase)}s"/>`
  })

  let scale = ''
  let numerals = ''
  for (let half = 0; half <= 4; half += 1) {
    const x = LAUNCH.x + (half * METRE) / 2
    scale += `M${x} ${GROUND}v${half % 2 === 0 ? 7 : 4}`
    if (half % 2 === 0) numerals += `<text x="${x}" y="${GROUND + 19}" text-anchor="middle">${half / 2}</text>`
  }
  for (let half = 1; half <= 4; half += 1) {
    const y = GROUND - (half * METRE) / 2
    scale += `M${TARGET.x} ${y}h${half % 2 === 0 ? 6 : 3.5}`
    if (half % 2 === 0) numerals += `<text x="${TARGET.x + 10}" y="${y + 3.2}">${half / 2}</text>`
  }
  let protractor = arc(LAUNCH, 38, 270, 360) + `M${LAUNCH.x} ${LAUNCH.y}h46`
  for (let degrees = 10; degrees <= 80; degrees += 10) {
    protractor += `M${at(polar(LAUNCH, degrees % 30 === 0 ? 32 : 35, -degrees))}L${at(polar(LAUNCH, 38, -degrees))}`
  }
  // The robot from the side: wheels under a bumper, two struts, and the shooter wheel under its hood.
  const wheel: Point = { x: LAUNCH.x, y: LAUNCH.y + 7 }
  const left = LAUNCH.x - 30
  const machine =
    `<circle cx="${left + 12}" cy="${GROUND - 4.6}" r="4.6" stroke-width="1" stroke-opacity=".8"/><circle cx="${left + 50}" cy="${GROUND - 4.6}" r="4.6" stroke-width="1" stroke-opacity=".8"/>` +
    `<rect x="${left}" y="${GROUND - 17}" width="62" height="11" rx="3" fill="${stock.paper}" stroke-width="1.3" stroke-opacity=".9"/>` +
    `<path d="M${left + 8} ${GROUND - 17}L${wheel.x - 9} ${wheel.y + 2}M${left + 52} ${GROUND - 17}L${wheel.x + 7} ${wheel.y + 4}" stroke-width=".9" stroke-opacity=".6"/>` +
    `<circle cx="${wheel.x}" cy="${wheel.y}" r="7" fill="${stock.paper}" stroke-width="1.1" stroke-opacity=".85"/>` +
    `<path d="${arc(wheel, 11, 150, 258)}" stroke-width="1.1" stroke-opacity=".7"/>`
  const cup = `M${TARGET.x - 13} ${TARGET.y - 9}L${TARGET.x - 7} ${TARGET.y + 3}H${TARGET.x + 7}L${TARGET.x + 13} ${TARGET.y - 9}`
  const labelLow = polar(LAUNCH, 52, -44)
  const body =
    `<g stroke="${stock.ink}">` +
    `<path d="M204 ${GROUND}H406" stroke-width="1.3" stroke-opacity=".85"/>` +
    `<path d="${trailOff(204, GROUND, -1, 0)}" stroke-width="1.3" stroke-opacity=".55"/>` +
    `<path d="${scale}" stroke-width="1" stroke-opacity=".6"/>` +
    `<path d="M${LAUNCH.x} ${LAUNCH.y}v-50" stroke-width=".9" stroke-opacity=".4"/>` +
    `<path d="${protractor}" stroke-width=".9" stroke-opacity=".5"/>` +
    `<path d="M${TARGET.x} ${TARGET.y + 3}V${GROUND}" stroke-width=".9" stroke-opacity=".5"/>` +
    `</g>` +
    `<g class="s" stroke="${stock.ink}" stroke-width="1.15">${strokes}</g>` +
    `<g class="s" stroke="${stock.rust}" stroke-width="7">${balls}</g>` +
    `<g stroke="${stock.ink}">${machine}</g>` +
    `<path d="${cup}" stroke="${stock.rust}" stroke-width="1.4"/>` +
    `<g fill="${stock.ink}" fill-opacity=".55" font-size="9">${numerals}` +
    `<text x="${n(labelLow.x)}" y="${n(labelLow.y)}">${angles[0] ?? 0}°</text>` +
    `<text x="${LAUNCH.x - 6}" y="${LAUNCH.y - 56}" text-anchor="end">${angles[angles.length - 1] ?? 0}°</text>` +
    `</g>`
  return { defs, css, body }
}

/** The whole sheet on one stock. */
function sheet(stock: Stock): string {
  const run = planRun(AUTO)
  const parts = [station(stock), autoRun(stock, run), dial(stock, run), shot(stock)]
  const style = `
.ink{stroke-dasharray:1 2}
.pen{stroke-dasharray:.0001 3;stroke-opacity:1;opacity:0}${parts.map(part => part.css).join('')}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><style>${style}</style><defs>${parts.map(part => part.defs).join('')}</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="${stock.paper}"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round" font-family="ui-monospace,Menlo,monospace">
${field(stock)}
${parts.map(part => part.body).join('\n')}
</g>
</svg>`
}

/** Strategy Sheet on warm paper, for a light window. */
export function daySvg(): string {
  return sheet(DAY)
}

/** Strategy Sheet on kraft, for a dark window. */
export function nightSvg(): string {
  return sheet(NIGHT)
}
